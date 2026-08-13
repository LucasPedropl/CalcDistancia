import { AlertCircle, Split, User, Wallet } from 'lucide-react';
import type { OrderPaymentMethod, OrderPaymentResponsibility } from '../../types/order';
import type { ThemeMode } from '../../types';
import { SimulatedCheckoutPayment } from '../payment/SimulatedCheckoutPayment';
import { SplitPreviewCard } from './SplitPreviewCard';

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
    description: 'Cliente paga via link de rastreamento (PIX, cartão ou Bix Pay).',
    icon: User,
  },
  {
    id: 'ESTABLISHMENT' as const,
    label: 'Estabelecimento paga',
    description: 'Pague agora com PIX, cartão ou saldo Bix Pay.',
    icon: Wallet,
  },
  {
    id: 'SPLIT' as const,
    label: 'Dividido',
    description: 'Cliente paga o motoboy e a plataforma retém a taxa.',
    icon: Split,
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
      <div className="grid gap-2 sm:grid-cols-3">
        {RESPONSIBILITY_OPTIONS.map(({ id, label, description, icon: Icon }) => {
          const isSelected = paymentResponsibility === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onResponsibilityChange(id)}
              className={`rounded-xl border p-3 text-left transition-colors ${
                isSelected
                  ? isDark
                    ? 'border-white bg-white/10'
                    : 'border-slate-900 bg-slate-50'
                  : isDark
                    ? 'border-zinc-800 bg-zinc-900/40'
                    : 'border-slate-200 bg-white'
              }`}
            >
              <Icon className="mb-2 h-5 w-5" />
              <p className="text-sm font-bold">{label}</p>
              <p className={`mt-1 text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                {description}
              </p>
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
          O cliente receberá no WhatsApp o link para pagar a entrega assim que o pedido for criado.
          O motoboy verá que o pagamento é por conta do cliente.
        </div>
      )}

      {paymentResponsibility === 'SPLIT' && <SplitPreviewCard price={price} isDark={isDark} />}

      {paymentError && (
        <p className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {paymentError}
        </p>
      )}
    </div>
  );
}
