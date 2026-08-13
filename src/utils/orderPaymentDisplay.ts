import type { DeliveryOrder, OrderPaymentMethod } from '../types/order';

export function resolvePaymentResponsibility(
  order: DeliveryOrder,
): NonNullable<DeliveryOrder['paymentResponsibility']> {
  return order.paymentResponsibility ?? 'CLIENT';
}

export const ORDER_PAYMENT_METHOD_LABELS: Record<OrderPaymentMethod, string> = {
  PIX: 'PIX',
  CARD: 'Cartão',
  BIXPAY: 'Bix Pay',
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

  const responsibility = resolvePaymentResponsibility(order);
  if (responsibility === 'CLIENT') return 'Cliente paga na entrega';
  if (responsibility === 'SPLIT') return 'Pagamento dividido na entrega';
  return 'Aguardando pagamento';
}

export function getOrderPaymentStatusTone(
  order: DeliveryOrder,
): 'success' | 'warning' | 'info' {
  if (isOrderDeliveryPaid(order)) return 'success';
  return resolvePaymentResponsibility(order) === 'ESTABLISHMENT' ? 'warning' : 'info';
}

/** Responsabilidades em que o pagamento é cobrado do cliente na entrega. */
function isClientPaidOnDelivery(order: DeliveryOrder): boolean {
  const responsibility = resolvePaymentResponsibility(order);
  return responsibility === 'CLIENT' || responsibility === 'SPLIT';
}

export function canShowClientTrackingPayment(order: DeliveryOrder | null | undefined): boolean {
  if (!order || order.status === 'CANCELLED' || order.status === 'COMPLETED') return false;
  if (isOrderDeliveryPaid(order)) return false;
  return isClientPaidOnDelivery(order);
}

export function canShowMotoboyDestinationPix(order: DeliveryOrder | null | undefined): boolean {
  if (!order) return false;
  if (isOrderDeliveryPaid(order)) return false;
  if (!isClientPaidOnDelivery(order)) return false;
  return order.status === 'PICKED_UP';
}

export function canShowEstablishmentOrderPayment(order: DeliveryOrder | null | undefined): boolean {
  if (!order) return false;
  if (isOrderDeliveryPaid(order)) return false;
  if (resolvePaymentResponsibility(order) !== 'ESTABLISHMENT') return false;
  return order.status === 'ACCEPTED' || order.status === 'PICKED_UP';
}
