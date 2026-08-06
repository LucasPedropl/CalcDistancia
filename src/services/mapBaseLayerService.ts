import L from 'leaflet';
import {
  type MapProviderId,
  getStandardTileAttribution,
  getStandardTileUrl,
  isGoogleMapsConfigured,
} from './mapProviderService';

const baseLayerByMap = new WeakMap<L.Map, L.Layer>();

let googleMapsLoadPromise: Promise<void> | null = null;
let googleMutantLoadPromise: Promise<void> | null = null;

function ensureLeafletGlobal(): void {
  if (typeof window === 'undefined') return;
  (window as Window & { L: typeof L }).L = L;
}

function loadGoogleMutantPlugin(): Promise<void> {
  if (!googleMutantLoadPromise) {
    ensureLeafletGlobal();
    googleMutantLoadPromise = import('leaflet.gridlayer.googlemutant').then(() => undefined);
  }

  return googleMutantLoadPromise;
}

function loadGoogleMapsApi(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Maps indisponível no servidor.'));
  }

  if (window.google?.maps) {
    return Promise.resolve();
  }

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();
  if (!apiKey) {
    return Promise.reject(new Error('VITE_GOOGLE_MAPS_API_KEY não configurada.'));
  }

  if (!googleMapsLoadPromise) {
    googleMapsLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&loading=async`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Falha ao carregar Google Maps.'));
      document.head.appendChild(script);
    });
  }

  return googleMapsLoadPromise;
}

async function createBaseLayer(provider: MapProviderId, isDark: boolean): Promise<L.Layer> {
  if (provider === 'google' && isGoogleMapsConfigured()) {
    ensureLeafletGlobal();
    await loadGoogleMapsApi();
    await loadGoogleMutantPlugin();

    if (!L.gridLayer?.googleMutant) {
      throw new Error('Plugin Google Mutant não carregou corretamente.');
    }

    return L.gridLayer.googleMutant({ type: 'roadmap', maxZoom: 21 });
  }

  return L.tileLayer(getStandardTileUrl(isDark), {
    maxZoom: 19,
    subdomains: 'abcd',
    attribution: getStandardTileAttribution(),
  });
}

export async function setMapBaseLayer(
  map: L.Map,
  provider: MapProviderId,
  isDark: boolean,
): Promise<void> {
  const previous = baseLayerByMap.get(map);
  if (previous) {
    map.removeLayer(previous);
  }

  const layer = await createBaseLayer(provider, isDark);
  layer.addTo(map);
  baseLayerByMap.set(map, layer);
}

export function removeMapBaseLayer(map: L.Map): void {
  const previous = baseLayerByMap.get(map);
  if (previous) {
    map.removeLayer(previous);
    baseLayerByMap.delete(map);
  }
}
