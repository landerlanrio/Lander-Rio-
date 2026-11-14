# LANDER INTENT ENGINE 0.2.0 — candidato privado

Evolução do MVP de 13/11/2026. Ingestão autenticada via OpenSEO existente, persistência no GitHub privado, ponte GA4 para o RC9 e handler privado compatível com Netlify. Sem dependências de produção novas, chamadas de IA ou deploy.

## Estado comprovado

- Coleta GSC real: 24 páginas, 14/10–10/11/2026, dataState=final. Janela de 28 dias com atraso conservador de 3 dias no fuso Pacific.
- 40 testes Node passaram: ingestão, paginação, CSV, painel em DOM simulado, autenticação do handler e ponte GA4 usando a medição RC9 como fixture. Reexecução CLI idempotente também verificada.
- GA4 existente verificado: G-C3HWDYKEJK. O pacote RC9 envia seu fluxo de medição ao PostHog; a ponte preparada reutiliza esses eventos e consentimento.
- Handler Netlify bloqueia acesso sem usuário autenticado e allowlist. Nenhum dado privado fica em public/.
- Inspeção visual/browser suite bloqueada pelo ambiente. Login Netlify real e recebimento de eventos novos no GA4 não homologados. Este resultado não libera produção.

## Executar localmente

Node 22+ (validado em 24.22.1), sem npm install:

```sh
npm run ingest
npm run build
npm test
npm start
```

Preview loopback em 127.0.0.1:4177, ou abra index.html em navegador autorizado. O HTML offline contém métricas privadas: não publicar como asset estático. A configuração Netlify publica somente public/ e serve o painel pela Function autenticada.

## Recorrência e atualização

docs/COLLECTOR.md define o contrato utilizado pela automação existente Painel Executivo. data/openseo-latest.json guarda o retorno autenticado e sua procedência. A ingestão valida tudo antes da substituição atômica. Erros preservam o último snapshot bom; queries não são somadas às páginas; GA4 ausente permanece null.

A automação não faz deploy. O endpoint autenticado pode buscar o snapshot mais recente do GitHub sem recompilar: requer token Contents:read de escopo mínimo no backend Netlify. Esse token não está disponível pela conexão de chat e não foi criado nem configurado. Sem ele, a atualização retorna 503 preservando o snapshot. O HTML offline é reconstruído sob demanda.

## Integração no site

```sh
node scripts/apply-ga4.mjs /copia/local/do/site-RC9
```

O script exige hashes RC9 verificados, insere a ponte nas páginas compatíveis e mantém ativação desligada. docs/ACTIVATION.md lista gates e matriz de eventos. Não substitua netlify.toml do site pelo deste módulo.

## Evidências

- evidence/node-tests.tap: log real; evidence/validation.json: escopo validado e bloqueios.
- evidence/provenance.json: versões de entrada, repo e deploy consultados.
- docs/HOMOLOGACAO.md: decisão de liberação.
- scripts/qa-browser.mjs: suíte browser preparada, ainda sem passe neste ambiente. Intercepta rede: mesmo quando passar, não comprova recebimento no GA4.

A Netlify não informou commit_ref: não foi demonstrada equivalência byte a byte do pacote RC9 com a produção. Nenhuma branch do site foi substituída.

O índice é prioridade editorial heurística, nunca projeção de receita ou promessa de ranking. O script opcional de IA permanece opt-in e não foi executado.
