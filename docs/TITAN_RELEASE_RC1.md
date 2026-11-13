# DOSSIÊ EXECUTIVO DE RESOLUÇÃO — LANDER RIO

**TITAN 1.0.0 RC1 · 13/11/2026 UTC · candidata isolada, não publicada.**

## A. Resultado

| Sistema | Problema comprovado | Correção / trabalho aplicado | Teste | Estado real |
|---|---|---|---|---|
| GitHub / CI | PRs separados; falhas por hashes e WEBP não registrado | Integração seletiva sobre PR #10; overlays SHA-256 estritos; CI ampliado; importador mantido arquivado | 133 testes Node, 29 estruturais e 3 de integridade | IMPLEMENTADO, AGUARDANDO HOMOLOGAÇÃO |
| Netlify | Produção por upload manual, diferente das candidatas GitHub | Snapshot público comparado; publicação e rollback preparados | 168 arquivos obtidos; 165 idênticos, 2 transformações de formulário e 1 manifesto semanticamente igual | CONCLUÍDO E TESTADO — comparação; publicação BLOQUEADA POR APROVAÇÃO |
| Flagship / Brand Vault | Busca não reiniciava; ROX cortava borda mobile; hero com interface incorporada | Busca/foco corrigidos; menu e busca exclusivos; ROX reposicionado; hero limpo recuperado de v25; 14 logos do pacote v26 preservados | 47 verificações da home nas cinco larguras; axe; capturas reais | IMPLEMENTADO, AGUARDANDO HOMOLOGAÇÃO |
| Páginas / ferramentas / enciclopédia | Metadados longos e hierarquia inconsistente | 81 páginas preservadas; títulos, descrições e headings corrigidos | 3.458 referências locais; 61 verificações de páginas/formulários | IMPLEMENTADO, AGUARDANDO HOMOLOGAÇÃO |
| ROX local | Widget não carregava motor novo; contexto fragmentado | Motor antes do widget; linguagem informal; contexto mínimo de perfil, assunto e quantidade; encaminhamento manual seguro | Diálogos de várias etapas, limites, respostas inseguras, fallback e interface | IMPLEMENTADO, AGUARDANDO HOMOLOGAÇÃO |
| ROX com IA externa | Health real informa ausência de chave Groq, gratuidade confirmada, Turnstile e flag | Backend recuperado endurecido; corpo limitado, CORS fechado, rate limiter limitado; transporte opcional com consentimento/desafio/timeout | Provedor simulado, erros HTTP e payloads; sem inferência real | PARCIALMENTE CORRIGIDO — ativação BLOQUEADA POR ACESSO E APROVAÇÃO |
| WhatsApp | Clique confundível com conversa; contexto incompleto | Jornadas B2B/B2C e quantidade verificadas; ROX prepara resumo permitido | URLs e mensagens decodificadas; nenhum envio | IMPLEMENTADO, AGUARDANDO HOMOLOGAÇÃO; sessão Web BLOQUEADA POR ACESSO |
| HubSpot | 3.372 contatos; 3.359 sem e-mail e 2 sem proprietário; onboarding incompleto | Estrutura e contagens lidas; contrato mínimo e deduplicação preparados, sem alteração real | Leitura e mocks; conexão atual de e-mail e limite do plano não demonstrados | PARCIALMENTE CORRIGIDO |
| Supabase | `lander-crm` só responde health, não grava leads | 36 tabelas e 44 funções inspecionadas por metadados; fontes relevantes recuperadas; contratos preparados | RLS nas 36 tabelas; advisors lidos; sem escrita real | PARCIALMENTE CORRIGIDO |
| Revenue Intelligence | Código separado, sem prova confiável de etapas comerciais | Recuperação; gateway HMAC, janela temporal, idempotência, esquema fechado e evidência independente | Assinatura, repetição, PII, evidência falsa e falhas testadas com mocks | IMPLEMENTADO, AGUARDANDO HOMOLOGAÇÃO — persistência real bloqueada |
| Analytics | Eventos do navegador confundíveis com leads/vendas | Eventos ROX sem transcrição/PII; contrato explícito das etapas; comparação PostHog/GA4 | Eventos reais consultados e payloads testados | PARCIALMENTE CORRIGIDO |
| SEO | Auditoria parcial e metadados inconsistentes | OpenSEO consultado; correções técnicas locais; sitemap, canonicals e unicidade verificados | 81 páginas; 78 URLs no sitemap; nenhuma promessa de ranking | IMPLEMENTADO, AGUARDANDO HOMOLOGAÇÃO |
| Renderização visual | Cota HTML/CSS to Image 50/50 até 08/12 | Renderizador existente recuperado; ambiente isolado e saída regenerada | 11 testes; PNG 1080×1440 inspecionado; zero chamadas remotas no render | CONCLUÍDO E TESTADO |
| Gmail / Drive | Alerta de 08/11 prevê interrupção em 01/12; quota atual não exposta | Aviso lido; acesso aos conectores e documentos confirmado | Acesso atual não comprova capacidade resolvida | BLOQUEADO POR ACESSO — quota atual e decisão de armazenamento |
| Redes / automações | Risco de duplicar rotinas | Inventário consultado; cinco rotinas habilitadas e conexão Metricool identificados | Nenhuma tarefa, publicação ou campanha criada | CONCLUÍDO E TESTADO — inventário |

