import React from 'react';
import { createPortal } from 'react-dom';
import type { RouteData, PriceTier, ThemeMode } from '../types';
import type { OrderAssignmentMode } from '../types/order';
import { formatCurrency } from '../services/pricingService';
import { formatDurationMinutes } from '../utils/formatDuration';
import { formatPhoneMask, isValidPhone } from '../utils/phoneValidation';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bike,
  CheckCircle2,
  Globe,
  Phone,
  ShieldCheck,
  X,
} from 'lucide-react';

type OrderModalStep = 'REVIEW' | 'PHONE';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  routeData: RouteData | null;
  price: number | null;
  tier?: PriceTier;
  assignmentMode: OrderAssignmentMode;
  targetMotoboyName?: string;
  onConfirmSuccess: (trackingPhone: string) => void;
  theme?: ThemeMode;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  routeData,
  price,
  tier,
  assignmentMode,
  targetMotoboyName,
  onConfirmSuccess,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  const [step, setStep] = React.useState<OrderModalStep>('REVIEW');
  const [phone, setPhone] = React.useState('');
  const [phoneError, setPhoneError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) {
      setStep('REVIEW');
      setPhone('');
      setPhoneError(null);
    }
  }, [isOpen]);

  if (!isOpen || !routeData) return null;

  const isDirect = assignmentMode === 'DIRECT';

  const handleClose = () => {
    setStep('REVIEW');
    setPhone('');
    setPhoneError(null);
    onClose();
  };

  const handleConfirm = () => {
    if (!isValidPhone(phone)) {
      setPhoneError('Informe um telefone válido para receber notificações via WhatsApp.');
      return;
    }
    onConfirmSuccess(phone);
    handleClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[1100] flex items-start justify-center overflow-y-auto bg-black/80 p-4 pt-20 backdrop-blur-md sm:items-center sm:py-8">
      <div
        className={`my-auto w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl transition-colors ${
          isDark ? 'border-zinc-800 bg-zinc-950 text-white' : 'border-slate-200 bg-white text-slate-900'
        }`}
      >
        <div className={`flex items-center justify-between border-b p-6 ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl font-black ${
                isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'
              }`}
            >
              U
            </div>
            <div>
              <h3 className="text-lg font-bold">Confirmação do Pedido</h3>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                {step === 'REVIEW' ? 'Passo 1 de 2 — Revise os dados' : 'Passo 2 de 2 — Telefone de acompanhamento'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className={`rounded-lg p-1.5 transition-colors ${
              isDark ? 'text-zinc-400 hover:bg-zinc-900 hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-2 px-6 pt-4">
          <div className={`h-1 flex-1 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`}>
            <div className={`h-full w-full rounded-full ${isDark ? 'bg-white' : 'bg-slate-900'}`} />
          </div>
          <div className={`h-1 flex-1 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`}>
            <div
              className={`h-full rounded-full transition-all ${step === 'PHONE' ? (isDark ? 'w-full bg-white' : 'w-full bg-slate-900') : 'w-0'}`}
            />
          </div>
        </div>

        {step === 'REVIEW' ? (
          <div className="space-y-5 p-6">
            <div
              className={`flex items-center gap-3 rounded-xl border p-3 ${
                isDark ? 'border-zinc-800 bg-zinc-900' : 'border-slate-200 bg-slate-50'
              }`}
            >
              {isDirect ? (
                <Bike className={`h-5 w-5 shrink-0 ${isDark ? 'text-white' : 'text-slate-900'}`} />
              ) : (
                <Globe className={`h-5 w-5 shrink-0 ${isDark ? 'text-white' : 'text-slate-900'}`} />
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider">
                  {isDirect ? 'Envio direto' : 'Envio global'}
                </p>
                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  {isDirect
                    ? `Pedido exclusivo para ${targetMotoboyName}`
                    : 'Qualquer motoboy disponível pode aceitar'}
                </p>
              </div>
            </div>

            <div
              className={`rounded-xl border p-4 text-center ${
                isDark ? 'border-zinc-800 bg-zinc-900' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <span className={`text-[11px] font-semibold uppercase ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                Preço final
              </span>
              <p className="mt-1 text-3xl font-black">{formatCurrency(price)}</p>
              {tier && (
                <p className={`mt-1 text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Faixa: {tier.label}</p>
              )}
            </div>

            <div
              className={`space-y-3 rounded-xl border p-4 ${
                isDark ? 'border-zinc-800/80 bg-zinc-900/40' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div>
                <span
                  className={`block text-[11px] font-semibold uppercase tracking-wider ${
                    isDark ? 'text-zinc-500' : 'text-slate-500'
                  }`}
                >
                  Origem
                </span>
                <p className="mt-0.5 text-xs font-semibold">{routeData.origin.address}</p>
              </div>
              <div className={`border-t pt-2 ${isDark ? 'border-zinc-800/60' : 'border-slate-200'}`}>
                <span
                  className={`block text-[11px] font-semibold uppercase tracking-wider ${
                    isDark ? 'text-zinc-500' : 'text-slate-500'
                  }`}
                >
                  Destino
                </span>
                <p className="mt-0.5 text-xs font-semibold">{routeData.destination.address}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div
                className={`rounded-lg border p-3 ${isDark ? 'border-zinc-800 bg-zinc-900/60' : 'border-slate-200 bg-slate-50'}`}
              >
                <span className={`block text-[10px] font-semibold uppercase ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                  Distância
                </span>
                <span className="mt-0.5 block text-sm font-bold">{routeData.distanceKm} km</span>
              </div>
              <div
                className={`rounded-lg border p-3 ${isDark ? 'border-zinc-800 bg-zinc-900/60' : 'border-slate-200 bg-slate-50'}`}
              >
                <span className={`block text-[10px] font-semibold uppercase ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                  Tempo
                </span>
                <span className="mt-0.5 block text-sm font-bold">~{formatDurationMinutes(routeData.durationMin)}</span>
              </div>
            </div>

            <div
              className={`flex items-center gap-2 rounded-lg border p-3 text-xs ${
                isDark ? 'border-zinc-800/60 bg-zinc-900/40 text-zinc-400' : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}
            >
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>Valor conforme tabela parametrizável — sem cobrança online nesta versão.</span>
            </div>
          </div>
        ) : (
          <div className="space-y-5 p-6">
            <div
              className={`rounded-xl border p-4 ${isDark ? 'border-zinc-800 bg-zinc-900/40' : 'border-slate-200 bg-slate-50'}`}
            >
              <div className="mb-3 flex items-center gap-2">
                <Phone className={`h-5 w-5 ${isDark ? 'text-white' : 'text-slate-900'}`} />
                <span className="text-sm font-bold">Telefone de acompanhamento</span>
              </div>
              <p className={`mb-4 text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                Informe o número de quem acompanhará a entrega. Usaremos para notificações via WhatsApp da
                empresa sobre o status do pedido.
              </p>
              <input
                type="tel"
                placeholder="(31) 99999-9999"
                value={phone}
                onChange={(e) => {
                  setPhone(formatPhoneMask(e.target.value));
                  setPhoneError(null);
                }}
                autoFocus
                className={`w-full rounded-lg border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                  isDark
                    ? 'border-zinc-800 bg-zinc-900 text-white placeholder-zinc-500'
                    : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400'
                }`}
              />
              {phoneError && (
                <p className="mt-2 flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {phoneError}
                </p>
              )}
            </div>

            <div
              className={`rounded-lg border p-3 text-xs ${
                isDark ? 'border-zinc-800 text-zinc-500' : 'border-slate-200 text-slate-500'
              }`}
            >
              <p>
                <strong>Resumo:</strong> {routeData.origin.address} → {routeData.destination.address}
              </p>
              <p className="mt-1">
                {routeData.distanceKm} km · {formatCurrency(price)}
              </p>
            </div>
          </div>
        )}

        <div className={`flex flex-col gap-2 border-t p-6 ${isDark ? 'border-zinc-800 bg-zinc-950' : 'border-slate-200 bg-white'}`}>
          {step === 'REVIEW' ? (
            <>
              <button
                type="button"
                onClick={() => setStep('PHONE')}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold shadow-lg transition-all active:scale-95 ${
                  isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                <span>Avançar</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleClose}
                className={`w-full py-2.5 text-xs transition-colors ${
                  isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleConfirm}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold shadow-lg transition-all active:scale-95 ${
                  isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Confirmar e enviar pedido</span>
              </button>
              <button
                type="button"
                onClick={() => setStep('REVIEW')}
                className={`flex w-full items-center justify-center gap-1.5 py-2.5 text-xs transition-colors ${
                  isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Voltar
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};
