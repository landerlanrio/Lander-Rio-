# SEO | Correções de metadados — 12/11/2026

## Escopo e fonte
Auditoria OpenSEO concluída em 12/11/2026, 50 páginas rastreadas (limite de 50 páginas; 28 URLs não lidas). Relatório: https://app.openseo.so/p/cc40f4de-9c11-47c9-be5b-dcb4387db222/audit?auditId=16041bf3-3334-439e-8406-76139a8e02cf .

Encontradas 21 ocorrências: 2 de conteúdo pouco aprofundado, 12 de meta description longa, 5 de title longo, 1 de hierarquia de headings e 1 limite de crawl. **Nenhuma ocorrência crítica reportada na amostra.** Nem todas as páginas foram analisadas.

## Alterações de baixo risco
1. /treino/: title e meta description com dimensões convencionais; preservados fluxos de cadastro, consentimento e ferramentas.
2. /conteudos/como-organizar-semana-treino/: title curto, mantendo conteúdo editorial.
3. /conteudos/planejar-compras-refeicoes-semana/: title curto, mantendo conteúdo editorial.
4. /atacado/: meta description curta, sem promessas de preço, estoque, prazo ou vendas controladas.
5. Teste Node sem dependências para título, descrição, canonical e H1; conectado ao quality gate CI.

## Fora de escopo
- Sem alterações de texto clínico, de dose, medicamentos, preços, estoque, WhatsApp, banco de dados, dados pessoais ou integrações.
- Sem merge e sem deploy. Não se pode inferir aumento de posicionamento, CTR ou faturamento até monitorar uma janela comparável após publicação autorizada.
- Dois avisos de conteúdo curto e a hierarquia de headings exigem revisão editorial/visual antes da alteração; não inserir texto genérico apenas para inflar volume de palavras.

## Teste e aceite
`node scripts/test_seo_metadata.cjs` deve passar em 4/4 páginas.
`python3 scripts/verify_site.py`, JavaScript syntax e smoke_http já integram a CI; conservar estes testes.
Não há permissão para deploy nem merge: este PR é exclusivamente revisão.

## Integridade de arquivos
O manifesto histórico `site/manifest-v23-10.json` não foi editado. O overlay `site/manifest-openseo-20261112.json` registra exatamente os quatro arquivos alterados e seus hashes SHA-256; `scripts/verify_site.py` agora confere o overlay com lista permitida fixa antes de validar o snapshot. A primeira rodada de CI falhou somente por `hash-mismatch` nos quatro arquivos; esta correção é a remediação testável.
