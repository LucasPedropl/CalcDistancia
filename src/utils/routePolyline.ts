/** Returns true when polyline looks like a real road path (not a 2-point straight line). */
export function isDetailedRoadPolyline(polyline: [number, number][] | undefined): boolean {
  return Boolean(polyline && polyline.length > 10);
}
