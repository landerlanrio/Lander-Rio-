# Homologação comercial isolada no GitHub Actions

O workflow `.github/workflows/commercial-homologation.yml` roda em PRs contra `release/flagship-mobile-qa-20261119`. Usa Node 24, Python 3.12 e ferramentas com lockfile (`@netlify/zip-it-and-ship-it` 16.6.0 e Playwright 1.58.2), instaladas no diretório temporário do runner.

Não existe job de deploy. As permissões são somente leitura e o checkout não preserva credenciais. Não há secrets de Netlify, Supabase, HubSpot ou WhatsApp no workflow. A execução usa apenas dados fictícios, containers descartáveis e portas de loopback; não cria tunnel ou serviço hospedado.

O fixture empacota a função Netlify real com seus imports de servidor e inicia PostgreSQL 17/PostgREST 13.0.4 locais. O navegador abre uma ponte HTTP local que serve o site e chama o handler compilado. A ponte confirma a origem local e representa essa origem por um HTTPS fictício fixo para o handler; isso não valida as regras de origem na borda hospedada. Os testes específicos do handler verificam origem e contrato separadamente.

O teste de indisponibilidade é uma injeção controlada no fixture. Não interrompe um banco hospedado. Timeout após gravação, repetição, conflito após recarga e consulta do registro persistido são exercitados com o mesmo identificador de solicitação.

O browser faz seis jornadas normais (Varejo/Revendedores em 360, 390 e 1440 px), clique duplo, timeout com repetição, indisponibilidade e recuperação, recarga com conflito, confirmação de evento sem dados pessoais e seleção dos dois perfis sem contar abertura do WhatsApp. Qualquer falha encerra o job com código diferente de zero.

Os artefatos enviados são apenas `browser/`, `evidence.json` e `tests.tap`: capturas e registros fictícios necessários para revisar o resultado. `env.json`, `fixture.env`, `state.json`, JWT, logs brutos do servidor e o bundle executável não são enviados. O cleanup roda mesmo após falha e remove apenas os recursos criados para essa execução.

Para repetir em Linux com Docker, Node 24 e Chromium, instale os arquivos `scripts/commercial-homologation-tools/package*.json` em uma pasta temporária com `npm ci`. Configure `NODE_PATH` para o `node_modules` dessa pasta. Depois execute, a partir da raiz:

```bash
node commercial-capture/remote-fixture.mjs start --out /tmp/lander-remote-review --site site --tools /tmp/lander-commercial-tools
node commercial-capture/remote-fixture.mjs test --out /tmp/lander-remote-review
```

O arquivo local `env.json` informa `LR_QA_BASE_URL` e `LR_QA_OUTPUT`; no Actions, o fixture os adiciona automaticamente a `GITHUB_ENV`. Com essas duas variáveis definidas, execute `node commercial-capture/browser-qa.cjs`. Em uma máquina com Chromium já instalado, `LR_QA_CHROMIUM_EXECUTABLE` pode apontar para ele. Ao terminar, execute:

```bash
node commercial-capture/remote-fixture.mjs stop --out /tmp/lander-remote-review
```

Um resultado aprovado neste runner comprova o código empacotado e a persistência local por HTTP/RPC. Supabase hospedado, implantação Netlify, credenciais de homologação, conta real da equipe, HubSpot e recebimento dos eventos em GA4/PostHog continuam sujeitos a verificações próprias.
