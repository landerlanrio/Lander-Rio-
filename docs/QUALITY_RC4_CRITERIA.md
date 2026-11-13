# Critérios de aceitação — revisão RC4

Escopo definido antes da revisão: homepage, navegação comercial, galeria, busca, privacidade, acesso às ferramentas e integridade das 81 páginas. Produção não pode ser alterada.

| Critério | Meta e método |
| --- | --- |
| Layout | Zero overflow horizontal ou imagens quebradas em 320, 360, 390, 430, 768, 1280 e 1440 px; verificar também celular baixo e orientação horizontal. |
| Clareza comercial | Atacado e varejo simultaneamente visíveis na Hero; mensagens distintas e número existente preservado; ferramentas depois do comercial. |
| Legibilidade | Texto comercial principal e parágrafos da homepage ≥14 CSS px; rótulos de ações ≥11 px. Microtipografia decorativa não pode transmitir informação necessária. Critério editorial interno, não mínimo imposto por WCAG. |
| Toque e teclado | Ações principais ≥44×44 px; demais controles avaliados contra 24×24 px ou exceções de espaçamento. Busca fecha com Escape, retorna foco; menu não prende teclado em elementos ocultos. |
| Acessibilidade | Zero violações automáticas críticas/sérias de WCAG A/AA nas rotas auditadas; contraste normal 4,5:1, texto grande 3:1; complementar com revisão manual. Não equivale a certificação WCAG integral. |
| Imagens | Fotografias originais intactas; marcas sem distorção; entregas dimensionadas para renderização real; imagens fora da Hero com lazy loading. |
| Carregamento | Hero ≤120 kB em AVIF e WebP; quatro logos da Hero ≤100 kB no total; HTML/CSS/JS inicial ≤150 kB gzip combinados. Orçamentos internos. |
| Estabilidade | CLS observado localmente ≤0,1. LCP local registrado separadamente: não representa campo ou rede móvel; INP e Core Web Vitals reais não serão inventados. |
| Movimento | Preferência reduzida desativa animação decorativa e rolagem suave; navegação permanece funcional sem JavaScript. |
| Integridade | Manifests SHA-256, 81 páginas, referências locais, metadados, regressões e pacote exportado aprovados. |
| Dados | Eventos somente após consentimento, sem conteúdo digitado; clique de WhatsApp identificado como clique. Sem mensagens, compras ou gravação externa real durante QA. |

Referência normativa: https://www.w3.org/TR/WCAG22/ . Resultados serão registrados com ferramenta, versão, condições, limitações e evidências; aprovação só no escopo efetivamente testado.
