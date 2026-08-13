import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, CheckCircle2, Flag, KeyRound, Wallet, X } from 'lucide-react';
import type { DeliveryOrder } from '../../../types/order';
import type { ThemeMode } from '../../../types';
import { formatCurrency } from '../../../services/pricingService';
import {
  isClientResponsibleForPayment,
  isOrderDeliveryPaid,
} from '../../../utils/orderPaymentDisplay';

export interface MotoboyDeliveryConfirmResult {
  trackingCodeConfirmed: string;
  /** true = cliente pagou fora da plataforma; false = ainda pendente; null = já estava pago */
  markedExternalPayment: boolean | null;
}

interface MotoboyDeliveryConfirmModalProps {
  order: DeliveryOrder;
  isOpen: boolean;
  theme?: ThemeMode;
  onClose: () => void;
  onConfirm: (result: MotoboyDeliveryConfirmResult) => void;
}

export function MotoboyDeliveryConfirmModal({
  order,
  isOpen,
  theme = 'dark',
  onClose,
  onConfirm,
}: MotoboyDeliveryConfirmModalProps) {
  const isDark = theme === 'dark';
  const alreadyPaid = isOrderDeliveryPaid(order);
  const needsExternalPaymentCheck =
    !alreadyPaid && isClientResponsibleForPayment(order);

  const [codeInput, setCodeInput] = useState('');
  const [externalPaid, setExternalPaid] = useState<'YES' | 'NO' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setCodeInput('');
    setExternalPaid(null);
    setError(null);
  }, [isOpen, order.id]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const expected = order.trackingCode.trim().toUpperCase();
    const typed = codeInput.trim().toUpperCase();

    if (!typed) {
      setError('Informe o código de rastreio que o cliente possui.');
      return;
    }
    if (typed !== expected) {
      setError('Código incorreto. Peça ao cliente o código de rastreio do pedido.');
      return;
    }
    if (needsExternalPaymentCheck && externalPaid === null) {
      setError('Confirme se o cliente já pagou a entrega fora da plataforma.');
      return;
    }

    onConfirm({
      trackingCodeConfirmed: typed,
      markedExternalPayment: needsExternalPaymentCheck ? externalPaid === 'YES' : null,
    });
  };

  const inputClass = `w-full rounded-xl border px-3 py-3 font-mono text-base tracking-widest uppercase focus:outline-none focus:ring-2 ${
    isDark
      ? 'border-zinc-700 bg-zinc-900 text-white focus:ring-white'
      : 'border-slate-300 bg-white text-slate-900 focus:ring-slate-900'
  }`;

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
            <h3 className="text-lg font-bold">Confirmar entrega</h3>
            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              {order.recipientClientName ?? 'Cliente'} ·{' '}
              {order.price !== null ? formatCurrency(order.price) : '—'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg p-2 ${
              isDark ? 'text-zinc-400 hover:bg-zinc-900' : 'text-slate-500 hover:bg-slate-100'
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
            <div className="mb-2 flex items-center gap-2">
              <KeyRound className="h-4 w-4" />
              <span className="text-sm font-bold">Código de rastreio</span>
            </div>
              <p className={`mb-3 text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                Peça ao cliente o <strong>código de rastreio</strong> da tela de acompanhamento e
                digite abaixo.
              </p>
            <input
              type="text"
              value={codeInput}
              onChange={(event) => {
                setCodeInput(event.target.value.toUpperCase());
                setError(null);
              }}
              placeholder="Ex.: ABC123"
              autoFocus
              className={inputClass}
            />
          </div>

          {alreadyPaid ? (
            <div className="flex items-start gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              Pagamento já confirmado na plataforma — não precisa cobrar.
            </div>
          ) : needsExternalPaymentCheck ? (
            <div
              className={`rounded-xl border p-4 ${
                isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                <span className="text-sm font-bold">Pagamento do cliente</span>
              </div>
              <p className={`mb-3 text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                Se pagou <strong>fora da plataforma</strong>, confirme. Se já pagou no app, aparece
                sozinho acima.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { id: 'YES' as const, label: 'Sim, já pagou' },
                    { id: 'NO' as const, label: 'Ainda não pagou' },
                  ] as const
                ).map(({ id, label }) => {
                  const selected = externalPaid === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setExternalPaid(id);
                        setError(null);
                      }}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
                        selected
                          ? isDark
                            ? 'border-white bg-white/10'
                            : 'border-slate-900 bg-slate-50'
                          : isDark
                            ? 'border-zinc-700 hover:bg-zinc-900'
                            : 'border-slate-200 hover:bg-white'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {error && (
            <p className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold ${
              isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            <Flag className="h-4 w-4" />
            Confirmar e finalizar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
