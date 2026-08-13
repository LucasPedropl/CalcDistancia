import { AlertCircle, Phone } from 'lucide-react';
import { formatPhoneMask } from '../../utils/phoneValidation';

interface OrderPhoneStepProps {
  phone: string;
  phoneError: string | null;
  isDark: boolean;
  onPhoneChange: (phone: string) => void;
}

export function OrderPhoneStep({
  phone,
  phoneError,
  isDark,
  onPhoneChange,
}: OrderPhoneStepProps) {
  return (
    <div className="space-y-5 p-6">
      <div
        className={`rounded-xl border p-4 ${
          isDark ? 'border-zinc-800 bg-zinc-900/40' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <div className="mb-3 flex items-center gap-2">
          <Phone className={`h-5 w-5 ${isDark ? 'text-white' : 'text-slate-900'}`} />
          <span className="text-sm font-bold">WhatsApp do cliente final</span>
        </div>
        <p className={`mb-4 text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
          Informe o número do cliente que receberá a entrega. Enviaremos o link de rastreamento e,
          se for por conta dele, o link para pagar a entrega. O número também é usado para checar a
          autorização do morador em condomínios parceiros.
        </p>
        <input
          type="tel"
          placeholder="(31) 99999-9999"
          value={phone}
          onChange={(event) => onPhoneChange(formatPhoneMask(event.target.value))}
          autoFocus
          className={`w-full rounded-lg border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 ${
            isDark
              ? 'border-zinc-800 bg-zinc-900 text-white placeholder-zinc-500'
              : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400'
          }`}
        />
        {phoneError && (
          <p className="mt-2 flex items-center gap-1 text-xs text-red-500">
            <AlertCircle className="h-3.5 w-3.5" />
            {phoneError}
          </p>
        )}
      </div>
    </div>
  );
}
