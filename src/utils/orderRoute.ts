import type { RouteData } from '../types';
import type { DeliveryOrder } from '../types/order';

export function buildRouteDataFromOrder(
  order: DeliveryOrder,
  polylineOverride?: [number, number][],
): RouteData {
  const polyline =
    polylineOverride ??
    order.polyline ??
    ([
      [order.origin.lat, order.origin.lng],
      [order.destination.lat, order.destination.lng],
    ] as [number, number][]);

  return {
    origin: order.origin,
    destination: order.destination,
    distanceKm: order.distanceKm,
    durationMin: order.durationMin,
    polyline,
  };
}
