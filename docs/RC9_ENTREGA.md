# LANDER RIO — RC9

Versão: `digital-flagship-2026-rc9` · validação: 14/11/2026 UTC.

## Resultado

Evolução da RC8, preservando a fotografia aprovada, URLs, conteúdo existente, endpoints e 14 arquivos de logotipos. Não houve publicação em `landerrio.com.br` nesta execução.

- Hero com CTAs de áreas equivalentes, prioridade comercial e texto de atendimento mais claro.
- Atendimento explicado em três passos, sem inventar prazo, frete ou política comercial.
- Busca de marcas visível, incluindo nomes de linhas; diretório antes do destaque editorial.
- Logotipos proporcionais em superfícies brancas uniformes. Nenhuma alteração nos arquivos originais das 14 marcas.
- Páginas individuais com mapa de linhas e referências de produtos agrupadas; navegação permanece informativa.
- Cabeçalho, assinatura e menu consistentes; menu nativo funciona sem JavaScript e fecha com Escape quando JavaScript está disponível.
- Novas páginas `/equipe/` e `/politica-editorial/`, com responsabilidade institucional e limites da revisão médica explícitos.
- ROX apresentado como guia de navegação, sem alegar atendimento por IA que não esteja ativo.
- Fontes WOFF2: 255.844 bytes contra 654.436 bytes dos TTF, redução de aproximadamente 60,9% no conjunto utilizado.
- Corrigidos o estouro de título em telas pequenas, a seta sem glifo, os nomes acessíveis e o contraste do trecho central da Hero.
- Coleta de LCP, CLS e INP implementada com `web-vitals` 5.3.0, hospedado localmente. Eventos `web_vital` seguem para o transporte PostHog existente somente com consentimento; páginas sensíveis continuam excluídas. Não são enviados texto digitado, atribuição ao elemento interagido nem dados de saúde.

## Preview e publicação

Preview privado: https://lander-rio-rc63-avaliacao.igorziturjpa1992.chatgpt.site

O endereço mantém o nome histórico RC63; o conteúdo publicado nesse preview é RC9. Exige entrar na conta ChatGPT proprietária. A navegação e os assets são hospedados como site completo, sem depender de um HTML anexado com iframe externo.

Deploy privado confirmado como `succeeded`, em 14/11/2026 às 01:20:34 UTC.

- Projeto de avaliação: `appgprj_6af7970e796081919b43c280a424d719`
- Commit do preview: `728889d6c0573b2c427806a28a0d55d49f0e4074`
- Versão hospedada: `appgprj_6af7970e796081919b43c280a424d719~appgver_facd158d18308191917dfffd4a8c06c3`
- Deploy privado: `appgdep_6af7b751b2148191b8f99b270bad50c6`

O preview desativa analytics e bloqueia indexação. As ferramentas de treino, dieta e Radar abrem a versão pública existente para preservar seus serviços. O ZIP de deploy contém o site real, não esses atalhos de avaliação.

## Critérios e evidências

| Critério | Evidência obtida | Resultado |
|---|---|---|
| Layout sem rolagem horizontal, imagens quebradas ou logos distorcidos | 28 rotas × 320, 360, 390, 430, 768 e 1280 px | 168 casos aprovados |
| Logos em superfície branca e `object-fit: contain` | Verificação em todos os casos aplicáveis da matriz | Aprovado |
| Links de marcas corretos | Cliques a partir da Home e do hub para as 14 marcas | 28 destinos corretos |
| Jornada funcional | Busca sem acento, filtro, estado vazio, FAQ, menu, CTAs e hierarquia | 40 verificações aprovadas |
| Acessibilidade automatizada | axe-core 4.10.3, tags WCAG A/AA, 28 rotas em 390 e 1280 px | 56 avaliações, zero violações detectadas |
| Código e integrações simuladas | Suite Node | 142 testes aprovados |
| Estrutura, perfis e SEO | Suites Python | 13 + 7 + 7 + 3 testes aprovados |
| Integridade e sintaxe | Manifesto e 34 arquivos JavaScript | Aprovado |
| Rotas HTTP | Smoke test em loopback | 30 rotas aprovadas |
| Sem JavaScript | 14 links de marcas e abertura do menu nativo | Verificado |
| SEO técnico | 87 HTML, 45 URLs no sitemap, canonicals, metadados e ligações internas | Contratos automatizados aprovados |

Os testes de rotas são locais, em Chromium. As larguras são viewports de teste, não aparelhos físicos. Zero violações de axe não equivale a certificação integral WCAG. Os resultados de layout incluem observações de CLS no iframe que não servem como medição de Core Web Vitals: o próprio teste troca larguras e navega entre páginas.

Arquivos brutos em `docs/evidence/rc9/validation/` e `docs/evidence/rc9/browser/`. Capturas reais incluem Home mobile, Home desktop, diretório e produtos Landerlan. As capturas mobile finais mostram também a moldura do laboratório de teste; ela não integra o site.

## Desempenho medido no site público — RC8

