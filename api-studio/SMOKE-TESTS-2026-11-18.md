# LANDER RIO — Homologação de API, 18/11/2026

## Escopo
Somente **staging**, sem merge, nenhum deploy ao site público, nenhum envio de mensagens e **nenhuma chamada de inferência paga**.

## Resultados HTTP reais (Supabase Edge Functions via pg_net)
| Requisição | HTTP | Corpo / validação | Resultado |
|---|---:|---|---|
| ROX / | 200 | version=2.1.0-staging, ai_enabled=false | Serviço ativo; geração indisponível |
| Content Studio / | 405 | method_not_allowed | Rota base protegida |
| ROX /chat (solicitação sintética de atacado) | 200 | mode=handoff | Classificação comercial aprovada |
| ROX /chat (pergunta sintética de medicamento) | 200 | mode=clinical | Encaminhamento comercial bloqueado |
| ROX /chat (pergunta geral) | 503 | error=ai_not_authorized | Geração bloqueada, conforme esperado |
| Content Studio /generate (solicitação de roteiro) | 503 | error=disabled_or_unconfigured | Geração bloqueada, conforme esperado |

IDs internos pg_net: 87–92. Todas as requisições foram sintéticas, sem dados de clientes.

## Segurança
- Supabase: ROX v4 ACTIVE; Content Studio v2 ACTIVE, verify_jwt=true.
- Guarda de crédito durável: public.lander_ai_budget_guard; limite vitalício conjunto US$ 1 (reservado em micro-USD); somente service_role executa a função de reserva.
- Testes SQL de entradas inválidas: serviço desconhecido, reserva zero e reserva maior que o máximo → false.
- Conferência final: 0 reservas, 0 micro-USD reservados.
- Content Studio: 10/10 testes unitários com `node --experimental-strip-types --test tests/studio.test.mjs` neste ambiente.

## Situação da credencial
O operador informou que salvou OPENAI_API_KEY no painel do Supabase. **A presença, validade e acesso ao modelo não foram confirmados pelas ferramentas autorizadas**. Nenhuma chave foi acessada nem copiada. Nenhuma tentativa foi feita de liberar gastos sem validação.

## Variáveis exigidas pela implementação atual
### Content Studio
- OPENAI_API_KEY (operator-entered; não armazenar no GitHub)
- LANDER_STUDIO_MODEL (modelo recomendado de teste: gpt-6-luna)
- LANDER_STUDIO_INTERNAL_TOKEN (aleatório, servidor a servidor)
- LANDER_STUDIO_ENABLED=true
- LANDER_STUDIO_BUDGET_APPROVED=true (somente depois do teste de autenticação e aprovação)
- SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (normalmente injetados pela plataforma; verificar presença)

### ROX
- OPENAI_API_KEY
- ROX_AI_MODEL=gpt-6-luna
- ROX_TURNSTILE_SITE_KEY e ROX_TURNSTILE_SECRET (Cloudflare Turnstile real)
- ROX_AI_ENABLED=true
- ROX_AI_BUDGET_APPROVED=true (somente depois de teste de Turnstile e custos)

## Pendências
1. Confirmar variáveis e credenciais no Supabase Secrets (sem divulgá-las).
2. Validar via URL de saúde autenticada e somente então fazer **uma** chamada paga de teste respeitando o teto vitalício.
3. Revisar UX mobile e segurança anti-bot, depois pedir aprovação específica para publicar no site principal.
