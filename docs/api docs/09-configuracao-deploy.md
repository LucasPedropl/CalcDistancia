# 09 — Configuração e Deploy

## `appsettings.json` completo (template)

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DbConect": "Server=...;Database=uaipdvco_calc_distancia;User Id=...;Password=...;TrustServerCertificate=true;"
  },
  "Jwt": {
    "Key": "SUBSTITUIR_CHAVE_SECRETA_64_CHARS_MINIMO_CALC_DISTANCIA_2026",
    "Issuer": "https://calc-distancia.api.uaipdv.com.br/",
    "Audience": "CalcDistanciaUsers",
    "AccessTokenExpirationMinutes": 60,
    "RefreshTokenExpirationDays": 7
  },
  "BixAPI": {
    "BaseUrl": "https://api.bixs.com.br",
    "Email": "papifast@bixs.com.br",
    "Password": "***",
    "Mac": "calc-distancia-api",
    "Source": "api_externa"
  },
  "WhatsApp": {
    "InstanceNamePrefix": "CALC",
    "TestPhoneRedirect": "31972532104"
  },
  "Pagamentos": {
    "WebhookBaseUrl": "https://calc-distancia.api.uaipdv.com.br/api/Pagamentos/webhook-bixs"
  },
  "Rotas": {
    "OsrmBaseUrl": "https://router.project-osrm.org",
    "NominatimBaseUrl": "https://nominatim.openstreetmap.org",
    "CacheTtlMinutos": 1440
  },
  "Pedidos": {
    "ExpiracaoPendingHoras": 24
  },
  "Cors": {
    "Origins": [
      "http://localhost:5173",
      "https://calc-distancia.vercel.app"
    ]
  }
}
```

## `appsettings.Development.json`

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug"
    }
  },
  "ConnectionStrings": {
    "DbConect": "Server=(localdb)\\mssqllocaldb;Database=CalcDistanciaDev;Trusted_Connection=True;"
  }
}
```

**User Secrets (dev):**

```powershell
dotnet user-secrets init --project CalcDistanciaV1
dotnet user-secrets set "BixAPI:Password" "..." --project CalcDistanciaV1
dotnet user-secrets set "Jwt:Key" "..." --project CalcDistanciaV1
```

---

## CORS

Espelhar Agendai — incluir porta Vite `5173`:

```csharp
policy.WithOrigins(builder.Configuration.GetSection("Cors:Origins").Get<string[]>())
      .AllowAnyHeader()
      .AllowAnyMethod()
      .AllowCredentials(); // necessário para SignalR
```

---

## Swagger

- Rota raiz: `RoutePrefix = string.Empty` (padrão Agendai)
- Security scheme Bearer
- XML comments habilitado (`GenerateDocumentationFile`)

URL dev: `https://localhost:7xxx/`

---

## Deploy IIS (padrão UAIPDV)

Mesmo fluxo PagWeb/Agendai:

1. `dotnet publish -c Release`
2. Publish profile `FolderProfile` → pasta no servidor
3. Application Pool .NET 8, `No Managed Code`
4. Binding HTTPS com certificado
5. Variáveis sensíveis via IIS Environment Variables ou `appsettings.Production.json` **não versionado**

**`web.config`** gerado automaticamente pelo publish.

---

## Deploy alternativo

| Ambiente | Sugestão |
|----------|----------|
| Vercel | Apenas frontend; API em VPS/IIS |
| Docker | `mcr.microsoft.com/dotnet/aspnet:8.0` + SQL Server container |
| Azure | App Service + Azure SQL |

---

## Variáveis de ambiente — frontend pós-migração

Remover do Vite:
- `VITE_BIXS_API_EMAIL`
- `VITE_BIXS_API_PASSWORD`
- `VITE_BIXS_API_BASE`

Adicionar:
```env
VITE_API_BASE_URL=https://calc-distancia.api.uaipdv.com.br/api
VITE_SIGNALR_URL=https://calc-distancia.api.uaipdv.com.br/hubs
```

---

## SSL / HTTPS

- API em produção: **HTTPS obrigatório**
- `RequireHttpsMetadata = true` no JwtBearer em produção
- Webhook Bixs precisa URL pública HTTPS

---

## Rate limiting (produção)

Proteger endpoints públicos:

```csharp
builder.Services.AddRateLimiter(options => {
    options.AddFixedWindowLimiter("api", o => {
        o.Window = TimeSpan.FromMinutes(1);
        o.PermitLimit = 100;
    });
});
```

Prioridade: `/Rotas/buscar-endereco`, `/Login/Acesso`.

---

## Monitoramento

| Métrica | Alerta |
|---------|--------|
| Falha login Bixs | TokenRefreshWorker errors |
| Webhook PIX não processado | Fila > 5 min |
| OSRM timeout | Latência `/Rotas/calcular` > 5s |
| SignalR disconnect rate | > 10% usuários motoboy |

---

## Checklist pré-go-live

- [ ] Migrations aplicadas em produção
- [ ] Roles seed (Admin, Cliente, Motoboy)
- [ ] Admin inicial criado
- [ ] Tabela preço sistema seed
- [ ] WhatsApp conectado via painel admin
- [ ] Webhook Bixs registrado e testado
- [ ] CORS com domínio frontend produção
- [ ] Credenciais Bixs fora do repositório git
- [ ] Swagger desabilitado ou protegido em produção (opcional)
