import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ArrowLeft, Lock, Mail, Route, Shield, AlertCircle } from 'lucide-react';

export function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@uaipdv.com');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Informe e-mail e senha.');
      return;
    }

    setIsLoading(true);
    login('ADMIN', email);
    navigate('/admin');
    setIsLoading(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white selection:bg-white selection:text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_50%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
        <Link
          to="/"
          className="mb-8 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao início
        </Link>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
          <div className="border-b border-slate-800 bg-slate-900/80 px-8 py-7">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-slate-950">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Painel Administrativo
                </p>
                <h1 className="text-lg font-bold tracking-tight">UaiPDV Rota</h1>
              </div>
            </div>
            <p className="text-sm text-slate-400">
              Acesso restrito para conectar o WhatsApp da empresa e gerenciar integrações.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 px-8 py-8">
            <div>
              <label htmlFor="admin-email" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                E-mail administrativo
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none"
                  placeholder="admin@empresa.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="admin-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-900/50 bg-red-950/40 p-3 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 text-sm font-bold text-slate-950 transition-all hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-70"
            >
              <Route className="h-4 w-4" />
              {isLoading ? 'Entrando...' : 'Acessar painel'}
            </button>

            <p className="text-center text-[11px] text-slate-500">
              Demo: qualquer e-mail e senha para acessar o painel administrativo.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
