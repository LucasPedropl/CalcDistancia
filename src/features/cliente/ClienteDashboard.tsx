import { useState, useEffect, useMemo, useRef } from 'react';
import type {
  LocationPoint,
  RouteData,
  PriceTier,
  ThemeMode,
} from '../../types';
import type { OrderAssignmentMode, OrderCheckoutResult } from '../../types/order';
import type { DestinationConfirmMeta, DestinationConfirmResult } from '../../types/destination';
import { fetchRealRoadRoute, reverseGeocode, type ReverseGeocodeResult } from '../../services/geocodingService';
import { loadSavedPriceTiers, savePriceTiers } from '../../services/pricingService';
import { createOrder, cancelOrder, simulateOrderAcceptance } from '../../services/orderService';
import { getMotoboysNearLocation, DEFAULT_REFERENCE_LOCATION } from '../../services/motoboyService';
import {
  pushBroadcastMotoboyNotification,
  pushMotoboyNotification,
} from '../../services/motoboyNotificationService';
import { whatsappApi } from '../../services/whatsappApi';
import { useActiveOrdersForClient, useOrderTracker } from '../../hooks/useOrders';
import { useMotoboySimulationTicker, useMotoboySimulationRefresh } from '../../hooks/useMotoboySimulation';
import { buildRouteDataFromOrder } from '../../utils/orderRoute';
import { useAuth } from '../../context/AuthContext';
import { getSavedAddresses, type SavedAddress } from '../../services/addressService';
import { loadLastOrigin, saveLastOrigin, loadFavoriteMotoboyIds, toggleFavoriteMotoboy, loadMotoboySearchRadiusKm, saveMotoboySearchRadiusKm } from '../../services/clientStateService';
import { normalizeBrazilianStateToUf, type AddressFormFields } from '../../types/addressForm';
import type { MapPickTarget } from '../../components/MapDestinationContextMenu';

import { ClienteMainView } from './components/ClienteMainView';
import { ClienteSettingsView, type SettingsSection } from './components/ClienteSettingsView';
import { Screen2MainView } from '../../components/Screen2MainView';
import { MapDestinationContextMenu } from '../../components/MapDestinationContextMenu';
import { DestinationAddressModal } from '../../components/DestinationAddressModal';
import { CondominiumDestinationConfirmModal } from '../../components/CondominiumDestinationConfirmModal';
import { OrderModal } from '../../components/OrderModal';
import { formatTrackingWhatsAppFooter, getClientTrackingUrl } from '../../utils/trackingUrl';
import { OrderChatWidget } from '../../components/chat/OrderChatWidget';
import { CheckCircle } from 'lucide-react';

type ClientViewMode = 'MAIN' | 'SETTINGS';

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

function reverseGeocodeToOriginFields(base: ReverseGeocodeResult): Partial<AddressFormFields> {
  return {
    cep: base.cep ?? '',
    street: base.street,
    district: base.district ?? '',
    city: base.city ?? '',
    state: normalizeBrazilianStateToUf(base.state ?? ''),
    number: '',
    complement: '',
  };
}

