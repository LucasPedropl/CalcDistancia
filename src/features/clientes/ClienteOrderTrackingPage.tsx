import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Package } from 'lucide-react';
import { getOrderByTrackingCode, subscribeToOrders } from '../../services/orderService';
import { subscribeToMotoboySimulation } from '../../services/motoboySimulationService';
import { ClienteTrackingMap } from './components/ClienteTrackingMap';
import { ClienteTrackingSidebar } from './components/ClienteTrackingSidebar';
import { useMotoboySimulationTicker } from '../../hooks/useMotoboySimulation';
import { AppViewport } from '../../components/layout/AppViewport';
import { ResponsiveMapShell } from '../../components/layout/ResponsiveMapShell';

export function ClienteOrderTrackingPage() {
  const { trackingCode } = useParams<{ trackingCode: string }>();
  const [order, setOrder] = useState<ReturnType<typeof getOrderByTrackingCode> | null | undefined>(
    undefined,
  );

  useMotoboySimulationTicker();

  const refreshOrder = useCallback(() => {
    if (!trackingCode) {
      setOrder(null);
      return;
    }
    setOrder(getOrderByTrackingCode(trackingCode) ?? null);
  }, [trackingCode]);

  useEffect(() => {
    refreshOrder();
    const unsubscribeOrders = subscribeToOrders(refreshOrder);
    const unsubscribeSimulation = subscribeToMotoboySimulation(refreshOrder);
    return () => {
      unsubscribeOrders();
      unsubscribeSimulation();
    };
  }, [refreshOrder]);

  if (order === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
        Carregando rastreamento...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <Package className="mb-4 h-12 w-12 text-slate-300" />
        <h1 className="text-lg font-bold text-slate-900">Pedido não encontrado</h1>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Verifique o código de rastreamento enviado no WhatsApp.
        </p>
        <Link
          to="/clientes"
          className="mt-6 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
        >
          Tentar outro código
        </Link>
      </div>
    );
  }

  const showLiveMap =
    order.status === 'PENDING' ||
    order.status === 'ACCEPTED' ||
    order.status === 'PICKED_UP' ||
    order.status === 'COMPLETED';

  return (
    <AppViewport>
      <ResponsiveMapShell
        mapLabel="Mapa"
        panelLabel="Pedido"
        defaultMobileView="map"
        panel={<ClienteTrackingSidebar order={order} />}
        map={
          showLiveMap ? (
            <ClienteTrackingMap order={order} />
          ) : (
            <div className="flex h-full items-center justify-center bg-slate-100 p-6 text-center text-sm text-slate-500">
              Mapa indisponível para este status.
            </div>
          )
        }
      />
    </AppViewport>
  );
}
