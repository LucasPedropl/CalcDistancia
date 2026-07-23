import React from 'react';
import type { LocationPoint, RouteData, PriceTier, ThemeMode } from '../types';
import { AddressInput } from './AddressInput';
import { formatCurrency, getPriceForDistance, getTierForDistance } from '../services/pricingService';
import { formatDurationMinutes } from '../utils/formatDuration';
import { ChevronRight, Clock, Navigation, DollarSign } from 'lucide-react';

interface SidebarMenuProps {
  routeData: RouteData;
  onUpdateOrigin: (loc: LocationPoint | null) => void;
  onUpdateDestination: (loc: LocationPoint | null) => void;
  onConfirmPedido: (price: number | null, tier: PriceTier | undefined) => void;
  priceTiers: PriceTier[];
  theme?: ThemeMode;
}

export const SidebarMenu: React.FC<SidebarMenuProps> = ({
  routeData,
  onUpdateOrigin,
  onUpdateDestination,
  onConfirmPedido,
  priceTiers,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const matchedTier = getTierForDistance(routeData.distanceKm, priceTiers);
  const deliveryPrice = getPriceForDistance(routeData.distanceKm, priceTiers);

  return (
    <aside
      className={`w-full lg:w-112 border-r flex flex-col h-full overflow-y-auto shrink-0 transition-colors ${
        isDark ? 'bg-black border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
      }`}
    >
      <div
        className={`p-6 border-b sticky top-0 z-20 backdrop-blur-md ${
          isDark ? 'bg-zinc-950/80 border-zinc-800/80' : 'bg-white/90 border-slate-200 shadow-xs'
        }`}
      >
        <h2 className="text-lg font-bold tracking-tight">Resultado da Rota</h2>
        <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
          Edite os endereços, distância e valor da viagem
        </p>
      </div>

      <div
        className={`p-6 border-b ${
          isDark ? 'border-zinc-800/80 bg-zinc-950/30' : 'border-slate-200 bg-white'
        }`}
      >
        <div className="space-y-4">
          <AddressInput
            label="Origem ou CEP"
            placeholder="Informe a origem..."
            value={routeData.origin}
            onChange={onUpdateOrigin}
            type="origin"
            theme={theme}
          />
          <AddressInput
            label="Destino ou CEP"
            placeholder="Informe o destino..."
            value={routeData.destination}
            onChange={onUpdateDestination}
            type="destination"
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
        <div className="p-4 flex items-center gap-3">
          <div
            className={`p-2.5 rounded-lg ${isDark ? 'bg-zinc-900 text-white' : 'bg-white text-slate-900 border border-slate-200'}`}
          >
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <span
              className={`text-[11px] uppercase tracking-wider block font-semibold ${
                isDark ? 'text-zinc-400' : 'text-slate-500'
              }`}
            >
              Distância
            </span>
            <span className="text-lg font-black">{routeData.distanceKm} km</span>
          </div>
        </div>

        <div className="p-4 flex items-center gap-3">
          <div
            className={`p-2.5 rounded-lg ${isDark ? 'bg-zinc-900 text-white' : 'bg-white text-slate-900 border border-slate-200'}`}
          >
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span
              className={`text-[11px] uppercase tracking-wider block font-semibold ${
                isDark ? 'text-zinc-400' : 'text-slate-500'
              }`}
            >
              Tempo estimado
            </span>
            <span className="text-lg font-black">~{formatDurationMinutes(routeData.durationMin)}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div
          className={`p-5 rounded-xl border ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className={`w-5 h-5 ${isDark ? 'text-white' : 'text-slate-900'}`} />
            <span className="text-xs font-semibold uppercase tracking-wider">Valor da viagem</span>
          </div>
          <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
            Distância calculada: <strong>{routeData.distanceKm} km</strong>
          </p>
          <p className="text-3xl font-black mt-2">{formatCurrency(deliveryPrice)}</p>
          {matchedTier && (
            <p className={`text-xs mt-1 ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
              Faixa aplicada: {matchedTier.label}
            </p>
          )}
        </div>
      </div>

      <div
        className={`p-6 border-t sticky bottom-0 z-20 mt-auto ${
          isDark ? 'border-zinc-800 bg-zinc-950' : 'border-slate-200 bg-white'
        }`}
      >
        <button
          onClick={() => onConfirmPedido(deliveryPrice, matchedTier)}
          className={`w-full py-4 font-bold text-base rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg ${
            isDark
              ? 'bg-white text-black hover:bg-zinc-200 shadow-white/10'
              : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/10'
          }`}
        >
          <span>Confirmar Pedido</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
};
