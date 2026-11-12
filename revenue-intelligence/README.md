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

## Fase 1.1 — Reconciliação e validação
- `reconcile.js` agrega eventos por referência, remove duplicados por event_id, separa clique de conversa confirmada e exige evidência para vendas.
- `test-reconcile.cjs`: 10 testes adicionais, executados pelo quality gate com `node --test revenue-intelligence/test-*.cjs`.
- O reconciliador é uma biblioteca isolada: não processa dados reais nem acessa banco ou WhatsApp.
- A soma de vendas é apenas sobre eventos validados da entrada; a conciliação contábil e os estornos continuam pendentes.

## Descobertas operacionais adicionais
- Supabase já contém `public.leads`, `public.omega_events`, `public.omega_outcomes` e várias funções de WhatsApp/CRM; evitar duplicar serviços.
- Advisor de segurança existente sinalizou 20 tabelas com RLS sem policy (INFO; pode ser intencional) e proteção contra senhas vazadas desativada (WARN). Nenhuma configuração foi alterada.
- Edge Functions preexistentes incluem `whatsapp-webhook`, `lander-crm` e `lander-support-bridge`; não substituir sem inventário de consumidores e testes.
- HubSpot sinaliza onboarding incompleto; nenhuma sincronização de CRM deve ser habilitada antes de confirmar permissões, mapeamento e consentimento.

## Gates antes da Fase 2
1. Verificar CI no HEAD do PR; status de commits anteriores não substitui validação do último.
2. Confirmar origem verificável das mensagens recebidas e idempotência no backend.
3. Validar retenção, consentimento, autenticação e segregação de dados comerciais.
4. Revisar migração e aplicar somente em sandbox aprovado, nunca diretamente no banco atual.
5. Preparar rollback e testes ponta a ponta sem dados de clientes.

## Revisão adicional
- Inspecionado o código ativo de `lander-crm`: healthcheck apenas; não persiste oportunidades.
- Inspecionado `whatsapp-webhook`: já existe validação de assinatura HMAC; não alterar a função ativa nesta etapa.
- `INTEGRATION-GATES.md` descreve contrato seguro e critérios de homologação sem chamadas de produção.
- Foram adicionados testes para impedir saltos indevidos no funil (total: 18 testes definidos).

## Homologação sem custos — simulador local
- `local-store.js`: persistência **em memória**, sem rede, com idempotência, validação de origem, rejeição de duplicações e transições.
- `test-local-store.cjs`: 8 cenários sintéticos, incluídos automaticamente no quality gate (`node --test revenue-intelligence/test-*.cjs`).
- Total de 26 testes unitários/integração simulada. Os testes não usam dados reais nem cobram Supabase.
- Esta simulação não equivale a um banco Postgres, RLS, webhook ou integração HubSpot real. A implantação de backend continua bloqueada sem ambiente isolado aprovado.
- Decisão explícita: usuário não autorizou cobrança no Supabase. Não criar branch faturável nem executar SQL de escrita no projeto principal.

## Fase 1.2 — Hardening offline
- UUID v4, timestamps UTC, campos permitidos, evidências sintéticas e valores BRL passam a ter validação estrita.
- Regressões, reabertura de estágios finais, vendas duplicadas, provas em eventos de clique e campos pessoais inesperados são rejeitados.
- Empates de timestamp preservam ordem de entrada. No serviço real, validar ordem e concorrência em transação persistida.
- schema.sql propõe idempotência única, origem verificada, hash SHA-256 de prova, RLS e privilégios revogados. DDL NÃO APLICADA e NÃO EXECUTADA em Postgres.
- A referência legada do site (getContactReference) não é o UUID v4 do novo modelo. Não correlacionar por telefone, nome ou heurística sem migração e consentimento.
- O parâmetro actor de local-store.js simula papéis, não autenticação real. Jamais confiar em alegações do navegador para vendas.
- Gate: CI no HEAD verde e testes sintéticos. Esses testes não comprovam endpoint real, integração HubSpot, RLS real ou recebimento no WhatsApp.
