import { formatPlanPrice } from '../../../../services/condominiumPlanService';
import { useCondominiumPlans } from '../../../../hooks/useCondominium';
import { formatPhoneMask } from '../../../../utils/phoneValidation';

export interface AdminCondominiumFormValues {
  name: string;
  email: string;
  cnpj: string;
  unitsCount: string;
  presidentName: string;
  presidentPhone: string;
  planId: string;
}

interface AdminCondominiumFormFieldsProps {
  values: AdminCondominiumFormValues;
  onChange: (patch: Partial<AdminCondominiumFormValues>) => void;
}

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10';

const labelClass =
  'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600';

export function AdminCondominiumFormFields({
  values,
  onChange,
}: AdminCondominiumFormFieldsProps) {
  const plans = useCondominiumPlans();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block">
        <span className={labelClass}>Nome do condomínio</span>
        <input
          type="text"
          value={values.name}
          onChange={(event) => onChange({ name: event.target.value })}
          placeholder="Residencial Golden Garden"
          autoFocus
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>E-mail de acesso</span>
        <input
          type="email"
          value={values.email}
          onChange={(event) => onChange({ email: event.target.value })}
          placeholder="portaria@condominio.com"
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>CNPJ</span>
        <input
          type="text"
          value={values.cnpj}
          onChange={(event) => onChange({ cnpj: event.target.value })}
          placeholder="00.000.000/0001-00"
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>Total de unidades</span>
        <input
          type="number"
          min={0}
          value={values.unitsCount}
          onChange={(event) => onChange({ unitsCount: event.target.value })}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>Síndico / Presidente</span>
        <input
          type="text"
          value={values.presidentName}
          onChange={(event) => onChange({ presidentName: event.target.value })}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>Telefone do síndico</span>
        <input
          type="tel"
          value={values.presidentPhone}
          onChange={(event) => onChange({ presidentPhone: formatPhoneMask(event.target.value) })}
          className={inputClass}
        />
      </label>

      <label className="block sm:col-span-2">
        <span className={labelClass}>Plano</span>
        <select
          value={values.planId}
          onChange={(event) => onChange({ planId: event.target.value })}
          className={inputClass}
        >
          <option value="">Sem plano</option>
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name} · {formatPlanPrice(plan.monthlyPriceCents)}/mês
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
