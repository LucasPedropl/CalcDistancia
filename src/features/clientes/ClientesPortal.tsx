import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Package, LogOut, Bell } from 'lucide-react';

export function ClientesPortal() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Área do Cliente</p>
            <h1 className="text-lg font-bold">Olá, {user?.name}</h1>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-slate-900">
            <Package className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold">Acompanhe suas entregas</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
            Receba notificações quando o motoboy estiver a caminho, autorize a entrada no condomínio
            e acompanhe o status em tempo real.
          </p>
        </div>

        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6">
          <div className="flex items-start gap-3">
            <Bell className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
            <div>
              <p className="text-sm font-semibold text-slate-700">Em desenvolvimento</p>
              <p className="mt-1 text-sm text-slate-500">
                O portal do cliente final será expandido na próxima fase, com histórico de pedidos e
                autorização de recebimento.
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">
          É um estabelecimento?{' '}
          <Link to="/auth/estabelecimento" className="font-semibold text-slate-700 underline">
            Acesse como Estabelecimento
          </Link>
        </p>
      </main>
    </div>
  );
}
