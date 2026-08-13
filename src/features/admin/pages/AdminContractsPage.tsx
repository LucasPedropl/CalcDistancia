import { useCallback, useEffect, useState } from 'react';
import { Check, FileSignature } from 'lucide-react';
import type { UserRole } from '../../../context/AuthContext';
import {
  getActiveContractForRole,
  listContractAcceptances,
  publishContractVersion,
  subscribeToContracts,
  type ContractTemplate,
} from '../../../services/contractService';
import { AdminPageContainer } from '../components/AdminPageContainer';

const CONTRACT_ROLES: { role: UserRole; label: string }[] = [
  { role: 'ESTABELECIMENTO', label: 'Estabelecimento' },
  { role: 'MOTOBOY', label: 'Motoboy' },
  { role: 'CONDOMINIO', label: 'Condomínio' },
];

export function AdminContractsPage() {
  const [activeRole, setActiveRole] = useState<UserRole>('ESTABELECIMENTO');
  const [contract, setContract] = useState<ContractTemplate | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  const refresh = useCallback(() => {
    const active = getActiveContractForRole(activeRole);
    setContract(active);
    setTitle(active?.title ?? '');
    setContent(active?.content ?? '');
  }, [activeRole]);

  useEffect(() => {
    refresh();
    setIsPublished(false);
    return subscribeToContracts(refresh);
  }, [refresh]);

  const acceptanceCount = contract ? listContractAcceptances(contract.id).length : 0;

  return (
    <AdminPageContainer
      title="Termos de contrato"
      description="Textos aceitos por cada perfil no primeiro acesso. Salvar publica uma nova versão e exige novo aceite de todos."
    >
      <div className="mb-5 flex gap-1 overflow-x-auto">
        {CONTRACT_ROLES.map(({ role, label }) => (
          <button
            key={role}
            type="button"
            onClick={() => setActiveRole(role)}
            className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              activeRole === role ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileSignature className="h-5 w-5 text-slate-900" />
            <h3 className="text-sm font-bold text-slate-900">
              {contract ? `Versão ${contract.version} vigente` : 'Nenhuma versão publicada'}
            </h3>
          </div>
          <p className="text-xs text-slate-500">{acceptanceCount} aceite(s) registrado(s)</p>
        </div>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
            Título
          </span>
          <input
            type="text"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setIsPublished(false);
            }}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-900 focus:outline-none"
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
            Texto do contrato
          </span>
          <textarea
            value={content}
            onChange={(event) => {
              setContent(event.target.value);
              setIsPublished(false);
            }}
            rows={12}
            className="w-full resize-y rounded-xl border border-slate-300 px-3 py-2.5 text-sm leading-relaxed focus:border-slate-900 focus:outline-none"
          />
        </label>

        {isPublished && (
          <p className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
            <Check className="h-3.5 w-3.5" />
            Nova versão publicada. Os usuários do perfil verão o aceite no próximo acesso.
          </p>
        )}

        <button
          type="button"
          disabled={!title.trim() || !content.trim()}
          onClick={() => {
            publishContractVersion(activeRole, title, content);
            setIsPublished(true);
          }}
          className="mt-4 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Publicar nova versão
        </button>
      </section>
    </AdminPageContainer>
  );
}
