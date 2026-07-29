import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ThemeMode } from '../types';
import type { ReverseGeocodeResult } from '../services/geocodingService';
import { buildDestinationAddress } from '../services/geocodingService';
import type { LocationPoint } from '../types';
import { MapPin, X } from 'lucide-react';

interface DestinationAddressModalProps {
  isOpen: boolean;
  base: ReverseGeocodeResult | null;
  theme?: ThemeMode;
  onClose: () => void;
  onConfirm: (destination: LocationPoint) => void;
}

export function DestinationAddressModal({
  isOpen,
  base,
  theme = 'light',
  onClose,
  onConfirm,
}: DestinationAddressModalProps) {
  const isDark = theme === 'dark';
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNumber('');
      setComplement('');
    }
  }, [isOpen, base?.lat, base?.lng]);

  if (!isOpen || !base) return null;

  const handleConfirm = () => {
    onConfirm(buildDestinationAddress(base, number, complement));
    onClose();
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
              <h3 className="text-lg font-bold">Destino no mapa</h3>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Complete número e complemento
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`cursor-pointer rounded-lg p-1.5 transition-colors ${
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
              Local identificado
            </span>
            <p className="mt-1 text-sm font-semibold">{base.street}</p>
            <p className={`mt-1 text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              {[base.district, base.city, base.state].filter(Boolean).join(' · ') || base.displayName}
            </p>
            {base.cep && (
              <p className={`mt-1 text-xs ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>CEP: {base.cep}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={`mb-1.5 block text-xs font-semibold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                Número
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Ex: 120"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
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
        </div>

        <div className={`flex flex-col gap-2 border-t p-5 ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
          <button
            type="button"
            onClick={handleConfirm}
            className={`w-full cursor-pointer rounded-xl py-3 text-sm font-bold transition-colors ${
              isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            Confirmar destino
          </button>
          <button
            type="button"
            onClick={onClose}
            className={`cursor-pointer py-2 text-xs ${isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
