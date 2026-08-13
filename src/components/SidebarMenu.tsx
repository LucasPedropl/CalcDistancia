import React from 'react';
import type { RouteData, PriceTier, ThemeMode } from '../types';
import type { DeliveryOrder } from '../types/order';
import type { DestinationConfirmResult } from '../types/destination';
import type { MotoboyWithDistance } from '../services/motoboyService';
import type { SavedAddress } from '../services/addressService';
import { SavedOriginSelect } from './SavedOriginSelect';
import { DestinationAddressButton } from './DestinationAddressButton';
import { AvailableMotoboysList } from './AvailableMotoboysList';
import { formatCurrency, getPriceForDistance, getTierForDistance } from '../services/pricingService';
import { formatDurationMinutes } from '../utils/formatDuration';
import { ChevronRight, Clock, Navigation, DollarSign, Bike, Globe, Loader2, CheckCircle, XCircle, Zap } from 'lucide-react';
import { OrderPixPaymentButton } from './payment/OrderPixPaymentButton';
import { OrderPaymentStatusBadge } from './payment/OrderPaymentStatusBadge';

interface SidebarMenuProps {
  routeData: RouteData;
  origin: SavedAddress | null;
  userId: string;
  onUpdateOrigin: (loc: SavedAddress | null) => void;
  onUpdateDestination: (result: DestinationConfirmResult | null) => void;
  onOpenSettings: () => void;
  onConfirmPedido: (price: number | null, tier: PriceTier | undefined) => void;
  priceTiers: PriceTier[];
  theme?: ThemeMode;
  availableMotoboys?: MotoboyWithDistance[];
  selectedMotoboyId?: string | null;
  onSelectMotoboy?: (motoboyId: string | null) => void;
  pendingOrder?: DeliveryOrder | null;
  onNewOrder?: () => void;
  onCancelOrder?: () => void;
  onSimulateAccept?: () => void;
}

