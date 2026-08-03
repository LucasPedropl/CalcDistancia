import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import type { MapViewport } from '../../utils/mapViewport';

interface MapViewportSyncProps {
  viewport: MapViewport;
}

export function MapViewportSync({ viewport }: MapViewportSyncProps) {
  const map = useMap();

  useEffect(() => {
    map.setView([viewport.lat, viewport.lng], viewport.zoom, { animate: true });
  }, [map, viewport.lat, viewport.lng, viewport.zoom]);

  return null;
}
