# 02 — Estrutura do Projeto

## Localização no monorepo

```
apps/CalcDistancia/
├── src/                    # Frontend Vite/React (protótipo atual)
├── docs/
│   ├── projeto.md
│   └── api/                # ← esta documentação
└── api/                    # ← NOVO: backend a ser criado
    ├── CalcDistancia.sln
    └── CalcDistanciaV1/
        ├── CalcDistanciaV1.csproj
        ├── Program.cs
        ├── appsettings.json
        ├── appsettings.Development.json
        ├── Controllers/
        ├── Models/
        ├── Dtos/
        ├── ViewModels/
        ├── Services/
        ├── Hubs/
        ├── Workers/
        ├── Data/
        ├── Migrations/
        └── Erro/
```

> **Padrão PagWeb:** subpasta `CalcDistanciaV1/` dentro de `api/`.  
> **Padrão Agendai:** projeto na raiz de `api/` — ambos válidos; recomendamos subpasta versionada.

---

## Árvore completa de arquivos

```
CalcDistanciaV1/
│
├── Program.cs                          # Bootstrap: DI, JWT, CORS, Swagger, SignalR
├── CalcDistanciaV1.csproj
├── appsettings.json
├── appsettings.Development.json
│
├── Controllers/
│   ├── BaseController.cs               # Claims helper (UsuarioId, Role) — copiar Agendai
│   ├── LoginController.cs              # Auth: login, registro, refresh, me
│   ├── PedidosController.cs            # CRUD pedidos + aceitar/cancelar/finalizar/coletar
│   ├── MotoboysController.cs           # Listagem, busca, perfil, status, identificação QR
│   ├── TabelasPrecoController.cs       # Tabelas sistema + motoboy, ativar
│   ├── RotasController.cs              # Geocoding + cálculo rota (OSRM proxy)
│   ├── PagamentosController.cs         # Solicitar PIX, webhook Bixs, consulta
│   ├── WhatsAppController.cs           # Status, QR Code, desconectar instância
│   ├── ChatController.cs               # Histórico REST do chat (complementa SignalR)
│   ├── NotificacoesController.cs       # Notificações internas motoboy
│   ├── FavoritosController.cs          # Motoboys favoritos do cliente
│   ├── EnderecosController.cs          # Endereços salvos do cliente
│   └── AdminController.cs              # Dashboard, métricas, usuários
│
├── Models/
│   ├── ApplicationUser.cs              # Identity: Cliente/Motoboy/Admin
│   ├── Empresa.cs                      # Estabelecimento PDV (tenant único ou multi)
│   ├── Motoboy.cs                      # Extensão perfil motoboy
│   ├── Pedido.cs                       # DeliveryOrder
│   ├── PedidoEndereco.cs               # Origem/destino embedded ou tabela filha
│   ├── TabelaPreco.cs
│   ├── FaixaPreco.cs                   # PriceTier
│   ├── Pagamento.cs
│   ├── WhatsApp.cs                     # Sessão instância Bixs
│   ├── TokenExterno.cs                 # Token Bixs cacheado por empresa
│   ├── ChatMensagem.cs
│   ├── NotificacaoMotoboy.cs
│   ├── FavoritoMotoboy.cs
│   ├── Endereco.cs
│   └── CalcDistanciaDbContext.cs
│
├── Dtos/
│   ├── AuthDtos.cs
│   ├── PedidoDtos.cs
│   ├── MotoboyDtos.cs
│   ├── TabelaPrecoDtos.cs
│   ├── RotaDtos.cs
│   ├── PagamentoDtos.cs                # Espelhar PagWebV1/Dtos/Payment.cs
│   ├── WhatsAppDtos.cs
│   ├── ChatDtos.cs
│   └── BixsWebhookDtos.cs
│
├── ViewModels/
│   ├── LoginViewModel.cs
│   └── PagamentoRepasse.cs             # Payload webhook Bixs (Agendai/PagWeb)
│
├── Services/
│   ├── IUserService.cs / UserService.cs
│   ├── IPedidoService.cs / PedidoService.cs
│   ├── IMotoboyService.cs / MotoboyService.cs
│   ├── ITabelaPrecoService.cs / TabelaPrecoService.cs
│   ├── IRotaService.cs / RotaService.cs
│   ├── IPaymentService.cs / PaymentService.cs      # HttpClient → Bixs invoices
│   ├── IWhatsAppService.cs / WhatsAppService.cs    # HttpClient → Bixs messages
│   ├── IExternalTokenService.cs / ExternalTokenService.cs  # Login + cache token Bixs
│   ├── IReceiptService.cs / ReceiptService.cs      # PDF comprovante
│   ├── INotificacaoService.cs / NotificacaoService.cs
│   ├── IChatService.cs / ChatService.cs
│   └── ErroRegistro.cs                 # Log de erros em arquivo (padrão Agendai)
│
├── Hubs/
│   ├── PedidoHub.cs                    # Chat + status pedido em tempo real
│   └── NotificacaoHub.cs               # Push notificações motoboy
│
├── Workers/
│   ├── TokenRefreshWorker.cs           # Renova token Bixs (padrão Agendai)
│   └── PedidoExpiracaoWorker.cs        # Opcional: cancela PENDING antigos
│
├── Data/
│   └── CalcDistanciaDbContext.cs       # Se preferir separar do Models/
│
├── Migrations/
│   └── (geradas pelo EF Core)
│
└── Erro/
    └── erros.txt                       # Log append-only (padrão PagWeb/Agendai)
```

