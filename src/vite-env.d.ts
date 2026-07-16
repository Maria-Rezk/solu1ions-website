/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional contact-form POST endpoint; mailto fallback is used when unset. */
  readonly VITE_CONTACT_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
