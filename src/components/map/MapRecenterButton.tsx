import { Crosshair } from 'lucide-react';
import { useMap } from 'react-leaflet';
import type { ThemeMode } from '../../types';
import { centerMapOnPoint, fitMapToPoints } from './mapCentering';

interface MapRecenterButtonProps {
  target?: { lat: number; lng: number } | null;
  fitPoints?: Array<[number, number]>;
  label?: string;
  zoom?: number;
  className?: string;
  theme?: ThemeMode;
}

/** Botão de recentralizar — deve ficar dentro do MapContainer. */
export function MapRecenterButton({
  target,
  fitPoints,
  label = 'Centralizar no motoboy',
  zoom = 16,
  className = 'absolute bottom-4 right-4 z-[1000]',
  theme = 'light',
}: MapRecenterButtonProps) {
  const map = useMap();
  const isDark = theme === 'dark';
  const hasFitPoints = Boolean(fitPoints && fitPoints.length > 0);
  const hasTarget = Boolean(target);

  if (!hasFitPoints && !hasTarget) return null;

  const handleClick = () => {
    if (hasFitPoints && fitPoints) {
      fitMapToPoints(map, fitPoints);
      return;
    }
    if (target) {
      centerMapOnPoint(map, target.lat, target.lng, zoom);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
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
