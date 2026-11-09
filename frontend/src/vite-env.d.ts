/// <reference types="vite/client" />

// Env vars exposed to the browser (must start with VITE_). See .env.example.
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
