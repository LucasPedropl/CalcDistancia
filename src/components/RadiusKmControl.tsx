import { useEffect, useState } from 'react';
import type { ThemeMode } from '../types';

const RADIUS_PRESETS_KM = [5, 10, 15, 20, 30] as const;
const MIN_RADIUS_KM = 1;
const MAX_RADIUS_KM = 50;

function clampRadiusKm(value: number): number {
  if (!Number.isFinite(value)) return 15;
  return Math.min(MAX_RADIUS_KM, Math.max(MIN_RADIUS_KM, Math.round(value)));
}

interface RadiusKmControlProps {
  valueKm: number;
  onChange: (radiusKm: number) => void;
  theme?: ThemeMode;
  label?: string;
  hint?: string;
}

export function RadiusKmControl({
  valueKm,
  onChange,
  theme = 'light',
  label = 'Raio de busca',
  hint,
}: RadiusKmControlProps) {
  const isDark = theme === 'dark';
  const [inputText, setInputText] = useState(String(valueKm));

  useEffect(() => {
    setInputText(String(valueKm));
  }, [valueKm]);

  const commitInput = (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed === '') {
      setInputText(String(valueKm));
      return;
    }

    const parsed = Number(trimmed.replace(',', '.'));
    if (Number.isNaN(parsed)) {
      setInputText(String(valueKm));
      return;
    }

    const clamped = clampRadiusKm(parsed);
    onChange(clamped);
    setInputText(String(clamped));
  };

  const inputClass = `w-16 rounded-lg border px-2 py-1 text-right text-xs font-bold focus:outline-none focus:ring-2 ${
    isDark
      ? 'border-zinc-700 bg-zinc-900 text-white focus:border-white focus:ring-white/20'
      : 'border-slate-300 bg-white text-slate-900 focus:border-slate-900 focus:ring-slate-900/10'
  }`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className={`text-xs font-semibold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
          {label}
        </label>
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            inputMode="decimal"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onBlur={() => commitInput(inputText)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              }
            }}
            aria-label={`${label} em quilômetros`}
            className={inputClass}
          />
          <span className={`text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>km</span>
        </div>
      </div>

      <input
        type="range"
        min={MIN_RADIUS_KM}
        max={MAX_RADIUS_KM}
        step={1}
        value={valueKm}
        onChange={(e) => onChange(clampRadiusKm(Number(e.target.value)))}
        className={`h-2 w-full cursor-pointer appearance-none rounded-full ${
          isDark ? 'bg-zinc-800 accent-white' : 'bg-slate-200 accent-slate-900'
        }`}
      />

      <div className="flex justify-between gap-1">
        {RADIUS_PRESETS_KM.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={`flex-1 rounded-lg py-1 text-[10px] font-bold transition-colors ${
              valueKm === preset
                ? isDark
                  ? 'bg-white text-black'
                  : 'bg-slate-900 text-white'
                : isDark
                  ? 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
            }`}
          >
            {preset}
          </button>
        ))}
      </div>

      {hint && (
        <p className={`text-[11px] leading-relaxed ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
          {hint}
        </p>
      )}
    </div>
  );
}
