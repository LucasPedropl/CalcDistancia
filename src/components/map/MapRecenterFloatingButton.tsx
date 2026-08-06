import { Crosshair } from 'lucide-react';
import type { ThemeMode } from '../../types';

interface MapRecenterFloatingButtonProps {
  onRecenter: () => void;
  label?: string;
  className?: string;
  theme?: ThemeMode;
}

export function MapRecenterFloatingButton({
  onRecenter,
  label = 'Centralizar no motoboy',
  className = 'absolute bottom-4 right-4 z-[1000]',
  theme = 'light',
}: MapRecenterFloatingButtonProps) {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={onRecenter}
      title={label}
      aria-label={label}
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${
        isDark
          ? 'border-zinc-700 bg-zinc-900/95 text-white hover:bg-zinc-800'
          : 'border-slate-200 bg-white/95 text-slate-900 hover:bg-slate-50'
      } ${className}`}
    >
      <Crosshair className="h-4 w-4 shrink-0" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
