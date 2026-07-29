# 05 — Endpoints (Referência Completa)

**Base URL:** `https://{host}/api`  
**Auth:** header `Authorization: Bearer {token}` salvo exceto onde indicado `AllowAnonymous`.

---

## Login

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/Login/Acesso` | Anon | Login email/senha → JWT |
| POST | `/Login/Registrar-Cliente` | Anon | Cadastro cliente |
| POST | `/Login/Registrar-Motoboy` | Anon | Cadastro motoboy |
| POST | `/Login/Refresh` | Anon | Renovar access token |
| GET | `/Login/Me` | Bearer | Perfil do usuário logado |
| POST | `/Login/Logout` | Bearer | Invalidar refresh token (opcional) |

---

## Rotas / Geocoding

Proxy server-side para Nominatim + ViaCEP + OSRM (substitui `geocodingService.ts`).

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/Rotas/buscar-endereco?q={query}` | Bearer | Autocomplete endereço/CEP |
| POST | `/Rotas/calcular` | Bearer | Rota real por estrada |

### `POST /Rotas/calcular`

**Request:**

```json
{
  "origem": {
    "endereco": "Praça da Liberdade, BH",
    "latitude": -19.932,
    "longitude": -43.938
  },
  "destino": {
    "endereco": "Aeroporto Confins",
    "latitude": -19.6341,
    "longitude": -43.9664
  }
}
```

**Response 200:**

```json
{
  "origem": { "endereco": "...", "latitude": -19.932, "longitude": -43.938 },
  "destino": { "endereco": "...", "latitude": -19.6341, "longitude": -43.9664 },
  "distanciaKm": 42.3,
  "duracaoMin": 55,
  "polyline": [[-19.932, -43.938], [-19.931, -43.937], "..."]
}
```

**Implementação:** `GET https://router.project-osrm.org/route/v1/driving/{lng1},{lat1};{lng2},{lat2}?overview=full&geometries=geojson`  
Cache em memória/Redis por par de coordenadas (TTL 24h).

---

## Tabelas de Preço

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/TabelasPreco/sistema` | Admin | Lista tabelas do PDV |
| GET | `/TabelasPreco/sistema/ativa` | Bearer | Tabela sistema ativa + faixas |
| GET | `/TabelasPreco/motoboy/minha` | Motoboy | Tabela ativa do motoboy logado |
| GET | `/TabelasPreco/motoboy/{motoboyId}/ativa` | Cliente | Para cálculo na listagem |
| POST | `/TabelasPreco` | Admin/Motoboy | Criar tabela |
| PUT | `/TabelasPreco/{id}` | Admin/Motoboy | Atualizar nome + faixas |
| PATCH | `/TabelasPreco/{id}/ativar` | Admin/Motoboy | Ativa (desativa outras do escopo) |
| DELETE | `/TabelasPreco/{id}` | Admin/Motoboy | Remove (não pode ser única ativa) |
| POST | `/TabelasPreco/calcular` | Bearer | Calcula preço para distância |

### `POST /TabelasPreco/calcular`

```json
{
  "distanciaKm": 12.5,
  "motoboyId": 3
}
```

**Response:**

```json
{
  "preco": 25.00,
  "label": "11 - 20 km",
  "sobConsulta": false
}
```

### Faixa de preço (DTO)

```json
{
  "minKm": 51,
  "maxKm": null,
  "preco": 50.00,
  "precoPorKm": 2.00,
  "label": "Acima de 50 km"
}
```

---

## Motoboys

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/Motoboys` | Admin | Lista completa |
| GET | `/Motoboys/proximos` | Cliente | Busca geo + preço estimado |
| GET | `/Motoboys/buscar?q={termo}` | Cliente | Nome, placa, telefone |
| GET | `/Motoboys/{id}` | Bearer | Detalhe público |
| PUT | `/Motoboys/{id}/perfil` | Motoboy | Atualiza perfil próprio |
| PUT | `/Motoboys/{id}/status` | Motoboy | ONLINE / OFFLINE (BUSY só API) |
| PUT | `/Motoboys/{id}/localizacao` | Motoboy | Atualiza lat/lng |
| GET | `/Motoboys/{id}/qr-payload` | Motoboy | JSON para QR balcão |
| POST | `/Motoboys/identificar` | Admin | QR scan ou telefone |

