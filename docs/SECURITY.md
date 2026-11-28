# Segurança — controle mínimo

- O repositório é **público**. Restrinja permissões de escrita e trate o conteúdo de todas as branches, o histórico e os artefatos de CI como públicos.
- Verifique cada alteração antes do merge. Não faça commit de credenciais, arquivos `.env`, dumps de clientes ou backups de banco.
- O site recuperado inclui endpoints públicos Supabase e uma chave de ingestão PostHog destinada ao navegador; isso **não autoriza** versionar chaves administrativas, `service_role`, credenciais secretas ou tokens de acesso privado.
- O CI verifica caminhos e padrões de credenciais nos arquivos rastreados da revisão com `python3 scripts/audit_public_repository.py` e confere os ativos do site separadamente. O escopo dessa execução exclui o histórico e a análise do conteúdo de arquivos binários.
- Configure secrets no Netlify/Supabase, nunca em JavaScript público ou `netlify.toml`.
- Para o repositório GitHub, habilite Dependabot, code scanning e secret scanning, se disponíveis no plano.
- Não autorizar deploy direto a `production` por push antes de homologação e plano de rollback.
