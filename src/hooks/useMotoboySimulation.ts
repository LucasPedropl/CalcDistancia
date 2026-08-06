import { useEffect } from 'react';
import { tickMotoboySimulation, subscribeToMotoboySimulation, reconcileMotoboySimulationBounds } from '../services/motoboySimulationService';
import { autoAdvanceSimulatedOrders } from '../services/orderSimulationBridge';

const TICK_INTERVAL_MS = 2000;

function runSimulationTick(): void {
  reconcileMotoboySimulationBounds();
  tickMotoboySimulation();
  autoAdvanceSimulatedOrders();
}

export function useMotoboySimulationTicker(enabled = true): void {
  useEffect(() => {
    if (!enabled) return undefined;

    runSimulationTick();

    const intervalId = window.setInterval(() => {
      runSimulationTick();
    }, TICK_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [enabled]);
}

export function useMotoboySimulationRefresh(onRefresh: () => void, enabled = true): void {
  useEffect(() => {
    if (!enabled) return undefined;

    const unsubscribe = subscribeToMotoboySimulation(onRefresh);
    return unsubscribe;
  }, [onRefresh, enabled]);
}
