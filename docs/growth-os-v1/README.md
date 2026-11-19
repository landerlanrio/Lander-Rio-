# LANDER RIO — GROWTH OS 1.0 | Staging isolado

Atualização: 19/11/2026. Sem gastos, ativação de modelo, mensagens externas ou publicação em produção.

## Mensuração (somente leitura, dados verificados)

| Fonte e período | Observação | Limite |
| --- | --- | --- |
| GA4/OpenSEO: 20/10–18/11/2026 | 81 sessões: 24 Organic Search, 19 Direct, 19 Referral, 13 Organic Social, 6 AI Assistant | Sessão não equivale a pessoa |
| GA4/OpenSEO: 20/10–18/11/2026 | 31 eventos generate_lead, 29 usuários | Não confirmam conversas comerciais, nem leads B2B qualificados |
| GA4/OpenSEO: 20/10–18/11/2026 | Zero transações mensuradas e R$ 0 de receita rastreada | Não comprova ausência de vendas por WhatsApp |
| GSC/OpenSEO: 20/10–16/11/2026 | 29 URLs com impressões, com destaque para home e páginas de marca | Demanda majoritariamente navegacional; sem previsões inventadas |
| OpenSEO: auditoria de 14/11 | 50 páginas rastreadas; 33 URLs fora do crawl; 1 aviso e 5 páginas noindex informativas | Lighthouse sem pontuações válidas por limite de créditos |

GA4 conectado: propriedade 548953010, stream 15394318948, tag pública G-C3HWDYKEJK. Configuração identificada: America/Rio_Branco, diferente de America/Sao_Paulo; corrigir somente mediante autorização de mudança de produção. Busca interna, cliques externos e outros recursos de medição aprimorada estavam desativados. Preferir os eventos próprios consentidos; não ativar autocaptura indiscriminada.

O site já inclui measurement-v23-2.js (PostHog) e ga4-intent.js. Não adicionar novo listener de WhatsApp, não duplicar page_view, não considerar whatsapp_open_click como conversa. Uma conversa requer registro verificável na caixa de entrada; qualificação requer CRM; pedido/venda exigem origem transacional validada. O núcleo growth-core.mjs só valida classificações e não autentica fontes: a confirmação deve ocorrer em um backend confiável.

## ROX AI — prévia sem custos

O site oficial continua exibindo guia de respostas predefinidas. Esta prévia importa o motor determinístico existente prototypes/rox-ai-v2/agent-v3.mjs, sem rede, armazenamento, tokens pagos, CRM ou envio automático ao WhatsApp. Fica FORA de site/.

**Divergência real de implantação**: a Edge Function Supabase lander-rox-ai-v2-staging versão 12 observada em 19/11 aceita livecodes.io e subdomínios como Origin, enquanto o código correspondente no GitHub restringe origens a landerrio.com.br e www.landerrio.com.br. A implantação está com verify_jwt=false. Tratar como bloqueio de homologação: auditar origem, challenge, rate-limit durável e gates de orçamento antes de redirecionar tráfego; nunca executar deploy/custo de API automaticamente. Não há prova de exploração.

## SEO — ações preparadas para revisão

- Home: 172 impressões, 27 cliques, posição média 7,2. Revisar título e links para identidade LANDER RIO e Enciclopédia sem alterar funcionalidades.
- Perfil informativo Life Peptídeos: 181 impressões, 17 cliques, posição 4,8. Revisar precisão e proveniência de catálogo, sem oferta/posologia/promoção de medicamento.
- Perfil Landerlan Gold: 257 impressões, 6 cliques, posição 5,0. Conferir indexação e origem dos textos; manter contexto informativo.
- Cooper Pharma: 172 impressões, 7 cliques, posição 9,0. Validar título e canônica; nenhuma promessa clínica.
- Conteúdo educativo de treino e nutrição: fortalecer links internos já existentes. A amostra não sustenta estimativas de procura para novas pautas.

Não alterar noindex nas páginas com specialist_review_pending ou editorial_review_pending sem revisão humana. Usar dados atuais do GSC para reavaliar, sem novos créditos OpenSEO.

## Staging, testes e liberação

Repositório privado landerlanrio/Lander-Rio-. Base de revisão: release/flagship-mobile-qa-20261119 (PR #21), que por sua vez não deve ser confundida com o ZIP oficial. Deploy Netlify oficial observado: 6afe96a8a12db106eae1b9cd (19/11/2026, 06:26 UTC). O deploy é independente de commits GitHub; *não existe equivalência binária comprovada*. Este pacote preserva site/, workflows e produção integralmente.

Teste do contrato: node --test prototypes/growth-os-v1/growth-core.test.mjs

Prévia, somente local e sob a raiz do repositório:
python3 -m http.server 8766
Abrir http://localhost:8766/prototypes/growth-os-v1/

Bloqueios antes de promover: reconciliar ZIP do deploy real, validar iOS/desktop e consentimento, auditar função ROX implantada e segredos sem exibi-los, corrigir atribuição e timezone GA4 sob aprovação, validar políticas editoriais de indexabilidade, confirmar limites de custo e obter aprovação explícita para publicar produção.
