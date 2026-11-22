# RC10 — candidato de 14/11/2026

Base: RC9 fornecida + reconciliação de leitura com o deploy Netlify `6af7cf076327d7fe116d1858`. Não publicar esta pasta como substituta de um backend; o pacote de site contém apenas os assets estáticos existentes.

## Mudanças

- Recuperadas a ponte/configuração GA4 e a CSP já presentes em produção, ausentes na fonte RC9 disponível. O próximo pacote não deve desfazer essa correção.
- Novo artigo original sobre descanso entre séries, com fonte científica, limites e links em Conteúdos e home. Schema Article/Breadcrumb e sitemap atualizados.
- 88 documentos HTML, 46 URLs no sitemap, 51 páginas com scripts de medição e 39 rotas mantidas fora da indexação conforme o critério anterior.
- Fixture RC9 aprovada, com SHA-256 fixo, substitui dependência de commit Git não distribuído no ZIP. Os testes podem rodar a partir do pacote de fonte.
- Cinco testes de regressão RC10: scripts GA4 idênticos à produção, ordem/singleton, CSP preservada, medição desativada no preview e artigo rastreável/ligado à navegação.
- Preview privado separado, noindex e sem analytics, para não contaminar dados com homologação.

## Reproduzir os testes

Com Python 3 e Node 24 disponíveis: `python3 scripts/validate_titan.py --out ../evidencias-rc10`. A execução não regenera manifestos nem acessa integrações externas. O manifesto RC10 foi gerado deliberadamente após a revisão dos arquivos; não o regenere para encobrir alterações inesperadas.

Resultado da sessão: 44 blocos passaram, incluindo 142 testes Node, cinco novos testes RC10 e testes Python existentes. QA manual Chromium: home/menu mobile, busca de marca, artigo em viewport de 390 px, sem overflow horizontal observado. Isso não comprova Safari físico, Core Web Vitals de campo ou conversão comercial.

## Entrega e publicação

`site/` é o candidato estático de deploy; o preview interno não integra o pacote público. Nenhuma nova publicação em landerrio.com.br foi realizada nesta sessão. Antes de publicar, comparar o deploy atual com a base acima; se ele mudou, reconciliar novamente. Após aprovação e deploy, conferir scripts/CSP, consentimento e recebimento GA4/PostHog e preservar o deploy anterior para restauração. Nenhum rollback foi executado.
