import { useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, X } from 'lucide-react';

interface ReasonPromptModalProps {
  title: string;
  description: string;
  placeholder?: string;
  confirmLabel: string;
  isRequired?: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

/** Substitui `prompt()` para coletar um motivo antes de uma ação destrutiva. */
export function ReasonPromptModal({
  title,
  description,
  placeholder = 'Descreva o motivo...',
  confirmLabel,
  isRequired = true,
  onConfirm,
  onCancel,
}: ReasonPromptModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = () => {
    if (isRequired && !reason.trim()) {
      setError('Informe o motivo para continuar.');
      return;
    }
    onConfirm(reason.trim());
  };

  return createPortal(
    <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          <textarea
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
              setError(null);
            }}
            placeholder={placeholder}
            rows={4}
            autoFocus
            className="w-full resize-none rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          />
          {error && (
            <p className="mt-2 flex items-start gap-2 text-xs text-red-600">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-2 border-t border-slate-200 p-5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 rounded-xl bg-slate-900 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
