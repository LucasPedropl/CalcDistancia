import type { ThemeMode } from '../../types';
import { useMapProvider } from '../../hooks/useMapProvider';
import { Map, Layers } from 'lucide-react';

interface MapProviderToggleProps {
  theme?: ThemeMode;
  className?: string;
}

export function MapProviderToggle({ theme = 'light', className = '' }: MapProviderToggleProps) {
  const { provider, setMapProvider, canUseGoogle } = useMapProvider();
  const isDark = theme === 'dark';

  return (
    <div
      className={`flex items-center gap-1 rounded-xl border p-1 shadow-lg backdrop-blur-md ${
        isDark ? 'border-zinc-700 bg-zinc-950/90 text-white' : 'border-slate-200 bg-white/95 text-slate-900'
      } ${className}`}
    >
      <button
        type="button"
        onClick={() => setMapProvider('standard')}
        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
          provider === 'standard'
            ? isDark
              ? 'bg-white text-black'
              : 'bg-slate-900 text-white'
            : isDark
              ? 'text-zinc-400 hover:text-white'
              : 'text-slate-600 hover:text-slate-900'
        }`}
        title="Mapa padrão (OpenStreetMap)"
      >
        <Layers className="h-3.5 w-3.5" />
        Padrão
      </button>

      <button
        type="button"
        onClick={() => canUseGoogle && setMapProvider('google')}
        disabled={!canUseGoogle}
        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
          provider === 'google'
            ? isDark
              ? 'bg-white text-black'
              : 'bg-slate-900 text-white'
            : isDark
              ? 'text-zinc-400 hover:text-white'
              : 'text-slate-600 hover:text-slate-900'
        }`}
        title={
          canUseGoogle
            ? 'Google Maps (mais detalhado)'
            : 'Configure VITE_GOOGLE_MAPS_API_KEY para usar Google Maps'
        }
      >
        <Map className="h-3.5 w-3.5" />
        Google
      </button>
    </div>
  );
}
