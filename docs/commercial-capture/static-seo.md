# LANDER RIO — SEO técnico e telemetria estática

Verificação em 22/11/2026. Leitura do código em `/workspace/lander-rio` e GET público no domínio oficial; nenhuma escrita em serviços. Base consultada inicialmente: `79cb510247b594d22c46005e9d9d22afc126197b`. O workspace recebeu mudanças de outros agentes durante a auditoria; os resultados são leitura pontual, não atestado de uma versão final.

## Resultado

- 106 arquivos HTML examinados. Nenhum título duplicado e nenhum destino de link interno inexistente encontrado na varredura de arquivos.
- Sitemap público e local idênticos: 59 URLs, nenhuma duplicata, nenhum destino inexistente e nenhuma URL com `noindex` incluída.
- `robots.txt` público e local idênticos: permite rastreamento, referencia o sitemap e bloqueia rotas de recibo. Não bloqueia Varejo, Atacado ou marcas.
- Home, Varejo, Atacado, diretório de marcas, Landerlan e Landerlan Gold responderam 200 com canonical própria, `index,follow` e sem cabeçalho `X-Robots-Tag` impeditivo. Isso prova entrega da página e metadados, não indexação ou captação.
- 16 páginas individuais de marca têm título próprio, 1 H1, canonical própria e textos alternativos presentes nas imagens. Quatro estão `noindex,follow` por revisão/documentação: Alpha Laboratory, Alpha X Prime, Synedica e ZPHC. Essa política é coerente com sua ausência no sitemap e deve ser preservada.
- Diretório e home contêm 14 elementos `data-brand` e links comerciais para Varejo e Atacado. Páginas individuais incluem navegação comercial; Landerlan contém fontes, perguntas, links para Gold e artigo de procedência.

## Lacuna de mensuração que afeta a jornada das marcas

Em `site/assets/measurement-v23-2.js`, a tabela `pages` não contém `/marcas/` nem páginas individuais de marca. O código define `sensitive=!page`, portanto `push()` rejeita todos os eventos nessas páginas, mesmo após consentimento. Elas carregam os scripts, mas essa presença não comprova coleta. A lista de eventos de `ga4-intent.js` também não inclui `brand_interaction`.

Consequência: o Search Console comprova descoberta orgânica das marcas, mas o código atual não permite reconciliar todas essas entradas com a passagem para Varejo/Atacado. Uma eventual ampliação da coleta precisa preservar as exclusões editoriais/sensíveis e usar valores fixos, sem nomes de produtos, consultas livres ou texto de formulário.

## Duplicação, origem e dados pessoais

- `commerce-v21.js` e `commerce-v23-1.js` geram `cta_interaction` e `whatsapp_open_click` para o mesmo clique. São duas etapas/tipos de evento sobre a mesma ação: somá-las cria dupla contagem de intenção.
- `ga4-intent.js` é uma ponte dos eventos validados; não instala outro listener de clique. Tem guarda por objeto e uma visualização por documento, desativa pageview automático e falha fechado se outra implementação de Google já controlar a página.
- `utility_registration_confirmed` só passa com `backend_confirmed=true` e vira `generate_lead`, com `lead_type=utility_registration`. Esse evento é cadastro das ferramentas, não confirmação de mensagem WhatsApp nem lead comercial qualificado.
- Page location enviada ao GA4 exclui query e hash. Com consentimento, a ponte GA4 admite como referenciador apenas a origem HTTPS de google.com ou google.com.br, com ou sem www, e descarta caminho, consulta e fragmento. Na presença de UTM ou identificador de anúncio conhecido, ou para qualquer outra origem, o campo permanece vazio. UTMs explícitas passam pela lista de valores permitidos. Instagram `ig` e `link_in_bio` são normalizados para `instagram` e `bio`.
- PostHog usa payload mínimo, sem autocapture/replay desse transporte; referrer HTTP omitido, campos livres descartados e UTMs limitadas a valores autorizados. A cidade opcional fica no rascunho de WhatsApp. Não foi encontrado envio desses campos ao analytics nesses scripts.
- Varredura dos HTML/JS/JSON públicos por nome conhecido, e-mail pessoal, CPF e referência residencial não identificou exposição pessoal confirmada. Resultados encontrados foram hashes de manifesto e uma instrução de privacidade do chat. Contatos comerciais oficiais estão presentes. A verificação não é uma auditoria integral de todo histórico Git ou de arquivos binários.

## Testes executados

`node --test scripts/ga4-attribution.test.cjs scripts/measurement-flagship.test.cjs`: 11/12 passaram. A única falha foi comparação literal de release (`rc14.2` observado versus `rc14.1` esperado), durante mudanças simultâneas no workspace. Passaram os cenários de consentimento negado/revogado, envio local sem PostHog, descarte de texto livre/dados pessoais, UTMs autorizadas, rejeição de conversões desconhecidas e separação de download versus cadastro/venda. A suíte deve ser repetida pelo agente principal após estabilizar a versão.

O recebimento nos painéis não foi testado nesta frente; auditoria separada consulta os sistemas conectados. Nenhum formulário ou mensagem externa foi enviado por esta auditoria estática.
