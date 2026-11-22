# LANDER RIO — RC14.3 | Mobile, jornadas e homologação

**Data:** 2026-11-19. **Branch:** `release/flagship-mobile-qa-20261119`.

## Escopo executado
- Consolidação em branch derivada do PR #19 (que incorpora os diferenciais dos PRs #15–#18); **não** reproduzir a branch `main` na produção manual RC14.2.
- Hero comercial: texto mais claro e distinção entre revenda e atendimento individual.
- Handoff do WhatsApp explicitado: o visitante revisa a mensagem e escolhe enviar; nenhum envio automático.
- CTAs de primeira dobra legíveis no celular, altura mínima de toque de 56 px, sem bibliotecas adicionais.
- Testes de regressão para 14 páginas de marcas, 12 Cadernos, consentimento e semântica de medição comercial.

## Regras de publicação
1. A produção `landerrio.com.br` está no deploy manual `6afd3619fe28100b27f41641` (RC14.2).
2. Materializar o **ZIP oficial desse deploy** e aplicar o diferencial completo da branch, sem substituir assets históricos.
3. Comparar hashes, validar 106 HTMLs, caminhos, `_headers`, `_redirects` e sitemap.
4. Rodar CI, navegador em 320, 360, 390, 768, 1024 e 1440 px e validar GA4 com consentimento e sem consentimento.
5. Revisar a versão integral em preview privado; somente após a homologação e confirmação, promover o ZIP ao site oficial.
6. Não reativar ROX pago, API, integrações de atendimento ou vendas reguladas automaticamente.

## Medição e evidência
`whatsapp_open_click` é um evento de clique/abertura e **não comprova** conversa iniciada ou lead qualificado. `generate_lead` permanece reservado a cadastro confirmado pelo backend. Reconciliar conversas comerciais por canal autorizado antes de reportar conversão real.

**Pendente:** publicação manual no Netlify, revisão visual real da versão integral e testes remotos. Sem gastos, sem envio de mensagens a clientes.
