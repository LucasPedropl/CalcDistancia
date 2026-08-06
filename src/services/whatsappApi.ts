import {
  assertRecipientDiffersFromConnectedPhone,
  assertWhatsAppConnected,
  getConnectedInstancePhone,
  loginBixs,
  sendWhatsAppMessage,
  uploadMedia,
} from './bixsWhatsappService';
import { isValidPhone } from '../utils/phoneValidation';

export interface WhatsAppMessagePayload {
  to: string;
  toName: string;
  message: string;
  document_url?: string;
}

function assertValidPhone(phone: string, label: string): void {
  if (!phone.trim()) {
    throw new Error(`${label} não cadastrado. Informe o telefone no perfil antes de enviar notificações.`);
  }

  if (!isValidPhone(phone)) {
    throw new Error(`${label} inválido. Use um número brasileiro com DDD (ex.: (31) 99999-9999).`);
  }
}

export const whatsappApi = {
  async sendMessage(payload: WhatsAppMessagePayload): Promise<boolean> {
    assertValidPhone(payload.to, 'Telefone do destinatário');

    const token = await loginBixs();
    const instanceId = await assertWhatsAppConnected(token);
    const connectedPhone = await getConnectedInstancePhone(token);
    assertRecipientDiffersFromConnectedPhone(payload.to, connectedPhone);

    let documentUrl = payload.document_url;

    if (documentUrl?.startsWith('blob:')) {
      const response = await fetch(documentUrl);
      const blob = await response.blob();
      documentUrl = await uploadMedia(token, blob, 'comprovante.pdf');
    }

    await sendWhatsAppMessage(token, {
      instanceId,
      to: payload.to,
      toName: payload.toName,
      message: payload.message,
      documentUrl,
    });

    return true;
  },

  async enviarCobranca(
    telefone: string,
    pixCopiaECola: string,
    valor: number,
    originStr: string,
    destStr: string,
    destinoMapsUrl?: string,
  ): Promise<boolean> {
    const mapsLink = destinoMapsUrl ?? `https://maps.google.com/?q=${encodeURIComponent(destStr)}`;
    const mensagem =
      `✅ *Coleta confirmada!*\n\n` +
      `📦 De: ${originStr}\n` +
      `📍 Para: ${destStr}\n\n` +
      `💰 Valor: R$ ${valor.toFixed(2)}\n\n` +
      `🔗 *Pagamento PIX (Copia e Cola):*\n${pixCopiaECola}\n\n` +
      `🗺️ *Destino no mapa:*\n${mapsLink}`;

    return this.sendMessage({
      to: telefone,
      toName: 'Cliente',
      message: mensagem,
    });
  },

  async enviarComprovante(telefone: string, urlComprovante: string, nomeCliente = 'Cliente'): Promise<boolean> {
    const mensagem =
      `✅ *Pagamento confirmado!*\n\n` +
      `Agradecemos a preferência. Segue o comprovante do seu pedido em anexo.`;

    return this.sendMessage({
      to: telefone,
      toName: nomeCliente,
      message: mensagem,
      document_url: urlComprovante,
    });
  },

  async enviarNotificacaoCliente(
    telefone: string,
    nomeCliente: string,
    mensagem: string,
  ): Promise<boolean> {
    return this.sendMessage({
      to: telefone,
      toName: nomeCliente,
      message: mensagem,
    });
  },

  async enviarNotificacaoMotoboy(
    telefone: string,
    nomeMotoboy: string,
    origem: string,
    destino: string,
    distanciaKm: number,
    valor: number | null,
  ): Promise<boolean> {
    const mensagem =
      `🛵 *Nova entrega disponível*\n\n` +
      `Olá, ${nomeMotoboy}!\n\n` +
      `📦 Origem: ${origem}\n` +
      `📍 Destino: ${destino}\n` +
      `📏 Distância: ${distanciaKm.toFixed(1)} km\n` +
      (valor !== null ? `💰 Valor: R$ ${valor.toFixed(2)}\n\n` : '\n') +
      `Acesse o app para aceitar a corrida.`;

    return this.sendMessage({
      to: telefone,
      toName: nomeMotoboy,
      message: mensagem,
    });
  },
};
