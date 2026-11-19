# LANDER RIO — TITAN 1.0.0 RC1

**Estado atual em 13/11/2026:** candidata isolada, integrada sobre o PR #10 com componentes recuperados dos PRs #2, #5, #8 e #9. Não publicada. O dossiê [docs/TITAN_RELEASE_RC1.md](docs/TITAN_RELEASE_RC1.md) prevalece sobre os registros históricos abaixo.

Validação: Python 3.12+ e Node 22+, sem chaves ou dependências NPM de produção.

```bash
python3 scripts/validate_titan.py --out ../titan-validation
python3 scripts/package_titan.py --out ../LANDER_RIO_TITAN_RC1_SITE.zip
```

O gate não regenera manifestos. Alterações em `site/` exigem revisão e geração explícita com `scripts/build_titan_manifest.py`. IA externa, gateway comercial e SQL permanecem desativados. Nenhum workflow faz deploy.

**Produção auditada:** Netlify `6af28cd36c8c0ece64548aca`, upload manual de 10/11. Comparação pública: 168 arquivos obtidos, 165 idênticos; dois formulários transformados pela Netlify e um manifesto semanticamente igual. Configurações não servidas publicamente não tiveram equivalência binária comprovada. A candidata está identificada por `site/release.json` e `manifest-titan-v1.json`.

## Registro histórico da recuperação — 11/11/2026

Os parágrafos a seguir descrevem o momento da importação v23.10, anterior à integração TITAN. Não descrevem o conteúdo atual de `site/` nem substituem o dossiê desta candidata.

Repositório atualmente **público**. Todos os branches e todo o histórico Git podem ser consultados por terceiros. Não versionar `.env` reais, segredos de integração, registros de clientes, backups de dados pessoais ou logs com autenticação. O gate `scripts/audit_public_repository.py` é preventivo; não certifica commits históricos ou binários. A produção Netlify permanece independente, sujeita a homologação e aprovação específica.

## Estado e procedência

- Fonte: `LANDER_RIO_SITE_COMPLETO_v23_10_SEIS_FEEDBACKS_PREPUBLICACAO.zip`, recuperado da Biblioteca da LANDER RIO.
- Release do pacote: `lander-v23.10-seis-registros-recebimento-2026-11-10`.
- Site de referência: https://landerrio.com.br.
- Projeto Netlify (produção): `lander-rio-oficial`, ID `1632727b-a57d-4edb-85f7-9fc99bc98842`.
- Deploy de referência: `6af28cd36c8c0ece64548aca`, publicado em 10/11/2026.
- **Reconstrução de alta confiança, mas sem prova de igualdade byte a byte com o deploy Netlify**. O ZIP foi criado minutos antes do deploy; o total de 81 páginas HTML bate com o relatório de publicação da Netlify; a home pública contém os 6 relatos de recebimento. O arquivo ZIP original do deploy não foi extraído da infraestrutura Netlify neste procedimento.
- Nenhuma operação foi executada no site de produção.

## Estrutura

- `site/` — cópia original dos 171 arquivos do pacote de publicação, sem qualquer alteração de conteúdo.
- `site/_headers`, `site/_redirects` — regras existentes preservadas.
- `site/netlify.toml` — configuração original preservada para rastreabilidade.
- `netlify.toml` — configuração do repositório com diretório de publicação `site` e testes antes do build.
- `.github/workflows/ci.yml` — CI somente para validação, **sem deploy e sem secrets**.
- `scripts/` — verificação de integridade, referências e testes HTTP.
- `docs/` — procedência, segurança e procedimento de migração.

## Testes (sem dependências externas)

```bash
python3 scripts/verify_site.py
python3 scripts/smoke_http.py
# opcional, se Node.js estiver disponível:
find site -name '*.js' -type f -print0 | xargs -0 -n1 node --check
```

## Implantação segura

Não conecte este repositório diretamente à produção antes de validar uma prévia isolada.

1. Repositório GitHub **privado** criado; `staging` e `recovery-v23-10` disponíveis. O histórico Git original está preservado no arquivo `.bundle` no histórico de `main` (a tag de origem não foi enviada ao remoto).
2. CI de verificação criada em `.github/workflows/ci.yml`; revisar exigência de aprovação e proteção da branch `main` antes da migração.
3. Criar um **novo site de prévia** Netlify ligado à branch `staging`; a configuração deve manter a produção atual sem vínculo e sem alterações.
4. Validar páginas, formulários, navegação, Analytics/privacidade, links WhatsApp e APIs Supabase em ambiente de prévia.
5. Somente após aprovação, considerar uma migração do projeto de produção para deploy contínuo, com rollback pronto.

**Status em 11/11/2026:** repositório privado confirmado; os 171 arquivos do pacote foram importados em `staging` e preservados em `recovery-v23-10`. O backup Git original continua no histórico de `main`, e a validação automatizada foi instalada sem qualquer job de deploy. **A produção do Netlify não foi vinculada ao GitHub.** A versão recuperada não tem equivalência byte a byte confirmada com o deploy de produção. Consulte [docs/MIGRACAO_SEGURA.md](docs/MIGRACAO_SEGURA.md).
