import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import type { DeliveryOrder } from '../../types/order';
import { fitMapToPoints } from './mapCentering';

const MAP_PADDING: [number, number] = [48, 48];

interface TrackingMapViewportProps {
  order: DeliveryOrder;
  motoboyPosition?: { lat: number; lng: number } | null;
}

/** Ajusta o zoom apenas na mudança de fase do pedido — sem seguir o motoboy automaticamente. */
export function TrackingMapViewport({ order, motoboyPosition }: TrackingMapViewportProps) {
  const map = useMap();
  const fittedPhaseRef = useRef<string | null>(null);

  useEffect(() => {
    const phaseKey = `${order.id}-${order.status}`;

    if (fittedPhaseRef.current === phaseKey) return;

    if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
      fitMapToPoints(map, [[order.destination.lat, order.destination.lng]], {
        padding: MAP_PADDING,
        maxZoom: 15,
      });
      fittedPhaseRef.current = phaseKey;
      return;
    }

    if (order.status === 'PENDING' || !motoboyPosition) {
      fitMapToPoints(
        map,
        [
          [order.origin.lat, order.origin.lng],
          [order.destination.lat, order.destination.lng],
        ],
        { padding: MAP_PADDING, maxZoom: 15 },
      );
      fittedPhaseRef.current = phaseKey;
      return;
    }

    fitMapToPoints(
      map,
      [
        [order.origin.lat, order.origin.lng],
        [order.destination.lat, order.destination.lng],
        [motoboyPosition.lat, motoboyPosition.lng],
      ],
      { padding: MAP_PADDING, maxZoom: 15 },
    );
    fittedPhaseRef.current = phaseKey;
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
