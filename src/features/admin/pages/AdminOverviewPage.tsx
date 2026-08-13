import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, CheckCircle2, Clock, Database, Sparkles, XCircle } from 'lucide-react';
import { useAllCondominiums, useCondominiumPlans } from '../../../hooks/useCondominium';
import { seedDemoData, type DemoSeedResult } from '../../../services/demoSeedService';
import { AdminPageContainer } from '../components/AdminPageContainer';

export function AdminOverviewPage() {
  const condominiums = useAllCondominiums();
  const plans = useCondominiumPlans();
  const [seedResult, setSeedResult] = useState<DemoSeedResult | null>(null);

  const pendingReview = condominiums.filter(
    (condominium) => condominium.partnerStatus === 'PENDING_REVIEW',
  ).length;
  const approved = condominiums.filter(
    (condominium) => condominium.partnerStatus === 'APPROVED',
  ).length;
  const rejected = condominiums.filter(
    (condominium) => condominium.partnerStatus === 'REJECTED',
  ).length;

  const cards = [
    { label: 'Condomínios cadastrados', value: condominiums.length, icon: Building2 },
    { label: 'Aguardando análise', value: pendingReview, icon: Clock },
    { label: 'Parceiros ativos', value: approved, icon: CheckCircle2 },
    { label: 'Rejeitados', value: rejected, icon: XCircle },
    { label: 'Planos cadastrados', value: plans.length, icon: Sparkles },
  ];

  return (
    <AdminPageContainer
      title="Visão geral"
      description="Resumo da operação de condomínios parceiros e atalhos para as rotinas da retaguarda."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Icon className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
            </div>
            <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      {pendingReview > 0 && (
        <Link
          to="/admin/condominios"
          className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 transition-colors hover:bg-amber-100"
        >
          <div>
            <p className="text-sm font-bold text-amber-900">
              {pendingReview} condomínio(s) aguardando análise documental
            </p>
            <p className="mt-1 text-xs text-amber-800">
              Analise a ata da assembleia e a identidade do síndico para liberar a parceria.
            </p>
          </div>
          <span className="shrink-0 text-sm font-bold text-amber-900">Analisar</span>
        </Link>
      )}

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-slate-700" />
          <h3 className="text-sm font-bold text-slate-900">Dados de demonstração</h3>
        </div>
        <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-600">
          Os dados ficam no navegador. Para apresentar os fluxos de aprovação sem precisar de
          várias máquinas, popule condomínios em estados diferentes, moradores e visitas.
        </p>

        {seedResult && (
          <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
            {seedResult.condominiumsCreated} condomínio(s), {seedResult.residentsCreated} morador(es)
            e {seedResult.visitsCreated} visita(s) adicionados. Registros já existentes foram
            mantidos.
          </p>
        )}

        <button
          type="button"
          onClick={() => setSeedResult(seedDemoData())}
          className="mt-4 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800"
        >
          Popular dados de demonstração
        </button>
      </section>
    </AdminPageContainer>
  );
}
