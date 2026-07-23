import React from 'react';
import type { RouteData, PriceTier, ThemeMode } from '../types';
import { formatCurrency } from '../services/pricingService';
import { formatDurationMinutes } from '../utils/formatDuration';
import { CheckCircle2, X, ShieldCheck } from 'lucide-react';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  routeData: RouteData | null;
  price: number | null;
  tier?: PriceTier;
  onConfirmSuccess: () => void;
  theme?: ThemeMode;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  routeData,
  price,
  tier,
  onConfirmSuccess,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  if (!isOpen || !routeData) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className={`border rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 transition-colors ${
          isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className={`p-6 border-b flex items-center justify-between ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'
              }`}
            >
              U
            </div>
            <div>
              <h3 className="text-lg font-bold">Confirmação do Pedido</h3>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Revise os dados antes de confirmar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-900' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div
            className={`p-4 rounded-xl border text-center ${
              isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <span className={`text-[11px] uppercase font-semibold ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
              Preço final
            </span>
            <p className="text-3xl font-black mt-1">{formatCurrency(price)}</p>
            {tier && (
              <p className={`text-xs mt-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Faixa: {tier.label}</p>
            )}
          </div>

          <div
            className={`space-y-3 p-4 rounded-xl border ${
              isDark ? 'bg-zinc-900/40 border-zinc-800/80' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <span
                className={`text-[11px] font-semibold uppercase tracking-wider block ${
                  isDark ? 'text-zinc-500' : 'text-slate-500'
                }`}
              >
                Origem
              </span>
              <p className="text-xs font-semibold mt-0.5">{routeData.origin.address}</p>
            </div>
            <div className={`border-t pt-2 ${isDark ? 'border-zinc-800/60' : 'border-slate-200'}`}>
              <span
                className={`text-[11px] font-semibold uppercase tracking-wider block ${
                  isDark ? 'text-zinc-500' : 'text-slate-500'
                }`}
              >
                Destino
              </span>
              <p className="text-xs font-semibold mt-0.5">{routeData.destination.address}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div
              className={`p-3 rounded-lg border ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}
            >
              <span className={`text-[10px] uppercase block font-semibold ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                Distância
              </span>
              <span className="text-sm font-bold mt-0.5 block">{routeData.distanceKm} km</span>
            </div>
            <div
              className={`p-3 rounded-lg border ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}
            >
              <span className={`text-[10px] uppercase block font-semibold ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                Tempo
              </span>
              <span className="text-sm font-bold mt-0.5 block">~{formatDurationMinutes(routeData.durationMin)}</span>
            </div>
          </div>

          <div
            className={`flex items-center gap-2 text-xs p-3 rounded-lg border ${
              isDark ? 'bg-zinc-900/40 border-zinc-800/60 text-zinc-400' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Valor exibido conforme tabela parametrizável — sem cobrança online nesta versão.</span>
          </div>
        </div>

        <div className={`p-6 border-t flex flex-col gap-2 ${isDark ? 'border-zinc-800 bg-zinc-950' : 'border-slate-200 bg-white'}`}>
          <button
            onClick={() => {
              onConfirmSuccess();
              onClose();
            }}
            className={`w-full py-3.5 font-bold text-sm rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg ${
              isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirmar</span>
          </button>
          <button
            onClick={onClose}
            className={`w-full py-2.5 text-xs transition-colors ${
              isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
