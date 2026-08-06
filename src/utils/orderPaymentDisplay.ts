import type { DeliveryOrder } from '../types/order';

export function resolvePaymentResponsibility(
  order: DeliveryOrder,
): NonNullable<DeliveryOrder['paymentResponsibility']> {
  return order.paymentResponsibility ?? 'CLIENT';
}

export function isOrderDeliveryPaid(order: DeliveryOrder): boolean {
  return order.paymentStatus === 'PAID';
}

export function getOrderPaymentStatusLabel(order: DeliveryOrder): string {
  if (isOrderDeliveryPaid(order)) {
    return resolvePaymentResponsibility(order) === 'ESTABLISHMENT'
      ? 'Pago pelo estabelecimento'
      : 'Pagamento confirmado';
  }

  const responsibility = resolvePaymentResponsibility(order);
  if (responsibility === 'CLIENT') return 'Cliente paga na entrega';
  return 'Aguardando pagamento';
}

export function getOrderPaymentStatusTone(
  order: DeliveryOrder,
): 'success' | 'warning' | 'info' {
  if (isOrderDeliveryPaid(order)) return 'success';
  return resolvePaymentResponsibility(order) === 'ESTABLISHMENT' ? 'warning' : 'info';
}

export function canShowClientTrackingPayment(order: DeliveryOrder | null | undefined): boolean {
  if (!order || order.status === 'CANCELLED' || order.status === 'COMPLETED') return false;
  if (isOrderDeliveryPaid(order)) return false;
  return resolvePaymentResponsibility(order) === 'CLIENT';
}

export function canShowMotoboyDestinationPix(order: DeliveryOrder | null | undefined): boolean {
  if (!order) return false;
  if (isOrderDeliveryPaid(order)) return false;
  if (resolvePaymentResponsibility(order) !== 'CLIENT') return false;
  return order.status === 'PICKED_UP';
}

export function canShowEstablishmentOrderPayment(order: DeliveryOrder | null | undefined): boolean {
  if (!order) return false;
  if (isOrderDeliveryPaid(order)) return false;
  if (resolvePaymentResponsibility(order) !== 'ESTABLISHMENT') return false;
  return order.status === 'ACCEPTED' || order.status === 'PICKED_UP';
}
