import { Link } from 'react-router-dom';
import { Store, Bike, ArrowRight, Route, Shield, Users, Building2 } from 'lucide-react';
import { PwaInstallButton } from '../../../components/PwaInstallButton';

const USER_TYPE_CARDS: Array<{
  to: string;
  icon: typeof Store;
  title: string;
  description: string;
  accent?: boolean;
  /** Oculta temporariamente na landing sem remover a configuração. */
  hidden?: boolean;
}> = [
  {
    to: '/auth/estabelecimento',
    icon: Store,
    title: 'Estabelecimento',
    description:
      'Ponto de venda: solicite entregas, calcule rotas e acompanhe pedidos com preços transparentes.',
  },
  {
    to: '/auth/motoboy',
    icon: Bike,
    title: 'Motoboy',
    description: 'Visualize rotas, aceite corridas e gerencie coletas com eficiência.',
  },
  {
    to: '/clientes',
    icon: Users,
    title: 'Clientes',
    description: 'Informe o código recebido no WhatsApp e acompanhe sua entrega em tempo real.',
  },
  {
    to: '/auth/condominio',
    icon: Building2,
    title: 'Condomínios',
    description: 'Painel de portaria: autorize entradas, audite acessos e gerencie entregas no condomínio.',
  },
  {
    to: '/auth/admin',
    icon: Shield,
    title: 'Administrativo',
    description: 'Conecte o WhatsApp da empresa, gerencie notificações e configure a plataforma.',
    accent: true,
  },
];

export const LandingPage = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900 selection:bg-slate-900 selection:text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.35) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-slate-200/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-slate-300/40 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-900/20">
              <Route className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">webmottos</p>
              <p className="text-xs text-slate-500">Cálculo de distância e entregas</p>
            </div>
          </div>
          <PwaInstallButton variant="ghost" />
        </header>

        <main className="flex flex-1 flex-col justify-center py-10 lg:py-14">
          <section className="mx-auto max-w-2xl space-y-5 text-center">
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600 shadow-sm">
              Plataforma de entregas
            </span>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
              Rotas precisas.
              <br />
              <span className="text-slate-500">Preços claros.</span>
            </h1>
            <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
              Conectamos estabelecimentos, clientes, motoboys e condomínios com cálculo de rota,
              tabela de preços parametrizável e acompanhamento em tempo real.
            </p>
            <div className="flex justify-center pt-1">
              <PwaInstallButton />
            </div>
          </section>

          <section className="mx-auto mt-10 w-full max-w-4xl sm:mt-12">
            <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
              Escolha como entrar
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {USER_TYPE_CARDS.filter((card) => !card.hidden).map(({ to, icon: Icon, title, description, accent }) => (
                <Link
                  key={to}
                  to={to}
                  className={`group flex flex-col rounded-2xl border p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
                    accent
                      ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white hover:border-emerald-500 hover:shadow-emerald-900/10'
                      : 'border-slate-200 bg-white hover:border-slate-900 hover:shadow-slate-900/10'
                  }`}
                >
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                      accent
                        ? 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white'
                        : 'bg-slate-100 text-slate-900 group-hover:bg-slate-900 group-hover:text-white'
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h2 className="text-lg font-bold">{title}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">{description}</p>
                  <span
                    className={`mt-5 inline-flex items-center gap-2 text-sm font-bold transition-all group-hover:gap-3 ${
                      accent ? 'text-emerald-700' : 'text-slate-900'
                    }`}
                  >
                    Entrar
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </main>

        <footer className="pt-6 text-center text-xs text-slate-400">
          webmottos
        </footer>
      </div>
    </div>
  );
};
