import React, { useState } from 'react';
import type { ThemeMode } from '../types';
import { authenticateUser } from '../services/authService';
import { Route, Lock, User, AlertCircle } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  theme: ThemeMode;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, theme }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isDark = theme === 'dark';

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const session = authenticateUser(username, password);
    setIsLoading(false);

    if (!session) {
      setError('Usuário ou senha inválidos.');
      return;
    }
    onLoginSuccess();
  };

  return (
    <div
      className={`relative min-h-screen overflow-hidden font-sans transition-colors ${
        isDark ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-0 opacity-[0.25] ${
          isDark ? 'opacity-[0.12]' : ''
        }`}
        style={{
          backgroundImage: isDark
            ? 'radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.08) 1px, transparent 0)'
            : 'radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.35) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
        <div
          className={`w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl ${
            isDark ? 'border-zinc-800 bg-zinc-950' : 'border-slate-200 bg-white shadow-slate-900/5'
          }`}
        >
          <div className={`border-b p-8 ${isDark ? 'border-zinc-800 bg-zinc-900/40' : 'border-slate-200 bg-slate-50/80'}`}>
            <div className="mb-4 flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                  isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'
                }`}
              >
                <Route className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">webmottos</h1>
                <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Controle de acesso ao sistema
                </p>
              </div>
            </div>
            <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              Informe usuário e senha para calcular rotas e consultar preços de entrega.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-8">
            <div>
              <label
                className={`mb-2 block text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-zinc-400' : 'text-slate-500'
                }`}
              >
                Usuário
              </label>
              <div className="relative">
                <User
                  className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
                    isDark ? 'text-zinc-500' : 'text-slate-400'
                  }`}
                />
                <input
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm font-medium focus:outline-none ${
                    isDark
                      ? 'border-zinc-700 bg-zinc-900 text-white focus:border-white'
                      : 'border-slate-300 bg-white text-slate-900 focus:border-slate-900'
                  }`}
                  placeholder="Ex.: usuario ou admin"
                  required
                />
              </div>
            </div>

            <div>
              <label
                className={`mb-2 block text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-zinc-400' : 'text-slate-500'
                }`}
              >
                Senha
              </label>
              <div className="relative">
                <Lock
                  className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
                    isDark ? 'text-zinc-500' : 'text-slate-400'
                  }`}
                />
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm font-medium focus:outline-none ${
                    isDark
                      ? 'border-zinc-700 bg-zinc-900 text-white focus:border-white'
                      : 'border-slate-300 bg-white text-slate-900 focus:border-slate-900'
                  }`}
                  placeholder="Sua senha"
                  required
                />
              </div>
            </div>

            {error && (
              <div
                className={`flex items-center gap-2 rounded-lg border p-3 text-xs ${
                  isDark
                    ? 'border-red-900 bg-red-950/40 text-red-300'
                    : 'border-red-200 bg-red-50 text-red-700'
                }`}
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all ${
                isDark
                  ? 'bg-white text-black hover:bg-zinc-200'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              } ${isLoading ? 'cursor-wait opacity-70' : 'active:scale-[0.98]'}`}
            >
              <Lock className="h-4 w-4" />
              <span>{isLoading ? 'Entrando...' : 'Entrar no Sistema'}</span>
            </button>

            <p className={`text-center text-[11px] ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
              Demo: <strong>usuario</strong> / <strong>usuario</strong> · Admin:{' '}
              <strong>admin</strong> / <strong>admin</strong>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