export function ClienteDashboard() {
  const { user, logout } = useAuth();
  const [viewMode, setViewMode] = useState<ClientViewMode>('MAIN');
  const [settingsSection, setSettingsSection] = useState<SettingsSection>('profile');
  const [origin, setOrigin] = useState<SavedAddress | null>(null);
  const [destination, setDestination] = useState<LocationPoint | null>(null);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [showRouteView, setShowRouteView] = useState(false);
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
  const [motoboySearchRadiusKm, setMotoboySearchRadiusKm] = useState(25);
  const [destinationMeta, setDestinationMeta] = useState<DestinationConfirmMeta | undefined>();
  const [isDestinationConfirmed, setIsDestinationConfirmed] = useState(false);

  const clientActiveOrders = useActiveOrdersForClient(user?.id);
  const [trackedOrderId, setTrackedOrderId] = useState<string | null>(null);
  const trackedOrderFromStorage = useOrderTracker(trackedOrderId);
  const trackedOrder = useMemo(() => {
    if (trackedOrderFromStorage) return trackedOrderFromStorage;
    if (!trackedOrderId) return null;
    return clientActiveOrders.find((order) => order.id === trackedOrderId) ?? null;
  }, [trackedOrderFromStorage, clientActiveOrders, trackedOrderId]);
  const acceptedToastShownRef = useRef<string | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [motoboyMapTick, setMotoboyMapTick] = useState(0);

  useMotoboySimulationTicker();
  useMotoboySimulationRefresh(() => setMotoboyMapTick((value) => value + 1));

  const [mapContextMenu, setMapContextMenu] = useState<{
    lat: number;
    lng: number;
    x: number;
    y: number;
  } | null>(null);
  const [mapPickLoading, setMapPickLoading] = useState(false);
  const [mapPickTarget, setMapPickTarget] = useState<MapPickTarget | null>(null);
  const [destinationGeocodeBase, setDestinationGeocodeBase] = useState<ReverseGeocodeResult | null>(null);
  const [destinationFormInitial, setDestinationFormInitial] = useState<Partial<AddressFormFields> | undefined>();
  const [isDestinationModalOpen, setIsDestinationModalOpen] = useState(false);
  const [pendingCondoDestination, setPendingCondoDestination] = useState<LocationPoint | null>(null);

  useEffect(() => {
    if (!user) return;
    setFavoriteMotoboyIds(loadFavoriteMotoboyIds(user.id));
    setMotoboySearchRadiusKm(loadMotoboySearchRadiusKm(user.id));
  }, [user]);

  const handleMotoboySearchRadiusChange = (radiusKm: number) => {
    if (!user) return;
    setMotoboySearchRadiusKm(radiusKm);
    saveMotoboySearchRadiusKm(user.id, radiusKm);
  };

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

    if (viewMode === 'MAIN' && origin && destination) {
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
      setShowRouteView(false);
      setIsDestinationConfirmed(false);
    }

    return () => {
      isCurrent = false;
    };
  }, [origin, destination, viewMode]);

  useEffect(() => {
    if (viewMode !== 'MAIN' || !isDestinationConfirmed || !routeData || !origin || !destination) {
      return;
    }
    setShowRouteView(true);
  }, [viewMode, isDestinationConfirmed, routeData, origin, destination]);

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

  const handleUpdateDestination = (result: DestinationConfirmResult | null) => {
    if (!result) {
      setDestination(null);
      setDestinationMeta(undefined);
      setShowRouteView(false);
      setIsDestinationConfirmed(false);
      return;
    }
    setDestination(result.destination);
    setDestinationMeta(result.meta);
    setIsDestinationConfirmed(true);
  };

  const openActiveOrderView = (orderId: string) => {
    const order = clientActiveOrders.find((entry) => entry.id === orderId);
    if (!order) return;
    setTrackedOrderId(order.id);
    setOrigin(order.origin as SavedAddress);
    setDestination(order.destination);
    setRouteData(buildRouteDataFromOrder(order));
    setIsDestinationConfirmed(true);
    setShowRouteView(true);
    setViewMode('MAIN');
  };

  const handleSimulateAccept = () => {
    if (!trackedOrder || trackedOrder.status !== 'PENDING') return;
    const accepted = simulateOrderAcceptance(trackedOrder.id);
    if (accepted) {
      showToast(`${accepted.acceptedMotoboyName} aceitou o pedido (simulado).`, 'success');
    } else {
      showToast('Nenhum motoboy disponível para simular o aceite.', 'info');
    }
  };

  const handleCancelActiveOrder = (orderId: string) => {
    const order = clientActiveOrders.find((entry) => entry.id === orderId);
    if (!order) return;

    const confirmed = window.confirm(
      order.status === 'ACCEPTED'
        ? 'Deseja realmente cancelar esta corrida em andamento?'
        : 'Deseja cancelar este pedido aguardando motoboy?',
    );
    if (!confirmed) return;

    cancelOrder(orderId, 'CLIENT');

    if (trackedOrderId === orderId) {
      setDestination(null);
      setDestinationMeta(undefined);
      setIsDestinationConfirmed(false);
      setRouteData(null);
      setShowRouteView(false);
      setTrackedOrderId(null);
    }

    setViewMode('MAIN');
    showToast('Pedido cancelado.', 'info');
  };

  const handleStartRide = () => {
    if (!origin || !destination || !routeData || isRouteLoading) return;
    setTrackedOrderId(null);
    setShowRouteView(true);
  };

  const handleDestinationModalOpenChange = (open: boolean) => {
    setIsDestinationModalOpen(open);
    if (!open) {
      setDestinationFormInitial(undefined);
    }
  };

  const handleNewOrder = () => {
    setDestination(null);
    setDestinationMeta(undefined);
    setIsDestinationConfirmed(false);
    setRouteData(null);
    setShowRouteView(false);
    setTrackedOrderId(null);
    setSelectedMotoboyId(null);
    setViewMode('MAIN');
  };

  const handleConfirmPedido = (price: number | null, tier?: PriceTier) => {
    setOrderPrice(price);
    setOrderTier(tier);
    setIsOrderModalOpen(true);
  };

  const handleOrderSuccess = async (checkout: OrderCheckoutResult) => {
    const snapshotRoute = routeData;
    const snapshotUser = user;
    const snapshotPrice = orderPrice;
    const snapshotTier = orderTier;
    const snapshotDestinationMeta = destinationMeta;
    const snapshotMotoboyId = selectedMotoboyId;

    if (!snapshotRoute || !snapshotUser) {
      showToast('Não foi possível criar o pedido. Refaça a rota e tente novamente.', 'info');
      return;
    }

    const assignmentMode: OrderAssignmentMode = snapshotMotoboyId ? 'DIRECT' : 'BROADCAST';
    const clientePhone = checkout.trackingPhone.trim();

    let order;
    try {
      order = createOrder({
        clientId: snapshotUser.id,
        clientName: snapshotUser.name,
        origin: snapshotRoute.origin,
        destination: snapshotRoute.destination,
        distanceKm: snapshotRoute.distanceKm,
        durationMin: snapshotRoute.durationMin,
        price: snapshotPrice,
        tierLabel: snapshotTier?.label,
        trackingPhone: clientePhone,
        assignmentMode,
        targetMotoboyId: snapshotMotoboyId ?? undefined,
        polyline: snapshotRoute.polyline,
        condominiumId: snapshotDestinationMeta?.condominiumId,
        condominiumName: snapshotDestinationMeta?.condominiumName,
        paymentResponsibility: checkout.paymentResponsibility,
        paymentMethod: checkout.paymentMethod,
        establishmentPaid: checkout.establishmentPaid,
      });
    } catch (error) {
      console.error('Falha ao criar pedido:', error);
      showToast('Erro ao salvar o pedido. Tente novamente.', 'info');
      return;
    }

    setTrackedOrderId(order.id);
    setShowRouteView(true);
    setIsOrderModalOpen(false);

    const trackingUrl = getClientTrackingUrl(order.trackingCode);

    try {
      if (clientePhone) {
        const isClientPaying =
          checkout.paymentResponsibility === 'CLIENT' ||
          checkout.paymentResponsibility === 'SPLIT';

        const paymentNotice = isClientPaying
          ? `\n💳 *Pagamento por sua conta* — pague com PIX, cartão ou Bix Pay no link abaixo.\n`
          : checkout.establishmentPaid
            ? `\n✅ *Entrega já paga pelo estabelecimento.*\n`
            : '';

        await whatsappApi.enviarNotificacaoCliente(
          clientePhone,
          'Cliente',
          `📦 *Seu pedido está pronto para entrega!*\n\n` +
            `Origem: ${snapshotRoute.origin.address}\n` +
            `Destino: ${snapshotRoute.destination.address}\n` +
            `Distância: ${snapshotRoute.distanceKm} km\n` +
            (snapshotPrice !== null ? `Valor: R$ ${snapshotPrice.toFixed(2)}\n` : '') +
            paymentNotice +
            `\nAguardando um motoboy aceitar a corrida.\n\n` +
            formatTrackingWhatsAppFooter(order.trackingCode) +
            (isClientPaying ? `\n\n💰 Pague a entrega aqui:\n${trackingUrl}` : ''),
        );
      }

      if (assignmentMode === 'DIRECT' && snapshotMotoboyId) {
        pushMotoboyNotification({
          motoboyId: snapshotMotoboyId,
          title: 'Novo pedido direto',
          message:
            `Pedido exclusivo: ${snapshotRoute.origin.address} → ${snapshotRoute.destination.address} (${snapshotRoute.distanceKm} km)`,
          orderId: order.id,
        });
      } else {
        pushBroadcastMotoboyNotification({
          title: 'Novo pedido global',
          message: `Corrida disponível: ${snapshotRoute.distanceKm} km — ${snapshotRoute.destination.address}`,
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
      showToast('Pedido enviado globalmente! Aguardando um motoboy aceitar.', 'success');
    }
  };

  useEffect(() => {
    if (!trackedOrder) return;

    if (
      trackedOrder.status === 'ACCEPTED' &&
      trackedOrder.acceptedMotoboyName &&
      acceptedToastShownRef.current !== trackedOrder.id
    ) {
      acceptedToastShownRef.current = trackedOrder.id;
      showToast(`${trackedOrder.acceptedMotoboyName} aceitou seu pedido!`, 'success');
    }
  }, [trackedOrder]);

  const handleLogout = () => {
    logout();
    handleNewOrder();
    setOrigin(null);
    setOriginLoaded(false);
  };

  const showToast = (message: string, type: 'success' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleMapContextMenu = (lat: number, lng: number, clientX: number, clientY: number) => {
    setMapContextMenu({ lat, lng, x: clientX, y: clientY });
  };

  const handleMapPick = async (target: MapPickTarget) => {
    if (!mapContextMenu) return;
    setMapPickLoading(true);
    setMapPickTarget(target);

    try {
      const base = await reverseGeocode(mapContextMenu.lat, mapContextMenu.lng);
      setMapContextMenu(null);

      if (target === 'origin') {
        showToast('A origem deve ser um endereço cadastrado. Selecione na lista acima.', 'info');
      } else {
        setDestinationMeta(undefined);
        setIsDestinationConfirmed(false);
        setShowRouteView(false);
        setDestinationFormInitial(reverseGeocodeToOriginFields(base));
        setIsDestinationModalOpen(true);
      }
    } catch {
      showToast('Não foi possível identificar o endereço. Tente outro ponto no mapa.', 'info');
      setMapContextMenu(null);
    } finally {
      setMapPickLoading(false);
      setMapPickTarget(null);
    }
  };

  const handleDestinationFromMapConfirmed = (result: DestinationConfirmResult) => {
    handleUpdateDestination(result);
    showToast('Destino definido no mapa!', 'success');
  };

  const isDark = theme === 'dark';
  const isAdmin = user?.role === 'ADMIN';

  const homeMotoboys = useMemo(() => {
    void motoboyMapTick;
    return getMotoboysNearLocation(origin ?? DEFAULT_REFERENCE_LOCATION, {
      radiusKm: motoboySearchRadiusKm,
    });
  }, [origin, motoboySearchRadiusKm, motoboyMapTick]);

  const deliveryMotoboys = useMemo(() => {
    void motoboyMapTick;
    if (!routeData) return homeMotoboys;
    return getMotoboysNearLocation(routeData.origin, { radiusKm: motoboySearchRadiusKm });
  }, [routeData, homeMotoboys, motoboySearchRadiusKm, motoboyMapTick]);

  const selectedMotoboy = deliveryMotoboys.find((m) => m.id === selectedMotoboyId);
  const canStartRide = Boolean(origin && destination && routeData && !isRouteLoading);

  return (
    <>
      {viewMode === 'MAIN' && !showRouteView && user && (
        <ClienteMainView
          origin={origin}
          userId={user.id}
          onUpdateOrigin={handleUpdateOrigin}
          onOpenSettings={() => handleOpenSettings('addresses')}
          destination={destination}
          onUpdateDestination={handleUpdateDestination}
          isDestinationModalOpen={isDestinationModalOpen}
          onDestinationModalOpenChange={handleDestinationModalOpenChange}
          destinationFormInitial={destinationFormInitial}
          motoboys={homeMotoboys}
          selectedMotoboyId={selectedMotoboyId}
          onSelectMotoboy={setSelectedMotoboyId}
          favoriteMotoboyIds={favoriteMotoboyIds}
          onToggleFavorite={handleToggleFavoriteMotoboy}
          motoboySearchRadiusKm={motoboySearchRadiusKm}
          onMotoboySearchRadiusChange={handleMotoboySearchRadiusChange}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onLogout={handleLogout}
          userName={user.name}
          userEmail={user.email}
          clientActiveOrders={clientActiveOrders}
          selectedTrackedOrderId={trackedOrderId}
          onViewActiveOrder={openActiveOrderView}
          onCancelActiveOrder={handleCancelActiveOrder}
          isRouteLoading={isRouteLoading}
          routePolyline={routeData?.polyline}
          canStartRide={canStartRide}
          onStartRide={handleStartRide}
          onMapContextMenu={handleMapContextMenu}
        />
      )}

      {viewMode === 'SETTINGS' && user && (
        <ClienteSettingsView
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onLogout={handleLogout}
          onBack={() => setViewMode('MAIN')}
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

      {showRouteView && routeData && user && (
        <Screen2MainView
          routeData={routeData}
          origin={origin}
          userId={user.id}
          onUpdateOrigin={handleUpdateOrigin}
          onUpdateDestination={handleUpdateDestination}
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
          pendingOrder={trackedOrder}
          onNewOrder={handleNewOrder}
          onCancelOrder={trackedOrder ? () => handleCancelActiveOrder(trackedOrder.id) : undefined}
          onMapContextMenu={handleMapContextMenu}
          onSimulateAccept={trackedOrder?.status === 'PENDING' ? handleSimulateAccept : undefined}
        />
      )}

      {mapContextMenu && (
        <MapDestinationContextMenu
          x={mapContextMenu.x}
          y={mapContextMenu.y}
          isLoading={mapPickLoading}
          loadingTarget={mapPickTarget}
          theme={theme}
          onPick={handleMapPick}
          onDismiss={() => !mapPickLoading && setMapContextMenu(null)}
        />
      )}

      <DestinationAddressModal
        isOpen={destinationGeocodeBase !== null}
        base={destinationGeocodeBase}
        theme={theme}
        onClose={() => setDestinationGeocodeBase(null)}
        onConfirm={handleDestinationFromMapConfirmed}
      />

      <CondominiumDestinationConfirmModal
        isOpen={pendingCondoDestination !== null}
        destination={pendingCondoDestination}
        theme={theme}
        onClose={() => setPendingCondoDestination(null)}
        onConfirm={(result) => {
          handleUpdateDestination(result);
          setPendingCondoDestination(null);
          showToast('Destino do cliente aplicado.', 'success');
        }}
      />

      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        routeData={routeData}
        price={orderPrice}
        tier={orderTier}
        assignmentMode={selectedMotoboyId ? 'DIRECT' : 'BROADCAST'}
        targetMotoboyName={selectedMotoboy?.name}
        establishmentId={user?.id ?? ''}
        onConfirmSuccess={handleOrderSuccess}
        theme={theme}
      />

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[1100] flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-xl border px-4 py-3 shadow-2xl sm:bottom-6 sm:right-6 ${
            isDark
              ? 'border-zinc-700 bg-zinc-900 text-white'
              : 'border-slate-300 bg-white text-slate-900 shadow-slate-300/50'
          }`}
        >
          <CheckCircle className={`h-5 w-5 shrink-0 ${isDark ? 'text-white' : 'text-slate-900'}`} />
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {(trackedOrder?.status === 'ACCEPTED' || trackedOrder?.status === 'PICKED_UP') && user && (
        <OrderChatWidget
          orderId={trackedOrder.id}
          currentUserId={user.id}
          currentUserName={user.name}
          currentUserRole="CLIENT"
          otherPartyName={trackedOrder.acceptedMotoboyName ?? 'Motoboy'}
          theme={theme}
        />
      )}
    </>
  );
}
