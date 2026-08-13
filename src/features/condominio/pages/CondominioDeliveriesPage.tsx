import { useEffect, useMemo, useState } from 'react';
import type { CondominiumProfile } from '../../../services/condominiumService';
import { useOrdersForCondominium } from '../../../hooks/useOrders';
import { ResponsiveMapShell } from '../../../components/layout/ResponsiveMapShell';
import { CondominioMap } from '../components/CondominioMap';
import { CondominioDeliveriesSidebar } from '../components/CondominioDeliveriesSidebar';

interface CondominioDeliveriesPageProps {
  profile: CondominiumProfile;
}

export function CondominioDeliveriesPage({ profile }: CondominioDeliveriesPageProps) {
  const activeDeliveries = useOrdersForCondominium(profile.userId, profile.address);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const selectedOrder = useMemo(() => {
    if (activeDeliveries.length === 0) return null;
    if (selectedOrderId) {
      return activeDeliveries.find((order) => order.id === selectedOrderId) ?? activeDeliveries[0];
    }
    return activeDeliveries[0];
  }, [activeDeliveries, selectedOrderId]);

  useEffect(() => {
    if (activeDeliveries.length === 0) {
      setSelectedOrderId(null);
      return;
    }
    if (!selectedOrderId || !activeDeliveries.some((order) => order.id === selectedOrderId)) {
      setSelectedOrderId(activeDeliveries[0].id);
    }
  }, [activeDeliveries, selectedOrderId]);

  return (
    <ResponsiveMapShell
      mapLabel="Mapa"
      panelLabel="Entregas"
      defaultMobileView="panel"
      panel={
        <CondominioDeliveriesSidebar
          profile={profile}
          activeDeliveries={activeDeliveries}
          selectedOrderId={selectedOrder?.id ?? null}
          onSelectOrder={setSelectedOrderId}
        />
      }
      map={
        <CondominioMap
          profile={profile}
          activeDeliveries={activeDeliveries}
          selectedOrder={selectedOrder}
        />
      }
    />
  );
}
