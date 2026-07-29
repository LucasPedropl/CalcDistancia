import { useState, type ReactNode } from 'react';
import type { ThemeMode } from '../../types';
import { Map, PanelLeft } from 'lucide-react';

export type MobileMapView = 'map' | 'panel';

interface ResponsiveMapShellProps {
  map: ReactNode;
  panel: ReactNode;
  theme?: ThemeMode;
  mapLabel?: string;
  panelLabel?: string;
  defaultMobileView?: MobileMapView;
}

export function ResponsiveMapShell({
  map,
  panel,
  theme = 'light',
  mapLabel = 'Mapa',
  panelLabel = 'Painel',
  defaultMobileView = 'map',
}: ResponsiveMapShellProps) {
  const isDark = theme === 'dark';
  const [mobileView, setMobileView] = useState<MobileMapView>(defaultMobileView);

  const tabBase =
    'flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors cursor-pointer';
  const tabActive = isDark ? 'bg-zinc-900 text-white' : 'bg-slate-900 text-white';
  const tabInactive = isDark
    ? 'text-zinc-400 hover:bg-zinc-900/50 hover:text-white'
    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900';

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        className={`flex shrink-0 border-b lg:hidden ${
          isDark ? 'border-zinc-800 bg-zinc-950' : 'border-slate-200 bg-white'
        }`}
        role="tablist"
        aria-label="Alternar entre mapa e painel"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mobileView === 'map'}
          onClick={() => setMobileView('map')}
          className={`${tabBase} ${mobileView === 'map' ? tabActive : tabInactive}`}
        >
          <Map className="h-4 w-4" />
          {mapLabel}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mobileView === 'panel'}
          onClick={() => setMobileView('panel')}
          className={`${tabBase} ${mobileView === 'panel' ? tabActive : tabInactive}`}
        >
          <PanelLeft className="h-4 w-4" />
          {panelLabel}
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <aside
          className={`flex min-h-0 w-full shrink-0 flex-col overflow-hidden border-r lg:flex lg:max-w-md lg:flex-[0_0_28rem] ${
            mobileView === 'panel' ? 'flex min-h-0 flex-1' : 'hidden lg:flex'
          } ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}
        >
          {panel}
        </aside>

        <main
          className={`relative min-h-0 min-w-0 flex-1 ${
            mobileView === 'map' ? 'flex min-h-0 flex-1' : 'hidden lg:flex'
          } ${isDark ? 'border-zinc-800 lg:border-l' : 'border-slate-200 lg:border-l'}`}
        >
          {map}
        </main>
      </div>
    </div>
  );
}
