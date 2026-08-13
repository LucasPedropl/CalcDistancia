import { formatCurrency } from '../../services/pricingService';
import type { OrderHistorySummary } from '../../services/orderHistoryService';

interface OrderHistorySummaryCardsProps {
  summary: OrderHistorySummary;
  isDark?: boolean;
  /** Rótulo do valor total — muda conforme o perfil que está olhando. */
  amountLabel?: string;
}

export function OrderHistorySummaryCards({
  summary,
  isDark = false,
  amountLabel = 'Total entregue',
}: OrderHistorySummaryCardsProps) {
  const cards = [
    { label: 'Corridas', value: String(summary.total) },
    { label: 'Em andamento', value: String(summary.active) },
    { label: 'Concluídas', value: String(summary.completed) },
    { label: 'Canceladas', value: String(summary.cancelled) },
    { label: amountLabel, value: formatCurrency(summary.completedAmount) },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map(({ label, value }) => (
        <div
          key={label}
          className={`rounded-xl border p-3 ${
            isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-200 bg-white'
          }`}
        >
          <p
            className={`text-[11px] font-semibold uppercase tracking-wider ${
              isDark ? 'text-zinc-400' : 'text-slate-500'
            }`}
          >
            {label}
          </p>
          <p className="mt-1 text-xl font-black">{value}</p>
        </div>
      ))}
    </div>
  );
}
