import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { fitMapToPoints, serializeMapPoints } from './mapCentering';

const DEFAULT_MAP_PADDING: [number, number] = [48, 48];

interface MapBoundsFitProps {
  points: [number, number][];
  padding?: [number, number];
}

export function MapBoundsFit({ points, padding = DEFAULT_MAP_PADDING }: MapBoundsFitProps) {
  const map = useMap();
  const fittedKeyRef = useRef<string | null>(null);
  const pointsKey = serializeMapPoints(points);

  useEffect(() => {
    if (points.length < 2) return;
    if (fittedKeyRef.current === pointsKey) return;

    fitMapToPoints(map, points, { padding, maxZoom: 16 });
    fittedKeyRef.current = pointsKey;
  }, [map, points, pointsKey, padding]);

  return null;
}
