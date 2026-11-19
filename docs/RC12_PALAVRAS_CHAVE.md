# LANDER RIO — Palavras-chave implementadas na RC12

Preparada e validada em 14/11/2026. Estado: candidata pronta, não publicada.

## Aplicação por página

| Página | Foco da página | Título implementado |
| --- | --- | --- |
| `/` | LANDER RIO; acesso aos conteúdos e ferramentas | LANDER RIO &#124; Atacado, Varejo e Performance Culture |
| `/treino/` | ficha de treino grátis | Ficha de treino grátis de musculação &#124; LANDER RIO |
| `/dieta/` | planejador alimentar gratuito | Planejador alimentar gratuito &#124; LANDER RIO |
| `/ferramentas/` | ferramentas de treino e alimentação | Ferramentas de treino e alimentação grátis &#124; LANDER RIO |
| `/conteudos/` | guias de treino e alimentação | Guias de treino e alimentação &#124; LANDER RIO |
| `/conteudos/diario-de-treino-como-registrar/` | diário de treino | Diário de treino: como registrar cargas &#124; LANDER RIO |
| `/conteudos/planejar-compras-refeicoes-semana/` | lista de compras da semana | Lista de compras da semana: como planejar &#124; LANDER RIO |
| `/conteudos/como-ler-ficha-treino/` | como ler uma ficha de treino | Como ler uma ficha de treino de musculação &#124; LANDER RIO |

O título da página inicial foi preservado; nela foram atualizados a descrição e os textos de acesso às ferramentas. Nas demais páginas, o termo principal foi incorporado ao título e à apresentação do conteúdo. Open Graph, Twitter Cards e os dados estruturados pertinentes foram alinhados ao texto visível. As ferramentas informam que o cadastro é necessário para o resultado completo.

Os termos foram escolhidos pela correspondência entre a intenção de busca e o que cada página realmente oferece. Não foram atribuídos volumes de pesquisa ou previsões de posição a esses termos. Não foi criada uma tag `meta keywords` nem um bloco de repetições ocultas.

## Critérios objetivos e evidências

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Um título e uma descrição por página; coerência com metadados sociais | Aprovado nas oito páginas | `evidence/rc12/preservation.json` |
| URLs canônicas, robots, destinos dos links e contratos de formulários preservados | Aprovado nas oito páginas | `evidence/rc12/preservation.json` |
| Integridade, estrutura, regressões, HTTP local e sintaxe | 44/44 blocos aprovados | `evidence/rc12/validation/validation.json` |
| Testes de comportamento JavaScript existentes | 144/144 aprovados, incluídos na rotina acima | `evidence/rc12/validation/node-tests.log` |
| Layout, imagens, erros JavaScript e fluxos no navegador | 133/133 verificações aprovadas | `evidence/rc12/browser/browser-results.json` |
| Cobertura responsiva das páginas modificadas | Oito páginas em 320, 390, 768 e 1440 pixels: 32 combinações | `evidence/rc12/browser/browser-results.json` |
| Acessibilidade automatizada | Nenhuma violação detectada em 12 análises; oito itens inconclusivos | `evidence/rc12/browser/browser-results.json` |
| Preservação visual | 119 arquivos de CSS, imagens e fontes idênticos à RC11 | `evidence/rc12/preservation.json` |

As 133 verificações não são 133 páginas. Os 144 testes JavaScript fazem parte dos 44 blocos, portanto não devem ser apresentados como cobertura independente adicional. As análises de acessibilidade automatizadas não certificam conformidade integral.

## Defeito encontrado e corrigido

O primeiro teste encontrou transbordamento horizontal de três pixels no título de `/conteudos/`, em 320 pixels. O cabeçalho foi ajustado para “GUIAS DE TREINO / E NUTRIÇÃO.”; a descrição e o título SEO mantêm “treino e alimentação”. A nova rodada passou. O resultado inicial foi preservado em `browser-results-first.json` para comparação com o resultado final.

## Limites e publicação

A validação visual foi feita em Chromium com larguras de viewport controladas, não em um iPhone físico. Cadastros e respostas externas foram simulados; não houve gravação de leads nem confirmação de entrega em produção. Os testes validam a implementação e a ausência dos defeitos cobertos, não uma melhora já obtida no Google.

O pacote incorpora a RC11. A RC10 permanecia ao vivo no deploy `6af804d36034a689af84dddf` na consulta realizada nesta tarefa. A RC12 não foi publicada nem submetida para reindexação. Antes de publicar, é necessária a autorização para substituir a versão de produção e consumir créditos da Netlify. Após a publicação, conferir os arquivos no domínio e acompanhar as consultas e páginas no Search Console.

## Referências de implementação

- [Fundamentos da Pesquisa Google](https://developers.google.com/search/docs/essentials)
- [Títulos dos resultados de pesquisa](https://developers.google.com/search/docs/appearance/title-link)
- [Descrições e snippets](https://developers.google.com/search/docs/appearance/snippet)

O mapa JSON e o patch registram as mudanças exatas. Para publicar, usar o ZIP `LANDER_RIO_RC12_SITE_DEPLOY.zip`; o pacote completo também contém o código-fonte e estas evidências.
