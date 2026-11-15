# Prioridades para crescer no Google — Nov 14, 2026

LANDER RIO — PERFORMANCE CULTURE · Auditoria e implementação RC13 · 14/11/2026, America/Sao_Paulo.

## A. Diagnóstico real

**Produção confirmada: RC10. Candidata de revisão: RC13. Nenhuma publicação realizada nesta missão.**

Search Console autenticado, Busca Web, dados finais de 15/10 a 11/11/2026: **67 cliques, 1,208 impressões, CTR 5.55% e posição média aproximada 7.4**. A posição foi ponderada por impressões a partir das médias diárias arredondadas; não é colocação atual fixa. Brasil: 65 cliques/1.176 impressões; mobile: 48/943. Rio de Janeiro não foi isolado nos dados disponíveis.

A comparação já salva da janela anterior registra 21 cliques e 452 impressões. A diferença antecede RC13 e não demonstra efeito desta implementação. As 27 linhas por página usam outra agregação; não foram somadas para apresentar o total do site. As 77 consultas visíveis somam 21 cliques: não representam todas as buscas, e ausência de um termo não prova ausência de demanda.

| Página | Cliques | Impressões | CTR | Posição média histórica |
|---|---:|---:|---:|---:|
| / | 23 | 169 | 13.61% | 8.5 |
| /marcas/life-peptideos/ | 15 | 155 | 9.68% | 4.8 |
| /marcas/muscle-labs-india/ | 7 | 146 | 4.79% | 8.7 |
| /marcas/cooper-pharma/ | 5 | 194 | 2.58% | 9.4 |
| /marcas/landerlan-gold/ | 5 | 201 | 2.49% | 3.4 |
| /marcas/geniqs-pharma/ | 4 | 91 | 4.40% | 3.2 |
| /marcas/landerlan/ | 3 | 82 | 3.66% | 7.3 |
| /atacado/ | 2 | 16 | 12.50% | 15 |
| /contato/ | 1 | 28 | 3.57% | 7.2 |
| /marcas/oxygen-kw-pharma/ | 1 | 28 | 3.57% | 14.6 |
| /marcas/zphc/ | 1 | 78 | 1.28% | 9.1 |
| /perguntas-frequentes/ | 1 | 17 | 5.88% | 5.4 |

Cooper Pharma e Landerlan Gold têm CTR relativamente baixo na amostra, mas não existe aqui um benchmark por consulta/dispositivo que comprove CTR abaixo do potencial. Homônimos, mistura de consultas e exclusões editoriais impedem tratar todo volume de marca como oportunidade comercial.

**Indexação: 7 de 10 URLs inspecionadas retornaram PASS; não é o total de páginas indexadas do site.** /treino/: Google não reconhece a URL. /dieta/ e o guia de compras: detectadas, não indexadas. O hub de ferramentas, o hub editorial, o diário e quatro marcas retornaram indexação. ZPHC permanece com noindex intencional no HTML; o resultado do índice é anterior a essa exclusão. Não removemos restrições em massa.

A leitura HTTP cobriu 93 caminhos (88 páginas e 5 arquivos de infraestrutura), todos com resposta 200, sem defeitos básicos de título/H1/canonical detectados pelo extrator. Isso não equivale a rastrear cada recurso, validar todas as alegações médicas ou testar páginas inexistentes. Robots e sitemap foram preservados. O sitemap publicado contém 46 URLs; as ferramentas já tinham links HTML e não eram órfãs. A inspeção do Google consulta o índice existente, sem novo teste ao vivo.

O rastreamento OpenSEO existente cobriu 50 páginas e deixou 33 fora do limite. As tentativas Lighthouse retornaram métricas nulas por falta de créditos. Não existe aprovação de Core Web Vitals nesta auditoria. Leitura de schema do PostHog expirou: nenhum total atual foi presumido. GA4 respondeu, mas a consulta de 06–13/11 veio sem linhas: lacuna de medição a investigar, não prova de zero visitas.

## B. Estratégia vencedora

**Melhorar os recursos existentes que resolvem tarefas, conectá-los por intenção e medir a descoberta no Search Console.** É a escolha mais viável para os ativos e recursos atuais, não uma alegação de superioridade universal. Há ferramentas prontas e dois guias que podiam entregar um modelo real. A implementação adiciona utilidade verificável a URLs estáveis, custa menos que abrir dezenas de frentes e não depende de comprar mídia, links ou ferramentas.

