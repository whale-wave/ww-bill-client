/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_BUILD_ID?: string;
  readonly VITE_APP_VERSION?: string;
  readonly VITE_HOST: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
