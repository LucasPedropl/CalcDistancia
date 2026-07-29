import { useEffect, useState } from 'react';
import type { DeliveryOrder } from '../types/order';
import type { RouteData } from '../types';
import { fetchRealRoadRoute } from '../services/geocodingService';
import { updateOrderRoute } from '../services/orderService';
import { buildRouteDataFromOrder } from '../utils/orderRoute';
import { isDetailedRoadPolyline } from '../utils/routePolyline';

export function useOrderRoadRoute(order: DeliveryOrder | null): {
  route: RouteData | null;
  isLoading: boolean;
} {
  const [route, setRoute] = useState<RouteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!order) {
      setRoute(null);
      setIsLoading(false);
      return;
    }

    if (isDetailedRoadPolyline(order.polyline)) {
      setRoute(buildRouteDataFromOrder(order));
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetchRealRoadRoute(order.origin, order.destination)
      .then((roadRoute) => {
        if (cancelled) return;
        setRoute(roadRoute);
        updateOrderRoute(order.id, {
          polyline: roadRoute.polyline,
          distanceKm: roadRoute.distanceKm,
          durationMin: roadRoute.durationMin,
        });
      })
      .catch((error) => {
        console.error('Falha ao buscar rota por estrada', error);
        if (!cancelled) {
          setRoute(buildRouteDataFromOrder(order));
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [order?.id, order?.origin.lat, order?.origin.lng, order?.destination.lat, order?.destination.lng]);

  return { route, isLoading };
}
