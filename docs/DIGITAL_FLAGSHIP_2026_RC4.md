# LANDER RIO — Digital Flagship 2026 RC4

Revisão de qualidade de 13/11/2026 sobre a RC3. **Concluída para avaliação em preview; não homologada para publicação em produção.**

## Resultado e versão

Versão `digital-flagship-2026-rc4`, branch isolada `quality/digital-flagship-2026-rc4`. Base remota RC3: `54cec1876a89e0ff7ae40c9042bcfce0d851d8e6`. A identificação do commit final acompanha a entrega em `VERSION_RC4.json`.

A homepage mantém as duas fotografias escolhidas pelo usuário, as entradas de atacado e varejo, quatro marcas na Hero e 14 no diretório. As ferramentas aparecem depois do comercial. A arquitetura estática existente e as outras 80 páginas HTML foram preservadas; os estilos compartilhados da enciclopédia receberam correções de acessibilidade. Nenhuma ação de publicação, envio de mensagens ou gravação em CRM foi executada.

## Defeitos encontrados e corrigidos

| Encontrado | Correção | Evidência |
| --- | --- | --- |
| Texto comercial pequeno e rótulos difíceis de ler no celular | Parágrafos principais em 14 px; rótulos dos CTAs em 11 px; campos em 16 px; notas auxiliares em 11–12 px | Estilos computados em `axe-final.json` e capturas 360/390/430 |
| Quatro logos da Hero somavam 233.070 bytes | Variantes WebP proporcionais, 61.158 bytes no total: redução de 73,8%. Arquivos maiores permanecem na galeria | `QUALITY_RC4_ASSETS.json` |
| Link de retorno em 35 verbetes com contraste 1,17:1 | Cor escura sobre off-white, contraste calculado 8,93:1, alvo de 44 px | Auditoria antes/depois e CSS compartilhado |
| Breadcrumbs dos mesmos 35 verbetes dependiam apenas da cor | Sublinhado permanente | Zero ocorrências da regra `link-in-text-block` na auditoria final |
| Palavra decorativa do rodapé com baixo contraste | Contraste calculado passou a 4,31:1, acima da referência de 3:1 para texto grande | Auditoria e cálculo no `summary.json`; elemento decorativo não foi tratado como prova de violação normativa |
| Setas decorativas apareciam como glifos ausentes | SVGs leves nos dois blocos comerciais e no título de contato | Captura real do bloco comercial após correção |
| Algumas ações secundárias pequenas | Links destacados ampliados; foco visível, área de toque e espaçamento refinados | Geometria e revisão por teclado |

Não houve recriação de logotipos ou retoque facial. Os dois JPEGs originais continuam byte a byte idênticos aos arquivos enviados. AVIF/WebP são versões de entrega. As marcas seguem informativas: não foi acrescentado catálogo de medicamentos, alegação de parceria ou disponibilidade de produtos.

## Critérios e testes efetivamente realizados

Os critérios foram definidos em `QUALITY_RC4_CRITERIA.md` antes da rodada de correções. Resultados completos em `docs/evidence/digital-flagship-2026-rc4/`.

| Critério | Resultado verificado | Limite da conclusão |
| --- | --- | --- |
| Responsividade | Homepage em 320, 360, 390, 430, 768, 1280 e 1440 px; também 320×667, 430×740 e 768×390. Sem overflow horizontal ou imagens quebradas | Chromium em viewports CSS, não aparelhos físicos |
| Jornadas principais | Atacado, varejo, treino, dieta, enciclopédia, conteúdos e marcas em 360 e 430 px, sem overflow ou imagens quebradas | Formulários externos não foram enviados |
| Clareza da Hero | Dois CTAs com 80 px de altura no mobile; em 360/390/430 px, terminam em 514/530/550 px. Quatro logos e seus nomes visíveis em altura 844 px | Em telas mais baixas, rolagem natural é necessária para ver toda a Hero |
| Toque | Nenhum alvo visível menor que 24 px na homepage auditada; ações comerciais ≥44 px | Referências bibliográficas inline do treino permanecem pequenas, dentro do texto; não são botões. Links isolados da enciclopédia foram ampliados |
| Teclado e busca | Menu abre, recebe foco, faz retorno por Shift+Tab e fecha com Escape; busca por “dieta” retorna um caminho, fecha e devolve foco ao botão | Teste manual no Chromium; leitor de tela não homologado |
| Marcas | Busca por “cooper” retorna uma marca na galeria; termo inexistente mostra estado vazio; quatro logos da Hero não participam do filtro | Não verifica autorizações documentais de terceiros |
| WhatsApp | Número existente preservado; mensagens de atacado/varejo distintas; seleção atacado + envio atualiza corretamente o texto e o link | Validação de endereço e comportamento local. Não comprova recebimento, conversa ou venda |
| Sem JavaScript | Seis links do menu e os dois CTAs continuam visíveis e navegáveis em iframe com execução de scripts desabilitada | Busca e personalização dinâmica são ocultadas; as ferramentas dependem de scripts |
| Movimento | Guards para `prefers-reduced-motion`, conexão lenta e menor capacidade preservados; CSS reduz transições e rolagem suave | Verificação de código e contratos; preferência do sistema em iPhone não testada |
| Auditoria automática | axe-core 4.10.3, tags WCAG 2/2.1/2.2 A/AA, 81 rotas únicas, zero violações detectadas e zero erros na rodada final | Há verificações inconclusivas em 40 páginas, sobretudo contraste sobre fundos complexos. Não equivale a certificação WCAG integral |
| Regressão | 34 grupos aprovados: 138 testes Node, 12 contratos da homepage, 3 testes de integridade, 15 rotas HTTP e sintaxe de 29 JS | Parte dos testes de integração usa mocks; não valida serviços reais ponta a ponta |
| Preservação | 210 arquivos verificados por SHA-256, 81 páginas, 3.436 referências HTML locais, 78 URLs de sitemap, zero falhas ou avisos do verificador | SEO preservado tecnicamente; indexação e ranking não são garantidos |
| Preview exportado | HTML com mídias incorporadas abriu; 20 imagens sem falha observada; busca funcional | Homepage portátil. Links para outras páginas abrem o site público atual, como informa o aviso |

