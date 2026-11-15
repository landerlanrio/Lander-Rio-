# RC11 — entrega consolidada

**Estado:** candidata final desta rodada, validada localmente e ainda não publicada. Base de produção reconfirmada: deploy Netlify `6af804d36034a689af84dddf` (RC10). Não houve novo deploy, compra de créditos ou envio de cadastro real nesta execução.

## Resultado

- Consentimento visível na primeira tela; recusa e aceite com o mesmo destaque; reabertura sem salto ao fim da página.
- ROX com links internos acionáveis para treino, dieta, conteúdos e privacidade, usando destinos fixos seguros.
- Treino e dieta com prévias calculadas localmente antes do cadastro e explicação antecipada dos dados necessários. Marketing permanece opcional. O desbloqueio continua exigindo recibo válido do backend.
- Terminologia do menu consistente, Instagram nos rodapés, textos de apoio maiores e menos espaçamento excessivo entre seções.
- Hero, fotos, logos, URLs, políticas de indexação, contratos de cadastro, CSP e ponte GA4 preservados. A altura intrínseca declarada da imagem de treino foi corrigida de 800 para 427, conforme o arquivo de 640 × 427.

## Evidência

| Critério | Resultado | Artefato |
|---|---|---|
| Integridade | Aprovado: 88 páginas, 4.676 referências HTML, 19 referências CSS, 46 URLs no sitemap; zero problemas | `evidence/rc11/validation/integrity.log` |
| Regressões | Aprovado: 44 blocos, incluindo 144 testes Node e verificações Python, sintaxe e HTTP local | `evidence/rc11/validation/validation.json` |
| Navegador | Aprovado: 1.173 verificações; 352 combinações de página/largura (88 × 4); sem overflow da página, erro JS ou imagem quebrada na rodada final | `evidence/rc11/browser/browser-results.json` |
| Acessibilidade automática | 92 análises axe-core 4.11.1; zero violações detectadas nos critérios executados | Mesmo JSON, seção `axe` |
| Jornadas | Consentir, recusar, reabrir, revogar; menu/Escape; links ROX; treino/dieta com cadastro inválido, falha HTTP, recibo inválido e sucesso simulado | Mesmo JSON, seção `results` |
| Inspeção visual | Home mobile, consentimento, ROX com link clicado até dieta e prévia de treino; capturas reais do Chromium | `evidence/rc11/screenshots/` |
| Preservação e peso | 96 imagens/fontes intactas; nenhum pacote de produção novo; acréscimo de aproximadamente 1,6 KB gzip nos arquivos JS/CSS modificados | `evidence/rc11/change-inventory.json` |
| Reprodução | ZIP de publicação determinístico; dupla geração e extração conferidas | `evidence/rc11/package-check.json` |

As larguras foram 320, 390, 768 e 1440 pixels CSS em frames Chromium 156 no Linux. São testes de layout responsivo, não emulação de hardware Apple. O relatório preserva as rodadas anteriores, inclusive o registro intermitente de imagem durante a sequência de navegação. O arquivo era válido e carregou na inspeção direta; a rodada final aguardou sua decodificação/carregamento e terminou sem erros de recursos. Não se atribui esse falso negativo a uma indisponibilidade da produção.

A auditoria automática de acessibilidade também gerou 61 ocorrências inconclusivas que exigem avaliação humana; zero violações detectadas não equivale a conformidade integral ou certificação WCAG. As inspeções manuais realizadas estão limitadas aos estados registrados nas capturas.

## Limites e pendências reais

1. **Publicação:** o domínio público permanece na RC10. A RC11 depende da aprovação final de publicação; seu ZIP está completo para uma publicação agrupada.
2. **GA4:** a ponte publicada foi preservada byte a byte. A configuração foi lida novamente: fluxo `G-C3HWDYKEJK`, `generate_lead` ativo, coleta automática de buscas desativada. Essa desativação preserva a minimização de dados; não foi tratada como defeito. A auditoria anterior identificou fuso America/Rio_Branco: a alteração para America/Sao_Paulo é uma configuração da propriedade, não do HTML, e não foi executada nesta entrega. O recebimento de novos eventos reais só pode ser comprovado em produção.
3. **Cadastro real:** os fluxos passaram contra respostas simuladas. Isso comprova comportamento do cliente, não entrega real no Supabase/CRM. Uma validação real precisa de contato de teste autorizado após publicação.
4. **Safari e desempenho de campo:** nenhum iPhone físico foi operado; não foi produzida uma nota nova de Lighthouse nem medida de Core Web Vitals de usuários reais.
5. **Conteúdo clínico:** esta rodada não é uma revisão médica. Mantidas as páginas que já estavam em noindex até revisão editorial externa; nenhum conteúdo novo de doses ou tratamento foi criado.

## Publicação única e reversão

Antes da publicação, confirmar que o deploy em produção continua sendo a RC10 acima. Se mudou, comparar a nova base antes de substituí-la. Com a publicação aprovada, enviar somente `LANDER_RIO_RC11_SITE_DEPLOY.zip`, que contém os arquivos do site na raiz; não enviar o ZIP da fonte ou o pacote completo de entrega.

Depois de publicar, conferir a Hero, menu mobile, diretório, contato, consentimento, prévias e cadastro autorizado. Verificar no GA4 os eventos efetivamente recebidos; clique no WhatsApp não comprova conversa nem venda. Se surgir regressão crítica, restaurar o deploy RC10 `6af804d36034a689af84dddf` pelo histórico da Netlify.

## Base para a próxima manutenção

Editar esta fonte, agrupar alterações por objetivo, validar localmente e gerar um único pacote. Preservar os manifestos anteriores. A documentação e a versão pública devem ser atualizadas juntas; os documentos antigos do pacote são histórico, não pendências automaticamente reabertas.
