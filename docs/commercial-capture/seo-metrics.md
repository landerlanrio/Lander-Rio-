# LANDER RIO — auditoria de medição e descoberta

Data de coleta: 22/11/2026. Apenas leitura. Nenhum crédito gasto, configuração, campanha, agendamento ou dashboard alterado. Evidências estruturadas sanitizadas em `seo-metrics-evidence.json`.

## Resultado e limite comercial

- Search Console, GA4, OpenSEO, PostHog e Metricool estão acessíveis pelos conectores. HYPD não possui propriedades GA4/GSC conectadas, mas OpenSEO consegue lê-las.
- GA4 propriedade `548953010`, fluxo `G-C3HWDYKEJK`, domínio correto. PostHog projeto `549264` configurado para o domínio. Metricool marca `7920240` conecta `@lander.rio`.
- Nenhuma dessas leituras comprova uma mensagem recebida, um contato comercial qualificado ou uma venda. Clique no WhatsApp continua separado de mensagem/conversa.

## Medição atual

GA4 22/10–20/11, fuso da propriedade **America/Rio_Branco**: 79 sessões ao somar as linhas por origem; 28 eventos principais `generate_lead`, de 26 usuários. Origens retornadas: direto 22 sessões; google/organic 20; l.wl.co/referral 19; ig/social 10; chatgpt.com/ai-assistant 6; instagram.com/referral 1; m.facebook.com/referral 1. Zero transações rastreadas não prova zero vendas realizadas.

Em 14–20/11 GA4 retornou 11 sessões diretas e 1 social, nenhuma sessão orgânica. GSC no mesmo intervalo de datas retornou **39 cliques e 608 impressões**. São sistemas, fusos e definições diferentes, mas o contraste sustenta uma lacuna de medição recente; não tratar ausência no GA4 como ausência de visitas.

Saúde GA4: dois eventos principais, `purchase` (uma vez por evento) e `generate_lead` (uma vez por sessão); nenhuma dimensão ou métrica customizada. A medição automática de scroll, cliques externos, pesquisa interna, download e formulário está desligada; isso não é defeito por si só, pois pode evitar duplicação e captura indevida. O código e os registros anteriores dizem que `generate_lead` confirma cadastro de ferramentas, não uma conversa comercial. Não usar esse evento isoladamente para estimar desempenho de Varejo/Revendedores.

