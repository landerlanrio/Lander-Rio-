# LANDER RIO — RC6.3: fundos das logos e páginas por marca

Candidato: `digital-flagship-2026-rc6.3`  
Branch local: `fix/rc6-3-brand-profiles`  
Base preservada: RC6.2, commit `0946e7edb44698cd277df725eaa287b3e9df6995`.  
Data: 13/11/2026. **Não publicado em produção.**

## Correção da entrega do preview — 13/11/2026

O usuário demonstrou que o HTML com `iframe/srcdoc` abria apenas o cabeçalho no visualizador do iPhone. Essa evidência substitui qualquer expectativa de compatibilidade do arquivo anterior com o aplicativo. A causa exata no visualizador não foi isolada; o carregamento dependia de scripts e de um documento interno.

O preview navegável agora é uma cópia privada hospedada em <https://lander-rio-rc63-avaliacao.igorziturjpa1992.chatgpt.site>, com 16 páginas normais: início, diretório e 14 marcas. Publicação privada confirmada como `succeeded`, acesso apenas do proprietário, analytics desativado. O domínio landerrio.com.br e o ZIP SITE não foram modificados.

O arquivo `PREVIEW.html` foi substituído por uma entrada estática com links nativos e duas capturas reais incorporadas. Não contém JavaScript, iframe ou carregamento tardio obrigatório. Seis verificações do HTML exportado passaram: ausência de scripts/quadros, conteúdo imediato, origem privada correta, 14 rotas distintas, duas imagens JPEG incorporadas e informação de acesso/escopo.

Limite de validação: o navegador remoto confirmou a tela de login do endereço privado, mas não dispõe de sessão autenticada do proprietário. A navegação autenticada e a nova abertura no iPhone real ainda não foram verificadas. Os testes das páginas RC6.3 abaixo continuam válidos para o conteúdo, que foi preservado.

## Resultado

