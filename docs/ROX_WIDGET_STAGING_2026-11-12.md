# LANDER RIO — ROX flutuante | Fase de homologação UI | 12/11/2026

## Resultado

Widget de chat **determinístico e offline**, em português, com design responsivo e recursos mínimos de acessibilidade. O código está disponível em `site/assets/rox-widget-v1.js` e `site/assets/rox-widget-v1.css`, mas **não inicia no site sem ativação explícita de prévia**.

Na versão de homologação, adicione `?rox-preview=1` ao endereço da home. Há também uma prévia HTML independente fornecida para testes em navegador, sem publicação.

## Controle de escopo e ativação

- Nenhum modelo generativo está ligado. O backend ROX 2.0 preparado anteriormente continua isolado em `prototypes/rox-ai-v2/`, não invocado pelo widget.
- Sem chamada externa automática, sem `fetch`, sem armazenamento local de conversas, sem painel administrativo e sem escrita em banco de dados.
- O chat só é montado no DOM se `rox-preview=1` ou `body[data-rox-preview="1"]` (somente para prévia local) estiver explícito. O default é **desabilitado**.
- O site mantém o canal existente de WhatsApp. O widget lê o número do link já presente no site e oferece **somente um link de handoff por ação voluntária**, sem enviar mensagens e sem copiar o conteúdo conversado.
- Mensagens com telefone/e-mail/documentos comuns são omitidas do histórico visual e recebem orientação de privacidade. Há limites de caracteres e de histórico em memória.
- Dúvidas sobre medicamentos e substâncias restritas não recebem CTA comercial. Não há orientação de dose nem venda intermediada.
- O widget não envia eventos próprios de abertura ou conteúdo da conversa. Se o visitante clicar num CTA WhatsApp, o script comercial pré-existente do site poderá registrar o clique sob a política de consentimento de analytics existente. **Clique não comprova conversa, pedido, receita ou venda.**

## Cenários comprovados localmente

- 33 testes unitários Node.js com `node --test scripts/rox-widget.test.cjs`.
- 36 testes funcionais em Chromium headless, viewport 390×844 (móvel) e 1365×864 (desktop). Para contornar a restrição de navegação por `localhost` do ambiente de testes, os arquivos foram carregados diretamente com Playwright `page.set_content`; não foram exercitados servidores reais nem iPhone físico.
- Sem erros JavaScript no navegador; sem chamadas HTTP externas; entrada contendo marcação HTML maliciosa renderizada como texto; viewport sem scroll horizontal; botões acessíveis por teclado; Escape fecha diálogo e devolve foco; cliques não realizados automaticamente.
- Ajuste adicional após revisão: mensagens que correspondem ao detector de dados pessoais não são ecoadas no histórico. Roteamento de varejo/atacado separado, preço de iPhone não vira lead comercial.

## Restrições ainda abertas

1. **NÃO APLICAR PRODUÇÃO:** falta validação da home recuperada em relação ao pacote exato de deploy Netlify, teste real em Safari iPhone, testes com leitores de tela e revisão WCAG.
2. A resposta é offline, limitada a regras. Não representa IA generativa capaz de responder todo assunto. Ativação de modelo depende de orçamento explicitamente aprovado e segurança/homologação do serviço.
3. Falta vínculo real com inbound WhatsApp e deduplicação de leads no HubSpot; não transformar eventos de clique em conversas reais.
4. Base de conhecimento comercial, preços, estoque e prazos exigem fontes atualizadas, consentimento e confirmação pela equipe. Não estão liberados neste widget.
5. A validação em Playwright não testou o ambiente de produção nem a interface administrativa do protótipo antigo; ela foi propositalmente excluída do widget público.

## Critérios de publicação

- Confirmar identidade visual final do personagem ROX, sem inventar ou publicar mascote não aprovado.
- Verificar o fluxo do WhatsApp sem disparar mensagens automáticas; testar permissão e atribuição de eventos apenas com consentimento.
- Revisar segurança e privacidade dos dados, experiência iOS, performance e rollback.
- A aprovação explícita de merge/deploy só deve ocorrer após essas etapas.