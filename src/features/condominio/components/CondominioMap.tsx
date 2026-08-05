import { MapContainer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { CondominiumProfile } from '../../../services/condominiumService';
import type { DeliveryOrder } from '../../../types/order';
import { getMotoboyById } from '../../../services/motoboyService';
import { useMotoboySimulationRefresh } from '../../../hooks/useMotoboySimulation';
import { AdaptiveMapTileLayer } from '../../../components/map/AdaptiveMapTileLayer';
import { MapProviderToggle } from '../../../components/map/MapProviderToggle';
import { useCallback, useState } from 'react';

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const svgBike = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"/></svg>`;

interface CondominioMapProps {
  profile: CondominiumProfile;
  activeDeliveries: DeliveryOrder[];
}

export function CondominioMap({ profile, activeDeliveries }: CondominioMapProps) {
  const [, setTick] = useState(0);
  const refresh = useCallback(() => setTick((value) => value + 1), []);
  useMotoboySimulationRefresh(refresh);

  const motoboyIds = new Set(
    activeDeliveries.map((order) => order.acceptedMotoboyId).filter(Boolean) as string[],
  );

  const condoIcon = L.divIcon({
    className: 'condo-marker',
    html: `<div style="width:18px;height:18px;border-radius:4px;background:#0f172a;border:2px solid white;box-shadow:0 0 0 4px rgba(15,23,42,0.2);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

  const destIcon = L.divIcon({
    className: 'condo-dest-marker',
    html: `<div style="width:14px;height:14px;background:#64748b;border:2px solid white;border-radius:50%;"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

  const motoboyIcon = L.divIcon({
    className: 'condo-motoboy-marker',
    html: `<div style="width:36px;height:36px;border-radius:50%;background:#10b981;border:2px solid white;display:flex;align-items:center;justify-content:center;color:white;">${svgBike}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

  return (
    <div className="relative h-full min-h-0 w-full bg-slate-100">
      <MapProviderToggle className="absolute left-3 top-3 z-[1000]" />
      <MapContainer
        center={[profile.address.lat, profile.address.lng]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <AdaptiveMapTileLayer isDark={false} />

        <Marker position={[profile.address.lat, profile.address.lng]} icon={condoIcon}>
          <Popup>
            <strong>{profile.name}</strong>
            <br />
            Portaria / centro do condomínio
          </Popup>
        </Marker>

        {activeDeliveries.map((order) => (
          <Marker
            key={`dest-${order.id}`}
            position={[order.destination.lat, order.destination.lng]}
            icon={destIcon}
          >
            <Popup>
              Entrega para {order.recipientClientName ?? 'morador'}
              <br />
              <span style={{ fontSize: '11px' }}>{order.destination.address}</span>
            </Popup>
          </Marker>
        ))}

        {Array.from(motoboyIds).map((motoboyId) => {
          const motoboy = getMotoboyById(motoboyId);
          if (!motoboy) return null;

          const order = activeDeliveries.find((entry) => entry.acceptedMotoboyId === motoboyId);

          return (
            <Marker key={motoboyId} position={[motoboy.lat, motoboy.lng]} icon={motoboyIcon}>
              <Popup>
                <strong>{motoboy.name}</strong>
                <br />
                {order?.status === 'PICKED_UP' ? 'Entregando no condomínio' : 'A caminho da coleta'}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
