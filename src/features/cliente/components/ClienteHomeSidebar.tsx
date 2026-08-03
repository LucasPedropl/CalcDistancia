import type { LocationPoint, ThemeMode } from '../../../types';
import type { DeliveryOrder } from '../../../types/order';
import type { MotoboyWithDistance } from '../../../services/motoboyService';
import type { SavedAddress } from '../../../services/addressService';
import type { AddressFormFields } from '../../../types/addressForm';
import { AddressInput } from '../../../components/AddressInput';
import { OriginAddressButton } from '../../../components/OriginAddressButton';
import { AvailableMotoboysList } from '../../../components/AvailableMotoboysList';
import { RadiusKmControl } from '../../../components/RadiusKmControl';
import { ClienteActiveOrderCard } from './ClienteActiveOrderCard';
import { formatDistanceKm } from '../../../utils/distance';
import { Bike, Loader2, Navigation } from 'lucide-react';

interface ClienteHomeSidebarProps {
  origin: SavedAddress | null;
  userId: string;
  onUpdateOrigin: (address: SavedAddress | null) => void;
  destination: LocationPoint | null;
  onUpdateDestination: (loc: LocationPoint | null) => void;
  isOriginModalOpen?: boolean;
  onOriginModalOpenChange?: (open: boolean) => void;
  originFormInitial?: Partial<AddressFormFields>;
  motoboys: MotoboyWithDistance[];
  selectedMotoboyId: string | null;
  onSelectMotoboy: (motoboyId: string | null) => void;
  favoriteMotoboyIds?: string[];
  onToggleFavorite?: (motoboyId: string) => void;
  motoboySearchRadiusKm?: number;
  onMotoboySearchRadiusChange?: (radiusKm: number) => void;
  clientActiveOrder?: DeliveryOrder | null;
  onViewActiveOrder?: () => void;
  onCancelActiveOrder?: () => void;
  isRouteLoading?: boolean;
  canStartRide?: boolean;
  onStartRide?: () => void;
  theme?: ThemeMode;
}

export function ClienteHomeSidebar({
  origin,
  userId,
  onUpdateOrigin,
  destination,
  onUpdateDestination,
  isOriginModalOpen,
  onOriginModalOpenChange,
  originFormInitial,
  motoboys,
  selectedMotoboyId,
  onSelectMotoboy,
  favoriteMotoboyIds,
  onToggleFavorite,
  motoboySearchRadiusKm = 15,
  onMotoboySearchRadiusChange,
  clientActiveOrder = null,
  onViewActiveOrder,
  onCancelActiveOrder,
  isRouteLoading = false,
  canStartRide = false,
  onStartRide,
  theme = 'light',
}: ClienteHomeSidebarProps) {
  const isDark = theme === 'dark';
  const selectedMotoboy = motoboys.find((m) => m.id === selectedMotoboyId);

  return (
    <aside
      className={`flex h-full min-h-0 w-full flex-col overflow-y-auto border-r lg:max-w-none ${
        isDark ? 'border-zinc-800 bg-black text-white' : 'border-slate-200 bg-slate-50 text-slate-900'
      }`}
    >
      <div className={`border-b p-6 ${isDark ? 'border-zinc-800 bg-zinc-950/30' : 'border-slate-200 bg-white'}`}>
        <h2 className="text-lg font-bold tracking-tight">Nova corrida</h2>
        <p className={`mt-0.5 text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
          Informe origem e destino para ir direto à corrida
        </p>

        <div className="mt-4 space-y-3">
          <OriginAddressButton
            value={origin}
            onChange={onUpdateOrigin}
            userId={userId}
            theme={theme}
            initialFields={originFormInitial}
            isModalOpen={isOriginModalOpen}
            onModalOpenChange={onOriginModalOpenChange}
          />

          <AddressInput
            label="Destino"
            placeholder="Informe o destino ou CEP..."
            value={destination}
            onChange={onUpdateDestination}
            type="destination"
            theme={theme}
          />

          <p className={`text-[11px] leading-relaxed ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
            Ou clique com o <strong>botão direito</strong> no mapa para marcar origem ou destino.
          </p>
        </div>
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

        {onMotoboySearchRadiusChange && (
          <RadiusKmControl
            valueKm={motoboySearchRadiusKm}
            onChange={onMotoboySearchRadiusChange}
            theme={theme}
            label="Raio de busca"
            hint="Exibe apenas motoboys dentro deste raio a partir da sua origem."
          />
        )}

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
        <button
          type="button"
          onClick={onStartRide}
          disabled={!canStartRide || isRouteLoading}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold shadow-lg transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
            isDark
              ? 'bg-white text-black shadow-white/10 hover:bg-zinc-200'
              : 'bg-slate-900 text-white shadow-slate-900/10 hover:bg-slate-800'
          }`}
        >
          {isRouteLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Calculando rota...
            </>
          ) : (
            <>
              <Navigation className="h-5 w-5" />
              {selectedMotoboy ? `Ir para corrida com ${selectedMotoboy.name}` : 'Ir para corrida'}
            </>
          )}
        </button>

        <p className={`text-center text-[10px] ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>
          {selectedMotoboy
            ? `${formatDistanceKm(selectedMotoboy.distanceKm)} de distância · pedido exclusivo`
            : 'Pedido global — qualquer motoboy pode aceitar'}
        </p>
      </div>
    </aside>
  );
}
