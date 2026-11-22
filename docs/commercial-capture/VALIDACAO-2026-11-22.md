# LANDER RIO — decisão de homologação comercial, 22/11/2026

**Resultado principal: a jornada Varejo e Revendedores funciona na candidata local isolada, com armazenamento durável e protocolo. Produção permanece sem alteração. A candidata ainda não está liberada para publicação.**

## Evidência da jornada comercial

Origem: home `/?utm_source=ig&utm_medium=social&utm_campaign=lr-261122` → CTA Varejo ou Revendedores → página comercial → formulário → API HTTP real → SQLite persistente → consulta local da equipe. Chromium/Playwright em 360, 390 e 1440 px. Todos os contatos são fictícios `@example.test`. Antes de usar a prévia, confirmamos: banco SQLite local, API no loopback `127.0.0.1:3100`, CSP bloqueando hosts externos e nenhuma integração real encaminhada. Não foram usados dados de clientes.

| Teste | Esperado | Observado |
|---|---|---|
| Dois perfis × três larguras | Recibo só após gravar; um registro por solicitação | Seis respostas 201, seis protocolos correspondentes a registros consultados, nenhum overflow ou erro JS |
| Clique duplo | Uma requisição efetiva e um registro | Um POST, um registro; status “Salvando…” antes da confirmação |
| Resposta perdida após commit | Mostrar incerteza e repetir o mesmo envio sem duplicar | Backend salva e atrasa 15 s; navegador aborta aos 12 s; repetição com o mesmo corpo devolve o mesmo protocolo e mantém um registro |
| Banco indisponível | Não confirmar recebimento | HTTP 503, zero registros; ao restaurar banco, repetição salva um registro |
| Timeout + recarregar + dados diferentes | Não sobrescrever nem duplicar | HTTP 409; formulário permite corrigir; repetição dos dados originais retorna 200/duplicate e o mesmo protocolo |
| CRM indisponível | Receber e preservar fila | Registro permanece `pending`; erro do CRM não desfaz a captação |
| CRM volta / resposta CRM perdida | Recuperar sem criar contato duplicado | CRM simulado com upsert por e-mail: repetição mantém um contato; fila passa a `synced` com ID de ponte |
| Evento comercial | Só depois do recibo, sem dados do formulário | Um `commercial_request_saved` no snapshot consentido; nenhum em erro; nome/e-mail/protocolo não entram no evento |

Amostra reproduzível no registro `evidence/ui-isolated.json`:

- Varejo 360: `lrui-1795365614627-360-varejo@example.test`, protocolo `LR-5AB81D37F85D4964A158998B9C1BF9B7`.
- Revendedores 360: `lrui-1795365614627-360-atacado@example.test`, protocolo `LR-83556F8225A7488886246675CFDF8BC5`.
- Ambos: `intent=envio`, `entry_path=/`, `utm_source=instagram`, `utm_medium=social`, `utm_campaign=lr-261122`; `page_path` e perfil preservados separadamente.

SQLite foi reaberto nos testes para comprovar persistência além da instância do store. A proposta SQL foi exercitada em Postgres 17 local, com oito gravações concorrentes do mesmo ID: uma inserção, sete respostas duplicadas, um registro. RLS/permissões negam leitura e execução a `anon` e `authenticated`. A função compilada pelo empacotador Netlify 16.6.0 também foi executada contra PostgREST 13.0.4 + Postgres 17 locais: HTTP 201/200/409, um registro consultado e leitura anônima 401. Evidência `evidence/backend-http-bundle-evidence.json`. Não substitui a validação do gateway, credenciais e permissões do Supabase hospedado nem do rate limit na borda Netlify.

## Verificação e commit

