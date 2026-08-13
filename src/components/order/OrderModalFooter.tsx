import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

interface OrderModalFooterProps {
  step: 'REVIEW' | 'PHONE' | 'PAYMENT';
  isDark: boolean;
  onAdvance: () => void;
  onBack: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export function OrderModalFooter({
  step,
  isDark,
  onAdvance,
  onBack,
  onCancel,
  onConfirm,
}: OrderModalFooterProps) {
  const primaryButtonClass = `flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold shadow-lg transition-all active:scale-95 ${
    isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-slate-900 text-white hover:bg-slate-800'
  }`;
  const secondaryButtonClass = `flex w-full items-center justify-center gap-1.5 py-2.5 text-xs transition-colors ${
    isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
  }`;

  return (
    <div
      className={`flex flex-col gap-2 border-t p-6 ${
        isDark ? 'border-zinc-800 bg-zinc-950' : 'border-slate-200 bg-white'
      }`}
    >
      {step === 'PAYMENT' ? (
        <button type="button" onClick={onConfirm} className={primaryButtonClass}>
          <CheckCircle2 className="h-4 w-4" />
          <span>Confirmar e enviar pedido</span>
        </button>
      ) : (
        <button type="button" onClick={onAdvance} className={primaryButtonClass}>
          <span>{step === 'PHONE' ? 'Avançar para pagamento' : 'Avançar'}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      )}

      {step === 'REVIEW' ? (
        <button type="button" onClick={onCancel} className={secondaryButtonClass}>
          Cancelar
        </button>
      ) : (
        <button type="button" onClick={onBack} className={secondaryButtonClass}>
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar
        </button>
      )}
    </div>
  );
}
