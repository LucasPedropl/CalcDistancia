import React from 'react';
import { createPortal } from 'react-dom';
import type { RouteData, PriceTier, ThemeMode } from '../types';
import type { OrderAssignmentMode, OrderCheckoutResult, OrderPaymentResponsibility } from '../types/order';
import { formatCurrency } from '../services/pricingService';
import { formatDurationMinutes } from '../utils/formatDuration';
import { formatPhoneMask, isValidPhone } from '../utils/phoneValidation';
import { SimulatedCheckoutPayment } from './payment/SimulatedCheckoutPayment';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bike,
  CheckCircle2,
  Globe,
  Phone,
  ShieldCheck,
  User,
  Wallet,
  X,
} from 'lucide-react';

type OrderModalStep = 'REVIEW' | 'PHONE' | 'PAYMENT';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  routeData: RouteData | null;
  price: number | null;
  tier?: PriceTier;
  assignmentMode: OrderAssignmentMode;
  targetMotoboyName?: string;
  onConfirmSuccess: (checkout: OrderCheckoutResult) => void;
  theme?: ThemeMode;
}

const STEP_LABELS: Record<OrderModalStep, string> = {
  REVIEW: 'Passo 1 de 3 — Revise os dados',
  PHONE: 'Passo 2 de 3 — WhatsApp do cliente',
  PAYMENT: 'Passo 3 de 3 — Pagamento da entrega',
};

