import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ThemeMode, LocationPoint } from '../types';
import type { AddressFormFields } from '../types/addressForm';
import type { DestinationConfirmResult } from '../types/destination';
import {
  AddressRegistrationForm,
  type AddressRegistrationFormHandle,
} from './AddressRegistrationForm';
import { CondominiumLinkFields } from './CondominiumLinkFields';
import { listCondominiumsNearDestination } from '../services/condominiumService';
import { MapPin, X } from 'lucide-react';

type ModalStep = 'form' | 'condo';

interface DestinationAddressFormModalProps {
  isOpen: boolean;
  theme?: ThemeMode;
  initialFields?: Partial<AddressFormFields>;
  onClose: () => void;
  onConfirm: (result: DestinationConfirmResult) => void;
}

export function DestinationAddressFormModal({
  isOpen,
  theme = 'light',
  initialFields,
  onClose,
  onConfirm,
}: DestinationAddressFormModalProps) {
  const isDark = theme === 'dark';
  const formRef = useRef<AddressRegistrationFormHandle>(null);
  const [step, setStep] = useState<ModalStep>('form');
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [resolvedDestination, setResolvedDestination] = useState<LocationPoint | null>(null);
  const [isCondominiumAddress, setIsCondominiumAddress] = useState(false);
  const [selectedCondominiumId, setSelectedCondominiumId] = useState<string | null | undefined>(
    undefined,
  );

  const nearbyCondominiums = resolvedDestination
    ? listCondominiumsNearDestination(resolvedDestination)
    : [];

  const resetState = () => {
    setStep('form');
    setResolvedDestination(null);
    setIsCondominiumAddress(false);
    setSelectedCondominiumId(undefined);
    setIsSaving(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  if (!isOpen) return null;

  const handleFormContinue = async () => {
    if (!formRef.current) return;
    setIsSaving(true);

    const location = await formRef.current.resolveLocation();
    if (!location) {
      setIsSaving(false);
      return;
    }

    const nearby = listCondominiumsNearDestination(location);
    if (nearby.length > 0) {
      setResolvedDestination(location);
      setStep('condo');
      setIsSaving(false);
      return;
    }

    onConfirm({ destination: location });
    formRef.current.reset();
    handleClose();
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

    formRef.current?.reset();
    handleClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[1100] flex items-start justify-center overflow-y-auto bg-black/70 p-4 pt-16 backdrop-blur-sm sm:items-center sm:pt-4">
      <div
        className={`my-auto w-full max-w-lg overflow-hidden rounded-2xl border shadow-2xl ${
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
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Endereço de destino</h3>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                {step === 'form'
                  ? 'Informe o CEP para preencher automaticamente ou busque pela rua'
                  : 'Confirme se o destino é em um condomínio cadastrado'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            className={`cursor-pointer rounded-lg p-1.5 transition-colors disabled:opacity-50 ${
              isDark ? 'text-zinc-400 hover:bg-zinc-900 hover:text-white' : 'text-slate-400 hover:bg-slate-100'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-5">
          {step === 'form' ? (
            <AddressRegistrationForm
              key={initialFields ? JSON.stringify(initialFields) : 'empty'}
              ref={formRef}
              theme={theme}
              initialFields={initialFields}
              enableStreetSearch
              numberRequired={false}
              allowNoStreetNumberToggle
              onValidityChange={setIsFormValid}
            />
          ) : (
            <div className="space-y-4">
              <div
                className={`rounded-xl border p-4 text-sm ${
                  isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-200 bg-slate-50'
                }`}
              >
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
          {step === 'form' ? (
            <button
              type="button"
              onClick={() => void handleFormContinue()}
              disabled={!isFormValid || isSaving}
              className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {isSaving ? 'Localizando endereço...' : 'Continuar'}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCondoConfirm}
                className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold ${
                  isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                Confirmar destino
              </button>
              <button
                type="button"
                onClick={() => setStep('form')}
                className={`cursor-pointer py-2 text-xs ${
                  isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Voltar ao endereço
              </button>
            </>
          )}
          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
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
