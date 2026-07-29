import type { ThemeMode } from '../../../types';
import type { DeliveryOrder } from '../../../types/order';
import type { MotoboyWithDistance } from '../../../services/motoboyService';
import type { SavedAddress } from '../../../services/addressService';
import { SavedOriginSelect } from '../../../components/SavedOriginSelect';
import { AvailableMotoboysList } from '../../../components/AvailableMotoboysList';
import { ClienteActiveOrderCard } from './ClienteActiveOrderCard';
import { formatDistanceKm } from '../../../utils/distance';
import { Bike, Plus } from 'lucide-react';

interface ClienteHomeSidebarProps {
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
  clientActiveOrder?: DeliveryOrder | null;
  onViewActiveOrder?: () => void;
  onCancelActiveOrder?: () => void;
  theme?: ThemeMode;
}



export function ClienteHomeSidebar({
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
  clientActiveOrder = null,
  onViewActiveOrder,
  onCancelActiveOrder,
  theme = 'light',
}: ClienteHomeSidebarProps) {

  const isDark = theme === 'dark';

  const selectedMotoboy = motoboys.find((m) => m.id === selectedMotoboyId);



  return (

    <aside

      className={`flex h-full w-full shrink-0 flex-col overflow-y-auto border-r lg:w-112 ${

        isDark ? 'border-zinc-800 bg-black text-white' : 'border-slate-200 bg-slate-50 text-slate-900'

      }`}

    >
      <div className={`border-b p-6 ${isDark ? 'border-zinc-800 bg-zinc-950/30' : 'border-slate-200 bg-white'}`}>

        <SavedOriginSelect

          value={origin}

          onChange={onUpdateOrigin}

          userId={userId}

          theme={theme}

          onOpenSettings={() => onOpenSettings()}

        />

      </div>

      {clientActiveOrder && (
        <div className={`border-b p-6 ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
          <ClienteActiveOrderCard
            order={clientActiveOrder}
            theme={theme}
            onViewOrder={onViewActiveOrder}
            onCancelOrder={onCancelActiveOrder}
          />
        </div>
      )}

      <div className="flex-1 space-y-3 p-6">

        <div className="mb-1 flex items-center gap-2">

          <Bike className={`h-4 w-4 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`} />

          <span className="text-xs font-semibold uppercase tracking-wider">Próximos de você</span>

        </div>

        <AvailableMotoboysList
          motoboys={motoboys}
          selectedMotoboyId={selectedMotoboyId}
          onSelectMotoboy={onSelectMotoboy}
          favoriteMotoboyIds={favoriteMotoboyIds}
          onToggleFavorite={onToggleFavorite}
          theme={theme}
        />

      </div>



      <div

        className={`sticky bottom-0 z-20 mt-auto space-y-2 border-t p-6 ${

          isDark ? 'border-zinc-800 bg-zinc-950' : 'border-slate-200 bg-white'

        }`}

      >

        {selectedMotoboy ? (

          <button

            type="button"

            onClick={onSendToSelected}

            disabled={!origin}

            className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold shadow-lg transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${

              isDark

                ? 'bg-white text-black shadow-white/10 hover:bg-zinc-200'

                : 'bg-slate-900 text-white shadow-slate-900/10 hover:bg-slate-800'

            }`}

          >

            <Bike className="h-5 w-5" />

            Enviar para {selectedMotoboy.name}

          </button>

        ) : (

          <button

            type="button"

            onClick={onStartDelivery}

            disabled={!origin}

            className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold shadow-lg transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${

              isDark

                ? 'bg-white text-black shadow-white/10 hover:bg-zinc-200'

                : 'bg-slate-900 text-white shadow-slate-900/10 hover:bg-slate-800'

            }`}

          >

            <Plus className="h-5 w-5" />

            Nova Entrega

          </button>

        )}

        <p className={`text-center text-[10px] ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>

          {selectedMotoboy

            ? `${formatDistanceKm(selectedMotoboy.distanceKm)} de distância · pedido exclusivo`

            : 'Pedido global — qualquer motoboy pode aceitar'}

        </p>

      </div>

    </aside>

  );

}

