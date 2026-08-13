import { useCallback, useEffect, useState } from 'react';
import type { DeliveryOrder } from '../types/order';
import type { LocationPoint } from '../types';
import {
  getOrderHistoryForCondominium,
  getOrderHistoryForEstablishment,
  getOrderHistoryForMotoboy,
  getOrderHistoryForPlatform,
} from '../services/orderHistoryService';
import { subscribeToOrders } from '../services/orderService';

function useReactiveHistory(load: () => DeliveryOrder[]): DeliveryOrder[] {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);

  const refresh = useCallback(() => {
    setOrders(load());
  }, [load]);

  useEffect(() => {
    refresh();
    return subscribeToOrders(refresh);
  }, [refresh]);

  return orders;
}

export function useEstablishmentOrderHistory(clientId: string | undefined): DeliveryOrder[] {
  const load = useCallback(
    () => (clientId ? getOrderHistoryForEstablishment(clientId) : []),
    [clientId],
  );

  return useReactiveHistory(load);
}

export function useMotoboyOrderHistory(motoboyId: string | undefined): DeliveryOrder[] {
  const load = useCallback(
    () => (motoboyId ? getOrderHistoryForMotoboy(motoboyId) : []),
    [motoboyId],
  );

  return useReactiveHistory(load);
}

export function useCondominiumOrderHistory(
  condominiumId: string | undefined,
  condominiumAddress?: LocationPoint | null,
): DeliveryOrder[] {
  const load = useCallback(
    () => (condominiumId ? getOrderHistoryForCondominium(condominiumId, condominiumAddress) : []),
    [condominiumId, condominiumAddress],
  );

  return useReactiveHistory(load);
}

export function usePlatformOrderHistory(): DeliveryOrder[] {
  return useReactiveHistory(getOrderHistoryForPlatform);
}
