import { useCallback, useEffect, useState } from 'react';
import {
  type MapProviderId,
  isGoogleMapsConfigured,
  loadMapProvider,
  saveMapProvider,
  subscribeToMapProvider,
} from '../services/mapProviderService';

export function useMapProvider() {
  const [provider, setProvider] = useState<MapProviderId>(() => loadMapProvider());

  const refresh = useCallback(() => {
    setProvider(loadMapProvider());
  }, []);

  useEffect(() => {
    return subscribeToMapProvider(refresh);
  }, [refresh]);

  const setMapProvider = useCallback((next: MapProviderId) => {
    saveMapProvider(next);
    setProvider(loadMapProvider());
  }, []);

  return {
    provider,
    setMapProvider,
    canUseGoogle: isGoogleMapsConfigured(),
  };
}
