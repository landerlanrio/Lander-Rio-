# Privilégios mínimos da fila comercial

O default ACL do Supabase pode conceder ALL à `service_role` ao criar uma tabela. Conceder depois apenas SELECT/INSERT/UPDATE não remove os privilégios excedentes já existentes.

A fila comercial utiliza SELECT, INSERT e UPDATE para captura, reserva, liberação e finalização. Ela não utiliza DELETE, TRUNCATE, REFERENCES, TRIGGER ou MAINTAIN. O schema base agora revoga todos os privilégios da `service_role` nessa tabela antes de conceder os três necessários. A `service_role` continua sem login e com bypass de RLS; a restrição de operações é feita também pelos privilégios da tabela.

Para uma instalação existente, `queue-privileges-repair.sql` faz o mesmo ajuste somente em `public.commercial_requests`, dentro de uma transação. Nenhuma linha é apagada ou alterada; nenhum privilégio público é aberto. Não muda tabelas legadas, políticas, funções, usuários ou default privileges globais. DELETE é preservado na tabela `commercial_capture_rate_limits`, pois a expiração de buckets precisa dele.

Antes e depois, a conta administrativa pode conferir somente metadados:

```sql
select p,has_table_privilege('service_role','public.commercial_requests',p)
from unnest(array['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER','MAINTAIN']) p;

select has_table_privilege('service_role','public.commercial_capture_rate_limits','DELETE');
```

Esperado na fila: SELECT/INSERT/UPDATE true; demais false. Na quota: DELETE true. Não testar esses privilégios tentando apagar uma solicitação.

A regressão isolada reproduz `ALTER DEFAULT PRIVILEGES ... GRANT ALL`, confirma o excesso no canário, testa o schema novo e simula a ACL antiga da fila. Após o reparo, captura, retry idempotente, claim, release e finish funcionam como `service_role`; a contagem anterior é preservada e a quota mantém DELETE. O teste não executa DELETE nem TRUNCATE de linhas e remove apenas seu banco descartável ao terminar.

Esse reparo é SQL/permissões. Não exige publicar novamente o app nem implantar outra Edge Function: os arquivos executáveis permanecem os da release já validada. Registrar o commit da revisão do banco separadamente do commit/payload/deploy da aplicação. A aplicação em produção cabe ao operador autorizado após revisão e CI; este arquivo não executa a migration.

Os INFO `RLS enabled no policy` continuam esperados para tabelas service-only. Não criar policies nem abrir acesso anônimo para silenciá-los.
