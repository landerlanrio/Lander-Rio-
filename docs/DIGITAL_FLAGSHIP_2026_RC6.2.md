# LANDER RIO — RC6.2 / Revisão com evidências

Data: 13/11/2026. Candidato: `digital-flagship-2026-rc6.2`.
Branch local: `fix/rc6-2-verified-quality`.
Base: `e27587eda04d3be187c3007051a3b43c9c70c26e` (RC6.1).
Estado: candidato para avaliação e deploy manual; não publicado em produção e sem push da branch.

## Resultado e correções

1. Mantida a remoção exclusiva das quatro logos da Hero — Landerlan, Topharma, Life Peptídeos e Oxygen KW Pharma. A galeria abaixo continua com as 14 identidades.
2. Corrigido o botão de contato do ROX. O estilo herdado deixava o texto claro sobre fundo lime. O contraste medido passou de **1,03:1** para **13,68:1**. A correção usa um seletor restrito e uma folha CSS versionada, evitando o cache imutável do arquivo antigo.
3. Corrigida a mensagem do botão geral “Fale com a equipe”. Ele encaminhava todos ao varejo; agora solicita atendimento sem escolher o perfil pelo visitante. Os CTAs específicos mantêm mensagens distintas.

## Critérios objetivos e resultados

| Critério | Limite ou expectativa | Resultado efetivamente observado |
| --- | --- | --- |
| Preservação da Hero e galeria | 0 logos na Hero, 14 na galeria | Aprovado nas cinco larguras |
| Responsividade | Sem rolagem horizontal em 320, 360, 390, 430 e 1280 px | Aprovado; scrollWidth igual à largura do viewport |
| CTAs da Hero | Ambos na primeira tela, área mínima de 44 × 44 px | Aprovado nas cinco dimensões; altura mínima de 48 px |
| Imagens da home | Nenhuma imagem quebrada após carregamento | 18 de 18 carregadas; 0 quebradas |
| Fotografia responsiva | Arquivo mobile até 430 px; desktop em 1280 px | Seleção AVIF correta observada |
| Interações | Menu, galeria, filtro, abas, busca e contexto dos links | 10 de 10 verificações aprovadas |
| Contraste do contato ROX | Pelo menos 4,5:1 | 13,68:1 após correção; antes 1,03:1 |
| Estrutura e preservação | Suíte existente sem regressões | 13 testes de estrutura aprovados |
| Código e protótipos | Suíte Node existente sem falhas | 138 testes aprovados; integrações externas simuladas |
| Integridade | Hashes e referências locais válidos | 243 hashes, 81 HTML e 3.424 referências aprovados |
| Rotas em servidor local | HTTP 200 nos caminhos selecionados | 15 de 15 rotas aprovadas |
| Pipeline completo | Nenhum grupo com código de saída de erro | 35 de 35 grupos aprovados |

Os 35 grupos incluem as suítes e as 30 verificações de sintaxe JavaScript; não são 35 testes adicionais independentes das contagens acima.

## Ambiente e escopo da evidência

Testes realizados em Chromium remoto, com a página dentro de um iframe responsivo no preview local da versão RC6.2. Dimensões: **320 × 667, 360 × 740, 390 × 844, 430 × 844 e 1280 × 844**. Isso verifica o layout nessas dimensões, mas não emula integralmente um iPhone, o Safari ou suas barras dinâmicas.

As capturas são reais do navegador: `HERO_320.jpg`, `HERO_360.jpg`, `HERO_390.jpg`, `HERO_430.jpg`, `HERO_1280.jpg`, `GALERIA_390.jpg` e `ROX_DEPOIS_390.jpg`. A pasta `before` preserva a captura e a falha anterior do ROX.

`layouts.json` registra a versão da página, dimensões, seleção das imagens e posições dos CTAs. `interactions.json` registra cada cenário. `images-loaded.json` registra as 18 imagens. `rox-contrast-after.json` contém as cores computadas e a razão de contraste. A pasta `pipeline` contém comandos, logs, resultados e horário de execução.

O preview é temporário e compartilhado entre trabalhos; depois das capturas sua raiz passou a servir outro candidato (`masterpiece-rc7`). Por isso este relatório não apresenta a URL local como preview externo da RC6.2. Os JSONs e screenshots identificam o candidato efetivamente testado. A outra versão não foi alterada nem avaliada por esta revisão.

## Acessibilidade: resultado parcial, sem certificação

Com o ROX aberto em 390 × 844, o axe-core 4.10.3 retornou **0 violações automáticas**, depois da correção. Permanecem **36 elementos com contraste inconclusivo** e **1 indicação ARIA inconclusiva**, que exigem avaliação manual. A homepage RC6.1 fechada havia retornado zero violações, mas a abertura do ROX revelou a falha de contraste; isso demonstra o limite de testar apenas o estado inicial.

Não foi concluída uma auditoria WCAG 2.2 AA integral, navegação completa por teclado ou teste com leitor de tela. A fonte de 10 px dos rótulos da Hero continua pequena e merece avaliação de legibilidade com usuários. O banner de consentimento de primeira visita não estava presente na sessão de capturas; a combinação banner + Hero não foi homologada.

## Pendências que esta revisão não resolve

- Validar em Safari/iPhone físico, incluindo zoom de texto, teclado virtual, safe areas e consentimento na primeira visita.
- Medir LCP, INP e CLS com dados de campo; medir desempenho em rede móvel e aparelho comum. **Não foram medidos Lighthouse, Core Web Vitals reais ou conversão comercial nesta revisão.**
- Completar as páginas individuais de marcas com conteúdo verificado. Alpha X Prime, Quimfa e Eminence Labs ainda levam ao diretório geral. Não há um catálogo validado de produtos de cada marca.
- Revisar editorial e enquadramento legal antes de introduzir ofertas de produtos regulados. Nenhuma oferta nova foi adicionada.
- ROX continua sendo demonstração local, sem IA externa; gravações de CRM e gateways de eventos permanecem simulados/desativados conforme o projeto.
- Os destinos e mensagens do WhatsApp foram inspecionados, sem envio de mensagens. Isso não comprova conversa iniciada, entrega de mensagem ou venda.

## Versão e uso do pacote

O ZIP SITE contém o site estático completo, com `index.html` na raiz. O arquivo PREVIEW HTML oferece uma visão portátil da home; outras páginas abrem o site público atual, como informado no próprio arquivo. Ele não substitui o preview do site completo.

O pacote EVIDÊNCIAS contém as capturas e os resultados brutos desta revisão. O arquivo CHECKSUMS identifica os arquivos exportados e o teste de CRC/comparação dos bytes. O harness temporário de testes e o axe-core não integram o site de produção.

Próxima ação: avaliar este candidato e concluir os testes de dispositivo e conteúdo pendentes antes de aprovar a publicação. Não se declara excelência absoluta, conformidade integral ou funcionamento de integrações não testadas em ambiente real.
