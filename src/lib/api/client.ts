import createClient from 'openapi-fetch';
import type { paths } from './schema';

const DEFAULT_BASE_URL = 'https://consumer-product-recalls-api.fly.dev';

/** API base URL (no trailing slash). From PUBLIC_API_URL, with a sane default. */
export const API_BASE_URL = (import.meta.env.PUBLIC_API_URL ?? DEFAULT_BASE_URL).replace(
  /\/+$/,
  '',
);

/**
 * The typed openapi-fetch client.
 *
 * - Arrays are serialized comma-separated (`?source=CPSC,FDA`) — the API accepts
 *   comma or repeat; comma keeps shareable URLs tidy.
 * - `fetch` indirects through `globalThis.fetch` at call time so SSR/build/browser
 *   all use the live global (and tests can stub it).
 */
export const client = createClient<paths>({
  baseUrl: API_BASE_URL,
  querySerializer: { array: { style: 'form', explode: false } },
  fetch: (request) => globalThis.fetch(request),
});

/** The API's JSON error envelope: `{ error: { type, detail, request_id } }`. */
interface ErrorEnvelope {
  error?: { type?: string; detail?: unknown; request_id?: string };
}

export interface ApiErrorInit {
  status: number;
  type?: string;
  detail?: unknown;
  requestId?: string;
  retryAfter?: number;
  message?: string;
}

/** A typed API failure carrying the envelope + the operational signals the UI needs. */
export class ApiError extends Error {
  readonly status: number;
  readonly type: string;
  readonly detail: unknown;
  readonly requestId?: string;
  /** Seconds from a `Retry-After` header, when present. */
  readonly retryAfter?: number;

  constructor(init: ApiErrorInit) {
    super(init.message ?? `API ${init.status}${init.type ? ` (${init.type})` : ''}`);
    this.name = 'ApiError';
    this.status = init.status;
    this.type = init.type ?? 'error';
    this.detail = init.detail;
    this.requestId = init.requestId;
    this.retryAfter = init.retryAfter;
  }

  /** 503: Fly machine / Neon cold-start. Transient — retry with backoff. */
  get isColdStart(): boolean {
    return this.status === 503;
  }
  /** 429: per-IP rate limit. Transient — back off using `retryAfter`. */
  get isRateLimited(): boolean {
    return this.status === 429;
  }
  /** 400 bad_cursor: a stale/cross-path keyset cursor — reset to page 1. */
  get isBadCursor(): boolean {
    return this.status === 400 && this.type === 'bad_cursor';
  }
  get isNotFound(): boolean {
    return this.status === 404;
  }
  /** Worth retrying (cold start or rate limit). */
  get isRetryable(): boolean {
    return this.isColdStart || this.isRateLimited;
  }

  static fromResponse(response: Response, body: unknown): ApiError {
    const env = (body ?? {}) as ErrorEnvelope;
    const retryAfterRaw = response.headers.get('retry-after');
    const retryAfter = retryAfterRaw != null ? Number(retryAfterRaw) : undefined;
    return new ApiError({
      status: response.status,
      type: env.error?.type,
      detail: env.error?.detail,
      requestId: env.error?.request_id ?? response.headers.get('x-request-id') ?? undefined,
      retryAfter: retryAfter != null && Number.isFinite(retryAfter) ? retryAfter : undefined,
    });
  }
}

/** Shape of an openapi-fetch result (loosened so the discriminated union is assignable). */
type FetchResult<T> = { data?: T; error?: unknown; response: Response };

/** Resolve an openapi-fetch call to its data, or throw a typed {@link ApiError}. */
export async function unwrap<T>(call: Promise<FetchResult<T>>): Promise<T> {
  const { data, error, response } = await call;
  if (!response.ok || data === undefined) {
    throw ApiError.fromResponse(response, error);
  }
  return data;
}

export interface RetryOptions {
  /** Max retries after the first attempt (default 4). */
  retries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  onRetry?: (attempt: number, error: unknown) => void;
  /** Injectable for tests. */
  sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * A connection-level failure with no HTTP response (DNS, reset, timeout) — `fetch`
 * throws a TypeError here, below the ApiError layer. Transient; worth retrying.
 */
function isTransientNetworkError(error: unknown): boolean {
  if (error instanceof ApiError) return error.isRetryable;
  if (error instanceof TypeError) return true; // fetch() network failure
  const holder = error as { code?: unknown; cause?: { code?: unknown } };
  const code = holder?.cause?.code ?? holder?.code;
  return (
    typeof code === 'string' &&
    /ECONNRESET|ETIMEDOUT|ECONNREFUSED|EAI_AGAIN|ENOTFOUND|UND_ERR/.test(code)
  );
}

/**
 * Retry a call on transient failures — 503 cold-start, 429 rate-limit, or a dropped
 * connection — with exponential backoff, honoring `Retry-After`. Other errors throw at once.
 * Used for build-time pulls — it retries hard, then fails loudly (never ships blanks).
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const {
    retries = 4,
    baseDelayMs = 500,
    maxDelayMs = 8000,
    onRetry,
    sleep = defaultSleep,
  } = options;
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === retries || !isTransientNetworkError(error)) {
        throw error;
      }
      const retryAfterMs =
        error instanceof ApiError && error.retryAfter ? error.retryAfter * 1000 : null;
      const backoff = Math.min(baseDelayMs * 2 ** attempt, maxDelayMs);
      onRetry?.(attempt + 1, error);
      await sleep(retryAfterMs ?? backoff);
    }
  }
  throw lastError;
}

/**
 * Run thunks with at most `limit` in flight at once. Avoids a burst of
 * simultaneous TCP connects (which can time out against a cold free-tier host)
 * during build-time pulls, while preserving result order.
 */
export async function withConcurrency<R>(thunks: Array<() => Promise<R>>, limit = 4): Promise<R[]> {
  const results = new Array<R>(thunks.length);
  let next = 0;
  async function worker(): Promise<void> {
    while (next < thunks.length) {
      const index = next;
      next += 1;
      results[index] = await thunks[index]();
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, thunks.length) }, () => worker()));
  return results;
}
