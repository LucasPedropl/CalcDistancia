import L from 'leaflet';
import GoogleMutant from 'leaflet.gridlayer.googlemutant/src/Leaflet.GoogleMutant.mjs';
import { loadGoogleMapsApi } from './googleMapsLoader';
import {
  type MapProviderId,
  getStandardTileAttribution,
  getStandardTileUrl,
  isGoogleMapsConfigured,
} from './mapProviderService';

const baseLayerByMap = new WeakMap<L.Map, L.Layer>();

function createGoogleMutantLayer(): L.Layer {
  return new GoogleMutant({ type: 'roadmap', maxZoom: 21 });
}

async function createBaseLayer(provider: MapProviderId, isDark: boolean): Promise<L.Layer> {
  if (provider === 'google' && isGoogleMapsConfigured()) {
    await loadGoogleMapsApi();
    return createGoogleMutantLayer();
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
