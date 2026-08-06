import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import type { MapViewport } from '../../utils/mapViewport';

interface MapViewportSyncProps {
  viewport: MapViewport;
}

/** Centraliza o mapa uma vez por viewport resolvida — não força recentralização em re-renders. */
export function MapViewportSync({ viewport }: MapViewportSyncProps) {
  const map = useMap();
  const syncedViewportKeyRef = useRef<string | null>(null);
  const viewportKey = `${viewport.lat.toFixed(6)},${viewport.lng.toFixed(6)},${viewport.zoom}`;

  useEffect(() => {
    if (syncedViewportKeyRef.current === viewportKey) return;

    map.setView([viewport.lat, viewport.lng], viewport.zoom, { animate: false });
    syncedViewportKeyRef.current = viewportKey;
  }, [map, viewport.lat, viewport.lng, viewport.zoom, viewportKey]);

  return null;
}
