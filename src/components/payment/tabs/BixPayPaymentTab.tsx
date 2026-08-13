import { useState } from 'react';
import { Loader2, Settings2, Wallet } from 'lucide-react';
import {
  createBixPayCharge,
  loadBixPayCredentials,
  type BixPayScope,
} from '../../../services/bixPayService';
import {
  formatLedgerAmount,
  getLedgerBalanceCents,
  type LedgerOwnerType,
} from '../../../services/ledgerService';

interface BixPayPaymentTabProps {
  scope: BixPayScope;
  ownerId: string;
  ledgerOwnerType: LedgerOwnerType;
  amountCents: number;
  isDark: boolean;
  onPaid: (chargeId: string) => void;
  onError: (message: string) => void;
  /** Onde o usuário configura as credenciais quando ainda não há conta ligada. */
  configureHint?: string;
  /** Cliente final sem conta Bix Pay: permite simular o pagamento. */
  allowGuestSimulation?: boolean;
}

export function BixPayPaymentTab({
  scope,
  ownerId,
  ledgerOwnerType,
  amountCents,
  isDark,
  onPaid,
  onError,
  configureHint = 'Configure em Pagamentos → Credenciais Bix Pay.',
  allowGuestSimulation = false,
}: BixPayPaymentTabProps) {
  const credentials = loadBixPayCredentials(scope, ownerId);
  const [isProcessing, setIsProcessing] = useState(false);

  const balanceCents = getLedgerBalanceCents(ledgerOwnerType, ownerId);

  if (!credentials?.merchantId || !credentials.accessToken) {
    if (allowGuestSimulation) {
      return (
        <div className="space-y-3">
          <div
            className={`rounded-xl border p-4 text-center ${
              isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-200 bg-slate-50'
            }`}
          >
            <Wallet className={`mx-auto mb-2 h-7 w-7 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`} />
            <p className="text-sm font-semibold">Pagar com Bix Pay</p>
            <p className={`mt-1 text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Simulação para o cliente final — sem conta vinculada.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsProcessing(true);
              window.setTimeout(() => {
                setIsProcessing(false);
                onPaid(`guest-bixpay-${Date.now()}`);
              }, 700);
            }}
            disabled={isProcessing}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-colors disabled:opacity-60 ${
              isDark
                ? 'bg-white text-black hover:bg-zinc-200'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
            {isProcessing ? 'Processando...' : 'Simular pagamento Bix Pay'}
          </button>
        </div>
      );
    }

    return (
      <div
        className={`rounded-xl border p-5 text-center ${
          isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <Settings2 className={`mx-auto mb-2 h-7 w-7 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
        <p className="text-sm font-semibold">Bix Pay não configurado</p>
        <p className={`mt-1 text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
          {configureHint}
        </p>
      </div>
    );
  }

  const handlePay = async () => {
    setIsProcessing(true);

    try {
      const charge = await createBixPayCharge(scope, ownerId, amountCents);
      onPaid(charge.chargeId);
    } catch (chargeError) {
      onError(
        chargeError instanceof Error ? chargeError.message : 'Falha ao processar o pagamento.',
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-3">
      <div
        className={`rounded-xl border p-4 ${
          isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Saldo na caderneta
        </p>
        <p className="mt-1 text-2xl font-black">{formatLedgerAmount(balanceCents)}</p>
        <p className={`mt-1 text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
          Conta {credentials.merchantId} ·{' '}
          {credentials.environment === 'SANDBOX' ? 'Sandbox' : 'Produção'}
        </p>
      </div>

      <button
        type="button"
        onClick={() => void handlePay()}
        disabled={isProcessing}
        className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-colors disabled:opacity-60 ${
          isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-slate-900 text-white hover:bg-slate-800'
        }`}
      >
        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
        {isProcessing ? 'Processando...' : 'Pagar com saldo Bix Pay'}
      </button>
    </div>
  );
}
