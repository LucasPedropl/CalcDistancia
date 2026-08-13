import { useCallback, useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, BookOpen } from 'lucide-react';
import {
  formatLedgerAmount,
  getLedgerBalanceCents,
  listLedgerEntries,
  subscribeToLedger,
  type LedgerEntry,
  type LedgerOwnerType,
} from '../../services/ledgerService';

interface LedgerStatementPanelProps {
  ownerType: LedgerOwnerType;
  ownerId: string;
  title?: string;
  maxEntries?: number;
  className?: string;
}

const CATEGORY_LABELS: Record<LedgerEntry['category'], string> = {
  DELIVERY_FEE: 'Entrega',
  PLATFORM_FEE: 'Taxa da plataforma',
  PAYOUT: 'Repasse',
  TOPUP: 'Recarga',
  PLAN_CHARGE: 'Mensalidade',
};

/** Caderneta digital: saldo consolidado e extrato do perfil. */
export function LedgerStatementPanel({
  ownerType,
  ownerId,
  title = 'Caderneta digital',
  maxEntries = 12,
  className = '',
}: LedgerStatementPanelProps) {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [balanceCents, setBalanceCents] = useState(0);

  const refresh = useCallback(() => {
    setEntries(listLedgerEntries(ownerType, ownerId));
    setBalanceCents(getLedgerBalanceCents(ownerType, ownerId));
  }, [ownerType, ownerId]);

  useEffect(() => {
    refresh();
    return subscribeToLedger(refresh);
  }, [refresh]);

  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-slate-900" />
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Saldo</p>
          <p
            className={`text-lg font-black ${
              balanceCents < 0 ? 'text-red-600' : 'text-emerald-600'
            }`}
          >
            {formatLedgerAmount(balanceCents)}
          </p>
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-6 text-center text-xs text-slate-500">
          Nenhum lançamento ainda. As corridas pagas aparecem aqui automaticamente.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-100">
          {entries.slice(0, maxEntries).map((entry) => {
            const isCredit = entry.direction === 'CREDIT';

            return (
              <li key={entry.id} className="flex items-start justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-800">
                    {entry.description}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {CATEGORY_LABELS[entry.category]} ·{' '}
                    {new Date(entry.createdAt).toLocaleString('pt-BR')}
                    {entry.method ? ` · ${entry.method}` : ''}
                  </p>
                </div>
                <p
                  className={`flex shrink-0 items-center gap-1 text-xs font-bold ${
                    isCredit ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {isCredit ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDownLeft className="h-3.5 w-3.5" />
                  )}
                  {isCredit ? '+' : '-'}
                  {formatLedgerAmount(entry.amountCents)}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
