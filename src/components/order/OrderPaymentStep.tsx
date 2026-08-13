import { AlertCircle, User, Wallet } from 'lucide-react';
import type { OrderPaymentMethod, OrderPaymentResponsibility } from '../../types/order';
import type { ThemeMode } from '../../types';
import { SimulatedCheckoutPayment } from '../payment/SimulatedCheckoutPayment';

interface OrderPaymentStepProps {
  price: number | null;
  theme: ThemeMode;
  establishmentId: string;
  paymentResponsibility: OrderPaymentResponsibility;
  paymentError: string | null;
  onResponsibilityChange: (responsibility: OrderPaymentResponsibility) => void;
  onEstablishmentPaid: (method: OrderPaymentMethod) => void;
}

const RESPONSIBILITY_OPTIONS = [
  {
    id: 'CLIENT' as const,
    label: 'Por conta do cliente',
    description: 'Cliente paga após a entrega via PIX, cartão ou Bix Pay.',
    icon: User,
  },
  {
    id: 'ESTABLISHMENT' as const,
    label: 'Estabelecimento paga',
    description: 'Pague agora com PIX, cartão ou saldo Bix Pay.',
    icon: Wallet,
  },
];

export function OrderPaymentStep({
  price,
  theme,
  establishmentId,
  paymentResponsibility,
  paymentError,
  onResponsibilityChange,
  onEstablishmentPaid,
}: OrderPaymentStepProps) {
  const isDark = theme === 'dark';

  return (
    <div className="space-y-5 p-6">
      <div className="flex flex-col gap-2">
        {RESPONSIBILITY_OPTIONS.map(({ id, label, description, icon: Icon }) => {
          const isSelected = paymentResponsibility === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onResponsibilityChange(id)}
              className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-colors ${
                isSelected
                  ? isDark
                    ? 'border-white bg-white/10'
                    : 'border-slate-900 bg-slate-50'
                  : isDark
                    ? 'border-zinc-800 bg-zinc-900/40'
                    : 'border-slate-200 bg-white'
              }`}
            >
              <span
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  isSelected
                    ? isDark
                      ? 'bg-white/15 text-white'
                      : 'bg-slate-900 text-white'
                    : isDark
                      ? 'bg-zinc-800 text-zinc-300'
                      : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <p className="text-sm font-bold leading-snug">{label}</p>
                <p
                  className={`mt-0.5 text-xs leading-relaxed ${
                    isDark ? 'text-zinc-400' : 'text-slate-600'
                  }`}
                >
                  {description}
                </p>
              </span>
            </button>
          );
        })}
      </div>

      {paymentResponsibility === 'ESTABLISHMENT' && (
        <SimulatedCheckoutPayment
          amount={price}
          theme={theme}
          establishmentId={establishmentId}
          onPaymentComplete={onEstablishmentPaid}
        />
      )}

      {paymentResponsibility === 'CLIENT' && (
        <div
          className={`rounded-xl border p-4 text-sm ${
            isDark
              ? 'border-zinc-800 bg-zinc-900/40 text-zinc-300'
              : 'border-slate-200 bg-slate-50 text-slate-700'
          }`}
        >
          Após a entrega, o cliente verá no rastreamento as opções de pagamento (PIX, cartão ou Bix
          Pay) no centro da tela.
        </div>
      )}

      {paymentError && (
        <p className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {paymentError}
        </p>
      )}
    </div>
  );
}
