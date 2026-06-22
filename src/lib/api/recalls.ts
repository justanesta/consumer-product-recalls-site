import type { components, paths } from './schema';
import { client, unwrap } from './client';

export type Source = components['schemas']['Source'];
export type RecallSummary = components['schemas']['RecallSummary'];
export type RecallSearchHit = components['schemas']['RecallSearchHit'];
export type RecallDetail = components['schemas']['RecallDetail'];
export type FirmRef = components['schemas']['FirmRef'];
export type DistributionScope = components['schemas']['DistributionScope'];
export type PageRecallSummary = components['schemas']['Page_RecallSummary_'];
export type PageRecallSearchHit = components['schemas']['Page_RecallSearchHit_'];

export type RecallListQuery = NonNullable<paths['/recalls']['get']['parameters']['query']>;
export type RecallSearchQuery = NonNullable<paths['/recalls/search']['get']['parameters']['query']>;

/** `GET /recalls` — newest-first by announce date (`event_date`), keyset-paginated. All filters optional. */
export function listRecalls(query: RecallListQuery = {}, signal?: AbortSignal) {
  return unwrap(client.GET('/recalls', { params: { query }, signal }));
}

/** `GET /recalls/search` — keyword search (requires `q`); returns summaries + `rank`. */
export function searchRecalls(query: RecallSearchQuery, signal?: AbortSignal) {
  return unwrap(client.GET('/recalls/search', { params: { query }, signal }));
}

/** `GET /recalls/{source}/{recall_id}` — one full recall. `source` is case-insensitive. */
export function getRecall(source: string, recallId: string, signal?: AbortSignal) {
  return unwrap(
    client.GET('/recalls/{source}/{recall_id}', {
      params: { path: { source: source as Source, recall_id: recallId } },
      signal,
    }),
  );
}