As 14 logomarcas têm a mesma superfície branca (#ffffff) na galeria, no diretório e nos perfis. Onze imagens já continham fundo branco; três tinham transparência. A solução foi uniformizar o fundo da interface, sem alterar nenhum byte das imagens, suas cores ou proporções. O brilho colorido sobre a superfície das logos foi removido.

Cada marca abre sua própria página com identidade visual, apresentação específica, linhas, produtos documentados, referências e navegação de retorno. Alpha X Prime, Quimfa e Eminence Labs deixaram de apontar para o diretório genérico. O diretório foi reconstruído com os mesmos 14 destinos. Todas as 81 páginas anteriores permanecem no pacote; três rotas novas totalizam 84.

Há 67 referências de produtos em 12 marcas. São seleções dos catálogos publicados, não inventário completo, disponibilidade, recomendação de uso ou oferta. Não foram acrescentados preços, carrinho, dosagens de uso ou contato de compra por produto.

## Critérios e evidências

| Critério objetivo | Resultado observado |
|---|---|
| 14 destinos próprios e título correspondente | 14/14 cliques reais no navegador passaram |
| Fundo uniforme em todas as logos | Somente `rgb(255, 255, 255)` nas superfícies inspecionadas |
| Responsividade em 320, 360, 390, 430 e 1280 px | 80 combinações: home + diretório + 14 perfis; sem transbordamento ou imagens quebradas |
| Diretório após ajuste final de espaçamento | Revalidado nas cinco larguras |
| Acessibilidade automatizada | Axe 4.10.3: 0 violações nas 15 páginas da área de marcas, em 390 px |
| Revisão do item não concluído automaticamente pelo axe | Seta decorativa, `aria-hidden=true`: contraste calculado 14.56:1 entre as cores observadas |
| Integridade das logos | Hashes originais RC5 preservados |
| Regressões funcionais da home | 10/10 verificações: menu, galeria, filtro, busca, abas e contextos de WhatsApp |
| Pipeline local | 36/36 grupos aprovados; 138 testes Node, 13 estruturais, 7 de marcas, 3 de integridade/metadados |
| Respostas HTTP locais | 30/30 rotas com resposta 200 e conteúdo |
| Integridade e SEO | 247 arquivos verificados por SHA-256; 3.393 referências locais; 81 URLs no sitemap; nenhum erro reportado |
| Preview anterior — registro histórico | 16 documentos incorporados e navegação testada no Chromium; substituído após falha de abertura demonstrada no iPhone |

O roteador anterior teve seis testes unitários com DOM simulado. Eles não demonstraram compatibilidade com o visualizador do iPhone; a arquitetura foi substituída conforme a correção registrada acima.

O axe não comprova conformidade integral WCAG. A avaliação ocorreu em Chromium com dimensões controladas, sem emulação de iOS. Não foi executado teste em Safari real; não há afirmação de Lighthouse, INP ou Core Web Vitals de campo.

## Defeitos encontrados e corrigidos

1. Três logos transparentes apareciam sobre base escura enquanto as demais tinham fundo branco: todas agora usam superfície branca.
2. Três marcas abriam o diretório genérico: os 14 links foram associados a páginas próprias.
3. As páginas antigas repetiam texto genérico sem apresentar portfólio: foram substituídas por perfis específicos e referências atribuídas.
4. O título novo do diretório excedeu a tela entre 320 e 430 px: escala tipográfica corrigida e revalidada.
5. A seta diagonal apareceu como quadrado em um primeiro render: substituída por SVG.
6. O primeiro gerador não incluiu as três rotas novas no sitemap por causa do prefixo XML `ns0`: correção aplicada e coberta por teste.
7. O teste inicial marcou a imagem responsiva da Hero como ausente durante troca de largura: o verificador passou a aguardar a decodificação antes de medir. A repetição não encontrou imagens quebradas.

8. A checagem adicional do preview portátil revelou que âncoras como “Explorar produtos” podiam navegar para o documento externo em vez de rolar o perfil. O exportador agora cancela essa navegação e resolve a âncora no documento incorporado. A correção passou nos seis testes unitários. Não foi possível repetir essa última correção no navegador: o preview compartilhado estava ocupado por outra tarefa e a política do navegador não permite URLs `file:`. A falha era exclusiva do arquivo portátil; as páginas do pacote SITE já foram testadas no navegador.

## Cobertura editorial

| Marca | Rota | Referências de produtos | Estado |
|---|---|---:|---|
| Cooper Pharma | /marcas/cooper-pharma/ | 6 | Exemplos com fontes |
| ZPHC | /marcas/zphc/ | 0 | Catálogo pendente |
| Landerlan | /marcas/landerlan/ | 8 | Exemplos com fontes |
| Oxygen KW Pharma | /marcas/oxygen-kw-pharma/ | 6 | Exemplos com fontes |
| Alpha X Prime | /marcas/alpha-x-prime/ | 0 | Catálogo pendente |
| Quimfa | /marcas/quimfa/ | 6 | Exemplos com fontes |
| Éticos | /marcas/eticos/ | 5 | Exemplos com fontes |
| Indufar | /marcas/indufar/ | 2 | Exemplos com fontes |
| Life Peptídeos | /marcas/life-peptideos/ | 7 | Exemplos com fontes |
| Eminence Labs | /marcas/eminence-labs/ | 8 | Exemplos com fontes |
| Topharma | /marcas/topharma/ | 8 | Exemplos com fontes |
| Muscle Labs India | /marcas/muscle-labs-india/ | 4 | Exemplos com fontes |
| Synedica | /marcas/synedica/ | 5 | Autoria pública divergente; atribuição explícita |
| Geniqs Pharma | /marcas/geniqs-pharma/ | 2 | Exemplos com fontes |

As referências e o vínculo de cada produto à sua fonte estão em `BRAND_PROFILES_RC6.3.json` e nas próprias páginas. Não foram reproduzidas alegações promocionais de pureza, eficácia, certificação ou aprovação sanitária como fatos independentes.

## Pendências concretas

- **Alpha X Prime:** falta o catálogo original e uma apresentação institucional confirmada. A página preserva a identidade e declara a limitação; não a confunde com Alpha Laboratory/Alpha Pharma.
- **ZPHC:** o site institucional atual não confirma o portfólio farmacêutico associado ao nome. O catálogo permanece pendente de documentação identificada.
- **Synedica:** fontes públicas apresentam reivindicações divergentes de identidade. Os itens são atribuídos ao catálogo citado e identificados como referências para pesquisa; a autoria do fabricante não foi confirmada independentemente.
- Os 67 itens são exemplos documentados, não a totalidade dos portfólios.
- Publicação em landerrio.com.br depende de aprovação explícita da versão. Foi criada apenas uma cópia privada para avaliação; nenhum envio comercial ou escrita em CRM foi feito.

## Arquivos para avaliação e deploy

- `*_SITE.zip`: conteúdo estático completo, com `index.html` na raiz; usar este arquivo para deploy manual.
- `*_PREVIEW.html`: entrada estática com capturas e links para a cópia privada navegável. Requer internet e acesso pela conta do proprietário. As demais seções fora da home e de marcas abrem o site público atual.
- `*_FONTE.zip`: código-fonte do commit identificado em `*_VERSION.json`, incluindo gerador e testes.
- `*_EVIDENCIAS.zip`: relatórios brutos, logs e capturas reais.
- `*_CHECKSUMS.json`: tamanhos, hashes e comparação byte a byte do pacote.

Para executar o pacote completo localmente, extraia o SITE.zip e rode `python3 -m http.server 4173` nessa pasta; abra `http://localhost:4173/`. As capturas do HTML de entrada estão incorporadas, mas a navegação ocorre no endereço privado online.

O endereço local de QA foi remapeado por outra tarefa. A cópia privada agora hospedada é independente desse servidor. Seu registro verificável está em `PRIVATE_REVIEW_RC6.3.json`.

## Evidência visual

Capturas reais: `LANDER_RIO_RC6_3_MARCAS_390.jpg`, `LANDER_RIO_RC6_3_DIRETORIO_390.jpg`, `LANDER_RIO_RC6_3_LANDERLAN_390.jpg`, `LANDER_RIO_RC6_3_PRODUTOS_390.jpg` e `LANDER_RIO_RC6_3_LANDERLAN_DESKTOP.jpg`. Não são mockups.
