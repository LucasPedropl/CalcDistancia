import type { ThemeMode } from '../../../types';
import type { DeliveryOrder } from '../../../types/order';
import type { MotoboyWithDistance } from '../../../services/motoboyService';
import type { SavedAddress } from '../../../services/addressService';
import { HeaderNav } from '../../../components/HeaderNav';
import { AppViewport } from '../../../components/layout/AppViewport';
import { ResponsiveMapShell } from '../../../components/layout/ResponsiveMapShell';
import { ClienteHomeSidebar } from './ClienteHomeSidebar';
import { ClienteHomeMap } from './ClienteHomeMap';

interface ClienteMainViewProps {
  origin: SavedAddress | null;
  userId: string;
  onUpdateOrigin: (address: SavedAddress | null) => void;
  onOpenSettings: () => void;
  motoboys: MotoboyWithDistance[];
  selectedMotoboyId: string | null;
  onSelectMotoboy: (motoboyId: string | null) => void;
  onStartDelivery: () => void;
  onSendToSelected: () => void;
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
}

export function ClienteMainView({
  origin,
  userId,
  onUpdateOrigin,
  onOpenSettings,
  motoboys,
  selectedMotoboyId,
  onSelectMotoboy,
  onStartDelivery,
  onSendToSelected,
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
        panelLabel="Início"
        map={
          <ClienteHomeMap
            origin={origin}
            motoboys={motoboys}
            selectedMotoboyId={selectedMotoboyId}
            onMotoboySelect={(id) => onSelectMotoboy(id)}
            theme={theme}
          />
        }
        panel={
          <ClienteHomeSidebar
            origin={origin}
            userId={userId}
            onUpdateOrigin={onUpdateOrigin}
            onOpenSettings={onOpenSettings}
            motoboys={motoboys}
            selectedMotoboyId={selectedMotoboyId}
            onSelectMotoboy={onSelectMotoboy}
            onStartDelivery={onStartDelivery}
            onSendToSelected={onSendToSelected}
            favoriteMotoboyIds={favoriteMotoboyIds}
            onToggleFavorite={onToggleFavorite}
            motoboySearchRadiusKm={motoboySearchRadiusKm}
            onMotoboySearchRadiusChange={onMotoboySearchRadiusChange}
            clientActiveOrder={clientActiveOrder}
            onViewActiveOrder={onViewActiveOrder}
            onCancelActiveOrder={onCancelActiveOrder}
            theme={theme}
          />
        }
      />
    </AppViewport>
  );
}
