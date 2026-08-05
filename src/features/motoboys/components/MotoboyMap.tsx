import { MapContainer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation } from 'lucide-react';
import L from 'leaflet';
import type { DeliveryOrder } from '../../../types/order';
import type { ThemeMode } from '../../../types';
import { DEFAULT_REFERENCE_LOCATION } from '../../../services/motoboyService';
import { MapViewportSync } from '../../../components/map/MapViewportSync';
import { AdaptiveMapTileLayer } from '../../../components/map/AdaptiveMapTileLayer';
import { MapProviderToggle } from '../../../components/map/MapProviderToggle';
import { useMapViewport } from '../../../hooks/useMapViewport';
import { BRAZIL_MAP_VIEWPORT } from '../../../utils/mapViewport';

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const svgBike = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"/></svg>`;
const svgPackage = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`;

interface MotoboyMapProps {
  orders: DeliveryOrder[];
  theme?: ThemeMode;
}

export function MotoboyMap({ orders, theme = 'light' }: MotoboyMapProps) {
  const isDark = theme === 'dark';
  const motoboyPosition = {
    lat: DEFAULT_REFERENCE_LOCATION.lat,
    lng: DEFAULT_REFERENCE_LOCATION.lng,
    address: DEFAULT_REFERENCE_LOCATION.address,
  };
  const { viewport } = useMapViewport(motoboyPosition);

  const myLocationIcon = L.divIcon({
    className: 'custom-motoboy-marker',
    html: `<div style="width: 40px; height: 40px; background-color: ${
      isDark ? '#ffffff' : '#0f172a'
    }; border: 3px solid ${isDark ? '#000000' : '#ffffff'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: ${
      isDark ? '#000000' : '#ffffff'
    }; box-shadow: 0 4px 12px rgba(0,0,0,0.25);">${svgBike}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

  const packageIcon = L.divIcon({
    className: 'custom-package-marker',
    html: `<div style="width: 36px; height: 36px; background-color: ${
      isDark ? '#18181b' : '#ffffff'
    }; border: 2px solid ${isDark ? '#ffffff' : '#0f172a'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: ${
      isDark ? '#ffffff' : '#0f172a'
    }; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">${svgPackage}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

  return (
    <div className={`relative h-full w-full ${isDark ? 'bg-zinc-950' : 'bg-slate-100'}`}>
      <MapProviderToggle theme={theme} className="absolute left-3 top-3 z-[1000]" />
      <MapContainer
        center={[BRAZIL_MAP_VIEWPORT.lat, BRAZIL_MAP_VIEWPORT.lng]}
        zoom={BRAZIL_MAP_VIEWPORT.zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <MapViewportSync viewport={viewport} />
        <AdaptiveMapTileLayer isDark={isDark} />

        <Marker position={[motoboyPosition.lat, motoboyPosition.lng]} icon={myLocationIcon}>
          <Popup className={isDark ? 'dark-popup' : ''}>
            <div className="p-1 text-sm">
              <p className="flex items-center gap-1 font-bold">
                <Navigation className="h-4 w-4" /> Sua posição
              </p>
              <p className="mt-1 text-xs opacity-80">Disponível para receber chamados</p>
            </div>
          </Popup>
        </Marker>

        {orders.map((order) => (
          <Marker key={order.id} position={[order.origin.lat, order.origin.lng]} icon={packageIcon}>
            <Popup className={isDark ? 'dark-popup' : ''}>
              <div className="min-w-[180px] text-sm">
                <p className="font-bold">{order.clientName}</p>
                <p className="text-xs opacity-80">{order.origin.address}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {isDark && (
        <style>{`
          .dark-popup .leaflet-popup-content-wrapper,
          .dark-popup .leaflet-popup-tip {
            background-color: #18181b;
            color: #ffffff;
          }
        `}</style>
      )}
    </div>
  );
}
