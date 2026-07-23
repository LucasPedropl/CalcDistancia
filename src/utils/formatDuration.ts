/**
 * Formata minutos em "X min" ou "X h Y min".
 */
export function formatDurationMinutes(totalMinutes: number): string {
  const rounded = Math.round(totalMinutes);
  if (rounded < 60) {
    return `${rounded} min`;
  }
  const hours = Math.floor(rounded / 60);
  const minutes = rounded % 60;
  if (minutes === 0) {
    return `${hours} h`;
  }
  return `${hours} h ${minutes} min`;
}
