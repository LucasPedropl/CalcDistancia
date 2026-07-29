import { useCallback, useEffect, useState } from 'react';
import type { DeliveryOrder } from '../types/order';
import {
  getAllOrders,
  getActiveOrderForClient,
  getActiveOrderForMotoboy,
  getOpenOrdersForMotoboy,
  getOrderById,
  subscribeToOrders,
} from '../services/orderService';

export function useAllOrders(): DeliveryOrder[] {
  const [orders, setOrders] = useState<DeliveryOrder[]>(() => getAllOrders());

  const refresh = useCallback(() => {
    setOrders(getAllOrders());
  }, []);

  useEffect(() => {
    refresh();
    return subscribeToOrders(refresh);
  }, [refresh]);

  return orders;
}

export function useOpenOrdersForMotoboy(motoboyId: string | undefined): DeliveryOrder[] {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);

  const refresh = useCallback(() => {
    if (!motoboyId) {
      setOrders([]);
      return;
    }
    setOrders(getOpenOrdersForMotoboy(motoboyId));
  }, [motoboyId]);

  useEffect(() => {
    refresh();
    return subscribeToOrders(refresh);
  }, [refresh]);

  return orders;
}

export function useActiveOrderForMotoboy(motoboyId: string | undefined): DeliveryOrder | null {
  const [order, setOrder] = useState<DeliveryOrder | null>(null);

  const refresh = useCallback(() => {
    if (!motoboyId) {
      setOrder(null);
      return;
    }
    setOrder(getActiveOrderForMotoboy(motoboyId));
  }, [motoboyId]);

  useEffect(() => {
    refresh();
    return subscribeToOrders(refresh);
  }, [refresh]);

  return order;
}

export function useActiveOrderForClient(clientId: string | undefined): DeliveryOrder | null {
  const [order, setOrder] = useState<DeliveryOrder | null>(null);

  const refresh = useCallback(() => {
    if (!clientId) {
      setOrder(null);
      return;
    }
    setOrder(getActiveOrderForClient(clientId));
  }, [clientId]);

  useEffect(() => {
    refresh();
    return subscribeToOrders(refresh);
  }, [refresh]);

  return order;
}

export function useOrderTracker(orderId: string | null): DeliveryOrder | null {
  const [order, setOrder] = useState<DeliveryOrder | null>(() =>
    orderId ? getOrderById(orderId) ?? null : null
  );

  const refresh = useCallback(() => {
    if (!orderId) {
      setOrder(null);
      return;
    }
    setOrder(getOrderById(orderId) ?? null);
  }, [orderId]);

  useEffect(() => {
    refresh();
    return subscribeToOrders(refresh);
  }, [refresh]);

  return order;
}
