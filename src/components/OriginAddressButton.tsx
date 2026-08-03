import { useState } from 'react';
import type { ThemeMode } from '../types';
import type { SavedAddress } from '../services/addressService';
import type { AddressFormFields } from '../types/addressForm';
import { OriginAddressModal } from './OriginAddressModal';
import { ChevronRight, X } from 'lucide-react';

interface OriginAddressButtonProps {
  value: SavedAddress | null;
  onChange: (address: SavedAddress | null) => void;
  userId: string;
  theme?: ThemeMode;
  initialFields?: Partial<AddressFormFields>;
  isModalOpen?: boolean;
  onModalOpenChange?: (open: boolean) => void;
}

export function OriginAddressButton({
  value,
  onChange,
  userId,
  theme = 'light',
  initialFields,
  isModalOpen: controlledOpen,
  onModalOpenChange,
}: OriginAddressButtonProps) {
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
          Origem
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
            <div
              className={`h-3.5 w-3.5 rounded-full ring-4 ${
                isDark ? 'bg-white ring-white/10' : 'bg-slate-900 ring-slate-900/10'
              }`}
            />
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
            {value ? value.address : 'Toque para informar a origem...'}
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
              aria-label="Limpar origem"
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

      <OriginAddressModal
        isOpen={isOpen}
        theme={theme}
        userId={userId}
        initialFields={initialFields}
        onClose={() => setIsOpen(false)}
        onConfirm={(address) => {
          onChange(address);
          setIsOpen(false);
        }}
      />
    </>
  );
}
