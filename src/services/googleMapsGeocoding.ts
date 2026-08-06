import type { LocationPoint } from '../types';
import type { AddressFormInput } from './geocodingService';
import { loadGoogleMapsApi, isGoogleMapsApiConfigured } from './googleMapsLoader';

function formatCepMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export interface GeocodeHints {
  establishmentName?: string;
  cep?: string;
  street?: string;
  district?: string;
  city?: string;
  state?: string;
}

interface GoogleGeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
  score: number;
}

type GoogleAddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

type GoogleGeocoderResult = {
  formatted_address?: string;
  partial_match?: boolean;
  geometry?: {
    location?: { lat: () => number; lng: () => number } | { lat: number; lng: number };
    location_type?: string;
  };
  address_components?: GoogleAddressComponent[];
  types?: string[];
};

function normalizeToken(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function readLatLng(location: GoogleGeocoderResult['geometry']): { lat: number; lng: number } | null {
  const point = location?.location;
  if (!point) return null;

  if (typeof (point as { lat: () => number }).lat === 'function') {
    const latLng = point as { lat: () => number; lng: () => number };
    return { lat: latLng.lat(), lng: latLng.lng() };
  }

  const literal = point as { lat: number; lng: number };
  return { lat: literal.lat, lng: literal.lng };
}

function getComponent(components: GoogleAddressComponent[] | undefined, type: string): string {
  return components?.find((component) => component.types.includes(type))?.long_name ?? '';
}

function scoreGeocodeResult(result: GoogleGeocoderResult, hints: GeocodeHints): number {
  let score = 0;
  const components = result.address_components ?? [];
  const postalCode = getComponent(components, 'postal_code').replace(/\D/g, '');
  const route = getComponent(components, 'route');
  const sublocality =
    getComponent(components, 'sublocality') ||
    getComponent(components, 'sublocality_level_1') ||
    getComponent(components, 'neighborhood');
  const city =
    getComponent(components, 'administrative_area_level_2') ||
    getComponent(components, 'locality');
  const state = getComponent(components, 'administrative_area_level_1');
  const formatted = result.formatted_address ?? '';

  if (hints.cep && postalCode === hints.cep.replace(/\D/g, '')) score += 50;
  if (hints.city && normalizeToken(city).includes(normalizeToken(hints.city))) score += 20;
  if (hints.state && normalizeToken(state).includes(normalizeToken(hints.state))) score += 10;
  if (hints.district && normalizeToken(sublocality).includes(normalizeToken(hints.district))) score += 15;
  if (hints.street && normalizeToken(route).includes(normalizeToken(hints.street))) score += 25;

  if (hints.establishmentName) {
    const establishmentToken = normalizeToken(hints.establishmentName);
    if (establishmentToken.length >= 4 && normalizeToken(formatted).includes(establishmentToken)) {
      score += 40;
    }
  }

  if (result.geometry?.location_type === 'ROOFTOP') score += 12;
  if (result.geometry?.location_type === 'RANGE_INTERPOLATED') score += 8;
  if (result.types?.includes('establishment') || result.types?.includes('point_of_interest')) {
    score += 10;
  }
  if (result.partial_match) score -= 20;

  return score;
}

async function geocodeQueriesWithJsApi(
  queries: string[],
  hints: GeocodeHints,
): Promise<GoogleGeocodeResult | null> {
  if (!isGoogleMapsApiConfigured()) return null;

  await loadGoogleMapsApi(['places']);

  const googleMaps = (window as Window & { google?: { maps?: { Geocoder: new () => GoogleGeocoder } } }).google
    ?.maps;
  if (!googleMaps?.Geocoder) return null;

  const geocoder = new googleMaps.Geocoder();
  const collected: GoogleGeocodeResult[] = [];

  for (const query of queries) {
    const response = await new Promise<{
      results?: GoogleGeocoderResult[];
      status?: string;
    }>((resolve) => {
      geocoder.geocode(
        {
          address: query,
          region: 'BR',
          componentRestrictions: { country: 'BR' },
        },
        (results, status) => resolve({ results: results ?? undefined, status }),
      );
    });

    if (response.status !== 'OK' || !response.results?.length) continue;

    for (const result of response.results.slice(0, 5)) {
      const coords = readLatLng(result.geometry);
      if (!coords) continue;

      collected.push({
        lat: coords.lat,
        lng: coords.lng,
        formattedAddress: result.formatted_address ?? query,
        score: scoreGeocodeResult(result, hints),
      });
    }
  }

  if (collected.length === 0) return null;

  return collected.sort((a, b) => b.score - a.score)[0];
}

async function searchEstablishmentWithPlaces(
  hints: GeocodeHints,
): Promise<GoogleGeocodeResult | null> {
  if (!hints.establishmentName || !isGoogleMapsApiConfigured()) return null;

  await loadGoogleMapsApi(['places']);

  const googleMaps = (window as Window & {
    google?: {
      maps?: {
        places?: {
          PlacesService: new (element: HTMLElement) => {
            textSearch: (
              request: { query: string; region?: string },
              callback: (
                results: Array<{
                  geometry?: { location?: { lat: () => number; lng: () => number } };
                  formatted_address?: string;
                  name?: string;
                }> | null,
                status: string,
              ) => void,
            ) => void;
          };
        };
      };
    };
  }).google?.maps;

  const PlacesService = googleMaps?.places?.PlacesService;
  if (!PlacesService) return null;

  const query = [
    hints.establishmentName,
    hints.street,
    hints.district,
    hints.city,
    hints.state,
    hints.cep,
    'Brasil',
  ]
    .filter(Boolean)
    .join(', ');

  const service = new PlacesService(document.createElement('div'));
  const response = await new Promise<{
    results: Array<{
      geometry?: { location?: { lat: () => number; lng: () => number } };
      formatted_address?: string;
      name?: string;
    }>;
    status: string;
  }>((resolve) => {
    service.textSearch({ query, region: 'br' }, (results, status) => {
      resolve({ results: results ?? [], status });
    });
  });

  if (response.status !== 'OK' || response.results.length === 0) return null;

  const ranked = response.results
    .map((place) => {
      const location = place.geometry?.location;
      if (!location) return null;

      let score = 0;
      const formatted = `${place.name ?? ''} ${place.formatted_address ?? ''}`;
      const establishmentToken = normalizeToken(hints.establishmentName ?? '');

      if (establishmentToken && normalizeToken(formatted).includes(establishmentToken)) {
        score += 50;
      }
      if (hints.city && normalizeToken(formatted).includes(normalizeToken(hints.city))) score += 20;
      if (hints.cep && normalizeToken(formatted).includes(hints.cep.replace(/\D/g, ''))) score += 30;
      if (hints.street && normalizeToken(formatted).includes(normalizeToken(hints.street))) score += 20;

      return {
        lat: location.lat(),
        lng: location.lng(),
        formattedAddress: place.formatted_address ?? place.name ?? query,
        score,
      };
    })
    .filter((entry): entry is GoogleGeocodeResult => entry !== null)
    .sort((a, b) => b.score - a.score);

  return ranked[0] ?? null;
}

function buildAddressLabel(fields: AddressFormInput, numberLabel: string): string {
  const parts = [
    fields.street.trim(),
    numberLabel !== 'S/N' ? numberLabel : '',
    fields.complement.trim(),
    fields.district.trim(),
    `${fields.city.trim()} - ${fields.state.trim()}`,
    fields.cep ? `CEP ${formatCepMask(fields.cep)}` : '',
  ].filter(Boolean);

  return parts.join(', ');
}

export async function resolveAddressWithGoogleMaps(
  fields: AddressFormInput,
  options?: { establishmentName?: string; allowNoStreetNumber?: boolean },
): Promise<LocationPoint | null> {
  if (!isGoogleMapsApiConfigured()) return null;

  const numberLabel =
    options?.allowNoStreetNumber && !fields.number.trim() ? 'S/N' : fields.number.trim() || 'S/N';

  const hints: GeocodeHints = {
    establishmentName: options?.establishmentName?.trim(),
    cep: formatCepMask(fields.cep),
    street: fields.street.trim(),
    district: fields.district.trim(),
    city: fields.city.trim(),
    state: fields.state.trim(),
  };

  const establishmentResult = await searchEstablishmentWithPlaces(hints);
  if (establishmentResult && establishmentResult.score >= 40) {
    return {
      address: buildAddressLabel(fields, numberLabel),
      lat: establishmentResult.lat,
      lng: establishmentResult.lng,
      cep: formatCepMask(fields.cep),
      city: fields.city.trim(),
      state: fields.state.trim(),
      district: fields.district.trim(),
    };
  }

  const queries = [
    [hints.establishmentName, hints.street, hints.district, hints.city, hints.state, hints.cep, 'Brasil']
      .filter(Boolean)
      .join(', '),
    [hints.street, hints.district, hints.city, hints.state, hints.cep, 'Brasil'].filter(Boolean).join(', '),
    [hints.street, numberLabel, hints.district, hints.city, hints.state, 'Brasil'].filter(Boolean).join(', '),
  ];

  const geocodeResult = await geocodeQueriesWithJsApi(queries, hints);
  if (!geocodeResult) return null;

  return {
    address: buildAddressLabel(fields, numberLabel),
    lat: geocodeResult.lat,
    lng: geocodeResult.lng,
    cep: formatCepMask(fields.cep),
    city: fields.city.trim(),
    state: fields.state.trim(),
    district: fields.district.trim(),
  };
}

interface GoogleGeocoder {
  geocode: (
    request: { address: string; region?: string; componentRestrictions?: { country: string } },
    callback: (results: GoogleGeocoderResult[] | null, status: string) => void,
  ) => void;
}
