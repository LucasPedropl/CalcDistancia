# 01 — Visão Geral

## Propósito

A API CalcDistancia centraliza toda a lógica de negócio do sistema de entregas:

- Cálculo de rotas e precificação por distância
- Gestão de pedidos e ciclo de vida da entrega
- Cadastro e monitoramento de motoboys
- Pagamento PIX via gateway Bixs (mesmo do PagWeb)
- Notificações WhatsApp ao **cliente** (coleta, PIX, comprovante)
- Notificações **internas** ao motoboy (SignalR — sem WhatsApp em massa)
- Chat cliente ↔ motoboy por pedido
- Painel administrativo (PDV / coleta no balcão)

## Atores

```mermaid
flowchart LR
  subgraph clientes [Cliente Web]
    C[Cliente]
  end
  subgraph motoboys [Motoboy Web]
    M[Motoboy]
  end
  subgraph admin [Admin / PDV]
    A[Administrador]
  end
  API[CalcDistancia API]
  BIXS[Bixs Gateway]
  OSRM[OSRM / Nominatim]
  DB[(SQL Server)]

  C --> API
  M --> API
  A --> API
  API --> DB
  API --> BIXS
  API --> OSRM
  BIXS -->|webhook PIX| API
```

## Fluxos principais

### 1. Cliente cria pedido

```mermaid
sequenceDiagram
  participant C as Cliente
  participant API as API
  participant DB as SQL Server
  participant SR as SignalR

  C->>API: POST /Rotas/calcular
  API->>API: OSRM (rota real)
  API-->>C: distância, tempo, polyline
  C->>API: GET /Motoboys/proximos
  API-->>C: lista + preço por motoboy
  C->>API: POST /Pedidos
  API->>DB: INSERT pedido PENDING
  API->>SR: broadcast notificação motoboys
  API-->>C: pedido criado
```

### 2. Motoboy aceita e executa

```mermaid
sequenceDiagram
  participant M as Motoboy
  participant API as API
  participant DB as SQL Server

  M->>API: GET /Pedidos/motoboy/abertos
  M->>API: POST /Pedidos/{id}/aceitar
  API->>DB: status ACCEPTED, motoboy BUSY
  Note over M: Chat habilitado via SignalR
  M->>API: POST /Pedidos/{id}/finalizar
  API->>DB: status COMPLETED, motoboy ONLINE
```

### 3. Coleta no balcão + PIX + WhatsApp (Admin)

```mermaid
sequenceDiagram
  participant A as Admin PDV
  participant API as API
  participant BIXS as Bixs
  participant WA as WhatsApp Bixs
  participant C as Cliente

  A->>API: POST /Motoboys/identificar (QR ou telefone)
  A->>API: POST /Pedidos/{id}/coletar
  API->>BIXS: POST /v1/api/payment/invoices (PIX)
  BIXS-->>API: pix_emv, invoice_id
  API->>WA: mensagem + PIX + link mapa
  WA-->>C: WhatsApp
  BIXS->>API: webhook PAID
  API->>API: gera PDF comprovante
  API->>WA: comprovante anexo
  WA-->>C: WhatsApp comprovante
```

## Estados do pedido

| Status | Descrição | Transições permitidas |
|--------|-----------|----------------------|
| `PENDING` | Aguardando motoboy | → `ACCEPTED`, `PICKED_UP`, `CANCELLED` |
| `ACCEPTED` | Motoboy aceitou | → `PICKED_UP`, `COMPLETED`, `CANCELLED` |
| `PICKED_UP` | Coleta confirmada no PDV | → `COMPLETED`, `CANCELLED` |
| `COMPLETED` | Entrega finalizada | terminal |
| `CANCELLED` | Cancelado por cliente ou motoboy | terminal |

## Status do motoboy

| Status | Descrição |
|--------|-----------|
| `ONLINE` | Disponível para corridas |
| `BUSY` | Com pedido ativo (`ACCEPTED` ou `PICKED_UP`) |
| `OFFLINE` | Indisponível (manual ou inatividade) |

## Regras de negócio críticas

1. **Uma tabela de preço ativa por escopo** — sistema (`SYSTEM`) ou por motoboy (`MOTOBOY` + `ownerId`).
2. **Motoboy ocupado** não vê pedidos globais (`BROADCAST`), exceto pedidos `DIRECT` direcionados a ele.
3. **WhatsApp só para cliente** — motoboys recebem notificações via SignalR (requisito `projeto.md` §5).
4. **Credenciais Bixs nunca no frontend** — email/senha/permanent_token apenas no servidor.
5. **Unicidade** — e-mail e telefone únicos por usuário/motoboy.
6. **Privacidade** — motoboy com `publico = false` não aparece na busca de clientes.

## Fases de entrega da API

| Fase | Escopo |
|------|--------|
| **MVP** | Auth, pedidos, motoboys, tabelas preço, rotas |
| **Fase 2** | PIX Bixs, webhook, WhatsApp, coleta PDV, comprovante PDF |
| **Fase 3** | SignalR completo, favoritos, métricas admin, rate limiting |
