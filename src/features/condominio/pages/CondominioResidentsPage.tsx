import { useMemo, useState } from 'react';
import { UserPlus, Users } from 'lucide-react';
import type { CondominiumProfile } from '../../../services/condominiumService';
import type { ResidentLink } from '../../../types/condominium';
import { useCondominiumResidents } from '../../../hooks/useCondominium';
import { updateResidentStatus } from '../../../services/condominiumResidentService';
import { ReasonPromptModal } from '../../../components/ReasonPromptModal';
import { CondominioPageContainer } from '../components/CondominioPageContainer';
import { ResidentCard } from '../components/residents/ResidentCard';
import { ResidentFormModal } from '../components/residents/ResidentFormModal';

interface CondominioResidentsPageProps {
  profile: CondominiumProfile;
}

type ResidentDecision = { resident: ResidentLink; action: 'REJECTED' | 'REVOKED' };

export function CondominioResidentsPage({ profile }: CondominioResidentsPageProps) {
  const residents = useCondominiumResidents(profile.userId);
  const [editingResident, setEditingResident] = useState<ResidentLink | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [pendingDecision, setPendingDecision] = useState<ResidentDecision | null>(null);

  const { pending, approved, refused } = useMemo(
    () => ({
      pending: residents.filter((resident) => resident.status === 'PENDING'),
      approved: residents.filter((resident) => resident.status === 'APPROVED'),
      refused: residents.filter(
        (resident) => resident.status === 'REJECTED' || resident.status === 'REVOKED',
      ),
    }),
    [residents],
  );

  return (
    <CondominioPageContainer
      title="Moradores autorizados"
      description="Só moradores autorizados pelo condomínio têm a entrega liberada direto na portaria. Os demais passam pela identificação convencional do motoboy."
      actions={
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800"
        >
          <UserPlus className="h-4 w-4" />
          Autorizar morador
        </button>
      }
    >
      <section className="mb-8">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Solicitações pendentes ({pending.length})
        </h3>
        {pending.length === 0 ? (
          <EmptyState message="Nenhuma solicitação aguardando decisão." />
        ) : (
          <div className="space-y-3">
            {pending.map((resident) => (
              <ResidentCard
                key={resident.id}
                resident={resident}
                onApprove={() => updateResidentStatus(resident.id, 'APPROVED')}
                onReject={() => setPendingDecision({ resident, action: 'REJECTED' })}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mb-8">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Autorizados ({approved.length})
        </h3>
        {approved.length === 0 ? (
          <EmptyState message="Nenhum morador autorizado até o momento." />
        ) : (
          <div className="space-y-3">
            {approved.map((resident) => (
              <ResidentCard
                key={resident.id}
                resident={resident}
                onEdit={setEditingResident}
                onRevoke={() => setPendingDecision({ resident, action: 'REVOKED' })}
              />
            ))}
          </div>
        )}
      </section>

      {refused.length > 0 && (
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Recusados e revogados ({refused.length})
          </h3>
          <div className="space-y-3">
            {refused.map((resident) => (
              <ResidentCard
                key={resident.id}
                resident={resident}
                onApprove={() => updateResidentStatus(resident.id, 'APPROVED')}
              />
            ))}
          </div>
        </section>
      )}

      {(isCreating || editingResident) && (
        <ResidentFormModal
          condominiumId={profile.userId}
          resident={editingResident ?? undefined}
          onClose={() => {
            setIsCreating(false);
            setEditingResident(null);
          }}
        />
      )}

      {pendingDecision && (
        <ReasonPromptModal
          title={pendingDecision.action === 'REJECTED' ? 'Recusar solicitação' : 'Revogar acesso'}
          description={`Registre o motivo da decisão sobre ${pendingDecision.resident.name}.`}
          confirmLabel={pendingDecision.action === 'REJECTED' ? 'Recusar' : 'Revogar'}
          onCancel={() => setPendingDecision(null)}
          onConfirm={(reason) => {
            updateResidentStatus(pendingDecision.resident.id, pendingDecision.action, reason);
            setPendingDecision(null);
          }}
        />
      )}
    </CondominioPageContainer>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center">
      <Users className="mx-auto mb-3 h-8 w-8 text-slate-300" />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}
