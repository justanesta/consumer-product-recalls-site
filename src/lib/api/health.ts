import { client } from './client';

/** `GET /health/db` readiness probe — true when Neon is reachable. Use to pre-warm. */
export async function pingDb(signal?: AbortSignal): Promise<boolean> {
  try {
    const { response } = await client.GET('/health/db', { signal });
    return response.ok;
  } catch {
    return false;
  }
}

/** `GET /health` liveness probe (no DB). */
export async function ping(signal?: AbortSignal): Promise<boolean> {
  try {
    const { response } = await client.GET('/health', { signal });
    return response.ok;
  } catch {
    return false;
  }
}
