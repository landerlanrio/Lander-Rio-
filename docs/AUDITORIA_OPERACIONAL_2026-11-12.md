# LANDER RIO — Auditoria operacional executiva | 12/11/2026

**Escopo:** ambiente digital e comercial acessível por conectores; apuração somente leitura + melhorias em branch isolada. **Não alterou produção, Netlify, Supabase, HubSpot, dados de clientes, senhas, contratos, automações existentes nem enviou mensagens.** Não houve compra nem ativação de serviço pago.

## 1. Ação urgente: credenciais Google

Mensagem de alerta crítico do Google em **12/11/2026** relata tentativa bloqueada após uso da senha da conta. Uma tentativa bloqueada **não é prova de invasão**, mas exige revisão humana imediata na atividade de segurança da Conta Google, revogação de sessões desconhecidas, troca da senha conforme necessidade e conferência da autenticação em dois fatores. Outros alertas de login em iPhone podem se referir a operações legítimas e precisam ser confirmados pelo titular.

- [Abrir alerta na caixa do titular](https://mail.google.com/mail/u/?authuser=igorziturjpa1992%40gmail.com#all/1a1cd73f8da87933)
- [Verificações de segurança da Conta Google](https://myaccount.google.com/security-checkup)

## 2. Infraestrutura — evidência observada

| Componente | Evidência em 12/11 | Decisão segura |
|---|---|---|
| Netlify `lander-rio-oficial` | Deploy publicado `6af28cd36c8c0ece64548aca`, estado `ready` | Não tocar no domínio de produção; manter rollback manual |
| Logs Netlify | 527 respostas `404` no intervalo 11/11 06:30 UTC a 12/11 06:00 UTC; pedidos a `.git/config`, `.env`, caminhos de WordPress; sem HTTP 5xx na consulta | Tratar majoritariamente como varredura automatizada; não inferir problema de navegação a partir desses totais; monitorar bloqueios e investigar rotas legítimas separadamente |
| Supabase `artcokrtuqppgtawuczq` | `ACTIVE_HEALTHY`, sem branch de dev; advisor sinaliza 20 tabelas RLS sem política (INFO) e revisão de senhas vazadas | Preservar RLS; auditar grants e privilégios para `anon`/`authenticated` antes de qualquer mudança |
| Edge Functions | Funções `whatsapp-webhook`, `lander-crm` e outras estão `ACTIVE` | Existência de função não prova tráfego, webhook válido ou sincronização; não mudar produção |
| GitHub | Repo `landerlanrio/Lander-Rio-` **privado**, PR draft #2 com 44 testes no workflow de CI concluído | Manter separação staging/main e não realizar merge/deploy |

Referências: [Netlify](https://app.netlify.com/projects/lander-rio-oficial), [GitHub draft PR #2](https://github.com/landerlanrio/Lander-Rio-/pull/2), [CI aprovado](https://github.com/landerlanrio/Lander-Rio-/actions/runs/43160354162), [Supabase advisor](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).

**Nota de procedência:** o GitHub `staging` contém reconstrução do site com 171 arquivos, mas não há comprovação de equivalência binária com o deploy atual do Netlify. Não trocar a origem de publicação sem esta validação.

## 3. Receita e funil — métricas de bases distintas

| Sistema | Contagem verificada | Limitação |
|---|---:|---|
| HubSpot — CONTACT | 3.372 | Total cadastrado, não clientes ou leads ativos por definição |
| HubSpot — DEAL | 0 | Nenhum negócio registrado nesse objeto |
| Supabase `public.leads` | 2.404 | Contagem local, não somar ao HubSpot por possível duplicação |
| Supabase `public.wa_conversations` | 0 | Sem confirmação de conversa nessa tabela; não prova zero conversas no WhatsApp real |
| Supabase `public.lead_activities` | 4 | Baixo uso de trilha de atividades; requer investigação |
| Supabase `public.leads` com `valor_fechado > 0` | 0 | Faturamento não está comprovado por essa fonte |
| Supabase `public.leads` criados nos últimos sete dias | 1 | Série depende de `created_at`; sem garantia de completude de todas as entradas comerciais |

**Impacto:** não é possível apresentar taxa confiável de conversas, leads qualificados, pedidos, vendas ou margem a partir dessas fontes, hoje. Uma visita, clique, mensagem preparada ou abertura de WhatsApp não equivalem à conversa recebida. Uma conversa também não equivale à venda.

**P0:** construir trilha `sessão -> origem -> clique -> mensagem recebida -> atendimento -> oportunidade -> venda comprovada -> margem`, com consentimento, identidade auditável, idempotência, backend autenticado e direitos LGPD. O PR #2 implementa parte dos contratos e testes offline, não a sincronização em produção.

## 4. ROX — correção executada sem custo

O backend experimental ROX 2.0 foi recuperado da Biblioteca, colocado em `prototypes/rox-ai-v2/index.ts` e endurecido:
- classificação natural: preço de iPhone/cinema/passagem deixou de ir automaticamente para comercial;
- respostas diretas e seguras sem IA paga para perguntas sobre a marca, ferramentas de treino e dieta, educação em treino e suporte;
- host de origem HTTPS limitado ao domínio oficial;
- zero mensagens, zero escrita de dados e zero chamadas reais ao modelo nos testes;
- **20/20 testes locais passaram, TypeScript validado**, além do CI previamente existente da fase Revenue Intelligence.

A interface protótipo anterior passou 10/10 testes locais, mas **não é segura para publicação**: painel administrativo na página pública, sem autenticação, sem conexão real com CRM ou WhatsApp e sem auditoria LGPD. O backend ROX no branch continua fora do diretório publicado e sem autorização de orçamento/modelo.

## 5. Aquisição, conteúdo e SEO

- Metricool possui a marca `Landerrio` e a conta @lander.rio conectada. A consulta de evolução Instagram retornou amostras de 05 a 10/11, **sem dado de 11/11**, portanto não inferir queda consolidada nem desempenho de ontem.
- [Pacote editorial LANDER FLASH / HYROX](https://docs.google.com/document/d/1MNrO4S5T5nKV8SHVD0793kqrdMl0z4rq-_pH47mgrMw/edit) contém três roteiros previstos para 18–20/11; nenhum vídeo ou publicação foi comprovado nesta auditoria.
- O repositório staging possui `robots.txt`, `sitemap.xml`, CSP e redirects. A presença no repositório não prova equivalência com o Netlify publicado. Testar URLs canônicas e Search Console após restaurar acesso aos dados.
- **GSC Wizard indisponível sem assinatura** (trial encerrado); não contratar ou ativar gasto sem autorização.
- **PostHog:** integração está conectada mas consultas avançadas da camada de métricas foram recusadas por falta da permissão `data_catalog:read`. Não inventar taxas ou usar a ausência de resposta como zero.

## 6. Agenda de 13/11 e prioridades para manhã

A busca na agenda **primária** Google Calendar em 13/11 não retornou compromissos; isso não cobre agendas secundárias nem confirma dia livre. Rotinas já existentes: Radar Instagram 08:00, Painel executivo 08:45, Parcerias sexta 09:00 (horário de Brasília); não foram duplicadas.

1. **P0 — Segurança da conta Google:** titular confirmar tentativa bloqueada e sessões. Risco: acesso aos serviços comerciais e fontes de dados.
2. **P1 — Conversão real:** decidir qual evidência de conversa recebida é tecnicamente acessível no WhatsApp Business, antes de escrever em HubSpot/Supabase. Valor: qualidade de receita e fim da atribuição fictícia.
3. **P1 — Homologar ROX:** revisar o novo PR draft; validar UX isolada e implementar limites persistentes antes de qualquer modelo pago/produção. Valor: atendimento natural com custo controlado.
4. **P2 — Métrica/SEO:** regularizar acesso permitido à análise (não a assinatura) e reavaliar Search Console, PostHog e rastreamento por UTM.
5. **P2 — Conteúdo HYROX:** usar roteiros já preparados e materiais próprios/licenciados para produção de Reels. Não publicar automaticamente.

**Aprovações ainda necessárias:** qualquer troca de senha ou alteração de segurança, integração que envie mensagens, alteração de banco de produção/HubSpot, merge/deploy, modelo pago ou compras.

## 7. Critérios para declarar homologação concluída

- CI dos arquivos alterados aprovado e sem jobs de deploy.
- Frontend ROX isolado de painel administrativo; tokens de usuário e credenciais não enviados ao navegador.
- Ambiente remoto de staging sem cobrança adicional e com controle de origem/identidade/abuso; 95%+ das perguntas-teste predefinidas classificadas corretamente (métrica futura, não desempenho alegado).
- Confirmação de conversa, oportunidade e venda exclusivamente por registros com origem verificável e consentimento.
- Testes em dispositivos e acessibilidade executados; rollback validado; responsável aprova release.