Auditoria OpenSEO/Lighthouse iniciada em 14/11/2026 às 01:08:17 UTC. Estes resultados são da RC8 publicada, e não da RC9 ainda isolada.

| Página / dispositivo | Performance | Acessibilidade | Boas práticas | SEO | LCP | CLS |
|---|---:|---:|---:|---:|---:|---:|
| Home / mobile | 99 | 100 | 100 | 100 | 1,591 s | 0 |
| Home / desktop | 100 | 97 | 100 | 100 | 0,406 s | 0,00172 |
| Autenticidade / mobile | 100 | 100 | 100 | 100 | 1,173 s | 0 |

Relatório: https://app.openseo.so/p/cc40f4de-9c11-47c9-be5b-dcb4387db222/audit?auditId=a9c348f6-b0a7-4b09-a187-b85a283faf58

Houve três execuções concluídas e treze bloqueadas por `INSUFFICIENT_CREDITS`. Não houve compra de créditos. Os problemas de contraste e nome acessível apontados na Home desktop foram corrigidos na RC9 e submetidos novamente ao axe.

O diagnóstico também indicou economia potencial com variantes menores de imagens e CSS bloqueante. Não foi atribuída pontuação Lighthouse à RC9 a partir da pontuação da RC8.

## Métricas reais: o que foi resolvido

A instrumentação já está implementada e coberta por testes de consentimento, revogação, validação numérica, inicialização única e exclusão de páginas sensíveis. O evento contém nome da métrica, valor, classificação, classe de dispositivo e versão, sem chamar um clique de conversa ou venda.

Depois da publicação, é necessário verificar o recebimento no PostHog e acumular navegações reais para calcular distribuições e percentis. O preview privado não envia eventos e não deve contaminar os dados de produção. A verificação ponta a ponta de ingestão da RC9 ainda não ocorreu porque a versão pública não foi alterada.

Os testes de interação no navegador remoto apresentaram atraso de pintura elevado no desktop. Para investigar, foi criada uma página mínima de controle, com apenas texto e menu nativo. Ela também apresentou aproximadamente 528–792 ms entre entrada e apresentação, com processamento inferior a 1 ms. Isso demonstra interferência do ambiente de teste; não demonstra que o INP do site é bom. As amostras locais e o controle estão anexados como diagnóstico. A amostra mobile de 64 ms não foi tratada como métrica de usuários reais nem como aprovação geral de INP.

## Defeitos identificados e corrigidos

1. `/equipe/` excedia a largura em 320/360 px. Corrigido com quebra de palavras e hifenização; a matriz final passou.
2. A seta do mapa de linhas podia aparecer como glifo ausente. Substituída por desenho CSS.
3. Rótulos acessíveis não incluíam todo o texto visível em links. Corrigidos no cabeçalho e cards da Home.
4. Texto apenas contornado da Hero gerava falha de contraste. Aplicado preenchimento off-white.
5. Fontes maiores do que necessário. Disponibilizadas em WOFF2 e mantidos os originais como recuperação.
6. Ausência de instrumentação de Web Vitals no candidato. Adicionada com consentimento e testes.

## Pendências delimitadas

- Aprovação para publicar RC9 no domínio oficial. Nenhuma alteração de produção foi executada.
- Safari/iPhone físico e tecnologias assistivas não estavam disponíveis para teste direto. Validar toque, menu, orientação, zoom e leitura na homologação.
- Confirmar ingestão dos novos eventos após publicar e medir percentis reais. Dados futuros não podem ser fabricados por uma execução de laboratório.
- Fotografias autorizadas das embalagens não foram localizadas. Os produtos continuam com referências textuais verificadas; não foram criadas imagens fictícias.
- Revisão profissional independente de conteúdo médico e documentação de identidades ainda incompletas. As 39 rotas previamente retidas permanecem fora do sitemap e com noindex; não foram liberadas por esta alteração visual.
- Nenhum formulário real foi enviado, nenhuma conversa WhatsApp foi iniciada e nenhuma escrita real em CRM foi executada. Backend preservado e testado em mocks; não se afirma nova homologação ponta a ponta desses serviços.

## Entrega e recuperação

Branch: `feat/rc9-navigation-editorial`.

Ponto de recuperação RC8: `8d88d3beaeee87629510807832b7496b47a39c88`.

O arquivo `LANDER_RIO_RC9_VERSION.json` identifica o commit completo entregue e os hashes dos pacotes ficam em `LANDER_RIO_RC9_CHECKSUMS.json`.

`LANDER_RIO_RC9_SITE.zip` contém o diretório publicável. O pacote estático não recompila nem configura funções de backend; para atualizar funções Netlify, usar o projeto-fonte e o fluxo de build existente. Não substitua configurações ou variáveis de ambiente por valores novos durante o deploy.

Próxima ação: revisar o preview, aprovar a publicação da RC9 e então validar URLs públicas, endpoints preservados e recepção dos eventos. Não há nota absoluta de qualidade atribuída; há resultados verificáveis e limites registrados.
