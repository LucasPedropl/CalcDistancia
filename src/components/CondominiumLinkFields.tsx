import type { ThemeMode } from '../types';
import type { CondominiumNearDestination } from '../services/condominiumService';
import { formatDistanceKm } from '../utils/distance';
import { Building2 } from 'lucide-react';

const NONE_VALUE = '__none__';

interface CondominiumLinkFieldsProps {
  nearbyCondominiums: CondominiumNearDestination[];
  isCondominiumAddress: boolean;
  onIsCondominiumAddressChange: (value: boolean) => void;
  selectedCondominiumId: string | null | undefined;
  onSelectedCondominiumIdChange: (value: string | null | undefined) => void;
  theme?: ThemeMode;
}

export function CondominiumLinkFields({
  nearbyCondominiums,
  isCondominiumAddress,
  onIsCondominiumAddressChange,
  selectedCondominiumId,
  onSelectedCondominiumIdChange,
  theme = 'light',
}: CondominiumLinkFieldsProps) {
  const isDark = theme === 'dark';

  if (nearbyCondominiums.length === 0) return null;

  const selectValue =
    selectedCondominiumId === null
      ? NONE_VALUE
      : selectedCondominiumId ?? nearbyCondominiums[0]?.profile.userId ?? NONE_VALUE;

  return (
    <div
      className={`rounded-xl border p-4 ${
        isDark ? 'border-zinc-800 bg-zinc-900/40' : 'border-slate-200 bg-slate-50'
      }`}
    >
      <div className="mb-3 flex items-center gap-2">
        <Building2 className={`h-4 w-4 ${isDark ? 'text-zinc-300' : 'text-slate-600'}`} />
        <span className="text-xs font-semibold uppercase tracking-wider">
          Condomínio na região
        </span>
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={isCondominiumAddress}
          onChange={(e) => {
            const checked = e.target.checked;
            onIsCondominiumAddressChange(checked);
            if (checked && !selectedCondominiumId && nearbyCondominiums[0]) {
              onSelectedCondominiumIdChange(nearbyCondominiums[0].profile.userId);
            }
            if (!checked) {
              onSelectedCondominiumIdChange(undefined);
            }
          }}
          className="mt-0.5 h-4 w-4 rounded border-slate-300"
        />
        <span className={`text-sm ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
          Este endereço é em um condomínio
          <span className={`mt-0.5 block text-xs ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
            {nearbyCondominiums.length} condomínio(s) cadastrado(s) em até 500 m
          </span>
        </span>
      </label>

      {isCondominiumAddress && (
        <label className="mt-3 block">
          <span className={`mb-1.5 block text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
            Selecione o condomínio
          </span>
          <select
            value={selectValue}
            onChange={(e) => {
              const value = e.target.value;
              onSelectedCondominiumIdChange(value === NONE_VALUE ? null : value);
            }}
            className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${
              isDark
                ? 'border-zinc-700 bg-zinc-900 text-white focus:ring-white/20'
                : 'border-slate-300 bg-white text-slate-900 focus:ring-slate-900/10'
            }`}
          >
            {nearbyCondominiums.map(({ profile, distanceKm }) => (
              <option key={profile.userId} value={profile.userId}>
                {profile.name} · {formatDistanceKm(distanceKm)}
              </option>
            ))}
            <option value={NONE_VALUE}>Nenhuma das alternativas</option>
          </select>
        </label>
      )}
    </div>
  );
}
