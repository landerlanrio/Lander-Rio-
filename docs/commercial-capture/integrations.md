# Integrações LANDER RIO — auditoria 22/11/2026

## Resultado

Leituras autenticadas confirmaram HubSpot portal 51817572 e Supabase artcokrtuqppgtawuczq. Nenhuma configuração de produção, automação, mensagem ou dado de cliente foi alterado. Teste novo WhatsApp executado apenas em processo local, sem rede e com identificador fictício.

O caminho comercial publicado observado pelo time termina em link WhatsApp. A contingência persistente existente em produção atende ferramentas de treino/dieta; não foi encontrado endpoint/RPC de formulário Varejo/Revendedores. Não tratar um clique de WhatsApp como solicitação salva.

## Evidências atuais

| Integração | Gatilho / execução / destino | Evidência e limite |
|---|---|---|
| HubSpot | Conector CRM autenticado, portal Landerrio 51817572 | COUNT CONTACT = 3372. Leitura funciona; conta STANDARD e onboarding pendente. A disponibilidade de escrita indicada pelo conector não prova capacidade de criar contatos. O conector não expõe cota/bloqueio de faturamento. Nenhum contato criado para testar o limite. |
| Supabase CRM interno | `nutrition-entry` v19 / `workout-entry` v11 -> RPC transacional -> tabela de ferramenta -> trigger -> `public.leads` | Código de funções e definições SQL relidos. Resposta de sucesso depende de UUID devolvido pelo RPC. Dois registros nutrição `internal_crm_synced`; treino: 1 `internal_crm_synced`, 3 `suppressed_no_marketing_consent`. Sincronização interna não é HubSpot externo. |
| Supabase leads | CRM interno autenticado; acesso por proprietário | Contagem exata 2404, todos `sync_status=pendente`; último cadastro 10/11. Nenhum worker de sincronização HubSpot foi comprovado. Não interpretar esses 2404 como backlog externo sem conciliação. RLS ativa e anon sem SELECT; authenticated só proprietário configurado + auth.uid()=user_id. Acesso de equipe genérico não foi comprovado. |
| WhatsApp legado | Meta webhook -> `whatsapp-webhook` v15 -> `wa_*` -> Graph API quando habilitada | GET health: banco conectado; `safe_mode=true`, `outbound_enabled=false`, `followups_enabled=false`; Access Token e App Secret ausentes; Phone Number ID, Graph Version e Verify Token presentes; `ready_for_meta=false`. Contagens exatas de wa_contacts, wa_messages e wa_handoffs = 0. |
| WhatsApp Cloud de homologação | `lander-wa-cloud` v12; engine `2.1.1-analysis.2`; adapters Meta / YCloud / 360dialog no código | GET health: `persistent_analysis_only`, `businessIngress=false`, `realSendingEnabled=false`, `externalAiEnabled=false`, `historyImportEnabled=false`. O entrypoint bloqueia ingresso business e saída. Adapter existente não comprova provedor conectado. |
| Cloud snapshots | Schema privado `lrwa_cloud`, RPC com compare-and-swap | business revision 11: 0 contatos/mensagens/conversas/jobs; paused=true, analysisOnly=true e AI/outbound/followups=false. demo revision 30: 4 contatos/mensagens/conversas, 0 jobs. Última atualização 21/11 17h40 UTC. |
| Recuperação Cloud | cron `lander-wa-cloud-recovery`, */5 minutos | Job ativo já existente, worker enabled=true, última execução completa registrada 21/11 17h40 UTC. Nenhuma alteração. Não equivale a automação de mensagem habilitada. |
| Blip ponte antiga | `lander-blip-gpt` v16 | Código atual devolve HTTP410: `disabled: native Blip Studio agent selected`. |
| Blip/OpenAI alternativa | `blip-openai-bridge` v11 -> Responses API | Settings atuais: `blip_bridge_safe_mode=true`, preferência agente Blip nativo=true, modelo configurado `gpt-5.6-terra`, max output 350. Prompt `SYSTEM_PROMPT` em index.ts determina atendimento comercial. Sem teste de geração ou saída, sem prova de rota Blip nativa ativa. |
| Follow-ups legado | `process-followups` v10 -> Graph API | Exige cron secret, safe_mode=false e três flags de saída/follow-up. Flags atuais bloqueiam. Não acionado. |
| n8n antigo | `landerrio.app.n8n.cloud` | GET raiz e /api/v1/workflows retornam 404 com título `No instance here`. A Central registra instância excluída e ZIP já resgatado; recuperar de novo não é próximo passo. |

## Chat realmente carregado no site

Arquivos ativos fornecidos pela auditoria de produção e inspecionados no checkout:

