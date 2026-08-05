import { useState } from 'react';

import { useAuth } from '../../context/AuthContext';

import { MotoboyMainView } from './components/MotoboyMainView';

import { MotoboySettingsView } from './components/MotoboySettingsView';

import { OrderChatWidget } from '../../components/chat/OrderChatWidget';

import { acceptOrder, getOrderById, cancelOrder, completeOrder } from '../../services/orderService';

import { getMotoboyById } from '../../services/motoboyService';

import { whatsappApi } from '../../services/whatsappApi';

import { fetchAndSaveOrderPickupRoute } from '../../services/orderRoutePlanning';

import { useActiveOrderForMotoboy, useOpenOrdersForMotoboy } from '../../hooks/useOrders';

import { useOrderRoadRoute } from '../../hooks/useOrderRoadRoute';

import type { ThemeMode } from '../../types';



export function MotoboyDashboard() {

  const { user, logout } = useAuth();

  const [activeView, setActiveView] = useState<'MAPA' | 'SETTINGS'>('MAPA');

  const [theme, setTheme] = useState<ThemeMode>('light');

  const [previewOrderId, setPreviewOrderId] = useState<string | null>(null);



  const motoboyId = user?.id ?? 'mb-demo';

  const motoboyName = getMotoboyById(motoboyId)?.name ?? user?.name ?? 'Motoboy';



  const activeOrder = useActiveOrderForMotoboy(motoboyId);

  const openOrders = useOpenOrdersForMotoboy(motoboyId);



  const previewOrder = previewOrderId ? getOrderById(previewOrderId) ?? null : null;

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

    if (result) {

      setPreviewOrderId(null);

      const motoboyPosition = getMotoboyById(motoboyId);
      if (motoboyPosition) {
        void fetchAndSaveOrderPickupRoute(result.id, motoboyPosition.lat, motoboyPosition.lng);
      }

      const clientePhone = result.trackingPhone ?? result.recipientClientPhone;
      if (clientePhone) {
        try {
          await whatsappApi.enviarNotificacaoCliente(
            clientePhone,
            'Cliente',
            `🛵 *Seu pedido saiu para entrega!*\n\n` +
              `${motoboyName} aceitou a corrida e está a caminho.\n\n` +
              `Origem: ${result.origin.address}\n` +
              `Destino: ${result.destination.address}\n\n` +
              formatTrackingWhatsAppFooter(result.trackingCode),
          );
        } catch (error) {
          console.error('Falha ao notificar cliente via WhatsApp:', error);
        }
      }

    }

  };



  const handleCompleteActiveOrder = async () => {
    if (!activeOrder) return;
    const result = completeOrder(activeOrder.id, motoboyId);
    if (!result) return;

    const clientePhone = result.trackingPhone ?? result.recipientClientPhone;
    if (clientePhone) {
      try {
        await whatsappApi.enviarNotificacaoCliente(
          clientePhone,
          'Cliente',
          `✅ *Pedido entregue!*\n\n` +
            `Sua entrega em ${result.destination.address} foi concluída com sucesso.\n` +
            `Obrigado por utilizar o webmottos!\n\n` +
            formatTrackingWhatsAppFooter(result.trackingCode),
        );
      } catch (error) {
        console.error('Falha ao notificar cliente:', error);
      }
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

        onConfirmAccept={handleConfirmAccept}

        onCancelPreview={handleCancelPreview}

        onCancelActiveOrder={activeOrder ? handleCancelActiveOrder : undefined}

        onCompleteActiveOrder={activeOrder ? handleCompleteActiveOrder : undefined}

        motoboyId={motoboyId}

        theme={theme}

        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}

        onLogout={logout}

        onOpenSettings={() => setActiveView('SETTINGS')}

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

    </>

  );

}

