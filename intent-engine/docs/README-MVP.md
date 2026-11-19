# LANDER INTENT ENGINE — MVP privado (13/11/2026)

**Estado:** protótipo interno funcional e auditável; **não implantado no site público**. Foi criado como módulo isolado do projeto Netlify/GitHub para não conflitar com branches e PRs de SEO em andamento.

## O que funciona sem API paga

- `index.html` abre localmente no navegador (sem dependências de CDN).
- Tabela das **27 páginas** retornadas pelo Google Search Console (GSC), recorte **15/10–11/11/2026**; filtros, busca, índice de revisão editorial, briefs por página, exportação em JSON e importação de CSV de páginas do GSC em pt-BR ou inglês.
- `node scripts/analisar.mjs` recalcula a análise e grava `data/resultado-mvp.json`.
- `node --test test/intent.test.mjs` executa testes unitários; `node scripts/build-preview.mjs` recria o HTML independente.
- `node scripts/gerar-brief-ia.mjs --url=https://landerrio.com.br/marcas/cooper-pharma/` gera um briefing *determinístico* no terminal, sem custo.

## Opcional — gerar um rascunho com OpenAI API (custo/uso de créditos)

O script `scripts/gerar-brief-ia.mjs` **não chama nenhuma API por padrão**. Para uma chamada consciente, em um ambiente privado autorizado, configurar `OPENAI_API_KEY` e `OPENAI_MODEL` (não colocar chaves no repositório nem no navegador) e usar `--confirmar-chamada-paga`.

Exemplo depois de configurar as variáveis:

```sh
node scripts/gerar-brief-ia.mjs \
  --url=https://landerrio.com.br/marcas/cooper-pharma/ \
  --confirmar-chamada-paga
```

Essa função usa o endpoint atual **OpenAI Responses API** e grava rascunho não publicado em `data/brief_ia_*.md`. **Não foi efetuada chamada paga neste trabalho**. É obrigatória revisão editorial e de conformidade antes de qualquer publicação.

## Evidência da análise

- Fonte: propriedade Search Console `sc-domain:landerrio.com.br`, lida via OpenSEO.
- Janelas: GSC páginas 2026-10-15 a 2026-11-11; GA4 de 2026-10-16 a 2026-11-12.
- O retorno de GA4 continha **25 sessões orgânicas** e **12 eventos-chave** nesse intervalo, com última atividade diária exibida em 05/11/2026. Isso **não comprova 12 leads, conversas ou vendas**.
- A API GSC pode agregar dados e omitir algumas consultas por privacidade/limites. Dados da dimensão `query` **não devem ser somados** aos da dimensão `page` como se fossem conjuntos exclusivos.
- O índice interno prioriza *revisão* por impressões, posição média, CTR e tamanho de amostra. **Não é volume total de busca, chance de ranking, previsão de cliques ou de receita.** Consultas com risco medicinal são filtradas nos briefings.

## Para levar a produção

1. Manter o painel atrás de autenticação administrativa, não em URL pública.
2. Implantar ingestão em **backend**, com OAuth de leitura do Search Console, criptografia e controle de acesso, ou outra integração licenciada e autorizada. Nenhum segredo no frontend.
3. Validar retorno GA4 e eventos de WhatsApp (clique ≠ conversa confirmada).
4. Adicionar logs, auditoria, limites de custo da IA e aprovação de cada pauta.
5. Separar experimentos com histórico suficiente para comparação de períodos equivalentes.
6. Fazer revisão regulatória das páginas de marcas e materiais de saúde; nenhuma publicação ou CTA de compra automática.
7. Confirmar qual branch do repositório corresponde de fato ao deploy manual atual na Netlify. Não automatizar deploy antes da equivalência e backup.

## Segurança e escopo

O MVP não envia dados para servidores externos por meio da interface, não disponibiliza chaves, não cria conteúdos automaticamente no site, não altera DNS, não dispara WhatsApp, não escreve no banco, não consome créditos de OpenAI e não publica páginas. Os dados presentes são internos da operação — **não hospedar o `index.html` como arquivo publicamente acessível**.
