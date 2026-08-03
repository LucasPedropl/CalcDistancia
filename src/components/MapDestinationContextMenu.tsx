import { MapPin } from 'lucide-react';
import type { ThemeMode } from '../types';

export type MapPickTarget = 'origin' | 'destination';

interface MapDestinationContextMenuProps {
  x: number;
  y: number;
  isLoading?: boolean;
  loadingTarget?: MapPickTarget | null;
  theme?: ThemeMode;
  onPick: (target: MapPickTarget) => void;
  onDismiss: () => void;
}

export function MapDestinationContextMenu({
  x,
  y,
  isLoading = false,
  loadingTarget = null,
  theme = 'light',
  onPick,
  onDismiss,
}: MapDestinationContextMenuProps) {
  const isDark = theme === 'dark';

  const menuWidth = 240;
  const menuHeight = 104;
  const clampedX = Math.min(Math.max(8, x), window.innerWidth - menuWidth - 8);
  const clampedY = Math.min(Math.max(8, y), window.innerHeight - menuHeight - 8);

  const itemClass = `flex w-full cursor-pointer items-center gap-2.5 px-4 py-3 text-left text-sm font-semibold transition-colors ${
    isDark ? 'hover:bg-zinc-800' : 'hover:bg-slate-50'
  } disabled:cursor-wait disabled:opacity-60`;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[1090] cursor-default"
        aria-label="Fechar menu"
        onClick={onDismiss}
        onContextMenu={(event) => {
          event.preventDefault();
          onDismiss();
        }}
      />
      <div
        className={`fixed z-[1095] min-w-[240px] overflow-hidden rounded-xl border shadow-2xl ${
          isDark ? 'border-zinc-700 bg-zinc-900 text-white' : 'border-slate-200 bg-white text-slate-900'
        }`}
        style={{ left: clampedX, top: clampedY }}
        role="menu"
      >
        <button
          type="button"
          disabled={isLoading}
          onClick={() => onPick('origin')}
          className={`${itemClass} border-b ${isDark ? 'border-zinc-800' : 'border-slate-100'}`}
        >
          <div
            className={`h-3 w-3 shrink-0 rounded-full ring-4 ${
              isDark ? 'bg-white ring-white/20' : 'bg-slate-900 ring-slate-900/10'
            }`}
          />
          {isLoading && loadingTarget === 'origin' ? 'Buscando endereço...' : 'Definir como origem'}
        </button>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => onPick('destination')}
          className={itemClass}
        >
          <MapPin className={`h-4 w-4 shrink-0 ${isDark ? 'text-white' : 'text-slate-900'}`} />
          {isLoading && loadingTarget === 'destination' ? 'Buscando endereço...' : 'Definir como destino'}
        </button>
      </div>
    </>
  );
}
