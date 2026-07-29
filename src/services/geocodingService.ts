import type { LocationPoint, RouteData } from '../types';

// Preset popular locations for instant seamless suggestions
export const POPULAR_LOCATIONS: LocationPoint[] = [
  {
    address: 'Praça da Liberdade, Savassi - Belo Horizonte, MG',
    lat: -19.9320,
    lng: -43.9380,
    city: 'Belo Horizonte',
    state: 'MG',
    district: 'Savassi',
  },
  {
    address: 'Aeroporto Internacional de Confins (CNF) - Confins, MG',
    lat: -19.6341,
    lng: -43.9664,
    city: 'Confins',
    state: 'MG',
  },
  {
    address: 'Mercado Central, Av. Augusto de Lima, 744 - Centro, Belo Horizonte, MG',
    lat: -19.9229,
    lng: -43.9443,
    city: 'Belo Horizonte',
    state: 'MG',
    district: 'Centro',
  },
  {
    address: 'Avenida Paulista, 1578 - Bela Vista, São Paulo, SP',
    lat: -23.5614,
    lng: -46.6559,
    city: 'São Paulo',
    state: 'SP',
    district: 'Bela Vista',
  },
  {
    address: 'Praia de Copacabana, Av. Atlântica - Rio de Janeiro, RJ',
    lat: -22.9698,
    lng: -43.1802,
    city: 'Rio de Janeiro',
    state: 'RJ',
    district: 'Copacabana',
  },
];

/**
 * Searches address or CEP via public APIs (ViaCEP for CEPs, Nominatim for address strings).
 */
export async function searchAddressOrCep(query: string): Promise<LocationPoint[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery || cleanQuery.length < 3) {
    return [];
  }

  const results: LocationPoint[] = [];

  // Check if query looks like a CEP (e.g. 30130-010 or 30130010)
  const numericOnly = cleanQuery.replace(/\D/g, '');
  if (numericOnly.length === 8) {
    try {
      const viaCepRes = await fetch(`https://viacep.com.br/ws/${numericOnly}/json/`);
      if (viaCepRes.ok) {
        const data = await viaCepRes.json();
        if (!data.erro) {
          const fullAddr = `${data.logradouro}${data.bairro ? ', ' + data.bairro : ''} - ${data.localidade}, ${data.uf} (CEP ${data.cep})`;
          
          // Geocode CEP address to coordinates using Nominatim
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              `${data.logradouro}, ${data.localidade}, ${data.uf}, Brasil`
            )}&limit=1`
          );
          let lat = -19.9191; // Default BH center fallback if geocode fails
          let lng = -43.9386;

          if (geoRes.ok) {
            const geoData = await geoRes.json();
            if (geoData && geoData.length > 0) {
              lat = parseFloat(geoData[0].lat);
              lng = parseFloat(geoData[0].lon);
            }
          }

          results.push({
            address: fullAddr,
            lat,
            lng,
            cep: data.cep,
            city: data.localidade,
            state: data.uf,
            district: data.bairro,
          });
        }
      }
    } catch (e) {
      console.warn('ViaCEP lookup failed, falling back to general search', e);
    }
  }

  // General text search via Nominatim OpenStreetMap Public API
  try {
    const nomRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(
        cleanQuery + ', Brasil'
      )}&limit=5`
    );
    if (nomRes.ok) {
      const data = await nomRes.json();
      data.forEach((item: any) => {
        results.push({
          address: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          city: item.address?.city || item.address?.town || item.address?.municipality || '',
          state: item.address?.state || '',
          district: item.address?.suburb || item.address?.neighbourhood || '',
          cep: item.address?.postcode || '',
        });
      });
    }
  } catch (e) {
    console.warn('Nominatim search failed', e);
  }

  // Filter preset matching locations as instant results if any match
  const filteredPresets = POPULAR_LOCATIONS.filter((loc) =>
    loc.address.toLowerCase().includes(cleanQuery.toLowerCase())
  );

  return [...filteredPresets, ...results];
}

/**
 * Calculates Haversine distance in km between two lat/lng points (fallback).
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): { distanceKm: number; durationMin: number } {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightDistance = R * c;

  const roadDistance = Math.round(straightDistance * 1.25 * 10) / 10;
  const durationMin = Math.max(3, Math.round((roadDistance / 35) * 60 + 3));

  return {
    distanceKm: Math.max(0.5, roadDistance),
    durationMin,
  };
}

/**
 * Generates an interpolated polyline curve (fallback).
 */
