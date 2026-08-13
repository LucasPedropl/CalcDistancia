import type { LocationPoint } from '../types';
import type { ResidentAuthorizationStatus } from './condominium';

export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'PICKED_UP' | 'CANCELLED' | 'COMPLETED';
export type OrderAssignmentMode = 'BROADCAST' | 'DIRECT';
export type OrderPaymentStatus = 'NONE' | 'PENDING' | 'PAID';
export type OrderPaymentResponsibility = 'CLIENT' | 'ESTABLISHMENT';
export type OrderPaymentMethod = 'PIX' | 'CARD' | 'BIXPAY' | 'OFFLINE';

export interface OrderCheckoutResult {
  /** Nome de quem recebe, exibido ao motoboy e à portaria do condomínio */
  recipientName: string;
  trackingPhone: string;
  paymentResponsibility: OrderPaymentResponsibility;
  establishmentPaid: boolean;
  paymentMethod?: OrderPaymentMethod;
}

export interface DeliveryOrder {
  id: string;
  /** Estabelecimento (PDV) que criou o pedido */
  clientId: string;
  clientName: string;
  /** Cliente final que recebe a encomenda */
  recipientClientId?: string;
  recipientClientName?: string;
  recipientClientPhone?: string;
  /** Condomínio de destino, quando aplicável */
  condominiumId?: string;
  condominiumName?: string;
  /** Bloco/apartamento informado pelo cadastro do morador */
  condominiumUnitLabel?: string;
  /** Define se o motoboy entra pela autorização do morador ou pela portaria */
  residentAuthorizationStatus?: ResidentAuthorizationStatus;
  origin: LocationPoint;
  destination: LocationPoint;
  distanceKm: number;
  durationMin: number;
  price: number | null;
  tierLabel?: string;
  trackingPhone?: string;
  /** Código público para rastreamento em /clientes/{trackingCode} */
  trackingCode: string;
  status: OrderStatus;
  assignmentMode: OrderAssignmentMode;
  targetMotoboyId?: string;
  targetMotoboyName?: string;
  acceptedMotoboyId?: string;
  acceptedMotoboyName?: string;
  pickedUpMotoboyId?: string;
  pickedUpMotoboyName?: string;
  pickedUpAt?: string;
  paymentStatus?: OrderPaymentStatus;
  /** Quem arca com o pagamento da entrega */
  paymentResponsibility?: OrderPaymentResponsibility;
  paymentMethod?: OrderPaymentMethod;
  pixInvoiceId?: string;
  pixEmv?: string;
  paidAt?: string;
  polyline?: [number, number][];
  /** Rota do motoboy até a origem (coleta) */
  pickupPolyline?: [number, number][];
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
  cancelledBy?: 'CLIENT' | 'MOTOBOY';
  cancelledAt?: string;
}
export interface AvailableMotoboy {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: 'ONLINE' | 'BUSY' | 'OFFLINE';
  vehicle: string;
}
