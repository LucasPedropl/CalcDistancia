import { useAuth } from '../../context/AuthContext';
import { AdminWhatsappConnect } from './components/AdminWhatsappConnect';
import { PickupConfirm } from '../collection/components/PickupConfirm';
import { LogOut, MessageCircle, Package, Route, Shield } from 'lucide-react';import { useNavigate } from 'react-router-dom';

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/admin');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Route className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Administração
              </p>
              <h1 className="text-base font-bold">webmottos</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 sm:flex">
              <Shield className="h-4 w-4 text-emerald-600" />
              <span className="max-w-[140px] truncate text-xs font-semibold">
                {user?.email ?? 'Administrador'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-emerald-700">
            <MessageCircle className="h-5 w-5" />
            <h2 className="text-2xl font-bold">Integração WhatsApp</h2>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Painel separado dos fluxos de cliente e motoboy. Aqui você conecta o número da empresa
            que dispara cobranças PIX, comprovantes e avisos de corrida.
          </p>
        </div>

        <AdminWhatsappConnect />

        <section className="mt-10">
          <div className="mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-slate-700" />
            <h2 className="text-2xl font-bold">Coleta no Balcão (PDV)</h2>
          </div>
          <p className="mb-4 max-w-2xl text-sm text-slate-600">
            Identifique o motoboy por telefone ou QR, confirme a coleta e gere cobrança PIX via API
            Bixs. O link é enviado ao cliente via WhatsApp conectado acima.
          </p>
          <PickupConfirm />
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="font-bold text-slate-900">Clientes</h3>
            <p className="mt-2 text-sm text-slate-600">
              Recebem cobrança PIX após coleta e comprovante após pagamento. Telefone cadastrado em
              Configurações → Conta ou informado no pedido.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="font-bold text-slate-900">Motoboys</h3>
            <p className="mt-2 text-sm text-slate-600">
              Recebem notificações internas no app ao aceitar corridas. Identificação no balcão via
              QR Code ou telefone cadastrado no perfil.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
