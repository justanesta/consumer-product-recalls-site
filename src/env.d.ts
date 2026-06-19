/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  /** Base URL of the recalls API (no trailing slash). */
  readonly PUBLIC_API_URL: string;
  /** Optional Cloudflare Web Analytics token; analytics is off when unset. */
  readonly PUBLIC_CF_ANALYTICS_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
