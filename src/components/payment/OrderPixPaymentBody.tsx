import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import type { DeliveryOrder, OrderPaymentMethod } from '../../types/order';
import { formatCurrency } from '../../services/pricingService';
import { PaymentMethodTabs } from './tabs/PaymentMethodTabs';
import { PixPaymentTab } from './tabs/PixPaymentTab';
import { CardPaymentTab } from './tabs/CardPaymentTab';
import { BixPayPaymentTab } from './tabs/BixPayPaymentTab';
import type { LucideIcon } from 'lucide-react';

interface TabOption {
  id: OrderPaymentMethod;
  label: string;
  icon: LucideIcon;
}

interface OrderPixPaymentBodyProps {
  order: DeliveryOrder;
  amount: number;
  isDark: boolean;
  isPaid: boolean;
  guestBixPay: boolean;
  tab: OrderPaymentMethod;
  tabOptions: TabOption[];
  isWaitingForPix: boolean;
  pixCode: string | undefined;
  isGenerating: boolean;
  isSimulating: boolean;
  isCopied: boolean;
  error: string | null;
  onTabChange: (tab: OrderPaymentMethod) => void;
  onCopy: () => void;
  onConfirm: (method: OrderPaymentMethod) => void;
  onError: (message: string) => void;
}

export function OrderPixPaymentBody({
  order,
  amount,
  isDark,
  isPaid,
  guestBixPay,
  tab,
  tabOptions,
  isWaitingForPix,
  pixCode,
  isGenerating,
  isSimulating,
  isCopied,
  error,
  onTabChange,
  onCopy,
  onConfirm,
  onError,
}: OrderPixPaymentBodyProps) {
  return (
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
          {guestBixPay
            ? 'Escolha PIX, cartão ou Bix Pay para concluir o pagamento.'
            : 'Estabelecimento ou cliente final podem pagar.'}
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
            options={tabOptions}
            activeId={tab}
            onChange={onTabChange}
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
              isCopied={isCopied}
              qrSize={200}
              confirmLabel="Simular pagamento PIX recebido"
              onCopy={onCopy}
              onConfirm={() => onConfirm('PIX')}
            />
          )}

          {tab === 'CARD' && (
            <CardPaymentTab
              isDark={isDark}
              isProcessing={isSimulating}
              onSubmit={() => onConfirm('CARD')}
              onValidationError={onError}
            />
          )}

          {tab === 'BIXPAY' && (
            <BixPayPaymentTab
              scope="ESTABLISHMENT"
              ownerId={order.clientId}
              ledgerOwnerType="ESTABLISHMENT"
              amountCents={Math.round(amount * 100)}
              isDark={isDark}
              allowGuestSimulation={guestBixPay}
              configureHint={
                guestBixPay
                  ? 'Simule o pagamento Bix Pay como cliente final.'
                  : 'O estabelecimento configura a conta em Configurações → Bix Pay.'
              }
              onPaid={() => onConfirm('BIXPAY')}
              onError={onError}
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
  );
}
