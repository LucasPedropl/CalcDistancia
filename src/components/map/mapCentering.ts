import L from 'leaflet';

const DEFAULT_PADDING: [number, number] = [48, 48];

export function centerMapOnPoint(
  map: L.Map,
  lat: number,
  lng: number,
  zoom = 16,
): void {
  map.setView([lat, lng], zoom, { animate: true });
}

export function fitMapToPoints(
  map: L.Map,
  points: Array<[number, number]>,
  options?: { padding?: [number, number]; maxZoom?: number },
): void {
  if (points.length === 0) return;

  const padding = options?.padding ?? DEFAULT_PADDING;
  const maxZoom = options?.maxZoom ?? 15;

  if (points.length === 1) {
    centerMapOnPoint(map, points[0][0], points[0][1], maxZoom);
    return;
  }

  const bounds = L.latLngBounds(points);
  map.fitBounds(bounds, { padding, maxZoom, animate: true });
}

export function serializeMapPoints(points: Array<[number, number]>): string {
  return points.map(([lat, lng]) => `${lat.toFixed(6)},${lng.toFixed(6)}`).join('|');
}
