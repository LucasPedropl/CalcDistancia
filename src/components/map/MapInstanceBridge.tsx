import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import type { Map as LeafletMap } from 'leaflet';

interface MapInstanceBridgeProps {
  onMapReady: (map: LeafletMap) => void;
}

/** Expõe a instância do Leaflet para controles renderizados fora do MapContainer. */
export function MapInstanceBridge({ onMapReady }: MapInstanceBridgeProps) {
  const map = useMap();

  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);

  return null;
}
