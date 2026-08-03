import { useState } from 'react';
import type { ThemeMode, LocationPoint } from '../types';
import type { AddressFormFields } from '../types/addressForm';
import { DestinationAddressFormModal } from './DestinationAddressFormModal';
import { ChevronRight, X } from 'lucide-react';

interface DestinationAddressButtonProps {
  value: LocationPoint | null;
  onChange: (destination: LocationPoint | null) => void;
  theme?: ThemeMode;
  initialFields?: Partial<AddressFormFields>;
  isModalOpen?: boolean;
  onModalOpenChange?: (open: boolean) => void;
}

export function DestinationAddressButton({
  value,
  onChange,
  theme = 'light',
  initialFields,
  isModalOpen: controlledOpen,
  onModalOpenChange,
}: DestinationAddressButtonProps) {
  const isDark = theme === 'dark';
  const [internalOpen, setInternalOpen] = useState(false);

  const isOpen = controlledOpen ?? internalOpen;
  const setIsOpen = (open: boolean) => {
    onModalOpenChange?.(open);
    if (controlledOpen === undefined) {
      setInternalOpen(open);
    }
  };

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();
    onChange(null);
  };

  return (
    <>
      <div className="w-full">
        <label
          className={`mb-1.5 block text-xs font-semibold uppercase tracking-wider ${
            isDark ? 'text-zinc-400' : 'text-slate-600'
          }`}
        >
          Destino
        </label>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`relative flex w-full items-center rounded-xl border px-3.5 py-3 text-left transition-all ${
            isDark
              ? 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
              : 'border-slate-300 bg-white shadow-sm hover:border-slate-400'
          }`}
        >
          <div className="flex items-center justify-center pr-2">
            <div className={`h-3.5 w-3.5 rounded-sm ${isDark ? 'bg-white' : 'bg-slate-900'}`} />
          </div>

          <span
            className={`min-w-0 flex-1 truncate pr-8 text-sm font-medium ${
              value
                ? isDark
                  ? 'text-white'
                  : 'text-slate-900'
                : isDark
                  ? 'text-zinc-500'
                  : 'text-slate-400'
            }`}
          >
            {value ? value.address : 'Toque para informar o destino...'}
          </span>

          {value ? (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onChange(null);
                }
              }}
              className={`absolute right-3 rounded-full p-1 transition-colors ${
                isDark ? 'text-zinc-400 hover:bg-zinc-800 hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900'
              }`}
              aria-label="Limpar destino"
            >
              <X className="h-4 w-4" />
            </span>
          ) : (
            <ChevronRight
              className={`absolute right-3 h-4 w-4 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}
            />
          )}
        </button>
      </div>

      <DestinationAddressFormModal
        isOpen={isOpen}
        theme={theme}
        initialFields={initialFields}
        onClose={() => setIsOpen(false)}
        onConfirm={(destination) => {
          onChange(destination);
          setIsOpen(false);
        }}
      />
    </>
  );
}