export function generateRoutePolyline(
  origin: LocationPoint,
  destination: LocationPoint,
  steps = 25
): [number, number][] {
  const points: [number, number][] = [];
  const midLat = (origin.lat + destination.lat) / 2;
  const midLng = (origin.lng + destination.lng) / 2;
  const offset = 0.005 * (Math.abs(origin.lat - destination.lat) + Math.abs(origin.lng - destination.lng));

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = (1 - t) * (1 - t) * origin.lat + 2 * (1 - t) * t * (midLat + offset) + t * t * destination.lat;
    const lng = (1 - t) * (1 - t) * origin.lng + 2 * (1 - t) * t * (midLng - offset) + t * t * destination.lng;
    points.push([lat, lng]);
  }

  return points;
}

/**
 * Fetches real driving road route via OSRM (Open Source Routing Machine) public driving API.
 * Returns exact road distance, driving duration, and turn-by-turn road polyline.
 */
export async function fetchRealRoadRoute(
  origin: LocationPoint,
  destination: LocationPoint
): Promise<RouteData> {
  try {
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
    const response = await fetch(osrmUrl);

    if (response.ok) {
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
        const durationMin = Math.max(2, Math.round(route.duration / 60));

        // Convert OSRM GeoJSON [lon, lat] coordinates to Leaflet [lat, lon]
        const polyline: [number, number][] = route.geometry.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]]
        );

        return {
          origin,
          destination,
          distanceKm,
          durationMin,
          polyline,
        };
      }
    }
  } catch (err) {
    console.warn('OSRM road routing failed, falling back to Haversine calculation', err);
  }

  // Fallback calculation
  const { distanceKm, durationMin } = calculateHaversineDistance(
    origin.lat,
    origin.lng,
    destination.lat,
    destination.lng
  );
  const polyline = generateRoutePolyline(origin, destination);

  return {
    origin,
    destination,
    distanceKm,
    durationMin,
    polyline,
  };
}

/**
 * Sync wrapper for fast initialization, or uses fetchRealRoadRoute for real driving path.
 */
export interface ReverseGeocodeResult {
  street: string;
  district: string;
  city: string;
  state: string;
  cep: string;
  displayName: string;
  lat: number;
  lng: number;
}

/** Reverse geocode lat/lng via Nominatim (map right-click destination pick). */
export async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${lat}&lon=${lng}`,
      { headers: { 'Accept-Language': 'pt-BR' } },
    );
    if (response.ok) {
      const data = (await response.json()) as {
        display_name?: string;
        address?: Record<string, string>;
      };
      const addr = data.address ?? {};
      const street =
        addr.road ??
        addr.pedestrian ??
        addr.footway ??
        addr.residential ??
        data.display_name?.split(',')[0] ??
        'Local selecionado';

      return {
        street,
        district: addr.suburb ?? addr.neighbourhood ?? addr.quarter ?? '',
        city: addr.city ?? addr.town ?? addr.municipality ?? '',
        state: addr.state ?? '',
        cep: addr.postcode ?? '',
        displayName: data.display_name ?? street,
        lat,
        lng,
      };
    }
  } catch (error) {
    console.warn('Reverse geocode failed', error);
  }

  return {
    street: 'Local selecionado no mapa',
    district: '',
    city: '',
    state: '',
    cep: '',
    displayName: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    lat,
    lng,
  };
}

export function buildDestinationAddress(
  base: ReverseGeocodeResult,
  number: string,
  complement: string,
): LocationPoint {
  const numberPart = number.trim() ? `, ${number.trim()}` : '';
  const complementPart = complement.trim() ? ` - ${complement.trim()}` : '';
  const locationTail = [base.district, base.city, base.state].filter(Boolean).join(', ');
  const address = `${base.street}${numberPart}${complementPart}${locationTail ? `, ${locationTail}` : ''}`;

  return {
    address,
    lat: base.lat,
    lng: base.lng,
    city: base.city || undefined,
    state: base.state || undefined,
    district: base.district || undefined,
    cep: base.cep || undefined,
  };
}

export function buildRouteData(origin: LocationPoint, destination: LocationPoint): RouteData {
  const { distanceKm, durationMin } = calculateHaversineDistance(
    origin.lat,
    origin.lng,
    destination.lat,
    destination.lng
  );
  const polyline = generateRoutePolyline(origin, destination);

  return {
    origin,
    destination,
    distanceKm,
    durationMin,
    polyline,
  };
}
