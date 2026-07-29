import React from 'react';
import type { LocationPoint, RouteData, PriceTier, ThemeMode } from '../types';
import type { DeliveryOrder } from '../types/order';
import type { MotoboyWithDistance } from '../services/motoboyService';
import type { SavedAddress } from '../services/addressService';
import { SidebarMenu } from './SidebarMenu';
import { RouteMap } from './RouteMap';
import { HeaderNav } from './HeaderNav';

interface Screen2MainViewProps {
  routeData: RouteData;
  origin: SavedAddress | null;
  userId: string;
  onUpdateOrigin: (loc: SavedAddress | null) => void;
  onUpdateDestination: (loc: LocationPoint | null) => void;
  onOpenSettings: () => void;
  onConfirmPedido: (price: number | null, tier?: PriceTier) => void;
  priceTiers: PriceTier[];
  theme: ThemeMode;
  onToggleTheme: () => void;
  onLogout: () => void;
  userName?: string;
  userEmail?: string;
  availableMotoboys: MotoboyWithDistance[];
  selectedMotoboyId: string | null;
  onSelectMotoboy: (motoboyId: string | null) => void;
  pendingOrder: DeliveryOrder | null;
  onNewOrder: () => void;
  onCancelOrder?: () => void;
  onMapContextMenu?: (lat: number, lng: number, clientX: number, clientY: number) => void;
}

export const Screen2MainView: React.FC<Screen2MainViewProps> = ({
  routeData,
  origin,
  userId,
  onUpdateOrigin,
  onUpdateDestination,
  onOpenSettings,
  onConfirmPedido,
  priceTiers,
  theme,
  onToggleTheme,
  onLogout,
  userName,
  userEmail,
  availableMotoboys,
  selectedMotoboyId,
  onSelectMotoboy,
  pendingOrder,
  onNewOrder,
  onCancelOrder,
  onMapContextMenu,
}) => {
  const isDark = theme === 'dark';

  return (
    <div
      className={`flex h-screen w-screen flex-col overflow-hidden font-sans transition-colors ${
        isDark ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <HeaderNav
        onOpenSettings={onOpenSettings}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onLogout={onLogout}
        userName={userName}
        userEmail={userEmail}
      />

      <div className="relative flex flex-1 flex-col overflow-hidden lg:flex-row">
        <SidebarMenu
          routeData={routeData}
          origin={origin}
          userId={userId}
          onUpdateOrigin={onUpdateOrigin}
          onUpdateDestination={onUpdateDestination}
          onOpenSettings={onOpenSettings}
          onConfirmPedido={onConfirmPedido}
          priceTiers={priceTiers}
          theme={theme}
          availableMotoboys={availableMotoboys}
          selectedMotoboyId={selectedMotoboyId}
          onSelectMotoboy={onSelectMotoboy}
          pendingOrder={pendingOrder}
          onNewOrder={onNewOrder}
          onCancelOrder={onCancelOrder}
        />

        <main
          className={`relative h-full flex-1 border-t lg:border-t-0 lg:border-l ${
            isDark ? 'border-zinc-800' : 'border-slate-200'
          }`}
        >
          <RouteMap
            routeData={routeData}
            theme={theme}
            availableMotoboys={availableMotoboys}
            selectedMotoboyId={selectedMotoboyId}
            onMotoboySelect={(id) => onSelectMotoboy(id)}
            onMapContextMenu={onMapContextMenu}
          />
        </main>
      </div>
    </div>
  );
};
