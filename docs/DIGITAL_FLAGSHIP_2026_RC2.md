# LANDER RIO — Digital Flagship 2026 RC2

Atualização de 13/11/2026 sobre a RC1. Status: preview validado; não publicada.

As duas imagens selecionadas pelo usuário foram aplicadas à Hero: retrato 864×1536 até 600 px e horizontal 1536×864 acima disso. Os JPEGs permanecem byte a byte iguais aos anexos, com versões AVIF/WebP para carregamento. Sem retoque facial, distorção, geração de conteúdo ou recorte destrutivo. O enquadramento usa CSS proporcional.

O título mobile foi posicionado abaixo do olhar. Atacado, varejo e os quatro logos continuam na primeira tela dos viewports testados (altura de 844 px). A altura desktop se adapta ao viewport para preservar a presença comercial. O launcher do ROX aparece após sair da Hero para não cobrir logos; retorno verificado no navegador.

A indicação anterior de imagem provisória da Hero fica substituída por imagens fornecidas e escolhidas pelo usuário. Isso registra a origem do material, sem afirmar comprovação documental externa de sua produção.

## Validação

- 320, 360, 390, 430, 768, 1280 e 1440 px: sem overflow horizontal e sem imagens quebradas; arquivo correto selecionado em cada breakpoint.
- JPEGs originais: comparação binária com os dois anexos aprovada. Hashes e dimensões em HERO_RC2_ASSETS.json.
- No mobile: botões e logos visíveis antes de 844 px; leitura do olhar preservada visualmente.
- Preservadas as demais 80 páginas, menus, ferramentas e conteúdo.
- Regressão executada com scripts/validate_titan.py. Logs desta versão entregues no pacote de evidências.
- Testes por Chromium e viewport CSS; não equivalem a teste em iPhone/Safari físico ou medição de Core Web Vitals em produção.

## Publicação

Branch isolada: design/digital-flagship-2026-rc2. Pacote atual: LANDER_RIO_FLAGSHIP_2026_RC2_SITE.zip.
O preview HTML portátil contém a homepage; links internos abrem as páginas atuais do domínio. O ZIP contém o site completo.

Nenhum deploy foi executado. As demais pendências de homologação da RC1 continuam registradas em DIGITAL_FLAGSHIP_2026_RC1.md; esta atualização resolve a seleção das imagens da Hero, não reabre nem declara concluídas integrações externas.
