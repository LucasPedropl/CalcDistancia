export type MapProviderId = 'standard' | 'google';

const STORAGE_KEY = 'calc_distancia_map_provider';
const UPDATED_EVENT = 'calc-distancia-map-provider-updated';

export function isGoogleMapsConfigured(): boolean {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  return Boolean(key && key.trim().length > 0);
}

export function loadMapProvider(): MapProviderId {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'google' && isGoogleMapsConfigured()) return 'google';
    if (raw === 'standard') return 'standard';
  } catch {
    // ignore
  }
  return 'standard';
}

export function saveMapProvider(provider: MapProviderId): void {
  const next =
    provider === 'google' && !isGoogleMapsConfigured() ? 'standard' : provider;
  localStorage.setItem(STORAGE_KEY, next);
  window.dispatchEvent(new CustomEvent(UPDATED_EVENT, { detail: { provider: next } }));
}

export function subscribeToMapProvider(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener(UPDATED_EVENT, handler);
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) callback();
  });
  return () => window.removeEventListener(UPDATED_EVENT, handler);
}

export function getStandardTileUrl(isDark: boolean): string {
  return isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
}

export function getStandardTileAttribution(): string {
  return '&copy; OpenStreetMap &copy; CARTO';
}
