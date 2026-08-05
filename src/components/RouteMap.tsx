import React, { useEffect, useRef } from 'react';
import type { RouteData, ThemeMode } from '../types';
import type { AvailableMotoboy } from '../types/order';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapProvider } from '../hooks/useMapProvider';
import { removeMapBaseLayer, setMapBaseLayer } from '../services/mapBaseLayerService';
import { MapProviderToggle } from './map/MapProviderToggle';

interface RouteMapProps {
  routeData: RouteData;
  theme?: ThemeMode;
  availableMotoboys?: AvailableMotoboy[];
  selectedMotoboyId?: string | null;
  onMotoboySelect?: (motoboyId: string) => void;
  onMapContextMenu?: (lat: number, lng: number, clientX: number, clientY: number) => void;
}

export const RouteMap: React.FC<RouteMapProps> = ({
  routeData,
  theme = 'light',
  availableMotoboys = [],
  selectedMotoboyId = null,
  onMotoboySelect,
  onMapContextMenu,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const onMotoboySelectRef = useRef(onMotoboySelect);
  const onMapContextMenuRef = useRef(onMapContextMenu);
  const { provider } = useMapProvider();

  useEffect(() => {
    onMotoboySelectRef.current = onMotoboySelect;
  }, [onMotoboySelect]);

  useEffect(() => {
    onMapContextMenuRef.current = onMapContextMenu;
  }, [onMapContextMenu]);

  const isDark = theme === 'dark';

  const destroyLeafletMap = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current || leafletMapRef.current) return;

    const { origin } = routeData;
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([origin.lat, origin.lng], 13);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    leafletMapRef.current = map;

    return () => {
      destroyLeafletMap();
    };
  }, []);

  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

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
  }, [provider, isDark]);

  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    const { origin, destination, polyline } = routeData;

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    const originIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `<div style="width: 18px; height: 18px; background-color: ${
        isDark ? '#ffffff' : '#0f172a'
      }; border-radius: 50%; box-shadow: 0 0 0 6px ${
        isDark ? 'rgba(255,255,255,0.25)' : 'rgba(15,23,42,0.2)'
      }; border: 2px solid ${isDark ? '#000000' : '#ffffff'};"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });

    const destIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `<div style="width: 18px; height: 18px; background-color: ${
        isDark ? '#ffffff' : '#0f172a'
      }; border: 2px solid ${isDark ? '#000000' : '#ffffff'}; box-shadow: 0 0 0 6px ${
        isDark ? 'rgba(255,255,255,0.25)' : 'rgba(15,23,42,0.2)'
      };"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });

    const originMarker = L.marker([origin.lat, origin.lng], { icon: originIcon }).addTo(map);
    originMarker.bindPopup(
      `<strong style="color:${isDark ? '#fff' : '#000'};">Origem:</strong><br/>${origin.address}`,
    );

    const destMarker = L.marker([destination.lat, destination.lng], { icon: destIcon }).addTo(map);
    destMarker.bindPopup(
      `<strong style="color:${isDark ? '#fff' : '#000'};">Destino:</strong><br/>${destination.address}`,
    );

    const svgBike = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"/></svg>`;

    availableMotoboys.forEach((motoboy) => {
      const isSelected = selectedMotoboyId === motoboy.id;
      const borderColor = isSelected ? (isDark ? '#ffffff' : '#0f172a') : '#10b981';
      const bgColor = isSelected ? (isDark ? '#ffffff' : '#0f172a') : isDark ? '#18181b' : '#ffffff';
      const textColor = isSelected ? (isDark ? '#000000' : '#ffffff') : '#10b981';
      const ringSize = isSelected ? '0 0 0 4px rgba(15,23,42,0.2)' : '0 4px 6px -1px rgba(0,0,0,0.1)';

      const mbIcon = L.divIcon({
        className: 'custom-motoboy-marker',
        html: `<div style="width: 36px; height: 36px; background-color: ${bgColor}; border: 2px solid ${borderColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: ${textColor}; box-shadow: ${ringSize}; cursor: pointer;">${svgBike}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const mbMarker = L.marker([motoboy.lat, motoboy.lng], { icon: mbIcon }).addTo(map);
      mbMarker.bindPopup(
        `<strong style="color:${isDark ? '#fff' : '#000'};">${motoboy.name}</strong><br/><span style="color:#10b981; font-weight:bold; font-size:12px;">${motoboy.vehicle} · Disponível</span><br/><span style="font-size:11px; margin-top:4px; display:block;">Clique para selecionar</span>`,
      );
      mbMarker.on('click', () => {
        onMotoboySelectRef.current?.(motoboy.id);
      });
    });

    L.polyline(polyline, {
      color: isDark ? '#ffffff' : '#0f172a',
      weight: 5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    if (polyline.length > 0) {
      const bounds = L.latLngBounds(polyline);
      map.fitBounds(bounds, { padding: [60, 60] });
    }

    requestAnimationFrame(() => {
      map.invalidateSize();
    });
  }, [routeData, isDark, availableMotoboys, selectedMotoboyId]);

  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || !onMapContextMenu) return;

    const handleContextMenu = (event: L.LeafletMouseEvent) => {
      event.originalEvent.preventDefault();
      const { clientX, clientY } = event.originalEvent;
      onMapContextMenuRef.current?.(event.latlng.lat, event.latlng.lng, clientX, clientY);
    };

    map.on('contextmenu', handleContextMenu);
    return () => {
      map.off('contextmenu', handleContextMenu);
    };
  }, [onMapContextMenu, routeData]);

  return (
    <div className={`relative h-full w-full ${isDark ? 'bg-zinc-950' : 'bg-slate-100'}`}>
      <MapProviderToggle theme={theme} className="absolute left-3 top-3 z-[1000]" />
      <div ref={mapContainerRef} className="z-0 h-full w-full" />
    </div>
  );
};
