import { MapContainer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { ThemeMode } from '../../../types';
import type { LocationPoint } from '../../../types';
import type { MotoboyWithDistance } from '../../../services/motoboyService';
import { MapRightClickHandler } from '../../../components/map/MapRightClickHandler';
import { MapViewportSync } from '../../../components/map/MapViewportSync';
import { MapBoundsFit } from '../../../components/map/MapBoundsFit';
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

const svgBike = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"/></svg>`;

interface ClienteHomeMapProps {
  origin: LocationPoint | null;
  motoboys: MotoboyWithDistance[];
  selectedMotoboyId: string | null;
  onMotoboySelect: (motoboyId: string) => void;
  onMapContextMenu?: (lat: number, lng: number, clientX: number, clientY: number) => void;
  destination?: LocationPoint | null;
  routePolyline?: [number, number][];
  isRouteLoading?: boolean;
  theme?: ThemeMode;
}

export function ClienteHomeMap({
  origin,
  motoboys,
  selectedMotoboyId,
  onMotoboySelect,
  onMapContextMenu,
  destination = null,
  routePolyline,
  isRouteLoading = false,
  theme = 'light',
}: ClienteHomeMapProps) {
  const isDark = theme === 'dark';
  const { viewport } = useMapViewport(origin);

  const boundsPoints: [number, number][] = [];
  if (origin) boundsPoints.push([origin.lat, origin.lng]);
  if (destination) boundsPoints.push([destination.lat, destination.lng]);

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

  const destIcon = L.divIcon({
    className: 'custom-dest-marker',
    html: `<div style="width: 18px; height: 18px; background-color: ${
      isDark ? '#ffffff' : '#0f172a'
    }; border: 2px solid ${isDark ? '#000000' : '#ffffff'}; box-shadow: 0 0 0 6px ${
      isDark ? 'rgba(255,255,255,0.25)' : 'rgba(15,23,42,0.2)'
    };"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

  return (
    <div className={`relative h-full w-full ${isDark ? 'bg-zinc-950' : 'bg-slate-100'}`}>
      <MapProviderToggle theme={theme} className="absolute left-3 top-3 z-[1000]" />
      {isRouteLoading && destination && (
        <div className="absolute right-3 top-3 z-[1000] rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
          Calculando rota...
        </div>
      )}
      <MapContainer
        center={[BRAZIL_MAP_VIEWPORT.lat, BRAZIL_MAP_VIEWPORT.lng]}
        zoom={BRAZIL_MAP_VIEWPORT.zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <MapViewportSync viewport={viewport} />
        {boundsPoints.length >= 2 && (
          <MapBoundsFit key={`${boundsPoints.length}-${routePolyline?.length ?? 0}`} points={boundsPoints} />
        )}
        <AdaptiveMapTileLayer isDark={isDark} />

        {onMapContextMenu && <MapRightClickHandler onContextMenu={onMapContextMenu} />}

        {origin && (
          <Marker position={[origin.lat, origin.lng]} icon={originIcon}>
            <Popup>
              <strong>Sua origem</strong>
              <br />
              {origin.address}
            </Popup>
          </Marker>
        )}

        {destination && (
          <Marker position={[destination.lat, destination.lng]} icon={destIcon}>
            <Popup>
              <strong>Destino</strong>
              <br />
              {destination.address}
            </Popup>
          </Marker>
        )}

        {routePolyline && routePolyline.length > 1 && (
          <Polyline
            positions={routePolyline}
            pathOptions={{
              color: isDark ? '#ffffff' : '#0f172a',
              weight: 4,
              opacity: 0.85,
            }}
          />
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
