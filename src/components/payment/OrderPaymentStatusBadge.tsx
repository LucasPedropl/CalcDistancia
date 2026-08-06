import type { DeliveryOrder } from '../../types/order';
import { getOrderPaymentStatusLabel, getOrderPaymentStatusTone } from '../../utils/orderPaymentDisplay';

interface OrderPaymentStatusBadgeProps {
  order: DeliveryOrder;
  className?: string;
}

const TONE_CLASSES = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  info: 'border-sky-200 bg-sky-50 text-sky-800',
} as const;

export function OrderPaymentStatusBadge({ order, className = '' }: OrderPaymentStatusBadgeProps) {
  const tone = getOrderPaymentStatusTone(order);
  const label = getOrderPaymentStatusLabel(order);

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${TONE_CLASSES[tone]} ${className}`}
    >
      {label}
    </span>
  );
}
