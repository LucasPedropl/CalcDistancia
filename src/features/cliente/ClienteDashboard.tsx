import { useState, useEffect, useMemo, useRef } from 'react';
import type {
  LocationPoint,
  RouteData,
  PriceTier,
  ThemeMode,
} from '../../types';
import type { OrderAssignmentMode } from '../../types/order';
import { fetchRealRoadRoute } from '../../services/geocodingService';
import { loadSavedPriceTiers, savePriceTiers } from '../../services/pricingService';
import { createOrder, cancelOrder } from '../../services/orderService';
import { getMotoboysNearLocation, DEFAULT_REFERENCE_LOCATION } from '../../services/motoboyService';
import {
  pushBroadcastMotoboyNotification,
  pushMotoboyNotification,
} from '../../services/motoboyNotificationService';
import { whatsappApi } from '../../services/whatsappApi';
import { useActiveOrderForClient } from '../../hooks/useOrders';
import { buildRouteDataFromOrder } from '../../utils/orderRoute';
import { useAuth } from '../../context/AuthContext';
import { getSavedAddresses, type SavedAddress } from '../../services/addressService';
import { loadLastOrigin, saveLastOrigin, loadFavoriteMotoboyIds, toggleFavoriteMotoboy } from '../../services/clientStateService';

import { ClienteMainView } from './components/ClienteMainView';
import { ClienteDeliverySetup } from './components/ClienteDeliverySetup';
import { ClienteHomeMap } from './components/ClienteHomeMap';
import { ClienteSettingsView, type SettingsSection } from './components/ClienteSettingsView';
import { Screen2MainView } from '../../components/Screen2MainView';
import { HeaderNav } from '../../components/HeaderNav';
import { RouteMap } from '../../components/RouteMap';
import { OrderModal } from '../../components/OrderModal';
import { OrderChatWidget } from '../../components/chat/OrderChatWidget';
import { CheckCircle } from 'lucide-react';

type ClientViewMode = 'HOME' | 'DELIVERY' | 'SETTINGS';

function resolveSavedOrigin(userId: string, point: LocationPoint | SavedAddress | null): SavedAddress | null {
  if (!point) return null;
  const addresses = getSavedAddresses(userId);
  const withId = point as SavedAddress;
  if (withId.id) {
    const byId = addresses.find((a) => a.id === withId.id);
    if (byId) return byId;
  }
  const byCoords = addresses.find((a) => a.lat === point.lat && a.lng === point.lng);
  if (byCoords) return byCoords;
  const byAddress = addresses.find((a) => a.address === point.address);
  return byAddress ?? null;
}

