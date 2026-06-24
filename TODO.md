# TODO

Cross-repo set added 2026-06-23 — recall-detail enrichment + source-id lookup. Companions:
pipeline `consumer-product-recalls` (TODO "Recall-detail enrichment & source-id lookup") and API
`consumer-product-recalls-api` (TODO `## Features` → "Surface recall-detail enrichment fields …").
These complete **in tandem, mart-first**: pipeline mart → API field → site (`gen:api` + render). The
site work below is **blocked on the API exposing the fields first**.

## Recall detail enrichment — render `images` / `injuries` / `press_release_url`

- [ ] Once the API exposes the fields, run `npm run gen:api` to pull them into
  `src/lib/api/schema.d.ts`, then render them in `src/components/recalls/RecallDetail.tsx`,
  **source-gated** like the existing CPSC-only `hazards`/`product_upcs` and NHTSA-only
  `corrective_action`/`consequence_of_defect` blocks:
  - **`images` (CPSC):** a product-image gallery/thumbnails section. Mind the jsonb shape (likely
    `[{url, ...}]`); add real `alt` text (WCAG 2.1 AA), lazy-load (`loading="lazy"`), and a graceful
    empty/broken-image state.
  - **`injuries` (CPSC):** render the jsonb as a small "Reported injuries" list/section.
  - **`press_release_url` (FDA):** an "Official notice / press release" link. FDA recalls currently
    have a null `url`, so this is the **first external link** FDA detail pages get. If the API returns
    an array, list each release (with type/date if present).
- Keep the page's `noindex` + sitemap-exclusion behavior unchanged — these are detail-page additions
  only, not new routes.

## Recall-ID search input on the recalls feed

- [ ] Add a "Recall ID" input to `src/components/recalls/FiltersPanel.tsx` that maps to the existing
  `?source_recall_id=` exact filter (**already live on the API — no API change**). Pair it with the
  `source` selector, since `source_recall_id` is unique only *with* a source; surface that in helper
  text. Debounce/validate consistent with the other filter inputs.
- **FDA caveat:** for FDA, `source_recall_id` is the internal event id (RECALLEVENTID), not the public
  `F-####-####` number — so searching the public number won't match until the pipeline folds FDA
  `recall_num` into search (pipeline TODO → "Make FDA recalls findable by their public recall
  number"). Until then, either scope the hint to non-FDA or route an FDA-number query through
  `/recalls/search`.
