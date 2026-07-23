import React from 'react';
import type { LocationPoint, RouteData, PriceTier, ThemeMode } from '../types';
import { SidebarMenu } from './SidebarMenu';
import { RouteMap } from './RouteMap';
import { HeaderNav } from './HeaderNav';

interface Screen2MainViewProps {
  routeData: RouteData;
  onUpdateOrigin: (loc: LocationPoint | null) => void;
  onUpdateDestination: (loc: LocationPoint | null) => void;
  onOpenPriceConfig: () => void;
  onConfirmPedido: (price: number | null, tier?: PriceTier) => void;
  priceTiers: PriceTier[];
  useGoogleMaps: boolean;
  onToggleMapEngine: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onLogout: () => void;
  canEditPriceTable: boolean;
}

export const Screen2MainView: React.FC<Screen2MainViewProps> = ({
  routeData,
  onUpdateOrigin,
  onUpdateDestination,
  onOpenPriceConfig,
  onConfirmPedido,
  priceTiers,
  useGoogleMaps,
  onToggleMapEngine,
  theme,
  onToggleTheme,
  onLogout,
  canEditPriceTable,
}) => {
  const isDark = theme === 'dark';

  return (
    <div
      className={`h-screen w-screen flex flex-col overflow-hidden font-sans transition-colors ${
        isDark ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <HeaderNav
        onOpenPriceConfig={canEditPriceTable ? onOpenPriceConfig : undefined}
        useGoogleMaps={useGoogleMaps}
        onToggleMapEngine={onToggleMapEngine}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onLogout={onLogout}
      />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        <SidebarMenu
          routeData={routeData}
          onUpdateOrigin={onUpdateOrigin}
          onUpdateDestination={onUpdateDestination}
          onConfirmPedido={onConfirmPedido}
          priceTiers={priceTiers}
          theme={theme}
        />

        <main
          className={`flex-1 h-full relative border-t lg:border-t-0 lg:border-l ${
            isDark ? 'border-zinc-800' : 'border-slate-200'
          }`}
        >
          <RouteMap routeData={routeData} useGoogleMaps={useGoogleMaps} theme={theme} />
        </main>
      </div>
    </div>
  );
};
