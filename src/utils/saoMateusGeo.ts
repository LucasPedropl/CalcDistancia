/** Área urbana aproximada de São Mateus, ES (inclui Guriri e bairros centrais). */
export const SAO_MATEUS_CENTER = {
  lat: -18.7163,
  lng: -39.8589,
  address: 'Centro, São Mateus, ES',
} as const;

export const SAO_MATEUS_BOUNDS = {
  minLat: -18.785,
  maxLat: -18.675,
  minLng: -39.93,
  maxLng: -39.785,
} as const;

export function isInsideSaoMateus(lat: number, lng: number): boolean {
  return (
    lat >= SAO_MATEUS_BOUNDS.minLat &&
    lat <= SAO_MATEUS_BOUNDS.maxLat &&
    lng >= SAO_MATEUS_BOUNDS.minLng &&
    lng <= SAO_MATEUS_BOUNDS.maxLng
  );
}

export function clampToSaoMateus(lat: number, lng: number): { lat: number; lng: number } {
  return {
    lat: Math.min(SAO_MATEUS_BOUNDS.maxLat, Math.max(SAO_MATEUS_BOUNDS.minLat, lat)),
    lng: Math.min(SAO_MATEUS_BOUNDS.maxLng, Math.max(SAO_MATEUS_BOUNDS.minLng, lng)),
  };
}

export function randomPointInSaoMateus(): { lat: number; lng: number } {
  return {
    lat:
      SAO_MATEUS_BOUNDS.minLat +
      Math.random() * (SAO_MATEUS_BOUNDS.maxLat - SAO_MATEUS_BOUNDS.minLat),
    lng:
      SAO_MATEUS_BOUNDS.minLng +
      Math.random() * (SAO_MATEUS_BOUNDS.maxLng - SAO_MATEUS_BOUNDS.minLng),
  };
}

export function randomNearbyPointInSaoMateus(
  lat: number,
  lng: number,
  minKm: number,
  maxKm: number,
): { lat: number; lng: number } {
  const origin = clampToSaoMateus(lat, lng);

  for (let attempt = 0; attempt < 16; attempt += 1) {
    const angle = Math.random() * Math.PI * 2;
    const distanceKm = minKm + Math.random() * (maxKm - minKm);
    const latDelta = (distanceKm / 111) * Math.cos(angle);
    const lngDelta =
      (distanceKm / (111 * Math.cos((origin.lat * Math.PI) / 180))) * Math.sin(angle);
    const candidate = clampToSaoMateus(origin.lat + latDelta, origin.lng + lngDelta);
    if (isInsideSaoMateus(candidate.lat, candidate.lng)) {
      return candidate;
    }
  }

  return origin;
}
