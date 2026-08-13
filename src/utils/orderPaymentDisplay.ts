import type { DeliveryOrder, OrderPaymentMethod, OrderPaymentResponsibility } from '../types/order';

export function resolvePaymentResponsibility(order: DeliveryOrder): OrderPaymentResponsibility {
  const raw = order.paymentResponsibility as string | undefined;
  // Pedidos antigos com SPLIT passam a ser cobrados do cliente.
  if (raw === 'ESTABLISHMENT') return 'ESTABLISHMENT';
  return 'CLIENT';
}

export const ORDER_PAYMENT_METHOD_LABELS: Record<OrderPaymentMethod, string> = {
  PIX: 'PIX',
  CARD: 'Cartão',
  BIXPAY: 'Bix Pay',
  OFFLINE: 'Fora da plataforma',
};

export function isOrderDeliveryPaid(order: DeliveryOrder): boolean {
  return order.paymentStatus === 'PAID';
}

export function getOrderPaymentStatusLabel(order: DeliveryOrder): string {
  if (isOrderDeliveryPaid(order)) {
    const method = order.paymentMethod ? ` · ${ORDER_PAYMENT_METHOD_LABELS[order.paymentMethod]}` : '';

    if (resolvePaymentResponsibility(order) === 'ESTABLISHMENT') {
      return `Pago pelo estabelecimento${method}`;
    }
    return `Pagamento confirmado${method}`;
  }

  if (resolvePaymentResponsibility(order) === 'CLIENT') return 'Aguardando pagamento do cliente';
  return 'Aguardando pagamento';
}

export function getOrderPaymentStatusTone(
  order: DeliveryOrder,
): 'success' | 'warning' | 'info' {
  if (isOrderDeliveryPaid(order)) return 'success';
  return resolvePaymentResponsibility(order) === 'ESTABLISHMENT' ? 'warning' : 'info';
}

export function isClientResponsibleForPayment(order: DeliveryOrder): boolean {
  return resolvePaymentResponsibility(order) === 'CLIENT';
}

/** Cliente final: cobrança após a entrega (e permanece visível se ainda não pagou). */
export function canShowClientTrackingPayment(order: DeliveryOrder | null | undefined): boolean {
  if (!order || order.status === 'CANCELLED') return false;
  if (isOrderDeliveryPaid(order)) return false;
  if (!isClientResponsibleForPayment(order)) return false;
  return order.status === 'COMPLETED';
}

export function canShowMotoboyDestinationPix(order: DeliveryOrder | null | undefined): boolean {
  if (!order) return false;
  if (isOrderDeliveryPaid(order)) return false;
  if (!isClientResponsibleForPayment(order)) return false;
  return order.status === 'PICKED_UP' || order.status === 'COMPLETED';
}

export function canShowEstablishmentOrderPayment(order: DeliveryOrder | null | undefined): boolean {
  if (!order) return false;
  if (isOrderDeliveryPaid(order)) return false;
  if (resolvePaymentResponsibility(order) !== 'ESTABLISHMENT') return false;
  return order.status === 'ACCEPTED' || order.status === 'PICKED_UP';
}
