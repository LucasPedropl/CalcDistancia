import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { useMapProvider } from '../../hooks/useMapProvider';
import { removeMapBaseLayer, setMapBaseLayer } from '../../services/mapBaseLayerService';

interface AdaptiveMapTileLayerProps {
  isDark?: boolean;
}

export function AdaptiveMapTileLayer({ isDark = false }: AdaptiveMapTileLayerProps) {
  const map = useMap();
  const { provider } = useMapProvider();

  useEffect(() => {
    let cancelled = false;

    void setMapBaseLayer(map, provider, isDark).catch((error) => {
      if (!cancelled) {
        console.warn('Falha ao aplicar camada do mapa:', error);
      }
    });

    return () => {
      cancelled = true;
      removeMapBaseLayer(map);
    };
  }, [map, provider, isDark]);

  return null;
}
