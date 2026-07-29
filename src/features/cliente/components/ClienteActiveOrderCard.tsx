import type { DeliveryOrder } from '../../../types/order';
import type { ThemeMode } from '../../../types';
import { formatCurrency } from '../../../services/pricingService';
import { CheckCircle, Loader2, MapPin, Navigation, XCircle } from 'lucide-react';

interface ClienteActiveOrderCardProps {
  order: DeliveryOrder;
  theme?: ThemeMode;
  onViewOrder?: () => void;
  onCancelOrder?: () => void;
  compact?: boolean;
}

export function ClienteActiveOrderCard({
  order,
  theme = 'light',
  onViewOrder,
  onCancelOrder,
  compact = false,
}: ClienteActiveOrderCardProps) {
  const isDark = theme === 'dark';
  const isAccepted = order.status === 'ACCEPTED' || order.status === 'PICKED_UP';

  return (
    <div
      className={`rounded-xl border p-4 ${
        isAccepted
          ? isDark
            ? 'border-emerald-800 bg-emerald-950/30'
            : 'border-emerald-300 bg-emerald-50'
          : isDark
            ? 'border-amber-900/50 bg-amber-950/20'
            : 'border-amber-200 bg-amber-50'
      }`}
    >
      <div className="mb-2 flex items-center gap-2">
        {isAccepted ? (
          <CheckCircle className="h-4 w-4 text-emerald-500" />
        ) : (
          <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
        )}
        <span className="text-xs font-bold uppercase tracking-wider">
          {isAccepted ? 'Corrida ativa' : 'Aguardando motoboy'}
        </span>
      </div>

      {isAccepted && order.acceptedMotoboyName && (
        <p className={`mb-2 text-sm font-bold ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>
          {order.acceptedMotoboyName} está a caminho
        </p>
      )}

      {!compact && (
        <div className={`mb-3 space-y-1.5 text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p className="line-clamp-2">{order.origin.address}</p>
          </div>
          <div className="flex items-start gap-2">
            <Navigation className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p className="line-clamp-2">{order.destination.address}</p>
          </div>
        </div>
      )}

      <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
        {order.distanceKm} km · {formatCurrency(order.price)} ·{' '}
        <span className="font-mono">{order.id}</span>
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {onViewOrder && (
          <button
            type="button"
            onClick={onViewOrder}
            className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
              isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            Ver entrega
          </button>
        )}
        {onCancelOrder && (
          <button
            type="button"
            onClick={onCancelOrder}
            className={`inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
              isDark
                ? 'border-red-900/50 text-red-400 hover:bg-red-950/40'
                : 'border-red-200 text-red-600 hover:bg-red-50'
            }`}
          >
            <XCircle className="h-3.5 w-3.5" />
            {isAccepted ? 'Cancelar corrida' : 'Cancelar pedido'}
          </button>
        )}
      </div>
    </div>
  );
}
