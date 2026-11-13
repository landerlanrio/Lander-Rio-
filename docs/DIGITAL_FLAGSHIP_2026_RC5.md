# LANDER RIO — Digital Flagship 2026 RC5

Versão de 13/11/2026 para **deploy manual**, com as 14 novas logos escolhidas pelo usuário. Produção não foi alterada. Base: RC4, commit remoto `09f924aaeec31aade9b0b02292315f92eba3c6ea`. Branch isolada: `release/digital-flagship-2026-rc5`. O commit final acompanha a entrega em `VERSION_RC5.json`.

## Alterações

Landerlan, Topharma, Life Peptídeos, Oxygen KW Pharma, Cooper Pharma, ZPHC, Muscle Labs India, Synedica, Éticos, Indufar, Geniqs Pharma, Alpha X Prime, Quimfa e Eminence Labs usam os arquivos mais recentes recebidos. Éticos, Indufar e Quimfa agora têm imagens individuais; o recorte SVG da montagem antiga foi removido.

As cores, o enquadramento completo, os fundos e a transparência das artes foram mantidos. Houve apenas redução proporcional e codificação WebP, sem redesenho, remoção de fundo ou retoque. Superfícies brancas integram os JPEGs sem retângulos de tom diferente. Os acabamentos, foco e interações existentes foram preservados.

As duas fotografias da Hero, as entradas atacado/varejo, as demais 80 páginas, ferramentas, SEO e configurações existentes permanecem preservados. Não houve envio de mensagens, submissão de formulários externos ou gravação real em CRM.

## Critérios e evidências desta revisão

| Critério | Resultado efetivamente verificado |
| --- | --- |
| 14 logos corretas e carregadas | 14/14 na galeria e 4/4 na Hero; conferência visual no navegador e hashes/dimensões em `LOGOS_RC5_ASSETS.json` |
| Proporções, cores e integridade | Canvas preservado, sem cortes; dimensões explícitas e `object-fit: contain`; 18 arquivos WebP fixados por SHA-256 |
| Hero abaixo de 100 kB em logos | 66.576 bytes nas quatro imagens; galeria completa 485.942 bytes com carregamento diferido |
| Mobile e desktop | 360, 390, 430 e 1280 px, altura 844 px, no Chromium; zero overflow horizontal, imagens quebradas ou alvos visíveis menores que 24 px |
| Visibilidade comercial | CTAs e quatro logos permanecem na primeira tela mobile de 844 px; rolagem natural em alturas menores |
| Busca por marca | “Quimfa” retorna exatamente uma marca; limpeza do campo restaura as 14 |
| Acessibilidade automática da homepage | axe-core 4.10.3: zero violações detectadas; três categorias inconclusivas requerem revisão humana. Não equivale a certificação WCAG |
| Regressão | 34 grupos aprovados: 138 testes Node, 13 contratos da homepage, 3 testes de integridade, 15 rotas HTTP e sintaxe de 29 arquivos JS |
| Integridade do site | 81 páginas, 228 arquivos fixados por hash, 3.436 referências HTML locais e 78 URLs de sitemap; zero falhas ou avisos |
| Pacote manual | Exportador verifica CRC e igualdade byte a byte com a pasta do site; `index.html` na raiz; nenhum arquivo de auditoria temporário no ZIP |

Os resultados brutos estão em `docs/evidence/digital-flagship-2026-rc5/` e no pacote de evidências. As capturas mostram o navegador real, com controles do ambiente de revisão ao redor do viewport. A auditoria ampla da RC4 permanece documentada separadamente; não é apresentada como nova medição da RC5.

## Arquivos para uso

- `LANDER_RIO_FLAGSHIP_2026_RC5_SITE.zip`: site completo para deploy manual estático, com assets, `_headers`, `_redirects` e configuração Netlify.
- `LANDER_RIO_FLAGSHIP_2026_RC5_PREVIEW.html`: homepage portátil, com imagens incorporadas. Links para outras páginas abrem o site público atual; não é um preview externo do site inteiro.
- `LANDER_RIO_FLAGSHIP_2026_RC5_EVIDENCIAS.zip`: testes, capturas e proveniência das imagens.
- `VERSION_RC5.json` e `CHECKSUMS.json`: identificação exata e hashes dos arquivos entregues.

Para deploy manual no Netlify, extraia `SITE.zip` e envie a pasta que contém `index.html`. Para testar localmente o site inteiro, execute `python3 -m http.server 8080` nessa pasta e abra `http://localhost:8080`. Aliases sem extensão dependem dos redirects do Netlify.

## Limites e pendências preservadas

Não foi criado um endereço público novo. Não houve medição de Lighthouse, Core Web Vitals de campo ou teste em Safari/iPhone físico nesta revisão. As capturas em Chromium não substituem essa homologação.

ROX continua demonstrativo/local. IA externa, gravação real em CRM e gateway comercial não foram ativados. A revisão científica/editorial externa da enciclopédia continua pendente. A atualização das logos não altera essas condições.

O pacote está tecnicamente verificado para entrega e deploy manual, sem declaração de excelência absoluta. Publicação em produção permanece uma decisão explícita do usuário.
