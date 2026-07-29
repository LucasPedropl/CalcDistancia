import { useState } from 'react';
import type { PriceTier, ThemeMode } from '../../../types';
import { HeaderNav } from '../../../components/HeaderNav';
import { MotoboyForm } from '../components/MotoboyForm';
import { PriceConfigModal } from '../../../components/PriceConfigModal';
import {
  loadMotoboyPriceTiers,
  saveMotoboyPriceTiers,
} from '../../../services/motoboyPricingService';
import { ArrowLeft, DollarSign, Settings, User } from 'lucide-react';

export type MotoboySettingsSection = 'profile' | 'pricing';

interface MotoboySettingsViewProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onLogout: () => void;
  onBack: () => void;
  motoboyId: string;
  userName?: string;
  initialSection?: MotoboySettingsSection;
}

const SECTIONS: { id: MotoboySettingsSection; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'pricing', label: 'Tabela de Preços', icon: DollarSign },
];

export function MotoboySettingsView({
  theme,
  onToggleTheme,
  onLogout,
  onBack,
  motoboyId,
  userName,
  initialSection = 'profile',
}: MotoboySettingsViewProps) {
  const isDark = theme === 'dark';
  const [activeSection, setActiveSection] = useState<MotoboySettingsSection>(initialSection);
  const [priceTiers, setPriceTiers] = useState<PriceTier[]>(() => loadMotoboyPriceTiers(motoboyId));
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);

  const handleTiersUpdated = (tiers: PriceTier[]) => {
    saveMotoboyPriceTiers(motoboyId, tiers);
    setPriceTiers(tiers);
  };

  return (
    <div
      className={`flex h-screen w-screen flex-col overflow-hidden font-sans transition-colors ${
        isDark ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <HeaderNav
        theme={theme}
        onToggleTheme={onToggleTheme}
        onLogout={onLogout}
        userName={userName}
      />

      <div className="flex flex-1 overflow-hidden">
        <aside
          className={`flex w-full shrink-0 flex-col border-r lg:w-64 ${
            isDark ? 'border-zinc-800 bg-zinc-950' : 'border-slate-200 bg-white'
          }`}
        >
          <div className={`border-b p-4 ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
            <button
              type="button"
              onClick={onBack}
              className={`mb-3 inline-flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao mapa
            </button>
            <div className="flex items-center gap-2">
              <Settings className={`h-5 w-5 ${isDark ? 'text-white' : 'text-slate-900'}`} />
              <h1 className="text-lg font-bold">Configurações</h1>
            </div>
          </div>

          <nav className="flex-1 space-y-1 p-3">
            {SECTIONS.map(({ id, label, icon: Icon }) => {
              const isActive = activeSection === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    if (id === 'pricing') {
                      setIsPriceModalOpen(true);
                      setActiveSection('pricing');
                      return;
                    }
                    setActiveSection(id);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors ${
                    isActive
                      ? isDark
                        ? 'bg-white text-black'
                        : 'bg-slate-900 text-white'
                      : isDark
                        ? 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl p-6 sm:p-8">
            {activeSection === 'profile' && <MotoboyForm theme={theme} />}
            {activeSection === 'pricing' && (
              <div className="space-y-4">
                <div>
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Sua tabela por KM
                  </h2>
                  <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Defina quanto você cobra por faixa de distância. Clientes veem esse valor ao
                    escolher você para a entrega.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPriceModalOpen(true)}
                  className={`rounded-xl px-6 py-3 text-sm font-bold transition-colors ${
                    isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  Editar tabela de preços
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      <PriceConfigModal
        isOpen={isPriceModalOpen}
        onClose={() => setIsPriceModalOpen(false)}
        tiers={priceTiers}
        onTiersUpdated={handleTiersUpdated}
        theme={theme}
        allowPerKmTier
      />
    </div>
  );
}
