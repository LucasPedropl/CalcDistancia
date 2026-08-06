import { paymentApi } from './paymentApi';
import { createPaymentRecord, markPaymentPaid } from './paymentRecordService';
import {
  attachPixPaymentToOrder,
  getOrderById,
  markOrderPaymentPaid,
} from './orderService';
import type { DeliveryOrder } from '../types/order';
import {
  canShowClientTrackingPayment,
  canShowEstablishmentOrderPayment,
  canShowMotoboyDestinationPix,
} from '../utils/orderPaymentDisplay';

const DEFAULT_PIX_AMOUNT = 25;

function resolveOrderAmount(order: DeliveryOrder): number {
  if (order.price !== null && order.price > 0) return order.price;
  return DEFAULT_PIX_AMOUNT;
}

function resolvePayerPhone(order: DeliveryOrder): string {
  return order.trackingPhone ?? order.recipientClientPhone ?? '27999999999';
}

export async function ensureOrderPixPayment(order: DeliveryOrder): Promise<DeliveryOrder> {
  if (order.pixEmv && order.paymentStatus !== 'PAID') {
    return order;
  }

  if (order.paymentStatus === 'PAID') {
    return order;
  }

  const amount = resolveOrderAmount(order);
  const pix = await paymentApi.gerarPix({
    valor: amount,
    descricao: `Entrega ${order.trackingCode} — ${order.destination.address}`,
    telefoneCliente: resolvePayerPhone(order),
    nomeCliente: order.recipientClientName ?? order.clientName,
    orderId: order.id,
    origem: order.origin.address,
    destino: order.destination.address,
  });

  createPaymentRecord({
    orderId: order.id,
    invoiceId: pix.invoiceId,
    externalCode: pix.externalCode,
    amountCents: Math.round(amount * 100),
    pixEmv: pix.pixCopiaECola,
  });

  const updated = attachPixPaymentToOrder(order.id, {
    invoiceId: pix.invoiceId,
    pixEmv: pix.pixCopiaECola,
  });

  return updated ?? { ...order, pixEmv: pix.pixCopiaECola, paymentStatus: 'PENDING' };
}

export function simulateOrderPixPaymentConfirmed(orderId: string): DeliveryOrder | null {
  markPaymentPaid(orderId);
  return markOrderPaymentPaid(orderId);
}

export function canShowOrderPixPayment(
  order: DeliveryOrder | null | undefined,
  variant: 'motoboy' | 'client' | 'tracking' = 'tracking',
): boolean {
  if (!order) return false;

  if (variant === 'motoboy') {
    return canShowMotoboyDestinationPix(order);
  }

  if (variant === 'client') {
    return canShowEstablishmentOrderPayment(order);
  }

  return canShowClientTrackingPayment(order);
}

export function getOrderPixAmount(order: DeliveryOrder): number {
  return resolveOrderAmount(order);
}

export function refreshOrderById(orderId: string): DeliveryOrder | null {
  return getOrderById(orderId) ?? null;
}
