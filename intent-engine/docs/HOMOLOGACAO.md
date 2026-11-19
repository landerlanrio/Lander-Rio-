# Homologação 0.2.0

**Decisão: candidato funcional local; não liberado para produção.**

| Área | Evidência | Resultado |
| --- | --- | --- |
| GSC autenticado | Leitura OpenSEO sem reconexão | Aprovado nesta execução |
| Dados | 24 páginas, paginação encerrada, schema/métricas validados | Aprovado |
| Reexecução | Ingestão repetida sem alterar snapshot | Aprovado |
| Painel funcional | Filtro, restauração, briefing, escaping em DOM simulado | Aprovado localmente |
| Backend | Anônimo, usuário errado, sessão vencida, sem allowlist, falha da fonte | Aprovado com identidade simulada |
| GA4 | Consentimento, revogação, deduplicação, descarte de PII, cadastro confirmado | Aprovado em VM com código RC9 |
| GA4 remoto | Stream e configuração lidos | Leitura aprovada; coleta nova pendente |
| Patch RC9 | 24 HTMLs e CSP em cópia local | Preparado, desativado |
| Visual desktop/mobile | Chromium: socket proibido; browser de UI: file URL bloqueada | Não concluído |
| Login/endpoint Netlify real | Nenhum deploy | Não validado |
| Recorrência | Reutiliza Painel Executivo; conferir automation-receipt.json | Configuração não equivale a execução futura observada |
| Produção | Nenhum merge, deploy, DNS ou configuração GA4 alterado | Preservada |

O teste de browser foi bloqueado antes das asserções. Nenhum passe visual ou screenshot é apresentado como evidência. A suíte está incluída para execução em ambiente autorizado.

Pendências: executar suíte visual; aprovar ambiente privado Netlify sem custo não autorizado; configurar allowlist e token GitHub somente leitura pelo gerenciador seguro; revisar medição otimizada GA4 e fuso; aprovar ativação do patch; confirmar eventos no DebugView. Não colar tokens no chat.
