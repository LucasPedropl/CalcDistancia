import { AlertCircle, User } from 'lucide-react';
import { formatPhoneMask } from '../../utils/phoneValidation';

interface OrderPhoneStepProps {
  recipientName: string;
  phone: string;
  recipientError: string | null;
  isDark: boolean;
  onRecipientNameChange: (name: string) => void;
  onPhoneChange: (phone: string) => void;
}

export function OrderPhoneStep({
  recipientName,
  phone,
  recipientError,
  isDark,
  onRecipientNameChange,
  onPhoneChange,
}: OrderPhoneStepProps) {
  const inputClass = `w-full rounded-lg border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 ${
    isDark
      ? 'border-zinc-800 bg-zinc-900 text-white placeholder-zinc-500'
      : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400'
  }`;
  const labelClass = `mb-1.5 block text-xs font-semibold uppercase tracking-wider ${
    isDark ? 'text-zinc-400' : 'text-slate-600'
  }`;

  return (
    <div className="space-y-5 p-6">
      <div
        className={`rounded-xl border p-4 ${
          isDark ? 'border-zinc-800 bg-zinc-900/40' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <div className="mb-3 flex items-center gap-2">
          <User className={`h-5 w-5 ${isDark ? 'text-white' : 'text-slate-900'}`} />
          <span className="text-sm font-bold">Quem vai receber a entrega</span>
        </div>
        <p className={`mb-4 text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
          O nome aparece para o motoboy e para a portaria do condomínio, então precisa ser o nome de
          quem recebe. O WhatsApp recebe o link de rastreamento e, se o pagamento for por conta do
          cliente, o link para pagar — e é por ele que checamos a autorização do morador em
          condomínios parceiros.
        </p>

        <label className="mb-4 block">
          <span className={labelClass}>Nome do cliente</span>
          <input
            type="text"
            placeholder="Ex.: Maria Souza"
            value={recipientName}
            onChange={(event) => onRecipientNameChange(event.target.value)}
            autoFocus
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className={labelClass}>WhatsApp do cliente</span>
          <input
            type="tel"
            placeholder="(31) 99999-9999"
            value={phone}
            onChange={(event) => onPhoneChange(formatPhoneMask(event.target.value))}
            className={inputClass}
          />
        </label>

        {recipientError && (
          <p className="mt-2 flex items-center gap-1 text-xs text-red-500">
            <AlertCircle className="h-3.5 w-3.5" />
            {recipientError}
          </p>
        )}
      </div>
    </div>
  );
}
