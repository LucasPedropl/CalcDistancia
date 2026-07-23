import React from 'react';
import type { LocationPoint, ThemeMode } from '../types';
import { AddressInput } from './AddressInput';
import { HeaderNav } from './HeaderNav';
import { ArrowRight, Sparkles, Navigation, Route, MapPin, Calculator } from 'lucide-react';
import { POPULAR_LOCATIONS } from '../services/geocodingService';

interface Screen1TopBarProps {
  origin: LocationPoint | null;
  destination: LocationPoint | null;
  onOriginChange: (loc: LocationPoint | null) => void;
  onDestinationChange: (loc: LocationPoint | null) => void;
  onAdvance: () => void;
  isRouteLoading?: boolean;
  canCalculateRoute?: boolean;
  onOpenPriceConfig?: () => void;
  useGoogleMaps: boolean;
  onToggleMapEngine: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onLogout: () => void;
}

export const Screen1TopBar: React.FC<Screen1TopBarProps> = ({
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  onAdvance,
  isRouteLoading = false,
  canCalculateRoute,
  onOpenPriceConfig,
  useGoogleMaps,
  onToggleMapEngine,
  theme,
  onToggleTheme,
  onLogout,
}) => {
  const isDark = theme === 'dark';
  const canAdvance = canCalculateRoute ?? Boolean(origin && destination);

  const handleQuickPreset = () => {
    onOriginChange(POPULAR_LOCATIONS[0]);
    onDestinationChange(POPULAR_LOCATIONS[1]);
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors selection:bg-slate-900 selection:text-white ${
        isDark ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Navigation Header */}
      <HeaderNav
        onOpenPriceConfig={onOpenPriceConfig}
        useGoogleMaps={useGoogleMaps}
        onToggleMapEngine={onToggleMapEngine}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onLogout={onLogout}
      />

      {/* Screen 1 Primary Container: Top Bar with origin & destination inputs */}
      <div
        className={`w-full border-b shadow-lg py-6 px-4 sm:px-8 transition-colors ${
          isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-4">
          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            <AddressInput
              label="Origem ou CEP"
              placeholder="Informe a origem ou CEP..."
              value={origin}
              onChange={onOriginChange}
              type="origin"
              autoFocus
              theme={theme}
            />
            <AddressInput
              label="Destino ou CEP"
              placeholder="Informe o destino ou CEP..."
              value={destination}
              onChange={onDestinationChange}
              type="destination"
              theme={theme}
            />
          </div>

          <div className="w-full lg:w-auto shrink-0 flex items-end pt-2 lg:pt-5">
            <button
              onClick={onAdvance}
              disabled={!canAdvance}
              className={`w-full lg:w-auto px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-3 ${
                canAdvance
                  ? isDark
                    ? 'bg-white text-black hover:bg-zinc-200 active:scale-95 shadow-lg shadow-white/10 cursor-pointer'
                    : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95 shadow-lg shadow-slate-900/10 cursor-pointer'
                  : isDark
                    ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
              }`}
            >
              <span>{isRouteLoading ? 'Calculando rota...' : 'Calcular Rota'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Landing Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center max-w-3xl mx-auto">
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold mb-6 ${
            isDark
              ? 'bg-zinc-900 border-zinc-800 text-zinc-300'
              : 'bg-white border-slate-200 text-slate-700 shadow-xs'
          }`}
        >
          <Sparkles className={`w-3.5 h-3.5 ${isDark ? 'text-white' : 'text-slate-900'}`} />
          <span>Sistema de Cálculo de Rota & Preços Parametrizável</span>
        </div>

        <h2
          className={`text-4xl sm:text-6xl font-black tracking-tight leading-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          Calcule distâncias e tarifas em segundos.
        </h2>

        <p
          className={`text-base sm:text-lg mt-4 max-w-xl font-normal leading-relaxed ${
            isDark ? 'text-zinc-400' : 'text-slate-600'
          }`}
        >
          Preencha o endereço de origem e destino na barra superior ou clique no botão abaixo para carregar uma rota de exemplo.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleQuickPreset}
            className={`px-5 py-3 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 border ${
              isDark
                ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-white'
                : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-900 shadow-xs'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span>Carregar Exemplo de Rota (Savassi ➔ Confins)</span>
          </button>
        </div>

        <div
          className={`mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-2xl text-left border-t pt-8 ${
            isDark ? 'border-zinc-900' : 'border-slate-200'
          }`}
        >
          <div
            className={`p-4 rounded-xl border ${
              isDark ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4" />
              <h4 className="font-bold text-sm">Busca por CEP</h4>
            </div>
            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              Integração direta com ViaCEP para preenchimento rápido de logradouros.
            </p>
          </div>

          <div
            className={`p-4 rounded-xl border ${
              isDark ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Route className="w-4 h-4" />
              <h4 className="font-bold text-sm">Rota Terrestre</h4>
            </div>
            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              Cálculo preciso de percurso terrestre de carro via OSRM e Google Maps.
            </p>
          </div>

          <div
            className={`p-4 rounded-xl border ${
              isDark ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Calculator className="w-4 h-4" />
              <h4 className="font-bold text-sm">Tabela Flexível</h4>
            </div>
            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              Tabela de faixas de distância parametrizável conforme especificação.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
