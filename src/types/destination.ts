import type { LocationPoint } from '../types';

/** Metadados opcionais ao confirmar um destino de entrega. */
export interface DestinationConfirmMeta {
  /** ID do condomínio vinculado; `null` = nenhuma das alternativas. */
  condominiumId?: string | null;
  condominiumName?: string;
}

export interface DestinationConfirmResult {
  destination: LocationPoint;
  meta?: DestinationConfirmMeta;
}