Os estados descrevem somente o escopo indicado. A candidata não equivale à operação inteira resolvida. Produção, contatos reais, banco, credenciais e mensagens não foram alterados.

## B. Evidências e fonte de verdade

### Versões e dependências

| Referência | SHA inspecionado | Decisão |
|---|---|---|
| `main` | `b4ef73f1b9e78681972029eaccc5d352ee39adcb` | Arquivo histórico; recuperar apenas importador desativado |
| `staging` | `3aa132b2a7a04e9f8cdf9d3f124124d0aa1bfa84` | Base de revisão do PR consolidado |
| PR #2 Revenue | `1f90e635996001f26fc21586b32c438aca465668` | Recuperado isoladamente; SQL não executado |
| PR #3 ROX 2 | `6e5af58bd58220a4f4f0106c8f005ea6f0d96cf3` | Ancestral do #5; não reaplicar |
| PR #5 ROX 3 | `929e37376a57d96021668f24bd00dd899d797cdb` | Motor, backend e testes recuperados |
| PR #6 v25 | `2f371f117b4ac2bdcc32ff315287a944423640cf` | Base histórica; hero reutilizado |
| PR #7 v25.1 | `9b667ae6e2f04bd5c5a4e53a6b241959ac1c4d03` | Base comercial contida no #10 |
| PR #8 SEO | `c73c5f989e185fce842492dce4292b0504541d5a` | Quatro correções portadas e ampliadas |
| PR #9 ponte ROX | `0f5dfe217d3f10d76fc3fe504cfab71867a3c63b` | Ponte portada seletivamente |
| PR #10 v26 | `2b6fa28a2785b97f883d18c2eca16157bc02f9cb` | Base exata de 206 arquivos, verificados antes das edições |

Não fazer merge de todos os PRs antigos em sequência. Esta candidata reúne as alterações selecionadas sobre v26. O pacote Brand Vault v26.1 alternativo foi comparado; aproveitamos o comportamento de busca sem sobrepor outra homepage completa.

