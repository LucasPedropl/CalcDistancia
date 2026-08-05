import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Search, ArrowRight } from 'lucide-react';
import { normalizeTrackingCodeInput } from '../../utils/trackingUrl';

export function ClienteTrackingEntryPage() {
  const navigate = useNavigate();
  const [trackingCode, setTrackingCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const normalized = normalizeTrackingCodeInput(trackingCode);

    if (normalized.length < 4) {
      setError('Informe o código de rastreio enviado no WhatsApp.');
      return;
    }

    navigate(`/clientes/${normalized}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Rastreamento
              </p>
              <h1 className="text-lg font-bold text-slate-900">Acompanhar pedido</h1>
            </div>
          </div>
          <Link
            to="/"
            className="text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900"
          >
            Início
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
              <Search className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Informe o código de rastreio</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              O código foi enviado no WhatsApp quando o pedido foi criado. Digite abaixo para
              acompanhar a entrega.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="tracking-code"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600"
              >
                Código de rastreio
              </label>
              <input
                id="tracking-code"
                type="text"
                value={trackingCode}
                onChange={(event) => {
                  setTrackingCode(event.target.value.toUpperCase());
                  setError(null);
                }}
                placeholder="Ex: A3K7M2NP"
                autoComplete="off"
                autoFocus
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-lg font-bold tracking-[0.2em] text-slate-900 placeholder:font-medium placeholder:tracking-normal placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
              {error && <p className="mt-2 text-center text-xs font-medium text-red-500">{error}</p>}
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-sm font-bold text-white transition-colors hover:bg-slate-800"
            >
              Rastrear pedido
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
