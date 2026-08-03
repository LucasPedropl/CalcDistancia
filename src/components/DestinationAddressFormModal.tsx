import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ThemeMode, LocationPoint } from '../types';
import type { AddressFormFields } from '../types/addressForm';
import {
  AddressRegistrationForm,
  type AddressRegistrationFormHandle,
} from './AddressRegistrationForm';
import { MapPin, X } from 'lucide-react';

interface DestinationAddressFormModalProps {
  isOpen: boolean;
  theme?: ThemeMode;
  initialFields?: Partial<AddressFormFields>;
  onClose: () => void;
  onConfirm: (destination: LocationPoint) => void;
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
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!formRef.current) return;
    setIsSaving(true);

    const location = await formRef.current.resolveLocation();
    if (!location) {
      setIsSaving(false);
      return;
    }

    onConfirm(location);
    formRef.current.reset();
    onClose();
    setIsSaving(false);
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
                Informe o CEP para preencher automaticamente ou busque pela rua
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className={`cursor-pointer rounded-lg p-1.5 transition-colors disabled:opacity-50 ${
              isDark ? 'text-zinc-400 hover:bg-zinc-900 hover:text-white' : 'text-slate-400 hover:bg-slate-100'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-5">
          <AddressRegistrationForm
            key={initialFields ? JSON.stringify(initialFields) : 'empty'}
            ref={formRef}
            theme={theme}
            initialFields={initialFields}
            enableStreetSearch
            onValidityChange={setIsFormValid}
          />
        </div>

        <div className={`flex flex-col gap-2 border-t p-5 ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={!isFormValid || isSaving}
            className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {isSaving ? 'Localizando endereço...' : 'Confirmar destino'}
          </button>
          <button
            type="button"
            onClick={onClose}
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
