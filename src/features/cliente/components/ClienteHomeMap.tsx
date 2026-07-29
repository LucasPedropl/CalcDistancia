import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { ThemeMode } from '../../../types';
import type { LocationPoint } from '../../../types';
import type { MotoboyWithDistance } from '../../../services/motoboyService';

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const DEFAULT_CENTER = { lat: -19.9173, lng: -43.9345 };

const svgBike = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"/></svg>`;

interface ClienteHomeMapProps {
  origin: LocationPoint | null;
  motoboys: MotoboyWithDistance[];
  selectedMotoboyId: string | null;
  onMotoboySelect: (motoboyId: string) => void;
  theme?: ThemeMode;
}

export function ClienteHomeMap({
  origin,
  motoboys,
  selectedMotoboyId,
  onMotoboySelect,
  theme = 'light',
}: ClienteHomeMapProps) {
  const isDark = theme === 'dark';
  const center = origin ?? DEFAULT_CENTER;

  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  const originIcon = L.divIcon({
    className: 'custom-origin-marker',
    html: `<div style="width: 18px; height: 18px; background-color: ${
      isDark ? '#ffffff' : '#0f172a'
    }; border-radius: 50%; box-shadow: 0 0 0 6px ${
      isDark ? 'rgba(255,255,255,0.25)' : 'rgba(15,23,42,0.2)'
    }; border: 2px solid ${isDark ? '#000000' : '#ffffff'};"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

  return (
    <div className={`h-full w-full ${isDark ? 'bg-zinc-950' : 'bg-slate-100'}`}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url={tileUrl}
          subdomains={['a', 'b', 'c', 'd']}
          maxZoom={19}
        />

        {origin && (
          <Marker position={[origin.lat, origin.lng]} icon={originIcon}>
            <Popup>
              <strong>Sua origem</strong>
              <br />
              {origin.address}
            </Popup>
          </Marker>
        )}

        {motoboys.map((motoboy) => {
          const isSelected = selectedMotoboyId === motoboy.id;
          const borderColor = isSelected ? (isDark ? '#ffffff' : '#0f172a') : '#10b981';
          const bgColor = isSelected ? (isDark ? '#ffffff' : '#0f172a') : isDark ? '#18181b' : '#ffffff';
          const textColor = isSelected ? (isDark ? '#000000' : '#ffffff') : '#10b981';

          const mbIcon = L.divIcon({
            className: 'custom-motoboy-marker',
            html: `<div style="width: 36px; height: 36px; background-color: ${bgColor}; border: 2px solid ${borderColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: ${textColor}; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); cursor: pointer;">${svgBike}</div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
          });

          return (
            <Marker
              key={motoboy.id}
              position={[motoboy.lat, motoboy.lng]}
              icon={mbIcon}
              eventHandlers={{ click: () => onMotoboySelect(motoboy.id) }}
            >
              <Popup>
                <strong>{motoboy.name}</strong>
                <br />
                <span style={{ fontSize: '12px' }}>
                  {motoboy.vehicle} · {motoboy.distanceKm.toFixed(1)} km
                </span>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
