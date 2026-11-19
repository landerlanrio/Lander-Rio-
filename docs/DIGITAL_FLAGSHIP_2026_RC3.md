# LANDER RIO — Digital Flagship 2026 RC3

Atualização isolada de 13/11/2026 sobre a RC2. Não publicada.

## Resultado

Os 12 arquivos selecionados pelo usuário representam 14 marcas. Todos foram integrados à galeria da homepage; Landerlan, Topharma, Life Peptídeos e Oxygen aparecem também na Hero. A grade mobile passou a duas colunas para ampliar o reconhecimento. As superfícies em titânio usam CSS e preservam as cores dos arquivos. Busca, links informativos, interação por toque e movimento reduzido permanecem disponíveis. ROX aparece a partir das ferramentas, evitando cobrir marcas e entradas comerciais, inclusive no retorno ao topo.

Os arquivos PNG com transparência mantêm o canal alpha. O fundo branco original da imagem Landerlan foi preservado em uma superfície branca. Quimfa, Éticos e Indufar são apresentados separadamente por viewports SVG e máscara elíptica, a partir do único arquivo composto original; sem reconstrução de lettering ou geração por IA. Os arquivos WebP de entrega somam 734.444 bytes. A origem e os hashes constam de LOGOS_RC3_ASSETS.json.

As duas fotografias da Hero fornecidas pelo usuário e as outras 80 páginas foram preservadas. O diretório continua informativo: não foi introduzido catálogo de medicamentos, alegação de vínculo oficial ou disponibilidade de produtos.

## Evidências

- Chromium: larguras CSS de 320, 360, 390, 430, 768, 1280 e 1440 px, altura 844 px. Sem overflow horizontal, imagens quebradas ou alvos interativos menores que 24 px na verificação executada.
- Atacado/varejo e os quatro logos da Hero visíveis antes de 844 px nos viewports testados. Em telas mais baixas, a página permite rolagem normal.
- Filtro de marcas: Éticos, Quimfa e Indufar retornaram uma correspondência cada; os três recortes foram inspecionados visualmente.
- Capturas reais da Hero mobile, desktop e seção de marcas mobile.
- Testes de regressão e integridade em docs/evidence/digital-flagship-2026-rc3. Não foram enviados formulários nem mensagens externas.

## Entrega e pendências

Branch: design/digital-flagship-2026-rc3. O ZIP SITE contém o site completo para deploy manual. O HTML PREVIEW contém a homepage portátil, com navegação por seções; links para outras páginas abrem a versão atual de landerrio.com.br. Para executar o site completo localmente, extrair o ZIP e servir a pasta com `python3 -m http.server 8080`.

Não foi gerado novo endereço público. O preview de desenvolvimento usa o ambiente local gerenciado. Publicação em produção depende de aprovação explícita.

As pendências anteriores permanecem: homologação em Safari/iPhone físico, métricas reais de Core Web Vitals, revisão científica/editorial da enciclopédia e validação ponta a ponta das integrações externas. ROX permanece demonstrativo/local; IA externa e gravação real no CRM não foram ativadas. Não foram verificadas novas alegações comerciais ou autorizações documentais de terceiros nesta atualização.