Referência de acessibilidade: https://www.w3.org/TR/WCAG22/ . A revisão visual examinou Hero, comercial, marcas, ferramentas, enciclopédia e desktop. O defeito de glifo foi identificado nas capturas, corrigido e recapturado. Não se atribuiu nota estética absoluta ou prêmio presumido.

## Carregamento e estabilidade

| Orçamento ou medição | Resultado |
| --- | --- |
| Hero mobile AVIF / WebP ≤120 kB cada | 65.922 / 103.906 bytes — aprovado |
| Hero desktop AVIF / WebP ≤120 kB cada | 57.059 / 89.410 bytes — aprovado |
| Quatro logos da Hero ≤100 kB | 61.158 bytes — aprovado |
| Código inicial HTML/CSS/JS ≤150 kB gzip combinado | 36.752 bytes — aprovado; soma de compressões locais, não tráfego medido |
| CLS local ≤0,1 | 0,00796 em três recargas — aprovado no ambiente descrito |
| LCP local observado | 136, 160 e 188 ms, cache aquecido, sem limitação de rede ou CPU |

O harness oculta a scrollbar após o carregamento, o que também afeta sua geometria. Uma leitura de CLS 1,008 durante alternância do sandbox sem JavaScript foi descartada por mistura de cenários; as três recargas independentes e suas entradas brutas foram preservadas. Não foram medidos INP de campo, Lighthouse mobile ou Core Web Vitals de usuários reais. Os números locais não demonstram cumprimento da meta de LCP em 4G.

## Entregas e execução

- `SITE.zip`: site estático completo; `index.html` na raiz, assets, redirects e cabeçalhos. CRC e comparação byte a byte verificados pelo exportador; hashes no arquivo `CHECKSUMS.json`.
- `PREVIEW.html`: homepage portátil navegável, com aviso de escopo. Não é um deploy externo.
- `EVIDENCIAS.zip`: capturas reais, critérios, resultados antes/depois, testes e proveniência de assets.
- Código-fonte na branch isolada acima. O harness e o axe não fazem parte do pacote de publicação.

Para executar o site completo localmente: extraia o ZIP, abra um terminal nessa pasta, execute `python3 -m http.server 8080` e acesse `http://localhost:8080`. Os aliases sem extensão são normalizados pelas regras do Netlify; um servidor simples pode exigir `/privacidade.html` e `/termos.html`.

Não foi criado endereço público novo. A conexão Netlify disponível nesta sessão não expõe envio de um deploy de rascunho; o preview de desenvolvimento ficou no ambiente local gerenciado. O pacote manual atende à alternativa autorizada pelo usuário.

## Pendências para publicação

1. Homologar Safari/iPhone físico, teclado/zoom e leitor de tela; completar os pontos de contraste que o axe classificou como inconclusivos.
2. Medir carregamento em smartphone/rede móvel e, depois da publicação aprovada, Core Web Vitals reais. Não há pontuação Lighthouse inventada.
3. Revisão científica/editorial externa da enciclopédia. Conteúdo clínico não foi revalidado neste ciclo de interface.
4. Homologar integrações externas com dados de teste autorizados. ROX segue local/demonstrativo; IA externa, gravação real no CRM e gateway comercial não foram ativados.
5. Aprovação explícita do usuário para qualquer publicação em produção. Nenhum deploy automático foi solicitado por esta operação.

Próxima ação executiva: avaliar a RC4 em preview e as capturas. A versão está identificada e exportável; sua publicação continua separada da aprovação desta revisão técnica.
