import { useCallback, useEffect, useState } from 'react';
import type { DeliveryOrder } from '../types/order';
import {
  getAllOrders,
  getActiveOrdersForClient,
  getActiveOrderForMotoboy,
  getActiveOrderForRecipient,
  getOrdersForCondominium,
  getOpenOrdersForMotoboy,
  getOrderById,
  subscribeToOrders,
} from '../services/orderService';
import type { LocationPoint } from '../types';

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
  const orders = useActiveOrdersForClient(clientId);
  return orders[0] ?? null;
}

export function useActiveOrdersForClient(clientId: string | undefined): DeliveryOrder[] {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);

  const refresh = useCallback(() => {
    if (!clientId) {
      setOrders([]);
      return;
    }
    setOrders(getActiveOrdersForClient(clientId));
  }, [clientId]);

  useEffect(() => {
    refresh();
    return subscribeToOrders(refresh);
  }, [refresh]);

  return orders;
}

export function useActiveOrderForRecipient(
  userId: string | undefined,
  phone?: string,
  homeAddress?: LocationPoint | null,
): DeliveryOrder | null {
  const [order, setOrder] = useState<DeliveryOrder | null>(null);

  const refresh = useCallback(() => {
    if (!userId) {
      setOrder(null);
      return;
    }
    setOrder(getActiveOrderForRecipient(userId, phone, homeAddress));
  }, [userId, phone, homeAddress]);

  useEffect(() => {
    refresh();
    return subscribeToOrders(refresh);
  }, [refresh]);

  return order;
}

export function useOrdersForCondominium(
  condominiumUserId: string | undefined,
  condominiumAddress?: LocationPoint | null,
): DeliveryOrder[] {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);

  const refresh = useCallback(() => {
    if (!condominiumUserId) {
      setOrders([]);
      return;
    }
    setOrders(getOrdersForCondominium(condominiumUserId, condominiumAddress));
  }, [condominiumUserId, condominiumAddress]);

  useEffect(() => {
    refresh();
    return subscribeToOrders(refresh);
  }, [refresh]);

  return orders;
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
