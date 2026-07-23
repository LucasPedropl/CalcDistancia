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
      className={`min-h-screen flex flex-col items-center justify-center px-4 font-sans transition-colors ${
        isDark ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div
        className={`w-full max-w-md border rounded-2xl shadow-2xl overflow-hidden ${
          isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className={`p-8 border-b ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'
              }`}
            >
              <Route className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">UaiPDV Rota</h1>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Controle de acesso ao sistema
              </p>
            </div>
          </div>
          <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
            Informe usuário e senha para calcular rotas e consultar preços de entrega.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label
              className={`text-xs font-semibold uppercase tracking-wider block mb-2 ${
                isDark ? 'text-zinc-400' : 'text-slate-500'
              }`}
            >
              Usuário
            </label>
            <div className="relative">
              <User
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  isDark ? 'text-zinc-500' : 'text-slate-400'
                }`}
              />
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium focus:outline-none ${
                  isDark
                    ? 'bg-zinc-900 border-zinc-700 text-white focus:border-white'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900'
                }`}
                placeholder="Ex.: usuario ou admin"
                required
              />
            </div>
          </div>

          <div>
            <label
              className={`text-xs font-semibold uppercase tracking-wider block mb-2 ${
                isDark ? 'text-zinc-400' : 'text-slate-500'
              }`}
            >
              Senha
            </label>
            <div className="relative">
              <Lock
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  isDark ? 'text-zinc-500' : 'text-slate-400'
                }`}
              />
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium focus:outline-none ${
                  isDark
                    ? 'bg-zinc-900 border-zinc-700 text-white focus:border-white'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900'
                }`}
                placeholder="Sua senha"
                required
              />
            </div>
          </div>

          {error && (
            <div
              className={`flex items-center gap-2 text-xs p-3 rounded-lg border ${
                isDark
                  ? 'bg-red-950/40 border-red-900 text-red-300'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 ${
              isDark
                ? 'bg-white text-black hover:bg-zinc-200'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            } ${isLoading ? 'opacity-70 cursor-wait' : 'active:scale-[0.98]'}`}
          >
            <Lock className="w-4 h-4" />
            <span>{isLoading ? 'Entrando...' : 'Entrar no Sistema'}</span>
          </button>

          <p className={`text-[11px] text-center ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
            Demo: <strong>usuario</strong> / <strong>usuario</strong> · Admin: <strong>admin</strong> /{' '}
            <strong>admin</strong>
          </p>
        </form>
      </div>
    </div>
  );
};
