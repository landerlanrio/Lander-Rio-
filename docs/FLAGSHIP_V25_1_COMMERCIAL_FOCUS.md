# LANDER RIO — Flagship v25.1 / Marcas + Atacado + Varejo

**Data:** 12/11/2026  
**Escopo:** somente homepage, CSS adicional e testes. Desenvolvimento reversível em branch isolada. Sem merge, deploy de produção, mudanças em bancos, CRM ou envio de mensagens.

## Implementação

- O diretório informativo de **14 marcas** saiu do rodapé da homepage e passou para depois do hero e da barra de pilares, com cards maiores, logotipos existentes, carrossel acessível e CTA para `/marcas/`.
- A seção **ATACADO OU VAREJO** saiu de uma área de três cards compactos para dois painéis principais com hierarquia explícita, CTAs distintos com `data-profile="atacado"` e `data-profile="varejo"`, e opção secundária para parcerias.
- O hero ganhou atalhos ATACADO, VAREJO e MARCAS sem remover os acessos às ferramentas.
- O menu passou a expor Atacado / Varejo e Marcas, mantendo os demais caminhos do ecossistema.
- Os links de WhatsApp preservam o contato existente e exigem clique humano; não representam conversa recebida, estoque, preço ou venda confirmada.
- Os logos continuam como **referência informativa**, sem afirmar vínculo oficial, oferta ou disponibilidade.

## Evidência local

- **7 larguras de viewport:** 320, 375, 390, 430, 768, 1024 e 1440 px: sem overflow horizontal ou exceção JavaScript na homepage.
- **14/14 cards de marcas** preservados; logos lazy-load conforme a rolagem.
- **Dois perfis comerciais diferenciados**, sem sobreposição entre cards.
- **Interação funcional**: botões do carrossel movem o trilho no Chromium desktop/mobile; menu mobile abre; ROX abre sob clique; URLs WhatsApp permanecem separadas.
- **28 testes estáticos** Python aprovados e **8 testes Node** do ROX aprovados.
- **81 páginas HTML** preservadas (homepage alterada, outras 80 preservadas). APIs e formulários não foram homologados neste escopo.
- Sem novos SDKs, frameworks, APIs ou bibliotecas.

## Testes e bloqueadores futuros

- A prévia HTML autocontida tem JavaScript de demonstração e **bloqueia navegação externa/ envio** para não atingir sistemas reais. O ZIP do site contém rotas e ferramentas originais, mas só deve ser testado em staging isolado antes de qualquer publicação.
- **Não testados:** Safari físico, Lighthouse, LCP, INP, CLS, integrações do ROX com IA/CRM/WhatsApp, equivalência binária do Netlify atual.
- **Não publicar sem** conferência do artefato atual, backup, ambiente de homologação, revisão das ofertas permitidas por lei e plano de restauração.

## Arquivos alterados

- `site/index.html`
- `site/assets/flagship-v25-1.css` (novo)
- `site/manifest-flagship-v25.json` (overlay SHA-256 atualizado)
- `scripts/test_flagship.py` (novos gates)

Nenhuma outra página precisa mudar para a atualização visual da home. Não há dependência de conteúdo fictício ou métricas simuladas.
