# Gates de ativação — nenhuma produção alterada

## Painel separado na Netlify

Não substituir a configuração do site público. Implantar o diretório `intent-engine/` em ambiente privado separado, somente após aprovação de uso de recursos de deploy. `public/` contém apenas a entrada sem métricas; `/intent/` é servido pela Function depois de autenticação.

O handler exige `context.user` assinado pela Netlify, sessão válida e `INTENT_ALLOWED_USER_IDS` com os IDs explícitos autorizados. Sem qualquer requisito, retorna 401/403. Não aceita headers de identidade nem senha/token no browser. Proteção por senha simples não fornece `context.user`: usar projeto privado ou team login suportado pelo plano. A disponibilidade/custo dessa proteção ainda deve ser confirmado; não foi criado plano ou serviço.

Variáveis no escopo Functions, sem valores neste projeto:

| Variável | Finalidade |
| --- | --- |
| INTENT_ALLOWED_USER_IDS | IDs Netlify permitidos, separados por vírgula |
| INTENT_GITHUB_READ_TOKEN | Token GitHub de escopo mínimo Contents:read, restrito a este repositório |

Não reutilizar chave de administrador. Não enviar credenciais pelo chat. Configurar pelo gerenciador seguro do provedor. O site de produção consultado não tinha variáveis de ambiente retornadas pelo conector.

## GA4 RC9

A propriedade existente é `properties/548953010`, fluxo `15394318948`, ID público `G-C3HWDYKEJK`. Nenhuma propriedade nova foi criada. O fuso retornado é **America/Rio_Branco**, divergente de São Paulo; não foi alterado automaticamente.

`node scripts/apply-ga4.mjs /copia/site` aplica a ponte a uma cópia do RC9 com baseline SHA validada. A primeira aplicação local alterou 24 páginas HTML, adicionou dois arquivos e ajustou CSP. Não substitui o site por este painel. O script mantém GA4 desativado por padrão e é idempotente.

Antes de ativar `integration/ga4-config.js`:

1. Revisar medição otimizada no fluxo existente. Desativar coleta automática de outbound clicks, formulários, pesquisa e histórico/page_view se sobrepuserem a instrumentação própria ou enviarem URLs de WhatsApp, termos livres e campos de formulário. A configuração remota não foi alterada. `enhancedMeasurementReviewed` deve ficar false até a revisão real.
2. Confirmar a propriedade/tag única: a ponte recusa iniciar se houver gtag/Google Tag Manager anterior. O RC9 lido usa PostHog e evento `lander:measurement`, reutilizado aqui; outras versões precisam de nova conferência.
3. Após aprovação de deploy, habilitar `enabled` e `enhancedMeasurementReviewed`. Debug apenas em sessão de teste autorizada; desativá-lo na entrega pública.
4. Homologar no Tag Assistant/DebugView: consentimento negado sem tag, aceite com uma page_view, whatsapp_open_click sem generate_lead, cadastro confirmado com generate_lead, revogação sem eventos adicionais. Confirmar recebimento no GA4 e não apenas na fila JavaScript. Os testes locais não enviam eventos reais.

## Eventos

| Origem RC9 | GA4 | Significado |
| --- | --- | --- |
| site_visit | page_view | Uma visita por documento, com consentimento |
| whatsapp_open_click | whatsapp_open_click | Clique; nunca conversa confirmada |
| utility_registration_confirmed | generate_lead | Cadastro confirmado pelo backend RC9; não venda |
| utility_started / utility_result_displayed | Mesmo nome | Etapas da ferramenta, sem campos pessoais |
| cta_interaction / profile_selected / hero_view | Mesmo nome | Interações com valores permitidos |

O bridge não envia telefone, email, texto de busca, contact_reference, resultados de saúde, user_id ou URL completa de destino do WhatsApp. URLs de página são enviadas sem query/hash. Páginas que o RC9 considera sensíveis continuam sem coleta.

Fontes técnicas consultadas: https://developers.google.com/tag-platform/security/guides/consent ; https://developers.google.com/analytics/devguides/collection/ga4/reference/config ; https://developers.google.com/analytics/devguides/collection/ga4/views ; https://docs.netlify.com/build/functions/api/ .