Código da candidata: `0ca2dff8ad357c77c18af60851a01c0d5fc32501`, branch local `fix/commercial-capture-20261122`; sem push/merge/deploy. Suite Node final com Postgres local: **175/175 PASS, zero skips**. Gate completo anterior: 18/18 categorias; Python 55 aprovados e um skip histórico coberto pela verificação de hashes. Comando de build do Netlify executado localmente (`verify_site.py && smoke_http.py`): PASS, 30 rotas de smoke. Empacotamento da função por Netlify zip-it-and-ship-it também passou. Manifesto verificou 314 arquivos, 106 páginas, 59 URLs, sem erros/avisos. Os testes de navegador comprovam a jornada, além do build.

## Resultado — o que mudou

- Hero leva às rotas `/varejo/` e `/atacado/` na mesma aba. WhatsApp permanece acessível nas páginas comerciais.
- Formulários coletam e-mail, nome opcional, perfil, assunto, ciência de privacidade e origem filtrada; confirmação depende de recibo transacional.
- Endpoint Netlify `POST /api/commercial/lead`, limites de tamanho, origem exata, rate limit e chave de idempotência por solicitação. Sem configuração de armazenamento, responde 503.
- Tabela/RPC propostas são separadas do CRM interno existente. Nenhuma migração hospedada foi executada. Não há trigger de mensagem ou job de CRM na captação.
- Consulta protegida e reprocessamento manual documentados em `../../commercial-capture/README.md`. Origem e intenção ficam no registro de solicitação; o ID HubSpot permite a conciliação, sem criar propriedades remotas por suposição.
- Carbon Black, Performance Lime, ativos aprovados e ferramentas abaixo da área comercial preservados; assinatura interna em lime. Não houve redesenho de logos.
- Políticas de privacidade e metadados de release da candidata atualizados. Manifesto aditivo fixa os bytes; manifestos históricos preservados.

## Produção e repositório

Projeto `lander-rio-oficial`, site ID `1632727b-a57d-4edb-85f7-9fc99bc98842`; deploy ativo `6afe96a8a12db106eae1b9cd`, de 19/11/2026, upload por API, **branch e commit nulos**. Não atribuímos a produção a uma branch sem evidência. `main` contém a inicialização/recuperação; 22 PRs abertas foram preservadas.

Candidata partiu de `79cb510247b594d22c46005e9d9d22afc126197b` (release/flagship-mobile-qa-20261119), em branch local `fix/commercial-capture-20261122`. Dos 331 arquivos públicos conhecidos comparados, 233 iguais e 98 diferentes. Recuperamos 96 diferenças de produção antes das correções; `release.json` foi reescrito com estado verdadeiro da candidata e manifestos históricos ficaram intactos. `_headers`, `_redirects`, `netlify.toml` e arquivos desconhecidos não podem ser comprovados por esse snapshot HTTP. O ZIP completo original continua necessário.

## Integrações e números