### `GET /Motoboys/proximos`

**Query:**

| Param | Tipo | Obrigatório |
|-------|------|-------------|
| `latitude` | double | sim |
| `longitude` | double | sim |
| `raioKm` | double | não (default 15) |
| `distanciaEntregaKm` | double | sim (para preço) |
| `busca` | string | não |

**Response:**

```json
{
  "itens": [
    {
      "id": 1,
      "nome": "João Pedro",
      "latitude": -19.9223,
      "longitude": -43.9305,
      "status": "ONLINE",
      "veiculo": "MOTO",
      "distanciaKm": 2.1,
      "precoEstimado": 25.00,
      "precoLabel": "11 - 20 km"
    }
  ]
}
```

Filtros: `publico = true`, `status = ONLINE`, ordenar por distância Haversine.

### `POST /Motoboys/identificar` (PDV)

```json
{
  "tipo": "TELEFONE",
  "valor": "31999999999"
}
```

ou

```json
{
  "tipo": "QR",
  "valor": "{\"motoboyId\":1,\"cpf\":\"...\",\"nome\":\"...\"}"
}
```

**Response:**

```json
{
  "motoboyId": 1,
  "nome": "João Pedro",
  "cpf": "12345678901",
  "pedidoAtivoId": "PED-ABC123"
}
```

---

## Pedidos

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/Pedidos` | Cliente | Criar pedido |
| GET | `/Pedidos` | Admin | Listar todos (filtros) |
| GET | `/Pedidos/{id}` | Bearer | Detalhe (dono ou motoboy ou admin) |
| GET | `/Pedidos/cliente/ativo` | Cliente | Pedido PENDING/ACCEPTED/PICKED_UP |
| GET | `/Pedidos/motoboy/abertos` | Motoboy | Fila disponível |
| GET | `/Pedidos/motoboy/ativo` | Motoboy | Corrida em andamento |
| PUT | `/Pedidos/{id}/rota` | Bearer | Atualiza polyline OSRM |
| POST | `/Pedidos/{id}/aceitar` | Motoboy | Aceita → ACCEPTED, BUSY |
| POST | `/Pedidos/{id}/coletar` | Admin | Coleta PDV → PICKED_UP + PIX |
| POST | `/Pedidos/{id}/finalizar` | Motoboy | COMPLETED, motoboy ONLINE |
| POST | `/Pedidos/{id}/cancelar` | Cliente/Motoboy | CANCELLED |

### `POST /Pedidos`

```json
{
  "origem": { "endereco": "...", "latitude": -19.92, "longitude": -43.93 },
  "destino": { "endereco": "...", "latitude": -19.63, "longitude": -43.96 },
  "distanciaKm": 42.3,
  "duracaoMin": 55,
  "polyline": [[-19.92, -43.93]],
  "preco": 50.00,
  "faixaPrecoLabel": "21 - 50 km",
  "telefoneRastreio": "31988887777",
  "modoAtribuicao": "BROADCAST",
  "motoboyAlvoId": null
}
```

`modoAtribuicao`: `BROADCAST` (todos motoboys online) ou `DIRECT` (+ `motoboyAlvoId`).

**Efeitos colaterais:**

1. Persistir pedido `PENDING`
2. `NotificacaoService` → push SignalR para motoboys elegíveis (não WhatsApp)
3. Se `DIRECT` → notificar apenas motoboy alvo

### `POST /Pedidos/{id}/aceitar`

```json
{
  "polyline": [[...]]
}
```

Validações:
- Pedido `PENDING`
- Motoboy sem pedido ativo
- Se `DIRECT`, `motoboyAlvoId` deve coincidir

### `POST /Pedidos/{id}/coletar` (Admin PDV)

```json
{
  "motoboyId": 1,
  "gerarPix": true,
  "enviarWhatsapp": true
}
```

**Efeitos:**

1. Status → `PICKED_UP`
2. `PagamentoService.SolicitarPixAsync(pedido)`
3. `WhatsAppService.EnviarCobrancaAsync(...)` — ver [06-integracao-bixs.md](./06-integracao-bixs.md)
4. Motoboy → `BUSY`

**Response:**

```json
{
  "pedido": { "id": "PED-...", "status": "PICKED_UP", "statusPagamento": "PENDING" },
  "pagamento": {
    "invoiceId": "inv_...",
    "pixEmv": "00020126...",
    "status": "PENDING"
  }
}
```

### `POST /Pedidos/{id}/cancelar`

```json
{
  "motivo": "Cliente desistiu"
}
```

Inferir `canceladoPor` pelo role do JWT.

---

## Pagamentos

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/Pagamentos/solicitar-pix` | Admin | Gera PIX avulso (coleta) |
| GET | `/Pagamentos/pedido/{pedidoId}` | Bearer | Status pagamento |
| POST | `/Pagamentos/webhook-bixs/{empresaId}` | **Anon** | Callback Bixs PAID |
| GET | `/Pagamentos/{id}/comprovante` | Bearer | Download PDF |