PostHog dashboard existente [LANDER RIO — Funil do Site](https://us.posthog.com/project/549264/dashboard/2003529), consulta atual 22/10–20/11 UTC: **96 site_visit, 12 cta_interaction, 10 whatsapp_open_click, 2 utility_started, 2 utility_result_displayed, 2 utility_registration_confirmed**. A consulta de eventos também retornou 2 `retail_selected` e 4 `wholesale_selected`. Todos incluem testes e apenas tráfego consentido. Um mesmo clique pode produzir `cta_interaction` e `whatsapp_open_click`; não somar como pessoas ou contatos. A taxonomia atual tem `page`, `placement`, `profile`, `contact_reference`, `release` no evento de WhatsApp.

O conector PostHog não possui `data_catalog:read`, portanto não foi possível conferir métricas canônicas no catálogo. O dashboard existe e foi preservado. A busca por LANDER retornou apenas esse dashboard; o título separado LANDER INTENT ENGINE não foi localizado no PostHog nem nos arquivos estáticos pesquisados. Isso não prova que não exista em outro serviço.

## SEO com evidência de demanda

GSC 22/10–19/11 por página (dados disponíveis; últimos dias podem ser revisados):

| Página | Cliques | Impressões | CTR | Posição média |
| --- | ---: | ---: | ---: | ---: |
| Home | 34 | 195 | 17,4% | 7,7 |
| Landerlan | 13 | 310 | 4,2% | 8,4 |
| Landerlan Gold | 6 | 305 | 2,0% | 5,4 |
| Life Peptídeos | 18 | 205 | 8,8% | 4,9 |
| Cooper Pharma | 5 | 161 | 3,1% | 8,9 |
| Muscle Labs India | 5 | 137 | 3,6% | 8,0 |
| Varejo | 0 | 8 | 0,0% | 4,3 |
| Atacado | 3 | 18 | 16,7% | 10,2 |

Priorizar a rota marca → seleção comercial → solicitação, principalmente Landerlan/Gold: já recebem impressões e o CTR Gold é baixo. Conteúdo claro de identificação/autenticidade, links internos e CTAs corretos podem melhorar utilidade e contato; não há estimativa confiável do ganho. O escore automático OpenSEO de Gold=76 usa `sessionKeyEventRate`, enviesado pelos cadastros de ferramentas; não equivale a valor comercial comprovado. Nenhum volume novo foi inventado ou comprado.

Inspeções atuais do índice do Google (não são crawl ao vivo): home, Varejo, Atacado, Landerlan e Gold **indexados**, com canonical selecionada igual à declarada. Landerlan teve último crawl móvel em 22/11; Gold em 21/11. `/treino/` e `/dieta/`: **URL desconhecida pelo Google**. `/enciclopedia/`: **descoberta, não indexada**. Preservar noindex editorial das páginas clínicas em revisão. Diagnósticos e sitemap de produção são complementados em `static-seo.md`.

## Instagram, conteúdo e atribuição

Metricool retornou seis publicações de feed e dois reels em 06–21/11. Na amostra de feed, peptídeos de 08/11 teve maior alcance (144, 4 interações); superséries de 07/11, alcance 87/4; Ironberg de 19/11, alcance 63/0. Esses números descrevem descoberta/interação dentro do Instagram. Os dois reels HYROX de 18/11 tiveram alcance 11 e 12, views 12 e 16, sem interações retornadas. Não somar alcance diário para estimar pessoas únicas do período.

As legendas lidas pedem salvar, compartilhar ou comentar. A publicação Ironberg aponta o endereço oficial externo da academia, não uma página LANDER RIO. Nenhuma amarração por publicação → sessão → solicitação foi comprovada. GA4 identifica `ig/social` (10 sessões no período) e `instagram.com/referral` (1), mas sem vincular esses acessos às publicações retornadas. `profileLinksTaps` e tráfego website no Metricool não retornaram linhas; não registrar como zero cliques.

Consulta de agendamentos Metricool 22/11–22/12 UTC retornou lista vazia. Nenhum agendamento foi criado, modificado ou excluído. Nenhuma campanha foi ativada e estado de anúncios não foi alterado.

## Próximas verificações necessárias

1. Reconciliar a jornada fictícia isolada com evento de conclusão emitido só depois de salvar; não enviar eventos de homologação ao painel de produção para fabricar prova de recebimento.
2. Na eventual publicação aprovada, fazer verificação controlada de recebimento dos eventos no GA4/PostHog e registro comercial. O recebimento dessa futura jornada ainda não foi demonstrado por esta auditoria em leitura.
3. Ajustar o fuso GA4 para America/Sao_Paulo somente com decisão administrativa específica; preservado nesta execução.
4. Manter separado: clique/abertura (navegador e PostHog), mensagem recebida (webhook/provedor WhatsApp), conversa qualificada (atendimento/CRM), venda (negócio/pedido conciliado).

Fontes: conectores OpenSEO (`get_search_console_performance`, `inspect_urls`, `get_google_analytics_measurement_health`, `get_google_analytics_traffic_acquisition`, `get_google_analytics_key_events`, `get_search_opportunities`); PostHog (`read-data-schema`, `query-trends`, `dashboard-get`, `dashboard-insights-run`); Metricool (`getBrandSettings`, `getAnalyticsAvailableMetrics`, `getAnalyticsDataByMetrics`, `getScheduledPosts`). Reutilizados registros de 19/11 apenas como pistas, com contagens e índice consultados novamente em 22/11. Sem dados pessoais de clientes nos arquivos.
