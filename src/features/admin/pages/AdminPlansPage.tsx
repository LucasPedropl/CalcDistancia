import { useState } from 'react';
import { Check, Pencil, Plus, Trash2 } from 'lucide-react';
import type { CondominiumPlan } from '../../../types/condominium';
import { useAllCondominiums, useCondominiumPlans } from '../../../hooks/useCondominium';
import {
  deleteCondominiumPlan,
  formatPlanPrice,
} from '../../../services/condominiumPlanService';
import { AdminPageContainer } from '../components/AdminPageContainer';
import { PlanFormModal } from '../components/plans/PlanFormModal';

export function AdminPlansPage() {
  const plans = useCondominiumPlans();
  const condominiums = useAllCondominiums();
  const [editingPlan, setEditingPlan] = useState<CondominiumPlan | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const countSubscribers = (planId: string) =>
    condominiums.filter((condominium) => condominium.planId === planId).length;

  return (
    <AdminPageContainer
      title="Planos de condomínio"
      description="Planos oferecidos aos condomínios parceiros. O plano é vinculado na aprovação da parceria."
      actions={
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Novo plano
        </button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const subscribers = countSubscribers(plan.id);

          return (
            <div
              key={plan.id}
              className={`flex flex-col rounded-2xl border bg-white p-5 ${
                plan.isActive ? 'border-slate-200' : 'border-dashed border-slate-300 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-bold text-slate-900">{plan.name}</h3>
                {!plan.isActive && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500">
                    Inativo
                  </span>
                )}
              </div>

              <p className="mt-1 text-2xl font-black text-slate-900">
                {formatPlanPrice(plan.monthlyPriceCents)}
                {plan.monthlyPriceCents > 0 && (
                  <span className="text-xs font-semibold text-slate-500">/mês</span>
                )}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{plan.description}</p>

              <p className="mt-2 text-xs font-semibold text-slate-700">
                {plan.includedDeliveries === null
                  ? 'Entregas ilimitadas'
                  : `${plan.includedDeliveries} entregas/mês`}
              </p>

              <ul className="mt-3 flex-1 space-y-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-1.5 text-xs text-slate-600">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    {feature}
                  </li>
                ))}
              </ul>

              <p className="mt-3 text-[11px] text-slate-400">
                {subscribers} condomínio(s) vinculado(s)
              </p>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPlan(plan)}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-300 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </button>
                <button
                  type="button"
                  disabled={subscribers > 0}
                  title={
                    subscribers > 0 ? 'Desvincule os condomínios antes de excluir' : 'Excluir plano'
                  }
                  onClick={() => deleteCondominiumPlan(plan.id)}
                  className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {(isCreating || editingPlan) && (
        <PlanFormModal
          plan={editingPlan ?? undefined}
          onClose={() => {
            setIsCreating(false);
            setEditingPlan(null);
          }}
        />
      )}
    </AdminPageContainer>
  );
}