Ver detalhes em [06-integracao-bixs.md](./06-integracao-bixs.md).

---

## WhatsApp (Admin)

Espelhar `Agendai/Controllers/WhatsAppController.cs`:

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/WhatsApp/Status/{empresaId}` | Admin | Status instância Bixs |
| GET | `/WhatsApp/Obter-QrCode/{empresaId}` | Admin | QR para conectar |
| DELETE | `/WhatsApp/Desconectar/{empresaId}` | Admin | Remove instância |

> Envio de mensagens **não** é endpoint público — apenas `WhatsAppService` interno chamado por `PedidoService` / webhook.

---

## Chat

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/Chat/pedido/{pedidoId}` | Bearer | Histórico mensagens |
| POST | `/Chat/pedido/{pedidoId}/mensagens` | Bearer | Enviar mensagem REST |

**POST body:**

```json
{
  "texto": "Já estou a caminho!"
}
```

Também broadcast via SignalR Hub — ver [07-tempo-real.md](./07-tempo-real.md).

---

## Notificações Motoboy

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/Notificacoes/motoboy` | Motoboy | Não lidas + recentes |
| PATCH | `/Notificacoes/motoboy/marcar-lidas` | Motoboy | Marca todas como lidas |
| PATCH | `/Notificacoes/{id}/marcar-lida` | Motoboy | Uma notificação |

---

## Favoritos

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/Favoritos` | Cliente | IDs motoboys favoritos |
| POST | `/Favoritos/{motoboyId}` | Cliente | Adicionar |
| DELETE | `/Favoritos/{motoboyId}` | Cliente | Remover |

---

## Endereços (Cliente)

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/Enderecos` | Cliente | Lista salvos |
| POST | `/Enderecos` | Cliente | Criar |
| PUT | `/Enderecos/{id}` | Cliente | Atualizar |
| DELETE | `/Enderecos/{id}` | Cliente | Remover |

---

## Admin

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/Admin/dashboard` | Admin | KPIs: pedidos dia, online, faturamento |
| GET | `/Admin/pedidos` | Admin | Lista com filtros status/data |

---

## Códigos HTTP padrão

| Código | Uso |
|--------|-----|
| 200 | Sucesso com body |
| 201 | Criado (pedido, pagamento) |
| 400 | Validação / regra de negócio |
| 401 | Token ausente/inválido |
| 403 | Role insuficiente |
| 404 | Recurso não encontrado |
| 409 | Conflito (ex: motoboy já com corrida ativa) |
| 502 | Falha gateway Bixs |

## Formato de erro

```json
{
  "message": "Motoboy já possui corrida ativa.",
  "code": "MOTOBOY_BUSY",
  "details": null
}
```

## Paginação (listas admin)

Query: `?page=1&pageSize=20&status=PENDING&de=2026-01-01&ate=2026-12-31`

```json
{
  "itens": [],
  "total": 150,
  "page": 1,
  "pageSize": 20
}
```
