import { useEffect, useState } from 'react';
import { Plus, Trash2, Star, CheckCircle, MapPin } from 'lucide-react';
import { AddressInput } from '../../../components/AddressInput';
import type { LocationPoint, ThemeMode } from '../../../types';
import {
  getSavedAddresses,
  saveAddress,
  removeAddress,
  setDefaultAddress,
  type SavedAddress,
} from '../../../services/addressService';

interface AddressSettingsPanelProps {
  userId: string;
  theme: ThemeMode;
  onAddressesChange?: (addresses: SavedAddress[]) => void;
}

export function AddressSettingsPanel({ userId, theme, onAddressesChange }: AddressSettingsPanelProps) {
  const isDark = theme === 'dark';
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newLocation, setNewLocation] = useState<LocationPoint | null>(null);
  const [newName, setNewName] = useState('');
  const [savedFeedback, setSavedFeedback] = useState(false);

  const refreshAddresses = () => {
    const updated = getSavedAddresses(userId);
    setAddresses(updated);
    onAddressesChange?.(updated);
    return updated;
  };

  useEffect(() => {
    refreshAddresses();
  }, [userId]);

  const handleSave = () => {
    if (!newLocation || !newName.trim()) return;

    saveAddress(userId, {
      ...newLocation,
      name: newName,
      isDefault: addresses.length === 0,
    });
    refreshAddresses();
    setIsAdding(false);
    setNewLocation(null);
    setNewName('');
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const handleRemove = (id: string) => {
    removeAddress(userId, id);
    refreshAddresses();
  };

  const handleSetDefault = (id: string) => {
    setDefaultAddress(userId, id);
    refreshAddresses();
  };

  const inputClass = `w-full rounded-xl border py-3 px-4 text-sm font-medium focus:outline-none ${
    isDark
      ? 'border-zinc-700 bg-zinc-900 text-white placeholder-zinc-500 focus:border-white'
      : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-900'
  }`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Endereços</h2>
        <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
          Gerencie os endereços usados como origem nas suas entregas.
        </p>
      </div>

      {!isAdding && (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-5 transition-colors ${
            isDark
              ? 'border-zinc-700 text-zinc-400 hover:border-white/30 hover:bg-white/5 hover:text-white'
              : 'border-slate-300 text-slate-500 hover:border-slate-900/30 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Plus className="h-6 w-6" />
          <span className="text-sm font-semibold">Adicionar novo endereço</span>
        </button>
      )}

      {isAdding && (
        <div
          className={`rounded-xl border p-5 ${
            isDark ? 'border-zinc-800 bg-zinc-900/60' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <h3 className={`mb-4 text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Novo endereço
          </h3>
          <div className="space-y-4">
            <div>
              <label
                className={`mb-2 block text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-zinc-400' : 'text-slate-500'
                }`}
              >
                Nome do local
              </label>
              <input
                type="text"
                placeholder="Ex: Casa, Trabalho, Galpão..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className={inputClass}
              />
            </div>
            <AddressInput
              label="Endereço"
              placeholder="Busque rua ou CEP..."
              type="destination"
              value={newLocation}
              onChange={setNewLocation}
              theme={theme}
              dropdownZIndex={300}
            />
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setNewLocation(null);
                  setNewName('');
                }}
                className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-colors ${
                  isDark
                    ? 'bg-zinc-800 text-white hover:bg-zinc-700'
                    : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
                }`}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!newLocation || !newName.trim()}
                className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  isDark
                    ? 'bg-white text-black hover:bg-zinc-200'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {savedFeedback && (
        <div
          className={`flex items-center gap-2 rounded-lg border p-3 text-sm font-semibold ${
            isDark
              ? 'border-emerald-900/50 bg-emerald-950/30 text-emerald-400'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          <CheckCircle className="h-4 w-4" />
          Endereço salvo com sucesso!
        </div>
      )}

      <div className="space-y-3">
        <h3
          className={`text-xs font-bold uppercase tracking-wider ${
            isDark ? 'text-zinc-500' : 'text-slate-400'
          }`}
        >
          Endereços salvos ({addresses.length})
        </h3>

        {addresses.length === 0 && !isAdding && (
          <div
            className={`flex flex-col items-center rounded-xl border border-dashed py-10 ${
              isDark ? 'border-zinc-800 text-zinc-500' : 'border-slate-200 text-slate-400'
            }`}
          >
            <MapPin className="mb-2 h-8 w-8 opacity-40" />
            <p className="text-sm">Nenhum endereço cadastrado ainda.</p>
          </div>
        )}

        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`rounded-xl border p-4 transition-all ${
              addr.isDefault
                ? isDark
                  ? 'border-white/20 bg-white/5'
                  : 'border-slate-900/20 bg-slate-50'
                : isDark
                  ? 'border-zinc-800 bg-zinc-900/40'
                  : 'border-slate-200 bg-white'
            }`}
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <h4 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{addr.name}</h4>
                {addr.isDefault && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'
                    }`}
                  >
                    <Star className="h-3 w-3" fill="currentColor" /> Principal
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                {!addr.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr.id)}
                    className={`rounded-lg px-2 py-1 text-xs font-semibold transition-colors ${
                      isDark ? 'text-zinc-300 hover:bg-zinc-800' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Principal
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(addr.id)}
                  className="rounded-lg p-1 text-red-500 transition-colors hover:bg-red-500/10"
                  title="Remover"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>{addr.address}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
