import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ThemeMode, LocationPoint } from '../types';
import type { DestinationConfirmResult } from '../types/destination';
import type { ReverseGeocodeResult } from '../services/geocodingService';
import { geocodeLocationWithNumber } from '../services/geocodingService';
import { listCondominiumsNearDestination } from '../services/condominiumService';
import { CondominiumLinkFields } from './CondominiumLinkFields';
import { MapPin, X, Loader2 } from 'lucide-react';

type ModalStep = 'address' | 'condo';

interface DestinationAddressModalProps {
  isOpen: boolean;
  base: ReverseGeocodeResult | null;
  theme?: ThemeMode;
  onClose: () => void;
  onConfirm: (result: DestinationConfirmResult) => void;
}

export function DestinationAddressModal({
  isOpen,
  base,
  theme = 'light',
  onClose,
  onConfirm,
}: DestinationAddressModalProps) {
  const isDark = theme === 'dark';
  const [step, setStep] = useState<ModalStep>('address');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvedDestination, setResolvedDestination] = useState<LocationPoint | null>(null);
  const [isCondominiumAddress, setIsCondominiumAddress] = useState(false);
  const [selectedCondominiumId, setSelectedCondominiumId] = useState<string | null | undefined>(
    undefined,
  );

  const nearbyCondominiums = resolvedDestination
    ? listCondominiumsNearDestination(resolvedDestination)
    : [];

  useEffect(() => {
    if (isOpen) {
      setStep('address');
      setNumber('');
      setComplement('');
      setError(null);
      setIsGeocoding(false);
      setResolvedDestination(null);
      setIsCondominiumAddress(false);
      setSelectedCondominiumId(undefined);
    }
  }, [isOpen, base?.lat, base?.lng]);

  if (!isOpen || !base) return null;

  const handleAddressContinue = async () => {
    if (!number.trim()) {
      setError('Informe o número do endereço.');
      return;
    }

    setIsGeocoding(true);
    setError(null);

    try {
      const partial: LocationPoint = {
        address: base.street,
        lat: base.lat,
        lng: base.lng,
        city: base.city,
        state: base.state,
        district: base.district,
        cep: base.cep,
      };
      const resolved = await geocodeLocationWithNumber(partial, number, complement);
      const nearby = listCondominiumsNearDestination(resolved);

      if (nearby.length > 0) {
        setResolvedDestination(resolved);
        setStep('condo');
        setIsGeocoding(false);
        return;
      }

      onConfirm({ destination: resolved });
      onClose();
    } catch {
      setError('Não foi possível localizar este endereço. Verifique o número informado.');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleCondoConfirm = () => {
    if (!resolvedDestination) return;

    const selectedProfile = nearbyCondominiums.find(
      (entry) => entry.profile.userId === selectedCondominiumId,
    )?.profile;

    onConfirm({
      destination: resolvedDestination,
      meta: isCondominiumAddress
        ? {
            condominiumId: selectedCondominiumId,
            condominiumName: selectedProfile?.name,
          }
        : undefined,
    });
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
                {step === 'address' ? 'Complete número e complemento' : 'Confirme o condomínio'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className={`cursor-pointer rounded-lg p-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-400'}`}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {step === 'address' ? (
            <>
              <div className={`rounded-xl border p-4 ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-200 bg-slate-50'}`}>
                <span className={`block text-[10px] font-semibold uppercase ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                  Local identificado
                </span>
                <p className="mt-1 text-sm font-semibold">{base.street}</p>
                <p className={`mt-1 text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  {[base.district, base.city, base.state].filter(Boolean).join(' · ') || base.displayName}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className={`mb-1.5 block text-xs font-semibold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>Número</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Ex: 120"
                    value={number}
                    onChange={(e) => {
                      setNumber(e.target.value);
                      setError(null);
                    }}
                    autoFocus
                    className={`w-full rounded-lg border px-3 py-2.5 text-sm ${isDark ? 'border-zinc-700 bg-zinc-900 text-white' : 'border-slate-300 bg-white'}`}
                  />
                </label>
                <label className="block">
                  <span className={`mb-1.5 block text-xs font-semibold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>Complemento</span>
                  <input
                    type="text"
                    placeholder="Apto, bloco..."
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2.5 text-sm ${isDark ? 'border-zinc-700 bg-zinc-900 text-white' : 'border-slate-300 bg-white'}`}
                  />
                </label>
              </div>

              {error && <p className={`text-xs font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>}
            </>
          ) : (
            <div className="space-y-4">
              <div className={`rounded-xl border p-4 text-sm ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-200 bg-slate-50'}`}>
                <p className="font-semibold">{resolvedDestination?.address}</p>
              </div>
              <CondominiumLinkFields
                nearbyCondominiums={nearbyCondominiums}
                isCondominiumAddress={isCondominiumAddress}
                onIsCondominiumAddressChange={setIsCondominiumAddress}
                selectedCondominiumId={selectedCondominiumId}
                onSelectedCondominiumIdChange={setSelectedCondominiumId}
                theme={theme}
              />
            </div>
          )}
        </div>

        <div className={`flex flex-col gap-2 border-t p-5 ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
          {step === 'address' ? (
            <button
              type="button"
              onClick={() => void handleAddressContinue()}
              disabled={isGeocoding}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold disabled:opacity-70 ${
                isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'
              }`}
            >
              {isGeocoding && <Loader2 className="h-4 w-4 animate-spin" />}
              {isGeocoding ? 'Localizando...' : 'Continuar'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCondoConfirm}
              className={`flex w-full rounded-xl py-3 text-sm font-bold ${isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'}`}
            >
              Confirmar destino
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
