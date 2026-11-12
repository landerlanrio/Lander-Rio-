# LANDER RIO — Arte-matriz oficial | 12/11/2026

A marca oficial foi confirmada pelo titular nesta conversa por meio de uma imagem JPEG (1254 × 1254 px), com **símbolo circular estilizado em acabamento metálico/titânio, preenchimento lime e wordmark LANDER RIO com textura de metal escovado e destaque lime em RIO**.

**Origem verificada:** JPEG fornecido pelo titular; SHA-256 `e22a44d764b2328f53eb025703b7659d339dc17fe4b240a6901dbdd298b9fab1`. Este documento referencia a origem, mas **não substitui o binário oficial nem é uma licença para redesenhá-lo**. O símbolo `site/assets/brand-symbol-v20.webp` é uma derivação anterior; não assumir equivalência perfeita com a nova arte-matriz.

## Diretriz de aplicação
- Preservar **o desenho, as letras, as texturas metálicas, as cores e a proporção** da imagem oficial; não reinterpretar com fonte genérica, gradiente CSS ou marcas inventadas.
- Header: lockup horizontal composto por recorte das mesmas duas partes da imagem original, em WEBP transparente com dimensões explícitas. Wordmark deve ser legível no iPhone em 320–430 px.
- O arquivo original deve permanecer imutável e disponível para comparação (checksum documentado).
- Fondos: testar sempre Ônix `#090909` e Off-white `#F2F0EB`; não adicionar glow/neon ao desenho.
- Alternativas reduzidas: símbolo circular isolado derivado do original, sem alterar traços.
- A cópia publicada deve passar por contraste, WCAG de texto alternativo, largura de viewport, CLS e comparação visual real antes de deploy.

## Estado da implementação
- **Implementado em preview local isolado:** `LANDER_RIO_FLAGSHIP_V24_3_LOGO_OFICIAL.html` e kit `LANDER_RIO_KIT_LOGO_OFICIAL_V24_3.zip`, entregues nesta conversa. O preview HTML incorpora o WEBP transparente e elimina a marca fictícia `L.`.
- **QA local da prévia:** 7 larguras (320, 375, 390, 430, 768, 1024, 1440 px); 7/7 sem overflow horizontal, imagem decodificada, H1 único e sem erros JavaScript. Capturas em 390 e 1440 px.
- **Ainda não incorporado ao binário do PR #4:** falta versionar o asset WEBP oficial no repositório e executar novamente os testes integrados; não declarar integração concluída sem isso.
- Nenhuma operação em produção, Netlify, Supabase, HubSpot ou pagamentos.

**Gate:** não aprovar merge ou deploy com identidade provisória depois de receber a matriz oficial.
