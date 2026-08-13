import { useEffect, useState } from 'react';
import type { DeliveryOrder } from '../../../types/order';
import { canShowClientTrackingPayment } from '../../../utils/orderPaymentDisplay';
import { OrderPixPaymentModal } from '../../../components/payment/OrderPixPaymentModal';

interface ClientePostDeliveryPaymentGateProps {
  order: DeliveryOrder;
}

/**
 * Após a entrega, abre o pagamento no centro da tela se o cliente ainda não pagou.
 */
export function ClientePostDeliveryPaymentGate({ order }: ClientePostDeliveryPaymentGateProps) {
  const needsPayment = canShowClientTrackingPayment(order);
  const [isOpen, setIsOpen] = useState(needsPayment);
  const [autoOpenedForOrderId, setAutoOpenedForOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!needsPayment) {
      setIsOpen(false);
      return;
    }
    if (autoOpenedForOrderId !== order.id) {
      setIsOpen(true);
      setAutoOpenedForOrderId(order.id);
    }
  }, [needsPayment, order.id, autoOpenedForOrderId]);

  if (!needsPayment) return null;

  return (
    <OrderPixPaymentModal
      orderId={order.id}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      theme="light"
      payerLabel="Cliente final"
      guestBixPay
    />
  );
}
