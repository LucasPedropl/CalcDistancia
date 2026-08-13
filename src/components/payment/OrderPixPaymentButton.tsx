import { useState } from 'react';
import { CheckCircle2, QrCode } from 'lucide-react';
import type { DeliveryOrder } from '../../types/order';
import type { ThemeMode } from '../../types';
import { canShowOrderPixPayment } from '../../services/orderPaymentService';
import { useOrderTracker } from '../../hooks/useOrders';
import { OrderPixPaymentModal } from './OrderPixPaymentModal';

interface OrderPixPaymentButtonProps {
  order: DeliveryOrder;
  theme?: ThemeMode;
  payerLabel?: string;
  variant?: 'motoboy' | 'client' | 'tracking';
  className?: string;
}

export function OrderPixPaymentButton({
  order: initialOrder,
  theme = 'light',
  payerLabel,
  variant = 'client',
  className = '',
}: OrderPixPaymentButtonProps) {
  const isDark = theme === 'dark';
  const [isOpen, setIsOpen] = useState(false);
  const order = useOrderTracker(initialOrder.id) ?? initialOrder;
  const isPaid = order.paymentStatus === 'PAID';

  if (!canShowOrderPixPayment(order, variant)) return null;

  const label = variant === 'motoboy' ? 'Cobrar o cliente' : 'Pagar entrega';
  const Icon = isPaid ? CheckCircle2 : QrCode;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        disabled={isPaid}
        className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-colors disabled:cursor-default ${
          isPaid
            ? isDark
              ? 'border border-emerald-800 bg-emerald-950/30 text-emerald-400'
              : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
            : isDark
              ? 'bg-white text-black hover:bg-zinc-200'
              : 'bg-slate-900 text-white hover:bg-slate-800'
        } ${className}`}
      >
        <Icon className="h-4 w-4" />
        {label}
      </button>

      <OrderPixPaymentModal
        orderId={order.id}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        theme={theme}
        payerLabel={payerLabel}
      />
    </>
  );
}
