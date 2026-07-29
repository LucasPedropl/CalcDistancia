import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth, type UserRole } from '../../../context/AuthContext';
import { Store, Bike, ArrowLeft, Mail, Lock, Route, AlertCircle } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();

  const isCliente = type === 'cliente';
  const role: UserRole = isCliente ? 'CLIENTE' : 'MOTOBOY';

  const [email, setEmail] = useState(isCliente ? 'cliente@exemplo.com' : 'motoboy@exemplo.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Por favor, informe e-mail e senha.');
      return;
    }

    setIsLoading(true);

    login(role, email);

    if (role === 'CLIENTE') {
      navigate('/cliente');
    } else {
      navigate('/motoboy');
    }

    setIsLoading(false);
  };

  const RoleIcon = isCliente ? Store : Bike;
  const roleLabel = isCliente ? 'Cliente' : 'Motoboy';

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 overflow-hidden selection:bg-slate-900 selection:text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.35) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className="pointer-events-none absolute top-0 right-0 h-80 w-80 rounded-full bg-slate-200/50 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10 sm:px-6">
        <Link
          to="/"
          className="mb-8 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao início
        </Link>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
          <div className="border-b border-slate-200 bg-slate-50/80 px-8 py-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Route className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  UaiPDV Rota
                </p>
                <h1 className="text-lg font-bold tracking-tight">Acesso {roleLabel}</h1>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-900">
                <RoleIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Entrar como {roleLabel}</p>
                <p className="text-xs text-slate-500">
                  {isCliente
                    ? 'Gerencie entregas e calcule rotas'
                    : 'Visualize rotas e aceite corridas'}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 px-8 py-8">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
                  placeholder="Sua senha"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-sm font-bold text-white transition-all hover:bg-slate-800 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
            >
              <Lock className="h-4 w-4" />
              {isLoading ? 'Entrando...' : 'Entrar no sistema'}
            </button>

            <p className="text-center text-[11px] text-slate-400">
              Demo: use qualquer e-mail e senha para acessar
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
