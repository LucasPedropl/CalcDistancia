import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, MapPin, Plus, Trash2, Star, CheckCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { AddressInput } from '../../../components/AddressInput';
import type { LocationPoint, ThemeMode } from '../../../types';
import {
  getSavedAddresses,
  saveAddress,
  removeAddress,
  setDefaultAddress,
  type SavedAddress,
} from '../../../services/addressService';

interface AddressManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  onAddressSelected?: (addr: SavedAddress) => void;
}

export const AddressManagerModal: React.FC<AddressManagerModalProps> = ({
  isOpen,
  onClose,
  theme,
  onAddressSelected,
}) => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newLocation, setNewLocation] = useState<LocationPoint | null>(null);
  const [newName, setNewName] = useState('');
  const [savedFeedback, setSavedFeedback] = useState(false);

  const isDark = theme === 'dark';

  useEffect(() => {
    if (isOpen && user) {
      setAddresses(getSavedAddresses(user.id));
      setIsAdding(false);
      setNewLocation(null);
      setNewName('');
      setSavedFeedback(false);
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const handleSave = () => {
    if (!newLocation || !newName.trim()) return;

    const updated = saveAddress(user.id, {
      ...newLocation,
      name: newName,
      isDefault: addresses.length === 0,
    });
    setAddresses(updated);
    setIsAdding(false);
    setNewLocation(null);
    setNewName('');
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const handleRemove = (id: string) => {
    const updated = removeAddress(user.id, id);
    setAddresses(updated);
  };

  const handleSetDefault = (id: string) => {
    const updated = setDefaultAddress(user.id, id);
    setAddresses(updated);
  };

  const inputClass = `w-full rounded-xl border py-3 px-4 text-sm font-medium focus:outline-none ${
    isDark
      ? 'border-zinc-700 bg-zinc-900 text-white placeholder-zinc-500 focus:border-white'
      : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-900'
  }`;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div
        className={`relative flex max-h-[92vh] w-full max-w-lg flex-col rounded-2xl border shadow-2xl ${
          isDark ? 'border-zinc-800 bg-zinc-950' : 'border-slate-200 bg-white'
        }`}
      >
        <div
          className={`flex shrink-0 items-center justify-between border-b px-6 py-4 ${
            isDark ? 'border-zinc-800' : 'border-slate-200'
          }`}
        >
          <h2 className={`flex items-center gap-2 text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <MapPin className="h-5 w-5" />
            Meus Endereços
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg p-2 transition-colors ${
              isDark ? 'text-zinc-400 hover:bg-zinc-800 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {!isAdding && (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className={`mb-6 flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-5 transition-colors ${
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
              className={`relative z-10 mb-6 overflow-visible rounded-xl border p-5 ${
                isDark ? 'border-zinc-800 bg-zinc-900/60' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <h3 className={`mb-4 text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Novo endereço fixo
              </h3>
              <div className="space-y-4 overflow-visible">
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
                  type="origin"
                  value={newLocation}
                  onChange={setNewLocation}
                  theme={theme}
                  dropdownZIndex={300}
                />
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
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
              className={`mb-4 flex items-center gap-2 rounded-lg border p-3 text-sm font-semibold ${
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
              Endereços salvos
            </h3>

            {addresses.length === 0 && !isAdding && (
              <p className={`py-6 text-center text-sm ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                Nenhum endereço cadastrado.
              </p>
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
                <p className={`mb-3 text-sm ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>{addr.address}</p>
                {onAddressSelected && (
                  <button
                    type="button"
                    onClick={() => {
                      onAddressSelected(addr);
                      onClose();
                    }}
                    className={`w-full rounded-xl py-2.5 text-sm font-bold transition-colors ${
                      isDark
                        ? 'bg-white text-black hover:bg-zinc-200'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    Usar este endereço
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
