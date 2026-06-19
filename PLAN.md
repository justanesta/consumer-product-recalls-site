# Consumer Product Recalls — Website (master plan)

> **Status:** Active build plan for the consumer-facing website (Phase 9 of the larger project).
> This is the single reconciled plan. It supersedes the two scoping drafts in `project_scope/`
> (`website-frontend-plan-pipeline.md` = framework/architecture; `website-frontend-plan-api.md` =
> live API contract). Where they disagreed, the **architecture** comes from the pipeline draft and the
> **API contract** comes from the API draft (its §13 explicitly supersedes the pipeline draft's stale
> API specifics). See the reconciliation table at the bottom.
>
> **Date:** 2026-06-19 · **Repo:** greenfield · **Backend:** deployed FastAPI over Neon Postgres gold marts.

---

## 1. What this site is

A free, fast, credible **public-interest data site** over five U.S. consumer-recall sources
(CPSC, FDA, USDA, NHTSA, USCG). It is a presentation client only — it **never touches Postgres**; it
makes HTTPS `GET` calls to the project's FastAPI (`https://consumer-product-recalls-api.fly.dev`,
later `https://api.consumer-product-recalls.info`) and renders JSON. It is also a **portfolio piece**:
judged on data-viz quality, data honesty, accessibility, and a clean DE/SWE narrative.

## 2. Locked decisions (from the up-front conferral)

| Decision                     | Choice                                                                                                                                                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Framework                    | **Astro** (static-first, islands), **React** islands for interactive widgets                                                                                                                                       |
| Hosting                      | **Cloudflare Pages** (free static `dist/`, unlimited bandwidth, no cold start)                                                                                                                                     |
| Charts                       | **Observable Plot** default; **D3** only for the U.S. choropleth                                                                                                                                                   |
| API client                   | **Generated** from `openapi.json` (`openapi-typescript` + `openapi-fetch`), never hand-typed                                                                                                                       |
| Styling                      | **Tailwind CSS** + a single design-token layer; **dark mode** toggle                                                                                                                                               |
| Visual direction             | **Public-interest / editorial** — restrained palette, strong typography, data-first                                                                                                                                |
| Scope                        | **Full v1 inventory**, built in a phased ladder (a working site deploys early)                                                                                                                                     |
| Extras (in scope)            | Public **API-docs page** (Starlight), **recall-search** mode, **dark mode**, **Playwright E2E**, About/Methodology page, consolidated **data-caveats** page, **RSS** of latest recalls, privacy-friendly analytics |
| Data fetching inside islands | **TanStack Query** (caching + retry/cold-start states); **Zod** for runtime response validation at trust boundaries                                                                                                |

## 3. Architecture — the two-speed (hybrid) data model

The data is slow-moving (daily cron) and splits into two access patterns:

- **Aggregates / dashboards** (`/stats/*` over gold `fct_*`): small, identical for everyone, change once a
  day → **pulled at build time**, baked into static HTML+JSON. Zero runtime API load; renders even if the
  API is cold. Refreshed by a daily rebuild (§10).
- **Per-entity + search** (recalls browser, recall detail, firm profile, product/recall search): large
  cardinality (130k+), user-driven, deep-linkable → **fetched live** from the API inside React islands.

**Rendering strategy (resolves a gap the drafts glossed):** the build is **fully static** (no SSR server
to operate). Detail pages (`/recalls/[source]/[id]`, `/firms/[id]`) are handled as:

- **`getStaticPaths` pre-renders a bounded popular set** (recent N recalls + top-N firms) → real
  server-rendered HTML with full SEO (`<title>`/meta/OG/JSON-LD), in the sitemap.
- **The long tail is a client-fetch island**: a catch-all route ships a static shell that reads the id
  from the URL and fetches the record from the API at runtime. These are `noindex` (can't pre-render
  130k pages on a free tier). This keeps the site 100% static, $0, no SSR adapter.

## 4. Stack & libraries

- **Astro** + `@astrojs/react`, `@astrojs/tailwind`, `@astrojs/sitemap`, `@astrojs/rss`.
- **React 18** islands only where interactivity is needed; static pieces are `.astro`.
- **TanStack Query** (island data fetching), **Zod** (runtime validation), **Tailwind** (styling).
- **Observable Plot** (+ **D3** for geo), wrapped in one `Chart` island with an a11y table fallback.
- **openapi-typescript** + **openapi-fetch** (typed client from the pinned `openapi.json`).
- **Starlight** + `starlight-openapi` for the `/api` docs page (renders from `openapi.json`).
- **Vitest** (+ Testing Library) for unit tests; **Playwright** for E2E; **axe/pa11y** in CI.
- **ESLint** + **Prettier**; **TypeScript strict**; `astro check` + `tsc --noEmit`.

## 5. Page & feature inventory (reconciled, with upstream endpoints)

All endpoint names/params below are the **current** contract (API draft §3). The categorical `/recalls`
filters are multi-value (repeat or comma); different filters AND together.

