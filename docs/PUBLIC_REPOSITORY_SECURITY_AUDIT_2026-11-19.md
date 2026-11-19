# LANDER RIO — Auditoria do repositório público | 19/11/2026

## Resultado e escopo
- GitHub `landerlanrio/Lander-Rio-` confirmado **public**; 31 branches retornadas pela listagem na data da auditoria.
- `main` mantém apenas documentação da migração, não corresponde comprovadamente à versão publicada. O README da `main` foi corrigido em commit `f1ce3269c158fed10ef6198ba8bd2c1f94c7c295`.
- Auditadas as diferenças textuais de PR #1 (185 entradas, 146 patches textuais disponíveis) e PR #21 (671 entradas, 460 patches textuais disponíveis), além de PRs #2, #3, #5, #11, #12, #16, #20, #22 e #23.
- Não foram encontrados nos patches disponíveis padrões de alta confiança para segredos OpenAI, GitHub, AWS, Netlify, Supabase service-role, Stripe e blocos PEM de chave privada. **Ausência desses padrões não é prova de ausência de segredos no histórico completo, outros branches, binários ou dados pessoais.**
- Conferidos separadamente: metadados de deploy Netlify, scripts de auditoria existentes, configurações de ROX e analytics, arquivos de prévia privada e alguns HTMLs de contato. Identificadores públicos de mensuração não são credenciais privadas.
- Verificações anteriores em `scripts/verify_site.py` focam principalmente `site/`, sem cobertura de todo o repositório.

## Proteção preparada
- `scripts/audit_public_repository.py`: verificação de todos os caminhos Git rastreados (`git ls-files`), padrões de credenciais e arquivos com nome/extensão sensível, com saída limitada a **tipo, caminho e linha** (nunca valores capturados).
- `scripts/test_public_repository_audit.py`: sete testes de comportamento, incluindo falsos positivos, JWT service-role, arquivos `.env`, token GitHub, chave OpenAI, JSON de conta de serviço e binários.
- `.github/workflows/ci.yml`: incorpora scanner e testes à CI existente, com permissões `contents: read`; **não introduz deploy**.
- `README.md` da branch de segurança: aviso de visibilidade pública e política de não versionar dados sensíveis.
- Testes locais de scanner: **7/7 aprovados**; execução de scanner em repositório Git isolado com os dois arquivos de código: **aprovada**. Teste na árvore completa `staging` depende do GitHub Actions do PR.
- Branch: `audit/public-repo-safety-20261119` (a partir de `staging`), sem merge.

## Riscos e limitações
| Severidade | Constatação | Decisão |
| --- | --- | --- |
| P1 — exposição potencial | Repositório público contém múltiplas branches e histórico acessíveis; todos os binários e commits históricos não foram inspecionados exaustivamente | Exigir revisão de histórico e anexos antes de declarar seguro |
| P2 — proteção preventiva insuficiente | Validação de segredos cobria principalmente o site, não todos os arquivos rastreados | Novo guard e testes em branch isolada |
| P2 — documentação inconsistente | README de `main` dizia `private` após mudança pública | Corrigido em `main` |
| P2 — falta de paridade de deploy | Netlify atual é pacote API/drop sem commit GitHub identificado | Não promover branch nem ativar deploy automático |

## Controles de liberação
1. Conferir status do GitHub Actions no PR de segurança, corrigir qualquer falso positivo comprovado e preservar redactions nos logs.
2. Inspecionar material binário e histórico completo por ferramentas de segurança apropriadas. Se aparecer credencial real, revogar/rotacionar no provedor antes de considerar limpeza do histórico.
3. Recuperar o **ZIP exato** do Netlify atualmente publicado e comparar SHA-256 e inventário, sem substituir a produção.
4. Homologar UI mobile/desktop, consentimento GA4/PostHog, links de marcas, ferramentas e fluxos de WhatsApp, sem enviar mensagens de clientes.
5. Merge/deploy de site permanece bloqueado sem gate técnico aprovado e autorização específica de produção.

**Estado:** publicação não efetuada, sem alteração do site/WhatsApp/GA4/CRM, sem novos gastos nem tokens adicionados ao GitHub.
