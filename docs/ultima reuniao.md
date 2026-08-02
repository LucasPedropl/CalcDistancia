jul. 29, 2026 Reunião em 29 de jul. de 2026 às 13:40 GMT-03:00 Registros da
reunião Transcrição

Resumo Revisão técnica de entregas e sistema de condomínios define prioridades
operacionais e requisitos de segurança.

Otimização do Ponto Venda Implementação do campo de numeração no endereço
melhora a precisão na localização de destinos. Indicadores visuais e campos de
busca otimizam a gestão de entregadores ativos.

Integração e Segurança Autenticação de entregadores e remoção de recursos
obsoletos garantem confiabilidade operacional. Estabelecimento de critérios
rigorosos protege o cadastro de condomínios na plataforma.

Modelo Condomínios e Pendências Estrutura de precificação segmentada viabiliza a
futura gestão de acessos. Resolução de dependências técnicas com terceiros é
exigida para avançar o cronograma.

Próximas etapas [Pedro Lucas] Corrigir sistema: Realizar correções no sistema
incluindo a melhoria do preenchimento de endereços, ajustes nos filtros de raio
e validação da disponibilidade dos motoboys. [Pedro Lucas] Contatar Bruno:
Enviar mensagem para o colaborador Bruno com as orientações discutidas na
reunião e solicitar um feedback atualizado sobre o status técnico do projeto.
[Pedro Lucas] Analisar integração condomínios: Modelar a futura funcionalidade
voltada para condomínios focando nos requisitos de segurança e na lógica de
integração para a terceira fase do projeto.

Detalhes Configuração de endereço e Ponto de Venda: Pedro Lucas e Marcelo
Henrique discutiram a necessidade de permitir a inclusão do número do endereço
na interface do Ponto de Venda, visto que o sistema atual, conforme notado
durante o teste de uma busca na Rua Dona Quita, 231, não processa corretamente a
localização sem o endereço completo (00:00:55). Pedro Lucas orientou Marcelo
Henrique a verificar as configurações para habilitar o campo de numeração,
facilitando assim a localização precisa do destino e a correta funcionalidade da
busca por CEP (00:02:41). Status e disponibilidade dos motoboys: Foi abordada a
gestão da disponibilidade dos entregadores, com Pedro Lucas esclarecendo que o
sistema oculta automaticamente motoboys ocupados de mapas e listas (00:04:08).
Marcelo Henrique enfatizou a importância de cautela nesse processo, sugerindo
que o sistema deveria contar com um mecanismo, similar ao Uber, para o motoboy
finalizar a viagem, já que o cliente nem sempre confirma o recebimento do
pedido, o que pode gerar incerteza sobre a disponibilidade real do entregador
(00:05:52). Filtros e indicadores visuais: Marcelo Henrique solicitou atenção ao
modelar o front-end para que existam indicadores visuais, como a cor amarela,
para sinalizar motoboys que podem estar ocupados ou que precisam de verificação
(00:07:11). Além disso, foi identificada a necessidade de incluir um campo de
busca na lista de motoboys, permitindo encontrar entregadores por nome ou
telefone, dada a possibilidade de a lista ser extensa (00:08:45). Cálculo de
distância e fluxo de solicitação: Discussão sobre o fluxo de solicitação de
entregas, onde o pedido é lançado e o motoboy que aceitar primeiro é o
responsável pela entrega. Marcelo Henrique sugeriu implementar um filtro de
pré-seleção por cidade ou bairro para agilizar a busca e destacou que,
futuramente, os motoboys deverão ter a capacidade de filtrar as solicitações por
distância (ex: apenas entregas dentro de um raio de 5 km) para adequar o perfil
de trabalho à sua preferência regional (00:10:45). Comunicação e integração de
pedidos: O sistema deve integrar o envio de solicitações via WhatsApp e API,
sendo necessário que o motoboy realize o aceite da corrida para que o processo
seja concretizado. Pedro Lucas confirmou que, durante os testes, o uso de perfis
de motoboy falsos impede a conclusão do aceite no sistema, e Marcelo Henrique
solicitou as correções necessárias para garantir que o fluxo de acompanhamento
funcione adequadamente (00:12:21). Validação de identidade do motoboy: Foi
debatida a funcionalidade de validação da identidade do entregador para
assegurar que este pertence à rede Web Motors. Pedro Lucas mencionou que o QR
code presente na interface é um recurso antigo, destinado originalmente à
conexão com WhatsApp, e que será removido; em seu lugar, Marcelo Henrique
sugeriu uma implementação futura que utilize a câmera para verificar a
identidade do motoboy diretamente no estabelecimento, caso ele não seja
reconhecido pelo sistema (00:14:04). Desenvolvimento da integração com
condomínios: Marcelo Henrique apresentou uma visão de alto nível para uma
terceira fase do projeto, focada em atender condomínios (00:15:58). O objetivo é
que o destinatário (morador) receba o motoboy através de um sistema onde o
condomínio tenha um painel próprio para visualizar e autorizar a entrada do
entregador, integrando o remetente, o motoboy e o morador, além de fornecer
visibilidade sobre quem autorizou o acesso, eliminando a necessidade de
processos manuais de portaria (00:19:02). Critérios de segurança para
condomínios: Pedro Lucas levantou preocupações sobre a necessidade de validações
rigorosas para o cadastro de condomínios no sistema, evitando que qualquer
pessoa se cadastre indevidamente (00:26:20). Marcelo Henrique concordou que a
segurança é o ponto essencial e que será necessário estabelecer critérios, como
a exigência de contratos, regimentos internos e documentação do síndico, para
garantir que apenas condomínios legítimos utilizem a plataforma (00:27:49).
Modelo de negócio e precificação: Foi proposta uma estrutura de cobrança para a
funcionalidade de condomínios, estimada em R$ 99 para o condomínio, R$ 49 para o
estabelecimento (Ponto de Venda) e R$ 39 para o motoboy (00:27:49). Marcelo
Henrique argumentou que o valor para o condomínio se justifica pelo controle,
histórico de auditoria, registro de placas de motos e pela melhoria na gestão de
segurança das entregas (00:29:39). Bloqueios técnicos e dependências: Pedro
Lucas relatou problemas técnicos com o funcionamento do WhatsApp e o login no
sistema administrativo (00:31:47). Marcelo Henrique expressou frustração com a
dependência excessiva da equipe de Bruno e solicitou que Pedro Lucas obtenha um
feedback direto de Bruno sobre o status de desenvolvimento e as razões para os
atrasos ou problemas relatados (00:29:39).

Revise as anotações do Gemini para checar se estão corretas. Confira dicas e
saiba como o Gemini faz anotações Como está a qualidade de destas observações?
Responda a uma breve pesquisa para nos dar seu feedback, incluindo o quanto as
observações foram úteis para o que você precisa.
