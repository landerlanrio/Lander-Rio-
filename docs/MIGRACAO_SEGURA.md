# LANDER RIO — Plano de migração GitHub → Netlify

## Baseline validado

Projeto oficial: `lander-rio-oficial` (ID `1632727b-a57d-4edb-85f7-9fc99bc98842`). Último deploy consultado: `6af28cd36c8c0ece64548aca`, status `ready`, publicação em 10/11/2026 às 00:17 de Brasília. Origem `api` (publicação por pacote, sem `commit_ref` ou `branch`).

Pacote de recuperação: v23.10 com 171 arquivos e 81 HTML; SHA-256 anotado em `docs/provenance.json`. A Netlify informou 81 páginas HTML e 33 assets novos/alterados, totalizando 114 arquivos transferidos neste deploy. Essa combinação indica correspondência **provável**, não igualdade de hashes do deploy remoto.

## Passagem para controle de versão (sem atingir produção)

1. Criar `lander-rio-site` como **privado** na conta GitHub correta. Nunca enviar a cópia recuperada ao repositório público `landerlanrio/Landerlan-Rio-`.
2. Após confirmar o repositório privado e as permissões GitHub App, adicionar `origin` e enviar `main`, `staging` e tag do baseline.
3. Ativar proteção de `main`: aprovação em PR, validação CI obrigatória, negar force-push e exclusão, sem bypass automático.
4. Criar um projeto **Netlify separado de prévia** associado à branch `staging`. A configuração do repositório publica apenas `site/`; scripts de validação devem passar antes do build.
5. **Não associar ainda o GitHub ao site Netlify oficial.** Primeiro comparar integralmente a prévia com a produção (home, 81 páginas, 6 registros, treino, dieta, formulários Netlify/Supabase, WhatsApp, privacidade, sitemap, redirects e headers).
6. Validar dados em sessão de teste: eventos PostHog somente com consentimento; evitar cadastro real e disparos comerciais sem autorização. Não testar pagamentos reais.
7. Se tudo passar, preparar janela de publicação, snapshot do deploy atual e plano de rollback. Requer aprovação antes de conectar ou alterar a produção.

## Comandos a usar após confirmação do repositório privado

```bash
git remote add origin git@github.com:landerlanrio/lander-rio-site.git
git push -u origin main
git push -u origin staging
git push origin --tags
```

Use o HTTPS em lugar de SSH quando esta conta não tiver chave configurada; não compartilhar tokens via chat.

## Critérios para autorização de produção

- Evidência do código de produção comparado com a versão Git (se acesso ao ZIP do deploy estiver disponível)
- CI passando em commits da branch aprovada
- 81 páginas preservadas e validação de principais rotas; sem novas falhas 404
- `_redirects`, `_headers`, formulários e APIs preservados
- Teste visual responsivo 390 e 1440 px
- Consentimento e revogação de analytics verificados
- Link WhatsApp abre a conversa correta; nenhuma mensagem é enviada automaticamente
- Rollback para deploy `6af28cd36c8c0ece64548aca` documentado
- Aprovação explícita do titular antes de mudar a produção

## Restrições observadas

O conector GitHub autenticou a conta `landerlanrio`, mas não possui ferramenta para criar repositórios e informou zero instalações GitHub App. A consulta por repositórios da conta encontrou apenas um repositório público vazio (`Landerlan-Rio-`), inadequado para o projeto privado. A integração Netlify permite consultar o projeto e deploy, mas não disponibilizou uma ação para baixar o ZIP original do deploy ou vincular Git. Não usar dados não validados como igualdade absoluta.