| Frente | Impacto provável | Esforço / custo adicional | Risco | Decisão |
|---|---|---|---|---|
| Modelos, exemplos e links nas ferramentas | Nova entrada orgânica e uso recorrente; ganho não quantificado | Baixo a médio / sem contratação | Baixo; conteúdo de organização | Executada na RC13 |
| Preservar páginas de marcas já visíveis | Protege presença observada | Baixo | Saúde, homônimos e confiança | Mantidas; sem ampliar promoção de medicamentos |
| Títulos de páginas com CTR baixo | Possível ganho; falta segmentação comparável | Baixo | Mudar título errado pode prejudicar | Revisão baseada em consulta antes de alterar |
| Conteúdo amplo de hipertrofia e nutrição | Mercado relevante; sem demanda quantificada nesta coleta | Alto; exige autoria e revisão | YMYL e concorrência | Mapeado, não publicado |
| SEO programático em massa | Ganho não demonstrado | Alto custo de QA | Duplicidade e conteúdo sem valor | Rejeitado |
| Digital PR editorial | Referências e descoberta possíveis | Relacionamento e distribuição | Baixo se legítimo | Ativos preparados; nenhum contato enviado |
| Compra de backlinks / páginas por bairro | Benefício não comprovado | Gasto e manutenção | Manipulação e páginas de entrada | Rejeitado |
| Trocar domínio / redesenhar todo o site | Sem problema que justifique | Alto | Perda de continuidade | Rejeitado |

As fontes abaixo orientam decisões, com graus de evidência diferentes. Nenhuma demonstra que esta candidata produzirá um percentual específico de crescimento.

