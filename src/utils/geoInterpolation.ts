import { calculateHaversineDistanceKm } from './distance';

export function moveTowardPoint(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  stepKm: number,
): { lat: number; lng: number; arrived: boolean } {
  const distanceKm = calculateHaversineDistanceKm(fromLat, fromLng, toLat, toLng);

  if (distanceKm <= stepKm || distanceKm === 0) {
    return { lat: toLat, lng: toLng, arrived: true };
  }

  const ratio = stepKm / distanceKm;
  return {
    lat: fromLat + (toLat - fromLat) * ratio,
    lng: fromLng + (toLng - fromLng) * ratio,
    arrived: false,
  };
}

export function randomWanderStep(
  lat: number,
  lng: number,
  maxStepKm = 0.08,
): { lat: number; lng: number } {
  const angle = Math.random() * Math.PI * 2;
  const stepKm = maxStepKm * (0.3 + Math.random() * 0.7);
  const latDelta = (stepKm / 111) * Math.cos(angle);
  const lngDelta = (stepKm / (111 * Math.cos((lat * Math.PI) / 180))) * Math.sin(angle);

  return {
    lat: lat + latDelta,
    lng: lng + lngDelta,
  };
}
