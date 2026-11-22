# Produção e repositório — LANDER RIO — 22/11/2026

## Deploy ativo

- Domínio: https://landerrio.com.br
- Projeto Netlify: `lander-rio-oficial`, ID `1632727b-a57d-4edb-85f7-9fc99bc98842`.
- Deploy: `6afe96a8a12db106eae1b9cd`, publicado em 19/11/2026 06:26:58 UTC, estado `ready`, contexto `production`.
- API Netlify informa `deploy_source=api`, `title=Build from drop deployment`, `branch=null`, `commit_ref=null`, nenhuma função/edge function.
- Portanto **não há commit/branch comprovado como fonte do deploy**. A existência de `source_branch` no JSON público é metadado declarado, não vínculo Git de implantação.

## Comparação reproduzível

A auditoria leu os 337 caminhos `site/` da união de 33 referências remotas, além de sitemap, robots, favicon e recursos encontrados em links. Foram 342 caminhos consultados, 334 respostas 200 e 8 respostas 404. Parte dos caminhos 200 é alias para HTML existente. O conjunto principal do candidato tem 331 arquivos servidos comparáveis, mais três arquivos de configuração não consultáveis como conteúdo publicado.

O snapshot recuperado em `/workspace/production-baseline` é evidência de conteúdo HTTP público. **Não é o ZIP original do deploy e não comprova inventário completo de arquivos desconhecidos**, regras de redirect/header ou configuração Netlify. O manifesto completo tem status, URL final, tipo, tamanho e SHA-256, sem conteúdo de clientes.

As branches com maior coincidência de bytes são:

| Branch | Commit | Iguais | Diferentes |
|---|---|---:|---:|
| `release/flagship-mobile-qa-20261119` | `79cb510247b594d22c46005e9d9d22afc126197b` | 233 | 98 |
| `feature/growth-os-v1-staging-20261119` | `82220aeaae680cd9691c7482aab345a2b9638dc4` | 233 | 98 |
| `fix/favicon-fallback-audit-20261119` | `e11d9ad985f714f7b26adb673596d1f4c35633b4` | 233 | 98 |

Nenhum dos 98 blobs diferentes de produção foi localizado no histórico Git disponível. Entre eles estão 8 arquivos JS/CSS, home e páginas comerciais/editoriais, `release.json` e manifesto RC14.3.

Diferenças materiais da produção que seriam perdidas ao publicar diretamente a branch:

- Medição exige que consentimento atual em localStorage continue `granted` ao emitir eventos e gerar referência de contato.
- Atribuição para cadastro é devolvida somente com consentimento.
- Query de versão `rc14.2` nos recursos e valor da versão dos eventos atualizados.
- Preload/estilos e ajustes de legibilidade/títulos nas páginas comerciais/editoriais.

O JSON `release.json` servido declara RC14.3 e reconciliação de ZIP anterior, mas também declara `local-candidate-not-deployed` e `candidate_not_published`, embora seja servido no domínio de produção. Esses metadados estão desatualizados ou inconsistentes. Eles não substituem a evidência Netlify/HTTP.

## Reconciliação local efetuada

Por instrução do agente principal, foram repostos **96 arquivos** no `site/` local com bytes recebidos por HTTP 200 do deploy ativo. O repositório estava limpo no início da aplicação, e nenhum arquivo foi removido. `release.json` e `manifest-digital-flagship-2026-rc14.3.json` foram preservados para manter os manifestos históricos sem reescrita. `_headers`, `_redirects` e `netlify.toml` permanecem do candidato, pois o snapshot HTTP não recupera essas fontes.

Lista auditável: `production-overlay.json`, com SHA-256 original do candidato e da versão servida para cada arquivo substituído. Alterações posteriores de outros agentes podem se sobrepor ao snapshot de maneira deliberada.

## Trabalho pendente preservado

Foram localizadas 22 PRs abertas, 20 em rascunho. O inventário resumido está em `baseline-pending-prs.json`. Não houve merge, push ou alteração remota.

As mais próximas do candidato atual são PR #21 (RC14.3, base staging) e #22 (Growth OS, base RC14.3). Outras cobrem recuperação, receita, ROX, SEO e conteúdo. A publicação por Git da main atual sobrescreveria o site com um repositório sem código do website; main contém README, bundle e workflows de recuperação. A configuração automática de deploy não foi alterada.

## Pendência para arquivo exato

O deploy Netlify informa `has_source_zip=true`, mas as ferramentas conectadas de Netlify nesta sessão não oferecem download do arquivo. A interface autenticada precisa disponibilizar o download original para comparar ZIP completo e regras com o candidato final. O snapshot público já permite conservar todos os 331 caminhos conhecidos e demonstrar alterações específicas, sem alegar equivalência de arquivo completo.
