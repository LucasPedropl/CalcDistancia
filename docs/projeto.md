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
