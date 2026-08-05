import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { DeliveryOrder } from '../../types/order';

const MAP_PADDING: [number, number] = [48, 48];

interface TrackingMapViewportProps {
  order: DeliveryOrder;
  motoboyPosition?: { lat: number; lng: number } | null;
}

export function TrackingMapViewport({ order, motoboyPosition }: TrackingMapViewportProps) {
  const map = useMap();
  const fittedPhaseRef = useRef<string | null>(null);

  useEffect(() => {
    const phaseKey = `${order.id}-${order.status}`;

    if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
      if (fittedPhaseRef.current !== phaseKey) {
        map.setView([order.destination.lat, order.destination.lng], 15, { animate: true });
        fittedPhaseRef.current = phaseKey;
      }
      return;
    }

    if (order.status === 'PENDING' || !motoboyPosition) {
      if (fittedPhaseRef.current !== phaseKey) {
        const bounds = L.latLngBounds([
          [order.origin.lat, order.origin.lng],
          [order.destination.lat, order.destination.lng],
        ]);
        map.fitBounds(bounds, { padding: MAP_PADDING, maxZoom: 15, animate: false });
        fittedPhaseRef.current = phaseKey;
      }
      return;
    }

    if (fittedPhaseRef.current !== phaseKey) {
      const bounds = L.latLngBounds([
        [order.origin.lat, order.origin.lng],
        [order.destination.lat, order.destination.lng],
        [motoboyPosition.lat, motoboyPosition.lng],
      ]);
      map.fitBounds(bounds, { padding: MAP_PADDING, maxZoom: 15, animate: false });
      fittedPhaseRef.current = phaseKey;
      return;
    }

    map.panTo([motoboyPosition.lat, motoboyPosition.lng], { animate: true, duration: 0.4 });
  }, [
    map,
    order.id,
    order.status,
    order.origin.lat,
    order.origin.lng,
    order.destination.lat,
    order.destination.lng,
    motoboyPosition?.lat,
    motoboyPosition?.lng,
  ]);

  return null;
}
