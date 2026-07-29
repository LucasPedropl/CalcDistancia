import { useEffect, useRef, useState } from 'react';
import type { ThemeMode } from '../types';
import { getSavedAddresses, type SavedAddress } from '../services/addressService';
import { MapPin, ChevronDown, Star } from 'lucide-react';

interface SavedOriginSelectProps {
  label?: string;
  placeholder?: string;
  value: SavedAddress | null;
  onChange: (address: SavedAddress | null) => void;
  userId: string;
  theme?: ThemeMode;
  onOpenSettings?: () => void;
  dropdownZIndex?: number;
}

export function SavedOriginSelect({
  label = 'Endereço de origem',
  placeholder = 'Selecione um endereço cadastrado...',
  value,
  onChange,
  userId,
  theme = 'light',
  onOpenSettings,
  dropdownZIndex = 50,
}: SavedOriginSelectProps) {
  const isDark = theme === 'dark';
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadAddresses = () => {
    setAddresses(getSavedAddresses(userId));
  };

  useEffect(() => {
    loadAddresses();
  }, [userId]);

  useEffect(() => {
    if (value) {
      setFilterText(value.name ? `${value.name} — ${value.address}` : value.address);
    } else if (!isOpen) {
      setFilterText('');
    }
  }, [value, isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (value) {
          setFilterText(value.name ? `${value.name} — ${value.address}` : value.address);
        } else {
          setFilterText('');
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  const filteredAddresses = addresses.filter((addr) => {
    if (!filterText.trim() || (value && filterText === (value.name ? `${value.name} — ${value.address}` : value.address))) {
      return true;
    }
    const term = filterText.toLowerCase();
    return (
      addr.name.toLowerCase().includes(term) ||
      addr.address.toLowerCase().includes(term) ||
      (addr.cep?.includes(term) ?? false)
    );
  });

  const handleSelect = (addr: SavedAddress) => {
    onChange(addr);
    setFilterText(addr.name ? `${addr.name} — ${addr.address}` : addr.address);
    setIsOpen(false);
  };

  const handleFocus = () => {
    loadAddresses();
    setIsOpen(true);
    if (value) setFilterText('');
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <label
        className={`mb-1.5 block text-xs font-semibold uppercase tracking-wider ${
          isDark ? 'text-zinc-400' : 'text-slate-600'
        }`}
      >
        {label}
      </label>

      <div
        className={`relative flex items-center border transition-all rounded-xl ${
          isDark
            ? isOpen
              ? 'border-white ring-1 ring-white/20 bg-zinc-900'
              : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
            : isOpen
              ? 'border-slate-900 bg-white ring-2 ring-slate-900/10'
              : 'border-slate-300 bg-white shadow-sm hover:border-slate-400'
        }`}
      >
        <div className="flex items-center justify-center pl-3.5 pr-2">
          <div
            className={`h-3.5 w-3.5 rounded-full ring-4 ${
              isDark ? 'bg-white ring-white/10' : 'bg-slate-900 ring-slate-900/10'
            }`}
          />
        </div>

        <input
          type="text"
          readOnly={addresses.length === 0}
          value={filterText}
          onChange={(e) => {
            setFilterText(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={handleFocus}
          onClick={handleFocus}
          placeholder={placeholder}
          className={`w-full cursor-pointer bg-transparent py-3 pl-2 pr-9 text-sm font-medium truncate focus:outline-none ${
            isDark ? 'text-white placeholder-zinc-500' : 'text-slate-900 placeholder-slate-400'
          }`}
        />

        <ChevronDown
          className={`pointer-events-none absolute right-3 h-4 w-4 transition-transform ${
            isOpen ? 'rotate-180' : ''
          } ${isDark ? 'text-zinc-400' : 'text-slate-400'}`}
        />
      </div>

      {isOpen && (
        <div
          className={`absolute left-0 right-0 top-full mt-2 max-h-72 overflow-y-auto rounded-xl border shadow-2xl ${
            isDark ? 'border-zinc-800 bg-zinc-950' : 'border-slate-200 bg-white shadow-slate-300/50'
          }`}
          style={{ zIndex: dropdownZIndex }}
        >
          <div
            className={`border-b px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wider ${
              isDark ? 'border-zinc-800 bg-zinc-900/60 text-zinc-400' : 'border-slate-100 bg-slate-50 text-slate-500'
            }`}
          >
            Endereços cadastrados
          </div>

          {addresses.length === 0 ? (
            <div className="p-4 text-center">
              <p className={`mb-3 text-sm ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Nenhum endereço cadastrado.
              </p>
              {onOpenSettings && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenSettings();
                  }}
                  className={`rounded-lg px-4 py-2 text-xs font-bold transition-colors ${
                    isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  Cadastrar em Configurações
                </button>
              )}
            </div>
          ) : filteredAddresses.length === 0 ? (
            <p className={`p-4 text-center text-sm ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
              Nenhum endereço corresponde à busca.
            </p>
          ) : (
            filteredAddresses.map((addr) => {
              const isSelected = value?.id === addr.id;
              return (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => handleSelect(addr)}
                  className={`flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors last:border-b-0 ${
                    isSelected
                      ? isDark
                        ? 'bg-white/10'
                        : 'bg-slate-50'
                      : isDark
                        ? 'border-zinc-900 hover:bg-zinc-900'
                        : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`mt-0.5 shrink-0 rounded-full p-2 ${
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
                        <span
                          className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                            isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'
                          }`}
                        >
                          <Star className="h-2.5 w-2.5" fill="currentColor" />
                          Principal
                        </span>
                      )}
                    </div>
                    <p className={`mt-0.5 truncate text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      {addr.address}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
