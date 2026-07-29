# 10 — Migração Frontend → API

Guia para o time frontend substituir services `localStorage` por chamadas HTTP após API pronta.

---

## Mapa de substituição

| Arquivo atual | Substituir por | Endpoints |
|---------------|----------------|-----------|
| `authService.ts` | `api/authApi.ts` | `/Login/*` |
| `orderService.ts` | `api/pedidosApi.ts` | `/Pedidos/*` |
| `motoboyService.ts` | `api/motoboysApi.ts` | `/Motoboys/*` |
| `motoboyProfileService.ts` | `api/motoboysApi.ts` | `PUT /Motoboys/{id}/perfil` |
| `pricingService.ts` + `priceTableService.ts` | `api/tabelasPrecoApi.ts` | `/TabelasPreco/*` |
| `motoboyPricingService.ts` | `api/tabelasPrecoApi.ts` | `/TabelasPreco/motoboy/*` |
| `orderChatService.ts` | `api/chatApi.ts` + SignalR | `/Chat/*`, `/hubs/pedido` |
| `motoboyNotificationService.ts` | `api/notificacoesApi.ts` + SignalR | `/Notificacoes/*`, `/hubs/notificacao` |
| `paymentApi.ts` | *(remover)* | Admin chama coleta que gera PIX |
| `bixsPaymentService.ts` | *(remover)* | — |
| `bixsWhatsappService.ts` | *(remover)* | Admin usa `/WhatsApp/*` |
| `whatsappApi.ts` | *(remover)* | — |
| `receiptService.ts` | *(remover)* | API gera PDF |
| `paymentRecordService.ts` | `GET /Pagamentos/pedido/{id}` | — |
| `geocodingService.ts` | `api/rotasApi.ts` | `/Rotas/*` |
| `constants/bixsApi.ts` | *(remover)* | — |

---

## Cliente HTTP base

```typescript
// src/api/httpClient.ts
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem('access_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(err.message ?? 'Erro na API');
  }

  return response.json() as Promise<T>;
}
```

---

## Exemplo `pedidosApi.ts`

```typescript
import { apiFetch } from './httpClient';
import type { DeliveryOrder } from '../types/order';

export const pedidosApi = {
  criar: (body: CreateOrderDto) =>
    apiFetch<DeliveryOrder>('/Pedidos', { method: 'POST', body: JSON.stringify(body) }),

  getAtivoCliente: () =>
    apiFetch<DeliveryOrder | null>('/Pedidos/cliente/ativo'),

  aceitar: (id: string, polyline?: [number, number][]) =>
    apiFetch<DeliveryOrder>(`/Pedidos/${id}/aceitar`, {
      method: 'POST',
      body: JSON.stringify({ polyline }),
    }),

  cancelar: (id: string) =>
    apiFetch<DeliveryOrder>(`/Pedidos/${id}/cancelar`, { method: 'POST', body: '{}' }),
};
```

---

## Hooks — mudança mínima

Manter assinaturas dos hooks (`useOrders`, `useOrderChat`) trocando implementação interna:

```typescript
// Antes: subscribeToOrders do localStorage
// Depois: SignalR PedidoAtualizado + polling fallback

export function useActiveOrderForClient(clientId: string | undefined) {
  const [order, setOrder] = useState<DeliveryOrder | null>(null);

  useEffect(() => {
    if (!clientId) return;
    pedidosApi.getAtivoCliente().then(setOrder);
    // + connection.on('PedidoAtualizado', ...)
  }, [clientId]);

  return order;
}
```

---

## Admin WhatsApp

`AdminWhatsappConnect.tsx` hoje chama Bixs direto — migrar para:

```typescript
GET  /WhatsApp/Status/{empresaId}
GET  /WhatsApp/Obter-QrCode/{empresaId}
DELETE /WhatsApp/Desconectar/{empresaId}
```

`empresaId` pode ser fixo `1` em tenant único ou vir do JWT admin.

---

## PickupConfirm (PDV)

Fluxo único via API:

```typescript
// 1. Identificar motoboy
POST /Motoboys/identificar

// 2. Coletar (gera PIX + WhatsApp server-side)
POST /Pedidos/{id}/coletar
```

Remover botão "simular pagamento" em produção — usar webhook real ou endpoint dev-only:

```
POST /Pagamentos/simular-pago/{pedidoId}  [Development only]
```

---

## Autenticação frontend

Substituir `AuthContext` demo:

```typescript
// Login
const { accessToken, usuario } = await apiFetch('/Login/Acesso', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
});
localStorage.setItem('access_token', accessToken);
```

Roles: `admin` → rota `/admin`, `motoboy` → `/motoboy`, demais → `/cliente`.

---

## Arquivos a deletar após migração

```
src/constants/bixsApi.ts
src/services/bixsWhatsappService.ts
src/services/bixsPaymentService.ts
src/services/whatsappApi.ts
src/services/paymentApi.ts
src/services/paymentRecordService.ts
src/services/receiptService.ts
```

Atualizar `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:5180/api
VITE_SIGNALR_URL=http://localhost:5180/hubs
```

---

## Checklist migração

### Fase 1 — Auth + Pedidos
- [ ] `authApi` + JWT no `AuthContext`
- [ ] `pedidosApi` substitui `orderService`
- [ ] Remover `calc_distancia_orders` do localStorage

### Fase 2 — Motoboys + Preços
- [ ] `motoboysApi` + `tabelasPrecoApi`
- [ ] Perfil motoboy via API

### Fase 3 — Integrações
- [ ] Admin WhatsApp via API
- [ ] Coleta PDV via `POST /coletar`
- [ ] Remover credenciais Bixs do `.env` front

### Fase 4 — Tempo real
- [ ] SignalR chat
- [ ] SignalR notificações motoboy
- [ ] Remover `orderChatService` localStorage

### Fase 5 — Limpeza
- [ ] Deletar services obsoletos
- [ ] Build produção sem variáveis Bixs
- [ ] Testes E2E fluxo completo

---

## Compatibilidade durante transição

Feature flag opcional:

```env
VITE_USE_API=false  # mantém localStorage até API estável
```

```typescript
export const pedidosApi = import.meta.env.VITE_USE_API === 'true'
  ? pedidosApiHttp
  : pedidosApiLocal;
```

Remover flag após go-live.