- `site/assets/rox-agent-v3-offline.js`: versão `3.1.0-titan-rc1-isolated`, classificação por regras, sem modelo remoto/prompt de LLM. `agentTurnV3` produz resposta local e handoff com campos permitidos.
- `site/assets/rox-demo-v25.js`: invoca o agente, guarda somente contexto permitido em memória e prepara `wa.me` após decisão de handoff. O visitante precisa abrir/enviar; não confirma conversa ou armazenamento CRM. O texto completo digitado não é persistido pelo widget.
- `site/assets/rox-transport-titan.js`: fábrica opcional que só aceita `/api/rox/chat` com consentimento/challenge. Nenhuma instanciação `LanderRoxTransportFactory.create` foi encontrada no site. A fábrica sozinha não faz chamada de IA.
- `lander-rox-ai-v2-staging` v13 existe separadamente: GET informa versão `2.1.1-growth-os-staging`, `ai_enabled=false`, `mode=no_paid_calls`, handoff humano. Código exige cinco gates, Turnstile e modelo allowlisted (`gpt-6-luna`/`gpt-6.1-terra`); modelo real habilitado não foi constatado. Prompt está em `modelInstructions()`, mas a produção inspecionada não aponta para essa Edge Function.

## Teste local de entrada e repetição

Código de `core.mjs`, `knowledge.mjs` e `demo.mjs` foi copiado da função deployada `lander-wa-cloud` v12 para `/workspace/audit/wa-local-simulation/`. O teste usa apenas funções puras, não endpoint remoto ou banco de produção.

Identificador: `LR-QA-20261122-WA-001`. Entrada fictícia: pedido de atendimento para revendedores vindo do site. Resultado: classificação `wholesale`; reentrada do mesmo providerId manteve 1 contato, 1 conversa e 1 mensagem recebida. Takeover manual seguido de echo do aplicativo preservou `control=human` e `owner=business_app`. Zero drafts/jobs/chamadas externas; AI e saída permaneceram false. Resultado reproduzível: `node /workspace/audit/wa-local-simulation/verify.mjs`. Registro sanitizado: `wa-local-simulation-result.json`.

Essa prova termina no motor local. Não comprova webhook YCloud/Meta, mensagem real, coexistência no iPhone ou consulta de contato pelo provedor.

## Registros anteriores aproveitados

Fonte atual: [Central Executiva](https://chatgpt.com/space/page_6af60531a3dc8191845d7bd49dc2d7bd), relida em 22/11. Fonte operacional: [Receita, CRM e Integridade](https://chatgpt.com/space/page_3469ea6614d081918553837a6ae00218).

- Central confirma migração de integridade treino `20261122082849_guard_workout_registration_identity_integrity` já aplicada e quatro validações com rollback. A leitura atual confirmou guard de identidade ambígua no RPC; não reaplicar.
- Central registra resgate n8n: 3 definições, 48 nós, 50 conexões; importadas junto da candidata em n8n 2.48.7, quatro workflows e zero ativos. Isso é evidência histórica relida, não reexecução nesta auditoria.
- Defeitos n8n documentados: normalizador usa primeira mensagem do lote; sete nós posteriores usam primeira saída; falha após criar nota e repetição pode duplicar nota. Corrigir/testar lote e recibo por etapa na candidata existente antes de qualquer ativação.
- Meta protocolo 1701202354672827 / Blip #447531 / YCloud erro 2655099 continuam como pistas existentes. Central não contém confirmação de liberação Meta nem coexistência. Não criar outro canal ou alterar o número.
- Há ensaio administrativo isolado de 18/11 documentado (HTTP201 e repetição HTTP200 para mesmo protocolo, zero duplicatas na reimportação). Não encontrei implantação correspondente em tabelas/RPC/Edge Functions de produção.
- Buscas no Drive por nomes exatos/variantes e referências indexadas das Pages não localizaram `LANDER_RIO_CONTINGENCIA_CAPTACAO_2026-11-22.zip` ou `Validacao_Automacao_LANDER_RIO_2026-11-22.md`. Busca de arquivos da Central retornou relatórios 19/11 com gap `missing_ready_publication`; portanto os arquivos podem existir fora do escopo indexado. Dropbox não conectado. Não declarar os pacotes inexistentes.

## Pendência e próxima ação concreta

1. HubSpot: acesso somente leitura a uso/limites no portal ou resposta do protocolo existente para comprovar bloqueio atual. COUNT e onboarding não resolvem essa questão; nenhum gasto/escrita autorizado aqui.
2. Equipe: definir logins autorizados para consulta no CRM interno; RLS atual permite apenas proprietário. Não ampliar política para todos autenticados.
3. WhatsApp: titular consultar número correto em Meta (`is_on_biz_app` e `platform_type`) ou parceiros em Configurações -> Conta -> Plataforma do WhatsApp Business. Teste de mensagem e coexistência requer autorização do canal e ambiente apropriado. Preservar histórico/iPhone.
4. n8n: usar candidata resgatada inativa em instância de homologação autorizada com destinos simulados; vincular credenciais por canal seguro só quando disponível. Não recontratar nem ativar por inferência.
5. Publicação captação: homologar nova jornada com armazenamento durável e consulta recuperável primeiro; só depois decisão específica sobre schema/endpoint/deploy. Reprocessamento externo deve consultar recibo por request antes de repetir escrita incerta.

Contrato existente para reuso seguro: `/workspace/audit/existing-leads-contract.md`. Nenhum segredo ou registro de cliente integra este relatório.
