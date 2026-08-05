import type { DeliveryOrder, OrderAssignmentMode, OrderPaymentStatus } from '../types/order';
import type { LocationPoint } from '../types';
import { getMotoboyById, getAvailableMotoboys, updateMotoboyStatus } from './motoboyService';
import { DEFAULT_MOTOBOY_RADIUS_KM, loadMotoboyProfile } from './motoboyProfileService';
import { calculateHaversineDistanceKm } from '../utils/distance';
import { isOrderReachableForMotoboy } from '../utils/orderReachability';
import { findClientIdByPhone, phonesMatch } from './clientProfileService';
import { findCondominiumAtDestination, loadCondominiumProfile } from './condominiumService';
import { resetMotoboySimulation } from './motoboySimulationService';

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

function generateTrackingCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let index = 0; index < 8; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

function ensureUniqueTrackingCode(existingOrders: DeliveryOrder[]): string {
  const used = new Set(existingOrders.map((order) => order.trackingCode).filter(Boolean));
  let code = generateTrackingCode();
  while (used.has(code)) {
    code = generateTrackingCode();
  }
  return code;
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
  recipientClientId?: string;
  recipientClientName?: string;
  condominiumId?: string | null;
  condominiumName?: string;
}

export function createOrder(input: CreateOrderInput): DeliveryOrder {
  const targetMotoboy = input.targetMotoboyId
    ? getMotoboyById(input.targetMotoboyId)
    : undefined;

  const recipientClientId =
    input.recipientClientId ??
    (input.trackingPhone ? findClientIdByPhone(input.trackingPhone) : undefined);

  let condominiumId: string | undefined;
  let condominiumName: string | undefined;

  if (input.condominiumId === null) {
    condominiumId = undefined;
    condominiumName = undefined;
  } else if (input.condominiumId) {
    const profile = loadCondominiumProfile(input.condominiumId);
    condominiumId = input.condominiumId;
    condominiumName = input.condominiumName ?? profile?.name;
  } else {
    const auto = findCondominiumAtDestination(input.destination);
    condominiumId = auto?.userId;
    condominiumName = auto?.name;
  }

  const orders = loadOrdersFromStorage();

  const order: DeliveryOrder = {
    id: generateOrderId(),
    clientId: input.clientId,
    clientName: input.clientName,
    recipientClientId,
    recipientClientName: input.recipientClientName ?? 'Cliente',
    recipientClientPhone: input.trackingPhone,
    condominiumId,
    condominiumName,
    origin: input.origin,
    destination: input.destination,
    distanceKm: input.distanceKm,
    durationMin: input.durationMin,
    price: input.price,
    tierLabel: input.tierLabel,
    trackingPhone: input.trackingPhone,
    trackingCode: ensureUniqueTrackingCode(orders),
    status: 'PENDING',
    assignmentMode: input.assignmentMode,
    targetMotoboyId: input.targetMotoboyId,
    targetMotoboyName: targetMotoboy?.name,
    polyline: input.polyline,
    createdAt: new Date().toISOString(),
  };

  orders.unshift(order);
  saveOrdersToStorage(orders);
  return order;
}

export function getOrderByTrackingCode(trackingCode: string): DeliveryOrder | undefined {
  const normalized = trackingCode.trim().toUpperCase();
  return loadOrdersFromStorage().find(
    (order) => order.trackingCode?.toUpperCase() === normalized,
  );
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
  const motoboy = getMotoboyById(motoboyId);
  const profile = loadMotoboyProfile(motoboyId);
  const maxRadiusKm = profile?.raioKm ?? DEFAULT_MOTOBOY_RADIUS_KM;

  return loadOrdersFromStorage().filter((order) => {
    if (order.status !== 'PENDING') return false;

    if (hasActiveOrder) {
      return order.assignmentMode === 'DIRECT' && order.targetMotoboyId === motoboyId;
    }

    const matchesAssignment =
      order.assignmentMode === 'BROADCAST' || order.targetMotoboyId === motoboyId;
    if (!matchesAssignment) return false;

    const distanceToOriginKm = motoboy
      ? calculateHaversineDistanceKm(
          motoboy.lat,
          motoboy.lng,
          order.origin.lat,
          order.origin.lng,
        )
      : Number.POSITIVE_INFINITY;

    return isOrderReachableForMotoboy(
      order,
      motoboyId,
      profile,
      distanceToOriginKm,
      maxRadiusKm,
    );
  });
}