| Fonte primária | Evidência e limite | Aplicação na LANDER RIO |
|---|---|---|
| [Google Search Central](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) | Diretriz oficial: valor próprio, confiabilidade, autoria e foco no usuário. Não promete posição. | Aplicar nos exemplos e fontes; não criar credenciais, datas ou volume artificiais. |
| [Tim Soulo / Ahrefs](https://ahrefs.com/blog/keyword-difficulty/) | Explica limites do KD, que não cobre sozinho intenção e capacidade competitiva. Método, não experimento causal para este site. | Escolher intenção e utilidade; marcar KD não disponível sem estimativa inventada. |
| [Brian Dean / Backlinko](https://backlinko.com/skyscraper-technique?version=published) | Caso publicado relata +110% de tráfego em 14 dias; experimento histórico de 2013, página atualizada em 2024, sem controle causal. | Aproveitar ativo útil e referências editoriais. Rejeitar promessas universais e conteúdo apenas mais longo. |
| [Aleyda Solis](https://www.aleydasolis.com/en/ai-search/content-prioritization-ai-search/) | Framework de agosto de 2026 considera valor de negócio, vantagem própria, esforço e capacidade de gerar visitas. Evidência direcional; não prova para Brasil/fitness. | Priorizar ferramentas que exigem uso, em vez de só respostas genéricas facilmente substituídas. |
| [Lily Ray](https://lilyray.nyc/e-a-t-expertise-authoritativeness-trustworthiness/) | Síntese e análises observacionais sobre confiança e temas de saúde. Não estabelece uma nota pública de E-E-A-T. | Autoria institucional transparente; revisão clínica independente só se realmente realizada. |
| [Kevin Indig](https://www.growth-memo.com/p/seo-growth-loops) | A introdução pública relaciona crescimento orgânico, produto e mecanismos de distribuição. Parte do texto é restrita; não alegamos ter lido o estudo completo. | Recurso → uso → retorno e possível referência editorial é hipótese de produto; não resultado medido. |
| [Glenn Gabe](https://www.gsqi.com/marketing-blog/core-roars-back-google-may-2026-core-update-analysis/) | Análise de junho de 2026 traz observações da atualização de maio. Casos correlacionais não isolam causas. | Revisar qualidade e experiência como conjunto; não diagnosticar penalização por falta de indexação. |
| [Marie Haynes](https://www.mariehaynes.com/its-possible-your-migration-issues-may-be-due-to-site-quality/) | Artigo de outubro de 2026 propõe hipótese de qualidade em migrações; a autora explicita que não está comprovada. | Não aplicar diagnóstico de migração à LANDER RIO nem trocar domínio sem evidência. |
| [Semrush](https://www.semrush.com/blog/topic-clusters/) | Modelo editorial de clusters e links internos. Material de fornecedor; não ensaio independente que determine ganho. | Uma intenção por destino útil, sem duplicar páginas para variantes de palavras. |
| [Google: links rastreáveis](https://developers.google.com/search/docs/crawling-indexing/links-crawlable) | Documentação técnica sobre links HTML e âncoras descritivas. | Links reais entre hub, ferramentas e guias. |
| [Google: políticas de spam](https://developers.google.com/search/docs/essentials/spam-policies) | Regras contra manipulação de links, páginas de entrada e conteúdo escalado sem valor. | Sem compra de links, repetição artificial ou páginas por cidades sem diferencial. |

A descoberta exploratória de concorrentes encontrou [RepFit](https://www.repfit.io/ferramentas/montador-treino/), [TrainREC](https://trainrec.app/pt-br/tools/workout-log-template/) e [ManualFit](https://manualfit.com.br/ferramentas/lista-de-compras/). A comparação é de produto e conteúdo público, sem medição controlada da ordem do Google Brasil. Não copiamos texto, lógica ou estimativas desses sites. O artigo da [ACSM de março de 2026](https://acsm.org/resistance-training-guidelines-update-2026/) foi consultado para verificar a referência já presente no diário. Os exemplos novos são fictícios e organizacionais, sem prescrever cargas, porções ou dieta.

## C. Mapa de palavras-chave

P1: implementada nesta candidata. P2: preservar ou aprofundar com evidência. P3: expansão proposta, não implementada. Retida: exclusão editorial preservada. ND: dado indisponível; não significa zero. Potencial e competitividade qualitativos são julgamento editorial, não probabilidade ou dificuldade medida. Não há estimativas numéricas de ranking.

Volumes de marcas vêm do relatório autenticado de 13/11/2026, OpenSEO/DataForSEO, Brasil, português, referência agosto–outubro de 2026. São estimativas do fornecedor; não pessoas únicas, nem procura de novembro. Não somar variantes. Não foram feitas novas chamadas pagas.

| Prioridade / termos | Intenção | Volume mensal / KD | Potencial e concorrência | Destino / decisão | Evidência |
|---|---|---|---|---|---|
| P1 · diário de treino; planilha de treino grátis; registrar cargas e repetições | Modelo / execução | ND / ND | Uso recorrente e clique para ferramenta; vendas desconhecidas. Concorrência especializada observada; esforço viável | /conteudos/diario-de-treino-como-registrar/ · RC13: exemplo, CSV, metadados e links | Índice confirmado; TrainREC oferece CSV e impressão; sem volume comprovado |
| P1 · lista de compras semanal; modelo de lista de compras; planejar refeições da semana | Modelo / organização | ND / ND | Utilidade imediata; entrada para planejador; vendas desconhecidas. Sites utilitários observados; esforço viável | /conteudos/planejar-compras-refeicoes-semana/ · RC13: exemplo de estoque, CSV e links | Detectada não indexada; ManualFit tem gerador público |
| P1 · ficha de treino grátis; montar treino de academia; criador de treino gratuito | Usar ferramenta | ND / ND | Alto alinhamento ao produto; aquisição ainda não medida. Aplicativos especializados; posição não previsível | /treino/ · RC12 preservada + RC13: conteúdo público e links | Google não reconhece a URL na inspeção; RepFit entrega montador |
| P1 · planejador alimentar gratuito; organizar dieta; lista de compras do planejador | Usar ferramenta | ND / ND | Alto alinhamento ao produto; aquisição ainda não medida. Ferramentas e sites de saúde; posição não previsível | /dieta/ · RC12 preservada + RC13: exemplo de processo e links | Detectada não indexada; planejador já funcional |
| P1 · ferramentas de treino e alimentação grátis | Navegar por ferramentas | ND / ND | Distribuição interna e descoberta dos modelos. Sem dificuldade medida | /ferramentas/ · RC13: dois recursos úteis e breadcrumbs | Hub indexado; duas ferramentas existentes |
| P2 · como ler ficha de treino; séries e repetições na ficha | Entender a ficha | ND / ND | Apoio à ativação da ferramenta. Não quantificada; hipótese a validar | /conteudos/como-ler-ficha-treino/ · RC12 preservada; linkada pelo novo recurso | Página existente; intenção complementar ao montador |
| P2 · divisão de treino; organizar semana de treino | Organizar rotina | ND / ND | Apoio à rotina; não prometer uma divisão ideal. Não quantificada; hipótese a validar | /conteudos/como-organizar-semana-treino/ · Revisar escopo antes de ampliar | Página existente; tema-semente, sem demanda quantificada |
| P2 · RIR no treino; repetições em reserva | Entender esforço | ND / ND | Educação ligada à ferramenta. Não quantificada; hipótese a validar | /conteudos/rir-o-que-significa/ · Link contextual adicionado no diário | Guia existente; apoio ao registro |
| P2 · progressão de carga; acompanhar progresso no treino | Acompanhar execução | ND / ND | Retenção; demanda não quantificada. Não quantificada; hipótese a validar | /conteudos/acompanhar-progresso-treino/ · Manter distinta da intenção de baixar diário | Guia existente; termo-semente |
| P2 · descanso entre séries para hipertrofia | Informação | ND / ND | Educação; sem conversão demonstrada. Não quantificada; hipótese a validar | /conteudos/descanso-entre-series-hipertrofia/ · Revisão científica antes de expandir recomendações | Guia existente e fonte ACSM consultada |
| P2 · academia lotada; organizar treino na academia lotada | Resolver problema | ND / ND | Problema específico do público; potencial de referências. Não quantificada; hipótese a validar | /conteudos/academia-lotada-organizar-treino/ · Consolidar a página existente; não criar variações por cidade | 1 impressão / 0 cliques no relatório de páginas |
| P2 · alimento cru ou cozido; registrar peso dos alimentos | Evitar erro de registro | ND / ND | Apoia uso correto do planejador. Não quantificada; hipótese a validar | /conteudos/alimento-cru-cozido-registro/ · Preservar e relacionar à lista de compras | Guia existente, ligado à organização alimentar |
| P3 · como ganhar massa muscular; treino para hipertrofia; hipertrofia baseada em evidências | Educação ampla | ND / ND | Alta relevância temática; retorno incerto. Concorrência provavelmente alta — inferência editorial | Proposta: /conteudos/hipertrofia/ · Não criada; exige escopo original e revisão especializada | Temas-semente solicitados; demanda e SERP específicas não medidas |
| P3 · volume semanal de treino; quantas séries por músculo | Entender programação | ND / ND | Complemento ao cluster; risco de recomendação genérica. Sem KD ou ranking medido | Proposta: /conteudos/volume-semanal-treino/ · Não criada; revisão científica necessária | Tema-semente; demanda não quantificada |
| P3 · dieta para hipertrofia; nutrição esportiva | Educação nutricional | ND / ND | Relevante, depende de revisão profissional. Concorrência de saúde; sem KD medido | Proposta: /conteudos/nutricao-para-treino/ · Não criada; não vender dieta genérica como prescrição | Tema-semente; não é sinônimo de usar o planejador |
| P3 · quantidade diária de proteína; calculadora de proteínas | Estimativa / informação | ND / ND | Útil se metodologia e limites forem verificados. Marcas e especialistas observados; competitividade alta inferida | /dieta/ (módulo existente; avaliar aprofundamento) · Não criar calculadora duplicada; validar fórmula e UX antes | Busca exploratória encontrou Nestlé e sites de saúde |
| P3 · calculadora de calorias; déficit calórico; superávit calórico | Estimativa energética | ND / ND | Útil, exige explicação de incerteza e acompanhamento. Sem KD medido | /dieta/ (capacidade existente; conteúdo proposto) · Reaproveitar motor existente; não criar novas URLs por variantes | Não há volume confirmado; estimativas já presentes no produto |
| P3 · recomposição corporal | Educação | ND / ND | Alinhamento com público; retorno incerto. Saúde / nutrição; revisão necessária | Proposta: /conteudos/recomposicao-corporal/ · Não criada | Tema-semente sem demanda medida |
| P3 · biomecânica na musculação | Educação técnica | ND / ND | Autoridade se houver demonstração e autoria verificáveis. Sem KD medido | Proposta: /conteudos/biomecanica-musculacao/ · Não criada; precisa material original e revisão técnica | Tema-semente sem demanda medida |
| P3 · recuperação muscular; sono e desempenho | Educação | ND / ND | Relevância alta; conversão desconhecida. Saúde; não prometer tratamento | Proposta: /conteudos/sono-recuperacao/ · Não criada; revisão especializada necessária | Temas-semente; não confundir com descanso entre séries |
| P3 · saúde metabólica; longevidade | Educação de saúde | ND / ND | Adjacente; menor prioridade que utilidade de treino. YMYL; alta exigência de confiança | Sem nova URL aprovada · Adiar até autoria, escopo e evidência suficientes | Temas amplos, sem vantagem própria demonstrada |
| P2 · life peptideos; life peptídeos | Navegacional / informacional | ND / ND | Visibilidade já demonstrada; não equivale a venda permitida. Página já recebe impressões; ranking futuro desconhecido | /marcas/life-peptideos/ · Preservar informação e fontes; sem ampliar ofertas restritas | Consulta exata sem acento: 10 cliques / 87 impressões / posição média 4,9 |
| P2 · muscle labs india; musclelabsindia; muscle lab india | Navegacional / informacional | 320 (muscle labs india) / ND | Visibilidade demonstrada; qualificação comercial não verificada. Posição média histórica 8,7; não comprova página de resultados | /marcas/muscle-labs-india/ · Preservar; títulos devem identificar a entidade corretamente | Página: 7 cliques / 146 impressões / posição 8,7 |
| P2 · cooper pharma | Navegacional / pesquisa de marca | 4.400 / ND | CTR investigável; homônimos reduzem relevância do volume. Volume mistura entidades homônimas | /marcas/cooper-pharma/ · Precisão factual primeiro; não prometer incremento de CTR | Página: 5 / 194 / CTR 2,58% / posição 9,4 |
| P2 · geniqs pharma | Navegacional / informacional | ND / ND | Proteger presença já observada. Já aparece em posições altas na média; amostra pequena | /marcas/geniqs-pharma/ · Preservar; não alterar vencedora sem necessidade | Consulta: 3 / 54 / posição 2,7 |
| P2 · landerlan; linha landerlan | Navegacional / informacional | 40.500 (landerlan) / ND | Volume amplo; intenção local não confirmada. Termo de marca amplo; não presumir ganho fácil | /marcas/landerlan/ · Preservar; não misturar com LANDER RIO ou Gold | Consulta landerlan: 0 / 5 / posição média 40,2 |
| P2 · landerlan gold | Navegacional / linha de marca | ND / ND | CTR merece segmentação por consulta antes de editar. Não há benchmark de CTR comparável | /marcas/landerlan-gold/ · Manter URL; sem consolidação automática | Página: 5 / 201 / CTR 2,49% / posição 3,4 |
| P2 · oxygen kw pharma | Navegacional / informacional | 590 / ND | Possível melhoria factual; poucas impressões. Concorrência não medida | /marcas/oxygen-kw-pharma/ · Preservar e revisar fontes quando necessário | Página: 1 / 28 / posição 14,6 |
| Retida · zphc; site zphc | Navegacional / pesquisa de entidade | 8.100 (zphc) / ND | Não priorizar aquisição antes da liberação editorial. Volume não determina adequação de indexação | /marcas/zphc/ · Manter noindex; índice antigo não prova falha | Página: 1 / 78 / posição 9,1; noindex atual intencional |
| Retida · synedica | Navegacional / informacional | 9.900 / ND | Sem prioridade de aquisição agora. Sem dificuldade validada | /marcas/synedica/ · Manter noindex | Pesquisa de marcas anterior; noindex atual intencional |
| P2 · topharma | Navegacional / informacional | 260 / ND | Potencial informativo; comercial não validado. Sem KD medido | /marcas/topharma/ · Preservar página e fontes | Volume registrado no relatório de marcas |
| P2 · LANDER RIO Rio de Janeiro; LANDER RIO contato | Navegar / atendimento | ND / ND | Contato legítimo, separado de marcas de terceiros. Pouca evidência por consulta | /contato/ · Usar contexto real; sem páginas artificiais por bairro | Página contato: 1 clique / 28 impressões; contexto real RJ |

**Controle de sobreposição:** ficha/montador pertence a /treino/; registrar séries e baixar diário pertence ao guia. Planejador pertence a /dieta/; organizar estoque e baixar lista pertence ao guia de compras. Hipertrofia, proteína e calorias não ganharam páginas quase idênticas. Múltiplas URLs em uma consulta não provam canibalização: nenhuma consolidação ou redirect foi feito sem evidência.

## D. Implementações

A branch isolada é seo/organic-growth-2026-11-14. O repositório remoto tinha a versão completa até RC5; o main contém uma base antiga. A candidata RC12 preservada foi comparada ao tree remoto: todos os 360 arquivos dessa base estavam presentes, 261 idênticos e 99 modificados, além das adições posteriores. A importação mantém os bytes da RC12 e separa a evolução RC13 em outro commit. O Intent Engine do PR 12 permanece separado; não criamos um motor ou dashboard de produção duplicado.

| Arquivo / página | Mudança concreta |
|---|---|
| site/conteudos/diario-de-treino-como-registrar/index.html | Título, descrição, exemplo por série, modelo CSV, links de ficha/RIR e Article com data real de atualização |
| site/conteudos/planejar-compras-refeicoes-semana/index.html | Título, descrição, exemplo de estoque, modelo CSV, limites e link do planejador |
| site/treino/index.html | Explicação pública da diferença entre ficha e diário; acesso aos guias antes do cadastro |
| site/dieta/index.html | Fluxo público de planejamento e link para modelo de compras, dentro da tela inicial |
| site/ferramentas/index.html | Dois recursos públicos; navegação útil até os exemplos e downloads |
| Cinco páginas acima | Breadcrumbs visíveis e JSON-LD correspondente; canonicals próprios preservados |
| site/recursos/*.csv | Dois arquivos UTF-8, sem fórmulas, em branco, sem cadastro e sem transmissão de registros |
| site/assets/organic-resources-rc13.css | Estilo isolado, tabelas com rolagem contida e foco de teclado visível |
| site/assets/measurement-v23-2.js | Distingue os dois cliques de download no evento cta_interaction, respeitando consentimento e lista de valores permitidos |
| scripts/organic-resources.test.cjs | Verificação dos recursos, metadados, dados estruturados e links |
| docs/evidence/organic-2026-11-14/ | Snapshots autenticados, baseline, mapa de palavras-chave e testes |

Não adicionamos meta keywords, repetição forçada, novas URLs de aquisição ou alegações de revisão clínica. Imagens anteriores e alt texts foram preservados: não houve defeito de alt identificado nas páginas alteradas. URLs, formulários, regras de consentimento e exclusões editoriais existentes foram mantidos.

Commit e PR: em preparação durante esta revisão; serão registrados após o aceite técnico. Os commits usam skip ci / skip netlify para evitar builds. Não houve solicitação de indexação, envio externo de mensagens, deploy ou alteração de DNS.

## E. Evidências e testes

**Critérios de aceite:** ausência de nova quebra crítica; metadados/canonicals coerentes; links e arquivos acessíveis; formulários e consentimento preservados; sem overflow do documento em 320, 390, 768 e 1440 px; JSON-LD válido sintaticamente e alinhado ao conteúdo; cálculos dos exemplos conferidos; nenhuma publicação de produção.

Resultados locais: **44 blocos de validação aprovados, incluindo 150 testes Node; 139 verificações no Chromium aprovadas em 32 combinações de página/largura.** As respostas de cadastro foram simuladas: não houve envio de contatos reais. Foram verificados recusa/aceite/revogação de medição, falha e sucesso dos formulários, prévias, navegação, downloads e seus eventos.

Axe: nenhuma violação automática encontrada em 12 análises; 10 verificações incompletas exigem avaliação humana e impedem alegar conformidade absoluta. JSON-LD foi verificado localmente; não é certificação de rich results pelo Google. Core Web Vitals de campo e Safari/iPhone físico não foram validados.

Defeitos corrigidos durante a implementação: o registro de release ainda apontava para RC11 e uma branch histórica; manifesto ativo, ancestralidade e branch foram corrigidos e protegidos por teste. Na inspeção visual, breadcrumbs e cards do hub foram alinhados à largura do conteúdo, com nova verificação. No tracking, o transporte de analytics descartava o identificador dos novos botões por causa da lista de ações permitidas. Foram adicionados somente os dois identificadores de download e um teste de consentimento/filtragem. O navegador confirmou a distinção como clique, sem classificá-lo como cadastro ou venda. As restrições do ambiente impediram lançar o Chromium pelo executor; a suíte foi concluída no navegador compartilhado usando o servidor de homologação local, sem publicação.

## F. Indicadores de crescimento

| Indicador | Baseline verificada | Definição / limite |
|---|---:|---|
| Cliques orgânicos Google | 67 | GSC; 15/10–11/11; propriedade, busca web |
| Impressões Google | 1.208 | Mesmo período; não visitas |
| CTR | 5,55% | Cliques ÷ impressões; não média de CTRs |
| Posição média | ≈ 7.4 | Média ponderada aproximada; não posição atual |
| Consultas visíveis | 77 | Cobre só 21 dos 67 cliques; não todas as consultas |
| Faixas de posição | {'3–10': 29, '1–3': 26, '10–20': 5, '>20': 17} | Por posição média das consultas visíveis; limites: ≤3, >3–10, >10–20, >20 |
| Indexadas na amostra | 7 / 10 | Amostra dirigida; total do site indisponível |
| Sessões orgânicas GA4 | 25 | 15/10–11/11; canal Organic Search |
| Usuários ativos / sessões engajadas | 17 / 17 | GA4; engajamento 68%; não confundir com cliques GSC |
| Eventos principais GA4 | 12 generate_lead | 11 usuários; significado comercial não confirmado |
| Transações / receita registrada | 0 / R$ 0 | GA4 não comprova ausência de vendas fora da medição |
| Uso de ferramentas / WhatsApp | Indisponível nesta coleta | PostHog expirou; cliques não são conversas |
| Conversas qualificadas / vendas atribuídas | Não verificadas | Exigem confirmação comercial e identificação conciliável |
| GA4 recente, 06–13/11 | Sem linhas | Lacuna; não interpretar como zero tráfego |

O fuso da propriedade GA4 é America/Rio_Branco; não foi alterado. Search Console tem seu próprio calendário de relatórios. A comparação entre sistemas deve registrar essa diferença. O painel é um snapshot privado, sem atualização automática nova; o Intent Engine existente e as rotinas executivas devem ser reutilizados.

Após uma publicação aprovada, registrar commit/deploy/data, conferir descoberta e rastreamento das cinco páginas, e comparar janelas completas de 28 dias, por página, consulta, Brasil e dispositivo. A revisão de indexação em 7–14 dias é uma cadência operacional, não promessa de indexação. Monitorar o conjunto preservado como referência ajuda, mas não elimina sazonalidade ou mudanças de SERP. Não atribuir causalidade a uma simples variação antes/depois.

Funil: impressão → clique → sessão → uso da ferramenta → resultado → cadastro confirmado pelo backend → clique no WhatsApp → conversa recebida → qualificação verificada → venda conciliada. Download é clique no recurso, não confirmação de arquivo aberto. generate_lead histórico não foi reclassificado como conversa ou venda.

## G. Pendências efetivas

1. Produção: autorização específica e revisão do PR ainda necessárias; RC13 não está no ar.
2. Indexação: Google ainda não incluiu as duas ferramentas na inspeção obtida; nova decisão só pode ser observada após rastreamento, sem garantia.
3. Mensuração: GA4 recente sem linhas e PostHog com timeout; recebimento atual dos eventos em produção não demonstrado. A ponte GA4 existente foi preservada, sem criar tags duplicadas. Cadastro e vendas precisam de conciliação com o sistema comercial.
4. Desempenho: medições Lighthouse existentes inválidas; sem dados suficientes de LCP/INP/CLS de campo para aprovar CWV.
5. Pesquisa: volumes/KD dos termos não comerciais, ranking atual controlado por local e inventário de backlinks indisponíveis. Não consumimos créditos adicionais para preencher lacunas.
6. Conteúdo clínico: revisão independente especializada não comprovada. Os novos recursos organizam rotina; expansão médica depende de fontes e revisão reais.

Nenhuma conversa, parceria, backlink ou crescimento foi declarado como realizado sem evidência. Próxima ação concreta: revisar a candidata no PR, aprovar uma única publicação e acompanhar a linha de base já registrada.
