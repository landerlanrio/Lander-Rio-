# LANDER RIO — WORLD-CLASS FLAGSHIP / v24.1
**Status:** draft isolado em \`design/flagship-v24-2026-11-12\` (base \`staging\`), sem merge/deploy, gasto adicional ou alteração no Netlify, Supabase, HubSpot e WhatsApp.

## 1. Contexto de origem e diagnóstico
- Site atual (produção): https://landerrio.com.br/ — navegação e ferramenta gratuitas visíveis, rotas de varejo, revenda, conteúdo e enciclopédia.
- Fonte de código: \`staging\` privado, restauração do pacote v23.10 com 171 arquivos e 81 páginas HTML. **Equivalência byte a byte com o Netlify publicado não foi comprovada**; não substituir produção por esta branch.
- Primeiro impacto v23.10: faixa de 14 logos no topo, depois hero centrado na divisão atacado/varejo. Problema de comunicação: cultura, ciência e ferramentas perdem protagonismo no primeiro scroll. A solução preserva caminhos comerciais sem transformá-los em identidade dominante.
- Problemas de medição pré-existentes: \`whatsapp_open_click\` mede abertura, **não** envio/recebimento de mensagem, conversa qualificada ou venda. Nenhum novo evento inferido foi adicionado.
- O ROX 2.0 experimental permanece em PR #3 separado; esta branch usa **somente demonstração offline**, sem chamada de IA, gravação de chat, webhook, CRM ou dado clínico.

## 2. Alterações concretas
1. \`site/index.html\`: hero editorial cinematográfico com tipografia autoral, fotografia real já existente no site (\`training-*.webp\`), manifesto visual, quatro entradas para treino/nutrição/ciência/revenda. Diretório comercial de logos deslocado da primeira dobra, preservados os 14 registros originais, todas as demais áreas e o formulário opcional.
2. \`site/assets/flagship-v24.css\`: tokens de cor de marca (ônix \`#090909\`, grafite \`#17191B\`, titânio \`#777D80\`, off-white \`#F2F0EB\`, lime \`#C7FF28\`), escala fluida, layouts mobile, estados interativos, overlays fotográficos, navegação sticky, focus-visible, reduced-motion, chat ROX.
3. \`site/assets/rox-demo-v24.js\`: atendimento local por intenções para perguntas comuns, CTAs para ferramentas e encaminhamento opcional ao WhatsApp; sanitização, truncamento, não registra mensagem em storage, não faz chamadas HTTP, não simula disponibilidade nem prescrição. \`window.LanderRoxDemo.isDemo === true\`.
4. \`site/manifest-flagship-v24.json\`: overlay SHA-256 do HTML e assets novos. \`scripts/verify_site.py\` preserva verificação histórica do v23.10 e aplica overlay, sem regravar base.
5. \`scripts/test_flagship.py\` e CI: 14 verificações de links, semântica, imagem, ROX, segurança, responsividade e arquivo original.
6. Mantidas sem mudanças: \`site/treino/\`, \`site/dieta/\`, \`site/enciclopedia/\`, \`site/_redirects\`, \`site/_headers\`, \`site/assets/measurement-v23-2.js\` e restante do site; não há biblioteca nova ou SDK pago.

## 3. Matriz antes / depois
| Dimensão | Antes (fonte v23.10) | Depois (branch 24.1) | Hipótese de impacto (não medida) |
| --- | --- | --- | --- |
| Primeiro contato | Carrossel de marcas primeiro | Hero editorial da cultura de performance | Maior autoridade/identidade |
| Hero | Atacado e varejo como título | PERFORMANCE IS CULTURE + trilhas | Maior profundidade de descoberta |
| Conteúdo | Links após áreas comerciais | Atalhos para treino, nutrição e ciência logo após hero | Mais uso de ferramentas |
| Conversão | CTA WhatsApp e formulário | CTA WhatsApp mantido + rotas contextuais | Qualidade maior de conversa |
| Atendimento assistido | Sem demonstração ROX na home v23.10 | ROX offline com respostas seguras e handoff | Reduzir dúvidas repetitivas, validar por teste |
| Acessibilidade | Base existente | Marco único de título, landmarks, foco, reduced-motion | Melhora potencial, sem auditoria completa |
| Infraestrutura | Site estático sem build complexo | Site estático, sem novas dependências externas | Baixo risco de peso adicional |

## 4. Contrato funcional / não-objetivos
- O ROX não é o backend de IA do PR #3; não lê HubSpot/Supabase/WhatsApp, não se lembra fora da janela aberta, não tem automação de mensagens.
- As mensagens geradas pelo ROX são de contexto geral, sem copiar texto livre digitado pelo visitante; handoff só é aberto por clique.
- O consentimento analítico atual é respeitado; eventos de abertura do WhatsApp continuam significando **tentativa de abertura** e não conversão.
- A homepage nova usa as rotas existentes para links. **Não alterar** conteúdo médico, prescrição, venda de itens restritos ou mensagens sobre disponibilidade automática.
- A camada de estilo foi projetada para homepage e não tem pretensão de redesign integral das outras 80 páginas nesta fase.

## 5. Quality gates
- Obrigatórios: \`python3 scripts/verify_site.py\`, \`python3 scripts/test_flagship.py\`, \`python3 scripts/smoke_http.py\`, \`find site -name '*.js' -type f -print0 | xargs -0 -r -n1 node --check\`.
- Revisões adicionais antes de aprovação do release: axe/WCAG 2.2 AA em Safari iOS e Chrome Android, testes reais de teclado e leitor de tela, verificação de imagens carregadas, formulários, jornada de cadastro e CTAs.
- Lighthouse 90+ mobile/95+ acessibilidade/95+ SEO, LCP ≤2,5s, INP ≤200ms e CLS ≤0,1 são **metas, não resultados medidos**. Requerem URL de staging hospedado e dados de campo suficientes.
- No GitHub Actions, build/job **não faz deploy**. CI aprovado não autoriza publicação.

## 6. Critérios de rollback e decisão
- Branch sem alterações no ambiente atual: rollback imediato possível por descarte do draft.
- Antes de qualquer deploy futuro: validar equivalência artefato com Netlify de produção, separar ROX demonstrativo do produto IA, testar mais rotas, revisar conformidade jurídica, registrar baseline CWV e capturas de tela comparáveis.
- Evidência de conversa recebida só pode vir de backend autenticado e autorizado, não de clique em \`wa.me\`.
- Não conectar PR #2 e #3 por merge automático nem ativar APIs pagas.

**Próximo gate humano:** revisão visual do preview offline, homologação em dispositivos reais e autorização explícita apenas quando o produto estiver comprovado.
