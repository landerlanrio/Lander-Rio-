# LANDER RIO — Digital Flagship 2026 RC1

Versão: `digital-flagship-2026-rc1`. Branch isolada: `design/digital-flagship-2026-rc1`.
Estado: pronta para avaliação visual e técnica; **não publicada e ainda não liberada para produção**.

## Base recuperada e preservação

Base escolhida: `LANDER_RIO_TITAN_RC2_FONTE.zip`, recuperada em 13/11/2026. A RC2 acrescentava a revisão comercial ao commit de integração `8b5a77458fb12b1f3c0e0b83207885d500dbf51e` de `landerlanrio/Lander-Rio-`.

O `main` remoto não continha o site completo, apenas arquivos de recuperação/importação. A branch de integração e o pacote RC2 eram a base funcional. O deploy público inspecionado era `6af28cd36c8c0ece64548aca`, de 10/11/2026, anterior à RC2. Nenhum deploy de produção foi feito nesta operação.

Foram preservadas 81 páginas HTML, 78 URLs no sitemap, redirects, headers, ferramentas, enciclopédia, conteúdo editorial e os protótipos existentes. A nova direção foi aplicada à homepage; páginas internas mantêm a implementação anterior. Não se afirma que todas receberam redesign.

## Direção escolhida

Entre Cinematic Monolith, Luxury Editorial e Spatial Performance, a composição final usa Monolith na Hero, contraste editorial nos caminhos comerciais e profundidade CSS no diretório e no livro da enciclopédia. Prioriza-se a clareza no celular; efeitos de ponteiro são opcionais em telas com capacidade adequada. Nenhuma biblioteca gráfica foi instalada.

Hero com PERFORMANCE IS CULTURE., quatro logos e duas entradas comerciais; 14 marcas no diretório; relacionamento; treino e dieta; enciclopédia; editorial; mensagem contextual; FAQ e ROX local. Menu, busca e filtros possuem estados acessíveis. Motion reduzido, conexão lenta e ausência de JavaScript têm fallback.

## Executar e conferir

Na raiz do código-fonte, com Python 3: `python3 scripts/preview_local.py`. Abrir o endereço impresso. Para regressão: `python3 scripts/validate_titan.py --out ../flagship-validation`, com Node.js 24 disponível. A validação não regenera manifestos nem escreve em integrações externas.

O pacote SITE contém a pasta de publicação com `index.html` na raiz, incluindo `_headers` e `_redirects`. No repositório, o Netlify mantém `publish = "site"`. Não trocar a origem de produção para esta branch sem aprovação. O manifesto da nova versão é aditivo; os manifestos históricos da base RC2 permanecem intactos.

O preview local não reproduz os proxies `/api` do Netlify. Cadastro real e entrega ao CRM devem ser homologados em ambiente separado autorizado. Nunca simular confirmação de cadastro no frontend.

## Testes executados

- 138 testes Node aprovados, incluindo ROX, transporte opcional desativado, Revenue Intelligence, metadados e cinco novos testes de privacidade/eventos.
- 10 contratos da homepage aprovados; três testes de integridade/metadados aprovados.
- 81 páginas e 3.436 referências HTML verificadas; 188 arquivos com hashes SHA-256 conferidos.
- 15 rotas HTTP locais com resposta 200; sintaxe de 29 arquivos JavaScript aprovada.
- Browser Chromium: 320, 360, 390, 430, 768, 1280 e 1440 px sem overflow horizontal; imagens e dimensões verificadas. Simulação por viewport CSS, não iPhone físico.
- Home e sete páginas internas abertas; menu, Escape, busca, busca vazia, filtro de marcas, mensagem por perfil e ROX local verificados.
- Registro estruturado em `DIGITAL_FLAGSHIP_BROWSER_QA.json`. Logs automatizados em `evidence/digital-flagship-2026-rc1/`.