export function ClienteDashboard() {
  const { user, logout } = useAuth();
  const [viewMode, setViewMode] = useState<ClientViewMode>('HOME');
  const [settingsSection, setSettingsSection] = useState<SettingsSection>('profile');
  const [origin, setOrigin] = useState<SavedAddress | null>(null);
  const [destination, setDestination] = useState<LocationPoint | null>(null);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [originLoaded, setOriginLoaded] = useState(false);

  const [priceTiers, setPriceTiers] = useState<PriceTier[]>([]);

  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('calc_distancia_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {
      console.error('Failed to load theme preference', e);
    }
    return 'light';
  });

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderPrice, setOrderPrice] = useState<number | null>(null);
  const [orderTier, setOrderTier] = useState<PriceTier | undefined>(undefined);
  const [selectedMotoboyId, setSelectedMotoboyId] = useState<string | null>(null);
  const [favoriteMotoboyIds, setFavoriteMotoboyIds] = useState<string[]>([]);

  const clientActiveOrder = useActiveOrderForClient(user?.id);
  const acceptedToastShownRef = useRef<string | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  useEffect(() => {
    if (!user) return;
    setFavoriteMotoboyIds(loadFavoriteMotoboyIds(user.id));
  }, [user]);

  useEffect(() => {
    setPriceTiers(loadSavedPriceTiers());
  }, []);

  useEffect(() => {
    if (!user || originLoaded) return;

    const addresses = getSavedAddresses(user.id);
    const defaultAddr = addresses.find((a) => a.isDefault);
    const lastOrigin = loadLastOrigin(user.id);

    if (defaultAddr) {
      setOrigin(defaultAddr);
    } else if (lastOrigin) {
      setOrigin(resolveSavedOrigin(user.id, lastOrigin));
    }

    setOriginLoaded(true);
  }, [user, originLoaded]);

  useEffect(() => {
    if (user && origin) {
      saveLastOrigin(user.id, origin);
    }
  }, [user, origin]);

  const handleToggleFavoriteMotoboy = (motoboyId: string) => {
    if (!user) return;
    setFavoriteMotoboyIds(toggleFavoriteMotoboy(user.id, motoboyId));
  };

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

    if (viewMode === 'DELIVERY' && origin && destination) {
      setIsRouteLoading(true);
      fetchRealRoadRoute(origin, destination).then((data) => {
        if (isCurrent) {
          setRouteData(data);
          setIsRouteLoading(false);
        }
      });
    } else if (!destination) {
      setRouteData(null);
      setIsRouteLoading(false);
    }

    return () => {
      isCurrent = false;
    };
  }, [origin, destination, viewMode]);

  const handleOpenSettings = (section: SettingsSection = 'profile') => {
    setSettingsSection(section);
    setViewMode('SETTINGS');
  };

  const handleUpdateOrigin = (addr: SavedAddress | null) => {
    setOrigin(addr);
    if (addr && routeData) {
      setRouteData({ ...routeData, origin: addr });
    }
  };

  const handleStartDelivery = () => {
    if (!origin) {
      handleOpenSettings('addresses');
      return;
    }
    if (clientActiveOrder) {
      openActiveOrderView(clientActiveOrder);
      return;
    }
    setDestination(null);
    setRouteData(null);
    setViewMode('DELIVERY');
  };

  const handleSendToSelected = () => {
    if (!origin) {
      handleOpenSettings('addresses');
      return;
    }
    if (!selectedMotoboyId) return;
    if (clientActiveOrder) {
      openActiveOrderView(clientActiveOrder);
      return;
    }
    setDestination(null);
    setRouteData(null);
    setViewMode('DELIVERY');
  };

  const openActiveOrderView = (order: NonNullable<typeof clientActiveOrder>) => {
    setOrigin(order.origin as SavedAddress);
    setDestination(order.destination);
    setRouteData(buildRouteDataFromOrder(order));
    setViewMode('DELIVERY');
  };

  const handleCancelActiveOrder = () => {
    if (!clientActiveOrder) return;
    const confirmed = window.confirm(
      clientActiveOrder.status === 'ACCEPTED'
        ? 'Deseja realmente cancelar esta corrida em andamento?'
        : 'Deseja cancelar este pedido aguardando motoboy?',
    );
    if (!confirmed) return;

    cancelOrder(clientActiveOrder.id, 'CLIENT');
    setDestination(null);
    setRouteData(null);
    setViewMode('HOME');
    showToast('Pedido cancelado.', 'info');
  };

  const handleCalculateRoute = () => {
    if (origin && destination && routeData) {
      showToast('Rota calculada com sucesso!', 'success');
    }
  };

  const handleBackToHome = () => {
    setDestination(null);
    setRouteData(null);
    setSelectedMotoboyId(null);
    setViewMode('HOME');
  };

  const handleConfirmPedido = (price: number | null, tier?: PriceTier) => {
    setOrderPrice(price);
    setOrderTier(tier);
    setIsOrderModalOpen(true);
  };

  const handleOrderSuccess = async (trackingPhone: string) => {
    if (!routeData || !user) return;

    const assignmentMode: OrderAssignmentMode = selectedMotoboyId ? 'DIRECT' : 'BROADCAST';

    const order = createOrder({
      clientId: user.id,
      clientName: user.name,
      origin: routeData.origin,
      destination: routeData.destination,
      distanceKm: routeData.distanceKm,
      durationMin: routeData.durationMin,
      price: orderPrice,
      tierLabel: orderTier?.label,
      trackingPhone: trackingPhone || undefined,
      assignmentMode,
      targetMotoboyId: selectedMotoboyId ?? undefined,
      polyline: routeData.polyline,
    });

    const clientePhone = trackingPhone.trim() || user.phone || '';
    const clienteNome = user.name;

    try {
      if (clientePhone) {
        await whatsappApi.enviarNotificacaoCliente(
          clientePhone,
          clienteNome,
          `📦 *Pedido confirmado!*\n\n` +
            `Origem: ${routeData.origin.address}\n` +
            `Destino: ${routeData.destination.address}\n` +
            `Distância: ${routeData.distanceKm} km\n` +
            (orderPrice !== null ? `Valor: R$ ${orderPrice.toFixed(2)}\n` : '') +
            `\nAcompanhe o status pelo app.`,
        );
      }

      if (assignmentMode === 'DIRECT' && selectedMotoboyId) {
        pushMotoboyNotification({
          motoboyId: selectedMotoboyId,
          title: 'Novo pedido direto',
          message:
            `Pedido exclusivo: ${routeData.origin.address} → ${routeData.destination.address} (${routeData.distanceKm} km)`,
          orderId: order.id,
        });
      } else {
        pushBroadcastMotoboyNotification({
          title: 'Novo pedido global',
          message: `Corrida disponível: ${routeData.distanceKm} km — ${routeData.destination.address}`,
          orderId: order.id,
        });
      }
    } catch (error) {
      console.error('Falha ao enviar notificação WhatsApp:', error);
      showToast(
        error instanceof Error ? error.message : 'Pedido criado, mas falha ao enviar WhatsApp.',
        'info',
      );
    }

    if (assignmentMode === 'DIRECT') {
      showToast('Pedido enviado! Aguardando aceite do motoboy.', 'info');
    } else {
      showToast('Pedido enviado globalmente! Aguardando um motoboy aceitar.', 'info');
    }
  };

  useEffect(() => {
    if (
      clientActiveOrder?.status === 'ACCEPTED' &&
      clientActiveOrder.acceptedMotoboyName &&
      acceptedToastShownRef.current !== clientActiveOrder.id
    ) {
      acceptedToastShownRef.current = clientActiveOrder.id;
      showToast(`${clientActiveOrder.acceptedMotoboyName} aceitou seu pedido!`, 'success');
    }
  }, [clientActiveOrder]);

  const handleLogout = () => {
    logout();
    handleBackToHome();
    setOrigin(null);
    setOriginLoaded(false);
  };

  const showToast = (message: string, type: 'success' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const isDark = theme === 'dark';
  const isAdmin = user?.role === 'ADMIN';

  const homeMotoboys = useMemo(() => {
    return getMotoboysNearLocation(origin ?? DEFAULT_REFERENCE_LOCATION);
  }, [origin]);

  const deliveryMotoboys = useMemo(() => {
    if (!routeData) return homeMotoboys;
    return getMotoboysNearLocation(routeData.origin);
  }, [routeData, homeMotoboys]);

  const selectedMotoboy = deliveryMotoboys.find((m) => m.id === selectedMotoboyId);
  const showDeliveryResult = viewMode === 'DELIVERY' && routeData !== null;

  return (
    <div
      className={`min-h-screen font-sans selection:bg-slate-900 selection:text-white transition-colors ${
        isDark ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {viewMode === 'HOME' && user && (
        <ClienteMainView
          origin={origin}
          userId={user.id}
          onUpdateOrigin={handleUpdateOrigin}
          onOpenSettings={() => handleOpenSettings('profile')}
          motoboys={homeMotoboys}
          selectedMotoboyId={selectedMotoboyId}
          onSelectMotoboy={setSelectedMotoboyId}
          onStartDelivery={handleStartDelivery}
          onSendToSelected={handleSendToSelected}
          favoriteMotoboyIds={favoriteMotoboyIds}
          onToggleFavorite={handleToggleFavoriteMotoboy}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onLogout={handleLogout}
          userName={user.name}
          userEmail={user.email}
          clientActiveOrder={clientActiveOrder}
          onViewActiveOrder={clientActiveOrder ? () => openActiveOrderView(clientActiveOrder) : undefined}
          onCancelActiveOrder={clientActiveOrder ? handleCancelActiveOrder : undefined}
        />
      )}

      {viewMode === 'SETTINGS' && user && (
        <ClienteSettingsView
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onLogout={handleLogout}
          onBack={() => setViewMode('HOME')}
          userId={user.id}
          userName={user.name}
          userEmail={user.email}
          canEditPriceTable={isAdmin}
          priceTiers={priceTiers}
          onTiersUpdated={(newTiers) => {
            savePriceTiers(newTiers);
            setPriceTiers(newTiers);
            showToast('Tabela de preços atualizada!', 'success');
          }}
          initialSection={settingsSection}
          onAddressesChange={(addresses) => {
            if (origin && !addresses.some((a) => a.id === origin.id)) {
              const fallback = addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;
              setOrigin(fallback);
            }
          }}
        />
      )}

      {viewMode === 'DELIVERY' && !showDeliveryResult && (
        <div
          className={`flex h-screen w-screen flex-col overflow-hidden font-sans transition-colors ${
            isDark ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'
          }`}
        >
          <HeaderNav
            onOpenSettings={() => handleOpenSettings('profile')}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            onLogout={handleLogout}
            userName={user?.name}
            userEmail={user?.email}
            onlineMotoboyCount={homeMotoboys.length}
            motoboyRegionLabel={origin ? 'na sua região' : 'em Belo Horizonte (demo)'}
          />
          <div className="relative z-0 flex flex-1 flex-col overflow-hidden lg:flex-row">
            <ClienteDeliverySetup
              origin={origin}
              userId={user?.id ?? ''}
              onUpdateOrigin={handleUpdateOrigin}
              onOpenSettings={() => handleOpenSettings('addresses')}
              destination={destination}
              onUpdateDestination={setDestination}
              onCalculateRoute={handleCalculateRoute}
              onBack={handleBackToHome}
              isRouteLoading={isRouteLoading}
              canCalculate={Boolean(origin && destination && routeData && !isRouteLoading)}
              motoboys={homeMotoboys}
              selectedMotoboyId={selectedMotoboyId}
              onSelectMotoboy={setSelectedMotoboyId}
              favoriteMotoboyIds={favoriteMotoboyIds}
              onToggleFavorite={handleToggleFavoriteMotoboy}
              deliveryDistanceKm={routeData?.distanceKm ?? null}
              theme={theme}
            />
            <main
              className={`relative z-0 h-full flex-1 border-t lg:border-t-0 lg:border-l ${
                isDark ? 'border-zinc-800' : 'border-slate-200'
              }`}
            >
              {routeData ? (
                <RouteMap
                  routeData={routeData}
                  theme={theme}
                  availableMotoboys={homeMotoboys}
                  selectedMotoboyId={selectedMotoboyId}
                  onMotoboySelect={setSelectedMotoboyId}
                />
              ) : (
                <ClienteHomeMap
                  origin={origin}
                  motoboys={homeMotoboys}
                  selectedMotoboyId={selectedMotoboyId}
                  onMotoboySelect={setSelectedMotoboyId}
                  theme={theme}
                />
              )}
            </main>
          </div>
        </div>
      )}

      {showDeliveryResult && routeData && user && (
        <Screen2MainView
          routeData={routeData}
          origin={origin}
          userId={user.id}
          onUpdateOrigin={handleUpdateOrigin}
          onUpdateDestination={setDestination}
          onOpenSettings={() => handleOpenSettings('profile')}
          onConfirmPedido={handleConfirmPedido}
          priceTiers={priceTiers}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onLogout={handleLogout}
          userName={user.name}
          userEmail={user.email}
          availableMotoboys={deliveryMotoboys}
          selectedMotoboyId={selectedMotoboyId}
          onSelectMotoboy={setSelectedMotoboyId}
          pendingOrder={clientActiveOrder}
          onNewOrder={handleBackToHome}
          onCancelOrder={clientActiveOrder ? handleCancelActiveOrder : undefined}
        />
      )}

      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        routeData={routeData}
        price={orderPrice}
        tier={orderTier}
        assignmentMode={selectedMotoboyId ? 'DIRECT' : 'BROADCAST'}
        targetMotoboyName={selectedMotoboy?.name}
        onConfirmSuccess={handleOrderSuccess}
        theme={theme}
      />

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-2xl ${
            isDark
              ? 'border-zinc-700 bg-zinc-900 text-white'
              : 'border-slate-300 bg-white text-slate-900 shadow-slate-300/50'
          }`}
        >
          <CheckCircle className={`h-5 w-5 shrink-0 ${isDark ? 'text-white' : 'text-slate-900'}`} />
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {(clientActiveOrder?.status === 'ACCEPTED' || clientActiveOrder?.status === 'PICKED_UP') && user && (
        <OrderChatWidget
          orderId={clientActiveOrder.id}
          currentUserId={user.id}
          currentUserName={user.name}
          currentUserRole="CLIENT"
          otherPartyName={clientActiveOrder.acceptedMotoboyName ?? 'Motoboy'}
          theme={theme}
        />
      )}
    </div>
  );
}
