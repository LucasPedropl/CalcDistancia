import type { MotoboyWithDistance } from '../services/motoboyService';
import { getMotoboyPriceForDistance } from '../services/motoboyPricingService';
import { formatCurrency } from '../services/pricingService';
import type { ThemeMode } from '../types';
import { formatDistanceKm } from '../utils/distance';
import { Bike, Check, Star } from 'lucide-react';

interface AvailableMotoboysListProps {
  motoboys: MotoboyWithDistance[];
  selectedMotoboyId: string | null;
  onSelectMotoboy: (motoboyId: string | null) => void;
  theme?: ThemeMode;
  favoriteMotoboyIds?: string[];
  onToggleFavorite?: (motoboyId: string) => void;
  /** Distância da entrega em km — quando informada, exibe preço por motoboy. */
  deliveryDistanceKm?: number | null;
}

export function AvailableMotoboysList({
  motoboys,
  selectedMotoboyId,
  onSelectMotoboy,
  theme = 'light',
  favoriteMotoboyIds = [],
  onToggleFavorite,
  deliveryDistanceKm = null,
}: AvailableMotoboysListProps) {
  const isDark = theme === 'dark';
  const favoriteSet = new Set(favoriteMotoboyIds);
  const hasDeliveryPrice = deliveryDistanceKm !== null && deliveryDistanceKm > 0;

  const sortedMotoboys = [...motoboys].sort((a, b) => {
    const aFav = favoriteSet.has(a.id);
    const bFav = favoriteSet.has(b.id);
    if (aFav !== bFav) return aFav ? -1 : 1;
    return a.distanceKm - b.distanceKm;
  });

  if (sortedMotoboys.length === 0) {
    return (
      <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
        Nenhum motoboy disponível na região.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {sortedMotoboys.map((motoboy) => {
        const isSelected = selectedMotoboyId === motoboy.id;
        const isFavorite = favoriteSet.has(motoboy.id);
        const deliveryPrice = hasDeliveryPrice
          ? getMotoboyPriceForDistance(motoboy.id, deliveryDistanceKm)
          : null;

        return (
          <div
            key={motoboy.id}
            className={`flex w-full items-center gap-2 rounded-xl border transition-all ${
              isSelected
                ? isDark
                  ? 'border-white bg-white/10 ring-2 ring-white/20'
                  : 'border-slate-900 bg-slate-50 ring-2 ring-slate-900/10'
                : isDark
                  ? 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                  : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <button
              type="button"
              onClick={() => onSelectMotoboy(isSelected ? null : motoboy.id)}
              className="flex min-w-0 flex-1 items-center gap-3 p-3 text-left"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  isSelected
                    ? isDark
                      ? 'bg-white text-black'
                      : 'bg-slate-900 text-white'
                    : isDark
                      ? 'bg-zinc-800 text-white'
                      : 'bg-slate-100 text-slate-900'
                }`}
              >
                <Bike className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{motoboy.name}</p>
                <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                  {motoboy.vehicle} · {formatDistanceKm(motoboy.distanceKm)} de você
                </p>
                {hasDeliveryPrice && (
                  <p
                    className={`mt-0.5 text-xs font-bold ${
                      isDark ? 'text-emerald-400' : 'text-emerald-700'
                    }`}
                  >
                    Entrega: {formatCurrency(deliveryPrice)}
                  </p>
                )}
              </div>
              {isSelected && (
                <Check className={`h-4 w-4 shrink-0 ${isDark ? 'text-white' : 'text-slate-900'}`} />
              )}
            </button>

            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite(motoboy.id)}
                className={`mr-2 shrink-0 rounded-lg p-2 transition-colors ${
                  isFavorite
                    ? isDark
                      ? 'text-amber-400 hover:bg-amber-400/10'
                      : 'text-amber-500 hover:bg-amber-50'
                    : isDark
                      ? 'text-zinc-600 hover:bg-zinc-800 hover:text-zinc-400'
                      : 'text-slate-300 hover:bg-slate-100 hover:text-slate-500'
                }`}
                title={isFavorite ? 'Remover dos favoritos' : 'Favoritar motoboy'}
                aria-label={isFavorite ? 'Remover dos favoritos' : 'Favoritar motoboy'}
                aria-pressed={isFavorite}
              >
                <Star className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
