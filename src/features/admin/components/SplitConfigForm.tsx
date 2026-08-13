import { useState } from 'react';
import { Check, Split } from 'lucide-react';
import {
  calculateSplit,
  loadSplitConfig,
  saveSplitConfig,
} from '../../../services/splitConfigService';
import { formatLedgerAmount } from '../../../services/ledgerService';

const EXAMPLE_DELIVERY_CENTS = 1500;

export function SplitConfigForm() {
  const [motoboyPercent, setMotoboyPercent] = useState(loadSplitConfig().motoboyPercent);
  const [isSaved, setIsSaved] = useState(false);

  const preview = calculateSplit(EXAMPLE_DELIVERY_CENTS, {
    motoboyPercent,
    platformPercent: 100 - motoboyPercent,
  });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <Split className="h-5 w-5 text-slate-900" />
        <h3 className="text-sm font-bold text-slate-900">Rateio do pagamento dividido</h3>
      </div>
      <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">
        Percentual do valor da corrida que fica com o motoboy quando o pedido é criado com
        pagamento dividido. O restante é a taxa da plataforma.
      </p>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
          Motoboy: {motoboyPercent}% · Plataforma: {100 - motoboyPercent}%
        </span>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={motoboyPercent}
          onChange={(event) => {
            setMotoboyPercent(Number(event.target.value));
            setIsSaved(false);
          }}
          className="w-full accent-slate-900"
        />
      </label>

      <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
        <p className="font-semibold uppercase tracking-wider text-slate-500">
          Exemplo com corrida de {formatLedgerAmount(EXAMPLE_DELIVERY_CENTS)}
        </p>
        <p className="mt-1">
          Motoboy recebe <strong>{formatLedgerAmount(preview.motoboyCents)}</strong> · Plataforma
          retém <strong>{formatLedgerAmount(preview.platformCents)}</strong>
        </p>
      </div>

      {isSaved && (
        <p className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          <Check className="h-3.5 w-3.5" />
          Rateio atualizado.
        </p>
      )}

      <button
        type="button"
        onClick={() => {
          saveSplitConfig(motoboyPercent);
          setIsSaved(true);
        }}
        className="mt-4 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800"
      >
        Salvar rateio
      </button>
    </section>
  );
}
