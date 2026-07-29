# CalcDistancia API — Documentação para Backend

Documentação técnica completa da API REST do **Sistema de Cálculo de Distância / Entregas** (`CalcDistancia`).

O frontend atual (`apps/CalcDistancia`) opera em modo **protótipo** com `localStorage` e chamadas diretas à API Bixs no browser — **inseguro para produção**. Esta documentação descreve a API backend que o time deve implementar, seguindo o mesmo padrão das APIs já existentes no monorepo:

| Referência | Caminho | Stack |
|------------|---------|-------|
| **PagWeb** | `apps/PagWebFuncional/api/PagWebV1` | ASP.NET Core 8, EF Core, SQL Server, JWT, Bixs Payment + WhatsApp |
| **Agendai** | `apps/Agendai/api` | ASP.NET Core 8, Identity, EF Core, SQL Server, JWT, Bixs Payment + WhatsApp |

---

## Índice

| Documento | Conteúdo |
|-----------|----------|
| [01-visao-geral.md](./01-visao-geral.md) | Objetivos, escopo, fases, diagramas de fluxo |
| [02-estrutura-projeto.md](./02-estrutura-projeto.md) | Árvore de pastas, `.csproj`, pacotes NuGet, convenções |
| [03-banco-de-dados.md](./03-banco-de-dados.md) | Entidades, relacionamentos, índices, migrations |
| [04-autenticacao.md](./04-autenticacao.md) | JWT, roles, Identity, políticas de autorização |
| [05-endpoints.md](./05-endpoints.md) | **Todas as rotas** — request/response, códigos HTTP, exemplos |
| [06-integracao-bixs.md](./06-integracao-bixs.md) | Pagamentos PIX, WhatsApp, tokens, webhooks (sai do front) |
| [07-tempo-real.md](./07-tempo-real.md) | SignalR — chat pedido, notificações motoboy, status pedido |
| [08-workers-e-jobs.md](./08-workers-e-jobs.md) | Background services, refresh token Bixs, expiração PIX |
| [09-configuracao-deploy.md](./09-configuracao-deploy.md) | `appsettings`, variáveis, CORS, IIS, Swagger |
| [10-migracao-frontend.md](./10-migracao-frontend.md) | O que remover do Vite, novos services HTTP, checklist |

---

## Resumo executivo

### O que migra do frontend para a API

| Hoje no front (`localStorage` / `fetch` direto) | Destino na API |
|------------------------------------------------|----------------|
| `authService.ts` | `LoginController` + ASP.NET Identity |
| `orderService.ts` | `PedidosController` + `PedidoService` |
| `motoboyService.ts` / `motoboyProfileService.ts` | `MotoboysController` |
| `priceTableService.ts` / `pricingService.ts` | `TabelasPrecoController` |
| `orderChatService.ts` | `ChatController` + SignalR Hub |
| `motoboyNotificationService.ts` | `NotificacoesController` + SignalR Hub |
| `paymentApi.ts` / `bixsPaymentService.ts` | `PagamentosController` + `PaymentService` |
| `bixsWhatsappService.ts` / `whatsappApi.ts` | `WhatsAppController` + `WhatsAppService` |
| `receiptService.ts` | `ReceiptService` (PDF server-side) |
| `geocodingService.ts` (OSRM/Nominatim) | `RotasController` (proxy com cache) |
| Credenciais `VITE_BIXS_*` | `appsettings.json` + `TokenExterno` no banco |

### Stack recomendada

```
ASP.NET Core 8.0 (Web API)
├── Entity Framework Core 8 + SQL Server
├── ASP.NET Core Identity (usuários Cliente / Motoboy / Admin)
├── JWT Bearer Authentication
├── Swashbuckle (Swagger/OpenAPI)
├── SignalR (chat + notificações em tempo real)
├── HttpClient (integração Bixs Gateway)
└── Hosted Services (token refresh, workers)
```

### URL base (desenvolvimento)

```
https://localhost:7xxx/api/...
```

Prefixo de rota alinhado ao Agendai: `api/[controller]`.  
PagWeb usa `api/v1/[controller]` — ambos são aceitos; **recomendamos `api/[controller]`** para consistência com Agendai no mesmo monorepo.

### Roles do sistema

| Role | Descrição |
|------|-----------|
| `Admin` | PDV, tabela de preços sistema, WhatsApp empresa, coleta balcão |
| `Cliente` | Criar pedidos, chat, cancelar, favoritos |
| `Motoboy` | Aceitar corridas, tabela própria, status, chat, finalizar |

---

## Ordem de implementação sugerida

1. **Scaffold** — projeto, DbContext, Identity, JWT, Swagger (espelhar `Program.cs` do Agendai)
2. **Auth** — login, registro cliente/motoboy, roles
3. **Tabelas de preço** — CRUD + regra “uma ativa por escopo”
4. **Motoboys** — perfil, status, busca geolocalizada, QR
5. **Pedidos** — ciclo de vida completo (`PENDING` → `COMPLETED`)
6. **Rotas** — geocoding + OSRM proxy
7. **Bixs Payment** — PIX na coleta + webhook
8. **Bixs WhatsApp** — conexão admin + envio na coleta/comprovante
9. **SignalR** — chat e notificações
10. **Migração front** — trocar services por HTTP client

---

## Documentos de negócio relacionados

- Requisitos funcionais: [`../projeto.md`](../projeto.md)
- Protótipo frontend: `apps/CalcDistancia/src/`
