import type { DeliveryOrder } from '../../../types/order';
import type { RouteData, ThemeMode } from '../../../types';
import { MotoboyOrdersSidebar } from './MotoboyOrdersSidebar';
import { MotoboyMap } from './MotoboyMap';
import { RouteMap } from '../../../components/RouteMap';
import { MotoboyNotificationsBell } from './MotoboyNotificationsBell';
import { Route, LogOut, Moon, Settings, Sun } from 'lucide-react';

interface MotoboyMainViewProps {
  openOrders: DeliveryOrder[];
  activeOrder: DeliveryOrder | null;
  previewOrderId: string | null;
  mapRoute: RouteData | null;
  isLoadingRoute: boolean;
  onPreviewOrder: (orderId: string) => void;
  onConfirmAccept: () => void;
  onCancelPreview: () => void;
  onCancelActiveOrder?: () => void;
  onCompleteActiveOrder?: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  userName?: string;
  motoboyId: string;
}

export function MotoboyMainView({
  openOrders,
  activeOrder,
  previewOrderId,
  mapRoute,
  isLoadingRoute,
  onPreviewOrder,
  onConfirmAccept,
  onCancelPreview,
  onCancelActiveOrder,
  onCompleteActiveOrder,
  theme,
  onToggleTheme,
  onLogout,
  onOpenSettings,
  userName,
  motoboyId,
}: MotoboyMainViewProps) {
  const isDark = theme === 'dark';
  const isBusy = activeOrder !== null;

  return (
    <div
      className={`flex h-screen w-screen flex-col overflow-hidden font-sans transition-colors ${
        isDark ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <header
        className={`relative z-40 flex w-full items-center justify-between border-b px-6 py-4 transition-colors ${
          isDark ? 'border-zinc-800 bg-black text-white' : 'border-slate-200 bg-white text-slate-900 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg font-black tracking-tighter ${
              isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'
            }`}
          >
            <Route className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight sm:text-lg">UaiPDV Entregador</h1>
            {userName && (
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                {isBusy ? `Em corrida · ${activeOrder.id}` : `Olá, ${userName}`}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <MotoboyNotificationsBell motoboyId={motoboyId} />
          <button
            type="button"
            onClick={onOpenSettings}
            className={`rounded-lg border p-2 transition-colors ${
              isDark
                ? 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:text-white'
                : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
            }`}
            title="Configurações"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            className={`rounded-lg border p-2 transition-colors ${
              isDark
                ? 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:text-white'
                : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
            }`}
            title={`Alternar para modo ${isDark ? 'Claro' : 'Escuro'}`}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={onLogout}
            className={`rounded-lg border p-2 transition-colors ${
              isDark
                ? 'border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white'
                : 'border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="relative z-0 flex flex-1 flex-col overflow-hidden lg:flex-row">
        <MotoboyOrdersSidebar
          openOrders={openOrders}
          activeOrder={activeOrder}
          previewOrderId={previewOrderId}
          onPreviewOrder={onPreviewOrder}
          onConfirmAccept={onConfirmAccept}
          onCancelPreview={onCancelPreview}
          onCancelActiveOrder={onCancelActiveOrder}
          onCompleteActiveOrder={onCompleteActiveOrder}
          theme={theme}
        />

        <main
          className={`relative z-0 h-full flex-1 border-t lg:border-t-0 lg:border-l ${
            isDark ? 'border-zinc-800' : 'border-slate-200'
          }`}
        >
          {isLoadingRoute ? (
            <div
              className={`flex h-full items-center justify-center ${
                isDark ? 'bg-zinc-950 text-zinc-400' : 'bg-slate-100 text-slate-500'
              }`}
            >
              <p className="text-sm font-medium">Carregando rota...</p>
            </div>
          ) : mapRoute ? (
            <RouteMap routeData={mapRoute} theme={theme} />
          ) : (
            <MotoboyMap orders={openOrders} theme={theme} />
          )}
        </main>
      </div>
    </div>
  );
}
