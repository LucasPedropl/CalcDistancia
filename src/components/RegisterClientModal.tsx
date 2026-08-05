import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { ThemeMode } from '../types';
import {
  createQuickRegisteredClient,
  type RegisteredClient,
} from '../services/registeredClientService';
import { formatPhoneMask } from '../utils/phoneValidation';
import { UserPlus, X, AlertCircle } from 'lucide-react';

interface RegisterClientModalProps {
  isOpen: boolean;
  theme?: ThemeMode;
  onClose: () => void;
  onRegistered: (client: RegisteredClient) => void;
}

export function RegisterClientModal({
  isOpen,
  theme = 'light',
  onClose,
  onRegistered,
}: RegisterClientModalProps) {
  const isDark = theme === 'dark';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = () => {
    setError(null);

    if (!name.trim()) {
      setError('Informe o nome do cliente.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Informe um e-mail válido.');
      return;
    }

    try {
      const client = createQuickRegisteredClient({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
      });
      onRegistered(client);
      setName('');
      setEmail('');
      setPhone('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar cliente.');
    }
  };

  const inputClass = `w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${
    isDark
      ? 'border-zinc-700 bg-zinc-900 text-white focus:ring-white/20'
      : 'border-slate-300 bg-white text-slate-900 focus:ring-slate-900/10'
  }`;

  return createPortal(
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div
        className={`w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl ${
          isDark ? 'border-zinc-800 bg-zinc-950 text-white' : 'border-slate-200 bg-white text-slate-900'
        }`}
      >
        <div
          className={`flex items-center justify-between border-b p-5 ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'
              }`}
            >
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Cadastrar cliente</h3>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Adiciona o cliente à lista de destinatários
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg p-1.5 ${isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 p-5">
          <label className="block">
            <span className={`mb-1.5 block text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              Nome *
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Maria Silva"
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className={`mb-1.5 block text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              E-mail *
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cliente@exemplo.com"
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className={`mb-1.5 block text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              Telefone
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhoneMask(e.target.value))}
              placeholder="(27) 99999-0001"
              className={inputClass}
            />
          </label>

          {error && (
            <p className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </p>
          )}
        </div>

        <div className={`flex flex-col gap-2 border-t p-5 ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
          <button
            type="button"
            onClick={handleSubmit}
            className={`w-full rounded-xl py-3 text-sm font-bold ${
              isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            Cadastrar cliente
          </button>
          <button
            type="button"
            onClick={onClose}
            className={`py-2 text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
