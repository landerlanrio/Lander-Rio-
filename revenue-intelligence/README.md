# Revenue Intelligence OS — Fase 1 (isolada)

Status: proposta de implementação, **sem integração em produção**. Base: staging. Nenhuma migração aplicada, nenhum evento enviado, nenhuma mensagem enviada.

## Inspeção das integrações (12/11/2026)
- Supabase acessível: projeto artcokrtuqppgtawuczq. Existem `public.leads` (2404 registros), `public.lead_activities`, `public.wa_contacts`, `public.omega_events`, `public.omega_outcomes` e outras tabelas com RLS. Não alterar nem migrar dados existentes nesta fase.
- HubSpot acessível: propriedades CONTACT (`lifecyclestage`, `hs_lead_status`, `hubspot_owner_id`, `hs_whatsapp_phone_number`) e DEAL (`pipeline`, `dealstage`, `amount`, `amount_in_home_currency`). Onboarding do portal incompleto. Nenhum registro alterado.
- GitHub staging: `site/assets/commerce-v23-1.js` abre WhatsApp; `site/assets/measurement-v23-2.js` emite `whatsapp_open_click` com consentimento, mas não prova conversa ou venda.

## Componentes
- `lead-tracking.js`: módulo independente, sem rede nem armazenamento, com referência aleatória, validação de consentimento, eventos comerciais e transições.
- `schema.sql`: DDL **não aplicada**, em schema privado sem políticas de acesso anônimo.
- `test-lead-tracking.cjs`: testes locais Node.js, executar com `node --test revenue-intelligence/test-lead-tracking.cjs`.

## Integração futura (exige aprovação específica)
1. Revisar proteção contra duplicação e persistência de consentimento; emitir `handoff_prepared` apenas após ação do visitante.
2. Receber eventos por endpoint autenticado, rate-limited, com idempotência, verificação de origem e tratamento de erros.
3. Conciliar referência com evidência real de conversa recebida; cliques nunca contam como conversas.
4. Integrar HubSpot por serviço seguro e mapeamento de propriedades validado; sem escrita automática por padrão.
5. Confirmar isolamento e RLS com testes reais de acesso antes de aplicar SQL.
6. Reconciliar vendas com comprovantes de pedido; nunca inferir faturamento de cliques.

## Segurança e limitações
- Não coletar telefone, nome, texto de conversa ou dados clínicos no PostHog.
- `evidence_id` no módulo é dado interno; **não enviar diretamente ao analytics**. Hash de evidência apenas no backend.
- `schema.sql` não deve ser aplicado ao banco atual sem revisão, aprovação e testes de permissão.
- A fase 1 ainda não inclui webhook, interface, sincronização ou deploy. Nenhum evento de produção foi alterado.
