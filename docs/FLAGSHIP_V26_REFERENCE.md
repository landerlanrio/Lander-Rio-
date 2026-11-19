# LANDER RIO — Flagship v26 | Fidelidade visual à referência enviada

**Data:** 12/11/2026  ·  **Base:** `design/flagship-v25-1-marcas-atacado-varejo`  ·  **Ambiente:** isolado, sem merge/deploy.

## Briefing verificado
O titular apresentou uma referência visual vertical de 1024 × 1536 px, com foto de atleta à direita, texto "CULTURA DE PERFORMANCE", navegação com busca/menu, seção "THE BRAND VAULT" e cartões de marcas com brilhos metálicos. A referência **não** é código-fonte, layout responsivo nem catálogo verificado. Não se devem reproduzir métricas ou selos como fatos.

## O que foi implementado em HTML/CSS/JS (não é apenas uma imagem)
1. Header preto com lockup oficial já existente (`lander-rio-lockup-v25.webp`), menu móvel e busca local que realmente filtra links internos.
2. Hero com título e textos acessíveis, CTAs operacionais para ferramentas e treino/dieta e links de Atacado, Varejo e Marcas.
3. Fotografia obtida **somente por recorte** da imagem de referência fornecida pelo titular. O rosto e as tatuagens não foram gerados ou retocados; o recorte elimina elementos da interface que não fazem parte do atleta. Limitação: não equivale ao arquivo fotográfico original de alta resolução.
4. Grade com **14 marcas existentes**, usando os logos já presentes no site e estilos de luz/gradiente diferenciados. Na referência aparecem menos logos; não se excluiu conteúdo útil para simular uma contagem falsa.
5. Cinco filtros locais (`Todas`, `Hormônios`, `Peptídeos`, `Performance`, `Outros`), semanticamente interativos com `aria-pressed` e indicador `aria-live`. A associação por tema é apenas de navegação, não afirma disponibilidade, vínculo ou linha de produtos.
6. CTA destacado de WhatsApp, preservando o número e fluxo existentes; nenhuma mensagem é enviada sem clique.
7. Painéis Atacado e Varejo, ferramentas de treino/dieta, conteúdos e ROX demonstrativo preservados. **80 páginas HTML originais permaneceram byte a byte inalteradas.**

## Qualidade verificada
- 8 viewports Chromium: 320, 360, 375, 390, 430, 768, 1024, 1440 px.
- Sem overflow horizontal após corrigir selo junto ao título no mobile.
- Foto principal decodificada, um único H1, 14 logos, filtros: `Peptídeos` 2 / Todas 14, busca por `atacado` 1 resultado, menu mobile operacional.
- Sem exceções JavaScript ou requisições externas **na prévia autocontida**.
- 29 testes estáticos de integridade/SEO/rotas/privacidade/semântica: aprovados em execução local.
- SHA-256 do manifesto local (baseline v23.10 + overlay v26) e presença de arquivos: aprovados.
- Release de 81 páginas HTML / 184 arquivos. ZIP SHA-256: `1dfde4596fceba20a012acdc407c400e4d30c565d4f720dd7607142035bc3f10`.

## Limitações e gates obrigatórios antes de publicar
- O resultado é **adaptação fiel**, não reprodução pixel a pixel: componentes são responsivos, o número real de marcas é 14, a foto é um recorte e logotipos são os arquivos originais do site.
- Safari físico/iOS, Lighthouse, dados reais CWV, acessibilidade WCAG 2.2 AA completa e integrações efetivas não foram homologados.
- Foto origem pode ter direitos de personalidade; validação de autorização comercial/uso é responsabilidade da marca antes de publicar.
- O pacote recuperado não teve equivalência byte a byte com o deploy Netlify publicado confirmada. O domínio permanece na versão anterior.
- Para homologação real: URL HTTPS de staging com controle de acesso, validar todos os formulários, rotas e dados sensíveis, e obter aprovação explícita para publicar.

## Arquivos
- `site/index.html` — homepage funcional.
- `site/assets/flagship-v26-reference.css` — acabamento visual e responsividade.
- `site/assets/brand-vault-v26.js` — filtros e busca local.
- `site/assets/v26-hero-reference.webp` — recorte da imagem enviada (preservada).
- `site/manifest-flagship-v25.json` — overlay SHA-256 atualizado para v26, baseline v23.10 imutável.
- `scripts/test_flagship.py` — 29 testes estáticos.
- `docs/QA_V26.json` — evidências tabulares.

**Decisão:** não alterar produção, não fazer merge e não ativar custos sem autorização específica.
