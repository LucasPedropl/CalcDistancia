import React, { useCallback, useEffect, useRef } from 'react';
import type { RouteData, ThemeMode } from '../types';
import type { AvailableMotoboy } from '../types/order';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapProvider } from '../hooks/useMapProvider';
import { removeMapBaseLayer, setMapBaseLayer } from '../services/mapBaseLayerService';
import { MapProviderToggle } from './map/MapProviderToggle';
import { MapRecenterFloatingButton } from './map/MapRecenterFloatingButton';
import { centerMapOnPoint, fitMapToPoints } from './map/mapCentering';

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
  const routeLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const motoboyLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const fittedRouteKeyRef = useRef<string | null>(null);
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
      routeLayerGroupRef.current = null;
      motoboyLayerGroupRef.current = null;
      fittedRouteKeyRef.current = null;
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
    routeLayerGroupRef.current = L.layerGroup().addTo(map);
    motoboyLayerGroupRef.current = L.layerGroup().addTo(map);
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
    const routeGroup = routeLayerGroupRef.current;
    if (!map || !routeGroup) return;

    const { origin, destination, polyline } = routeData;
    const routeKey = `${origin.lat},${origin.lng}|${destination.lat},${destination.lng}|${polyline.length}`;

    routeGroup.clearLayers();

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

    const originMarker = L.marker([origin.lat, origin.lng], { icon: originIcon });
    originMarker.bindPopup(
      `<strong style="color:${isDark ? '#fff' : '#000'};">Origem:</strong><br/>${origin.address}`,
    );
    routeGroup.addLayer(originMarker);

    const destMarker = L.marker([destination.lat, destination.lng], { icon: destIcon });
    destMarker.bindPopup(
      `<strong style="color:${isDark ? '#fff' : '#000'};">Destino:</strong><br/>${destination.address}`,
    );
    routeGroup.addLayer(destMarker);

    if (polyline.length > 1) {
      const routeLine = L.polyline(polyline, {
        color: isDark ? '#ffffff' : '#0f172a',
        weight: 5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      });
      routeGroup.addLayer(routeLine);
    }

    if (fittedRouteKeyRef.current !== routeKey && polyline.length > 0) {
      fitMapToPoints(map, polyline, { padding: [60, 60], maxZoom: 16 });
      fittedRouteKeyRef.current = routeKey;
    }

    requestAnimationFrame(() => {
      map.invalidateSize();
    });
  }, [routeData, isDark]);

  useEffect(() => {
    const motoboyGroup = motoboyLayerGroupRef.current;
    if (!motoboyGroup) return;

    motoboyGroup.clearLayers();

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

      const mbMarker = L.marker([motoboy.lat, motoboy.lng], { icon: mbIcon });
      mbMarker.bindPopup(
        `<strong style="color:${isDark ? '#fff' : '#000'};">${motoboy.name}</strong><br/><span style="color:#10b981; font-weight:bold; font-size:12px;">${motoboy.vehicle} · Disponível</span><br/><span style="font-size:11px; margin-top:4px; display:block;">Clique para selecionar</span>`,
      );
      mbMarker.on('click', () => {
        onMotoboySelectRef.current?.(motoboy.id);
      });
      motoboyGroup.addLayer(mbMarker);
    });
  }, [availableMotoboys, selectedMotoboyId, isDark]);

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

  const handleRecenter = useCallback(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    const selectedMotoboy = availableMotoboys.find((entry) => entry.id === selectedMotoboyId);
    if (selectedMotoboy) {
      centerMapOnPoint(map, selectedMotoboy.lat, selectedMotoboy.lng);
      return;
    }

    const { polyline } = routeData;
    if (polyline.length > 0) {
      fitMapToPoints(map, polyline, { padding: [60, 60], maxZoom: 16 });
    }
  }, [availableMotoboys, selectedMotoboyId, routeData]);

  const recenterLabel = selectedMotoboyId
    ? 'Centralizar no motoboy'
    : 'Centralizar na rota';

  return (
    <div className={`relative h-full w-full ${isDark ? 'bg-zinc-950' : 'bg-slate-100'}`}>
      <MapProviderToggle theme={theme} className="absolute left-3 top-3 z-[1000]" />
      <MapRecenterFloatingButton
        theme={theme}
        onRecenter={handleRecenter}
        label={recenterLabel}
      />
      <div ref={mapContainerRef} className="z-0 h-full w-full" />
    </div>
  );
};
