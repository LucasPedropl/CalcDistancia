import { useState } from 'react';
import { AlertCircle, Check, MapPin, Sparkles } from 'lucide-react';
import type { CondominiumProfile } from '../../../services/condominiumService';
import { updateCondominiumDetails } from '../../../services/condominiumPartnerService';
import { formatPlanPrice, getCondominiumPlanById } from '../../../services/condominiumPlanService';
import { formatPhoneMask } from '../../../utils/phoneValidation';
import { CondominioPageContainer } from '../components/CondominioPageContainer';
import { CondominioPartnerStatusBadge } from '../components/CondominioPartnerStatusBadge';

interface CondominioProfilePageProps {
  profile: CondominiumProfile;
}

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10';

export function CondominioProfilePage({ profile }: CondominioProfilePageProps) {
  const [name, setName] = useState(profile.name);
  const [cnpj, setCnpj] = useState(profile.cnpj ?? '');
  const [unitsCount, setUnitsCount] = useState(profile.unitsCount?.toString() ?? '');
  const [presidentName, setPresidentName] = useState(profile.presidentName ?? '');
  const [presidentPhone, setPresidentPhone] = useState(profile.presidentPhone ?? '');
  const [presidentEmail, setPresidentEmail] = useState(profile.presidentEmail ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const plan = getCondominiumPlanById(profile.planId);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSaved(false);

    try {
      updateCondominiumDetails(profile.userId, {
        name,
        cnpj,
        unitsCount: unitsCount ? Number(unitsCount) : undefined,
        presidentName,
        presidentPhone,
        presidentEmail,
      });
      setIsSaved(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Erro ao salvar os dados.');
    }
  };

  return (
    <CondominioPageContainer
      title="Perfil do condomínio"
      description="Dados exibidos para a retaguarda durante a análise da parceria e para o motoboy na chegada."
      actions={<CondominioPartnerStatusBadge status={profile.partnerStatus} />}
    >
      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5">
        <p className="flex items-start gap-2 text-sm text-slate-700">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
          <span>
            <strong className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Endereço da portaria
            </strong>
            {profile.address.address}
          </span>
        </p>
      </div>

      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-900">Plano contratado</h3>
        </div>
        {plan ? (
          <div className="mt-2">
            <p className="text-sm font-semibold text-slate-800">
              {plan.name} · {formatPlanPrice(plan.monthlyPriceCents)}/mês
            </p>
            <p className="mt-1 text-xs text-slate-500">{plan.description}</p>
            <ul className="mt-2 space-y-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-1.5 text-xs text-slate-600">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-2 text-xs text-slate-500">
            Nenhum plano vinculado. A retaguarda define o plano ao aprovar a parceria.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-bold text-slate-900">Dados cadastrais</h3>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Nome do condomínio
            </span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
              CNPJ
            </span>
            <input
              type="text"
              value={cnpj}
              onChange={(event) => setCnpj(event.target.value)}
              placeholder="00.000.000/0001-00"
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Total de unidades
            </span>
            <input
              type="number"
              min={0}
              value={unitsCount}
              onChange={(event) => setUnitsCount(event.target.value)}
              placeholder="120"
              className={inputClass}
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Presidente / Síndico
            </span>
            <input
              type="text"
              value={presidentName}
              onChange={(event) => setPresidentName(event.target.value)}
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Telefone do responsável
            </span>
            <input
              type="tel"
              value={presidentPhone}
              onChange={(event) => setPresidentPhone(formatPhoneMask(event.target.value))}
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
              E-mail do responsável
            </span>
            <input
              type="email"
              value={presidentEmail}
              onChange={(event) => setPresidentEmail(event.target.value)}
              className={inputClass}
            />
          </label>
        </div>

        {error && (
          <p className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        {isSaved && !error && (
          <p className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            <Check className="h-4 w-4" />
            Dados atualizados.
          </p>
        )}

        <button
          type="submit"
          className="mt-4 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800"
        >
          Salvar dados
        </button>
      </form>
    </CondominioPageContainer>
  );
}
