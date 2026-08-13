import { useMemo, useState } from 'react';
import { Building2, MapPin, Plus, Search } from 'lucide-react';
import type { CondominiumPartnerStatus } from '../../../types/condominium';
import { CONDOMINIUM_PARTNER_STATUS_LABELS } from '../../../types/condominium';
import type { CondominiumProfile } from '../../../services/condominiumService';
import { useAllCondominiums } from '../../../hooks/useCondominium';
import { getCondominiumPlanById } from '../../../services/condominiumPlanService';
import { useAuth } from '../../../context/AuthContext';
import { AdminPageContainer } from '../components/AdminPageContainer';
import { AdminCondominiumDetailDrawer } from '../components/condominiums/AdminCondominiumDetailDrawer';
import { AdminCondominiumFormModal } from '../components/condominiums/AdminCondominiumFormModal';
import { CondominioPartnerStatusBadge } from '../../condominio/components/CondominioPartnerStatusBadge';

type StatusFilter = CondominiumPartnerStatus | 'ALL';

const STATUS_FILTERS: StatusFilter[] = [
  'ALL',
  'PENDING_REVIEW',
  'APPROVED',
  'DRAFT',
  'REJECTED',
  'SUSPENDED',
];

export function AdminCondominiumsPage() {
  const { user } = useAuth();
  const condominiums = useAllCondominiums();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCondominiumId, setSelectedCondominiumId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return condominiums
      .filter(
        (condominium) => statusFilter === 'ALL' || condominium.partnerStatus === statusFilter,
      )
      .filter(
        (condominium) =>
          !term ||
          condominium.name.toLowerCase().includes(term) ||
          condominium.address.address.toLowerCase().includes(term),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [condominiums, statusFilter, searchTerm]);

  const selectedCondominium = condominiums.find(
    (condominium) => condominium.userId === selectedCondominiumId,
  );

  return (
    <AdminPageContainer
      title="Condomínios"
      description="Cadastre condomínios, analise a documentação enviada e vincule o plano contratado. Só condomínios aprovados aparecem no fluxo de entrega."
      actions={
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Cadastrar condomínio
        </button>
      }
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar por nome ou endereço..."
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-slate-900 focus:outline-none"
          />
        </div>

        <div className="flex gap-1 overflow-x-auto">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                statusFilter === status
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status === 'ALL' ? 'Todos' : CONDOMINIUM_PARTNER_STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-10 text-center">
          <Building2 className="mx-auto mb-3 h-8 w-8 text-slate-300" />
          <p className="text-sm text-slate-500">Nenhum condomínio encontrado com esse filtro.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((condominium) => (
            <CondominiumRow
              key={condominium.userId}
              condominium={condominium}
              onSelect={() => setSelectedCondominiumId(condominium.userId)}
            />
          ))}
        </div>
      )}

      {selectedCondominium && (
        <AdminCondominiumDetailDrawer
          condominium={selectedCondominium}
          adminId={user?.id ?? 'admin'}
          onClose={() => setSelectedCondominiumId(null)}
        />
      )}

      {isCreating && <AdminCondominiumFormModal onClose={() => setIsCreating(false)} />}
    </AdminPageContainer>
  );
}

function CondominiumRow({
  condominium,
  onSelect,
}: {
  condominium: CondominiumProfile;
  onSelect: () => void;
}) {
  const plan = getCondominiumPlanById(condominium.planId);

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full flex-wrap items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-slate-400"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-slate-900">{condominium.name}</p>
        <p className="mt-1 flex items-start gap-1.5 text-xs text-slate-500">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {condominium.address.address}
        </p>
        <p className="mt-1 text-[11px] text-slate-400">
          {plan ? `Plano ${plan.name}` : 'Sem plano vinculado'}
          {condominium.unitsCount ? ` · ${condominium.unitsCount} unidades` : ''}
        </p>
      </div>
      <CondominioPartnerStatusBadge status={condominium.partnerStatus} />
    </button>
  );
}
