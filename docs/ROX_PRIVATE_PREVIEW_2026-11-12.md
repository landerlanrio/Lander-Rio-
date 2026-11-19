# ROX 3.0 — Prévia privada funcional — 12/11/2026

## Resultado

O widget flutuante de homologação conversa com o motor ROX 3.0 por HTTP real, sem nenhum provedor externo, por esta cadeia:

Navegador → POST local /api/rox/chat → adaptador loopback → handler ROX existente → agent-v3.mjs → JSON → widget.

Tudo está localizado fora da pasta site/ e do deploy de produção. Nenhum arquivo do PR Flagship #4, da produção Netlify, do Supabase ou do HubSpot foi modificado.

## Arquivos

- prototypes/rox-ai-v2/preview-private/index.html: interface e chat experimental.
- prototypes/rox-ai-v2/preview-private/preview.css: tema LANDER RIO, mobile-first, sem fontes externas.
- prototypes/rox-ai-v2/preview-private/preview.js: comunicação com backend local, histórico apenas em memória, fluxo de qualificação e orientação segura.
- prototypes/rox-ai-v2/preview-private/server.mjs: servidor HTTP privado em 127.0.0.1, importando o backend real index.ts.
- prototypes/rox-ai-v2/preview-private/server.test.mjs: testes automatizados HTTP, segurança e contratos comerciais.
- .github/workflows/ci.yml: nova validação e empacotamento do código-fonte em artefato GitHub privado e temporário, sem publicar o site.

## Execução local com Node 22

Na raiz do repositório:

    node --experimental-strip-types prototypes/rox-ai-v2/preview-private/server.mjs

Abrir o endereço 127.0.0.1 impresso no terminal. A porta é local e efêmera. Não há DNS, conta de provedor, chave, WhatsApp ou HubSpot. Esta prévia não abre automaticamente no iPhone remoto, porque o servidor só atende à própria máquina.

Teste de integração:

    node --experimental-strip-types --test prototypes/rox-ai-v2/preview-private/server.test.mjs

**Nunca fazer deploy do adaptador server.mjs.** Ele altera a origem apenas dentro do processo local para exercitar o handler existente com a allowlist de origem oficial, preservada no backend. Esta adaptação não é segura para proxies públicos. Deno.env.get é sempre undefined, mantendo modelos pagos inativos, inclusive quando há variáveis ambientais na máquina.

## Políticas testadas

- Perguntas de treino e dieta respondidas sem inventar dados.
- Atacado e varejo qualificados, contexto curto e tópico identificado.
- Encaminhamento mostrado apenas como rascunho, com aviso NÃO ENVIADO; não há link para WhatsApp nem criação de contato, conversa ou venda.
- CPF, e-mail, número de telefone e cartão comuns bloqueados no navegador antes do POST; o backend reforça a proteção.
- Temas clínicos e medicamentos restritos sem encaminhamento para venda ou doses.
- Preço do iPhone não vira oportunidade comercial LANDER RIO.
- HTML não é interpretado, apenas texto; CSP restrita, sem cookies, analytics ou persistência.
- Escape, fechar, limpar histórico e ações rápidas; fallbacks de erro HTTP e timeouts.
- O servidor só aceita o próprio loopback e restringe arquivos, métodos, tamanho e headers.

## Cenários de QA no navegador

1. Abrir o widget, enviar Oi e ler a resposta.
2. Enviar Quero revender no atacado e verificar perfil, assunto e cartão NÃO ENVIADO.
3. Depois perguntar Quero catálogo, confirmando persistência apenas durante a sessão.
4. Limpar e perguntar Quero comprar no varejo.
5. Perguntar preço do iPhone; não deve exibir cartão comercial.
6. Perguntar Ozempic; deve orientar com segurança e sem CTA comercial.
7. Inserir um e-mail ou telefone de exemplo; não deve ecoar ou enviar.
8. Testar teclado, Escape, largura mobile, markup HTML e erro de rede.

## Limitações e gates

A suíte de HTTP valida o handler real e a forma JSON da resposta, mas não substitui um teste visual real com Safari no iPhone, leitor de tela, performance ou infraestrutura de produção. O artefato do GitHub contém código-fonte para execução privada, e não um URL público.

Antes de publicar, exigir equivalência com Netlify, unificação revisada com o widget do PR #4, rate limit durável, autenticação e antifraude, LGPD, consentimento, autenticação de webhook e eventos reais WhatsApp → CRM sem confundir clique com conversa/venda, e aprovação de orçamento se desejar IA generativa.

**Restrições:** manter o PR #5 em draft. Sem merge, deploy, SQL, mensagens, alterações de credenciais ou cobranças adicionais.
