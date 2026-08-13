import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, CheckCircle2, CreditCard, Loader2, QrCode, Wallet, X } from 'lucide-react';
import type { DeliveryOrder, OrderPaymentMethod } from '../../types/order';
import type { ThemeMode } from '../../types';
import { formatCurrency } from '../../services/pricingService';
import {
  ensureOrderPixPayment,
  getOrderPixAmount,
  simulateOrderPixPaymentConfirmed,
} from '../../services/orderPaymentService';
import { useOrderTracker } from '../../hooks/useOrders';
import { PaymentMethodTabs } from './tabs/PaymentMethodTabs';
import { PixPaymentTab } from './tabs/PixPaymentTab';
import { CardPaymentTab } from './tabs/CardPaymentTab';
import { BixPayPaymentTab } from './tabs/BixPayPaymentTab';

interface OrderPixPaymentModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
  theme?: ThemeMode;
  payerLabel?: string;
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
    if (paid) onPaymentConfirmed?.(paid);
  };

  const isWaitingForPix = tab === 'PIX' && (isGenerating || !pixCode);

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
            className={`rounded-lg p-2 transition-colors ${
              isDark
                ? 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div
            className={`rounded-xl border p-4 ${
              isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-200 bg-slate-50'
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Valor da entrega
            </p>
            <p className="mt-1 text-3xl font-black">{formatCurrency(amount)}</p>
            <p className={`mt-1 text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Estabelecimento ou cliente final podem pagar.
            </p>
          </div>

          {isPaid ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-8 text-emerald-800">
              <CheckCircle2 className="h-12 w-12" />
              <p className="text-lg font-bold">Pagamento confirmado!</p>
              <p className="text-center text-sm">O valor desta entrega já foi recebido.</p>
            </div>
          ) : (
            <>
              <PaymentMethodTabs
                options={TAB_OPTIONS}
                activeId={tab}
                onChange={setTab}
                isDark={isDark}
              />

              {isWaitingForPix && (
                <div className="flex flex-col items-center gap-3 py-10">
                  <Loader2
                    className={`h-8 w-8 animate-spin ${isDark ? 'text-zinc-400' : 'text-slate-400'}`}
                  />
                  <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Gerando cobrança PIX...
                  </p>
                </div>
              )}

              {tab === 'PIX' && pixCode && !isGenerating && (
                <PixPaymentTab
                  pixCode={pixCode}
                  isDark={isDark}
                  isProcessing={isSimulating}
                  isCopied={copied}
                  qrSize={200}
                  confirmLabel="Simular pagamento PIX recebido"
                  onCopy={() => void handleCopy()}
                  onConfirm={() => confirmPayment('PIX')}
                />
              )}

              {tab === 'CARD' && (
                <CardPaymentTab
                  isDark={isDark}
                  isProcessing={isSimulating}
                  onSubmit={() => confirmPayment('CARD')}
                  onValidationError={setError}
                />
              )}

              {tab === 'BIXPAY' && (
                <BixPayPaymentTab
                  scope="ESTABLISHMENT"
                  ownerId={order.clientId}
                  ledgerOwnerType="ESTABLISHMENT"
                  amountCents={Math.round(amount * 100)}
                  isDark={isDark}
                  configureHint="O estabelecimento configura a conta em Configurações → Bix Pay."
                  onPaid={() => confirmPayment('BIXPAY')}
                  onError={setError}
                />
              )}
            </>
          )}

          {error && (
            <p className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}