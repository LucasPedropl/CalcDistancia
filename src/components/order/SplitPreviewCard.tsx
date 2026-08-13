import { Split } from 'lucide-react';
import { calculateSplit, loadSplitConfig } from '../../services/splitConfigService';
import { formatCurrency } from '../../services/pricingService';

interface SplitPreviewCardProps {
  price: number | null;
  isDark: boolean;
}

export function SplitPreviewCard({ price, isDark }: SplitPreviewCardProps) {
  const config = loadSplitConfig();
  const split = calculateSplit(Math.round((price ?? 0) * 100), config);

  const rowClass = `flex items-center justify-between rounded-lg px-3 py-2 text-xs ${
    isDark ? 'bg-zinc-900' : 'bg-white'
  }`;

  return (
    <div
      className={`rounded-xl border p-4 ${
        isDark ? 'border-zinc-800 bg-zinc-900/40' : 'border-slate-200 bg-slate-50'
      }`}
    >
      <div className="mb-3 flex items-center gap-2">
        <Split className={`h-4 w-4 ${isDark ? 'text-white' : 'text-slate-900'}`} />
        <span className="text-sm font-bold">Rateio do pagamento</span>
      </div>

      <div className="space-y-2">
        <div className={rowClass}>
          <span>Motoboy ({config.motoboyPercent}%)</span>
          <strong>{formatCurrency(split.motoboyCents / 100)}</strong>
        </div>
        <div className={rowClass}>
          <span>Plataforma ({config.platformPercent}%)</span>
          <strong>{formatCurrency(split.platformCents / 100)}</strong>
        </div>
      </div>

      <p className={`mt-3 text-xs leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
        O cliente paga o motoboy na entrega. Os lançamentos entram na caderneta digital de cada
        perfil quando o pagamento é confirmado.
      </p>
    </div>
  );
}