Sem score Lighthouse inventado. LCP, INP e CLS de campo não foram medidos. Leituras de uma iframe redimensionada foram descartadas como inadequadas. Safari em iPhone e auditoria integral WCAG 2.2 AA permanecem pendentes.

## Integrações e limites

| Sistema | Evidência observada | Estado nesta versão |
|---|---|---|
| GitHub | Repositório e branch de integração acessíveis | Alterações somente na branch isolada |
| Netlify | Projeto público e projetos de preview existentes consultados | Sem upload pelo conector; navegador exige login; produção preservada |
| Supabase | Projeto ativo; nutrition-entry, workout-entry e whatsapp-webhook ativos | Redirects e contratos preservados; sem teste de gravação real |
| HubSpot | Conta acessível; onboarding informado como incompleto | Sem novos contatos, negócios ou mensagens; cadeia ponta a ponta não comprovada |
| WhatsApp | Número 5521920043538 recuperado da implementação atual | Links e textos validados; conta/conversa/venda não testadas |
| PostHog | Transporte público existente com consentimento | Eventos novos testados em mocks; preview não envia telemetria remota; leitura de projeto limitada por permissão |
| OpenSEO | Projeto LANDER RIO localizado | SEO existente preservado; nenhuma auditoria paga iniciada |
| ROX | Motor local existente e testes disponíveis | Demonstração offline; IA externa e gateways opcionais continuam desativados |
| MagicPath | Conta atingiu quota 50/50 | Nenhuma contratação; implementação realizada no código recuperado |
| Canva / Drive | Guia visual e documento de automação recuperados | Referências consultadas; documentos não comprovam integração comercial operante |

Eventos adicionados: `hero_view`, `wholesale_selected`, `retail_selected`, `brand_interaction`. Preservados `whatsapp_open_click` e eventos de ferramentas. Todos dependem de consentimento. Nome da marca, consulta digitada, cidade e conteúdo de conversa não são enviados aos eventos. Clique não é conversa; conversa não é venda.

## Pendências antes de produção

1. **Fotografia e marcas:** a imagem da Hero foi recuperada do v25 e é uma ilustração gerada anteriormente, não uma foto documental autorizada. Os logos são arquivos recuperados e preservados, sem recriação. Confirmar autorização e fornecer os originais oficiais quando houver divergência. Esta ressalva impede afirmar cumprimento integral do briefing fotográfico.
2. **Catálogo permitido:** não existe lista de SKUs com aptidão legal comprovada no material recuperado. Nenhum catálogo regulado novo, preço de medicamento, carrinho ou compra por marca foi introduzido. Logos são referências informativas; essa classificação não substitui revisão jurídica da composição final.
3. **Preview externo e integrações reais:** login do Netlify para disponibilizar esta versão no projeto separado protegido; homologação de cadastro/CRM com dados de teste autorizados; permissões de leitura do PostHog.
4. **Safari, acessibilidade e desempenho:** teste em iPhone real e medição independente de performance/acessibilidade antes da liberação. A implementação reduz movimento e tem melhorias de foco/contraste, mas não possui certificação WCAG integral.
5. **Conteúdo científico:** a enciclopédia preservada é a implementação v1 da base; o Atlas 2.0 não foi integrado nesta rodada. Revisão científica externa continua necessária antes de publicação.
6. **Aprovação explícita do responsável** para qualquer deploy no domínio público.

Referências consultadas para delimitar a divulgação comercial, sem usar domínios governamentais: [CFF, publicidade de medicamentos](https://site.cff.org.br/noticia/Noticias-gerais/17/07/2026/farmaceuticos-devem-acompanhar-o-conteudo-publicado-pelas-farmacias-onde-atuam) e [CRF-SP, texto da RDC 96](https://portal.crfsp.org.br/crfsp.org.br/legislacao-/113-juridico/legislacao/1007-resolucao-rdc-no-96-de-17-de-dezembro-de-2008.html). Não constituem aprovação específica dos produtos ou deste site.
