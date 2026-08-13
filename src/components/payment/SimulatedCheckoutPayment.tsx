import { useState } from 'react';
import { AlertCircle, CheckCircle2, CreditCard, QrCode, Wallet } from 'lucide-react';
import type { OrderPaymentMethod } from '../../types/order';
import type { ThemeMode } from '../../types';
import { formatCurrency } from '../../services/pricingService';
import { ORDER_PAYMENT_METHOD_LABELS } from '../../utils/orderPaymentDisplay';
import { PaymentMethodTabs } from './tabs/PaymentMethodTabs';
import { PixPaymentTab } from './tabs/PixPaymentTab';
import { CardPaymentTab } from './tabs/CardPaymentTab';
import { BixPayPaymentTab } from './tabs/BixPayPaymentTab';

interface SimulatedCheckoutPaymentProps {
  amount: number | null;
  theme?: ThemeMode;
  establishmentId: string;
  onPaymentComplete: (method: OrderPaymentMethod) => void;
}

const TAB_OPTIONS = [
  { id: 'PIX' as const, label: 'PIX', icon: QrCode },
  { id: 'CARD' as const, label: 'Cartão', icon: CreditCard },
  { id: 'BIXPAY' as const, label: 'Bix Pay', icon: Wallet },
];

function buildSimulatedPixCode(amount: number): string {
  return `00020126580014br.gov.bcb.pix0136sim-${Date.now()}520400005303986540${amount.toFixed(2)}5802BR5925Calc Distancia Simulado6009SAO MATEUS62070503***6304SIMU`;
}

export function SimulatedCheckoutPayment({
  amount,
  theme = 'light',
  establishmentId,
  onPaymentComplete,
}: SimulatedCheckoutPaymentProps) {
  const isDark = theme === 'dark';
  const resolvedAmount = amount !== null && amount > 0 ? amount : 25;
  const [method, setMethod] = useState<OrderPaymentMethod>('PIX');
  const [pixCode] = useState(() => buildSimulatedPixCode(resolvedAmount));
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paidMethod, setPaidMethod] = useState<OrderPaymentMethod | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Não foi possível copiar o código PIX.');
    }
  };

  const completePayment = (paymentMethod: OrderPaymentMethod, delayMs = 900) => {
    setError(null);
    setIsProcessing(true);

    window.setTimeout(() => {
      setIsProcessing(false);
      setPaidMethod(paymentMethod);
      onPaymentComplete(paymentMethod);
    }, delayMs);
  };

  if (paidMethod) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-8 text-emerald-800">
        <CheckCircle2 className="h-12 w-12" />
        <p className="text-lg font-bold">Pagamento confirmado!</p>
        <p className="text-center text-sm">
          {ORDER_PAYMENT_METHOD_LABELS[paidMethod]} processado com sucesso (simulação).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className={`rounded-xl border p-4 text-center ${
          isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Total a pagar
        </p>
        <p className="mt-1 text-3xl font-black">{formatCurrency(resolvedAmount)}</p>
      </div>

      <PaymentMethodTabs
        options={TAB_OPTIONS}
        activeId={method}
        onChange={setMethod}
        isDark={isDark}
      />

      {method === 'PIX' && (
        <PixPaymentTab
          pixCode={pixCode}
          isDark={isDark}
          isProcessing={isProcessing}
          isCopied={copied}
          confirmLabel="Simular pagamento PIX"
          onCopy={() => void handleCopyPix()}
          onConfirm={() => completePayment('PIX')}
        />
      )}

      {method === 'CARD' && (
        <CardPaymentTab
          isDark={isDark}
          isProcessing={isProcessing}
          onSubmit={() => completePayment('CARD')}
          onValidationError={setError}
        />
      )}

      {method === 'BIXPAY' && (
        <BixPayPaymentTab
          scope="ESTABLISHMENT"
          ownerId={establishmentId}
          ledgerOwnerType="ESTABLISHMENT"
          amountCents={Math.round(resolvedAmount * 100)}
          isDark={isDark}
          configureHint="Configure em Configurações → Bix Pay, no menu do estabelecimento."
          onPaid={() => completePayment('BIXPAY', 0)}
          onError={setError}
        />
      )}

      {error && (
        <p className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
