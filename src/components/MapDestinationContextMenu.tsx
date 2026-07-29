import { MapPin } from 'lucide-react';
import type { ThemeMode } from '../types';

interface MapDestinationContextMenuProps {
  x: number;
  y: number;
  isLoading?: boolean;
  theme?: ThemeMode;
  onConfirm: () => void;
  onDismiss: () => void;
}

export function MapDestinationContextMenu({
  x,
  y,
  isLoading = false,
  theme = 'light',
  onConfirm,
  onDismiss,
}: MapDestinationContextMenuProps) {
  const isDark = theme === 'dark';

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
        className={`fixed z-[1095] min-w-[220px] overflow-hidden rounded-xl border shadow-2xl ${
          isDark ? 'border-zinc-700 bg-zinc-900 text-white' : 'border-slate-200 bg-white text-slate-900'
        }`}
        style={{ left: x, top: y }}
        role="menu"
      >
        <button
          type="button"
          disabled={isLoading}
          onClick={onConfirm}
          className={`flex w-full cursor-pointer items-center gap-2.5 px-4 py-3 text-left text-sm font-semibold transition-colors ${
            isDark ? 'hover:bg-zinc-800' : 'hover:bg-slate-50'
          } disabled:cursor-wait disabled:opacity-60`}
        >
          <MapPin className={`h-4 w-4 shrink-0 ${isDark ? 'text-white' : 'text-slate-900'}`} />
          {isLoading ? 'Buscando endereço...' : 'Definir como destino'}
        </button>
      </div>
    </>
  );
}
