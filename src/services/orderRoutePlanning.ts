import type { LocationPoint } from '../types';
import { fetchRealRoadRoute } from './geocodingService';
import { getOrderById, updateOrderPickupRoute } from './orderService';
import { createStraightPolyline } from '../utils/polylineNavigation';

export async function fetchAndSaveOrderPickupRoute(
  orderId: string,
  motoboyLat: number,
  motoboyLng: number,
): Promise<void> {
  const order = getOrderById(orderId);
  if (!order) return;

  const from: LocationPoint = {
    lat: motoboyLat,
    lng: motoboyLng,
    address: 'Posição do motoboy',
  };

  try {
    const route = await fetchRealRoadRoute(from, order.origin);
    updateOrderPickupRoute(orderId, route.polyline);
  } catch (error) {
    console.warn('Falha ao buscar rota até a origem, usando linha reta', error);
    updateOrderPickupRoute(
      orderId,
      createStraightPolyline(from, order.origin),
    );
  }
}
