import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const DEFAULT_MAP_PADDING: [number, number] = [48, 48];

interface MapBoundsFitProps {
  points: [number, number][];
  padding?: [number, number];
}

export function MapBoundsFit({ points, padding = DEFAULT_MAP_PADDING }: MapBoundsFitProps) {
  const map = useMap();

  useEffect(() => {
    if (points.length < 2) return;
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding, animate: true, maxZoom: 16 });
  }, [map, points, padding]);

  return null;
}
