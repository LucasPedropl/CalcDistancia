import type { AvailableMotoboy } from '../types/order';
import type { DeliveryOrder } from '../types/order';
import { DEMO_MOTOBOY_IDS, getMotoboyById } from './motoboyService';
import { getAllOrders } from './orderService';
import { fetchRealRoadRoute } from './geocodingService';
import {
  createStraightPolyline,
  findDistanceAlongPolyline,
  interpolateAlongPolyline,
  randomNearbyPoint,
} from '../utils/polylineNavigation';
import { moveTowardPoint } from '../utils/geoInterpolation';

const SIMULATION_KEY = 'calc_distancia_motoboy_simulation';
const SIMULATION_EVENT = 'calc-distancia-motoboy-simulation-updated';

type SimulationMode = 'idle' | 'to_origin' | 'to_destination';

interface MotoboySimulationState {
  motoboyId: string;
  lat: number;
  lng: number;
  mode: SimulationMode;
  orderId?: string;
  routeDistanceKm?: number;
  idleRoutePolyline?: [number, number][];
  idleRouteDistanceKm?: number;
}

const idleRouteFetches = new Set<string>();

function loadSimulationStates(): Record<string, MotoboySimulationState> {
  try {
    const raw = localStorage.getItem(SIMULATION_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, MotoboySimulationState>;
  } catch {
    return {};
  }
}

function saveSimulationStates(states: Record<string, MotoboySimulationState>): void {
  localStorage.setItem(SIMULATION_KEY, JSON.stringify(states));
  window.dispatchEvent(new CustomEvent(SIMULATION_EVENT));
}

function getDefaultState(motoboy: AvailableMotoboy): MotoboySimulationState {
  return {
    motoboyId: motoboy.id,
    lat: motoboy.lat,
    lng: motoboy.lng,
    mode: 'idle',
    idleRouteDistanceKm: 0,
  };
}

function resolveTargetForMotoboy(motoboyId: string): {
  mode: SimulationMode;
  orderId?: string;
  order?: DeliveryOrder;
} {
  const activeOrder = getAllOrders().find(
    (order) =>
      order.acceptedMotoboyId === motoboyId &&
      (order.status === 'ACCEPTED' || order.status === 'PICKED_UP'),
  );

  if (!activeOrder) {
    return { mode: 'idle' };
  }

  if (activeOrder.status === 'PICKED_UP') {
    return { mode: 'to_destination', orderId: activeOrder.id, order: activeOrder };
  }

  return { mode: 'to_origin', orderId: activeOrder.id, order: activeOrder };
}

function getRoutePolylineForMode(
  mode: SimulationMode,
  order: DeliveryOrder | undefined,
  motoboyLat: number,
  motoboyLng: number,
): [number, number][] | null {
  if (!order) return null;

  if (mode === 'to_origin') {
    if (order.pickupPolyline && order.pickupPolyline.length > 1) {
      return order.pickupPolyline;
    }
    return createStraightPolyline(
      { lat: motoboyLat, lng: motoboyLng },
      order.origin,
    );
  }

  if (mode === 'to_destination') {
    if (order.polyline && order.polyline.length > 1) {
      return order.polyline;
    }
    return createStraightPolyline(order.origin, order.destination);
  }

  return null;
}

function requestIdleRoute(
  motoboyId: string,
  lat: number,
  lng: number,
): void {
  if (idleRouteFetches.has(motoboyId)) return;

  idleRouteFetches.add(motoboyId);
  const destination = randomNearbyPoint(lat, lng, 0.15, 0.45);

  void fetchRealRoadRoute(
    { lat, lng, address: 'Patrulha' },
    { lat: destination.lat, lng: destination.lng, address: 'Destino patrulha' },
  )
    .then((route) => {
      const currentStates = loadSimulationStates();
      const current = currentStates[motoboyId];
      if (!current || current.mode !== 'idle') return;

      currentStates[motoboyId] = {
        ...current,
        idleRoutePolyline: route.polyline,
        idleRouteDistanceKm: 0,
      };
      saveSimulationStates(currentStates);
    })
    .catch(() => {
      // fallback handled on next tick
    })
    .finally(() => {
      idleRouteFetches.delete(motoboyId);
    });
}

export function getSimulatedMotoboyPosition(
  motoboyId: string,
): { lat: number; lng: number } | null {
  const state = loadSimulationStates()[motoboyId];
  if (!state) return null;
  return { lat: state.lat, lng: state.lng };
}

export function applySimulatedPositions<T extends AvailableMotoboy>(motoboys: T[]): T[] {
  return motoboys.map((motoboy) => {
    const simulated = getSimulatedMotoboyPosition(motoboy.id);
    if (!simulated) return motoboy;
    return { ...motoboy, lat: simulated.lat, lng: simulated.lng };
  });
}

export function tickMotoboySimulation(): void {
  const states = loadSimulationStates();
  let changed = false;

  for (const motoboyId of DEMO_MOTOBOY_IDS) {
    const motoboy = getMotoboyById(motoboyId);
    if (!motoboy) continue;

    const current = states[motoboy.id] ?? getDefaultState(motoboy);
    const target = resolveTargetForMotoboy(motoboy.id);
    const nextMode = target.mode;
    const stepKm = nextMode === 'idle' ? 0.08 : 0.22;

    let routeDistanceKm = current.routeDistanceKm ?? 0;
    let idleRouteDistanceKm = current.idleRouteDistanceKm ?? 0;
    let idleRoutePolyline = current.idleRoutePolyline;

    const modeChanged = nextMode !== current.mode || target.orderId !== current.orderId;

    let nextLat = current.lat;
    let nextLng = current.lng;

    if (nextMode === 'idle') {
      if (!idleRoutePolyline || idleRoutePolyline.length < 2) {
        requestIdleRoute(motoboy.id, current.lat, current.lng);
      }

      if (idleRoutePolyline && idleRoutePolyline.length > 1) {
        if (modeChanged) {
          idleRouteDistanceKm = findDistanceAlongPolyline(idleRoutePolyline, current.lat, current.lng);
        }

        const advanced = interpolateAlongPolyline(idleRoutePolyline, idleRouteDistanceKm + stepKm);
        idleRouteDistanceKm = advanced.distanceKm;
        nextLat = advanced.lat;
        nextLng = advanced.lng;

        if (advanced.arrived) {
          idleRoutePolyline = undefined;
          idleRouteDistanceKm = 0;
        }
      } else {
        const fallbackTarget = randomNearbyPoint(current.lat, current.lng, 0.05, 0.15);
        const moved = moveTowardPoint(
          current.lat,
          current.lng,
          fallbackTarget.lat,
          fallbackTarget.lng,
          stepKm * 0.5,
        );
        nextLat = moved.lat;
        nextLng = moved.lng;
      }
    } else {
      const routePolyline = getRoutePolylineForMode(nextMode, target.order, current.lat, current.lng);

      if (routePolyline && routePolyline.length > 1) {
        if (modeChanged) {
          routeDistanceKm = findDistanceAlongPolyline(routePolyline, current.lat, current.lng);
        }

        const advanced = interpolateAlongPolyline(routePolyline, routeDistanceKm + stepKm);
        routeDistanceKm = advanced.distanceKm;
        nextLat = advanced.lat;
        nextLng = advanced.lng;
      } else if (target.order) {
        const destination =
          nextMode === 'to_origin'
            ? target.order.origin
            : target.order.destination;
        const moved = moveTowardPoint(
          current.lat,
          current.lng,
          destination.lat,
          destination.lng,
          stepKm,
        );
        nextLat = moved.lat;
        nextLng = moved.lng;
      }
    }

    const updated: MotoboySimulationState = {
      motoboyId: motoboy.id,
      lat: nextLat,
      lng: nextLng,
      mode: nextMode,
      orderId: target.orderId,
      routeDistanceKm: nextMode === 'idle' ? undefined : routeDistanceKm,
      idleRoutePolyline: nextMode === 'idle' ? idleRoutePolyline : undefined,
      idleRouteDistanceKm: nextMode === 'idle' ? idleRouteDistanceKm : undefined,
    };

    if (
      updated.lat !== current.lat ||
      updated.lng !== current.lng ||
      updated.mode !== current.mode ||
      updated.orderId !== current.orderId ||
      updated.routeDistanceKm !== current.routeDistanceKm ||
      updated.idleRouteDistanceKm !== current.idleRouteDistanceKm ||
      updated.idleRoutePolyline !== current.idleRoutePolyline
    ) {
      states[motoboy.id] = updated;
      changed = true;
    }
  }

  if (changed) {
    saveSimulationStates(states);
  }
}

export function resetMotoboySimulation(motoboyId: string): void {
  const motoboy = getMotoboyById(motoboyId);
  if (!motoboy) return;

  const states = loadSimulationStates();
  states[motoboyId] = getDefaultState(motoboy);
  saveSimulationStates(states);
}

export function subscribeToMotoboySimulation(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener(SIMULATION_EVENT, handler);
  return () => window.removeEventListener(SIMULATION_EVENT, handler);
}
