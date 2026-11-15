# RC11 — critérios de aceitação

Base: pacote RC10 publicado no deploy `6af804d36034a689af84dddf`. Estado desta entrega: candidata local, sem publicação em produção.

| Área | Critério verificável | Evidência exigida |
|---|---|---|
| Integridade | Zero arquivos fora do manifesto; referências e fragmentos locais válidos; imagens aprovadas preservadas | Verificador, hashes, regressões |
| Navegação | Destinos do menu, rodapé, busca e ROX existem; terminologia consistente | Testes de estrutura e navegador |
| Responsividade | Sem overflow horizontal da página em 320, 390, 768 e 1440 px; menus e consentimento utilizáveis | Medidas DOM e inspeção visual em Chromium |
| Privacidade | Aviso visível na primeira visita; recusa e aceite equivalentes; zero analytics antes do aceite; revogação funciona | Testes de consentimento e inspeção de rede simulada |
| Ferramentas | Prévia real antes do cadastro; validação dos campos; erro preserva dados; desbloqueio só após recibo válido | Testes dos motores, contrato e jornadas locais |
| Acessibilidade | Sem violações graves/críticas automáticas nas páginas amostradas; nomes acessíveis, foco e Escape funcionam | axe-core, DOM e testes de teclado; não equivale a certificação WCAG |
| Desempenho | Sem novas dependências de produção; peso estático registrado; nenhuma nota de Lighthouse ou CWV inventada | Tamanhos de arquivos; limitações explícitas |
| Entrega | Pacote de publicação e fonte reproduzíveis, hashes registrados, comandos e rollback documentados | Dupla geração do ZIP e validação da extração |

Escopo: experiência, privacidade, navegação e manutenção do site. Não representa validação médica do acervo. Testes locais não comprovam entrega de cadastros no Supabase, recebimento real no GA4, Safari físico ou desempenho de campo.
