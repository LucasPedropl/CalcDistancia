import { createPortal } from 'react-dom';
import type { ThemeMode, LocationPoint } from '../types';
import type { DestinationConfirmResult } from '../types/destination';
import { listCondominiumsNearDestination } from '../services/condominiumService';
import { CondominiumLinkFields } from './CondominiumLinkFields';
import { Building2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CondominiumDestinationConfirmModalProps {
  isOpen: boolean;
  destination: LocationPoint | null;
  theme?: ThemeMode;
  onClose: () => void;
  onConfirm: (result: DestinationConfirmResult) => void;
}

export function CondominiumDestinationConfirmModal({
  isOpen,
  destination,
  theme = 'light',
  onClose,
  onConfirm,
}: CondominiumDestinationConfirmModalProps) {
  const isDark = theme === 'dark';
  const [isCondominiumAddress, setIsCondominiumAddress] = useState(false);
  const [selectedCondominiumId, setSelectedCondominiumId] = useState<string | null | undefined>(
    undefined,
  );

  useEffect(() => {
    if (isOpen && destination) {
      setIsCondominiumAddress(false);
      setSelectedCondominiumId(undefined);
    }
  }, [isOpen, destination?.lat, destination?.lng]);

  if (!isOpen || !destination) return null;

  const nearbyCondominiums = listCondominiumsNearDestination(destination);

  const handleConfirm = () => {
    const selectedProfile = nearbyCondominiums.find(
      (entry) => entry.profile.userId === selectedCondominiumId,
    )?.profile;

    onConfirm({
      destination,
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
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Condomínio na região</h3>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Confirme se o destino é em um condomínio cadastrado
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

        <div className="space-y-4 p-5">
          <div
            className={`rounded-xl border p-4 text-sm ${
              isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-200 bg-slate-50'
            }`}
          >
            <p className="font-semibold">{destination.address}</p>
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

        <div className={`flex flex-col gap-2 border-t p-5 ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
          <button
            type="button"
            onClick={handleConfirm}
            className={`w-full rounded-xl py-3 text-sm font-bold ${
              isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            Confirmar destino
          </button>
          <button
            type="button"
            onClick={onClose}
            className={`py-2 text-xs ${isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
