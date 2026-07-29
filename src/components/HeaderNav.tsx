import React, { useEffect, useRef, useState } from 'react';
import type { ThemeMode } from '../types';
import { Sun, Moon, Route, LogOut, User, Settings, ChevronDown, Bike } from 'lucide-react';

interface HeaderNavProps {
  onOpenSettings?: () => void;
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
  theme,
  onToggleTheme,
  onLogout,
  userName,
  userEmail,
  onlineMotoboyCount,
  motoboyRegionLabel,
}) => {
  const isDark = theme === 'dark';
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = (userName ?? userEmail ?? 'U')
    .split(/[\s@]+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const handleOpenSettings = () => {
    setIsProfileOpen(false);
    onOpenSettings?.();
  };

  const handleLogout = () => {
    setIsProfileOpen(false);
    onLogout();
  };

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
        <h1 className="truncate text-sm font-bold tracking-tight sm:text-lg">UaiPDV Rota</h1>
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

        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className={`flex items-center gap-2 rounded-xl border px-2 py-1.5 transition-colors sm:px-3 ${
              isProfileOpen
                ? isDark
                  ? 'border-white/30 bg-zinc-900'
                  : 'border-slate-900/20 bg-slate-100'
                : isDark
                  ? 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:text-white'
                  : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
            }`}
            aria-expanded={isProfileOpen}
            aria-haspopup="menu"
            title="Menu do perfil"
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'
              }`}
            >
              {initials || <User className="h-4 w-4" />}
            </div>
            <span className="hidden max-w-[120px] truncate text-xs font-semibold sm:inline">
              {userName ?? 'Perfil'}
            </span>
            <ChevronDown
              className={`hidden h-4 w-4 transition-transform sm:block ${isProfileOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isProfileOpen && (
            <div
              className={`absolute right-0 top-full z-[1001] mt-2 w-56 overflow-hidden rounded-xl border shadow-2xl ${
                isDark ? 'border-zinc-800 bg-zinc-950' : 'border-slate-200 bg-white shadow-slate-300/40'
              }`}
              role="menu"
            >
              {(userName || userEmail) && (
                <div
                  className={`border-b px-4 py-3 ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-100 bg-slate-50'}`}
                >
                  {userName && (
                    <p className={`truncate text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {userName}
                    </p>
                  )}
                  {userEmail && (
                    <p className={`truncate text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>{userEmail}</p>
                  )}
                </div>
              )}

              <div className="p-1.5">
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleOpenSettings}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    isDark ? 'text-zinc-200 hover:bg-zinc-900' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  Configurações
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    isDark ? 'text-red-400 hover:bg-red-950/40' : 'text-red-600 hover:bg-red-50'
                  }`}
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
