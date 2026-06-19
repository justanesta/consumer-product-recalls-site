# Consumer Product Recalls — Website

Consumer-facing site over five U.S. recall sources (CPSC, FDA, USDA, NHTSA, USCG). Presentation client
only: it talks to the project's FastAPI over HTTPS `GET` and renders JSON — **it never touches Postgres**.
The full build plan is in `PLAN.md`; the reconciled source drafts are in `project_scope/`.

## Project Type
**Astro** static-first multi-page site (Cloudflare Pages), with **React** islands for interactivity.
(Not a React SPA — static-first is deliberate: free static hosting, SEO, and a two-speed data model.)

## Framework & stack
- **Astro** + `@astrojs/react`, `@astrojs/tailwind`, `@astrojs/sitemap`, `@astrojs/rss`.
- **React 18** islands only where interactivity is needed (hooks, no class components). Static pieces are `.astro`.
- **TanStack Query** for island data fetching (caching, retry, cold-start states).
- **Zod** for runtime validation of API responses at trust boundaries.
- **Tailwind CSS** for styling (design tokens single-home the palette).
- **Observable Plot** for charts (+ **D3** only for the U.S. choropleth), wrapped in one `Chart` island.
- **openapi-typescript** + **openapi-fetch** for the typed API client.

## Structure
- `src/components/` (`.astro` for static, `.tsx` islands for interactive)
- `src/layouts/`, `src/pages/`, `src/lib/api/` (generated client + wrappers), `src/lib/charts/`, `src/lib/utils/`, `src/styles/`
- `documentation/` — `architecture.md`, `deployment.md`

## Data fetching
- **Two-speed:** aggregates/dashboards (`/stats/*`) are pulled at **build time** and baked static; per-entity +
  search are fetched **live** in islands. Detail-page long tail is a client-fetch island (`noindex`); the
  popular set is pre-rendered via `getStaticPaths`.
- **Never hand-write API types.** Generate from the pinned `openapi.json` (`npm run gen:api` → `src/lib/api/schema.d.ts`,
  committed). CI fails on drift vs the deployed spec.
- Wrap endpoints in named functions in `src/lib/api/`; pages/islands call those, not raw `fetch`.
- Handle keyset pagination (opaque cursor; `400 bad_cursor` → reset), `429` backoff (`Retry-After`, debounce
  search ≥300ms), and `503` cold-start ("waking up…" + retry). Build-time pulls fail loud, never ship blanks.

## TypeScript standards
- Strict mode. Proper typing for props/state/API responses. Prefer the generated `components['schemas'][…]` types.

## Component design
- Functional components only; small and single-responsibility; a props interface for every component.

## Data honesty (a UI contract — see `PLAN.md` §6)
`classification` is source-native (never a global legend); `is_active` is tri-state (Active/Inactive/n.a.);
UPC is recall-level only; geography has two distinct lenses (two captioned charts, never a toggle); units
are not cross-source comparable; edit history is `has_been_edited`-only (no dates).

## Testing
- **Vitest** + Testing Library for pure logic (client wrappers w/ mocked fetch, querystring serializer, chart
  transforms). Mock APIs with MSW where useful. Coverage target ≥70%.
- **Playwright** happy-path E2E per page. **axe/pa11y** in CI.
- Keep transforms pure and I/O behind the client so they're unit-testable without network.

## Accessibility (WCAG 2.1 AA)
Semantic HTML; every chart ships a visually-hidden data-table fallback + `aria-label`/`<figcaption>`; color is
never the only encoding (colorblind-safe palette); keyboard nav + visible focus + skip link; honest
empty/loading/error states; `prefers-reduced-motion` respected. Dark mode supported.

## Performance
Static-first; islands hydrate only where needed (`client:visible`/`client:idle`). Memoize where it matters.

## Deployment
- Build: `npm run build` → `dist/`. Hosting: **Cloudflare Pages** (free static, no cold start).
- `PUBLIC_API_URL` env var holds the API base URL (never hard-code it).
- Daily rebuild cron refreshes build-time-baked `/stats/*`. Account/domain steps are the user's — see
  `documentation/deployment.md`.
