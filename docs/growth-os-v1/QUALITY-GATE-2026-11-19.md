# LANDER RIO — GROWTH OS 1.0 | Gate executivo de homologação

Data: 19/11/2026 · Status: **NO-GO para produção; GO apenas para revisão isolada**.

## Resultado operacional desta auditoria

- GitHub: repositório privado `landerlanrio/Lander-Rio-`; PR #22 permanece **draft** contra `release/flagship-mobile-qa-20261119`. `main` é README de migração, não a fonte binariamente validada do deploy de produção.
- Netlify oficial: site `lander-rio-oficial`, deploy `6afe96a8a12db106eae1b9cd`, publicado às 06:26:58 UTC em 19/11/2026, `ready`. Origem API/drop, sem commit/branch GitHub associado. A paridade do ZIP oficial atual com a branch candidata **não está comprovada**.
- OpenSEO: projeto Brasil/português conectado; contexto e pesquisa anterior reutilizados, sem novas consultas pagas.
- PostHog: projeto `549264` com timezone UTC. Eventos `site_visit`, `whatsapp_open_click`, `utility_registration_confirmed`, `rox_opened` e outros confirmados no esquema; dashboard existente `2003529` mantido, sem duplicação. `data_catalog:read` indisponível no conector — definições canônicas de métricas não verificadas.
- GA4 (leitura histórica previamente registrada, 20/10–18/11): 81 sessões; 31 eventos `generate_lead` em 29 usuários, associados a cadastro de ferramentas; zero transações rastreadas. **Não** inferir conversas, leads B2B ou vendas a partir desses números. Timezone documentado `America/Rio_Branco`, distinto de Brasília.
- Supabase (agregados previamente registrados, mesma janela em Brasília): três registros de treino e zero novos de nutrição; 39 eventos OMEGA marcados como teste, zero eventos OMEGA de produção, zero resultados comerciais integrados confirmados. Ausência de registro na integração **não comprova ausência de clientes no WhatsApp**.
- Observabilidade Netlify, 19/11/2026 06:25–12:35 UTC: 1.283 respostas HTTP 200; 658 respostas HTTP 404; 221 respostas 304. A lista de 404 contém numerosas tentativas de varredura de arquivos inexistentes; não classificar todos como falhas de navegação humana. O caminho `/favicon.ico` acumulou oito 404; existe correção isolada no PR #23.

## Alteração realizada nesta etapa

- Commit `0f3e9c13b77c77fb7cd0924117d5ab60311e30cf`, em `feature/growth-os-v1-staging-20261119`: adiciona `prototypes/growth-os-v1/*.test.mjs` à lista de testes Node no workflow `.github/workflows/ci.yml`.
- Verificado por releitura da branch: padrão presente exatamente uma vez; nenhum job de deploy incluído; PR #22 continua aberto em **draft**; `site/`, WhatsApp, Netlify produção, GA4 Admin e integrações pagas não foram alterados nesta etapa.
- Os **10 testes do protótipo** constam como aprovados em execução local anterior na descrição do PR #22. **Não foram reexecutados nesta auditoria.** Não há CI nova validada para o commit acima.
- Atenção: o workflow dispara em PRs direcionados a `main` ou `staging`; o PR #22 está direcionado à branch de release. A alteração prepara o gate, mas ainda não produz check de CI no PR #22.

## Critérios de aceite obrigatórios antes da promoção

1. Recuperar e comparar arquivo por arquivo o ZIP **do deploy atual**, e não apenas de versões anteriores; registrar SHA-256, diferenças e inventário sem perdas.
2. Executar CI de toda a candidata, inclusive `prototypes/growth-os-v1/*.test.mjs`; confirmar status real do commit.
3. QA funcional em navegadores mobile/desktop (iOS/Safari incluído): Hero, menus, 14 destinos de marcas, ferramentas, acessibilidade, URLs de navegação, redirecionamentos e favicon.
4. Validar consentimento GA4/PostHog com recusa e concessão; evitar duplicação de `page_view` ou `whatsapp_open_click`. Padronizar apresentação temporal em `America/Sao_Paulo`, sem alterar fuso do GA4 Admin automaticamente.
5. Conciliar visitas, tentativas de WhatsApp, mensagens **confirmadas na caixa**, qualificação CRM e pedidos com provas distintas; nunca usar eventos de navegador como comprovante de venda.
6. Testar ROX staging em HTTP real, Turnstile, rate-limit, fallback e limite de custos antes de integrá-lo ao site. Nenhum serviço de IA paga ativo nesta auditoria.
7. Preservar `noindex` e conteúdos com revisão editorial/especialista pendente. Não liberar conteúdo sensível sem revisão adequada.
8. Para publicação: plano de rollback, checksum do pacote candidato e aprovação **específica** para produção.

## Ação recomendada

Manter PR #22 e #23 em draft, consolidar evidências da candidata com ZIP oficial atual e executar CI/QA fora de produção. Não gerar uma nova homepage ou duplicar instrumentação antes disso.

### Referências privadas

- [Growth OS PR #22](https://github.com/landerlanrio/Lander-Rio-/pull/22)
- [Favicon PR #23](https://github.com/landerlanrio/Lander-Rio-/pull/23)
- [Dashboard PostHog](https://us.posthog.com/project/549264/dashboard/2003529)
- [OpenSEO LANDER RIO](https://app.openseo.so/p/cc40f4de-9c11-47c9-be5b-dcb4387db222)

**Sem publicação, gastos, mensagens externas ou alteração do número/histórico do WhatsApp Business.**
