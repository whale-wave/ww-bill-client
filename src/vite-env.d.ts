/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HOST: string;
  readonly VITE_IOS_SHORTCUT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