| Page                            | Key content                                                                                                                                                     | Endpoint(s)                                                                                                                                                                                                                  | Render                                      |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `/` Landing                     | Hero KPI strip; recalls-over-time; by-source; by-classification (source-native); methodology blurb w/ geography caveat                                          | `/stats/overview`, `/stats/recalls-by-period?grain=month`, `/stats/by-classification`                                                                                                                                        | static (build-time)                         |
| `/recalls` Browser              | Filter/paginate table; URL-as-state; active-filter chips; **keyset cursor**                                                                                     | `/recalls?source=&classification=&is_active=&published_after=&published_before=&firm=&firm_id=&distribution_state=&limit=&cursor=`                                                                                           | island (live)                               |
| `/recalls/[source]/[id]` Detail | Header card; products list; firm chips; lifecycle timeline (`announced_at→published_at` + `(revised)` from `has_been_edited`)                                   | `/recalls/{source}/{recall_id}`                                                                                                                                                                                              | static popular set + client-fetch long tail |
| `/firms/[id]` Firm              | Identity card; recalls-by-source mini-bar; this firm's recalls; rank                                                                                            | `/firms/{id}`, `/recalls?firm_id={id}`, `/stats/firm-leaderboard`                                                                                                                                                            | static top-N + client-fetch tail            |
| `/dashboards`                   | Monthly trend+rolling+YoY; by week/month/year; classification×source; active vs inactive; most-recalled firms; **two captioned choropleths**; units (captioned) | `/stats/monthly-trend`, `/stats/recalls-by-period`, `/stats/by-classification`, `/stats/status`, `/stats/firm-leaderboard`, `/stats/by-geography?basis=distribution\|firm_registration`, `/stats/by-country`, `/stats/units` | static (build-time)                         |
| `/search`                       | "Is my product recalled?" product search + exact HIN/model + UPC (honest); optional **recall-search** mode                                                      | `/products/search?q=&hin=&model=&upc=`, `/recalls/search?q=`                                                                                                                                                                 | island (live)                               |
| `/api/*` Docs                   | Rendered API reference + prose pagination/caveats pages                                                                                                         | from `openapi.json` (Starlight)                                                                                                                                                                                              | static                                      |
| `/methodology`, `/about`        | What the data is and isn't; sources; the honesty caveats                                                                                                        | static MDX                                                                                                                                                                                                                   | static                                      |
| `/recalls.xml`                  | RSS of latest recalls                                                                                                                                           | `/recalls?limit=N` at build                                                                                                                                                                                                  | static                                      |

## 6. Data-honesty requirements (a UI contract, not polish)

These are load-bearing and shape the components themselves (source: API draft §7 / `data_contract.md`):

1. **`classification` is source-native** — FDA `1/2/3/NC`, USDA `Class I/II/III` + `Public Health Alert`,
   USCG `H/L/M/S`, CPSC/NHTSA none. **Never a global "Class I/II/III" legend**; scope by source.
2. **`is_active` is tri-state** — CPSC/NHTSA are `null`. Status UI needs Active / Inactive / **n.a.**; the
   "Any" filter omits the param so they reappear.
3. **UPC is recall-level only** — no per-product `upc`. Surface HIN/model for product identity; UPC search
   matches the recall-wide array (CPSC, sparse). Empty-state: "No match ≠ not recalled."
4. **Geography has two distinct lenses** — distribution (where product went, FDA/USDA) vs firm-registration
   (where firm is registered). **Two separate captioned charts, never one toggle.** Registration ≠ harm.
5. **Units recalled** (NHTSA/USCG) — recall magnitude, not unique vehicles, not cross-source comparable.
6. **Edit history is pruned** — only `has_been_edited` (bool, no date). Timeline shows a `(revised)` badge,
   not a dated history.

## 7. API client strategy

- Pin the committed `openapi.json` into the repo; `npm run gen:api` runs `openapi-typescript` → `src/lib/api/schema.d.ts` (committed). CI regenerates from the **deployed** spec and **fails on drift**.
- `src/lib/api/client.ts` = typed `openapi-fetch` client reading `PUBLIC_API_URL`. Thin named wrappers
  (`listRecalls`, `searchRecalls`, `getRecall`, `searchProducts`, `getFirm`, `getStats*`) — pages/islands
  call those, never raw fetch.
- **Resilience baked in:** keyset pagination (opaque cursor; `400 bad_cursor` → reset to page 1);
  debounce search ≥300ms; back off on `429` (`Retry-After`); cold-start `503` → "waking up…" + retry, and
  build-time pulls pre-warm `/health/db`, retry with backoff, and **fail the build loudly** (never ship
  blank dashboards). Documented fallback: a build-time JSON snapshot if a cold wake ever exceeds the CI window.

## 8. Design system & accessibility

- **Editorial palette** via Tailwind design tokens (per-source / status / classification colors single-homed
  and shared by badges + charts). Colorblind-safe (deuteranopia-checked); color is **never the only encoding**.
- Dark mode toggle (tokens drive both themes).
- WCAG 2.1 AA: every chart island ships a visually-hidden data-table fallback + `aria-label`/`<figcaption>`;
  keyboard-navigable table/filters/search; visible focus; skip link; honest empty/loading/error states;
  `prefers-reduced-motion` respected.

