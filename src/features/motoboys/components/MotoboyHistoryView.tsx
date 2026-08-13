import { ArrowLeft, History } from 'lucide-react';
import type { ThemeMode } from '../../../types';
import { HeaderNav } from '../../../components/HeaderNav';
import { AppViewport } from '../../../components/layout/AppViewport';
import { OrderHistoryPanel } from '../../../components/history/OrderHistoryPanel';
import { useMotoboyOrderHistory } from '../../../hooks/useOrderHistory';

interface MotoboyHistoryViewProps {
  motoboyId: string;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onLogout: () => void;
  onBack: () => void;
  userName?: string;
}

export function MotoboyHistoryView({
  motoboyId,
  theme,
  onToggleTheme,
  onLogout,
  onBack,
  userName,
}: MotoboyHistoryViewProps) {
  const isDark = theme === 'dark';
  const orders = useMotoboyOrderHistory(motoboyId);

  return (
    <AppViewport theme={theme}>
      <HeaderNav
        theme={theme}
        onToggleTheme={onToggleTheme}
        onLogout={onLogout}
        userName={userName}
      />

      <div className={`min-h-0 flex-1 overflow-y-auto ${isDark ? 'bg-black' : 'bg-slate-50'}`}>
        <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
          <button
            type="button"
            onClick={onBack}
            className={`mb-4 inline-flex items-center gap-1.5 text-xs font-semibold transition-colors ${
              isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao mapa
          </button>

          <div className="mb-6 flex items-center gap-2">
            <History className={`h-5 w-5 ${isDark ? 'text-white' : 'text-slate-900'}`} />
            <div>
              <h1 className={`text-xl font-bold sm:text-2xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Minhas corridas
              </h1>
              <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Todas as corridas que você aceitou, com valores e forma de pagamento.
              </p>
            </div>
          </div>

          <OrderHistoryPanel
            orders={orders}
            variant="MOTOBOY"
            isDark={isDark}
            amountLabel="Total recebido"
            emptyMessage="Você ainda não aceitou nenhuma corrida."
          />
        </div>
      </div>
    </AppViewport>
  );
}
