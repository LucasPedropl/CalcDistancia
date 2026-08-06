import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LocationPoint } from '../../types';
import { AdaptiveMapTileLayer } from './AdaptiveMapTileLayer';
import { isGoogleMapsConfigured } from '../../services/mapProviderService';
import { loadMapProvider, saveMapProvider } from '../../services/mapProviderService';

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapLocationPickerProps {
  location: LocationPoint;
  label?: string;
  onChange: (location: LocationPoint) => void;
}

function DraggableMarker({
  position,
  onDragEnd,
}: {
  position: [number, number];
  onDragEnd: (lat: number, lng: number) => void;
}) {
  const [markerPosition, setMarkerPosition] = useState(position);

  useEffect(() => {
    setMarkerPosition(position);
  }, [position]);

  return (
    <Marker
      draggable
      position={markerPosition}
      eventHandlers={{
        dragend: (event) => {
          const { lat, lng } = event.target.getLatLng();
          setMarkerPosition([lat, lng]);
          onDragEnd(lat, lng);
        },
      }}
    />
  );
}

function MapClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

function MapRecenter({ position }: { position: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, Math.max(map.getZoom(), 16), { animate: true });
  }, [map, position]);

  return null;
}

export function MapLocationPicker({ location, label, onChange }: MapLocationPickerProps) {
  useEffect(() => {
    if (isGoogleMapsConfigured() && loadMapProvider() !== 'google') {
      saveMapProvider('google');
    }
  }, []);

  const position = useMemo(
    () => [location.lat, location.lng] as [number, number],
    [location.lat, location.lng],
  );

  const handlePositionChange = (lat: number, lng: number) => {
    onChange({
      ...location,
      lat,
      lng,
    });
  };

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
        <p className="font-semibold">Confirme o ponto no mapa</p>
        <p className="mt-1 text-emerald-800">
          Arraste o marcador ou clique no local exato da portaria
          {label ? ` de ${label}` : ''}. Isso garante a mesma precisão do Google Maps.
        </p>
      </div>

      <div className="h-64 overflow-hidden rounded-xl border border-slate-200 sm:h-72">
        <MapContainer center={position} zoom={16} style={{ height: '100%', width: '100%' }} zoomControl>
          <AdaptiveMapTileLayer isDark={false} />
          <MapRecenter position={position} />
          <DraggableMarker position={position} onDragEnd={handlePositionChange} />
          <MapClickHandler onPick={handlePositionChange} />
        </MapContainer>
      </div>
    </div>
  );
}
