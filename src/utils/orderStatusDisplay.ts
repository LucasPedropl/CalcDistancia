import type { DeliveryOrder } from '../types/order';

export const ORDER_STATUS_LABELS: Record<DeliveryOrder['status'], string> = {
  PENDING: 'Aguardando motoboy',
  ACCEPTED: 'Aceita',
  PICKED_UP: 'Em rota',
  COMPLETED: 'Entregue',
  CANCELLED: 'Cancelada',
};

export type OrderStatusTone = 'neutral' | 'info' | 'success' | 'danger';

const STATUS_TONES: Record<DeliveryOrder['status'], OrderStatusTone> = {
  PENDING: 'neutral',
  ACCEPTED: 'info',
  PICKED_UP: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

export function getOrderStatusTone(status: DeliveryOrder['status']): OrderStatusTone {
  return STATUS_TONES[status];
}

const TONE_CLASSES: Record<OrderStatusTone, { light: string; dark: string }> = {
  neutral: {
    light: 'border-slate-200 bg-slate-100 text-slate-600',
    dark: 'border-zinc-800 bg-zinc-900 text-zinc-300',
  },
  info: {
    light: 'border-sky-200 bg-sky-50 text-sky-700',
    dark: 'border-sky-900/60 bg-sky-950/30 text-sky-300',
  },
  success: {
    light: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    dark: 'border-emerald-900/60 bg-emerald-950/30 text-emerald-300',
  },
  danger: {
    light: 'border-red-200 bg-red-50 text-red-700',
    dark: 'border-red-900/60 bg-red-950/30 text-red-300',
  },
};

export function getOrderStatusBadgeClass(
  status: DeliveryOrder['status'],
  isDark: boolean,
): string {
  const tone = TONE_CLASSES[getOrderStatusTone(status)];
  return isDark ? tone.dark : tone.light;
}

/** Data mais relevante do histórico: conclusão, cancelamento ou criação. */
export function getOrderHistoryDate(order: DeliveryOrder): string {
  return order.completedAt ?? order.cancelledAt ?? order.createdAt;
}

export function formatOrderHistoryDate(order: DeliveryOrder): string {
  return new Date(getOrderHistoryDate(order)).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
