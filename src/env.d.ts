/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  /** Base URL of the recalls API (no trailing slash). */
  readonly PUBLIC_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
