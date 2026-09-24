/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEBUG?: string;
  readonly VITE_GRAPHQL_URL?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_TRANSCRIPTION_HTTP_TIMEOUT_MS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
