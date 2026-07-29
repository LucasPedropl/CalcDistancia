export type ThemeMode = 'dark' | 'light';

export interface LocationPoint {
  address: string;
  lat: number;
  lng: number;
  cep?: string;
  city?: string;
  state?: string;
  district?: string;
}

export interface PriceTier {
  id: string;
  minKm: number;
  maxKm: number | null; // null means "> X km"
  price: number | null; // null means "Sob Consulta" (fixed price for the tier)
  /** When set on an open-ended tier, charges per km above minKm. */
  pricePerKm?: number | null;
  label: string;
}

export interface RouteData {
  origin: LocationPoint;
  destination: LocationPoint;
  distanceKm: number;
  durationMin: number;
  polyline: [number, number][]; // Real road polyline coordinates
}

export type AppScreen = 'SEARCH' | 'ROUTE_RESULT';
