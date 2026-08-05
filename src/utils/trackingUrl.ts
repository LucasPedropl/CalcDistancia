export function getClientTrackingUrl(trackingCode: string): string {
  const configuredBase = import.meta.env.VITE_PUBLIC_APP_URL?.replace(/\/$/, '');
  const base =
    configuredBase ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173');
  return `${base}/clientes/${trackingCode}`;
}

export function formatTrackingWhatsAppFooter(trackingCode: string): string {
  const url = getClientTrackingUrl(trackingCode);
  return `🔑 Código de rastreio: *${trackingCode}*\n🔗 Acompanhe em tempo real:\n${url}`;
}

export function normalizeTrackingCodeInput(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, '');
}
