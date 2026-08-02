/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Cloudflare Turnstile public site key, supplied at build time. */
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
