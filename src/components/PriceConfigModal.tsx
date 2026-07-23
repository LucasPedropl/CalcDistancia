import React, { useState } from 'react';
import type { PriceTier, ThemeMode } from '../types';
import { savePriceTiers } from '../services/pricingService';
import { X, Save, DollarSign } from 'lucide-react';

interface PriceConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  tiers: PriceTier[];
  onTiersUpdated: (newTiers: PriceTier[]) => void;
  theme?: ThemeMode;
}

export const PriceConfigModal: React.FC<PriceConfigModalProps> = ({
  isOpen,
  onClose,
  tiers,
  onTiersUpdated,
  theme = 'dark',
}) => {
  const [editedTiers, setEditedTiers] = useState<PriceTier[]>(tiers);
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  const handlePriceChange = (id: string, newPriceVal: string) => {
    const parsed = newPriceVal.trim() === '' ? null : parseFloat(newPriceVal);
    setEditedTiers((prev) =>
      prev.map((tier) => (tier.id === id ? { ...tier, price: isNaN(parsed as number) ? null : parsed } : tier))
    );
  };

  const handleSave = () => {
    savePriceTiers(editedTiers);
    onTiersUpdated(editedTiers);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`border rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 transition-colors ${
          isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className={`p-6 border-b flex items-center justify-between ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'}`}>
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Tabela de Preços Parametrizável</h3>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Edite as faixas de distância e valores de referência
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-900' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div
            className={`text-xs p-3 rounded-lg border ${
              isDark
                ? 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            Conforme a especificação do projeto (<code className="font-bold">docs/projeto.md</code>), estas faixas definem os valores base por distância.
          </div>

          <div className={`divide-y border rounded-xl overflow-hidden ${isDark ? 'divide-zinc-900 border-zinc-800' : 'divide-slate-200 border-slate-200'}`}>
            {editedTiers.map((tier) => (
              <div
                key={tier.id}
                className={`p-4 flex items-center justify-between gap-4 ${
                  isDark ? 'bg-zinc-900/30' : 'bg-slate-50/50'
                }`}
              >
                <div>
                  <span className="font-bold text-sm block">{tier.label}</span>
                  <span className={`text-xs ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                    {tier.maxKm === null ? `Acima de ${tier.minKm} km` : `De ${tier.minKm} km até ${tier.maxKm} km`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>R$</span>
                  <input
                    type="number"
                    step="0.5"
                    value={tier.price === null ? '' : tier.price}
                    onChange={(e) => handlePriceChange(tier.id, e.target.value)}
                    placeholder="Sob consulta"
                    className={`w-32 border rounded-lg px-3 py-1.5 text-sm font-bold focus:outline-none text-right ${
                      isDark
                        ? 'bg-zinc-900 border-zinc-700 text-white focus:border-white'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`p-6 border-t flex items-center justify-end gap-3 ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-200 bg-slate-50'}`}>
          <button
            onClick={onClose}
            className={`px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors ${
              isDark ? 'border-zinc-800 text-zinc-400 hover:text-white' : 'border-slate-300 text-slate-600 hover:text-slate-900'
            }`}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>Salvar Alterações</span>
          </button>
        </div>
      </div>
    </div>
  );
};
