# LANDER RIO — RC6 / MagicPath

## Resultado
Homepage reconstruída sobre a base RC5 usando a estrutura renderizada e CSS público da referência https://designs.magicpath.ai/v1/happily-sun-7479?utm_source=chatgpt.com. Código estático, sem dependência do serviço MagicPath em execução. 81 páginas preservadas. Branch local: `design/magicpath-faithful-rc6`. Produção não alterada.

## Fidelidade e diferenças intencionais
Composição, fontes, paleta, títulos com contorno, carrossel em duas linhas, manifesto, universo, ferramentas, editorial, ROX e encerramento seguem a referência. Não se declara equivalência pixel a pixel: foram usadas as duas fotografias e as 14 logos mais recentes selecionadas pelo usuário; CTAs de atacado/varejo e quatro marcas visíveis na Hero; links demonstrativos substituídos por destinos existentes. Logos com fundo branco preservam a arte recebida. Textos secundários tiveram contraste corrigido.

## Critérios e evidências
- Larguras 360, 390, 430 e 1280 px: zero overflow horizontal, zero imagens quebradas, um H1 e imagens com dimensões. Evidência: layouts.json.
- Menu abre, carrossel avança de 01/07 para 02/07 e aba Nutrição troca o conteúdo e destino: verificação interativa Chromium.
- Axe 4.10.3, homepage 390 px: zero violações automáticas após correções de contraste; duas categorias de verificações inconclusivas exigem avaliação humana (contraste sobre imagens e atributos ARIA). Não equivale a certificação WCAG.
- Pipeline validate_titan: 35 grupos aprovados; contratos de estrutura, integridade SHA256, testes Node, HTTP local e sintaxe de 30 scripts. Logs completos anexados.
- Logos RC5 e fotografias RC2 reutilizadas sem recriação; hashes e dimensões preservados pelos contratos.
- Capturas reais do navegador: Hero mobile/desktop, marcas e ferramentas.

## Limites
Não houve teste em iPhone/Safari físico, medição de Core Web Vitals de campo ou Lighthouse mobile nesta RC6. ROX permanece demonstração local, integrações externas não foram ativadas, enciclopédia ainda requer revisão científica externa. Não houve conversa enviada pelo WhatsApp. O link de atendimento foi preservado da RC5, não foi comprovada entrega de mensagem.

## Uso
ZIP SITE: conteúdo estático completo, index.html na raiz, apropriado para avaliação em deploy manual. PREVIEW.html: homepage autocontida; links para outras páginas abrem o site público atual, conforme aviso. Preview do ambiente: http://127.0.0.1:4173/ (não é endereço público). Publicação depende de aprovação explícita.

## Próxima ação
Avaliar a composição RC6 e concluir homologação em Safari/iPhone antes de autorizar produção.
