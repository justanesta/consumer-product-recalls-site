import type { components, paths } from './schema';
import { client, unwrap } from './client';

export type ProductSearchHit = components['schemas']['ProductSearchHit'];
export type PageProductSearchHit = components['schemas']['Page_ProductSearchHit_'];
export type ProductSearchQuery = NonNullable<
  paths['/products/search']['get']['parameters']['query']
>;

/**
 * `GET /products/search` — at least one of `q` / `hin` / `model` / `upc` is required.
 * `q` = full-text; `hin`/`model` = exact btree; `upc` = recall-level containment.
 */
export function searchProducts(query: ProductSearchQuery, signal?: AbortSignal) {
  return unwrap(client.GET('/products/search', { params: { query }, signal }));
}
