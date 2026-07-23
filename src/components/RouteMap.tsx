import React, { useEffect, useRef } from 'react';
import type { RouteData, ThemeMode } from '../types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface RouteMapProps {
  routeData: RouteData;
  useGoogleMaps: boolean;
  theme?: ThemeMode;
}

export const RouteMap: React.FC<RouteMapProps> = ({ routeData, useGoogleMaps, theme = 'dark' }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const isDark = theme === 'dark';

  const destroyLeafletMap = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
      tileLayerRef.current = null;
    }
  };

  useEffect(() => {
    if (useGoogleMaps) {
      destroyLeafletMap();
      return;
    }

    if (!mapContainerRef.current) return;

    const { origin, destination, polyline } = routeData;

    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([origin.lat, origin.lng], 13);

      L.control.zoom({ position: 'bottomright' }).addTo(map);
      leafletMapRef.current = map;
    }

    const map = leafletMapRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    const newTileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    tileLayerRef.current = newTileLayer;

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
      `<strong style="color:${isDark ? '#fff' : '#000'};">Origem:</strong><br/>${origin.address}`
    );

    const destMarker = L.marker([destination.lat, destination.lng], { icon: destIcon }).addTo(map);
    destMarker.bindPopup(
      `<strong style="color:${isDark ? '#fff' : '#000'};">Destino:</strong><br/>${destination.address}`
    );

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
  }, [routeData, isDark, useGoogleMaps]);

  useEffect(() => {
    return () => {
      destroyLeafletMap();
    };
  }, []);

  if (useGoogleMaps) {
    const googleMapUrl = `https://maps.google.com/maps?saddr=${encodeURIComponent(
      routeData.origin.address
    )}&daddr=${encodeURIComponent(routeData.destination.address)}&output=embed&t=m`;

    return (
      <div
        className={`w-full h-full relative flex flex-col ${
          isDark ? 'bg-zinc-950' : 'bg-slate-100'
        }`}
      >
        <iframe
          title="Google Maps Driving Route"
          src={googleMapUrl}
          className={`w-full h-full border-0 ${
            isDark ? 'filter invert contrast-125 brightness-90 saturate-0' : ''
          }`}
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className={`w-full h-full relative ${isDark ? 'bg-zinc-950' : 'bg-slate-100'}`}>
      <div ref={mapContainerRef} className="w-full h-full z-0" />
    </div>
  );
};