- HubSpot 51817572: leitura funciona e retorna 3.372 contatos; limite de criação atual não é exposto pelo conector. Nenhuma escrita foi feita para sondar a cota. Cadastro local pendente não é contato HubSpot confirmado.
- Supabase: contingência existente atende treino/dieta. `public.leads` tem 2.404 registros com campo `pendente`, mas não há worker externo comprovado; não chamamos isso de backlog HubSpot. Acesso da equipe além do proprietário ainda exige definição.
- WhatsApp: Cloud em análise, ingresso business/envios/IA externa desativados. Legado sem credenciais necessárias. Provedor realmente conectado e coexistência no iPhone não foram comprovados. Número, histórico e flags preservados.
- ROX no site: motor offline por regras `3.1.0-titan-rc1-isolated`; nenhum modelo externo efetivamente acionado. Classificação/repetição/controle humano passaram no motor local; validação termina antes de webhook e mensagem reais.
- n8n antigo retorna 404 “No instance here”. Aproveitamos o registro do resgate já feito: candidata inativa. Fontes de workflow recuperadas não estavam disponíveis aqui para corrigir com segurança os defeitos históricos de lote/primeira saída/nota duplicada. Nada foi reativado.
- GA4: fuso `America/Rio_Branco`; 14–20/11 registra 12 sessões e nenhuma orgânica, enquanto GSC registra 39 cliques/608 impressões. Diferença indica lacuna a investigar, considerando consentimento e definições distintas.
- `generate_lead` atual representa ferramentas. Clique no WhatsApp é observável no navegador/PostHog; mensagem recebida depende do provedor/webhook; conversa qualificada depende do atendimento/CRM; venda depende de pedido/negócio conciliado. Nenhum desses quatro indicadores é intercambiável.
- Jornada nova conciliada com evento local e registro persistido. Recebimento do novo evento no GA4/PostHog remoto continua pendente; não enviamos tráfego de homologação para fabricar validação no painel.
- GSC: Landerlan 310 impressões/13 cliques, Gold 305/6 e Life 205/18 em 22/10–19/11. Prioridade de conteúdo: identificação/autenticidade, navegação e rota comercial dessas páginas. Sem volumes inventados. Exclusões clínicas/noindex e coleta restrita de marcas foram preservadas.
- SEO estrutural: 106 páginas, 59 URLs no sitemap; canonical/robots e rotas comerciais conferidos. Marca → conversa ainda depende do WhatsApp em CTAs remanescentes; atribuição exata por marca/publicação não foi comprovada.
- Metricool 7920240: dados de descoberta disponíveis; sem prova post → solicitação. Agendas preservadas, nenhuma campanha ativada. Ausência de linhas de website/profile link não foi reportada como zero cliques.

Os relatórios por frente nesta pasta registram consultas, períodos e limites. Os dois arquivos de contingência solicitados não foram localizados no escopo local/Drive/Pages acessível; podem existir fora do índice. Registros anteriores foram usados como pistas, com leituras atuais separadas de evidência histórica.

## Pendência — por que ainda não publicar

1. Falta conciliar o ZIP integral/configurações do deploy ativo. Publicar o repositório como se fosse esse ZIP poderia remover trabalho existente.
2. Supabase hospedado e Netlify Functions precisam de homologação conjunta isolada, com destinos explicitamente conferidos, credenciais server-only e origem autorizada. Os testes atuais usaram SQLite e Postgres locais; o adapter foi exercitado por HTTP real contra PostgREST local e com respostas controladas nos testes de falha.
3. Falta provar que um login autorizado da equipe consulta a nova tabela em homologação. Consulta local e SQL são demonstração técnica, não acesso operacional já concedido.
4. Reprocessamento HubSpot foi demonstrado com CRM simulado. Antes de uso real, comprovar capacidade, inventariar workflows acionados por criação/atualização e autorizar a operação para preservar a ausência de saída automática.
5. Safari/iPhone físico, recebimento remoto dos eventos, mensagens e coexistência continuam pendentes. Não trocar canal ou recontratar n8n por inferência.

## Próxima ação — decisão específica

**Aprovar homologação remota isolada, sem publicação em produção**, somente após confirmar custo e separação dos destinos. Escopo: aplicar a proposta SQL num banco de teste aprovado, configurar a função com esse banco e origem da prévia, conceder consulta ao login de equipe definido e repetir a mesma matriz com dados fictícios. Nenhuma campanha, mensagem ou automação de saída será ativada.

Ação adicional do titular: disponibilizar o ZIP completo do deploy `6afe96a8a12db106eae1b9cd` e leitura de uso/limites no HubSpot. Com isso será possível concluir o gate e preparar pedido de aprovação de produção com o delta final.

Publicação futura incluiria HTML/CSS/JS reconciliados, função Netlify e schema aprovados; um ZIP somente de arquivos estáticos não instala a função. Verificação: repetir os dois perfis, conferir protocolo na consulta protegida, origem/intenção e fila pendente. Reversão de uma publicação defeituosa: preparar commit que reverta UI/função e publicar esse revert mediante autorização, preservando registros e tabela; não apagar solicitações nem substituir a base por um backup antigo. Nenhum deploy foi realizado nesta execução.
