import type { LocationPoint } from '../types';

export type MapViewport = {
  lat: number;
  lng: number;
  zoom: number;
};

export const BRAZIL_MAP_VIEWPORT: MapViewport = {
  lat: -14.235,
  lng: -51.9253,
  zoom: 4,
};

export const LOCAL_MAP_ZOOM = 13;

function isValidCoordinate(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export function resolveMapViewport(
  locations: Array<LocationPoint | null | undefined>,
  options?: { localZoom?: number },
): MapViewport {
  const localZoom = options?.localZoom ?? LOCAL_MAP_ZOOM;

  for (const location of locations) {
    if (location && isValidCoordinate(location.lat, location.lng)) {
      return {
        lat: location.lat,
        lng: location.lng,
        zoom: localZoom,
      };
    }
  }

  return BRAZIL_MAP_VIEWPORT;
}

export function requestUserLocation(): Promise<LocationPoint | null> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: 'Sua localização atual',
        });
      },
      () => resolve(null),
      {
        enableHighAccuracy: true,
        maximumAge: 60_000,
        timeout: 10_000,
      },
    );
  });
}
