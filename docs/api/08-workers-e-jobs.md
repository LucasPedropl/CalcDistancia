# 08 — Workers e Background Jobs

## `TokenRefreshWorker`

**Referência:** `Agendai/api` — `TokenRefreshWorker` + `TokenStorage`

Renova token Bixs antes de expirar para evitar falha em PIX/WhatsApp.

```csharp
public class TokenRefreshWorker : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await _externalToken.RefreshAllExpiringTokensAsync();
            }
            catch (Exception ex)
            {
                ErroRegistro.LogError($"TokenRefreshWorker: {ex}");
            }
            await Task.Delay(TimeSpan.FromMinutes(30), stoppingToken);
        }
    }
}
```

Registrar: `builder.Services.AddHostedService<TokenRefreshWorker>();`

---

## `PedidoExpiracaoWorker` (opcional)

Cancela pedidos `PENDING` sem aceite após X horas (configurável).

```json
"Pedidos": {
  "ExpiracaoPendingHoras": 24
}
```

---

## `MensalidadeNotifierService` (não aplicável)

PagWeb usa para assinaturas — **não necessário** no CalcDistancia unless billing SaaS for adicionado.

---

## Processamento webhook PIX (síncrono vs fila)

**MVP:** processar webhook inline no controller (como PagWeb/Agendai).

**Produção recomendada:**
1. Webhook persiste evento em `WebhookEventos` com status `RECEIVED`
2. Worker processa: atualiza pagamento, gera PDF, envia WhatsApp
3. Idempotência: `invoiceId` UNIQUE

---

## Geração de comprovante PDF

**Service:** `ReceiptService` — substitui `receiptService.ts` do front.

```csharp
public interface IReceiptService
{
    Task<byte[]> GerarComprovantePdfAsync(Pedido pedido, Pagamento pagamento);
    Task<string> SalvarComprovanteAsync(byte[] pdf, string pedidoId);
}
```

Biblioteca sugerida: **QuestPDF** ou reutilizar `PDFGeneretorService` do PagWeb se extrair para shared lib.

**Conteúdo mínimo do PDF:**
- ID pedido, data/hora pagamento
- Cliente, telefone rastreio
- Origem / destino
- Distância, valor pago
- Motoboy (se houver)
- QR code opcional com link rastreio

---

## Logs

Padrão monorepo — append em `Erro/erros.txt`:

```csharp
public static class ErroRegistro
{
  public static void LogError(string message) =>
    File.AppendAllText("Erro/erros.txt", $"[{DateTime.Now:O}] {message}\n");
}
```

Usar `ILogger<T>` em paralelo para produção (Application Insights, Seq, etc.).

---

## Health checks (recomendado)

```csharp
builder.Services.AddHealthChecks()
    .AddSqlServer(connectionString)
    .AddUrlGroup(new Uri("https://api.bixs.com.br/health"), "bixs");

app.MapHealthChecks("/health");
```
