# Sistema de Cálculo de Distância (Sistema de Rotas)

## Visão Geral

O sistema exibe a distância e o preço de entrega/percurso com base em uma tabela
de referência de preços. Também conta com controle de acesso via usuário e
senha.

---

## Requisitos Gerais

- **Controle de Acesso:** Inserir um controle de acesso com usuário e senha.
- **Tabela Parametrizável:** A tabela de preços deve ser parametrizável (o
  administrador pode alterar faixas e valores).
- **Integração:** O sistema pode ter integração com pagamento online ou apenas
  exibir o valor final.
- **Cálculo de Rota:** O cálculo de distância e tempo pode ser feito via API de
  mapas (Google Maps, OpenStreetMap, Mapbox).

---

## Fluxo de Tela do Sistema

### 1. Tela Inicial (Calcular Rota)

- **Campos de entrada:**
    - Origem (endereço ou CEP)
    - Destino (endereço ou CEP)
- **Botão:** `"Calcular Rota"`

---

### 2. Tela de Resultado da Rota

- **Exibição:**
    - Endereço de origem e destino confirmados
    - Distância total (em km)
    - Tempo estimado de percurso (em minutos/horas)
- **Botão:** `"Ver Preço"`

---

### 3. Tela de Preço

- **Tabela Dinâmica de Preços:**
    - Faixa de distância → Preço correspondente

| Distância (km) | Preço (R$)   |
| :------------- | :----------- |
| 0 - 5 km       | R$ 10,00     |
| 6 - 10 km      | R$ 15,00     |
| 11 - 20 km     | R$ 25,00     |
| 21 - 50 km     | R$ 50,00     |
| > 50 km        | Sob Consulta |

- **Exibição Automática:**
    - Distância calculada (ex: `12.5 km`)
    - Preço correspondente (ex: `R$ 25,00`)
- **Ações/Botões:**
    - `"Confirmar Pedido"`
    - `"Nova Consulta"`

---

### 4. Tela de Confirmação do Pedido

- **Resumo:**
    - Origem
    - Destino
    - Distância
    - Tempo estimado
    - Preço final
- **Ações:**
    - `"Confirmar"`
    - `"Cancelar"`

---

## Observações Técnicas

1. O cálculo de distância e tempo pode utilizar APIs externas de mapeamento como
   Google Maps, OpenStreetMap ou Mapbox.
2. O módulo administrativo deve permitir ao usuário administrador alterar as
   faixas de distância e seus respetivos valores na tabela de preços.
3. O sistema pode limitar-se a apenas exibir o valor final ou integrar
   diretamente com gateway de pagamento online.

---

## Segunda Fase: Novos Requisitos e Fluxos

A segunda fase foca em entregas de origem e destino com identificação ágil, gestão de preços e automação de pagamentos. A documentação técnica detalhada antecede o desenvolvimento do backend.

### 1. Gestão de Tabelas de Preço e Precificação
- O sistema deve suportar múltiplas tabelas de preço, variando conforme a forma de trabalho (ex: autônomo ou em grupos).
- Para evitar conflitos de cálculo, **apenas uma tabela de preço pode estar vigente por vez**.
- O frontend deve permitir que tanto o estabelecimento (PDV) quanto o motoboy acessem essas tabelas para garantir a conformidade nas transações.

### 2. Identificação Ágil no Balcão
- A identificação do motoboy no balcão deve ocorrer de forma ágil, com o intuito de confirmar a retirada do pacote.
- Métodos de identificação: Busca pelo número de celular ou leitura de um **Código QR exclusivo** (contendo CPF e informações de identificação única do entregador).

### 3. Confirmação da Coleta e Pagamento via PIX
- **Ação de Coleta:** O motoboy realiza a coleta do pacote e o estabelecimento confirma no sistema.
- **Integração PIX:** Ao confirmar a coleta, o sistema dispara uma requisição à API de pagamento PIX para gerar um QR Code e um código "Copia e Cola".
- **Notificação ao Cliente:** O link de pagamento PIX gerado é enviado automaticamente via **API do WhatsApp** para o cliente. A mesma mensagem incluirá o link do endereço de destino (ex.: link de rota do Google Maps).
  - *Exemplo de Mensagem WhatsApp:* "✅ Coleta confirmada! 💰 Valor: R$ 25,00. 🔗 Pagamento PIX: [link]. 📍 Destino: https://maps.google.com/?q=..."

### 4. Envio de Comprovante de Pagamento
- **Callback PIX:** O sistema aguarda o webhook/callback de sucesso da API de pagamento confirmando que a transação via PIX foi paga.
- **Geração de Comprovante:** Com o status "Pago", o sistema gera automaticamente o comprovante de pagamento em formato PDF ou imagem.
- **Envio Automático:** O sistema utiliza a API do WhatsApp Business para enviar a mensagem contendo o comprovante anexo ao cliente.

### 5. Cadastro, Monitoramento e Busca de Motoboys
- **Dados Cadastrais:** Cidade, bairro, estado e status atual (Online, Offline, Ocupado). Exigência de restrição de unicidade para os campos de e-mail e telefone.
- **Privacidade da Busca:** O motoboy terá um controle para permitir ou não a exibição pública de seus dados na busca do sistema.
- **Busca Geolocalizada (Mapa):** Os clientes poderão visualizar motoboys próximos através de um mapa interativo, pesquisando por nome ou placa. O sistema também é capaz de fazer busca geolocalizada por motoboys disponíveis próximos à origem da entrega.
- **Notificações Internas (Restrição Técnica):** As notificações enviadas aos motoboys (como novas solicitações) devem ocorrer via **sistema de notificações internas (pop-ups)** no aplicativo web do motoboy (conexão ponto a ponto). **Não** deve-se utilizar disparo de WhatsApp em massa ou para enviar localizações aos motoboys, com o objetivo de evitar banimentos e custos elevados.
- **Exemplo de Estrutura (Localização Mapa):**
  | Motoboy | Cidade | Bairro | Status | Última Localização |
  | :--- | :--- | :--- | :--- | :--- |
  | João | Belo Horizonte | Centro | Online | -19.920, -43.937 |
  | Pedro | Lagoa Santa | Várzea | Offline | -19.640, -43.890 |

### 6. Rastreamento e Status de Entrega
- **Atualização de Status (Ocupado):** Quando um motoboy aceitar e estiver na trajetória de uma entrega, o seu status deve ser alterado para `Ocupado`.
- **Acompanhamento da Entrega:** Criar um campo específico no ato do pedido para informar o número de telefone de quem irá acompanhar a trajetória da entrega (destino ou a pessoa que realizou o pedido).
