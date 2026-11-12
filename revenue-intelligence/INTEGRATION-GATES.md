# Homologação de persistência — especificação executável (sem deploy)

## Inventário confirmado
- Supabase: nenhum branch de desenvolvimento existente; projeto principal contém dados reais. Não executar migrações nem testes de escrita nesse projeto.
- `lander-crm`: Edge Function ativa, mas a versão inspecionada responde apenas `{status:"ok",app:"LANDER RIO CRM"}`; não é um endpoint de persistência de leads.
- `whatsapp-webhook`: função ativa com validação de assinatura HMAC no código. Não substituir nem disparar chamadas de teste sem ambiente isolado.
- HubSpot: portal conectado, onboarding incompleto. Propriedades padrão disponíveis; nenhuma alteração em contatos ou negócios.
- Não existe branch Supabase para testar DDL sem atingir dados reais. Criar branch Supabase pode gerar custo e exige confirmação explícita de cobrança.

## Contrato para futura API `POST /v1/opportunities/events`
1. HTTPS, autenticação de serviço validada no backend, allowlist de origem para navegador (não substitui autenticação), limite de tamanho e rate limit por origem.
2. `Idempotency-Key` obrigatória; armazenar `external_event_id` com UNIQUE e responder resultado anterior para repetição.
3. Validar evento contra `lead-tracking.js`, transição no servidor e consentimento comprovado; nunca confiar em `evidence_verified` enviado pelo navegador.
4. Eventos de conversa, proposta e venda só aceitos de fonte autenticada com evidência de origem verificável.
5. Referência comercial aleatória, sem nome, telefone, mensagens, informações médicas ou credenciais em PostHog.
6. Transação atômica para inserir evento e atualizar estágio, com bloqueio de linha e controle de concorrência.
7. Logs redigidos, retenção limitada, trilha de auditoria e política de eliminação; nenhuma mensagem enviada automaticamente.
8. Integrar HubSpot somente após mapear propriedades, deduplicação e aprovação específica de escrita.

## Cenários de homologação exigidos
- Mesmo idempotency key duas vezes → um único evento.
- Mesmo reference, dois eventos concorrentes → transição consistente.
- Visitante sem consentimento → nenhum evento analítico.
- Clique no WhatsApp sem resposta → não vira conversa confirmada.
- Conversa sem evidência verificada → rejeitada.
- Venda sem qualificação ou valor verificado → rejeitada.
- Usuário anônimo tentando consultar tabelas privadas → negado.
- Evento inválido → erro estruturado, sem escrita parcial.
- Dados pessoais no payload de analytics → rejeitados.
- Teste de rollback da migração em banco de homologação.

## Bloqueadores reais
Apenas GitHub possui ambiente isolado confirmado. Supabase e HubSpot conectados apontam para sistemas reais. Portanto, testes de integração de escrita e sincronização real permanecem bloqueados até haver ambiente de homologação isolado e aprovação de custo, caso aplicável.
