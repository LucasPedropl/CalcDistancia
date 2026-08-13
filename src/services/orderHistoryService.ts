import type { DeliveryOrder } from '../types/order';
import type { LocationPoint } from '../types';
import { calculateHaversineDistanceKm } from '../utils/distance';
import { getAllOrders } from './orderService';

export type OrderHistoryFilter = 'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface OrderHistorySummary {
  total: number;
  active: number;
  completed: number;
  cancelled: number;
  /** Soma dos valores das corridas concluídas */
  completedAmount: number;
  /** Soma dos valores já pagos, em qualquer status */
  paidAmount: number;
}

const CONDOMINIUM_MATCH_RADIUS_KM = 0.5;

function sortByRecent(orders: DeliveryOrder[]): DeliveryOrder[] {
  return [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

/** Histórico do estabelecimento que criou os pedidos. */
export function getOrderHistoryForEstablishment(clientId: string): DeliveryOrder[] {
  return sortByRecent(getAllOrders().filter((order) => order.clientId === clientId));
}

/** Histórico do motoboy: corridas que ele aceitou ou coletou. */
export function getOrderHistoryForMotoboy(motoboyId: string): DeliveryOrder[] {
  return sortByRecent(
    getAllOrders().filter(
      (order) =>
        order.acceptedMotoboyId === motoboyId || order.pickedUpMotoboyId === motoboyId,
    ),
  );
}

/**
 * Histórico do condomínio: entregas vinculadas ao cadastro ou com destino a até
 * 500 m da portaria, incluindo concluídas e canceladas.
 */
export function getOrderHistoryForCondominium(
  condominiumId: string,
  condominiumAddress?: LocationPoint | null,
): DeliveryOrder[] {
  return sortByRecent(
    getAllOrders().filter((order) => {
      if (order.condominiumId === condominiumId) return true;
      if (!condominiumAddress) return false;

      const distanceKm = calculateHaversineDistanceKm(
        order.destination.lat,
        order.destination.lng,
        condominiumAddress.lat,
        condominiumAddress.lng,
      );

      return distanceKm <= CONDOMINIUM_MATCH_RADIUS_KM;
    }),
  );
}

/** Histórico completo, usado pela retaguarda. */
export function getOrderHistoryForPlatform(): DeliveryOrder[] {
  return sortByRecent(getAllOrders());
}

export function filterOrderHistory(
  orders: DeliveryOrder[],
  filter: OrderHistoryFilter,
): DeliveryOrder[] {
  if (filter === 'ALL') return orders;
  if (filter === 'COMPLETED') return orders.filter((order) => order.status === 'COMPLETED');
  if (filter === 'CANCELLED') return orders.filter((order) => order.status === 'CANCELLED');

  return orders.filter(
    (order) =>
      order.status === 'PENDING' || order.status === 'ACCEPTED' || order.status === 'PICKED_UP',
  );
}

export function summarizeOrderHistory(orders: DeliveryOrder[]): OrderHistorySummary {
  return orders.reduce<OrderHistorySummary>(
    (summary, order) => {
      const price = order.price ?? 0;

      return {
        total: summary.total + 1,
        active: summary.active + (filterOrderHistory([order], 'ACTIVE').length > 0 ? 1 : 0),
        completed: summary.completed + (order.status === 'COMPLETED' ? 1 : 0),
        cancelled: summary.cancelled + (order.status === 'CANCELLED' ? 1 : 0),
        completedAmount: summary.completedAmount + (order.status === 'COMPLETED' ? price : 0),
        paidAmount: summary.paidAmount + (order.paymentStatus === 'PAID' ? price : 0),
      };
    },
    {
      total: 0,
      active: 0,
      completed: 0,
      cancelled: 0,
      completedAmount: 0,
      paidAmount: 0,
    },
  );
}

export function searchOrderHistory(orders: DeliveryOrder[], term: string): DeliveryOrder[] {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return orders;

  return orders.filter((order) =>
    [
      order.trackingCode,
      order.recipientClientName,
      order.recipientClientPhone,
      order.condominiumName,
      order.acceptedMotoboyName,
      order.clientName,
      order.destination.address,
    ]
      .filter((field): field is string => Boolean(field))
      .some((field) => field.toLowerCase().includes(normalized)),
  );
}