---

## `CalcDistanciaV1.csproj`

Espelhar `AgendaAi.csproj` / `PagWebV1.csproj`:

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <GenerateDocumentationFile>true</GenerateDocumentationFile>
    <NoWarn>$(NoWarn);1591</NoWarn>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.22" />
    <PackageReference Include="Microsoft.AspNetCore.Identity.EntityFrameworkCore" Version="8.0.22" />
    <PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.22" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="8.0.22" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="8.0.22">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
    <PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="8.0.22">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
    <PackageReference Include="Swashbuckle.AspNetCore" Version="8.1.4" />
    <!-- PDF comprovante -->
    <PackageReference Include="QuestPDF" Version="2024.12.2" />
    <!-- Ou iTextSharp / PdfSharp — escolha do time -->
  </ItemGroup>
</Project>
```

---

## `Program.cs` — esqueleto

Baseado em `Agendai/api/Program.cs` + `PagWebV1/Program.cs`:

```csharp
var builder = WebApplication.CreateBuilder(args);
var corsPolicy = "_calcDistanciaCors";

// DbContext + Identity
builder.Services.AddDbContext<CalcDistanciaDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DbConect")));

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.SignIn.RequireConfirmedAccount = false; // ajustar conforme produto
    options.Password.RequiredLength = 6;
})
.AddEntityFrameworkStores<CalcDistanciaDbContext>()
.AddDefaultTokenProviders();

// HttpClients Bixs
builder.Services.AddHttpClient<IExternalTokenService, ExternalTokenService>();
builder.Services.AddHttpClient<IPaymentService, PaymentService>();
builder.Services.AddHttpClient<IWhatsAppService, WhatsAppService>();

// Services scoped
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IPedidoService, PedidoService>();
builder.Services.AddScoped<IMotoboyService, MotoboyService>();
builder.Services.AddScoped<ITabelaPrecoService, TabelaPrecoService>();
builder.Services.AddScoped<IRotaService, RotaService>();
builder.Services.AddScoped<IReceiptService, ReceiptService>();
builder.Services.AddScoped<INotificacaoService, NotificacaoService>();
builder.Services.AddScoped<IChatService, ChatService>();

// Workers
builder.Services.AddHostedService<TokenRefreshWorker>();

// JWT (ver 04-autenticacao.md)
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(/* ... */);

// SignalR
builder.Services.AddSignalR();

// CORS — incluir localhost:5173 (Vite CalcDistancia)
builder.Services.AddCors(options => options.AddPolicy(corsPolicy, policy =>
    policy.WithOrigins("http://localhost:5173", "https://calc-distancia.vercel.app")
          .AllowAnyHeader()
          .AllowAnyMethod()
          .AllowCredentials()));

builder.Services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(/* Bearer security — ver Agendai */);

var app = builder.Build();

// Seed roles: Admin, Cliente, Motoboy
await SeedRolesAsync(app.Services);

app.UseSwagger();
app.UseSwaggerUI(c => { c.SwaggerEndpoint("swagger/v1/swagger.json", "CalcDistancia V1"); c.RoutePrefix = string.Empty; });
app.UseCors(corsPolicy);
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<PedidoHub>("/hubs/pedido");
app.MapHub<NotificacaoHub>("/hubs/notificacao");

app.Run();
```

---

## Convenções de código (alinhadas ao monorepo)

| Aspecto | Convenção |
|---------|-----------|
| Controllers | `[Route("api/[controller]")]`, herdam `BaseController` quando precisam de `UsuarioId` |
| Nomes de ação | Português com hífen: `Obter-QrCode`, `marcar-lidas` (padrão Agendai) |
| DTOs de entrada | sufixo `Dto` ou `ViewModel` |
| Respostas Bixs | `PaymentRequestDto` / `PaymentResponseDto` — **copiar de** `PagWebV1/Dtos/Payment.cs` |
| Erros | `BadRequest("mensagem")`, log em `ErroRegistro.LogError` |
| JSON | `ReferenceHandler.IgnoreCycles` (evita loop EF) |
| Documentação XML | `<summary>` nos endpoints para Swagger (Agendai) |

---

## Comandos úteis

```powershell
# Criar solution e projeto
cd apps\CalcDistancia\api
dotnet new sln -n CalcDistancia
dotnet new webapi -n CalcDistanciaV1 -o CalcDistanciaV1 --framework net8.0
dotnet sln add CalcDistanciaV1\CalcDistanciaV1.csproj

# EF Core
cd CalcDistanciaV1
dotnet ef migrations add InitialCreate
dotnet ef database update

# Run
dotnet run --project CalcDistanciaV1
```

---

## Integração com `scripts/dev.js` do monorepo

Adicionar entrada no auto-discover ou override:

```json
// package.json em apps/CalcDistancia/api/CalcDistanciaV1 (opcional)
{
  "scripts": {
    "dev": "dotnet watch run"
  }
}
```

O frontend em `apps/CalcDistancia` continua com `npm run dev` na porta `5173`; a API em porta separada (ex.: `5180` ou `7001`).
