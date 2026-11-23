/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_STORE_MODE?: string;
  readonly VITE_INCLUDE_ADMIN?: string;
  readonly VITE_ROUTER?: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_INSTAGRAM_URL?: string;
  readonly VITE_CONTACT_EMAIL?: string;
  readonly VITE_NEWSLETTER_ENDPOINT?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
