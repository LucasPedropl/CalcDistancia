# 04 — Autenticação e Autorização

## Modelo

- **ASP.NET Core Identity** com `ApplicationUser` (padrão Agendai)
- **JWT Bearer** para API stateless
- Opcional: cookie `access_token` lido no `JwtBearerEvents.OnMessageReceived` (Agendai já faz isso)

## Roles

| Role | Claims | Acesso |
|------|--------|--------|
| `Admin` | PDV, empresa | Tabelas sistema, WhatsApp, coleta, todos pedidos |
| `Cliente` | `sub` = userId | Próprios pedidos, favoritos, chat |
| `Motoboy` | `sub` + `motoboyId` | Pedidos abertos/ativos, perfil, tabela própria |

Seed no startup (copiar bloco de `Agendai/Program.cs`):

```csharp
string[] roles = { "Admin", "Cliente", "Motoboy" };
foreach (var role in roles)
    if (!await roleManager.RoleExistsAsync(role))
        await roleManager.CreateAsync(new IdentityRole(role));
```

## `appsettings.json` — JWT

```json
{
  "Jwt": {
    "Key": "<chave-secreta-64-chars-minimo>",
    "Issuer": "https://calc-distancia.api.local/",
    "Audience": "CalcDistanciaUsers",
    "AccessTokenExpirationMinutes": 60,
    "RefreshTokenExpirationDays": 7
  }
}
```

## Login

### `POST /api/Login/Acesso`

**Auth:** `AllowAnonymous`

**Body:**

```json
{
  "email": "cliente@exemplo.com",
  "password": "senha123"
}
```

**Response 200:**

```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "abc...",
  "expiresIn": 3600,
  "usuario": {
    "id": "guid",
    "email": "cliente@exemplo.com",
    "nome": "Cliente",
    "role": "Cliente",
    "motoboyId": null
  }
}
```

**Fluxo interno (Agendai):**

1. Validar usuário Identity (`CheckPasswordAsync`)
2. Opcional: `_externalTokenService.VerificaAcesso(login)` — sincroniza conta Bixs se necessário
3. Gerar JWT com claims: `NameIdentifier`, `Email`, `Role`, `motoboyId` (se motoboy)

## Registro Cliente

### `POST /api/Login/Registrar-Cliente`

```json
{
  "email": "novo@email.com",
  "password": "senha123",
  "nome": "João",
  "sobreNome": "Silva",
  "telefone": "31999999999",
  "cpf": "12345678901"
}
```

- Criar `ApplicationUser` + role `Cliente`
- Validar unicidade email/telefone

## Registro Motoboy

### `POST /api/Login/Registrar-Motoboy`

Mesmo body + campos motoboy (`placa`, `cidade`, `bairro`, `estado`, `veiculo`).

- Criar user + registro `Motoboys` + role `Motoboy`
- Gerar `QrPayload` JSON

## Refresh

### `POST /api/Login/Refresh`

```json
{ "refreshToken": "..." }
```

## Perfil autenticado

### `GET /api/Login/Me`

**Auth:** `Bearer`

Retorna usuário + perfil motoboy se aplicável.

## BaseController

```csharp
public abstract class BaseController : ControllerBase
{
    protected string UsuarioId =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new UnauthorizedAccessException();

    protected int? MotoboyId =>
        int.TryParse(User.FindFirstValue("motoboyId"), out var id) ? id : null;
}
```

## Matriz de autorização por controller

| Endpoint | Admin | Cliente | Motoboy |
|----------|-------|---------|---------|
| `TabelasPreco` sistema | CRUD | — | — |
| `TabelasPreco` motoboy | — | — | CRUD próprio |
| `Pedidos` criar | — | ✓ | — |
| `Pedidos` aceitar | — | — | ✓ |
| `Pedidos` coletar | ✓ | — | — |
| `Pedidos` cancelar | — | ✓ (próprio) | ✓ (ativo) |
| `WhatsApp/*` | ✓ | — | — |
| `Pagamentos/webhook` | AllowAnonymous | | |
| `Motoboys/proximos` | ✓ | ✓ | ✓ |
| `Chat/*` | — | ✓ (pedido próprio) | ✓ (pedido ativo) |

## Integração Bixs no login (opcional)

PagWeb e Agendai chamam `VerificaAcesso` no login para obter/salvar `TokenExterno` da empresa. Para CalcDistancia (tenant único PDV):

- Admin faz login → API garante token Bixs válido em `TokensExternos`
- `TokenRefreshWorker` renova antes de expirar

**Credenciais Bixs ficam apenas em:**

```json
"BixAPI": {
  "Email": "...",
  "Password": "...",
  "BaseUrl": "https://api.bixs.com.br"
}
```

Nunca expor ao frontend.
