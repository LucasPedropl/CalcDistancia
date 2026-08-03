import type { LocationPoint, ThemeMode } from '../../../types';
import type { DeliveryOrder } from '../../../types/order';
import type { MotoboyWithDistance } from '../../../services/motoboyService';
import type { SavedAddress } from '../../../services/addressService';
import type { AddressFormFields } from '../../../types/addressForm';
import { HeaderNav } from '../../../components/HeaderNav';
import { AppViewport } from '../../../components/layout/AppViewport';
import { ResponsiveMapShell } from '../../../components/layout/ResponsiveMapShell';
import { ClienteHomeSidebar } from './ClienteHomeSidebar';
import { ClienteHomeMap } from './ClienteHomeMap';

interface ClienteMainViewProps {
  origin: SavedAddress | null;
  userId: string;
  onUpdateOrigin: (address: SavedAddress | null) => void;
  destination: LocationPoint | null;
  onUpdateDestination: (loc: LocationPoint | null) => void;
  isOriginModalOpen?: boolean;
  onOriginModalOpenChange?: (open: boolean) => void;
  originFormInitial?: Partial<AddressFormFields>;
  onOpenSettings: () => void;
  motoboys: MotoboyWithDistance[];
  selectedMotoboyId: string | null;
  onSelectMotoboy: (motoboyId: string | null) => void;
  favoriteMotoboyIds?: string[];
  onToggleFavorite?: (motoboyId: string) => void;
  motoboySearchRadiusKm?: number;
  onMotoboySearchRadiusChange?: (radiusKm: number) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onLogout: () => void;
  userName?: string;
  userEmail?: string;
  clientActiveOrder?: DeliveryOrder | null;
  onViewActiveOrder?: () => void;
  onCancelActiveOrder?: () => void;
  isRouteLoading?: boolean;
  canStartRide?: boolean;
  onStartRide?: () => void;
  onMapContextMenu?: (lat: number, lng: number, clientX: number, clientY: number) => void;
}

export function ClienteMainView({
  origin,
  userId,
  onUpdateOrigin,
  destination,
  onUpdateDestination,
  isOriginModalOpen,
  onOriginModalOpenChange,
  originFormInitial,
  onOpenSettings,
  motoboys,
  selectedMotoboyId,
  onSelectMotoboy,
  favoriteMotoboyIds,
  onToggleFavorite,
  motoboySearchRadiusKm,
  onMotoboySearchRadiusChange,
  theme,
  onToggleTheme,
  onLogout,
  userName,
  userEmail,
  clientActiveOrder = null,
  onViewActiveOrder,
  onCancelActiveOrder,
  isRouteLoading = false,
  canStartRide = false,
  onStartRide,
  onMapContextMenu,
}: ClienteMainViewProps) {
  return (
    <AppViewport theme={theme}>
      <HeaderNav
        onOpenSettings={onOpenSettings}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onLogout={onLogout}
        userName={userName}
        userEmail={userEmail}
        onlineMotoboyCount={motoboys.length}
        motoboyRegionLabel={origin ? 'na sua região' : 'em São Mateus, ES (demo)'}
      />

      <ResponsiveMapShell
        theme={theme}
        mapLabel="Mapa"
        panelLabel="Corrida"
        defaultMobileView={destination ? 'panel' : 'map'}
        map={
          <ClienteHomeMap
            origin={origin}
            motoboys={motoboys}
            selectedMotoboyId={selectedMotoboyId}
            onMotoboySelect={(id) => onSelectMotoboy(id)}
            onMapContextMenu={onMapContextMenu}
            destination={destination}
            theme={theme}
          />
        }
        panel={
          <ClienteHomeSidebar
            origin={origin}
            userId={userId}
            onUpdateOrigin={onUpdateOrigin}
            destination={destination}
            onUpdateDestination={onUpdateDestination}
            isOriginModalOpen={isOriginModalOpen}
            onOriginModalOpenChange={onOriginModalOpenChange}
            originFormInitial={originFormInitial}
            motoboys={motoboys}
            selectedMotoboyId={selectedMotoboyId}
            onSelectMotoboy={onSelectMotoboy}
            favoriteMotoboyIds={favoriteMotoboyIds}
            onToggleFavorite={onToggleFavorite}
            motoboySearchRadiusKm={motoboySearchRadiusKm}
            onMotoboySearchRadiusChange={onMotoboySearchRadiusChange}
            clientActiveOrder={clientActiveOrder}
            onViewActiveOrder={onViewActiveOrder}
            onCancelActiveOrder={onCancelActiveOrder}
            isRouteLoading={isRouteLoading}
            canStartRide={canStartRide}
            onStartRide={onStartRide}
            theme={theme}
          />
        }
      />
    </AppViewport>
  );
}