Logs lidos: jobs `131338869918` (WEBP, PR #4 antigo), `131408326147` (hashes v25.1) e `131423730166` (hashes SEO). Os heads recentes dos PRs #5, #6, #7, #8 e #10 já tinham runs verdes; o #9 não tinha evidência equivalente. A falha histórica do #4 continua no seu histórico; não foi artificialmente marcada como resolvida.

### Testes executados

| Verificação | Resultado | Limite |
|---|---|---|
| Node — ROX, transporte, backend, gateway, Revenue | 133/133 | Mocks e HTTP local; não IA ou CRM real |
| Estrutura Flagship | 29/29 | Código/HTML |
| Metadados, WEBP e adulteração de manifesto | 3/3 | Inclui as 81 páginas |
| Integridade | 184 hashes, 81 páginas, 3.458 referências locais, 14 JSONs, 78 URLs; sem falhas/avisos | Não valida disponibilidade de todos os links externos |
| Sintaxe JavaScript | 28 arquivos aprovados | Não substitui análise integral da lógica |
| HTTP local | 15/15 rotas com 200 | Não valida proxy Netlify |
| Navegador — home | 47/47 | Chromium cloud 150; iframes 360/390/430/768/1440 px |
| Navegador — páginas/formulários | 61/61 | Oito páginas nas cinco larguras; dois formulários simulados |
| Acessibilidade automática | Zero violações nas páginas/regras examinadas pelo axe 4.11.1 | WCAG 2 A/AA e 2.1 AA; não certificação |
| Renderizador | 11/11; PNG 1080×1440 | WeasyPrint 70, PDFium 5.15, Pillow 13 |

Os formulários foram testados com falha 503, recibo inválido e sucesso com UUID fictício. O cálculo/liberação dos resultados ocorreu na interface, sem POST externo de cadastro. Harness e axe ficam fora de `site/` e do pacote publicado.

**Não executado:** Safari/WebKit/iPhone físico; Lighthouse; Core Web Vitals de campo; envio/recebimento real no WhatsApp; gravação HubSpot/Supabase; restauração de deploy; testes dinâmicos de RLS. O Chromium nativo falhou por socket/ProcessSingleton bloqueado; utilizamos o navegador gerenciado. Não foram atribuídas notas 90/95 sem medição.

Arquivos de prova estão em `docs/evidence/titan-rc1/`; logs e capturas acompanham a entrega. O comando reproduzível é `python3 scripts/validate_titan.py --out ../titan-validation`. O manifesto é gerado separadamente, nunca durante o CI, para não esconder adulterações.

### Produção Netlify

Projeto `1632727b-a57d-4edb-85f7-9fc99bc98842`, deploy `6af28cd36c8c0ece64548aca`, publicado em 10/11/2026 03:17:49 UTC. Método manual, commit/branch nulos, sem funções nesse deploy.

Dos 171 caminhos históricos, 168 foram obtidos publicamente. 165 coincidem byte a byte; dois formulários divergem pela transformação Netlify e o manifesto contém os mesmos 170 registros com serialização diferente. `_headers`, `_redirects` e `netlify.toml` não são servidos publicamente e retornaram 404: não são rotas públicas quebradas. Sua equivalência ao deploy não foi provada por download. O snapshot é evidência de conteúdo, não backup binário integral da infraestrutura.

### Métricas reais

PostHog, 30 dias até 13/11 parcial UTC: `site_visit` 16, `utility_started` 2, `utility_result_displayed` 2, `utility_registration_confirmed` 2, `cta_interaction` 3, `whatsapp_open_click` 2. O nome do evento não comprova a etapa comercial.

GA4 via OpenSEO, relatório de 14/10–11/11, fuso America/Rio_Branco: 86 sessões, 37 eventos-chave `generate_lead`, zero transações/receita. O retorno limitou a janela solicitada. **37 eventos não equivalem a 37 leads qualificados.** Não comparar diretamente ao PostHog: janelas, fusos, consentimentos e definições diferem.

Search Console via OpenSEO retornou páginas na janela 10/08–10/11. A auditoria existente tinha amostra de 50 páginas; o gate local cobriu 81. Não há prova de todas as páginas indexadas, ausência integral de órfãs ou melhora de ranking após uma alteração ainda não publicada.

## C. Pendências reais e impacto

1. **IA externa:** health confirma `groq_key_configured=false`, `free_tier_confirmed=false`, `turnstile_ready=false`, `enabled_flag=false`. Faltam conta/cota efetiva, segredo no servidor, desafio, rota `/api/rox/chat`, consentimento e teste real. Não há fallback pago autorizado. O ROX local continua utilizável dentro das intenções implementadas.
2. **Limites distribuídos:** o rate limiter em memória é limitado e falha fechado, mas não impõe quota global entre instâncias. Antes de ativar IA, definir limites efetivos no provedor e controle durável já autorizado.
3. **Persistência comercial:** `lander-crm` é health stub; nenhum sandbox foi comprovado. Gateway exige store transacional durável e callback de evidência independente. Store de teste não serve como banco de produção. Não executar `schema.sql` no projeto atual.
4. **WhatsApp:** inventário do navegador desta missão não contém sessão WhatsApp. URLs foram validadas na UI/código, não no aplicativo nativo. Nenhuma conversa foi classificada ou alterada.
5. **HubSpot:** onboarding não iniciado; conexão atual de e-mail e limites exatos não demonstrados. Conta reporta USD e US/Eastern. Ausência de e-mail não implica contato inválido em operação por WhatsApp. Não mesclar contatos reais automaticamente.
6. **Google:** e-mail de 08/11 informa 15 GB ocupados e interrupção prevista em 01/12. Quota atual não acessível; funcionamento hoje não prova resolução. Investigar capacidade sem apagar arquivos ou contratar automaticamente.
7. **Safari/performance:** falta homologação no iPhone real e medição Lighthouse em executor compatível. Hero reutiliza ilustração anterior v25, não uma nova fotografia documental. Confirmar aparência na homologação.
8. **Conteúdo herdado:** revisão clínica independente da enciclopédia e autorização dos autores dos depoimentos não foram comprovadas. Manter o gate editorial existente antes de nova publicação. Não foram criadas doses novas ou promessas de eficácia.
9. **Segurança:** RLS habilitado não comprova políticas corretas. Advisors apontam 20 tabelas sem policy (negação por padrão, não prova de exposição) e proteção contra senhas vazadas desativada. Não mudar permissões/segurança sem autorização. Não houve varredura externa completa de vulnerabilidades; o site não introduz pacote NPM de produção. Webhook recuperado contém envio/escrita reais e não foi invocado.

### Contrato de mensuração

| Etapa | Evidência aceitável | O que não basta |
|---|---|---|
| Visita/interação | Evento consentido com rota/origem/UTM permitida | Carregamento bloqueado por privacidade |
| Clique WhatsApp | Intenção do navegador | Não confirma envio ou lead |
| Conversa confirmada | Webhook validado e referência pseudônima | Flag enviada pelo navegador |
| Lead qualificado | Etapa verificada no CRM, responsável e critério | Evento chamado `generate_lead` |
| Venda | Pedido/pagamento conciliado, identificador e valor | Clique, orçamento ou captura sem conciliação |

Modelo mínimo: referência pseudônima; perfil; assunto permitido; quantidade opcional; origem/landing/UTMs; estágio; responsável; próximo acompanhamento; fonte e ID da evidência. Contato pessoal fica no CRM com consentimento, não na telemetria. Idempotência evita regravação do mesmo evento; deduplicação de pessoas depende de regra e revisão, não merge automático.

## D. Aprovações necessárias — uma lista

1. Homologar a candidata e autorizar separadamente o merge do PR consolidado e a publicação manual Netlify. Um não implica o outro.
2. IA: autorizar credenciais/desafio/rota em teste, confirmar cota gratuita e orçamento zero, depois teste real. Cobrança exige nova decisão.
3. CRM/banco: autorizar ambiente isolado e configuração oficial de webhook; aprovar campos e eventual moeda/fuso. Aprovar o site não autoriza migração ou alteração de contatos reais.
4. Armazenamento Google: obter quota atual e decidir sobre seleção explícita de arquivos ou plano já contratado. Não houve exclusão ou compra.

## E. Publicação e rollback

1. Homologar o SHA exato, Safari/iPhone, aparência, gates editoriais e medições possíveis. Conferir `release.json` e CI. Alteração posterior exige novo gate.
2. Após aprovação, merge para `staging`; isso não deve fazer deploy. Não alterar `main`, vínculo Git/Netlify ou políticas incidentalmente.
3. Reconsultar e registrar o deploy publicado imediatamente antes da ação. Se mudou desde `6af28cd36c8c0ece64548aca`, comparar novamente. Preservar o deploy anterior e configurações sem expor secrets.
4. Gerar ZIP determinístico com `scripts/package_titan.py`; conferir SHA-256 e publicar somente após autorização específica. O pacote contém apenas `site/`, sem protótipos, SQL, harness, logs ou chaves. IA externa continua desligada.
5. Validar domínio, release, 15 rotas críticas, headers/redirects, menu, busca, marcas, ROX, enciclopédia e WhatsApp. Formulários reais exigem teste autorizado e segregado.
6. Havendo regressão crítica, restaurar o deploy anterior existente na Netlify com autorização. Não usar ZIP reconstruído como se fosse backup integral. Revalidar rotas/headers e registrar motivo, horário e ID. Não há rollback de banco porque nenhum banco foi alterado.

Rollback preparado, **não executado**. Não ativar webhook durante homologação: ele contém ações de envio e escrita reais.

## F. Estado final e continuidade

Referência única: `titan-1.0.0-rc1`, manifesto explícito e PR consolidado de revisão. Documentos v25/v26 permanecem históricos. Não retomar v24 nem empilhar todas as branches.

Os arquivos históricos solicitados — `qa-results.json`, sua cópia, `RELATORIO_QA(3).md`, `index(20261112-013021).html` e relatório Flagship v25 — foram recuperados e lidos. Resultados antigos não substituem os testes atuais. O código útil foi recuperado sem reconstruir o projeto do zero.

O registro operacional desta entrega utiliza a Page existente **05 — Engenharia, QA e Controle de Releases**, sem criar Page duplicada. PR, SHA e CI devem ser registrados depois de efetivamente criados e lidos.
