import { useMemo, useState } from 'react';
import { History, Search } from 'lucide-react';
import type { DeliveryOrder } from '../../types/order';
import {
  filterOrderHistory,
  searchOrderHistory,
  summarizeOrderHistory,
  type OrderHistoryFilter,
} from '../../services/orderHistoryService';
import { OrderHistoryCard, type OrderHistoryVariant } from './OrderHistoryCard';
import { OrderHistorySummaryCards } from './OrderHistorySummaryCards';

interface OrderHistoryPanelProps {
  orders: DeliveryOrder[];
  variant: OrderHistoryVariant;
  isDark?: boolean;
  amountLabel?: string;
  emptyMessage?: string;
}

const FILTERS: { id: OrderHistoryFilter; label: string }[] = [
  { id: 'ALL', label: 'Todas' },
  { id: 'ACTIVE', label: 'Em andamento' },
  { id: 'COMPLETED', label: 'Concluídas' },
  { id: 'CANCELLED', label: 'Canceladas' },
];

export function OrderHistoryPanel({
  orders,
  variant,
  isDark = false,
  amountLabel,
  emptyMessage = 'Nenhuma corrida registrada até agora.',
}: OrderHistoryPanelProps) {
  const [filter, setFilter] = useState<OrderHistoryFilter>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const summary = useMemo(() => summarizeOrderHistory(orders), [orders]);
  const visibleOrders = useMemo(
    () => searchOrderHistory(filterOrderHistory(orders, filter), searchTerm),
    [orders, filter, searchTerm],
  );

  return (
    <div className="space-y-4">
      <OrderHistorySummaryCards summary={summary} isDark={isDark} amountLabel={amountLabel} />

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1">
          {FILTERS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                filter === id
                  ? isDark
                    ? 'bg-white text-black'
                    : 'bg-slate-900 text-white'
                  : isDark
                    ? 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                    : 'bg-white text-slate-600 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <label
          className={`ml-auto flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border px-3 py-2 sm:flex-none ${
            isDark ? 'border-zinc-800 bg-zinc-900' : 'border-slate-300 bg-white'
          }`}
        >
          <Search className={`h-4 w-4 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Código, cliente, endereço..."
            className={`w-full bg-transparent text-sm focus:outline-none ${
              isDark ? 'text-white placeholder-zinc-500' : 'text-slate-900 placeholder-slate-400'
            }`}
          />
        </label>
      </div>

      {visibleOrders.length === 0 ? (
        <div
          className={`flex flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-12 text-center ${
            isDark ? 'border-zinc-800 text-zinc-400' : 'border-slate-300 text-slate-500'
          }`}
        >
          <History className="h-8 w-8 opacity-60" />
          <p className="text-sm">
            {orders.length === 0 ? emptyMessage : 'Nenhuma corrida encontrada com esses filtros.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {visibleOrders.map((order) => (
            <OrderHistoryCard
              key={order.id}
              order={order}
              variant={variant}
              isDark={isDark}
            />
          ))}
        </div>
      )}
    </div>
  );
}
