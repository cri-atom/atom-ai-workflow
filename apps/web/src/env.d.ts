/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_DOCS_URL: string;
  readonly PUBLIC_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