export const SidebarMenu: React.FC<SidebarMenuProps> = ({
  routeData,
  origin,
  userId,
  onUpdateOrigin,
  onUpdateDestination,
  onOpenSettings,
  onConfirmPedido,
  priceTiers,
  theme = 'light',
  availableMotoboys = [],
  selectedMotoboyId = null,
  onSelectMotoboy,
  pendingOrder = null,
  onNewOrder,
  onCancelOrder,
  onSimulateAccept,
}) => {
  const isDark = theme === 'dark';
  const matchedTier = getTierForDistance(routeData.distanceKm, priceTiers);
  const deliveryPrice = getPriceForDistance(routeData.distanceKm, priceTiers);
  const selectedMotoboy = availableMotoboys.find((m) => m.id === selectedMotoboyId);
  const isWaitingForAcceptance = pendingOrder?.status === 'PENDING';
  const isOrderInProgress =
    pendingOrder?.status === 'ACCEPTED' || pendingOrder?.status === 'PICKED_UP';

  return (
    <aside
      className={`flex h-full min-h-0 w-full flex-col overflow-y-auto border-r lg:max-w-none ${
        isDark ? 'border-zinc-800 bg-black text-white' : 'border-slate-200 bg-slate-50 text-slate-900'
      }`}
    >
      <div
        className={`sticky top-0 z-20 border-b p-6 backdrop-blur-md ${
          isDark ? 'border-zinc-800/80 bg-zinc-950/80' : 'border-slate-200 bg-white/90 shadow-xs'
        }`}
      >
        <h2 className="text-lg font-bold tracking-tight">Resultado da Rota</h2>
        <p className={`mt-0.5 text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
          Edite os endereços, escolha um motoboy ou envie globalmente
        </p>
      </div>

      <div
        className={`border-b p-6 ${
          isDark ? 'border-zinc-800/80 bg-zinc-950/30' : 'border-slate-200 bg-white'
        }`}
      >
        <div className="space-y-4">
          <SavedOriginSelect
            label="Origem"
            placeholder="Selecione o endereço de origem..."
            value={origin}
            onChange={onUpdateOrigin}
            userId={userId}
            theme={theme}
            onOpenSettings={onOpenSettings}
          />
          <DestinationAddressButton
            value={routeData.destination}
            onChange={onUpdateDestination}
            theme={theme}
          />
        </div>
      </div>

      <div
        className={`grid grid-cols-2 divide-x border-b ${
          isDark
            ? 'divide-zinc-800 border-zinc-800 bg-zinc-900/40'
            : 'divide-slate-200 border-slate-200 bg-slate-100/60'
        }`}
      >
        <div className="flex items-center gap-3 p-4">
          <div
            className={`rounded-lg p-2.5 ${isDark ? 'bg-zinc-900 text-white' : 'border border-slate-200 bg-white text-slate-900'}`}
          >
            <Navigation className="h-4 w-4" />
          </div>
          <div>
            <span
              className={`block text-[11px] font-semibold uppercase tracking-wider ${
                isDark ? 'text-zinc-400' : 'text-slate-500'
              }`}
            >
              Distância
            </span>
            <span className="text-lg font-black">{routeData.distanceKm} km</span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4">
          <div
            className={`rounded-lg p-2.5 ${isDark ? 'bg-zinc-900 text-white' : 'border border-slate-200 bg-white text-slate-900'}`}
          >
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <span
              className={`block text-[11px] font-semibold uppercase tracking-wider ${
                isDark ? 'text-zinc-400' : 'text-slate-500'
              }`}
            >
              Tempo estimado
            </span>
            <span className="text-lg font-black">~{formatDurationMinutes(routeData.durationMin)}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 p-6">
        <div
          className={`rounded-xl border p-5 ${
            isDark ? 'border-zinc-800 bg-zinc-900' : 'border-slate-200 bg-white shadow-sm'
          }`}
        >
          <div className="mb-3 flex items-center gap-2">
            <DollarSign className={`h-5 w-5 ${isDark ? 'text-white' : 'text-slate-900'}`} />
            <span className="text-xs font-semibold uppercase tracking-wider">Valor da viagem</span>
          </div>
          <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
            Distância calculada: <strong>{routeData.distanceKm} km</strong>
          </p>
          <p className="mt-2 text-3xl font-black">{formatCurrency(deliveryPrice)}</p>
          {matchedTier && (
            <p className={`mt-1 text-xs ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
              Faixa aplicada: {matchedTier.label}
            </p>
          )}
        </div>

        {!pendingOrder && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Bike className={`h-4 w-4 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`} />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Motoboys disponíveis
              </span>
            </div>
            <p className={`mb-3 text-xs ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
              Clique no mapa ou selecione um motoboy para envio direto
            </p>
            <AvailableMotoboysList
              motoboys={availableMotoboys}
              selectedMotoboyId={selectedMotoboyId}
              onSelectMotoboy={onSelectMotoboy ?? (() => {})}
              deliveryDistanceKm={routeData.distanceKm}
              theme={theme}
            />
          </div>
        )}

        {isWaitingForAcceptance && pendingOrder && (
          <div
            className={`rounded-xl border p-5 ${
              isDark ? 'border-amber-900/50 bg-amber-950/20' : 'border-amber-200 bg-amber-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
              <span className="text-sm font-bold">Aguardando aceite...</span>
            </div>
            <p className={`mt-2 text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              {pendingOrder.assignmentMode === 'DIRECT'
                ? `Pedido enviado para ${pendingOrder.targetMotoboyName}. Aguardando confirmação.`
                : 'Pedido enviado globalmente. Qualquer motoboy disponível pode aceitar.'}
            </p>
            <p className={`mt-1 font-mono text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
              {pendingOrder.id}
            </p>
            <div className="mt-3">
              <OrderPaymentStatusBadge order={pendingOrder} />
            </div>
          </div>
        )}

        {isOrderInProgress && pendingOrder && (
          <div
            className={`rounded-xl border p-5 ${
              isDark ? 'border-emerald-900/50 bg-emerald-950/20' : 'border-emerald-200 bg-emerald-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <span className="text-sm font-bold">Corrida em andamento</span>
            </div>
            <p className={`mt-2 text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              <strong>{pendingOrder.acceptedMotoboyName}</strong> aceitou sua entrega. Use o chat no canto
              inferior direito para falar com o motoboy.
            </p>
            <div className="mt-3">
              <OrderPaymentStatusBadge order={pendingOrder} />
            </div>
            <OrderPixPaymentButton
              order={pendingOrder}
              theme={theme}
              variant="client"
              payerLabel="Estabelecimento"
              className="mt-3"
            />
          </div>
        )}
      </div>

      <div
        className={`sticky bottom-0 z-20 mt-auto space-y-2 border-t p-6 ${
          isDark ? 'border-zinc-800 bg-zinc-950' : 'border-slate-200 bg-white'
        }`}
      >
        {isOrderInProgress ? (
          <div className="space-y-2">
            {onCancelOrder && (
              <button
                type="button"
                onClick={onCancelOrder}
                className={`flex w-full items-center justify-center gap-2 rounded-xl border py-3.5 text-sm font-bold transition-all active:scale-[0.98] ${
                  isDark
                    ? 'border-red-900/50 text-red-400 hover:bg-red-950/30'
                    : 'border-red-200 text-red-600 hover:bg-red-50'
                }`}
              >
                <XCircle className="h-4 w-4" />
                Cancelar corrida
              </button>
            )}
            <button
              type="button"
              onClick={onNewOrder}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-bold shadow-lg transition-all active:scale-[0.98] ${
                isDark
                  ? 'bg-white text-black shadow-white/10 hover:bg-zinc-200'
                  : 'bg-slate-900 text-white shadow-slate-900/10 hover:bg-slate-800'
              }`}
            >
              Voltar ao início
            </button>
          </div>
        ) : isWaitingForAcceptance ? (
          <div className="space-y-2">
            <button
              type="button"
              disabled
              className={`flex w-full cursor-wait items-center justify-center gap-2 rounded-xl py-4 text-base font-bold opacity-70 ${
                isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-200 text-slate-500'
              }`}
            >
              <Loader2 className="h-5 w-5 animate-spin" />
              Aguardando motoboy...
            </button>
            {onSimulateAccept && (
              <button
                type="button"
                onClick={onSimulateAccept}
                className={`flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold transition-all active:scale-[0.98] ${
                  isDark
                    ? 'border-emerald-800 bg-emerald-950/30 text-emerald-400 hover:bg-emerald-950/50'
                    : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <Zap className="h-4 w-4" />
                Simular aceite de motoboy
              </button>
            )}
            {onCancelOrder && (
              <button
                type="button"
                onClick={onCancelOrder}
                className={`flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition-colors ${
                  isDark
                    ? 'border-red-900/50 text-red-400 hover:bg-red-950/30'
                    : 'border-red-200 text-red-600 hover:bg-red-50'
                }`}
              >
                <XCircle className="h-4 w-4" />
                Cancelar pedido
              </button>
            )}
          </div>
        ) : (
          <>
            {selectedMotoboy ? (
              <button
                type="button"
                onClick={() => onConfirmPedido(deliveryPrice, matchedTier)}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-bold shadow-lg transition-all active:scale-[0.98] ${
                  isDark
                    ? 'bg-white text-black shadow-white/10 hover:bg-zinc-200'
                    : 'bg-slate-900 text-white shadow-slate-900/10 hover:bg-slate-800'
                }`}
              >
                <Bike className="h-5 w-5" />
                <span>Enviar para {selectedMotoboy.name}</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onConfirmPedido(deliveryPrice, matchedTier)}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-bold shadow-lg transition-all active:scale-[0.98] ${
                  isDark
                    ? 'bg-white text-black shadow-white/10 hover:bg-zinc-200'
                    : 'bg-slate-900 text-white shadow-slate-900/10 hover:bg-slate-800'
                }`}
              >
                <Globe className="h-5 w-5" />
                <span>Solicitar Globalmente</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
            <p className={`text-center text-[10px] ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>
              {selectedMotoboy
                ? 'O pedido será enviado apenas para o motoboy selecionado'
                : 'Qualquer motoboy disponível poderá aceitar'}
            </p>
          </>
        )}
      </div>
    </aside>
  );
};
