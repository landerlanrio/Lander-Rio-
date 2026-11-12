# LANDER RIO — Flagship v25.0 | Implementação e homologação

**Data:** 12/11/2026. **Ambiente:** GitHub branch `design/flagship-v25-approved-2026-11-12` (PR draft #5) e pacote Netlify manual separado. **Domínio de produção não alterado nesta implementação.**

## Origem, material e direitos
- Referência visual: oito imagens fornecidas pelo titular e mockups criados na conversa (não copiados como interface estática).
- Identidade: logo circular metálica com wordmark LANDER RIO fornecido pelo titular; recorte sem redesenho (WEBP responsivo). Não há substituição por monograma genérico.
- Atleta da home, fotografia de alimentação e hélice de DNA: ilustrações originais geradas nesta conversa, convertidas em arquivos WEBP locais, sem hotlink remoto ou métricas fictícias.
- Código de partida: arquivo `LANDER_RIO_SITE_COMPLETO_v23_10_SEIS_FEEDBACKS_PREPUBLICACAO.zip`, datado de 10/11/2026, recuperado da Biblioteca do titular. **Não foi demonstrada equivalência binária com o deploy publicado `6af28cd36c8c0ece64548aca`.**

## Escopo implementado
- Header editorial responsivo com logotipo oficial, navegação de secções, contato WhatsApp humano e menu móvel preservando `commerce-v21.js`.
- Hero fotográfico cinematográfico `PERFORMANCE IS CULTURE.`, hierarquia mobile-first, CTA para ferramentas e CTA WhatsApp, atributos descritivos sem alegações estatísticas.
- Cinco pilares editoriais, quatro cards clicáveis (treino, dieta, ciência e revenda), faixa editorial Performance & Science com DNA.
- Reestilização coerente das seções de ferramentas, atacado, varejo, parcerias, conteúdo, registros de recebimento, formulário, FAQ, marcas e footer.
- ROX **demonstração offline** (perguntas frequentes), sem integrações com modelos pagos, sem armazenamento de mensagens, sem API e sem envio automático. Link WA aparece apenas para intenções de contato comercial/humano e o usuário precisa clicar.
- A política de consentimento da instrumentação `measurement-v23-2.js` é mantida. `whatsapp_open_click` continua representando **abertura do destino**, não conversa confirmada ou venda.
- **80 outras páginas HTML, scripts funcionais, redirects, CSP, sitemap e configurações da versão v23.10 preservados byte-a-byte** na versão de pacote.

## Testes e evidências
| Teste | Escopo | Resultado |
| --- | --- | --- |
| Playwright Chromium | 9 larguras: 320, 360, 375, 390, 430, 768, 1024, 1280 e 1440 px | 9/9 sem overflow, imagens do hero carregadas, H1 único, sem JS exceptions |
| Menu móvel | Abrir e fechar via botão | Aprovado nos breakpoints móveis testados |
| ROX | Abrir, perguntar sobre treino, revenda, detectar handoff, fechar e restaurar foco | Aprovado na prévia HTML isolada em 390/1440 px |
| Testes estáticos Python | 25 verificações de meta, rotas, assets, semântica, ROX, conteúdo preservado | 25/25 |
| Testes ROX Node | 8 intenções/limites/sanitização/handoff/foco/nenhuma rede | 8/8 |
| Base histórica | 171 entradas do ZIP original comparadas por bytes | 1 arquivo alterado: `index.html`; demais originais preservados |
| Segurança | CSP e redirects originais não alterados | Verificação estática; não é pentest nem homologação de produção |

## Limitações reais
- O ambiente de inspeção não executou Lighthouse/Core Web Vitals nem Safari iOS/Android em hardware físico. Metas 90+/95+, LCP, CLS e INP são **não medidas**.
- A prévia HTML de chat integra CSS, imagens e scripts em linha para funcionar sem servidor, **mas não equivale à estrutura de CSP do site real**. Para publicação usar o **ZIP do site completo**, não o HTML de prévia.
- O usuário autorizou implementar o design, mas o conector Netlify disponível aqui fornece leitura do projeto/deploy, **sem ação de upload/deploy**; o deploy real ainda depende de um canal de publicação autorizado e de validação do artefato com o site atual.
- ROX 2.0, HubSpot, Supabase e WhatsApp Business API permanecem isolados e exigem homologação específica. O PR #5 não ativa nenhum custo de modelo ou mensagens.
- A publicação por ZIP substituiria o artefato Netlify; por isso exige comparação de rotas e backup do deploy existente antes de promover o site. Em caso de regressão, é necessário plano de fix-forward/versionamento, sem assumir rollback automático.

## Artefatos e release
- Fonte GitHub: PR draft #5 contra `staging`.
- Pacote completo: `LANDER_RIO_FLAGSHIP_V25_NETLIFY_PRONTO.zip` (site estático completo, 81 HTML, 6 imagens novas, CSS e JS novos).
- Prévia interativa offline: `LANDER_RIO_FLAGSHIP_V25_PREVIEW.html` (apenas homologação local).
- Relatório técnico + `LANDER_RIO_V25_QA.json` + capturas PNG (desktop, mobile e ROX).
- Aprovação final de publicação depende da conferência com deploy atual, da execução de testes em staging e da confirmação do processo de rollback/fix-forward.
