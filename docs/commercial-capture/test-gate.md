# Gate local — 22/11/2026

Execução final em `/workspace/lander-rio`, após integração do backend (`b126d42`), formulário comercial e correção de metadados da candidata. Nenhuma escrita em serviços externos. Log integral: `test-gate.log`; resultados por categoria: `test-gate-summary.json`.

## Resultado final

Todas as18 categorias do quality gate local passaram. Node175 testes:173 aprovados,0 falhas e2 testes PostgreSQL ignorados por ausência da variável de ambiente do banco nesse runner. O agente do backend executou esses dois testes separadamente em PostgreSQL Docker; a evidência dessa execução deve ser vinculada ao relatório final. Os testes Node incluem `commercial-capture/*.test.mjs`, agora também cobertos no CI.

As suites Python existentes somam56 testes:55 aprovados e1 skip histórico declarado (`test_prior_manifest_bytes_are_preserved`, cujo conteúdo é coberto pelo verificador de integridade). Passaram referências HTML/CSS, sitemap/JSON, scanner de credenciais, sintaxe JS, integridade/tampering, indexabilidade, perfis de marca, editorial, smoke HTTP local de30 rotas e testes de empacotamento.

Verificação integral:314 arquivos por SHA-256,106HTML,59URLs de sitemap,zero erros e zero avisos. Indexabilidade preservada:59 páginas indexáveis e47 noindex. Esse gate valida estrutura/diretivas; não comprova o índice do Google, nem recebimento de lead, nem publicação.

## Falhas encontradas e correções do gate

A execução inicial apontou expectativas antigas de Hero WhatsApp direto, enquanto o novo contrato autorizado leva às páginas Varejo/Revendedores. Os testes passaram a exigir exatamente dois CTAs com destinos `/atacado/` e `/varejo/`, sem `data-wa` nem abertura externa. Os links WhatsApp restantes continuam validados como antes; foto e título aprovados da Hero permanecem cobertos pela fixture e seus hashes.

O pin de telemetria rc14.1 foi atualizado para a tag rc14.2 preservada do site publicado. Acrescentado teste de `commercial_request_saved`: só aceita confirmação backend e descarta nome, e-mail, protocolo e origem arbitrária. Consentimento e exclusões sensíveis permanecem cobertos. O teste RC10 só aceita o novo hash GA4 por um overlay que declara o hash substituído.

O HEAD79cb510 já incluía o redirect favicon sem atualizar o manifesto. Esse fix pré-existente foi preservado e pinado explicitamente, mantendo o teste do PNG. Nenhum manifesto histórico foi alterado.

## Manifesto e metadados

`manifest-commercial-capture-20261122.json` fixa101 arquivos (99 existentes e2 assets novos). `scripts/build_commercial_manifest.py` usa a base fixa `79cb510247b594d22c46005e9d9d22afc126197b`, não o HEAD mutável, para preservar os pins após novos commits. A candidata declara `commercial-capture-20261122`, status local sem publicação e deploy de referência `6afe96a8a12db106eae1b9cd`.

O snapshot HTTP recuperado não equivale ao ZIP completo original do Netlify. Configurações e arquivos desconhecidos continuam sendo gate independente de publicação. Testes de navegador/persistência comercial e PostgreSQL têm evidências próprias e não são substituídos por este gate.

## Verificação final no commit de código

Após configuração explícita do container PostgreSQL local sintético, a suíte Node completa passou **176/176 sem skips**. Registro: `evidence/final-node-tests.log`. O build local passou novamente: 314 hashes,106HTML,59URLs,zero avisos e30 rotas smoke. Não houve execução remota ou deploy.
