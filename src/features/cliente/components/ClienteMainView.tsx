import type { ThemeMode } from '../../../types';
import type { DeliveryOrder } from '../../../types/order';
import type { MotoboyWithDistance } from '../../../services/motoboyService';
import type { SavedAddress } from '../../../services/addressService';
import { HeaderNav } from '../../../components/HeaderNav';
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
  theme,

  onToggleTheme,

  onLogout,

  userName,
  userEmail,
  clientActiveOrder = null,
  onViewActiveOrder,
  onCancelActiveOrder,
}: ClienteMainViewProps) {

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
        onlineMotoboyCount={motoboys.length}
        motoboyRegionLabel={origin ? 'na sua região' : 'em Belo Horizonte (demo)'}
      />

      <div className="relative z-0 flex flex-1 flex-col overflow-hidden lg:flex-row">

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
          clientActiveOrder={clientActiveOrder}
          onViewActiveOrder={onViewActiveOrder}
          onCancelActiveOrder={onCancelActiveOrder}
          theme={theme}

        />



        <main
          className={`relative z-0 h-full flex-1 border-t lg:border-t-0 lg:border-l ${

            isDark ? 'border-zinc-800' : 'border-slate-200'

          }`}

        >

          <ClienteHomeMap

            origin={origin}

            motoboys={motoboys}

            selectedMotoboyId={selectedMotoboyId}

            onMotoboySelect={(id) => onSelectMotoboy(id)}

            theme={theme}

          />

        </main>

      </div>

    </div>

  );

}

