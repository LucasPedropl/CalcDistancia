import React from 'react';
import type { ThemeMode } from '../types';
import { Settings, Map, Sun, Moon, Route, LogOut } from 'lucide-react';

interface HeaderNavProps {
  onOpenPriceConfig?: () => void;
  useGoogleMaps: boolean;
  onToggleMapEngine: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onLogout: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  onOpenPriceConfig,
  useGoogleMaps,
  onToggleMapEngine,
  theme,
  onToggleTheme,
  onLogout,
}) => {
  const isDark = theme === 'dark';

  return (
    <header
      className={`w-full px-6 py-4 flex items-center justify-between z-40 relative transition-colors border-b ${
        isDark ? 'bg-black border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center font-black tracking-tighter text-lg ${
            isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'
          }`}
        >
          <Route className="w-5 h-5" />
        </div>
        <h1 className="text-base sm:text-lg font-bold tracking-tight">UaiPDV Rota</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onToggleTheme}
          className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            isDark
              ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
          }`}
          title={`Alternar para modo ${isDark ? 'Claro' : 'Escuro'}`}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          <span className="hidden md:inline">{isDark ? 'Tema Claro' : 'Tema Escuro'}</span>
        </button>

        <button
          onClick={onToggleMapEngine}
          className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-xs font-medium transition-colors ${
            isDark
              ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
          }`}
          title="Alternar motor do mapa (Google Maps / OpenStreetMap)"
        >
          <Map className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{useGoogleMaps ? 'Google Maps' : 'OSM Map'}</span>
        </button>

        {onOpenPriceConfig && (
          <button
            onClick={onOpenPriceConfig}
            className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-xs font-medium transition-colors ${
              isDark
                ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title="Configurar tabela de preços (administrador)"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tabela de Preços</span>
          </button>
        )}

        <button
          onClick={onLogout}
          className={`p-2 rounded-lg border transition-colors ${
            isDark
              ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
              : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-200'
          }`}
          title="Sair"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
