/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_BIXS_API_BASE?: string;
  readonly VITE_BIXS_API_EMAIL?: string;
  readonly VITE_BIXS_API_PASSWORD?: string;
  readonly VITE_BIXS_TEST_PHONE?: string;
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  google?: {
    maps?: unknown;
  };
}

declare module 'leaflet.gridlayer.googlemutant';
