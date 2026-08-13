import { useCallback, useEffect, useState } from 'react';
import { FileSignature } from 'lucide-react';
import type { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  acceptContract,
  getActiveContractForRole,
  hasAcceptedActiveContract,
  subscribeToContracts,
  type ContractTemplate,
} from '../../services/contractService';

interface ContractAcceptanceGateProps {
  children: ReactNode;
}

/** Exibe os termos vigentes do perfil no primeiro acesso e bloqueia até o aceite. */
export function ContractAcceptanceGate({ children }: ContractAcceptanceGateProps) {
  const { user } = useAuth();
  const [pendingContract, setPendingContract] = useState<ContractTemplate | null>(null);
  const [hasReadToEnd, setHasReadToEnd] = useState(false);

  const refresh = useCallback(() => {
    if (!user || user.role === 'ADMIN') {
      setPendingContract(null);
      return;
    }

    if (hasAcceptedActiveContract(user.id, user.role)) {
      setPendingContract(null);
      return;
    }

    setPendingContract(getActiveContractForRole(user.role));
  }, [user]);

  useEffect(() => {
    refresh();
    return subscribeToContracts(refresh);
  }, [refresh]);

  if (!pendingContract || !user) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-slate-900/95 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="border-b border-slate-200 p-5">
          <div className="flex items-center gap-2">
            <FileSignature className="h-5 w-5 text-slate-900" />
            <h2 className="text-lg font-bold text-slate-900">{pendingContract.title}</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Versão {pendingContract.version} · publicada em{' '}
            {new Date(pendingContract.publishedAt).toLocaleDateString('pt-BR')}
          </p>
        </div>

        <div
          ref={(element) => {
            if (element && element.scrollHeight <= element.clientHeight) {
              setHasReadToEnd(true);
            }
          }}
          onScroll={(event) => {
            const element = event.currentTarget;
            if (element.scrollTop + element.clientHeight >= element.scrollHeight - 24) {
              setHasReadToEnd(true);
            }
          }}
          className="min-h-0 flex-1 overflow-y-auto p-5 text-sm leading-relaxed text-slate-700"
        >
          {pendingContract.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-3">
              {paragraph}
            </p>
          ))}
          <p className="mt-6 text-xs text-slate-400">
            Role até o fim para habilitar o aceite. O registro do aceite fica salvo neste
            navegador (demonstração).
          </p>
        </div>

        <div className="border-t border-slate-200 p-5">
          <button
            type="button"
            disabled={!hasReadToEnd}
            onClick={() => acceptContract(user.id, pendingContract)}
            className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {hasReadToEnd ? 'Li e aceito os termos' : 'Role até o fim para aceitar'}
          </button>
        </div>
      </div>
    </div>
  );
}
