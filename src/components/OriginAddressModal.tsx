import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ThemeMode } from '../types';
import type { SavedAddress } from '../services/addressService';
import { getSavedAddresses } from '../services/addressService';
import {
  AddressRegistrationForm,
  type AddressRegistrationFormHandle,
} from './AddressRegistrationForm';
import type { AddressFormFields } from '../types/addressForm';
import { MapPin, X, Star, ChevronRight } from 'lucide-react';

interface OriginAddressModalProps {
  isOpen: boolean;
  theme?: ThemeMode;
  userId: string;
  initialFields?: Partial<AddressFormFields>;
  onClose: () => void;
  onConfirm: (address: SavedAddress) => void;
}

export function OriginAddressModal({
  isOpen,
  theme = 'light',
  userId,
  initialFields,
  onClose,
  onConfirm,
}: OriginAddressModalProps) {
  const isDark = theme === 'dark';
  const formRef = useRef<AddressRegistrationFormHandle>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSavedAddresses(getSavedAddresses(userId));
      setIsSaving(false);
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const handleSelectSaved = (addr: SavedAddress) => {
    onConfirm(addr);
    onClose();
  };

  const handleConfirmForm = async () => {
    if (!formRef.current) return;
    setIsSaving(true);

    const location = await formRef.current.resolveLocation();
    if (!location) {
      setIsSaving(false);
      return;
    }

    const sessionOrigin: SavedAddress = {
      ...location,
      id: `session-${Date.now()}`,
      name: 'Origem',
      isDefault: false,
    };

    onConfirm(sessionOrigin);
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
              <h3 className="text-lg font-bold">Endereço de origem</h3>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Informe o CEP para preencher automaticamente
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

        <div className="max-h-[65vh] space-y-5 overflow-y-auto p-5">
          {savedAddresses.length > 0 && (
            <div className="space-y-2">
              <p
                className={`text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-zinc-400' : 'text-slate-500'
                }`}
              >
                Endereços salvos
              </p>
              <div className="space-y-1">
                {savedAddresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => handleSelectSaved(addr)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                      isDark
                        ? 'border-zinc-800 hover:bg-zinc-900'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`shrink-0 rounded-full p-2 ${
                        isDark ? 'bg-zinc-900 text-zinc-300' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`truncate text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {addr.name}
                        </p>
                        {addr.isDefault && (
                          <Star
                            className={`h-3 w-3 shrink-0 ${isDark ? 'text-white' : 'text-slate-900'}`}
                            fill="currentColor"
                          />
                        )}
                      </div>
                      <p className={`truncate text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                        {addr.address}
                      </p>
                    </div>
                    <ChevronRight className={`h-4 w-4 shrink-0 ${isDark ? 'text-zinc-600' : 'text-slate-400'}`} />
                  </button>
                ))}
              </div>

              <div className={`relative py-2 ${isDark ? 'text-zinc-600' : 'text-slate-300'}`}>
                <div className={`absolute inset-x-0 top-1/2 border-t ${isDark ? 'border-zinc-800' : 'border-slate-200'}`} />
                <p
                  className={`relative mx-auto w-fit px-3 text-[10px] font-semibold uppercase tracking-wider ${
                    isDark ? 'bg-zinc-950 text-zinc-500' : 'bg-white text-slate-400'
                  }`}
                >
                  ou informe um novo endereço
                </p>
              </div>
            </div>
          )}

          <AddressRegistrationForm
            key={initialFields ? JSON.stringify(initialFields) : 'empty'}
            ref={formRef}
            theme={theme}
            initialFields={initialFields}
            onValidityChange={setIsFormValid}
          />
        </div>

        <div className={`flex flex-col gap-2 border-t p-5 ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
          <button
            type="button"
            onClick={handleConfirmForm}
            disabled={!isFormValid || isSaving}
            className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {isSaving ? 'Localizando endereço...' : 'Confirmar origem'}
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
