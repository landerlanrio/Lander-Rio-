# LANDER RIO — PERFORMANCE CULTURE

Fonte revisada do site `https://landerrio.com.br`, da captação comercial e dos procedimentos de homologação. A versão publicada é identificada pelo deploy Netlify, pelo commit de origem e pelos hashes do artefato; um merge no GitHub não publica o site.

Este repositório é **público**, incluindo branches e histórico. Não é uma base de clientes, conversas ou credenciais. Nunca versionar tokens, chaves administrativas, arquivos `.env` reais, dados pessoais, dumps de banco ou evidências de clientes. Configurar segredos somente nos serviços autorizados, por meio seguro.

## Fonte e preservação

A baseline do deploy Netlify `6afe96a8a12db106eae1b9cd`, do projeto `lander-rio-oficial`, foi recuperada pela API autenticada em 22/11/2026. O ZIP oficial tem **339 arquivos**, 12.168.382 bytes e SHA-256 `1cdea807f158dd14f808f619648dd817c85794f9c4cd58a2b22ab96d93854574`. Essa baseline é uma referência histórica, não uma afirmação de que continua sendo a versão publicada após uma promoção posterior.

A captação comercial foi construída sobre essa fonte, preservando as páginas e integrações existentes. Os manifestos históricos registram as versões de origem; o manifesto da candidata registra suas alterações. Consulte `site/release.json` e as evidências de publicação para identificar o artefato em uso. Resultados antigos em `docs/` não constituem, por si só, validação da versão atual.

O bundle de recuperação v23.10 permanece recuperável no histórico de `main`, inclusive no commit `f1ce3269c158fed10ef6198ba8bd2c1f94c7c295`. Nenhum histórico é reescrito durante a consolidação. Branches e PRs divergentes permanecem preservadas e exigem revisão própria antes de integração.

## Estrutura e contrato comercial

- `site/`: páginas e ativos públicos; treino e dieta permanecem abaixo da área comercial.
- `netlify/functions/` e `commercial-capture/`: endpoint, armazenamento, testes e ferramentas de operação da solicitação comercial.
- `supabase/functions/`: fontes dos adaptadores de homologação e produção; não são ativados por um merge.
- `scripts/` e `.github/workflows/`: integridade, empacotamento e homologação isolada.
- `docs/`: decisões, procedimentos e evidências sanitizadas, com seu ambiente e data.

Varejo e Revendedores enviam uma solicitação com identificador persistente, origem e intenção. A interface confirma somente depois da gravação. A repetição do mesmo envio conserva o protocolo; conflito ou falha de armazenamento não produz confirmação falsa. Quando o CRM está indisponível, a solicitação permanece na fila durável para consulta autenticada e reconciliação autorizada.

A captação não ativa mensagens, campanhas, IA paga ou sincronização automática com o CRM. WhatsApp, coexistência no aplicativo e histórico de atendimento têm validação e operação próprias. Clique no WhatsApp, mensagem recebida, conversa qualificada e venda são indicadores distintos.

## Validar antes de promover

Use Python 3.12 e Node.js 24. Para a verificação inicial:

```sh
python3 scripts/verify_site.py
node --experimental-strip-types --test commercial-capture/*.test.mjs
```

O quality gate completa os testes estruturais, de integridade, segurança e indexabilidade. O workflow comercial executa PostgreSQL/PostgREST descartáveis, a função empacotada e o navegador com dados fictícios. O procedimento reproduzível e seus limites estão em [REMOTE_CI.md](docs/commercial-capture/REMOTE_CI.md) e em [commercial-capture/README.md](commercial-capture/README.md).

Antes de abrir uma prévia, conferir o destino de bancos, proxies, webhooks e serviços. Homologação deve usar destino isolado e dados fictícios, com mensagens e CRM desativados. Sucesso do build ou HTTP 200, isoladamente, não demonstra persistência de uma solicitação nem entrega ao atendimento.

## Publicação manual e controles

Os workflows de CI têm permissão somente de leitura e **nenhum job de deploy**. A importação inicial está arquivada como registro manual, sem restaurar arquivos ou publicar. A configuração Git da produção Netlify permanece desconectada; não a ativar como consequência da consolidação deste repositório.

Publicar somente o artefato revisado e aprovado para o ambiente correto, incluindo os handlers necessários; não enviar o repositório inteiro à pasta pública nem usar um ZIP apenas estático que omita as funções. Registrar commit, hashes, deploy, destinos de serviços, teste hospedado e procedimento de reversão antes da promoção. Toda alteração exige os testes correspondentes; dados pessoais reais, mensagens externas, gastos e mudanças críticas ou irreversíveis dependem de autorização específica.

O atendimento e a operação existentes devem ser preservados. Não ativar demos de IA, automações de saída ou campanhas por inferência a partir de uma aprovação de código.
