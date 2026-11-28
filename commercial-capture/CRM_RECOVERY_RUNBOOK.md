# Recuperar uma solicitação quando o CRM voltar

A fila comercial é o registro de cada solicitação aceita. O CRM pode conter um contato associado a várias solicitações; origem e intenção de cada recibo continuam na fila. Este guia não ativa sincronização, workflows, mensagens, notas ou negócios.

As consultas abaixo exigem a conta administrativa autorizada no projeto que contém a fila. Atualmente a fila hospedada foi criada apenas no projeto isolado de homologação. Não executar alterações no projeto de produção como parte deste ensaio. Nunca colocar service role no navegador ou compartilhar essa chave com a equipe.

## 1. Localizar e conferir — somente leitura

```sql
select request_id,receipt,created_at,profile,intent,origin,
       crm_status,crm_contact_id,last_error,
       claim_until
from public.commercial_requests
where receipt='LR-<RECIBO>';
```

Uma linha confirma o registro; HTTP 200 ou evento analytics não substitui essa consulta. Para a fila pendente:

```sql
select receipt,created_at,profile,intent,origin,last_error,claim_until
from public.commercial_requests
where crm_status='pending'
order by created_at,request_id;
```

Se `crm_status='synced'` e há `crm_contact_id`, a solicitação já foi associada: conferir esse contato, sem criar outro. Nome/e-mail são consultados na mesma interface protegida somente quando necessários ao atendimento.

## 2. Reservar o próximo pendente — altera apenas o controle da fila

```sql
select public.claim_commercial_request();
```

O retorno contém `request_id`, e-mail normalizado e `claim_token`. O token fica apenas no processo autorizado; não o copie para relatórios públicos. A reserva usa bloqueio da linha, `SKIP LOCKED` e prazo de 60 segundos. Outro operador não recebe essa mesma reserva enquanto ela estiver válida. A função retorna o próximo pendente; não presume que seja o recibo consultado anteriormente. Processe o `request_id` efetivamente retornado.

Se o processo parar, o prazo permite recuperar a reserva. Não mudar os campos de claim manualmente, nem marcar todos os pendentes como sincronizados.

## 3. Reutilizar ou criar um único contato

Antes de usar o CRM real, conferir capacidade, permissões e workflows existentes no portal correto. Criar ou atualizar um contato pode inscrevê-lo em automações já configuradas fora deste código. Se essa inscrição puder gerar saída não autorizada ou não puder ser verificada, manter a solicitação pendente; não executar o upsert como teste. Este guia não autoriza ativar ou modificar workflows.

O adapter preparado usa `POST /crm/v3/objects/contacts/batch/upsert`, com `idProperty: email`, o mesmo e-mail normalizado como `id` e apenas `properties: {email}`. Ele não usa um `POST` de criação cego a cada tentativa e não sobrescreve o nome já curado no CRM.

Antes de uma ação humana, conferir o e-mail no CRM. Um contato existente é reutilizado pelo seu ID. Identidade ambígua, e-mails alternativos ou múltiplos resultados exigem resolver a identificação antes de criar: a solicitação permanece pendente. Quando um contato não existe e o upsert retorna um ID, esse ID é a evidência a associar.

Se o CRM gravou o contato mas a resposta se perdeu, repetir o upsert com o mesmo e-mail reutiliza o contato. Não gerar novo e-mail, novo request_id, nota ou negócio para contornar o timeout. O nome enviado pelo formulário e a origem/intenção permanecem preservados na solicitação original.

## 4. Finalizar somente após receber o ID do CRM

```sql
select public.finish_commercial_request(
  '<REQUEST_ID>'::uuid,
  '<CLAIM_TOKEN_ATUAL>'::uuid,
  '<ID_CONFIRMADO_DO_CONTATO_CRM>'
);
```

`true` confirma que o token ainda era o da reserva atual e que o vínculo foi salvo. Depois repetir a consulta de leitura do recibo: `crm_status='synced'`, `crm_contact_id` esperado, mesma origem e intenção. Se retornar `false`, outro processo pode ter recuperado a reserva: reler a linha; não repetir a criação do contato.

Em falha ou resposta incerta do CRM, liberar a reserva mantém a solicitação pendente:

```sql
select public.release_commercial_request(
  '<REQUEST_ID>'::uuid,
  '<CLAIM_TOKEN_ATUAL>'::uuid
);
```

Esse RPC retorna HTTP 204 sem corpo no PostgREST. O adapter trata isso como sucesso sem tentar interpretar JSON. Se a conexão com o banco também falhar, reler o estado quando ele voltar e respeitar a expiração da reserva.

## Execução preparada e limite real

`reconcile.mjs` já implementa claim → upsert por e-mail → finish, ou release em erro. `operator.mjs reconcile-one --apply` é ação manual e exige `COMMERCIAL_CRM_SYNC_ENABLED=true`; não há cron. Este ensaio não invoca esse comando com credenciais reais e não ativa a flag.

A gravação, idempotência e recuperação foram demonstradas contra PostgreSQL/PostgREST reais em um ambiente local descartável; o adapter HubSpot foi exercitado com um stub em memória, sem qualquer requisição externa. O stub demonstrou CRM indisponível, commit com resposta perdida, reutilização do mesmo contato após retry e reutilização de contato já existente sem alterar seu nome. Isso não comprova que a restrição do HubSpot foi resolvida nem que uma sincronização real ocorreu.

O ensaio também criou dois registros legados fictícios como canários no banco descartável: contagem e digest permaneceram iguais. Nenhuma tabela, registro ou credencial de produção foi consultado ou alterado para essa prova.

## Conferir o responsável de um protocolo

O operador acrescenta `assignment_status` quando finaliza o vínculo do contato. Para rever o mesmo protocolo após uma atribuição manual ou falha temporária, execute `node commercial-capture/operator.mjs verify-assignment LR-<32 dígitos hexadecimais maiúsculos>` no ambiente autorizado. A consulta lê o vínculo já salvo e a propriedade `hubspot_owner_id` do contato. Ela não reserva a fila, não chama o upsert e funciona com a sincronização de escrita desligada.

- `assigned` confirma que o contato vinculado e não arquivado tinha um identificador de responsável no instante da leitura. O atendimento e o recebimento de mensagem exigem comprovação própria.
- `unassigned` significa que o CRM devolveu o campo vazio. Siga a regra de distribuição da equipe e repita a consulta do mesmo protocolo.
- `receipt_not_found` e `contact_not_linked` indicam que ainda não há vínculo consultável para aquele recibo.
- Em `queue_access_denied` ou `crm_access_denied`, confira a permissão de leitura do sistema indicado. Em `queue_unavailable` ou `contact_unverified`, repita a consulta após verificar a disponibilidade. Esses resultados deixam a atribuição em aberto.

A consulta usa o token de servidor do leitor da fila e a permissão de leitura de contatos do HubSpot. A observação sai no resultado do operador. O estado persistido `synced` continua comprovando exclusivamente o vínculo ao contato. A atribuição pode mudar após a consulta.
