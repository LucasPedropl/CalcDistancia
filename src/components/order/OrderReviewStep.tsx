import { Bike, Globe, ShieldCheck } from 'lucide-react';
import type { PriceTier, RouteData } from '../../types';
import { formatCurrency } from '../../services/pricingService';
import { formatDurationMinutes } from '../../utils/formatDuration';

interface OrderReviewStepProps {
  routeData: RouteData;
  price: number | null;
  tier?: PriceTier;
  isDirect: boolean;
  targetMotoboyName?: string;
  isDark: boolean;
}

export function OrderReviewStep({
  routeData,
  price,
  tier,
  isDirect,
  targetMotoboyName,
  isDark,
}: OrderReviewStepProps) {
  const panelClass = isDark ? 'border-zinc-800 bg-zinc-900' : 'border-slate-200 bg-slate-50';
  const mutedClass = isDark ? 'text-zinc-400' : 'text-slate-600';
  const labelClass = `block text-[11px] font-semibold uppercase tracking-wider ${
    isDark ? 'text-zinc-500' : 'text-slate-500'
  }`;

  return (
    <div className="space-y-5 p-6">
      <div className={`flex items-center gap-3 rounded-xl border p-3 ${panelClass}`}>
        {isDirect ? (
          <Bike className={`h-5 w-5 shrink-0 ${isDark ? 'text-white' : 'text-slate-900'}`} />
        ) : (
          <Globe className={`h-5 w-5 shrink-0 ${isDark ? 'text-white' : 'text-slate-900'}`} />
        )}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider">
            {isDirect ? 'Envio direto' : 'Envio global'}
          </p>
          <p className={`text-sm ${mutedClass}`}>
            {isDirect
              ? `Pedido exclusivo para ${targetMotoboyName}`
              : 'Qualquer motoboy disponível pode aceitar'}
          </p>
        </div>
      </div>

      <div className={`rounded-xl border p-4 text-center ${panelClass}`}>
        <span className={labelClass}>Preço final</span>
        <p className="mt-1 text-3xl font-black">{formatCurrency(price)}</p>
        {tier && <p className={`mt-1 text-xs ${mutedClass}`}>Faixa: {tier.label}</p>}
      </div>

      <div
        className={`space-y-3 rounded-xl border p-4 ${
          isDark ? 'border-zinc-800/80 bg-zinc-900/40' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <div>
          <span className={labelClass}>Origem</span>
          <p className="mt-0.5 text-xs font-semibold">{routeData.origin.address}</p>
        </div>
        <div className={`border-t pt-2 ${isDark ? 'border-zinc-800/60' : 'border-slate-200'}`}>
          <span className={labelClass}>Destino</span>
          <p className="mt-0.5 text-xs font-semibold">{routeData.destination.address}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-center">
        <div
          className={`rounded-lg border p-3 ${
            isDark ? 'border-zinc-800 bg-zinc-900/60' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <span className={labelClass}>Distância</span>
          <span className="mt-0.5 block text-sm font-bold">{routeData.distanceKm} km</span>
        </div>
        <div
          className={`rounded-lg border p-3 ${
            isDark ? 'border-zinc-800 bg-zinc-900/60' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <span className={labelClass}>Tempo</span>
          <span className="mt-0.5 block text-sm font-bold">
            ~{formatDurationMinutes(routeData.durationMin)}
          </span>
        </div>
      </div>

      <div
        className={`flex items-center gap-2 rounded-lg border p-3 text-xs ${
          isDark
            ? 'border-zinc-800/60 bg-zinc-900/40 text-zinc-400'
            : 'border-slate-200 bg-slate-50 text-slate-600'
        }`}
      >
        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
        <span>Na próxima etapa você define quem paga a entrega e confirma o pagamento.</span>
      </div>
    </div>
  );
}
