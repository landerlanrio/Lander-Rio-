# Segurança — controle mínimo

- Repositório remoto deve ser **privado** e ter acesso por menor privilégio.
- Verifique cada alteração antes do merge. Não faça commit de credenciais, arquivos `.env`, dumps de clientes ou backups de banco.
- O site recuperado inclui endpoints públicos Supabase e uma chave de ingestão PostHog destinada ao navegador; isso **não autoriza** versionar chaves administrativas, `service_role`, credenciais secretas ou tokens de acesso privado.
- A auditoria estática identifica apenas padrões comuns de segredo; não substitui scanners de credenciais em CI ou auditoria manual.
- Configure secrets no Netlify/Supabase, nunca em JavaScript público ou `netlify.toml`.
- Para o repositório GitHub, habilite Dependabot, code scanning e secret scanning, se disponíveis no plano.
- Não autorizar deploy direto a `production` por push antes de homologação e plano de rollback.
