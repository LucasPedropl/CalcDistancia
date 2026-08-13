import { useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, Sparkles, X } from 'lucide-react';
import type { CondominiumPlan } from '../../../../types/condominium';
import {
  createCondominiumPlan,
  updateCondominiumPlan,
} from '../../../../services/condominiumPlanService';

interface PlanFormModalProps {
  plan?: CondominiumPlan;
  onClose: () => void;
}

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10';

export function PlanFormModal({ plan, onClose }: PlanFormModalProps) {
  const [name, setName] = useState(plan?.name ?? '');
  const [description, setDescription] = useState(plan?.description ?? '');
  const [monthlyPrice, setMonthlyPrice] = useState(
    plan ? (plan.monthlyPriceCents / 100).toFixed(2) : '0',
  );
  const [includedDeliveries, setIncludedDeliveries] = useState(
    plan?.includedDeliveries?.toString() ?? '',
  );
  const [features, setFeatures] = useState(plan?.features.join('\n') ?? '');
  const [isActive, setIsActive] = useState(plan?.isActive ?? true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Informe o nome do plano.');
      return;
    }

    const parsedPrice = Number(monthlyPrice.replace(',', '.'));
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      setError('Informe um valor mensal válido.');
      return;
    }

    const draft = {
      name: name.trim(),
      description: description.trim(),
      monthlyPriceCents: Math.round(parsedPrice * 100),
      includedDeliveries: includedDeliveries.trim() ? Number(includedDeliveries) : null,
      features: features
        .split('\n')
        .map((feature) => feature.trim())
        .filter(Boolean),
      isActive,
    };

    if (plan) {
      updateCondominiumPlan(plan.id, draft);
    } else {
      createCondominiumPlan(draft);
    }
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[1200] flex items-start justify-center overflow-y-auto bg-black/70 p-4 pt-12 backdrop-blur-sm sm:items-center sm:pt-4">
      <form
        onSubmit={handleSubmit}
        className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-slate-900" />
            <h3 className="text-lg font-bold text-slate-900">
              {plan ? 'Editar plano' : 'Novo plano'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Nome
            </span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoFocus
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Descrição
            </span>
            <input
              type="text"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className={inputClass}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Mensalidade (R$)
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={monthlyPrice}
                onChange={(event) => setMonthlyPrice(event.target.value)}
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Entregas incluídas
              </span>
              <input
                type="number"
                min={0}
                value={includedDeliveries}
                onChange={(event) => setIncludedDeliveries(event.target.value)}
                placeholder="Vazio = ilimitado"
                className={inputClass}
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Recursos (um por linha)
            </span>
            <textarea
              value={features}
              onChange={(event) => setFeatures(event.target.value)}
              rows={4}
              className={`${inputClass} resize-none`}
            />
          </label>

          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            <span className="text-sm text-slate-700">Plano ativo para contratação</span>
          </label>

          {error && (
            <p className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-2 border-t border-slate-200 p-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 rounded-xl bg-slate-900 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800"
          >
            Salvar plano
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
