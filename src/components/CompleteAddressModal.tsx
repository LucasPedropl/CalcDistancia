import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { LocationPoint, ThemeMode } from '../types';
import { geocodeLocationWithNumber } from '../services/geocodingService';
import { MapPin, X, Loader2 } from 'lucide-react';

interface CompleteAddressModalProps {
  isOpen: boolean;
  base: LocationPoint | null;
  theme?: ThemeMode;
  title?: string;
  subtitle?: string;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: (location: LocationPoint) => void;
}

export function CompleteAddressModal({
  isOpen,
  base,
  theme = 'light',
  title = 'Complete o endereço',
  subtitle = 'Informe o número para localização precisa',
  confirmLabel = 'Confirmar endereço',
  onClose,
  onConfirm,
}: CompleteAddressModalProps) {
  const isDark = theme === 'dark';
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setNumber('');
      setComplement('');
      setError(null);
      setIsGeocoding(false);
    }
  }, [isOpen, base?.lat, base?.lng, base?.address]);

  if (!isOpen || !base) return null;

  const streetLabel = base.address.split(',')[0]?.trim() || base.address;

  const handleConfirm = async () => {
    if (!number.trim()) {
      setError('Informe o número do endereço.');
      return;
    }

    setIsGeocoding(true);
    setError(null);

    try {
      const resolved = await geocodeLocationWithNumber(base, number, complement);
      onConfirm(resolved);
      onClose();
    } catch {
      setError('Não foi possível localizar este endereço. Verifique o número informado.');
    } finally {
      setIsGeocoding(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[1100] flex items-start justify-center overflow-y-auto bg-black/70 p-4 pt-20 backdrop-blur-sm sm:items-center sm:pt-4">
      <div
        className={`my-auto w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl ${
          isDark ? 'border-zinc-800 bg-zinc-950 text-white' : 'border-slate-200 bg-white text-slate-900'
        }`}
      >
        <div className={`flex items-center justify-between border-b p-5 ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'
              }`}
            >
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{title}</h3>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isGeocoding}
            className={`cursor-pointer rounded-lg p-1.5 transition-colors disabled:opacity-50 ${
              isDark ? 'text-zinc-400 hover:bg-zinc-900 hover:text-white' : 'text-slate-400 hover:bg-slate-100'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div
            className={`rounded-xl border p-4 ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-200 bg-slate-50'}`}
          >
            <span
              className={`block text-[10px] font-semibold uppercase tracking-wider ${
                isDark ? 'text-zinc-500' : 'text-slate-500'
              }`}
            >
              Logradouro
            </span>
            <p className="mt-1 text-sm font-semibold">{streetLabel}</p>
            <p className={`mt-1 text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              {[base.district, base.city, base.state].filter(Boolean).join(' · ')}
            </p>
            {base.cep && (
              <p className={`mt-1 text-xs ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>CEP: {base.cep}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={`mb-1.5 block text-xs font-semibold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                Número *
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Ex: 231"
                value={number}
                onChange={(e) => {
                  setNumber(e.target.value);
                  setError(null);
                }}
                autoFocus
                className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                  isDark
                    ? 'border-zinc-700 bg-zinc-900 text-white placeholder-zinc-500'
                    : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400'
                }`}
              />
            </label>
            <label className="block">
              <span className={`mb-1.5 block text-xs font-semibold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                Complemento
              </span>
              <input
                type="text"
                placeholder="Apto, bloco..."
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                  isDark
                    ? 'border-zinc-700 bg-zinc-900 text-white placeholder-zinc-500'
                    : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400'
                }`}
              />
            </label>
          </div>

          {error && (
            <p className={`text-xs font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
          )}
        </div>

        <div className={`flex flex-col gap-2 border-t p-5 ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isGeocoding}
            className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-colors disabled:cursor-wait disabled:opacity-70 ${
              isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {isGeocoding && <Loader2 className="h-4 w-4 animate-spin" />}
            {isGeocoding ? 'Localizando...' : confirmLabel}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isGeocoding}
            className={`cursor-pointer py-2 text-xs disabled:opacity-50 ${
              isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
