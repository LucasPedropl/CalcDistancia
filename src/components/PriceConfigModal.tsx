import React, { useEffect, useState } from 'react';
import type { PriceTier, ThemeMode } from '../types';
import {
  buildTierLabel,
  createEmptyPriceTier,
  formatTierPriceSummary,
} from '../services/pricingService';
import { DollarSign, Plus, Save, Trash2, X } from 'lucide-react';

interface PriceConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  tiers: PriceTier[];
  onTiersUpdated: (newTiers: PriceTier[]) => void;
  theme?: ThemeMode;
  /** When true, last tier is always open-ended (per-km optional). */
  allowPerKmTier?: boolean;
}

export const PriceConfigModal: React.FC<PriceConfigModalProps> = ({
  isOpen,
  onClose,
  tiers,
  onTiersUpdated,
  theme = 'light',
  allowPerKmTier = true,
}) => {
  const [editedTiers, setEditedTiers] = useState<PriceTier[]>(tiers);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (isOpen) setEditedTiers(tiers);
  }, [isOpen, tiers]);

  if (!isOpen) return null;

  const updateTier = (id: string, patch: Partial<PriceTier>) => {
    setEditedTiers((prev) =>
      prev.map((tier) => {
        if (tier.id !== id) return tier;
        const next = { ...tier, ...patch };
        next.label = buildTierLabel(next.minKm, next.maxKm);
        return next;
      }),
    );
  };

  const handleAddTier = () => {
    const lastTier = editedTiers[editedTiers.length - 1];
    const nextMin = lastTier ? (lastTier.maxKm ?? lastTier.minKm) + 1 : 0;
    setEditedTiers((prev) => [...prev, createEmptyPriceTier(nextMin)]);
  };

  const handleRemoveTier = (id: string) => {
    if (editedTiers.length <= 1) return;
    setEditedTiers((prev) => prev.filter((tier) => tier.id !== id));
  };

  const handleToggleOpenEnded = (id: string, openEnded: boolean) => {
    updateTier(id, {
      maxKm: openEnded ? null : (editedTiers.find((t) => t.id === id)?.minKm ?? 0) + 5,
      pricePerKm: openEnded ? 2 : null,
    });
  };

  const handleSave = () => {
    const normalized = [...editedTiers]
      .sort((a, b) => a.minKm - b.minKm)
      .map((tier, index, arr) => {
        const isLast = index === arr.length - 1;
        if (allowPerKmTier && isLast && tier.maxKm !== null) {
          return { ...tier, maxKm: null, label: buildTierLabel(tier.minKm, null) };
        }
        return { ...tier, label: buildTierLabel(tier.minKm, tier.maxKm) };
      });

    onTiersUpdated(normalized);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div
        className={`max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border shadow-2xl ${
          isDark ? 'border-zinc-800 bg-zinc-950 text-white' : 'border-slate-200 bg-white text-slate-900'
        }`}
      >
        <div
          className={`flex items-center justify-between border-b p-6 ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}
        >
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'}`}>
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Tabela de Preços</h3>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Configure faixas de KM e precificação por distância
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg p-1.5 transition-colors ${
              isDark ? 'text-zinc-400 hover:bg-zinc-900 hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[55vh] space-y-3 overflow-y-auto p-6">
          {editedTiers.map((tier, index) => {
            const isOpenEnded = tier.maxKm === null;
            const isLast = index === editedTiers.length - 1;

            return (
              <div
                key={tier.id}
                className={`rounded-xl border p-4 ${isDark ? 'border-zinc-800 bg-zinc-900/40' : 'border-slate-200 bg-slate-50'}`}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-sm font-bold">{tier.label}</span>
                  {editedTiers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTier(tier.id)}
                      className={`rounded-lg p-1.5 transition-colors ${
                        isDark ? 'text-red-400 hover:bg-red-950' : 'text-red-500 hover:bg-red-50'
                      }`}
                      title="Remover faixa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className={`mb-1 block text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      KM mínimo
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={tier.minKm}
                      onChange={(e) => updateTier(tier.id, { minKm: Number(e.target.value) || 0 })}
                      className={`w-full rounded-lg border px-3 py-2 text-sm font-semibold ${
                        isDark
                          ? 'border-zinc-700 bg-zinc-900 text-white'
                          : 'border-slate-300 bg-white text-slate-900'
                      }`}
                    />
                  </label>

                  {!isOpenEnded && (
                    <label className="block">
                      <span className={`mb-1 block text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                        KM máximo
                      </span>
                      <input
                        type="number"
                        min={tier.minKm}
                        value={tier.maxKm ?? ''}
                        onChange={(e) =>
                          updateTier(tier.id, { maxKm: Number(e.target.value) || tier.minKm })
                        }
                        className={`w-full rounded-lg border px-3 py-2 text-sm font-semibold ${
                          isDark
                            ? 'border-zinc-700 bg-zinc-900 text-white'
                            : 'border-slate-300 bg-white text-slate-900'
                        }`}
                      />
                    </label>
                  )}

                  <label className="block">
                    <span className={`mb-1 block text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      {isOpenEnded ? 'Valor base (opcional)' : 'Preço fixo (R$)'}
                    </span>
                    <input
                      type="number"
                      step="0.5"
                      value={tier.price === null ? '' : tier.price}
                      onChange={(e) => {
                        const parsed = e.target.value.trim() === '' ? null : parseFloat(e.target.value);
                        updateTier(tier.id, { price: parsed === null || Number.isNaN(parsed) ? null : parsed });
                      }}
                      placeholder={isOpenEnded ? 'Opcional' : 'Sob consulta'}
                      className={`w-full rounded-lg border px-3 py-2 text-sm font-semibold ${
                        isDark
                          ? 'border-zinc-700 bg-zinc-900 text-white'
                          : 'border-slate-300 bg-white text-slate-900'
                      }`}
                    />
                  </label>

                  {allowPerKmTier && isLast && (
                    <label className="flex items-end gap-2 sm:col-span-2">
                      <input
                        id={`per-km-${tier.id}`}
                        type="checkbox"
                        checked={isOpenEnded}
                        onChange={(e) => handleToggleOpenEnded(tier.id, e.target.checked)}
                        className="h-4 w-4"
                      />
                      <span className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                        Acima de {tier.minKm} km, cobrar por KM adicional
                      </span>
                    </label>
                  )}

                  {isOpenEnded && (
                    <label className="block sm:col-span-2">
                      <span className={`mb-1 block text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                        Preço por KM acima de {tier.minKm} km (R$)
                      </span>
                      <input
                        type="number"
                        step="0.1"
                        min={0}
                        value={tier.pricePerKm === null || tier.pricePerKm === undefined ? '' : tier.pricePerKm}
                        onChange={(e) => {
                          const parsed = parseFloat(e.target.value);
                          updateTier(tier.id, {
                            pricePerKm: Number.isNaN(parsed) ? null : parsed,
                          });
                        }}
                        placeholder="Ex: 2.00"
                        className={`w-full rounded-lg border px-3 py-2 text-sm font-semibold ${
                          isDark
                            ? 'border-zinc-700 bg-zinc-900 text-white'
                            : 'border-slate-300 bg-white text-slate-900'
                        }`}
                      />
                    </label>
                  )}
                </div>

                <p className={`mt-2 text-[11px] ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                  {formatTierPriceSummary(tier)}
                </p>
              </div>
            );
          })}

          <button
            type="button"
            onClick={handleAddTier}
            className={`flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-sm font-semibold transition-colors ${
              isDark
                ? 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
                : 'border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-900'
            }`}
          >
            <Plus className="h-4 w-4" />
            Adicionar faixa de KM
          </button>
        </div>

        <div
          className={`flex items-center justify-end gap-3 border-t p-6 ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-200 bg-slate-50'}`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`rounded-xl border px-4 py-2.5 text-xs font-semibold transition-colors ${
              isDark ? 'border-zinc-800 text-zinc-400 hover:text-white' : 'border-slate-300 text-slate-600 hover:text-slate-900'
            }`}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold transition-all ${
              isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            <Save className="h-4 w-4" />
            Salvar alterações
          </button>
        </div>
      </div>
    </div>
  );
};
