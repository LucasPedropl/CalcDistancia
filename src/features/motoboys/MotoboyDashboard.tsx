import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MotoboyMainView } from './components/MotoboyMainView';
import { MotoboySettingsView } from './components/MotoboySettingsView';
import { MotoboyHistoryView } from './components/MotoboyHistoryView';
import { OrderChatWidget } from '../../components/chat/OrderChatWidget';
import {
  acceptOrder,
  getOrderById,
  cancelOrder,
  completeOrder,
  markOrderPaymentPaid,
} from '../../services/orderService';
import {
  MotoboyDeliveryConfirmModal,
  type MotoboyDeliveryConfirmResult,
} from './components/MotoboyDeliveryConfirmModal';
import { getMotoboyById, getMotoboyLivePosition } from '../../services/motoboyService';
import { whatsappApi } from '../../services/whatsappApi';
import { fetchAndSaveOrderPickupRoute } from '../../services/orderRoutePlanning';
import { formatTrackingWhatsAppFooter } from '../../utils/trackingUrl';
import { useActiveOrderForMotoboy, useOpenOrdersForMotoboy } from '../../hooks/useOrders';
import { useOrderRoadRoute } from '../../hooks/useOrderRoadRoute';
import { useMotoboySimulationTicker } from '../../hooks/useMotoboySimulation';
import type { ThemeMode } from '../../types';

export function MotoboyDashboard() {
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState<'MAPA' | 'SETTINGS' | 'HISTORY'>('MAPA');
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [previewOrderId, setPreviewOrderId] = useState<string | null>(null);
  const [isDeliveryConfirmOpen, setIsDeliveryConfirmOpen] = useState(false);

  const motoboyId = user?.id ?? 'mb-demo';
  const motoboyName = getMotoboyById(motoboyId)?.name ?? user?.name ?? 'Motoboy';
  useMotoboySimulationTicker();

  const activeOrder = useActiveOrderForMotoboy(motoboyId);
  const openOrders = useOpenOrdersForMotoboy(motoboyId);

  const previewOrder = previewOrderId ? (getOrderById(previewOrderId) ?? null) : null;
  const { route: previewRoute, isLoading: isPreviewRouteLoading } = useOrderRoadRoute(previewOrder);
  const { route: activeRoute, isLoading: isActiveRouteLoading } = useOrderRoadRoute(activeOrder);

  const handlePreviewOrder = (orderId: string) => {
    setPreviewOrderId(orderId);
  };

  const handleCancelPreview = () => {
    setPreviewOrderId(null);
  };

  const handleConfirmAccept = async () => {
    if (!previewOrderId) return;

    const result = acceptOrder(
      previewOrderId,
      motoboyId,
      motoboyName,
      previewRoute?.polyline,
    );

    if (!result) return;

    setPreviewOrderId(null);
    const motoboyPosition = getMotoboyLivePosition(motoboyId);
    void fetchAndSaveOrderPickupRoute(result.id, motoboyPosition.lat, motoboyPosition.lng);

    const clientePhone = result.trackingPhone ?? result.recipientClientPhone;
    if (!clientePhone) return;

    try {
      await whatsappApi.enviarNotificacaoCliente(
        clientePhone,
        result.recipientClientName ?? 'Cliente',
        `🛵 *Seu pedido saiu para entrega!*\n\n` +
          `${motoboyName} aceitou a corrida e está a caminho.\n\n` +
          `Origem: ${result.origin.address}\n` +
          `Destino: ${result.destination.address}\n\n` +
          `🔑 *Código de confirmação da entrega:* ${result.trackingCode}\n` +
          `Mostre este código ao motoboy para ele finalizar a entrega.\n\n` +
          formatTrackingWhatsAppFooter(result.trackingCode),
      );
    } catch (error) {
      console.error('Falha ao notificar cliente via WhatsApp:', error);
    }
  };

  const handleOpenDeliveryConfirm = () => {
    if (!activeOrder) return;
    setIsDeliveryConfirmOpen(true);
  };

  const handleConfirmDelivery = async (confirm: MotoboyDeliveryConfirmResult) => {
    if (!activeOrder) return;

    if (confirm.markedExternalPayment === true) {
      markOrderPaymentPaid(activeOrder.id, 'OFFLINE');
    }

    const result = completeOrder(activeOrder.id, motoboyId);
    setIsDeliveryConfirmOpen(false);
    if (!result) return;

    const clientePhone = result.trackingPhone ?? result.recipientClientPhone;
    if (!clientePhone) return;

    try {
      const unpaidHint =
        result.paymentStatus !== 'PAID'
          ? `\n💳 Ainda há pagamento pendente — pague no link de rastreamento.\n`
          : '';

      await whatsappApi.enviarNotificacaoCliente(
        clientePhone,
        result.recipientClientName ?? 'Cliente',
        `✅ *Pedido entregue!*\n\n` +
          `Sua entrega em ${result.destination.address} foi concluída com sucesso.` +
          unpaidHint +
          `\nObrigado por utilizar o webmottos!\n\n` +
          formatTrackingWhatsAppFooter(result.trackingCode),
      );
    } catch (error) {
      console.error('Falha ao notificar cliente:', error);
    }
  };

  const handleCancelActiveOrder = () => {
    if (!activeOrder) return;
    const confirmed = window.confirm('Deseja cancelar esta corrida em andamento?');
    if (!confirmed) return;

    cancelOrder(activeOrder.id, 'MOTOBOY');
    setPreviewOrderId(null);
  };

  const mapRoute = previewRoute ?? activeRoute;
  const isLoadingRoute = isPreviewRouteLoading || isActiveRouteLoading;

  if (activeView === 'HISTORY') {
    return (
      <MotoboyHistoryView
        motoboyId={motoboyId}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        onLogout={logout}
        onBack={() => setActiveView('MAPA')}
        userName={user?.name}
      />
    );
  }

  if (activeView === 'SETTINGS') {
    return (
      <MotoboySettingsView
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        onLogout={logout}
        onBack={() => setActiveView('MAPA')}
        motoboyId={motoboyId}
        userName={user?.name}
      />
    );
  }

  return (
    <>
      <MotoboyMainView
        openOrders={openOrders}
        activeOrder={activeOrder}
        previewOrderId={previewOrderId}
        mapRoute={mapRoute}
        isLoadingRoute={isLoadingRoute}
        onPreviewOrder={handlePreviewOrder}
        onConfirmAccept={() => void handleConfirmAccept()}
        onCancelPreview={handleCancelPreview}
        onCancelActiveOrder={activeOrder ? handleCancelActiveOrder : undefined}
        onCompleteActiveOrder={activeOrder ? handleOpenDeliveryConfirm : undefined}
        motoboyId={motoboyId}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        onLogout={logout}
        onOpenSettings={() => setActiveView('SETTINGS')}
        onOpenHistory={() => setActiveView('HISTORY')}
        userName={user?.name}
      />

      {activeOrder && user && (
        <OrderChatWidget
          orderId={activeOrder.id}
          currentUserId={user.id}
          currentUserName={user.name}
          currentUserRole="MOTOBOY"
          otherPartyName={activeOrder.clientName}
          theme={theme}
        />
      )}

      {activeOrder && (
        <MotoboyDeliveryConfirmModal
          order={activeOrder}
          isOpen={isDeliveryConfirmOpen}
          theme={theme}
          onClose={() => setIsDeliveryConfirmOpen(false)}
          onConfirm={(result) => void handleConfirmDelivery(result)}
        />
      )}
    </>
  );
}
