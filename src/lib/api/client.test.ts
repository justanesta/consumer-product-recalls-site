import { describe, expect, it, vi } from 'vitest';
import { ApiError, unwrap, withRetry } from './client';

function res(status: number, headers: Record<string, string> = {}): Response {
  return new Response(null, { status, headers });
}

describe('ApiError.fromResponse', () => {
  it('parses the error envelope and Retry-After', () => {
    const body = { error: { type: 'upstream_unavailable', detail: 'cold', request_id: 'abc' } };
    const err = ApiError.fromResponse(res(503, { 'retry-after': '5' }), body);
    expect(err.status).toBe(503);
    expect(err.type).toBe('upstream_unavailable');
    expect(err.detail).toBe('cold');
    expect(err.requestId).toBe('abc');
    expect(err.retryAfter).toBe(5);
    expect(err.isColdStart).toBe(true);
    expect(err.isRetryable).toBe(true);
  });

  it('flags a bad_cursor 400', () => {
    const err = ApiError.fromResponse(res(400), { error: { type: 'bad_cursor' } });
    expect(err.isBadCursor).toBe(true);
    expect(err.isRetryable).toBe(false);
  });

  it('falls back to the X-Request-ID header', () => {
    const err = ApiError.fromResponse(res(404, { 'x-request-id': 'hdr-id' }), {});
    expect(err.isNotFound).toBe(true);
    expect(err.requestId).toBe('hdr-id');
  });
});

describe('unwrap', () => {
  it('returns data on a 2xx', async () => {
    await expect(unwrap(Promise.resolve({ data: { ok: 1 }, response: res(200) }))).resolves.toEqual(
      { ok: 1 },
    );
  });

  it('throws ApiError on a non-2xx', async () => {
    const failing = unwrap(
      Promise.resolve({ error: { error: { type: 'not_found' } }, response: res(404) }),
    );
    await expect(failing).rejects.toBeInstanceOf(ApiError);
    await expect(failing).rejects.toMatchObject({ status: 404, type: 'not_found' });
  });
});

describe('withRetry', () => {
  it('retries retryable errors then succeeds', async () => {
    const sleep = vi.fn(async () => {});
    let calls = 0;
    const fn = vi.fn(async () => {
      if (calls++ < 2) throw new ApiError({ status: 503 });
      return 'ok';
    });
    await expect(withRetry(fn, { sleep })).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenCalledTimes(2);
  });

  it('honors Retry-After for the backoff delay', async () => {
    const sleep = vi.fn(async () => {});
    let first = true;
    const fn = vi.fn(async () => {
      if (first) {
        first = false;
        throw new ApiError({ status: 429, retryAfter: 7 });
      }
      return 'ok';
    });
    await withRetry(fn, { sleep });
    expect(sleep).toHaveBeenCalledWith(7000);
  });

  it('does not retry non-retryable errors', async () => {
    const fn = vi.fn(async () => {
      throw new ApiError({ status: 404 });
    });
    await expect(withRetry(fn, { sleep: async () => {} })).rejects.toMatchObject({ status: 404 });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('gives up after exhausting the retry budget', async () => {
    const fn = vi.fn(async () => {
      throw new ApiError({ status: 503 });
    });
    await expect(withRetry(fn, { retries: 2, sleep: async () => {} })).rejects.toBeInstanceOf(
      ApiError,
    );
    expect(fn).toHaveBeenCalledTimes(3);
  });
});
