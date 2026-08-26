/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DEBUG?: string;
  readonly VITE_GRAPHQL_URL?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
