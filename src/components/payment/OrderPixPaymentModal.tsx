import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Copy,
  Loader2,
  QrCode,
  X,
} from 'lucide-react';
import type { DeliveryOrder } from '../../types/order';
import type { ThemeMode } from '../../types';
import { formatCurrency } from '../../services/pricingService';
import {
  ensureOrderPixPayment,
  getOrderPixAmount,
  simulateOrderPixPaymentConfirmed,
  canShowOrderPixPayment,
} from '../../services/orderPaymentService';
import { useOrderTracker } from '../../hooks/useOrders';

type PaymentTab = 'qr' | 'copy';

interface OrderPixPaymentModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
  theme?: ThemeMode;
  payerLabel?: string;
  onPaymentConfirmed?: (order: DeliveryOrder) => void;
}

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
  const [tab, setTab] = useState<PaymentTab>('qr');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTab('qr');
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
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Não foi possível copiar o código PIX.');
    }
  };

  const handleSimulatePayment = () => {
    setIsSimulating(true);
    const paid = simulateOrderPixPaymentConfirmed(order.id);
    setIsSimulating(false);
    if (paid) {
      onPaymentConfirmed?.(paid);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[1200] flex items-start justify-center overflow-y-auto bg-black/80 p-4 pt-16 backdrop-blur-md sm:items-center sm:py-8">
      <div
        className={`my-auto w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl ${
          isDark ? 'border-zinc-800 bg-zinc-950 text-white' : 'border-slate-200 bg-white text-slate-900'
        }`}
      >
        <div className={`flex items-center justify-between border-b p-5 ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
          <div>
            <h3 className="text-lg font-bold">Pagamento PIX</h3>
            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              {payerLabel} · Pedido {order.trackingCode}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg p-2 transition-colors ${
              isDark ? 'text-zinc-400 hover:bg-zinc-900 hover:text-white' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className={`rounded-xl border p-4 ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-200 bg-slate-50'}`}>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Valor da entrega</p>
            <p className="mt-1 text-3xl font-black">{formatCurrency(amount)}</p>
            <p className={`mt-1 text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Estabelecimento ou cliente final podem pagar.
            </p>
          </div>

          {isPaid ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-8 text-emerald-800">
              <CheckCircle2 className="h-12 w-12" />
              <p className="text-lg font-bold">Pagamento confirmado!</p>
              <p className="text-center text-sm">O PIX desta entrega já foi recebido.</p>
            </div>
          ) : isGenerating || !pixCode ? (
            <div className="flex flex-col items-center gap-3 py-10">
              <Loader2 className={`h-8 w-8 animate-spin ${isDark ? 'text-zinc-400' : 'text-slate-400'}`} />
              <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Gerando cobrança PIX...</p>
            </div>
          ) : (
            <>
              <div className={`flex gap-1 rounded-xl border p-1 ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-slate-200 bg-slate-100'}`}>
                <button
                  type="button"
                  onClick={() => setTab('qr')}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-colors ${
                    tab === 'qr'
                      ? isDark
                        ? 'bg-white text-black'
                        : 'bg-white text-slate-900 shadow-sm'
                      : isDark
                        ? 'text-zinc-400'
                        : 'text-slate-600'
                  }`}
                >
                  <Camera className="h-3.5 w-3.5" />
                  Escanear QR
                </button>
                <button
                  type="button"
                  onClick={() => setTab('copy')}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-colors ${
                    tab === 'copy'
                      ? isDark
                        ? 'bg-white text-black'
                        : 'bg-white text-slate-900 shadow-sm'
                      : isDark
                        ? 'text-zinc-400'
                        : 'text-slate-600'
                  }`}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copia e cola
                </button>
              </div>

              {tab === 'qr' ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-inner">
                    <QRCodeSVG value={pixCode} size={220} />
                  </div>
                  <p className={`max-w-xs text-center text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Abra o app do banco, escolha <strong>Pagar com PIX</strong> e aponte a câmera para o QR Code.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div
                    className={`max-h-28 overflow-y-auto rounded-xl border p-3 font-mono text-[11px] leading-relaxed break-all ${
                      isDark ? 'border-zinc-800 bg-zinc-900 text-zinc-300' : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    {pixCode}
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleCopy()}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-colors ${
                      isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    <Copy className="h-4 w-4" />
                    {copied ? 'Copiado!' : 'Copiar chave PIX'}
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={isSimulating}
                className={`w-full rounded-xl border py-2.5 text-xs font-semibold transition-colors ${
                  isDark
                    ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-900'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {isSimulating ? 'Confirmando...' : 'Simular pagamento recebido (dev)'}
              </button>
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
  const hasPix = Boolean(order.pixEmv);

  if (!canShowOrderPixPayment(order)) return null;

  const label = isPaid
    ? 'PIX pago'
    : hasPix
      ? 'Abrir QR PIX'
      : variant === 'motoboy'
        ? 'Gerar QR PIX'
        : 'Pagar com PIX';

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