## 9. Testing

- `astro check` + `tsc --noEmit` (the generated API types make this load-bearing).
- ESLint + Prettier (`--check` in CI).
- Vitest: client wrappers (mock fetch), filter→querystring serializer, `fct_*` JSON → Plot-spec transforms
  (kept pure, I/O behind the client). Coverage target ≥70%.
- Playwright happy-paths: landing KPIs render, recalls browser filters, search returns a result, a detail
  page loads.
- axe/pa11y against built pages in CI.

## 10. Deployment & the user-owned steps

- **I do:** build the site, the CI gate, the CF Pages config + build settings, the daily-rebuild cron
  workflow, and a deploy runbook.
- **You do (account/payment actions I won't take for you):** register the domain (Cloudflare Registrar,
  at-cost), connect the repo to CF Pages, set `PUBLIC_API_URL`/`CF_PAGES_DEPLOY_HOOK` secrets, and the Fly
  `api.` cert step. Full steps mirrored in `documentation/deployment.md` (from API draft §14).
- **CI (GitHub Actions, free for public repos):** `npm ci` → `gen:api` drift gate → lint → `astro check` →
  Vitest → Playwright → `astro build`. CF Pages does the deploy; CI is the gate.
- **Daily rebuild:** `schedule:` cron → CF Pages deploy hook (`secrets.CF_PAGES_DEPLOY_HOOK`), default-branch
  only, skips the hook if the API is unreachable (no broken publish).

## 11. Phased commit ladder (one feature branch, per-phase green commits)

Each commit is independently green (lint + type-check + tests). Built on `feat/site-v1`.

0. `docs:` master plan + reconciled `CLAUDE.md` + architecture stub.
1. `chore:` scaffold Astro + Tailwind + React + sitemap/rss, ESLint/Prettier, Vitest, base `Layout` +
   nav/footer + dark-mode toggle + design tokens. Build green + deploy-ready.
2. `feat:` OpenAPI-generated typed client — pinned `openapi.json`, `gen:api`, `schema.d.ts`, `client.ts`,
   endpoint wrappers (incl. `/stats/*`), querystring serializer, cold-start/429 handling + Vitest.
3. `feat:` design tokens + shared components — `SourceBadge`, `StatusBadge` (tri-state),
   `ClassificationBadge` (source-native), `KpiStat`, `Chart` island (Plot + a11y table fallback), `FilterChips`.
4. `feat:` landing/overview — build-time `/stats/*`, hero KPIs, three charts, methodology blurb + caveat.
5. `feat:` dashboards — all panels incl. the two captioned choropleths + units; transform unit tests.
6. `feat:` recalls browser — filter/paginate island, URL-as-state, keyset cursor, chips; recall-search mode.
7. `feat:` recall detail + firm profile — `getStaticPaths` popular set + client-fetch long-tail island,
   lifecycle timeline, firm linkage, per-firm recalls via `?firm_id=`, leaderboard rank.
8. `feat:` product/recall search — "is my product recalled?" island, honest empty-state, FTS-not-fuzzy copy,
   HIN/model exact lookup, UPC honesty.
9. `feat:` API-docs page (Starlight + starlight-openapi) + consolidated data-caveats + methodology/about pages.
10. `feat:` SEO + a11y pass — per-page meta/OG, JSON-LD, sitemap/robots, RSS, 404, reduced-motion, privacy analytics.
11. `ci:` GitHub Actions gate + daily rebuild cron + `gen:api` drift gate.
12. `test:` Playwright E2E happy-paths.
13. `docs:` README + `documentation/deployment.md` runbook + back-link to pipeline ADR 0039.

**End-of-branch:** one PR; the frontend ADR (`0039-frontend-framework`) is authored for the pipeline repo's
ADR register (this repo back-links it).

## 12. Out of scope for v1

Dimensional star / `dim_*` (the fixed chart set doesn't need it); fuzzy/trigram search (API is exact FTS);
user accounts / saved searches / alerts (needs auth + a store — v2); SSR / a server runtime; a project blog.

---

## Appendix — reconciliation of the two source drafts

The drafts own different layers; the only "conflicts" were the pipeline draft's own stale API specifics,
all resolved the same way by the API draft §13:

| Pipeline draft (stale)                  | Reconciled truth                                                    |
| --------------------------------------- | ------------------------------------------------------------------- |
| `/stats/*` + `fct_*` dashboards blocked | ✅ BUILT — 9 `/stats/*` endpoints; dashboards fetched at build time |
| `?firm_id=` absent                      | ✅ BUILT — jsonb containment, matches firm in any role              |
| `date_from/date_to/status/page=`        | `published_after/_before`, tri-state `is_active`, keyset `cursor`   |
| FDA "Class I/II/III"                    | FDA `1/2/3/NC`; classification source-native, scoped per source     |
| Rich edit-history timeline              | Pruned — only `has_been_edited` (bool, no date)                     |
| Per-product `upc` column                | Dropped — UPC is recall-level only                                  |
| (product search only)                   | `/recalls/search?q=` also available (recall-grain)                  |
