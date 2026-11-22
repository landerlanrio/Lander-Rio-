# Captação comercial — backend, 22/11/2026

## Resultado comprovado

Candidata local, sem publicação, em `/workspace/capture-backend` branch `fix/capture-backend-20261122`. Commits: `20f5619`, `918b6f0`, `ea21b98`.

- Endpoint Netlify `/api/commercial/lead` aceita Varejo e Revendedores, intenção e origem reduzida. Confirma após commit durável, nunca com base apenas em HTTP 200 de outro serviço.
- UUID + fingerprint imutável: clique repetido/retry reutiliza registro e recibo; reuso com conteúdo diferente retorna 409 sem sobrescrever.
- CRM não faz parte da transação de captação. Solicitação salva permanece `pending`; indisponibilidade do HubSpot não a perde. Banco indisponível retorna 503, sem confirmação visual de aceite.
- Contingência existente verificada pertence às ferramentas treino/dieta. A proposta usa o mesmo produto Supabase com fila comercial dedicada, sem alterar tabelas antigas, triggers, WhatsApp, n8n ou automações.
- Função tem same-origin exato, limite 10/IP/minuto configurado, honeypot e limite de corpo. Valores de origem usam allowlists; não guarda URL completa, query, referer ou IDs analytics. Nome/email ficam apenas no armazenamento protegido. Erros não retornam detalhes internos ou credenciais.

## Evidência

`backend-tests.txt`: 14/14 PASS, zero skips. Inclui SQLite WAL/FULL com reabertura, concurrent duplicate, conflito, falha de storage, validação e isolamento de origem, claims/leases, CRM simulado indisponível, timeout após commit do CRM e retry por e-mail sem duplicar contato, import real da função Netlify e RPC adapter.

PostgreSQL 17.12 local Docker: SQL proposto aplicado em banco descartável; oito chamadas concorrentes para o mesmo UUID produziram uma inclusão e sete duplicatas. Papéis anon/authenticated sem leitura ou execução. Claim lock/expiração/recuperação e marcação de CRM confirmadas no banco.

`backend-http-bundle-evidence.json`: função compilada pelo bundler real Netlify `@netlify/zip-it-and-ship-it@16.6.0` (bundler `nft`, conforme manifesto) executada contra PostgREST 13.0.4 HTTP autenticado por JWT fictício local, conectado ao Postgres local. Observado 201 inicial, 200 retry, 409 conflito, 401 leitura anônima e uma linha com perfil/intenção/origem corretos, status pending. Artefato: `function-bundle/commercial-lead.zip`. Sem chamada a serviço hospedado nesses testes.

A jornada de navegador usa o harness loopback `127.0.0.1:3100` com SQLite persistente. O harness bloqueia os outros endpoints `/api/*`, aplica CSP self-only e não encaminha chamadas ao CRM ou bancos hospedados. `/__qa/requests` é exclusivamente consulta local de contatos fictícios e não faz parte da função de produção.

## Recuperação demonstrada

Nos testes duráveis, o CRM simulado falha: fila continua pending com origem/intenção. Operador adquire lease exclusivo, faz upsert por e-mail e persiste o ID do contato na solicitação. Repetir após resposta perdida do CRM usa o mesmo contato. Concorrência e lease expirado não geram dupla confirmação. Nome enviado pelo formulário não sobrescreve nome já curado no CRM.

Em operação, o procedimento preparado é consulta autenticada via SQL Editor Supabase pelo recibo, perfil/intenção/origem/status e, quando necessário, nome/e-mail. Após restauração do limite CRM e aprovação específica, `operator.mjs reconcile-one --apply` processa um registro por ação. Não há cron, mensagens, campanha ou ativação de workflow. Origem e intenção de cada solicitação permanecem na fila; `crm_contact_id` oferece a ponte para o contato HubSpot. Não pressupõe propriedades customizadas no CRM.

## Pendências reais

1. `schema-proposal.sql` **não aplicado em Supabase hospedado**. Não foi criado banco/branch pago.
2. Credenciais e URL de staging, gateway Supabase hospedado e role de equipe ainda sem validação. `COMMERCIAL_ALLOWED_ORIGIN` deve ser o origin HTTPS exato da prévia; as credenciais devem pertencer a banco isolado conferido antes de abrir.
3. Rate limit configurado foi lido pelo bundler, mas enforcement no edge Netlify requer staging.
4. HubSpot real não recebeu cadastro ou reconciliação; capacidade/scopes/propriedades e consulta pelo operador seguem gate de staging/produção.
5. Origem é contexto declarado pelo navegador, reduzido por allowlist; não representa prova de mensagem WhatsApp recebida nem conversa qualificada.
6. Artefato é candidato: publicar só após gates e aprovação específica de produção. Deploy estático por ZIP sem a função não implementa esse endpoint.

Nenhum deploy, mensagem, contato real, automação de saída ou credencial de produção foi alterado nesta implementação.
