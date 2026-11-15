# Operação editorial RC8

Base preservada: RC6.3, commit `d6e19cb7f73585f5586de6e038bfe2ec46df6ec7`. Branch: `feat/rc8-universo-marcas-seo`.

## Editar

- `content/brands.json`: identidade, SEO, linhas, referências, fontes, FAQs, links relacionados e indexabilidade de 14 marcas. `source` nos produtos é o número da fonte correspondente, começando em 1.
- `content/articles.json`: quatro artigos; fontes `[S1]` etc. no corpo são transformadas em links para referências.
- `content/universe.css`: extensão visual do sistema aprovado.
- `scripts/build_universe.py`: template de marcas e diretório; a linha Gold usa sua URL já existente e dados da marca principal.
- `scripts/build_editorial.py`: template editorial e agrupamento temático. Novos artigos devem ser incluídos em `CLUSTERS` e em um link contextual de outra página.

Não repetir os scripts `prepare_rc8_*`: são migrações históricas do conteúdo inicial. Editar os JSON centralizados.

## Gerar e verificar

Python 3.12+ e Node 22+, sem dependências adicionais de build:

```sh
python scripts/build_rc8.py
python scripts/build_digital_flagship_manifest.py
python scripts/validate_titan.py --out validation-rc8
```

O segundo comando fixa checksums deliberadamente. A validação nunca regenera hashes e detecta alterações posteriores. O resultado final é `site/`, com `index.html` na raiz do pacote de deploy. A geração deve ser idempotente.

Para avaliação local, usar servidor HTTP com suporte a diretórios e URLs `.html` sem extensão; `scripts/smoke_http.py` testa o roteamento esperado. Abertura por `file://` não reproduz caminhos absolutos do site. No ambiente gerenciado, usar o preview suportado, já configurado.

## Publicação

O site de produção não foi alterado. O pacote final mantém `_headers`, `_redirects`, `netlify.toml` e as APIs existentes. A publicação em `landerrio.com.br` depende de autorização específica.

Preview privado: gerado com `scripts/build_private_review.py --out DIST`. Não envia analytics. Treino, dieta e radar apontam para as ferramentas já publicadas; seus fluxos de cadastro não foram exercitados com dados reais. As demais páginas são cópias navegáveis do candidato, com `noindex`. Não usar esse `dist` de avaliação como pacote de produção.

## Controle editorial

Antes de habilitar indexação: conferir identidade, fonte de cada afirmação, associação de produto à marca, direitos de imagem e contexto regulatório. O campo `indexable` não é certificação jurídica. Produtos em perfis são referências editoriais, sem preço, disponibilidade, botão de compra ou encaminhamento ao WhatsApp.

O candidato mantém `noindex,follow` em 35 fichas que declaram revisão científica pendente e em quatro identidades incompletas. A lista está em `docs/INDEXABILITY_RC8.json`. A revisão é condição para voltar ao sitemap; nenhum conteúdo foi apagado.

## Escopo da validação

Os dados de QA são de Chromium desktop com larguras controladas, não Safari em aparelho físico. Lighthouse, LCP e INP de usuários reais não foram certificados. A auditoria axe tem verificações manuais incompletas, registradas nos JSON; zero violações automáticas não significa conformidade integral com WCAG.

Dados estruturados foram verificados como JSON e por consistência de URL/breadcrumb; não houve certificação pelo Rich Results Test. Rankings e resultados de busca nunca são garantidos.
