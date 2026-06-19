# Deployment runbook

Static `dist/` on **Cloudflare Pages**. Most of this is **account/payment actions only you can do** —
the repo, CI, and config are ready; the steps below wire them to your accounts.

## Environment / secrets

| Name                        | Where                          | Purpose                                                                                          |
| --------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------ |
| `PUBLIC_API_URL`            | Pages build env var            | API base URL (e.g. `https://api.consumer-product-recalls.info`). Defaults to the `.fly.dev` URL. |
| `PUBLIC_CF_ANALYTICS_TOKEN` | Pages build env var (optional) | Cloudflare Web Analytics token (cookieless). Analytics is off when unset.                        |
| `CF_PAGES_DEPLOY_HOOK`      | **GitHub repo secret**         | The Pages deploy-hook URL the daily-rebuild cron POSTs. Never inline it.                         |

## 1. Connect the repo to Cloudflare Pages

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git** → pick this repo.
2. Build command `npm run build`, output dir `dist`, framework **Astro**.
3. Add env var `PUBLIC_API_URL` (start with `https://consumer-product-recalls-api.fly.dev`).
4. Deploy → you get a `*.pages.dev` URL. **Verify the empty/first deploy works before anything else.**

## 2. Domain (Cloudflare Registrar — at cost)

1. Dashboard → **Domain Registration → Register Domains** → buy `consumer-product-recalls.info`
   (at-cost; WHOIS redaction on by default). Cloudflare auto-creates the DNS zone — no nameserver change.
2. Pages project → **Custom domains** → add the apex `consumer-product-recalls.info` (+ `www`). Pages
   auto-creates DNS + TLS. Pick the apex as canonical and redirect `www`.

## 3. Point `api.` at the Fly.io API (DNS-only / grey-cloud)

In the **API repo**:

```bash
fly certs add api.consumer-product-recalls.info
fly certs show api.consumer-product-recalls.info   # shows the DNS records + status
```

In **Cloudflare DNS** (this zone), add what `fly certs show` reports — typically
`CNAME  api → consumer-product-recalls-api.fly.dev`, **Proxy = DNS only (grey cloud)** (preserves real
client IPs for the API's rate limiter; Fly terminates TLS). Re-run `fly certs show` until **issued**,
then set Pages `PUBLIC_API_URL=https://api.consumer-product-recalls.info` and redeploy.

> CORS is `*`, so no CORS change is needed for the custom domains. If you later orange-cloud the API,
> set SSL/TLS mode **Full (strict)** and have the API read `CF-Connecting-IP`.

## 4. Daily rebuild cron

`.github/workflows/rebuild.yml` runs at 05:30 UTC (after the pipeline's nightly rebuild):

1. Create a **Pages deploy hook** (Pages project → Settings → Builds & deployments → Deploy hooks).
2. Add it as the GitHub repo secret `CF_PAGES_DEPLOY_HOOK`.
3. The workflow probes API readiness (wakes past cold start) and POSTs the hook; if the API is down it
   **skips**, leaving the last-good build live. (GitHub's `schedule:` only fires on `main`.)

## CI

`.github/workflows/ci.yml` on push/PR: `npm ci` → regenerate API types and **fail on contract drift**
vs the deployed spec → lint → `astro check` → Vitest → build → Playwright (chromium). Cloudflare Pages
does the actual deploy; CI is the gate.

## Optional — remove API cold starts

Set `min_machines_running = 1` in the API's `fly.toml` (within the free allowance). No frontend change.

## Cost ledger

Cloudflare Pages (free, unlimited bandwidth) + GitHub Actions (free for public repos) + the API's free
tier = **$0** ongoing, plus the at-cost domain registration.
