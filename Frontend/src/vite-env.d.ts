/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_FILE_BASE_URL: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  