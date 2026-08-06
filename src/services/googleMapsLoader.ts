type GoogleMapsInitWindow = Window & {
  __calcDistanciaGoogleMapsInit?: () => void;
  google?: {
    maps?: {
      places?: unknown;
    };
  };
};

const DEFAULT_LIBRARIES = ['places'];
const SCRIPT_ID = 'calc-distancia-google-maps-api';
const LOAD_TIMEOUT_MS = 20_000;

let googleMapsLoadPromise: Promise<void> | null = null;

function mergeLibraries(libraries: string[]): string[] {
  return [...new Set([...DEFAULT_LIBRARIES, ...libraries])].sort();
}

function hasGoogleMapsLibraries(libraries: string[]): boolean {
  const initWindow = window as GoogleMapsInitWindow;
  if (!initWindow.google?.maps) return false;
  if (libraries.includes('places') && !initWindow.google.maps.places) return false;
  return true;
}

function waitForGoogleMapsLibraries(libraries: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();

    const tick = () => {
      if (hasGoogleMapsLibraries(libraries)) {
        resolve();
        return;
      }

      if (Date.now() - startedAt > LOAD_TIMEOUT_MS) {
        googleMapsLoadPromise = null;
        reject(new Error('Timeout aguardando Google Maps.'));
        return;
      }

      window.setTimeout(tick, 50);
    };

    tick();
  });
}

function injectGoogleMapsScript(apiKey: string, libraries: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const callbackName = '__calcDistanciaGoogleMapsInit';
    const initWindow = window as GoogleMapsInitWindow;

    initWindow[callbackName] = () => {
      delete initWindow[callbackName];
      resolve();
    };

    const params = new URLSearchParams({
      key: apiKey,
      loading: 'async',
      callback: callbackName,
      libraries: libraries.join(','),
    });

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.onerror = () => {
      delete initWindow[callbackName];
      script.remove();
      googleMapsLoadPromise = null;
      reject(new Error('Falha ao carregar Google Maps.'));
    };
    document.head.appendChild(script);
  });
}

export function isGoogleMapsApiConfigured(): boolean {
  return Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim());
}

export function loadGoogleMapsApi(libraries: string[] = DEFAULT_LIBRARIES): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Maps indisponível no servidor.'));
  }

  const mergedLibraries = mergeLibraries(libraries);
  if (hasGoogleMapsLibraries(mergedLibraries)) {
    return Promise.resolve();
  }

  if (googleMapsLoadPromise) {
    return googleMapsLoadPromise;
  }

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();
  if (!apiKey) {
    return Promise.reject(new Error('VITE_GOOGLE_MAPS_API_KEY não configurada.'));
  }

  const existingScript = document.getElementById(SCRIPT_ID);
  if (existingScript) {
    googleMapsLoadPromise = waitForGoogleMapsLibraries(mergedLibraries);
    return googleMapsLoadPromise;
  }

  googleMapsLoadPromise = injectGoogleMapsScript(apiKey, mergedLibraries);
  return googleMapsLoadPromise;
}
