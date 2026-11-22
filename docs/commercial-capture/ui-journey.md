# Jornada e interface — auditoria 22/11/2026

Ambiente observado: Chromium headless real via Playwright, produção `https://landerrio.com.br`, larguras 360, 390 e 1440 px. Não foi Safari/iPhone físico. Navegação externa WhatsApp abortada deliberadamente antes da rede; nenhum envio de mensagem ou formulário de produção.

## Evidência comercial inicial

- Home Hero oferece `ATACADO / REVENDEDORES` e `VAREJO / PARA VOCÊ`; ambos links de produção vão diretamente para `https://wa.me/…` com texto de intenção.
- Menu tem `/atacado/` e `/varejo/` e permite chegar às páginas comerciais.
- Nessas duas páginas, `#profile-select`, `#subject-select`, `#city-input` personalizam o texto preparado para WhatsApp. Seleção fictícia **Cidade Fictícia QA**, assunto envio, perfil correto constaram no link e na prévia visual.
- Não existe formulário de solicitação nessas duas rotas de produção. Não há confirmação de persistência de contato nesse caminho. Abrir WhatsApp não prova mensagem recebida nem lead recuperável.
- Registro `ui-journey.json` contém `chrome-error://chromewebdata/` nos popups porque o teste bloqueia o destino `wa.me`; não classificar isso como erro do site.

## Interface e marcas

- Home, varejo, atacado, diretório marcas e Landerlan sem overflow horizontal em 360/390/1440.
- Rotas Gold e Life verificadas em 390: `/marcas/landerlan-gold/` e `/marcas/life-peptideos/`; ambas renderizaram sem overflow, sem imagens quebradas após rolagem.
- Rotas tentadas `/marcas/gold-labs/` e `/marcas/life-science/` não são links ativos e retornam a página de erro. Não representam regressão de link do site.
- Imagens inicialmente listadas como sem `naturalWidth` eram lazy loading abaixo da dobra. Após rolagem as páginas observadas carregam as imagens; a captura `before-390-brands-visible.png` comprova logo Landerlan.
- Diretório preserva os ativos aprovados. Ferramentas vêm depois de atendimento/marcas.
- Página equipe apresenta identidade editorial institucional. Não foi encontrado CPF no main das páginas equipe/sobre; nenhum dado pessoal foi copiado para este relatório.
- Wordmark interno tem `RIO / PERFORMANCE CULTURE` branco, ao contrário do ativo aprovado da home onde RIO é lime.

## Correções locais

- `site/index.html`: Hero passa a `/atacado/` e `/varejo/` na mesma aba, removendo marcação de clique WhatsApp desses dois links.
- `site/assets/experience-rc9.css`: linha pequena dos wordmarks internos em Performance Lime; lockup aprovado da home preservado.
- Sem deploy, mensagens, campanhas ou automações alteradas.

Capturas em `screens/`; logs de navegador em `ui-production.json`, `ui-journey.json`, `ui-extra.json`. Capturas de página inteira sem pré-rolagem podem conter placeholders lazy-loading; usar `home-loaded` para visual final.

## Validação da candidata isolada

Servidor `http://127.0.0.1:3100`, persistência SQLite real em disco, `WAL`/durabilidade do harness. Todos os hosts externos abortados no navegador; CSP e servidor não encaminham APIs externas. **Não é validação da Edge Function/Supabase/HubSpot em produção.**

Execução registrada em `ui-isolated.json`, run `lrui-1795365614627`:

| Cenário | Resultado observado |
|---|---|
| Home → Varejo, 360/390/1440 | HTTP201, confirmação visual com protocolo após salvamento, exatamente1 registro consultável por identificador fictício |
| Home → Revendedores, 360/390/1440 | HTTP201, intenção orçamento e perfil atacado persistidos, exatamente1 registro por envio |
| Duplo clique com atraso1s | 1POST, 0registros enquanto tela mostra “Salvando…”, 1registro após salvar |
| Resposta perdida após salvar; timeout12s | Tela não confirma recebimento durante incerteza; consulta local já acha1registro; retry envia payload idêntico e mantém1registro |
| Armazenamento indisponível | 0registro e sem confirmação; depois de recuperar armazenamento, retry salva1registro |

Nas6 jornadas normais: origem `instagram`, medium `social`, campanha `lr-261122`, entrada `/`, página `/varejo/` ou `/atacado/`, perfil correto, intenção correta, status CRM `pending`; sem pageerror e sem requisições externas. Nenhum overflow horizontal nas3 larguras. Capturas `after-360-*`, `after-390-*`, `after-1440-*`.

Teste complementar `ui-reload.json`: timeout depois de salvar → recarregar → preencher dados diferentes resulta409, campo editável e nenhum novo registro; repetir dados originais retorna200/duplicate e mesmo protocolo, mantendo1registro. Essa verificação foi repetida após a correção da interface de conflito.

Medição `ui-events.json`: consentimento concedido em localhost; nenhuma chamada GA4/PostHog é feita neste hostname. Snapshot mostra exatamente1 `commercial_request_saved` após salvamento; zero durante503; chamada sem flag backend_confirmed rejeitada. Evento não contém nome, email, conteúdo livre ou protocolo da solicitação. Recebimento no painel segue pendente. Campo e fieldset de dados ficam desabilitados durante o retry de payload congelado (`disabled=true`), comprovado pela propriedade DOM e estado do input.

Espaçamento `ui-spacing.json`: seção, título e formulário começam em x20px nas larguras360 e390, com larguras320 e350; desktop1440 começa em x240 com largura960. A captura recortada `after-390-form-receipt.png` remove as margens externas por definição; não indica encoste no viewport. O CSS foi preservado depois da conferência.

Privacidade `privacy-public.json`:106HTML da candidata e129blocos JSON-LD inspecionados por padrões de identidade em metadados, Person JSONLD, CPF formatado, email e telefone explicitamente marcado. Nenhum dado pessoal identificado; único email adicional é placeholder de input em dieta. As páginas equipe/sobre também foram lidas em produção. Não cobre dados antigos indexados nem equivale a busca semântica exaustiva de nomes em texto livre.

Alterações visuais efetivas: caminhos dos2CTAs Hero; linha RIO dos wordmarks internos; área de formulário nas páginas Varejo e Revendedores (implementada pelo agente principal). Ativos aprovados preservados.
