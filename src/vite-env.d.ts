/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CACHE_TTL_MS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
