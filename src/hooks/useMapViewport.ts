import { useEffect, useMemo, useState } from 'react';
import type { LocationPoint } from '../types';
import {
  requestUserLocation,
  resolveMapViewport,
  type MapViewport,
} from '../utils/mapViewport';

export function useMapViewport(
  fallbackLocation: LocationPoint | null = null,
): {
  viewport: MapViewport;
  userLocation: LocationPoint | null;
} {
  const [userLocation, setUserLocation] = useState<LocationPoint | null>(null);

  useEffect(() => {
    let cancelled = false;

    requestUserLocation().then((location) => {
      if (!cancelled) {
        setUserLocation(location);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const viewport = useMemo(
    () => resolveMapViewport([userLocation, fallbackLocation]),
    [userLocation, fallbackLocation],
  );

  return { viewport, userLocation };
}
