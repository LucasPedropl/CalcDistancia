import { Bike, ClipboardList, DoorOpen, LogOut, ShieldCheck, UserCheck } from 'lucide-react';
import type { CondominiumProfile } from '../../../services/condominiumService';
import { useCondominiumVisits } from '../../../hooks/useCondominium';
import { useOrdersForCondominium } from '../../../hooks/useOrders';
import { registerVisitExit } from '../../../services/condominiumVisitService';
import { CondominioPageContainer } from '../components/CondominioPageContainer';

interface CondominioVisitsPageProps {
  profile: CondominiumProfile;
}

export function CondominioVisitsPage({ profile }: CondominioVisitsPageProps) {
  const visits = useCondominiumVisits(profile.userId);
  const activeDeliveries = useOrdersForCondominium(profile.userId, profile.address);

  const motoboysInRoute = activeDeliveries.filter((order) => order.acceptedMotoboyName);

  return (
    <CondominioPageContainer
      title="Auditoria de visitas"
      description="Histórico de entradas de motoboys no condomínio e quem está em rota neste momento."
    >
      <section className="mb-8">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Motoboys em rota ({motoboysInRoute.length})
        </h3>
        {motoboysInRoute.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6 text-center text-sm text-slate-500">
            Nenhum motoboy a caminho do condomínio agora.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {motoboysInRoute.map((order) => (
              <div key={order.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Bike className="h-4 w-4 text-emerald-600" />
                  {order.acceptedMotoboyName}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Entrega para {order.recipientClientName ?? 'morador'} · pedido {order.trackingCode}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">{order.destination.address}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Histórico de visitas ({visits.length})
        </h3>
        {visits.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center">
            <ClipboardList className="mx-auto mb-3 h-8 w-8 text-slate-300" />
            <p className="text-sm text-slate-500">
              Nenhuma visita registrada. O registro acontece quando o motoboy confirma a chegada.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visits.map((visit) => (
              <div key={visit.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
                      <Bike className="h-4 w-4 text-slate-500" />
                      {visit.motoboyName}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
                      <UserCheck className="h-3.5 w-3.5" />
                      {visit.residentName}
                      {visit.unitLabel && <span className="text-slate-400">· {visit.unitLabel}</span>}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">{visit.destinationAddress}</p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                        visit.authorizationMethod === 'PARTNER_AUTH'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-slate-100 text-slate-600'
                      }`}
                    >
                      {visit.authorizationMethod === 'PARTNER_AUTH' ? (
                        <ShieldCheck className="h-3.5 w-3.5" />
                      ) : (
                        <DoorOpen className="h-3.5 w-3.5" />
                      )}
                      {visit.authorizationMethod === 'PARTNER_AUTH'
                        ? 'Morador autorizado'
                        : 'Identificação convencional'}
                    </span>
                    <p className="mt-1.5 text-[11px] text-slate-500">
                      Entrada: {new Date(visit.enteredAt).toLocaleString('pt-BR')}
                    </p>
                    {visit.exitedAt ? (
                      <p className="text-[11px] text-slate-400">
                        Saída: {new Date(visit.exitedAt).toLocaleString('pt-BR')}
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={() => registerVisitExit(visit.id)}
                        className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                      >
                        <LogOut className="h-3 w-3" />
                        Registrar saída
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </CondominioPageContainer>
  );
}
