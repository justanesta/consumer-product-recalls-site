# 0039 — Frontend framework & architecture for the website

> **Home:** this ADR belongs in the **pipeline repo's** ADR register
> (`consumer-product-recalls/documentation/decisions/`). It's authored here so the website repo
> carries its own rationale; copy it into the register and flip Status on first deploy.

- **Status:** Proposed (Phase 9 start). Ratifies → Accepted when the first Cloudflare Pages deploy lands.
- **Date:** 2026-06-19

## Context

Phase 9 needs a consumer-facing website for a Python + Postgres + FastAPI backend, built by a solo data
engineer, at near-zero cost. The data is slow-moving (nightly cron) and splits into two access patterns:
small per-visitor-identical aggregates (dashboards) and large user-driven per-entity browse/search. The
site is also a portfolio piece judged on data-viz quality and data honesty.

## Decision

**Astro (static-first) + React islands, on Cloudflare Pages, charts via Observable Plot (+ D3 for the
choropleth), with an OpenAPI-generated TypeScript client and a hybrid build-time-aggregates /
live-API-search data model.**

- **Astro static-first** matches the two-speed data: aggregates are pulled at build time and baked;
  search/browse are interactive islands. No SSR server to operate.
- **React islands** (over Svelte) honor the repo's stated React tooling (TanStack Query, Zod) and
  portfolio legibility; the static-first shell keeps JS minimal.
- **Cloudflare Pages** — free static hosting, unlimited bandwidth, no cold start, no vendor license
  footnote; keeps the project on Cloudflare (matching the pipeline's R2 landing).
- **OpenAPI-generated client** — types are generated from `openapi.json`; CI fails on drift.
- **Long-tail detail/firm pages** — prerender a popular set for SEO; serve the rest via a client-fetch
  viewer through a Pages `_redirects` 200-rewrite (no SSR adapter, stays $0).

## Alternatives considered

- **Next.js / Vercel** — SSR-first weight and a metered/non-commercial license for capability this
  static site discards. Rejected.
- **SvelteKit** — viable, but forces a JS-framework mindset on every (mostly content) page and a smaller
  charting ecosystem. Rejected in favor of Astro's islands.
- **Observable Framework** — best-in-class dashboards but weak at the live search/browse half this site
  needs. Rejected as the primary framework (its charting, Observable Plot, is adopted inside Astro).
- **Starlight for the API docs** — the canonical Astro docs layer, but it imposes a second theme/shell.
  Chose **Scalar** as a single island inside the site's own shell instead (still 100% spec-driven).

## Consequences

- Static-first and free; the whole site is one `dist/` deployable to any static host.
- You own **island-framework discipline** (React only; don't sprawl) and a **daily rebuild cron** for
  dashboard freshness.
- The generated client makes a backend contract change a red CI check, not a silent runtime break.
- The long-tail viewer relies on Cloudflare Pages serving static assets before `_redirects` (documented
  behavior); long-tail detail pages are client-rendered (`noindex`).
