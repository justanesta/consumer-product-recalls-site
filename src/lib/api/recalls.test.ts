import { afterEach, describe, expect, it, vi } from 'vitest';
import { getRecall, listRecalls } from './recalls';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function requestedUrl(input: unknown): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.href;
  if (input instanceof Request) return input.url;
  return String(input);
}

afterEach(() => vi.unstubAllGlobals());

describe('listRecalls', () => {
  it('serializes multi-value filters comma-separated and returns the page', async () => {
    const page = { items: [], next_cursor: null, limit: 25, total: null };
    const fetchMock = vi.fn(async (_req: Request) => jsonResponse(page));
    vi.stubGlobal('fetch', fetchMock);

    const result = await listRecalls({ source: ['CPSC', 'FDA'], is_active: true, limit: 25 });

    expect(result).toEqual(page);
    const url = decodeURIComponent(requestedUrl(fetchMock.mock.calls[0]?.[0]));
    expect(url).toContain('/recalls?');
    expect(url).toContain('source=CPSC,FDA');
    expect(url).toContain('is_active=true');
  });
});

describe('getRecall', () => {
  it('interpolates the path and returns the detail', async () => {
    const detail = {
      recall_event_id: 'x',
      source: 'CPSC',
      source_recall_id: '24-001',
      published_at: '2026-01-01T00:00:00Z',
    };
    const fetchMock = vi.fn(async (_req: Request) => jsonResponse(detail));
    vi.stubGlobal('fetch', fetchMock);

    const result = await getRecall('CPSC', '24-001');

    expect(result.source_recall_id).toBe('24-001');
    expect(requestedUrl(fetchMock.mock.calls[0]?.[0])).toContain('/recalls/CPSC/24-001');
  });
});
