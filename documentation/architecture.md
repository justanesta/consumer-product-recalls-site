# Architecture

How the site is structured, how it gets data, and how it renders.

## Directory layout

```
src/
  components/            shared UI (badges, KpiStat, Callout, Chart primitive)
    charts/              concrete chart islands (data in -> Plot spec)
    recalls/             RecallsBrowser island, RecallDetail, viewers, table
    firms/               FirmProfile, FirmRecalls, viewer
    search/              ProductSearch island
    api/                 Scalar API-reference island
  layouts/Layout.astro   shell: nav, footer, SEO/OG slots, dark-mode, head slot
  lib/
    api/                 generated schema.d.ts + typed client + endpoint wrappers
    charts/              pure transforms (fct_* JSON -> chart data) + colors
    domain/              sources, classification, status, classification-vocab
    recalls/             filter (de)serializer
    geo/                 FIPS <-> USPS map
    format.ts            number/date formatting
  pages/                 routes (.astro) + rss.xml.ts + 404
e2e/                     Playwright specs
public/                  openapi.json, _redirects, robots.txt, geo/states-10m.json
```

## Data access — the two-speed model

The pipeline refreshes nightly, so data splits by access pattern:

- **Build-time (static):** `/stats/*` aggregates are pulled in page frontmatter with `withRetry(...)`
  and baked into the HTML. Pages: landing, dashboards, RSS. Zero runtime API load; the build **fails
  loud** if the API can't be woken (never ships blank dashboards).
- **Runtime (live, in islands):** the recalls browser, product search, and the long-tail detail/firm
  viewers fetch from the API client-side via TanStack Query.

### The API client (`src/lib/api/`)

- `schema.d.ts` is **generated** from the pinned `openapi.json` (`npm run gen:api`). Never hand-edited.
- `client.ts` builds a typed `openapi-fetch` client (arrays serialized comma-form), plus:
  - `ApiError` — carries the operational signals (`isColdStart` 503, `isRateLimited` 429,
    `isBadCursor` 400, `isNotFound`) and `Retry-After`.
  - `unwrap()` — result → data or throw `ApiError`.
  - `withRetry()` — exponential backoff on transient failures, honoring `Retry-After`.
- Thin per-resource wrappers (`recalls.ts`, `products.ts`, `firms.ts`, `stats.ts`, `health.ts`) are
  the only things pages/islands call.

## Rendering strategy

Fully static build (no SSR server). Detail and firm routes:

1. **Popular set prerendered.** `getStaticPaths` fetches recent recalls / top firms and bakes full
   server-rendered pages at clean URLs (`/recalls/[source]/[id]`, `/firms/[id]`) — real SEO.
2. **Long tail client-fetched.** `public/_redirects` 200-rewrites unmatched detail/firm URLs to a
   viewer shell (`/recall-view`, `/firm-view`) that reads the id from the URL and fetches client-side.
   Cloudflare serves real assets first, so prerendered pages always win; only misses hit the shell.
   These shells are `noindex` and excluded from the sitemap.

Presentational components (`RecallDetail`, `FirmProfile`) are shared by both the prerendered pages and
the client viewers.

## State management

- **Recalls browser:** the **URL is the source of truth** for filters
  (`src/lib/recalls/filters.ts` ↔ querystring). Keyset pagination keeps a cursor stack for
  forward/back; a `400 bad_cursor` resets to page 1. Cursors are ephemeral (not in the URL).
- **TanStack Query** owns fetching/caching/retry and the loading/error/cold-start states.

## Charts

- One `Chart` primitive (`components/Chart.tsx`) renders an Observable Plot spec into a responsive
  container and ships a disclosure-toggled **data-table fallback** (a11y).
- Concrete chart **islands** take serializable data props (Astro can't pass functions across the
  island boundary) and build the spec internally. Pure transforms live in `lib/charts/` and are
  unit-tested.
- The choropleth loads the vendored `us-atlas` topology as a public asset (kept out of the JS bundle)
  and joins recall counts by FIPS.

## Design system

Tailwind with a single token layer (`tailwind.config.mjs` + CSS channel vars in `global.css`):
theme-flipping neutrals (light/dark), a colorblind-safe per-source palette, and tri-state status
colors. Color is never the only encoding; WCAG-AA contrast; `prefers-reduced-motion` respected.
