import { useState, useEffect } from 'react';
import type {
  LocationPoint,
  RouteData,
  AppScreen,
  PriceTier,
  ThemeMode,
} from './types';
import { fetchRealRoadRoute } from './services/geocodingService';
import { loadSavedPriceTiers } from './services/pricingService';
import {
  loadAuthSession,
  clearAuthSession,
  isAdminSession,
  type AuthSession,
} from './services/authService';
import { LoginScreen } from './components/LoginScreen';
import { Screen1TopBar } from './components/Screen1TopBar';
import { Screen2MainView } from './components/Screen2MainView';
import { PriceConfigModal } from './components/PriceConfigModal';
import { OrderModal } from './components/OrderModal';
import { CheckCircle } from 'lucide-react';

export function App() {
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => loadAuthSession());
  const [screen, setScreen] = useState<AppScreen>('SEARCH');
  const [origin, setOrigin] = useState<LocationPoint | null>(null);
  const [destination, setDestination] = useState<LocationPoint | null>(null);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isRouteLoading, setIsRouteLoading] = useState(false);

  const [priceTiers, setPriceTiers] = useState<PriceTier[]>([]);
  const [useGoogleMaps, setUseGoogleMaps] = useState<boolean>(false);

  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('calc_distancia_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {
      console.error('Failed to load theme preference', e);
    }
    return 'dark';
  });

  const [isPriceConfigOpen, setIsPriceConfigOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderPrice, setOrderPrice] = useState<number | null>(null);
  const [orderTier, setOrderTier] = useState<PriceTier | undefined>(undefined);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  useEffect(() => {
    setPriceTiers(loadSavedPriceTiers());
  }, []);

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('calc_distancia_theme', nextTheme);
      } catch (e) {
        console.error('Failed to save theme preference', e);
      }
      return nextTheme;
    });
  };

  useEffect(() => {
    let isCurrent = true;

    if (origin && destination) {
      setIsRouteLoading(true);
      fetchRealRoadRoute(origin, destination).then((data) => {
        if (isCurrent) {
          setRouteData(data);
          setIsRouteLoading(false);
        }
      });
    } else {
      setRouteData(null);
      setIsRouteLoading(false);
      if (screen === 'ROUTE_RESULT') {
        setScreen('SEARCH');
      }
    }

    return () => {
      isCurrent = false;
    };
  }, [origin, destination, screen]);

  const handleAdvance = () => {
    if (origin && destination && routeData) {
      setScreen('ROUTE_RESULT');
      showToast('Rota calculada com sucesso!', 'success');
    }
  };

  const handleReset = () => {
    setOrigin(null);
    setDestination(null);
    setRouteData(null);
    setScreen('SEARCH');
    showToast('Nova consulta iniciada.', 'info');
  };

  const handleConfirmPedido = (price: number | null, tier?: PriceTier) => {
    setOrderPrice(price);
    setOrderTier(tier);
    setIsOrderModalOpen(true);
  };

  const handleOrderSuccess = () => {
    showToast('Pedido confirmado com sucesso!', 'success');
    handleReset();
  };

  const handleLogout = () => {
    clearAuthSession();
    setAuthSession(null);
    handleReset();
  };

  const showToast = (message: string, type: 'success' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const isDark = theme === 'dark';
  const isAdmin = isAdminSession(authSession);

  if (!authSession) {
    return (
      <div
        className={`min-h-screen font-sans selection:bg-slate-900 selection:text-white transition-colors ${
          isDark ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'
        }`}
      >
        <LoginScreen onLoginSuccess={() => setAuthSession(loadAuthSession())} theme={theme} />
      </div>
    );
  }

  const showRouteView = screen === 'ROUTE_RESULT' && routeData !== null;

  return (
    <div
      className={`min-h-screen font-sans selection:bg-slate-900 selection:text-white transition-colors ${
        isDark ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {screen === 'SEARCH' ? (
        <Screen1TopBar
          origin={origin}
          destination={destination}
          onOriginChange={setOrigin}
          onDestinationChange={setDestination}
          onAdvance={handleAdvance}
          isRouteLoading={isRouteLoading}
          canCalculateRoute={Boolean(origin && destination && routeData && !isRouteLoading)}
          onOpenPriceConfig={isAdmin ? () => setIsPriceConfigOpen(true) : undefined}
          useGoogleMaps={useGoogleMaps}
          onToggleMapEngine={() => setUseGoogleMaps((prev) => !prev)}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onLogout={handleLogout}
        />
      ) : showRouteView ? (
        <Screen2MainView
          routeData={routeData}
          onUpdateOrigin={setOrigin}
          onUpdateDestination={setDestination}
          onOpenPriceConfig={isAdmin ? () => setIsPriceConfigOpen(true) : () => {}}
          onConfirmPedido={handleConfirmPedido}
          priceTiers={priceTiers}
          useGoogleMaps={useGoogleMaps}
          onToggleMapEngine={() => setUseGoogleMaps((prev) => !prev)}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onLogout={handleLogout}
          canEditPriceTable={isAdmin}
        />
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-zinc-500">Informe origem e destino para calcular a rota.</p>
        </div>
      )}

      <PriceConfigModal
        isOpen={isPriceConfigOpen && isAdmin}
        onClose={() => setIsPriceConfigOpen(false)}
        tiers={priceTiers}
        onTiersUpdated={(newTiers) => {
          setPriceTiers(newTiers);
          showToast('Tabela de preços atualizada!', 'success');
        }}
        theme={theme}
      />

      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        routeData={routeData}
        price={orderPrice}
        tier={orderTier}
        onConfirmSuccess={handleOrderSuccess}
        theme={theme}
      />

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200 border ${
            isDark
              ? 'bg-zinc-900 border-zinc-700 text-white'
              : 'bg-white border-slate-300 text-slate-900 shadow-slate-300/50'
          }`}
        >
          <CheckCircle className={`w-5 h-5 shrink-0 ${isDark ? 'text-white' : 'text-slate-900'}`} />
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default App;
