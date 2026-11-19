# ROX AI 2.0 — pacote isolado de homologação (sem deploy)

Este código foi derivado do arquivo `ROX_2_BACKEND_STAGING.txt` já existente na Biblioteca em 12/11/2026. Fica **fora da pasta `site/`** para evitar publicação acidental. Não existe serviço provisionado, API de modelo autorizada nem integração de CRM/WhatsApp comprovada neste pacote.

## Avanço desta revisão

1. Roteamento comercial mais específico: dúvidas sobre iPhone, cinema e passagem **não viram atendimento comercial** apenas por conter “preço”, “valor” ou “seu”. Perguntas sobre revenda, catálogo, pedidos e estoque continuam direcionadas à equipe.
2. FAQ determinístico e gratuito para saudação, apresentação da marca, área de atuação sem inventar endereço, treino, dieta, recuperação e orientações gerais de hipertrofia. Quando faltam fatos, o ROX diz que não sabe, em vez de inventar. A ferramenta em si continua a exigir os critérios de cadastro do site quando aplicáveis.
3. CORS limitado aos dois hosts HTTPS oficiais, sem aceitar origens arbitrárias de plataformas de prévia de terceiros. Não há permissão para expor a API a uma interface externa de demonstração.
4. 20 testes isolados cobrindo roteamento, proteção de dados, proibição de comércio de substâncias controladas, ausência de contatos ou vendas fictícios, bloqueios de custo e ausência de solicitações externas. Nenhum dos testes faz chamadas a OpenAI, Supabase, WhatsApp ou outros endpoints.

## Verificação local

Requer Node.js 22.16+; execução feita sem pacotes externos:

```sh
node --experimental-strip-types --test prototypes/rox-ai-v2/index.test.mjs
```

Também foi validada a análise de tipos localmente com TypeScript global:

```sh
tsc --noEmit --skipLibCheck --lib ES2022,DOM --target ES2022 --module ESNext prototypes/rox-ai-v2/index.ts
```

## Custos e segurança

Nenhum modo generativo é iniciado se faltar qualquer condição: `ROX_AI_ENABLED=true`, `ROX_AI_BUDGET_APPROVED=true`, `OPENAI_API_KEY`, `ROX_AI_MODEL`, `ROX_TURNSTILE_SECRET` e `ROX_TURNSTILE_SITE_KEY`. **Não definir essas variáveis no ambiente produtivo sem aprovação explícita.** Nunca salvar credenciais no repositório.

O modo offline só responde perguntas pré-definidas e educativas; **não é um modelo de linguagem geral**. Atendimento comercial é uma orientação para encaminhamento voluntário pelo usuário, e não mensagem enviada ou lead capturado. Pedidos, preço, estoque e prazo são indeterminados. O encaminhamento de medicamentos sujeitos a prescrição, substâncias controladas ou não autorizadas para venda é proibido.

## Impedimentos antes de homologação remota ou produção

- **Sem credenciais ou cobrança:** exigir aprovação de orçamento e preço/modelo, limites de uso, retenção e proteção de credenciais.
- **Rate limiting:** a versão atual usa contador em memória e cabeçalho IP não autenticado; isso é insuficiente para isolamento de abuse/DoS distribuído. Exigir limitação durável no perímetro confiável, sem provisionar serviço faturável antes da autorização.
- **CORS e CSP:** manter apenas origens próprias e ajustar a política CSP apenas depois de definir domínio real, implementação e revisão.
- **Frontend:** nunca publicar o `index(20261112-013021).html` atual, pois seu painel administrativo está junto do chat público; separar UI, autenticação e autorização no servidor.
- **WhatsApp/HubSpot:** não afirmar conversa, lead qualificado, pedido ou venda com base em cliques; exigir eventos e evidências reais, consentimento e deduplicação testada.
- **Privacidade/LGPD:** minimizar e limitar retenção, impedir PII de ser enviada a modelos sem base legal e revisar o contrato de dados; testes adversariais e validação por operador.
- **Funcionalidade:** testes reais de navegador, iOS, acessibilidade, fallbacks e auditoria de performance antes de release.

**Status:** código e testes locais prontos para revisão em PR draft, **não pronto para deploy**.