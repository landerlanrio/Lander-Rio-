# LANDER RIO — ROX Agent v3 | Homologação isolada | 12/11/2026

**Status:** branch experimental, sem merge, deploy, migração, mensagens ou chamadas pagas.
**Origem:** PR #3 (audit/rox-safety-2026-11-12), commit base 6e5af58bd58220a4f4f0106c8f005ea6f0d96cf3. Independente do PR #4 (Flagship).

## 1. Diagnóstico com evidências verificadas

- No repositório privado landerlanrio/Lander-Rio-, ROX 2.0 está em prototypes/rox-ai-v2/index.ts e foi mantido fora da publicação. Há widget offline separado em site/assets/rox-widget-v1.js, desativado por padrão. O PR #4 contém outra proposta de interface; não misturar branches sem revisão.
- No Netlify, o site oficial tem seu próprio deploy publicado (6af28cd36c8c0ece64548aca). Ainda não há equivalência binária comprovada entre o código de staging do GitHub e o deploy.
- Supabase acessível, projeto ACTIVE_HEALTHY; funções whatsapp-webhook e lander-crm estão listadas como ativas. O conector retornou zero linhas em wa_conversations e wa_messages, e 2.404 em leads. Existência de função não comprova webhook funcional nem recebimento de mensagens; não foram feitos POSTs, escritas ou mudanças.
- HubSpot acessível para leitura da conta, mas a consulta de metadados de canais falhou com erro do conector. Nenhuma sincronização ROX→HubSpot foi confirmada.
- Não há prova ponta a ponta do WhatsApp Business do iPhone até o ROX, nem da geração de negócios no CRM. Um link aberto não constitui conversa, lead qualificado, venda ou margem.

## 2. Direção técnica: preservar stack atual

A skill vercel/build-agents recomenda Eve para novos agentes, mas orienta conservar aplicações existentes que adotaram outro framework. Como o ROX já utiliza TypeScript/Deno e JavaScript no frontend, não foi instalado Eve nem qualquer outra dependência nesta fase.

Mudanças nesta branch:
- prototypes/rox-ai-v2/agent-v3.mjs: motor determinístico, sem efeitos colaterais, para classificação de intenções e qualificação de contatos.
- prototypes/rox-ai-v2/index.ts: integração do motor nas respostas do backend ROX, preservando CORS, Turnstile, restrição de custos e ausência de escrita.
- prototypes/rox-ai-v2/agent-v3.test.mjs: testes de privacidade, classificação, handoff humano, anti-hallucination e zero chamadas de rede.
- prototypes/rox-ai-v2/index.test.mjs: ampliação de testes HTTP do backend.
- .github/workflows/ci.yml: teste v3 adicionado ao pipeline, sem job de deploy.

### Contrato de resposta comercial

Resposta segura na modalidade handoff:
- qualification.segment = atacado, varejo ou geral
- qualification.topic_id = pedido, parceria, catalogo, condicoes, estoque, humano ou novo
- qualification.stage = needs_topic ou ready_for_human
- qualification.requires_human = true
- qualification.contact_captured = false
- integrations.whatsapp.method = manual_draft
- integrations.whatsapp.sent = false
- integrations.whatsapp.conversation_confirmed = false
- integrations.hubspot.mode = disabled_dry_run; synced = false
- integrations.supabase.mode = disabled_dry_run; row_written = false

A mensagem para o WhatsApp é composta somente com campos permitidos. Nenhuma transcrição, dado pessoal, preço ou pedido individual é incorporado ao rascunho. Não há envio automático.

O histórico enviado pelo navegador é usado apenas como pista contextual e não comprova identidade, consentimento, contrato ou transação. O motor não armazena sessão nem dados pessoais.

### Limites obrigatórios

- Não se identificar como humano.
- Não inventar preços, estoque, frete, entrega, pedidos, datas, descontos ou garantias.
- Medicamentos sujeitos a prescrição e substâncias restritas: nenhuma intermediação de vendas ou recomendação de dose.
- Dúvidas clínicas: orientação educativa limitada e recomendação de profissional habilitado.
- IA generativa continua desligada sem autorização e seis controles existentes de ativação/custo/chave/modelo/antibot.
- Nenhuma escrita em Supabase, HubSpot ou WhatsApp; nenhum webhook testado com dados reais.

## 3. Matriz de aceitação

| Requisito | Validação | Critério |
|---|---|---|
| Segmentação | Atacado, varejo, follow-up | Classificação e contexto coerentes |
| Humanização | Identidade ROX, treino, dieta, recuperação | Respostas educativas corretas |
| Privacidade | CPF, telefone, e-mail, cartão | Sem eco ou encaminhamento |
| Saúde | Tirzepatida, retatrutida, testosterona, Ozempic | Bloqueio comercial, sem doses |
| Falso positivo | Preço iPhone, cinema, passagem | Não classificar como lead |
| Segurança | Instrução adversarial | Sem preço ou ação externa |
| Integração simulada | WhatsApp, HubSpot, Supabase | sent/synced/row_written sempre false |
| Rede | fetch global interceptado no teste | Nenhuma chamada externa |
| Compatibilidade | Testes antigos e novos | Sem regressão |
| Publicação | PR draft e workflow | Nenhum deploy |

Comandos executáveis no pipeline:
- node --experimental-strip-types --test prototypes/rox-ai-v2/index.test.mjs
- node --test prototypes/rox-ai-v2/agent-v3.test.mjs
- node --test scripts/rox-widget.test.cjs
- python3 scripts/verify_site.py

**Regra:** não confundir testes simulados com testes reais da integração comercial.

## 4. Bloqueios antes da produção

**P0:** comprovar que staging representa o deploy Netlify; revisar a interface ROX do PR #4 e a acessibilidade real em Safari/iOS; implementar rate limit durável e proteção antibot; revisar LGPD e retenção; homologar fluxo WhatsApp Business → webhook → CRM com autenticação, idempotência e consentimento. Somente uma mensagem recebida ou um evento server-side auditado valida conversa; somente transação confirmada valida venda.

**P1:** base de conhecimento governada com fontes e data de revisão; cobertura de intenções e taxa de fallback; telemetria de handoff sem dados sensíveis; desambiguação de objetivos e atualização de conteúdo.

**P2:** IA generativa e agentes persistentes condicionados a orçamento aprovado, isolamento de dados, custos mensuráveis e rollback.

## 5. Política de release

Sem merge, deploy, migração, alteração de credenciais, envio de mensagens, contato com cliente ou contratação de serviço. PR permanece draft contra staging; aprovação expressa será necessária para eventual publicação.
