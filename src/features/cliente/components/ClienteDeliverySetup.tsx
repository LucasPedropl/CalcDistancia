import type { LocationPoint, ThemeMode } from '../../../types';

import type { MotoboyWithDistance } from '../../../services/motoboyService';

import type { SavedAddress } from '../../../services/addressService';

import { AddressInput } from '../../../components/AddressInput';

import { SavedOriginSelect } from '../../../components/SavedOriginSelect';

import { AvailableMotoboysList } from '../../../components/AvailableMotoboysList';

import { ArrowLeft, Bike, Loader2, Navigation } from 'lucide-react';



interface ClienteDeliverySetupProps {

  origin: SavedAddress | null;

  userId: string;

  onUpdateOrigin: (address: SavedAddress | null) => void;

  onOpenSettings: () => void;

  destination: LocationPoint | null;

  onUpdateDestination: (loc: LocationPoint | null) => void;

  onCalculateRoute: () => void;

  onBack: () => void;

  isRouteLoading: boolean;

  canCalculate: boolean;

  motoboys: MotoboyWithDistance[];

  selectedMotoboyId: string | null;

  onSelectMotoboy: (id: string | null) => void;
  favoriteMotoboyIds?: string[];
  onToggleFavorite?: (motoboyId: string) => void;
  deliveryDistanceKm?: number | null;
  theme?: ThemeMode;
}



export function ClienteDeliverySetup({

  origin,

  userId,

  onUpdateOrigin,

  onOpenSettings,

  destination,

  onUpdateDestination,

  onCalculateRoute,

  onBack,

  isRouteLoading,

  canCalculate,

  motoboys,

  selectedMotoboyId,

  onSelectMotoboy,
  favoriteMotoboyIds,
  onToggleFavorite,
  deliveryDistanceKm = null,
  theme = 'light',
}: ClienteDeliverySetupProps) {

  const isDark = theme === 'dark';

  const selectedMotoboy = motoboys.find((m) => m.id === selectedMotoboyId);



  return (

    <aside

      className={`flex h-full min-h-0 w-full flex-col overflow-y-auto border-r lg:max-w-none ${

        isDark ? 'border-zinc-800 bg-black text-white' : 'border-slate-200 bg-slate-50 text-slate-900'

      }`}

    >

      <div

        className={`sticky top-0 z-20 border-b p-6 backdrop-blur-md ${

          isDark ? 'border-zinc-800/80 bg-zinc-950/80' : 'border-slate-200 bg-white/90 shadow-xs'

        }`}

      >

        <button

          type="button"

          onClick={onBack}

          className={`mb-3 inline-flex items-center gap-1.5 text-xs font-semibold transition-colors ${

            isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'

          }`}

        >

          <ArrowLeft className="h-4 w-4" />

          Voltar ao mapa

        </button>

        <h2 className="text-lg font-bold tracking-tight">Nova Entrega</h2>

        <p className={`mt-0.5 text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>

          Informe o destino e calcule a rota

        </p>

      </div>



      <div className={`space-y-4 border-b p-6 ${isDark ? 'border-zinc-800 bg-zinc-950/30' : 'border-slate-200 bg-white'}`}>

        <SavedOriginSelect

          value={origin}

          onChange={onUpdateOrigin}

          userId={userId}

          theme={theme}

          onOpenSettings={onOpenSettings}

        />

        <AddressInput

          label="Destino ou CEP"

          placeholder="Informe o destino..."

          value={destination}

          onChange={onUpdateDestination}

          type="destination"

          theme={theme}

          autoFocus

        />

        <p className={`text-[11px] leading-relaxed ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
          Ou clique com o <strong>botão direito</strong> no mapa para escolher o destino.
        </p>

      </div>



      {selectedMotoboy && (

        <div className={`border-b p-6 ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>

          <div

            className={`flex items-center gap-3 rounded-xl border p-3 ${

              isDark ? 'border-white/20 bg-white/5' : 'border-slate-900/20 bg-slate-50'

            }`}

          >

            <Bike className="h-5 w-5" />

            <div>

              <p className="text-sm font-bold">Envio direto para {selectedMotoboy.name}</p>

              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>

                {selectedMotoboy.distanceKm.toFixed(1)} km de distância

              </p>

            </div>

          </div>

        </div>

      )}



      {!selectedMotoboy && motoboys.length > 0 && (

        <div className="flex-1 p-6">

          <p className={`mb-3 text-xs ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>

            Opcional: selecione um motoboy para envio direto

          </p>

          <AvailableMotoboysList
            motoboys={motoboys}
            selectedMotoboyId={selectedMotoboyId}
            onSelectMotoboy={onSelectMotoboy}
            favoriteMotoboyIds={favoriteMotoboyIds}
            onToggleFavorite={onToggleFavorite}
            deliveryDistanceKm={deliveryDistanceKm}
            theme={theme}
          />

        </div>

      )}



      <div

        className={`sticky bottom-0 z-20 mt-auto border-t p-6 ${

          isDark ? 'border-zinc-800 bg-zinc-950' : 'border-slate-200 bg-white'

        }`}

      >

        <button

          type="button"

          onClick={onCalculateRoute}

          disabled={!canCalculate || isRouteLoading}

          className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-bold shadow-lg transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${

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

              Calcular Rota

            </>

          )}

        </button>

      </div>

    </aside>

  );

}

