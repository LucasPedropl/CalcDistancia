# 07 — Tempo Real (SignalR)

Substitui `localStorage` events e polling do protótipo para:
- Chat cliente ↔ motoboy
- Notificações internas motoboy
- Atualização de status do pedido (cliente vê aceite em tempo real)

## Pacote

Incluído no ASP.NET Core — `builder.Services.AddSignalR()`.

## Hubs

### `PedidoHub` — `/hubs/pedido`

**Grupos:** `pedido:{pedidoId}` — cliente e motoboy entram ao abrir pedido ativo.

| Método cliente → servidor | Descrição |
|---------------------------|-----------|
| `JoinPedido(pedidoId)` | Entra no grupo (validar permissão) |
| `LeavePedido(pedidoId)` | Sai do grupo |
| `SendMessage(pedidoId, texto)` | Envia chat; persiste DB + broadcast |

| Evento servidor → cliente | Payload |
|---------------------------|---------|
| `MessageReceived` | `{ id, pedidoId, remetenteId, papel, nome, texto, criadoEm }` |
| `PedidoAtualizado` | `{ pedidoId, status, motoboyNome?, ... }` |

**Autenticação:** JWT via query string ou header:

```csharp
// Program.cs — JwtBearer para SignalR
options.Events = new JwtBearerEvents
{
    OnMessageReceived = context =>
    {
        var accessToken = context.Request.Query["access_token"];
        var path = context.HttpContext.Request.Path;
        if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
            context.Token = accessToken;
        return Task.CompletedTask;
    }
};
```

### `NotificacaoHub` — `/hubs/notificacao`

**Grupos:** `motoboy:{motoboyId}`

| Evento | Quando |
|--------|--------|
| `NovaNotificacao` | Novo pedido BROADCAST/DIRECT |
| `NotificacaoLida` | Sync após marcar lidas |

Disparado por `NotificacaoService` após `POST /Pedidos`:

```csharp
await _hubContext.Clients.Group($"motoboy:{motoboyId}")
    .SendAsync("NovaNotificacao", new {
        id, titulo, mensagem, pedidoId, criadoEm
    });
```

---

## Cliente TypeScript (frontend futuro)

```typescript
import * as signalR from '@microsoft/signalr';

const connection = new signalR.HubConnectionBuilder()
  .withUrl(`${API_BASE}/hubs/pedido?access_token=${token}`)
  .withAutomaticReconnect()
  .build();

await connection.start();
await connection.invoke('JoinPedido', pedidoId);

connection.on('MessageReceived', (msg) => { /* append chat */ });
connection.on('PedidoAtualizado', (pedido) => { /* update UI */ });
```

Dependência: `@microsoft/signalr`.

---

## Fallback REST

Se WebSocket bloqueado:
- Chat: polling `GET /Chat/pedido/{id}?since={timestamp}` a cada 3s
- Notificações: `GET /Notificacoes/motoboy?since=...`

Implementar endpoint `since` opcional na Fase 3.

---

## Escalabilidade

Para múltiplas instâncias API:
- Backplane **Redis** (`AddSignalR().AddStackExchangeRedis(...)`)
- Sticky sessions no load balancer como alternativa simples

---

## O que NÃO usar SignalR para

- Envio WhatsApp (sempre HTTP server-side para Bixs)
- Geração PIX
- Geocoding
