import { useCallback, useState } from 'react';
import { MapContainer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { DeliveryOrder } from '../../../types/order';
import type { ThemeMode } from '../../../types';
import { getMotoboyById } from '../../../services/motoboyService';
import { useMotoboySimulationRefresh } from '../../../hooks/useMotoboySimulation';
import { useOrderRoadRoute } from '../../../hooks/useOrderRoadRoute';
import { AdaptiveMapTileLayer } from '../../../components/map/AdaptiveMapTileLayer';
import { MapProviderToggle } from '../../../components/map/MapProviderToggle';
import { TrackingMapViewport } from '../../../components/map/TrackingMapViewport';
import { BRAZIL_MAP_VIEWPORT } from '../../../utils/mapViewport';

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const svgBike = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"/></svg>`;

interface ClienteTrackingMapProps {
  order: DeliveryOrder;
  theme?: ThemeMode;
}

export function ClienteTrackingMap({ order, theme = 'light' }: ClienteTrackingMapProps) {
  const isDark = theme === 'dark';
  const [, setTick] = useState(0);
  const refresh = useCallback(() => setTick((value) => value + 1), []);
  useMotoboySimulationRefresh(refresh);

  const { route } = useOrderRoadRoute(order);
  const deliveryPolyline = route?.polyline ?? order.polyline;
  const pickupPolyline = order.pickupPolyline;

  const motoboy =
    order.acceptedMotoboyId ? getMotoboyById(order.acceptedMotoboyId) : undefined;

  const showMotoboy =
    motoboy &&
    (order.status === 'ACCEPTED' || order.status === 'PICKED_UP');

  const originIcon = L.divIcon({
    className: 'tracking-origin',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:#64748b;border:2px solid white;"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

  const destIcon = L.divIcon({
    className: 'tracking-dest',
    html: `<div style="width:16px;height:16px;background:#0f172a;border:2px solid white;box-shadow:0 0 0 4px rgba(15,23,42,0.2);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  const motoboyIcon = L.divIcon({
    className: 'tracking-motoboy',
    html: `<div style="width:36px;height:36px;border-radius:50%;background:#10b981;border:2px solid white;display:flex;align-items:center;justify-content:center;color:white;">${svgBike}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

  return (
    <div className={`relative h-full min-h-[280px] w-full ${isDark ? 'bg-zinc-950' : 'bg-slate-100'}`}>
      <MapProviderToggle theme={theme} className="absolute left-3 top-3 z-[1000]" />
      <MapContainer
        center={[BRAZIL_MAP_VIEWPORT.lat, BRAZIL_MAP_VIEWPORT.lng]}
        zoom={BRAZIL_MAP_VIEWPORT.zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TrackingMapViewport
          order={order}
          motoboyPosition={showMotoboy ? motoboy : null}
        />
        <AdaptiveMapTileLayer isDark={isDark} />

        <Marker position={[order.origin.lat, order.origin.lng]} icon={originIcon}>
          <Popup>Origem: {order.clientName}</Popup>
        </Marker>
        <Marker position={[order.destination.lat, order.destination.lng]} icon={destIcon}>
          <Popup>Seu endereço</Popup>
        </Marker>

        {showMotoboy && (
          <Marker position={[motoboy.lat, motoboy.lng]} icon={motoboyIcon}>
            <Popup>
              <strong>{motoboy.name}</strong>
              <br />
              {order.status === 'PICKED_UP' ? 'A caminho da entrega' : 'Indo buscar o pedido'}
            </Popup>
          </Marker>
        )}

        {order.status === 'ACCEPTED' && pickupPolyline && pickupPolyline.length > 1 && (
          <Polyline
            positions={pickupPolyline}
            pathOptions={{ color: '#10b981', weight: 5, opacity: 0.9 }}
          />
        )}

        {deliveryPolyline && deliveryPolyline.length > 1 && (
          <Polyline
            positions={deliveryPolyline}
            pathOptions={{
              color: order.status === 'ACCEPTED' ? (isDark ? '#52525b' : '#cbd5e1') : isDark ? '#ffffff' : '#0f172a',
              weight: order.status === 'ACCEPTED' ? 3 : 5,
              opacity: order.status === 'ACCEPTED' ? 0.45 : 0.9,
              dashArray: order.status === 'ACCEPTED' ? '8 8' : undefined,
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
