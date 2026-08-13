import { useEffect, useRef, useState } from 'react';
import { ChevronDown, History, LogOut, Settings, User } from 'lucide-react';

interface HeaderProfileMenuProps {
  isDark: boolean;
  userName?: string;
  userEmail?: string;
  onOpenSettings?: () => void;
  onOpenHistory?: () => void;
  onLogout: () => void;
}

export function HeaderProfileMenu({
  isDark,
  userName,
  userEmail,
  onOpenSettings,
  onOpenHistory,
  onLogout,
}: HeaderProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
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

  const itemClass = `flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
    isDark ? 'text-zinc-200 hover:bg-zinc-900' : 'text-slate-700 hover:bg-slate-100'
  }`;

  const runAndClose = (action?: () => void) => () => {
    setIsOpen(false);
    action?.();
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-2 rounded-xl border px-2 py-1.5 transition-colors sm:px-3 ${
          isOpen
            ? isDark
              ? 'border-white/30 bg-zinc-900'
              : 'border-slate-900/20 bg-slate-100'
            : isDark
              ? 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:text-white'
              : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
        }`}
        aria-expanded={isOpen}
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
          className={`hidden h-4 w-4 transition-transform sm:block ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 top-full z-[1001] mt-2 w-56 overflow-hidden rounded-xl border shadow-2xl ${
            isDark ? 'border-zinc-800 bg-zinc-950' : 'border-slate-200 bg-white shadow-slate-300/40'
          }`}
          role="menu"
        >
          {(userName || userEmail) && (
            <div
              className={`border-b px-4 py-3 ${
                isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-100 bg-slate-50'
              }`}
            >
              {userName && (
                <p
                  className={`truncate text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
                >
                  {userName}
                </p>
              )}
              {userEmail && (
                <p className={`truncate text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  {userEmail}
                </p>
              )}
            </div>
          )}

          <div className="p-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={runAndClose(onOpenSettings)}
              className={itemClass}
            >
              <Settings className="h-4 w-4" />
              Configurações
            </button>
            {onOpenHistory && (
              <button
                type="button"
                role="menuitem"
                onClick={runAndClose(onOpenHistory)}
                className={itemClass}
              >
                <History className="h-4 w-4" />
                Histórico de corridas
              </button>
            )}
            <button
              type="button"
              role="menuitem"
              onClick={runAndClose(onLogout)}
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
  );
}
