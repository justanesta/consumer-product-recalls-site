# Consumer Product Recalls — website

A free, fast, honest view of U.S. consumer product recalls across **five federal sources** — CPSC,
FDA, USDA, NHTSA, and USCG — unified into one searchable site. It's a presentation client over a
public read-only API: it **never touches the database**, only HTTPS `GET`s the API and renders JSON.

> Working title: **Recall Lookup** (rename in `src/layouts/Layout.astro`). Planned home:
> `https://consumer-product-recalls.info`.

## What's here

| Page                     | What it does                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------- |
| `/`                      | Headline KPIs + recalls-over-time, by-source, and source-native classification charts |
| `/recalls`               | Filter/search/paginate every recall (URL-as-state, keyset cursors)                    |
| `/recalls/[source]/[id]` | One recall — prerendered for the popular set, client-fetched for the long tail        |
| `/firms/[id]`            | Firm profile + recalls-by-source + the firm's recalls                                 |
| `/dashboards`            | 8 trend panels incl. two captioned geography choropleths                              |
| `/search`                | "Is my product recalled?" product + identifier search                                 |
| `/api`                   | Interactive API reference (rendered from `openapi.json`)                              |
| `/methodology`, `/about` | What the data is and isn't; how it's built                                            |
| `/rss.xml`               | Latest 50 recalls                                                                     |

## Architecture (the two-speed model)

The data is slow-moving (nightly cron), so it splits cleanly:

- **Aggregates / dashboards** (`/stats/*`) → pulled at **build time**, baked into static HTML+JSON.
  Zero runtime API load; renders even if the API is cold. Refreshed by a daily rebuild.
- **Per-entity + search** (recalls, detail, firm, products) → fetched **live** in React islands with
  TanStack Query (cold-start/rate-limit retry).

Detail/firm pages: a bounded **popular set is prerendered** at clean URLs (full SEO); the long tail is
served by a **client-fetch viewer** via a Cloudflare Pages `_redirects` 200-rewrite (static assets win,
so prerendered pages serve directly). See [`documentation/architecture.md`](documentation/architecture.md).

**Stack:** Astro (static) · React islands · TanStack Query · Zod · Observable Plot + D3 · Tailwind ·
TypeScript (strict) · an OpenAPI-generated client · Cloudflare Pages.

## Local development

```bash
cp .env.example .env        # PUBLIC_API_URL defaults to the live API
npm install
npm run gen:api             # regenerate the typed client from openapi.json (committed)
npm run dev                 # http://localhost:4321
```

### Quality gates (all green in CI)

```bash
npm run lint                # ESLint (flat config)
npm run check               # astro check + TS
npm test                    # Vitest (client, transforms, filters, domain)
npm run build               # static build (does the build-time /stats/* pull)
npm run test:e2e            # Playwright happy-paths (needs a build first)
```

The API client + types are **generated from `openapi.json`** — never hand-written. CI re-fetches the
deployed spec and **fails on drift**, so a backend contract change shows up as a red check.

## Deployment

Static `dist/` on **Cloudflare Pages** (free, no cold start). CI is the gate; a daily `schedule:` cron
re-triggers a Pages deploy to refresh the build-time aggregates. The domain purchase, Pages/Fly account
wiring, and secrets are **yours to set** — full runbook in
[`documentation/deployment.md`](documentation/deployment.md).

**Cost ledger:** Cloudflare Pages (free) + GitHub Actions (free, public repo) + the API's own free tier
= **$0** (plus the at-cost domain registration).

## Data honesty

Five sources, five vocabularies — kept **source-native**, never forced into a false common scale:
classifications aren't comparable across agencies; status is tri-state (CPSC/NHTSA have no lifecycle);
geography has two distinct lenses; units aren't cross-source comparable; UPC is recall-level and sparse.
See [`/methodology`](src/pages/methodology.astro).

## Related

- Framework decision: pipeline ADR **0039** — content in
  [`documentation/decisions/0039-frontend-framework.md`](documentation/decisions/0039-frontend-framework.md)
  (file it in the pipeline repo's ADR register).
- Sibling repos: `consumer-product-recalls` (pipeline) · `consumer-product-recalls-api` (API).
- Reconciled build plan: [`PLAN.md`](PLAN.md). Source scope drafts: [`project_scope/`](project_scope/).