export interface UpdateOrderRouteInput {
  polyline: [number, number][];
  distanceKm: number;
  durationMin: number;
}

export function updateOrderPickupRoute(
  orderId: string,
  pickupPolyline: [number, number][],
): DeliveryOrder | null {
  const orders = loadOrdersFromStorage();
  const orderIndex = orders.findIndex((order) => order.id === orderId);
  if (orderIndex === -1) return null;

  const updatedOrder: DeliveryOrder = {
    ...orders[orderIndex],
    pickupPolyline,
  };

  orders[orderIndex] = updatedOrder;
  saveOrdersToStorage(orders);
  return updatedOrder;
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
  resetMotoboySimulation(motoboyId);
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
    resetMotoboySimulation(order.acceptedMotoboyId);
  }
  if (order.pickedUpMotoboyId && order.pickedUpMotoboyId !== order.acceptedMotoboyId) {
    updateMotoboyStatus(order.pickedUpMotoboyId, 'ONLINE');
    resetMotoboySimulation(order.pickedUpMotoboyId);
  }

  return updatedOrder;
}

function isOrderForRecipient(
  order: DeliveryOrder,
  userId: string,
  phone?: string,
  homeAddress?: LocationPoint | null,
): boolean {
  if (order.recipientClientId === userId) return true;

  const orderPhone = order.recipientClientPhone ?? order.trackingPhone;
  if (phonesMatch(orderPhone, phone)) return true;

  if (homeAddress) {
    const distanceKm = calculateHaversineDistanceKm(
      order.destination.lat,
      order.destination.lng,
      homeAddress.lat,
      homeAddress.lng,
    );
    if (distanceKm <= 0.3) return true;
  }

  return false;
}

export function getActiveOrderForRecipient(
  userId: string,
  phone?: string,
  homeAddress?: LocationPoint | null,
): DeliveryOrder | null {
  return (
    loadOrdersFromStorage().find(
      (order) =>
        isOrderForRecipient(order, userId, phone, homeAddress) &&
        (order.status === 'PENDING' ||
          order.status === 'ACCEPTED' ||
          order.status === 'PICKED_UP'),
    ) ?? null
  );
}

export function getOrdersForCondominium(
  condominiumUserId: string,
  condominiumAddress?: LocationPoint | null,
): DeliveryOrder[] {
  return loadOrdersFromStorage().filter((order) => {
    if (order.status === 'CANCELLED' || order.status === 'COMPLETED') return false;
    if (order.condominiumId === condominiumUserId) return true;

    if (!condominiumAddress) return false;

    const distanceKm = calculateHaversineDistanceKm(
      order.destination.lat,
      order.destination.lng,
      condominiumAddress.lat,
      condominiumAddress.lng,
    );

    return distanceKm <= 0.5;
  });
}

export function simulateOrderAcceptance(orderId: string): DeliveryOrder | null {
  const order = getOrderById(orderId);
  if (!order || order.status !== 'PENDING') return null;

  const candidates = getAvailableMotoboys()
    .filter(
      (motoboy) =>
        order.assignmentMode === 'BROADCAST' || motoboy.id === order.targetMotoboyId,
    )
    .map((motoboy) => ({
      motoboy,
      distanceKm: calculateHaversineDistanceKm(
        motoboy.lat,
        motoboy.lng,
        order.origin.lat,
        order.origin.lng,
      ),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const nearest = candidates[0]?.motoboy;
  if (!nearest) return null;

  const accepted = acceptOrder(orderId, nearest.id, nearest.name, order.polyline);
  if (accepted) {
    void import('./orderRoutePlanning').then(({ fetchAndSaveOrderPickupRoute }) =>
      fetchAndSaveOrderPickupRoute(accepted.id, nearest.lat, nearest.lng),
    );
  }
  return accepted;
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
