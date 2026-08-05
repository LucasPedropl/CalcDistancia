import { getAllOrders, confirmPickup, completeOrder } from './orderService';
import { getSimulatedMotoboyPosition } from './motoboySimulationService';
import { calculateHaversineDistanceKm } from '../utils/distance';
import type { DeliveryOrder } from '../types/order';
import type { LocationPoint } from '../types';

const ARRIVAL_THRESHOLD_KM = 0.15;

function isNearPoint(lat: number, lng: number, point: LocationPoint): boolean {
  return calculateHaversineDistanceKm(lat, lng, point.lat, point.lng) <= ARRIVAL_THRESHOLD_KM;
}

function isNearPolylineEnd(
  lat: number,
  lng: number,
  polyline: [number, number][] | undefined,
): boolean {
  if (!polyline || polyline.length === 0) return false;
  const lastPoint = polyline[polyline.length - 1];
  return calculateHaversineDistanceKm(lat, lng, lastPoint[0], lastPoint[1]) <= ARRIVAL_THRESHOLD_KM;
}

function hasArrivedAtOrigin(order: DeliveryOrder, lat: number, lng: number): boolean {
  return (
    isNearPoint(lat, lng, order.origin) ||
    isNearPolylineEnd(lat, lng, order.pickupPolyline)
  );
}

function hasArrivedAtDestination(order: DeliveryOrder, lat: number, lng: number): boolean {
  return (
    isNearPoint(lat, lng, order.destination) ||
    isNearPolylineEnd(lat, lng, order.polyline)
  );
}

export function autoAdvanceSimulatedOrders(): void {
  for (const order of getAllOrders()) {
    if (!order.acceptedMotoboyId) continue;

    const position = getSimulatedMotoboyPosition(order.acceptedMotoboyId);
    if (!position) continue;

    const motoboyName = order.acceptedMotoboyName ?? 'Motoboy';

    if (order.status === 'ACCEPTED' && hasArrivedAtOrigin(order, position.lat, position.lng)) {
      confirmPickup(order.id, order.acceptedMotoboyId, motoboyName);
      continue;
    }

    if (order.status === 'PICKED_UP' && hasArrivedAtDestination(order, position.lat, position.lng)) {
      completeOrder(order.id, order.acceptedMotoboyId);
    }
  }
}
