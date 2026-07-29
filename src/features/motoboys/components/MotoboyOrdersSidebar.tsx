import { useState } from 'react';
import type { DeliveryOrder } from '../../../types/order';
import type { ThemeMode } from '../../../types';
import { formatCurrency } from '../../../services/pricingService';
import { formatDurationMinutes } from '../../../utils/formatDuration';
import { Search, Package, MapPin, CheckCircle, Clock, Navigation, Map, X, XCircle, Flag } from 'lucide-react';

interface MotoboyOrdersSidebarProps {
  openOrders: DeliveryOrder[];
  activeOrder: DeliveryOrder | null;
  previewOrderId: string | null;
  onPreviewOrder: (orderId: string) => void;
  onConfirmAccept: () => void;
  onCancelPreview: () => void;
  onCancelActiveOrder?: () => void;
  onCompleteActiveOrder?: () => void;
  theme?: ThemeMode;
}

function OrderCardDetails({
  order,
  isDark,
}: {
  order: DeliveryOrder;
  isDark: boolean;
}) {
  const isDirect = order.assignmentMode === 'DIRECT';

  return (
    <>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <span className={`font-mono text-[10px] font-bold ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
            {order.id}
          </span>
          <p className="text-sm font-bold">{order.clientName}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-black">{formatCurrency(order.price)}</p>
          {isDirect && (
            <span
              className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                isDark ? 'bg-white/10 text-white' : 'bg-slate-900 text-white'
              }`}
            >
              Direto
            </span>
          )}
        </div>
      </div>

      <div className={`space-y-2 text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider">Origem</span>
            <p className="font-medium">{order.origin.address}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Navigation className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider">Destino</span>
            <p className="font-medium">{order.destination.address}</p>
          </div>
        </div>
      </div>

      <div
        className={`mt-3 flex items-center gap-3 border-t pt-3 text-xs ${
          isDark ? 'border-zinc-800 text-zinc-500' : 'border-slate-100 text-slate-500'
        }`}
      >
        <span className="flex items-center gap-1">
          <Navigation className="h-3 w-3" />
          {order.distanceKm} km
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />~{formatDurationMinutes(order.durationMin)}
        </span>
      </div>
    </>
  );
}

export function MotoboyOrdersSidebar({
  openOrders,
  activeOrder,
  previewOrderId,
  onPreviewOrder,
  onConfirmAccept,
  onCancelPreview,
  onCancelActiveOrder,
  onCompleteActiveOrder,
  theme = 'light',
}: MotoboyOrdersSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const isDark = theme === 'dark';
  const isBusy = activeOrder !== null;

  const filteredOrders = openOrders.filter((order) => {
    const term = searchTerm.toLowerCase();
    return (
      order.clientName.toLowerCase().includes(term) ||
      order.origin.address.toLowerCase().includes(term) ||
      order.id.toLowerCase().includes(term)
    );
  });

  return (
    <aside
      className={`flex h-full w-full shrink-0 flex-col overflow-y-auto border-r lg:w-112 ${
        isDark ? 'border-zinc-800 bg-black text-white' : 'border-slate-200 bg-slate-50 text-slate-900'
      }`}
    >
      <div
        className={`sticky top-0 z-20 border-b p-6 backdrop-blur-md ${
          isDark ? 'border-zinc-800/80 bg-zinc-950/80' : 'border-slate-200 bg-white/90 shadow-xs'
        }`}
      >
        <h2 className="text-lg font-bold tracking-tight">
          {isBusy ? 'Corrida ativa' : 'Pedidos abertos'}
        </h2>
        <p className={`mt-0.5 text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
          {isBusy
            ? 'Você está ocupado — só aparecem pedidos diretos para você'
            : `${openOrders.length} disponível${openOrders.length !== 1 ? 'is' : ''} para aceitar`}
        </p>

        {!isBusy && (
          <div className="relative mt-4">
            <Search
              className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
                isDark ? 'text-zinc-500' : 'text-slate-400'
              }`}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar por cliente ou endereço..."
              className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm focus:outline-none ${
                isDark
                  ? 'border-zinc-700 bg-zinc-900 text-white placeholder-zinc-500 focus:border-white'
                  : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-900'
              }`}
            />
          </div>
        )}
      </div>

      <div className="flex-1 space-y-3 p-4">
        {activeOrder && (
          <div
            className={`rounded-xl border p-4 ${
              isDark ? 'border-emerald-800 bg-emerald-950/40' : 'border-emerald-300 bg-emerald-50'
            }`}
          >
            <div className="mb-3 flex items-center gap-2 text-emerald-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Pedido em andamento</span>
            </div>
            <OrderCardDetails order={activeOrder} isDark={isDark} />
            <p className={`mt-3 text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
              Rota fixada no mapa. Use o chat para falar com o cliente.
            </p>
            {onCompleteActiveOrder && (
              <button
                type="button"
                onClick={onCompleteActiveOrder}
                className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-colors ${
                  isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                <Flag className="h-4 w-4" />
                Finalizar entrega
              </button>
            )}
            {onCancelActiveOrder && (
              <button
                type="button"
                onClick={onCancelActiveOrder}
                className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-colors ${
                  isDark
                    ? 'border-red-900/50 text-red-400 hover:bg-red-950/40'
                    : 'border-red-200 text-red-600 hover:bg-red-50'
                }`}
              >
                <XCircle className="h-4 w-4" />
                Cancelar corrida
              </button>
            )}
          </div>
        )}

        {previewOrderId && (
          <div
            className={`rounded-xl border p-4 ${
              isDark ? 'border-white/30 bg-white/5' : 'border-slate-900/20 bg-slate-100'
            }`}
          >
            <p className={`mb-3 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Revise a rota no mapa antes de aceitar
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onConfirmAccept}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold ${
                  isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                <CheckCircle className="h-4 w-4" />
                Confirmar aceite
              </button>
              <button
                type="button"
                onClick={onCancelPreview}
                className={`rounded-xl border px-3 py-2.5 transition-colors ${
                  isDark
                    ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-900'
                    : 'border-slate-300 text-slate-600 hover:bg-white'
                }`}
                title="Cancelar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {filteredOrders.length === 0 && !activeOrder ? (
          <div
            className={`rounded-xl border p-8 text-center ${
              isDark ? 'border-zinc-800 bg-zinc-900/40' : 'border-slate-200 bg-white'
            }`}
          >
            <Package className={`mx-auto mb-3 h-10 w-10 ${isDark ? 'text-zinc-600' : 'text-slate-300'}`} />
            <p className={`text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Nenhum pedido aberto no momento
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isPreviewing = previewOrderId === order.id;

            return (
              <div
                key={order.id}
                className={`rounded-xl border p-4 transition-all ${
                  isPreviewing
                    ? isDark
                      ? 'border-white bg-white/10 ring-2 ring-white/20'
                      : 'border-slate-900 bg-slate-50 ring-2 ring-slate-900/10'
                    : isDark
                      ? 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <OrderCardDetails order={order} isDark={isDark} />

                {isPreviewing ? (
                  <p className={`mt-3 text-center text-xs font-medium ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Rota exibida no mapa → confirme acima
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => onPreviewOrder(order.id)}
                    className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all active:scale-[0.98] ${
                      isDark
                        ? 'bg-white text-black hover:bg-zinc-200'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    <Map className="h-4 w-4" />
                    Ver rota
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
