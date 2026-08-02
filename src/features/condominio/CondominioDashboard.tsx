import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2, LogOut, Shield } from 'lucide-react';

export function CondominioDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Painel do Condomínio</p>
            <h1 className="text-lg font-bold">{user?.name}</h1>
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

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <Building2 className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold">Gestão de acessos e entregas</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
            Autorize a entrada de motoboys, visualize quem liberou o acesso, registre placas e mantenha
            histórico de auditoria para a portaria.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <Shield className="mb-2 h-5 w-5 text-slate-400" />
            <h3 className="text-sm font-bold">Validação rigorosa</h3>
            <p className="mt-1 text-xs text-slate-500">
              Cadastro sujeito a documentação do síndico, regimento interno e contrato — conforme
              definido na reunião de alinhamento.
            </p>
          </div>
          <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-5">
            <p className="text-sm font-semibold text-slate-700">Fase 3 do projeto</p>
            <p className="mt-1 text-xs text-slate-500">
              Integração completa com moradores, remetentes e motoboys em desenvolvimento.
            </p>
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
