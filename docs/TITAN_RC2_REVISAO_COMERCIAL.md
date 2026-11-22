# TITAN RC2 — 13/11/2026

Revisão local sobre o commit TITAN RC1 8b5a77458fb12b1f3c0e0b83207885d500dbf51e.

- Hero com rotas Atacado e Varejo e 14 logotipos do diretório informativo.
- Ordem principal: Hero → Comercial → Marcas → Treino e dieta → Conteúdo.
- 81 páginas preservadas.
- Validação local: 133 testes Node; 29 estruturais; 3 integridade; 15 rotas HTTP; 28 arquivos JS.
- Chromium: logos carregados, menu abre e fecha, sem overflow nos iframes de 360/390/430/768 pixels; desktop inspecionado. Não equivale a Safari/iPhone físico.
- ATLAS 2.0 continua separado. IA externa ROX continua desativada.
- Não publicado, sem push ao GitHub, sem alteração de CRM ou mensagens.

Deploy manual: extrair LANDER_RIO_TITAN_RC2_SITE.zip e enviar o diretório que contém index.html à Netlify. Este ZIP contém apenas site/, não o código de testes.

Reprodução: python3 scripts/validate_titan.py; empacotamento: python3 scripts/package_titan.py --out CAMINHO.zip.
