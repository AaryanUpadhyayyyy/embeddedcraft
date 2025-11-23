/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string
    readonly VITE_SERVER_BASE: string
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
