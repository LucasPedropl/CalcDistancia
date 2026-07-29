import type { DeliveryOrder, OrderAssignmentMode, OrderPaymentStatus } from '../types/order';
import type { LocationPoint } from '../types';
import { getMotoboyById, updateMotoboyStatus } from './motoboyService';

const ORDERS_STORAGE_KEY = 'calc_distancia_orders';
const ORDERS_UPDATED_EVENT = 'calc-distancia-orders-updated';

function loadOrdersFromStorage(): DeliveryOrder[] {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DeliveryOrder[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveOrdersToStorage(orders: DeliveryOrder[]): void {
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  window.dispatchEvent(new CustomEvent(ORDERS_UPDATED_EVENT));
}

function generateOrderId(): string {
  return `PED-${Date.now().toString(36).toUpperCase()}`;
}

export interface CreateOrderInput {
  clientId: string;
  clientName: string;
  origin: LocationPoint;
  destination: LocationPoint;
  distanceKm: number;
  durationMin: number;
  price: number | null;
  tierLabel?: string;
  trackingPhone?: string;
  assignmentMode: OrderAssignmentMode;
  targetMotoboyId?: string;
  polyline?: [number, number][];
}

export function createOrder(input: CreateOrderInput): DeliveryOrder {
  const targetMotoboy = input.targetMotoboyId
    ? getMotoboyById(input.targetMotoboyId)
    : undefined;

  const order: DeliveryOrder = {
    id: generateOrderId(),
    clientId: input.clientId,
    clientName: input.clientName,
    origin: input.origin,
    destination: input.destination,
    distanceKm: input.distanceKm,
    durationMin: input.durationMin,
    price: input.price,
    tierLabel: input.tierLabel,
    trackingPhone: input.trackingPhone,
    status: 'PENDING',
    assignmentMode: input.assignmentMode,
    targetMotoboyId: input.targetMotoboyId,
    targetMotoboyName: targetMotoboy?.name,
    polyline: input.polyline,
    createdAt: new Date().toISOString(),
  };

  const orders = loadOrdersFromStorage();
  orders.unshift(order);
  saveOrdersToStorage(orders);
  return order;
}

export function getAllOrders(): DeliveryOrder[] {
  return loadOrdersFromStorage();
}

export function getOrderById(orderId: string): DeliveryOrder | undefined {
  return loadOrdersFromStorage().find((order) => order.id === orderId);
}

export function getActiveOrderForClient(clientId: string): DeliveryOrder | null {
  return (
    loadOrdersFromStorage().find(
      (order) =>
        order.clientId === clientId &&
        (order.status === 'PENDING' ||
          order.status === 'ACCEPTED' ||
          order.status === 'PICKED_UP'),
    ) ?? null
  );
}

export function getActiveOrderForMotoboy(motoboyId: string): DeliveryOrder | null {
  return (
    loadOrdersFromStorage().find(
      (order) =>
        (order.status === 'ACCEPTED' || order.status === 'PICKED_UP') &&
        order.acceptedMotoboyId === motoboyId,
    ) ?? null
  );
}

export function getOpenOrdersForMotoboy(motoboyId: string): DeliveryOrder[] {
  const hasActiveOrder = getActiveOrderForMotoboy(motoboyId) !== null;

  return loadOrdersFromStorage().filter((order) => {
    if (order.status !== 'PENDING') return false;

    if (hasActiveOrder) {
      return order.assignmentMode === 'DIRECT' && order.targetMotoboyId === motoboyId;
    }

    if (order.assignmentMode === 'BROADCAST') return true;
    return order.targetMotoboyId === motoboyId;
  });
}

export interface UpdateOrderRouteInput {
  polyline: [number, number][];
  distanceKm: number;
  durationMin: number;
}

export function updateOrderRoute(orderId: string, route: UpdateOrderRouteInput): DeliveryOrder | null {
  const orders = loadOrdersFromStorage();
  const orderIndex = orders.findIndex((order) => order.id === orderId);
  if (orderIndex === -1) return null;

  const updatedOrder: DeliveryOrder = {
    ...orders[orderIndex],
    polyline: route.polyline,
    distanceKm: route.distanceKm,
    durationMin: route.durationMin,
  };

  orders[orderIndex] = updatedOrder;
  saveOrdersToStorage(orders);
  return updatedOrder;
}

export function acceptOrder(
  orderId: string,
  motoboyId: string,
  motoboyName: string,
  routePolyline?: [number, number][],
): DeliveryOrder | null {
  const orders = loadOrdersFromStorage();
  const orderIndex = orders.findIndex((order) => order.id === orderId);

  if (orderIndex === -1) return null;

  const order = orders[orderIndex];

  if (order.status !== 'PENDING') return null;
  if (order.assignmentMode === 'DIRECT' && order.targetMotoboyId !== motoboyId) return null;

  const updatedOrder: DeliveryOrder = {
    ...order,
    status: 'ACCEPTED',
    acceptedMotoboyId: motoboyId,
    acceptedMotoboyName: motoboyName,
    acceptedAt: new Date().toISOString(),
    ...(routePolyline && routePolyline.length > 0 ? { polyline: routePolyline } : {}),
  };

  orders[orderIndex] = updatedOrder;
  saveOrdersToStorage(orders);
  updateMotoboyStatus(motoboyId, 'BUSY');
  return updatedOrder;
}

export function confirmPickup(
  orderId: string,
  motoboyId: string,
  motoboyName: string,
  payment?: { invoiceId?: string; pixEmv?: string },
): DeliveryOrder | null {
  const orders = loadOrdersFromStorage();
  const orderIndex = orders.findIndex((order) => order.id === orderId);
  if (orderIndex === -1) return null;

  const order = orders[orderIndex];
  if (order.status !== 'PENDING' && order.status !== 'ACCEPTED') return null;

  const updatedOrder: DeliveryOrder = {
    ...order,
    status: 'PICKED_UP',
    pickedUpMotoboyId: motoboyId,
    pickedUpMotoboyName: motoboyName,
    pickedUpAt: new Date().toISOString(),
    paymentStatus: payment?.pixEmv ? 'PENDING' : order.paymentStatus ?? 'NONE',
    pixInvoiceId: payment?.invoiceId ?? order.pixInvoiceId,
    pixEmv: payment?.pixEmv ?? order.pixEmv,
    acceptedMotoboyId: order.acceptedMotoboyId ?? motoboyId,
    acceptedMotoboyName: order.acceptedMotoboyName ?? motoboyName,
  };

  orders[orderIndex] = updatedOrder;
  saveOrdersToStorage(orders);
  updateMotoboyStatus(motoboyId, 'BUSY');
  return updatedOrder;
}

export function markOrderPaymentPaid(orderId: string): DeliveryOrder | null {
  const orders = loadOrdersFromStorage();
  const orderIndex = orders.findIndex((order) => order.id === orderId);
  if (orderIndex === -1) return null;

  const updatedOrder: DeliveryOrder = {
    ...orders[orderIndex],
    paymentStatus: 'PAID' as OrderPaymentStatus,
    paidAt: new Date().toISOString(),
  };

  orders[orderIndex] = updatedOrder;
  saveOrdersToStorage(orders);
  return updatedOrder;
}

export function completeOrder(orderId: string, motoboyId: string): DeliveryOrder | null {
  const orders = loadOrdersFromStorage();
  const orderIndex = orders.findIndex((order) => order.id === orderId);
  if (orderIndex === -1) return null;

  const order = orders[orderIndex];
  if (order.status !== 'ACCEPTED' && order.status !== 'PICKED_UP') return null;
  if (order.acceptedMotoboyId && order.acceptedMotoboyId !== motoboyId) return null;

  const updatedOrder: DeliveryOrder = {
    ...order,
    status: 'COMPLETED',
    completedAt: new Date().toISOString(),
  };

  orders[orderIndex] = updatedOrder;
  saveOrdersToStorage(orders);
  updateMotoboyStatus(motoboyId, 'ONLINE');
  return updatedOrder;
}

export function cancelOrder(
  orderId: string,
  cancelledBy: 'CLIENT' | 'MOTOBOY',
): DeliveryOrder | null {
  const orders = loadOrdersFromStorage();
  const orderIndex = orders.findIndex((order) => order.id === orderId);
  if (orderIndex === -1) return null;

  const order = orders[orderIndex];
  if (
    order.status !== 'PENDING' &&
    order.status !== 'ACCEPTED' &&
    order.status !== 'PICKED_UP'
  ) {
    return null;
  }

  const updatedOrder: DeliveryOrder = {
    ...order,
    status: 'CANCELLED',
    cancelledBy,
    cancelledAt: new Date().toISOString(),
  };

  orders[orderIndex] = updatedOrder;
  saveOrdersToStorage(orders);

  if (order.acceptedMotoboyId) {
    updateMotoboyStatus(order.acceptedMotoboyId, 'ONLINE');
  }
  if (order.pickedUpMotoboyId && order.pickedUpMotoboyId !== order.acceptedMotoboyId) {
    updateMotoboyStatus(order.pickedUpMotoboyId, 'ONLINE');
  }

  return updatedOrder;
}

export function subscribeToOrders(callback: () => void): () => void {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === ORDERS_STORAGE_KEY) callback();
  };

  const handleCustom = () => callback();

  window.addEventListener('storage', handleStorage);
  window.addEventListener(ORDERS_UPDATED_EVENT, handleCustom);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(ORDERS_UPDATED_EVENT, handleCustom);
  };
}
