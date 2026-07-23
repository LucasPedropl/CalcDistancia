import React, { useState, useEffect, useRef } from 'react';
import type { LocationPoint, ThemeMode } from '../types';
import { searchAddressOrCep, POPULAR_LOCATIONS } from '../services/geocodingService';
import { MapPin, X, Loader2, Navigation } from 'lucide-react';

interface AddressInputProps {
  label: string;
  placeholder: string;
  value: LocationPoint | null;
  onChange: (location: LocationPoint | null) => void;
  type: 'origin' | 'destination';
  autoFocus?: boolean;
  theme?: ThemeMode;
}

export const AddressInput: React.FC<AddressInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type,
  autoFocus = false,
  theme = 'dark',
}) => {
  const [inputText, setInputText] = useState(value?.address || '');
  const [suggestions, setSuggestions] = useState<LocationPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isDark = theme === 'dark';

  useEffect(() => {
    if (value) {
      setInputText(value.address);
    } else if (!isOpen) {
      setInputText('');
    }
  }, [value, isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    if (inputText.trim().length < 3) {
      setSuggestions(POPULAR_LOCATIONS);
      setLoading(false);
      return;
    }

    if (value && value.address === inputText) {
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      const results = await searchAddressOrCep(inputText);
      setSuggestions(results);
      setLoading(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [inputText, isOpen, value]);

  const handleSelect = (loc: LocationPoint) => {
    setInputText(loc.address);
    onChange(loc);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInputText('');
    onChange(null);
    setIsOpen(true);
  };

  return (
    <div ref={containerRef} className="relative flex-1 w-full">
      <label
        className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${
          isDark ? 'text-zinc-400' : 'text-slate-600'
        }`}
      >
        {label}
      </label>

      <div
        className={`relative flex items-center border transition-all rounded-xl ${
          isDark
            ? isOpen
              ? 'bg-zinc-900 border-white ring-1 ring-white/20'
              : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
            : isOpen
              ? 'bg-white border-slate-900 ring-2 ring-slate-900/10'
              : 'bg-white border-slate-300 hover:border-slate-400 shadow-sm'
        }`}
      >
        {/* Origin / Destination Icon pin */}
        <div className="pl-3.5 pr-2 flex items-center justify-center">
          {type === 'origin' ? (
            <div
              className={`w-3.5 h-3.5 rounded-full ring-4 ${
                isDark ? 'bg-white ring-white/10' : 'bg-slate-900 ring-slate-900/10'
              }`}
            />
          ) : (
            <div className={`w-3.5 h-3.5 rounded-sm ${isDark ? 'bg-white' : 'bg-slate-900'}`} />
          )}
        </div>

        <input
          type="text"
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`w-full bg-transparent py-3 pr-9 pl-2 text-sm focus:outline-none font-medium truncate ${
            isDark ? 'text-white placeholder-zinc-500' : 'text-slate-900 placeholder-slate-400'
          }`}
        />

        <div className="absolute right-3 flex items-center gap-1.5">
          {loading ? (
            <Loader2 className={`w-4 h-4 animate-spin ${isDark ? 'text-zinc-400' : 'text-slate-400'}`} />
          ) : inputText ? (
            <button
              type="button"
              onClick={handleClear}
              className={`p-1 rounded-full transition-colors ${
                isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Limpar"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Autocomplete Dropdown List */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 top-full mt-2 rounded-xl shadow-2xl z-50 overflow-hidden max-h-80 overflow-y-auto divide-y animate-in fade-in slide-in-from-top-2 duration-150 border ${
            isDark
              ? 'bg-zinc-950 border-zinc-800 divide-zinc-900'
              : 'bg-white border-slate-200 divide-slate-100 shadow-slate-300/50'
          }`}
        >
          <div
            className={`px-3.5 py-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider border-b ${
              isDark
                ? 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400'
                : 'bg-slate-50 border-slate-100 text-slate-500'
            }`}
          >
            <span>{inputText.length >= 3 ? 'Endereços & CEPs Encontrados' : 'Sugestões de Locais'}</span>
            <span className="text-[10px] lowercase font-normal opacity-70">ViaCEP / Maps</span>
          </div>

          {suggestions.length === 0 && !loading ? (
            <div className={`p-4 text-center text-sm ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
              Nenhum endereço encontrado para "{inputText}".
            </div>
          ) : (
            suggestions.map((item, index) => (
              <button
                key={`${item.address}-${index}`}
                type="button"
                onClick={() => handleSelect(item)}
                className={`w-full px-4 py-3 text-left transition-colors flex items-start gap-3 group ${
                  isDark ? 'hover:bg-zinc-900' : 'hover:bg-slate-50'
                }`}
              >
                <div
                  className={`p-2 rounded-full transition-colors mt-0.5 shrink-0 ${
                    isDark
                      ? 'bg-zinc-900 text-zinc-300 group-hover:bg-white group-hover:text-black'
                      : 'bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-white'
                  }`}
                >
                  {item.cep ? <Navigation className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-semibold truncate ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {item.address}
                  </p>
                  <p className={`text-xs truncate mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    {[item.district, item.city, item.state, item.cep ? `CEP ${item.cep}` : '']
                      .filter(Boolean)
                      .join(' • ')}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
