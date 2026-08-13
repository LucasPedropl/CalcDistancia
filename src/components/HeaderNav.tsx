import React from 'react';
import type { ThemeMode } from '../types';
import { Sun, Moon, Route, Bike } from 'lucide-react';
import { HeaderProfileMenu } from './HeaderProfileMenu';

interface HeaderNavProps {
  onOpenSettings?: () => void;
  onOpenHistory?: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onLogout: () => void;
  userName?: string;
  userEmail?: string;
  onlineMotoboyCount?: number;
  motoboyRegionLabel?: string;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  onOpenSettings,
  onOpenHistory,
  theme,
  onToggleTheme,
  onLogout,
  userName,
  userEmail,
  onlineMotoboyCount,
  motoboyRegionLabel,
}) => {
  const isDark = theme === 'dark';

  const motoboyTooltip =
    onlineMotoboyCount !== undefined
      ? `${onlineMotoboyCount} motoboy${onlineMotoboyCount === 1 ? '' : 's'} online${motoboyRegionLabel ? ` ${motoboyRegionLabel}` : ''}`
      : undefined;

  return (
    <header
      className={`relative z-[1000] flex w-full shrink-0 items-center justify-between border-b px-4 py-3 transition-colors sm:px-6 sm:py-4 ${
        isDark ? 'border-zinc-800 bg-black text-white' : 'border-slate-200 bg-white text-slate-900 shadow-sm'
      }`}
    >
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg font-black tracking-tighter ${
            isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'
          }`}
        >
          <Route className="h-5 w-5" />
        </div>
        <h1 className="truncate text-sm font-bold tracking-tight sm:text-lg">webmottos</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {onlineMotoboyCount !== undefined && (
          <div
            className={`relative flex items-center justify-center rounded-lg border p-2 ${
              isDark
                ? 'border-zinc-800 bg-zinc-900 text-emerald-400'
                : 'border-slate-200 bg-slate-100 text-emerald-600'
            }`}
            title={motoboyTooltip}
            aria-label={motoboyTooltip}
          >
            <Bike className="h-4 w-4" />
            <span
              className={`absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none ${
                isDark ? 'bg-emerald-500 text-black' : 'bg-emerald-600 text-white'
              }`}
            >
              {onlineMotoboyCount}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={onToggleTheme}
          className={`rounded-lg border p-2 transition-colors ${
            isDark
              ? 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:text-white'
              : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
          }`}
          title={`Alternar para modo ${isDark ? 'Claro' : 'Escuro'}`}
          aria-label={`Alternar para modo ${isDark ? 'Claro' : 'Escuro'}`}
        >
          {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
        </button>

        <HeaderProfileMenu
          isDark={isDark}
          userName={userName}
          userEmail={userEmail}
          onOpenSettings={onOpenSettings}
          onOpenHistory={onOpenHistory}
          onLogout={onLogout}
        />
      </div>
    </header>
  );
};
