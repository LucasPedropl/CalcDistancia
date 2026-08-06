type GoogleMapsInitWindow = Window & {
  __calcDistanciaGoogleMapsInit?: () => void;
  google?: {
    maps?: {
      places?: unknown;
    };
  };
};

const DEFAULT_LIBRARIES = ['places'];

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

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();
  if (!apiKey) {
    return Promise.reject(new Error('VITE_GOOGLE_MAPS_API_KEY não configurada.'));
  }

  googleMapsLoadPromise = new Promise((resolve, reject) => {
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
      libraries: mergedLibraries.join(','),
    });

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.onerror = () => {
      delete initWindow[callbackName];
      googleMapsLoadPromise = null;
      reject(new Error('Falha ao carregar Google Maps.'));
    };
    document.head.appendChild(script);
  });

  return googleMapsLoadPromise;
}
