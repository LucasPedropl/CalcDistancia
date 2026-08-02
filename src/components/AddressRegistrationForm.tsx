import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import type { ThemeMode } from '../types';
import type { LocationPoint } from '../types';
import {
  BRAZILIAN_STATES,
  EMPTY_ADDRESS_FORM,
  isAddressFormValid,
  type AddressFormFields,
} from '../types/addressForm';
import { formatCepMask, geocodeAddressForm, lookupCep } from '../services/geocodingService';
import { AlertCircle, Loader2, MapPin } from 'lucide-react';

export interface AddressRegistrationFormHandle {
  resolveLocation: () => Promise<LocationPoint | null>;
  isValid: () => boolean;
  reset: () => void;
}

interface AddressRegistrationFormProps {
  theme?: ThemeMode;
  onValidityChange?: (isValid: boolean) => void;
}

export const AddressRegistrationForm = forwardRef<
  AddressRegistrationFormHandle,
  AddressRegistrationFormProps
>(function AddressRegistrationForm({ theme = 'light', onValidityChange }, ref) {
  const isDark = theme === 'dark';
  const [fields, setFields] = useState<AddressFormFields>(EMPTY_ADDRESS_FORM);
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const isValid = isAddressFormValid(fields);

  useEffect(() => {
    onValidityChange?.(isValid);
  }, [isValid, onValidityChange]);

  const updateField = <K extends keyof AddressFormFields>(key: K, value: AddressFormFields[K]) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    setFormError(null);
  };

  const fetchCepData = async (cepValue: string) => {
    const digits = cepValue.replace(/\D/g, '');
    if (digits.length !== 8) return;

    setIsCepLoading(true);
    setCepError(null);

    const result = await lookupCep(digits);

    if (!result) {
      setCepError('CEP não encontrado.');
      setIsCepLoading(false);
      return;
    }

    setFields((prev) => ({
      ...prev,
      cep: result.cep,
      street: result.street || prev.street,
      district: result.district || prev.district,
      city: result.city,
      state: result.state,
    }));
    setIsCepLoading(false);
  };

  const handleCepChange = (rawValue: string) => {
    const masked = formatCepMask(rawValue);
    updateField('cep', masked);
    setCepError(null);

    if (masked.replace(/\D/g, '').length === 8) {
      void fetchCepData(masked);
    }
  };

  useImperativeHandle(ref, () => ({
    isValid: () => isAddressFormValid(fields),
    reset: () => {
      setFields(EMPTY_ADDRESS_FORM);
      setCepError(null);
      setFormError(null);
    },
    resolveLocation: async () => {
      if (!isAddressFormValid(fields)) {
        setFormError('Preencha CEP, rua, número, bairro, cidade e UF.');
        return null;
      }

      setIsGeocoding(true);
      setFormError(null);

      try {
        return await geocodeAddressForm(fields);
      } catch {
        setFormError('Não foi possível localizar o endereço. Verifique os dados informados.');
        return null;
      } finally {
        setIsGeocoding(false);
      }
    },
  }));

  const labelClass = `mb-1.5 block text-xs font-semibold uppercase tracking-wider ${
    isDark ? 'text-zinc-400' : 'text-slate-500'
  }`;

  const inputClass = `w-full rounded-xl border px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 ${
    isDark
      ? 'border-zinc-700 bg-zinc-900 text-white placeholder-zinc-500 focus:border-white focus:ring-white/20'
      : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:ring-slate-900/10'
  }`;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className={`h-4 w-4 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`} />
        <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
          Endereço completo
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="block sm:col-span-1">
          <span className={labelClass}>CEP *</span>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              placeholder="00000-000"
              value={fields.cep}
              onChange={(e) => handleCepChange(e.target.value)}
              className={inputClass}
            />
            {isCepLoading && (
              <Loader2
                className={`absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin ${
                  isDark ? 'text-zinc-400' : 'text-slate-400'
                }`}
              />
            )}
          </div>
          {cepError && <p className="mt-1 text-xs text-red-500">{cepError}</p>}
        </label>
      </div>

      <label className="block">
        <span className={labelClass}>Rua / Logradouro *</span>
        <input
          type="text"
          placeholder="Ex: Rua Dona Quita"
          value={fields.street}
          onChange={(e) => updateField('street', e.target.value)}
          className={inputClass}
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className={labelClass}>Número *</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Ex: 231"
            value={fields.number}
            onChange={(e) => updateField('number', e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className={labelClass}>Complemento</span>
          <input
            type="text"
            placeholder="Sala, loja..."
            value={fields.complement}
            onChange={(e) => updateField('complement', e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <label className="block">
        <span className={labelClass}>Bairro *</span>
        <input
          type="text"
          placeholder="Ex: Centro"
          value={fields.district}
          onChange={(e) => updateField('district', e.target.value)}
          className={inputClass}
        />
      </label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="block sm:col-span-2">
          <span className={labelClass}>Cidade *</span>
          <input
            type="text"
            placeholder="Ex: Belo Horizonte"
            value={fields.city}
            onChange={(e) => updateField('city', e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className={labelClass}>UF *</span>
          <select
            value={fields.state}
            onChange={(e) => updateField('state', e.target.value)}
            className={`${inputClass} appearance-none`}
          >
            <option value="">—</option>
            {BRAZILIAN_STATES.map(({ uf, name }) => (
              <option key={uf} value={uf}>
                {uf} — {name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {(formError || isGeocoding) && (
        <div
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
            isDark ? 'border-zinc-800 bg-zinc-900/60 text-zinc-300' : 'border-slate-200 bg-slate-50 text-slate-600'
          }`}
        >
          {isGeocoding ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Localizando endereço no mapa...
            </>
          ) : (
            <>
              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
              {formError}
            </>
          )}
        </div>
      )}
    </div>
  );
});
