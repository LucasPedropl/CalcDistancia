import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CreditCard, QrCode, Wallet, X } from 'lucide-react';
import type { DeliveryOrder, OrderPaymentMethod } from '../../types/order';
import type { ThemeMode } from '../../types';
import {
  ensureOrderPixPayment,
  getOrderPixAmount,
  simulateOrderPixPaymentConfirmed,
} from '../../services/orderPaymentService';
import { useOrderTracker } from '../../hooks/useOrders';
import { OrderPixPaymentBody } from './OrderPixPaymentBody';

interface OrderPixPaymentModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
  theme?: ThemeMode;
  payerLabel?: string;
  guestBixPay?: boolean;
  requirePayment?: boolean;
  onPaymentConfirmed?: (order: DeliveryOrder) => void;
}

const TAB_OPTIONS = [
  { id: 'PIX' as const, label: 'PIX', icon: QrCode },
  { id: 'CARD' as const, label: 'Cartão', icon: CreditCard },
  { id: 'BIXPAY' as const, label: 'Bix Pay', icon: Wallet },
];

export function OrderPixPaymentModal({
  orderId,
  isOpen,
  onClose,
  theme = 'light',
  payerLabel = 'Cliente',
  guestBixPay = false,
  requirePayment = false,
  onPaymentConfirmed,
}: OrderPixPaymentModalProps) {
  const isDark = theme === 'dark';
  const order = useOrderTracker(orderId);
  const [tab, setTab] = useState<OrderPaymentMethod>('PIX');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTab('PIX');
      setError(null);
      setCopied(false);
      return;
    }

    if (!order || order.pixEmv || order.paymentStatus === 'PAID') return;

    setIsGenerating(true);
    setError(null);
    void ensureOrderPixPayment(order)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Falha ao gerar PIX.');
      })
      .finally(() => setIsGenerating(false));
  }, [isOpen, order?.id, order?.pixEmv, order?.paymentStatus]);

  if (!isOpen || !order) return null;

  const amount = getOrderPixAmount(order);
  const isPaid = order.paymentStatus === 'PAID';
  const pixCode = order.pixEmv;

  const handleCopy = async () => {
    if (!pixCode) return;
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Não foi possível copiar o código PIX.');
    }
  };

  const confirmPayment = (method: OrderPaymentMethod) => {
    setIsSimulating(true);
    const paid = simulateOrderPixPaymentConfirmed(order.id, method);
    setIsSimulating(false);
    if (paid) {
      onPaymentConfirmed?.(paid);
      if (requirePayment) window.setTimeout(() => onClose(), 1200);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[1200] flex items-start justify-center overflow-y-auto bg-black/80 p-4 pt-16 backdrop-blur-md sm:items-center sm:py-8">
      <div
        className={`my-auto w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl ${
          isDark ? 'border-zinc-800 bg-zinc-950 text-white' : 'border-slate-200 bg-white text-slate-900'
        }`}
      >
        <div
          className={`flex items-center justify-between border-b p-5 ${
            isDark ? 'border-zinc-800' : 'border-slate-200'
          }`}
        >
          <div>
            <h3 className="text-lg font-bold">Pagamento da entrega</h3>
            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              {payerLabel} · Pedido {order.trackingCode}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={requirePayment && !isPaid}
            className={`rounded-lg p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              isDark
                ? 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <OrderPixPaymentBody
          order={order}
          amount={amount}
          isDark={isDark}
          isPaid={isPaid}
          guestBixPay={guestBixPay}
          tab={tab}
          tabOptions={TAB_OPTIONS}
          isWaitingForPix={tab === 'PIX' && (isGenerating || !pixCode)}
          pixCode={pixCode}
          isGenerating={isGenerating}
          isSimulating={isSimulating}
          isCopied={copied}
          error={error}
          onTabChange={setTab}
          onCopy={() => void handleCopy()}
          onConfirm={confirmPayment}
          onError={setError}
        />
      </div>
    </div>,
    document.body,
  );
}
