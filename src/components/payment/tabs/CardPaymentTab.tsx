import { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { validateCardFields } from '../../../utils/cardValidation';

interface CardPaymentTabProps {
  isDark: boolean;
  isProcessing: boolean;
  onSubmit: () => void;
  onValidationError: (message: string) => void;
}

export function CardPaymentTab({
  isDark,
  isProcessing,
  onSubmit,
  onValidationError,
}: CardPaymentTabProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const inputClass = `w-full rounded-lg border p-3 text-sm focus:outline-none focus:ring-2 ${
    isDark
      ? 'border-zinc-800 bg-zinc-900 text-white focus:ring-white'
      : 'border-slate-300 bg-white focus:ring-slate-900'
  }`;

  const handleSubmit = () => {
    const validationError = validateCardFields(cardNumber, cardExpiry, cardCvv);
    if (validationError) {
      onValidationError(validationError);
      return;
    }
    onSubmit();
  };

  return (
    <div className="space-y-3">
      <input
        type="text"
        inputMode="numeric"
        placeholder="Número do cartão"
        value={cardNumber}
        onChange={(event) => setCardNumber(event.target.value)}
        className={inputClass}
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          placeholder="MM/AA"
          value={cardExpiry}
          onChange={(event) => setCardExpiry(event.target.value)}
          className={inputClass}
        />
        <input
          type="text"
          inputMode="numeric"
          placeholder="CVV"
          value={cardCvv}
          onChange={(event) => setCardCvv(event.target.value)}
          className={inputClass}
        />
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isProcessing}
        className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-colors disabled:opacity-60 ${
          isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-slate-900 text-white hover:bg-slate-800'
        }`}
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CreditCard className="h-4 w-4" />
        )}
        {isProcessing ? 'Processando cartão...' : 'Pagar com cartão (simulado)'}
      </button>
    </div>
  );
}
