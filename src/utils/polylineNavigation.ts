import { calculateHaversineDistanceKm } from './distance';

export function getPolylineTotalLengthKm(polyline: [number, number][]): number {
  let total = 0;
  for (let index = 1; index < polyline.length; index += 1) {
    total += calculateHaversineDistanceKm(
      polyline[index - 1][0],
      polyline[index - 1][1],
      polyline[index][0],
      polyline[index][1],
    );
  }
  return total;
}

export function interpolateAlongPolyline(
  polyline: [number, number][],
  distanceKmFromStart: number,
): { lat: number; lng: number; distanceKm: number; arrived: boolean } {
  if (polyline.length === 0) {
    return { lat: 0, lng: 0, distanceKm: 0, arrived: true };
  }

  if (polyline.length === 1) {
    return {
      lat: polyline[0][0],
      lng: polyline[0][1],
      distanceKm: 0,
      arrived: true,
    };
  }

  const total = getPolylineTotalLengthKm(polyline);
  if (distanceKmFromStart >= total) {
    const last = polyline[polyline.length - 1];
    return { lat: last[0], lng: last[1], distanceKm: total, arrived: true };
  }

  let accumulated = 0;
  for (let index = 1; index < polyline.length; index += 1) {
    const segmentLengthKm = calculateHaversineDistanceKm(
      polyline[index - 1][0],
      polyline[index - 1][1],
      polyline[index][0],
      polyline[index][1],
    );

    if (accumulated + segmentLengthKm >= distanceKmFromStart) {
      const remainingKm = distanceKmFromStart - accumulated;
      const ratio = segmentLengthKm === 0 ? 0 : remainingKm / segmentLengthKm;
      return {
        lat: polyline[index - 1][0] + (polyline[index][0] - polyline[index - 1][0]) * ratio,
        lng: polyline[index - 1][1] + (polyline[index][1] - polyline[index - 1][1]) * ratio,
        distanceKm: distanceKmFromStart,
        arrived: false,
      };
    }

    accumulated += segmentLengthKm;
  }

  const last = polyline[polyline.length - 1];
  return { lat: last[0], lng: last[1], distanceKm: total, arrived: true };
}

export function findDistanceAlongPolyline(
  polyline: [number, number][],
  lat: number,
  lng: number,
): number {
  if (polyline.length < 2) return 0;

  let bestDistanceKm = 0;
  let bestPointDistanceKm = Infinity;
  let accumulatedKm = 0;

  for (let index = 1; index < polyline.length; index += 1) {
    const segmentLengthKm = calculateHaversineDistanceKm(
      polyline[index - 1][0],
      polyline[index - 1][1],
      polyline[index][0],
      polyline[index][1],
    );
    const samples = Math.max(2, Math.ceil(segmentLengthKm * 20));

    for (let sample = 0; sample <= samples; sample += 1) {
      const ratio = sample / samples;
      const pointLat = polyline[index - 1][0] + (polyline[index][0] - polyline[index - 1][0]) * ratio;
      const pointLng = polyline[index - 1][1] + (polyline[index][1] - polyline[index - 1][1]) * ratio;
      const distanceToPointKm = calculateHaversineDistanceKm(lat, lng, pointLat, pointLng);

      if (distanceToPointKm < bestPointDistanceKm) {
        bestPointDistanceKm = distanceToPointKm;
        bestDistanceKm = accumulatedKm + segmentLengthKm * ratio;
      }
    }

    accumulatedKm += segmentLengthKm;
  }

  return bestDistanceKm;
}

export function createStraightPolyline(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
  segments = 10,
): [number, number][] {
  const points: [number, number][] = [];
  for (let index = 0; index <= segments; index += 1) {
    const ratio = index / segments;
    points.push([
      from.lat + (to.lat - from.lat) * ratio,
      from.lng + (to.lng - from.lng) * ratio,
    ]);
  }
  return points;
}

export function randomNearbyPoint(
  lat: number,
  lng: number,
  minKm: number,
  maxKm: number,
): { lat: number; lng: number } {
  const angle = Math.random() * Math.PI * 2;
  const distanceKm = minKm + Math.random() * (maxKm - minKm);
  const latDelta = (distanceKm / 111) * Math.cos(angle);
  const lngDelta = (distanceKm / (111 * Math.cos((lat * Math.PI) / 180))) * Math.sin(angle);
  return { lat: lat + latDelta, lng: lng + lngDelta };
}
