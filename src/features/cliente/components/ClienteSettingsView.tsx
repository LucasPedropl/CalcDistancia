import { useState } from 'react';
import type { PriceTier, ThemeMode } from '../../../types';
import type { SavedAddress } from '../../../services/addressService';
import { HeaderNav } from '../../../components/HeaderNav';
import { UserSettingsPanel } from './UserSettingsPanel';
import { AddressSettingsPanel } from './AddressSettingsPanel';
import { PriceConfigModal } from '../../../components/PriceConfigModal';
import { ArrowLeft, MapPin, Settings, User, DollarSign } from 'lucide-react';

export type SettingsSection = 'profile' | 'addresses' | 'pricing';

interface ClienteSettingsViewProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onLogout: () => void;
  onBack: () => void;
  userId: string;
  userName?: string;
  userEmail?: string;
  canEditPriceTable: boolean;
  priceTiers: PriceTier[];
  onTiersUpdated: (tiers: PriceTier[]) => void;
  initialSection?: SettingsSection;
  onAddressesChange?: (addresses: SavedAddress[]) => void;
}

const SECTIONS: { id: SettingsSection; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Conta', icon: User },
  { id: 'addresses', label: 'Endereços', icon: MapPin },
];

export function ClienteSettingsView({
  theme,
  onToggleTheme,
  onLogout,
  onBack,
  userId,
  userName,
  userEmail,
  canEditPriceTable,
  priceTiers,
  onTiersUpdated,
  initialSection = 'profile',
  onAddressesChange,
}: ClienteSettingsViewProps) {
  const isDark = theme === 'dark';
  const [activeSection, setActiveSection] = useState<SettingsSection>(initialSection);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);

  const navSections = canEditPriceTable
    ? [...SECTIONS, { id: 'pricing' as const, label: 'Tabela de Preços', icon: DollarSign }]
    : SECTIONS;

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
        userEmail={userEmail}
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
            {navSections.map(({ id, label, icon: Icon }) => {
              const isActive = activeSection === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    if (id === 'pricing') {
                      setIsPriceModalOpen(true);
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
            {activeSection === 'profile' && <UserSettingsPanel theme={theme} />}
            {activeSection === 'addresses' && (
              <AddressSettingsPanel
                userId={userId}
                theme={theme}
                onAddressesChange={onAddressesChange}
              />
            )}
            {activeSection === 'pricing' && canEditPriceTable && (
              <div className="space-y-4">
                <div>
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Tabela de Preços
                  </h2>
                  <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Configure as faixas de distância e valores de entrega.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPriceModalOpen(true)}
                  className={`rounded-xl px-6 py-3 text-sm font-bold transition-colors ${
                    isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  Abrir editor de preços
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {canEditPriceTable && (
        <PriceConfigModal
          isOpen={isPriceModalOpen}
          onClose={() => setIsPriceModalOpen(false)}
          tiers={priceTiers}
          onTiersUpdated={onTiersUpdated}
          theme={theme}
          allowPerKmTier
        />
      )}
    </div>
  );
}
