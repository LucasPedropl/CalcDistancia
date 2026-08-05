import {
  Building2,
  MapPin,
  Bike,
  Package,
  User,
  AlertCircle,
} from 'lucide-react';
import type { CondominiumProfile } from '../../../services/condominiumService';
import type { DeliveryOrder } from '../../../types/order';
import {
  AddressRegistrationForm,
  type AddressRegistrationFormHandle,
} from '../../../components/AddressRegistrationForm';

interface CondominioDeliveriesSidebarProps {
  profile: CondominiumProfile | null;
  condoName: string;
  onCondoNameChange: (name: string) => void;
  activeDeliveries: DeliveryOrder[];
  registerError: string | null;
  onRegister: () => void;
  formRef: React.RefObject<AddressRegistrationFormHandle | null>;
}

export function CondominioDeliveriesSidebar({
  profile,
  condoName,
  onCondoNameChange,
  activeDeliveries,
  registerError,
  onRegister,
  formRef,
}: CondominioDeliveriesSidebarProps) {
  if (!profile) {
    return (
      <aside className="flex h-full min-h-0 w-full flex-col overflow-y-auto border-r border-slate-200 bg-slate-50 text-slate-900">
        <div className="border-b border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold tracking-tight">Cadastrar condomínio</h2>
              <p className="text-xs text-slate-500">
                Endereço usado para identificar entregas na portaria.
              </p>
            </div>
          </div>

          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Nome do condomínio
          </label>
          <input
            type="text"
            value={condoName}
            onChange={(e) => onCondoNameChange(e.target.value)}
            placeholder="Ex.: Residencial Golden Garden"
            className="mb-4 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
          />

          <AddressRegistrationForm ref={formRef} enableStreetSearch numberRequired={false} />

          <p className="mt-3 text-xs text-slate-500">
            Golden Garden: CEP <strong>29934-615</strong>, <strong>Av. Amocim Leite</strong>, bairro{' '}
            <strong>Aviação</strong>, São Mateus/ES — número <strong>S/N</strong>.
          </p>

          {registerError && (
            <p className="mt-3 flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {registerError}
            </p>
          )}

          <button
            type="button"
            onClick={() => void onRegister()}
            className="mt-4 w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800"
          >
            Cadastrar condomínio
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex h-full min-h-0 w-full flex-col overflow-y-auto border-r border-slate-200 bg-slate-50 text-slate-900">
      <div className="border-b border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold tracking-tight">{profile.name}</h2>
        <p className="mt-1 flex items-start gap-2 text-xs text-slate-500">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {profile.address.address}
        </p>
      </div>

      <div className="flex-1 space-y-3 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Entregas no condomínio
          </h3>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {activeDeliveries.length} ativa(s)
          </span>
        </div>

        {activeDeliveries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center">
            <Package className="mx-auto mb-3 h-8 w-8 text-slate-300" />
            <p className="text-sm text-slate-500">
              Nenhuma entrega com destino neste condomínio no momento.
            </p>
          </div>
        ) : (
          activeDeliveries.map((order) => (
            <article
              key={order.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] text-slate-400">{order.id}</p>
                  <p className="mt-1 flex items-center gap-2 font-semibold">
                    <Bike className="h-4 w-4 text-emerald-600" />
                    {order.acceptedMotoboyName ?? 'Aguardando motoboy'}
                  </p>
                </div>
                <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold">
                  {order.status === 'PENDING' && 'Pendente'}
                  {order.status === 'ACCEPTED' && 'A caminho da coleta'}
                  {order.status === 'PICKED_UP' && 'Entregando no condomínio'}
                </span>
              </div>

              <div className="mt-3 space-y-2">
                <div className="rounded-lg bg-slate-50 p-3 text-sm">
                  <p className="text-xs font-semibold uppercase text-slate-500">Destinatário</p>
                  <p className="mt-1 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    {order.recipientClientName ?? 'Morador'}
                    {order.recipientClientPhone && (
                      <span className="text-slate-500">· {order.recipientClientPhone}</span>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{order.destination.address}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 text-sm">
                  <p className="text-xs font-semibold uppercase text-slate-500">Estabelecimento</p>
                  <p className="mt-1">{order.clientName}</p>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </aside>
  );
}
