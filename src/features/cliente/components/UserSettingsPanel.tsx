import { useState } from 'react';
import { CheckCircle, Mail, Phone, User, AlertCircle } from 'lucide-react';
import type { ThemeMode } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { formatPhoneMask, isValidPhone } from '../../../utils/phoneValidation';
interface UserSettingsPanelProps {
  theme: ThemeMode;
}

export function UserSettingsPanel({ theme }: UserSettingsPanelProps) {
  const { user, updateProfile } = useAuth();
  const isDark = theme === 'dark';

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  if (!user) return null;

  const inputClass = `w-full rounded-xl border py-3 pl-10 pr-4 text-sm font-medium focus:outline-none ${
    isDark
      ? 'border-zinc-700 bg-zinc-900 text-white placeholder-zinc-500 focus:border-white'
      : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-900'
  }`;

  const handleSave = () => {
    const trimmedPhone = phone.trim();

    if (trimmedPhone && !isValidPhone(trimmedPhone)) {
      setPhoneError('Informe um telefone válido com DDD (ex.: (31) 99999-9999).');
      return;
    }

    setPhoneError(null);
    updateProfile({ name: name.trim() || user.name, phone: trimmedPhone || undefined });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };
  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Conta</h2>
        <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
          Informações do seu perfil de cliente.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label
            className={`mb-2 block text-xs font-semibold uppercase tracking-wider ${
              isDark ? 'text-zinc-400' : 'text-slate-500'
            }`}
          >
            Nome
          </label>
          <div className="relative">
            <User
              className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
                isDark ? 'text-zinc-500' : 'text-slate-400'
              }`}
            />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label
            className={`mb-2 block text-xs font-semibold uppercase tracking-wider ${
              isDark ? 'text-zinc-400' : 'text-slate-500'
            }`}
          >
            E-mail
          </label>
          <div className="relative">
            <Mail
              className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
                isDark ? 'text-zinc-500' : 'text-slate-400'
              }`}
            />
            <input
              type="email"
              value={user.email}
              disabled
              className={`${inputClass} cursor-not-allowed opacity-60`}
            />
          </div>
          <p className={`mt-1.5 text-xs ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>
            O e-mail não pode ser alterado.
          </p>
        </div>

        <div>
          <label
            className={`mb-2 block text-xs font-semibold uppercase tracking-wider ${
              isDark ? 'text-zinc-400' : 'text-slate-500'
            }`}
          >
            Telefone
          </label>
          <div className="relative">
            <Phone
              className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
                isDark ? 'text-zinc-500' : 'text-slate-400'
              }`}
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(formatPhoneMask(e.target.value));
                setPhoneError(null);
              }}
              placeholder="(31) 99999-9999"
              className={inputClass}
            />
          </div>
          <p className={`mt-1.5 text-xs ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>
            Obrigatório para receber cobranças PIX e comprovantes via WhatsApp.
          </p>
          {phoneError && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
              <AlertCircle className="h-3.5 w-3.5" />
              {phoneError}
            </p>
          )}        </div>
      </div>

      {savedFeedback && (
        <div
          className={`flex items-center gap-2 rounded-lg border p-3 text-sm font-semibold ${
            isDark
              ? 'border-emerald-900/50 bg-emerald-950/30 text-emerald-400'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          <CheckCircle className="h-4 w-4" />
          Perfil atualizado!
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        className={`rounded-xl px-6 py-3 text-sm font-bold transition-colors ${
          isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-slate-900 text-white hover:bg-slate-800'
        }`}
      >
        Salvar alterações
      </button>
    </div>
  );
}