const STEP_ORDER: OrderModalStep[] = ['REVIEW', 'PHONE', 'PAYMENT'];

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
}: OrderModalProps) => {
  const isDark = theme === 'dark';
  const [step, setStep] = React.useState<OrderModalStep>('REVIEW');
  const [phone, setPhone] = React.useState('');
  const [phoneError, setPhoneError] = React.useState<string | null>(null);
  const [paymentResponsibility, setPaymentResponsibility] =
    React.useState<OrderPaymentResponsibility>('CLIENT');
  const [establishmentPaid, setEstablishmentPaid] = React.useState(false);
  const [establishmentPaymentMethod, setEstablishmentPaymentMethod] = React.useState<
    'PIX' | 'CARD' | undefined
  >(undefined);
  const [paymentError, setPaymentError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) {
      setStep('REVIEW');
      setPhone('');
      setPhoneError(null);
      setPaymentResponsibility('CLIENT');
      setEstablishmentPaid(false);
      setEstablishmentPaymentMethod(undefined);
      setPaymentError(null);
    }
  }, [isOpen]);

  if (!isOpen || !routeData) return null;

  const isDirect = assignmentMode === 'DIRECT';
  const stepIndex = STEP_ORDER.indexOf(step);

  const handleClose = () => {
    setStep('REVIEW');
    setPhone('');
    setPhoneError(null);
    setPaymentResponsibility('CLIENT');
    setEstablishmentPaid(false);
    setEstablishmentPaymentMethod(undefined);
    setPaymentError(null);
    onClose();
  };

  const handleConfirm = () => {
    if (!isValidPhone(phone)) {
      setPaymentError('Informe um telefone válido do cliente antes de confirmar.');
      setStep('PHONE');
      return;
    }

    if (paymentResponsibility === 'ESTABLISHMENT' && !establishmentPaid) {
      setPaymentError('Conclua o pagamento do estabelecimento (PIX ou cartão) antes de enviar.');
      return;
    }

    onConfirmSuccess({
      trackingPhone: phone,
      paymentResponsibility,
      establishmentPaid: paymentResponsibility === 'ESTABLISHMENT' && establishmentPaid,
      paymentMethod: establishmentPaymentMethod,
    });
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
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>{STEP_LABELS[step]}</p>
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
          {STEP_ORDER.map((stepKey, index) => (
            <div
              key={stepKey}
              className={`h-1 flex-1 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`}
            >
              <div
                className={`h-full rounded-full transition-all ${
                  index <= stepIndex ? (isDark ? 'w-full bg-white' : 'w-full bg-slate-900') : 'w-0'
                }`}
              />
            </div>
          ))}
        </div>

        {step === 'REVIEW' && (
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
              <span>Na próxima etapa você define quem paga a entrega e confirma o pagamento.</span>
            </div>
          </div>
        )}

        {step === 'PHONE' && (
          <div className="space-y-5 p-6">
            <div
              className={`rounded-xl border p-4 ${isDark ? 'border-zinc-800 bg-zinc-900/40' : 'border-slate-200 bg-slate-50'}`}
            >
              <div className="mb-3 flex items-center gap-2">
                <Phone className={`h-5 w-5 ${isDark ? 'text-white' : 'text-slate-900'}`} />
                <span className="text-sm font-bold">WhatsApp do cliente final</span>
              </div>
              <p className={`mb-4 text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                Informe o número do cliente que receberá a entrega. Enviaremos o link de rastreamento
                e, se for por conta dele, o link para pagar a entrega.
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
          </div>
        )}

        {step === 'PAYMENT' && (
          <div className="space-y-5 p-6">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPaymentResponsibility('CLIENT');
                  setEstablishmentPaid(false);
                  setEstablishmentPaymentMethod(undefined);
                  setPaymentError(null);
                }}
                className={`rounded-xl border p-3 text-left transition-colors ${
                  paymentResponsibility === 'CLIENT'
                    ? isDark
                      ? 'border-white bg-white/10'
                      : 'border-slate-900 bg-slate-50'
                    : isDark
                      ? 'border-zinc-800 bg-zinc-900/40'
                      : 'border-slate-200 bg-white'
                }`}
              >
                <User className="mb-2 h-5 w-5" />
                <p className="text-sm font-bold">Por conta do cliente</p>
                <p className={`mt-1 text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  Cliente paga via link de rastreamento (PIX ou cartão).
                </p>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentResponsibility('ESTABLISHMENT');
                  setPaymentError(null);
                }}
                className={`rounded-xl border p-3 text-left transition-colors ${
                  paymentResponsibility === 'ESTABLISHMENT'
                    ? isDark
                      ? 'border-white bg-white/10'
                      : 'border-slate-900 bg-slate-50'
                    : isDark
                      ? 'border-zinc-800 bg-zinc-900/40'
                      : 'border-slate-200 bg-white'
                }`}
              >
                <Wallet className="mb-2 h-5 w-5" />
                <p className="text-sm font-bold">Estabelecimento paga</p>
                <p className={`mt-1 text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  Pague agora com PIX ou cartão (simulado).
                </p>
              </button>
            </div>

            {paymentResponsibility === 'ESTABLISHMENT' ? (
              <SimulatedCheckoutPayment
                amount={price}
                theme={theme}
                onPaymentComplete={(method) => {
                  setEstablishmentPaid(true);
                  setEstablishmentPaymentMethod(method);
                  setPaymentError(null);
                }}
              />
            ) : (
              <div
                className={`rounded-xl border p-4 text-sm ${
                  isDark ? 'border-zinc-800 bg-zinc-900/40 text-zinc-300' : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                O cliente receberá no WhatsApp o link para pagar a entrega com PIX ou cartão assim que o
                pedido for criado. O motoboy verá que o pagamento é por conta do cliente.
              </div>
            )}

            {paymentError && (
              <p className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {paymentError}
              </p>
            )}
          </div>
        )}

        <div className={`flex flex-col gap-2 border-t p-6 ${isDark ? 'border-zinc-800 bg-zinc-950' : 'border-slate-200 bg-white'}`}>
          {step === 'REVIEW' && (
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
          )}

          {step === 'PHONE' && (
            <>
              <button
                type="button"
                onClick={() => {
                  if (!isValidPhone(phone)) {
                    setPhoneError('Informe um telefone válido para receber notificações via WhatsApp.');
                    return;
                  }
                  setStep('PAYMENT');
                }}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold shadow-lg transition-all active:scale-95 ${
                  isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                <span>Avançar para pagamento</span>
                <ArrowRight className="h-4 w-4" />
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

          {step === 'PAYMENT' && (
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
                onClick={() => setStep('PHONE')}
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
