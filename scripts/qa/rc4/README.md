# Harness de revisão RC4

Uso exclusivo em desenvolvimento. Copie `index.html` e `quality.js` para `site/__qa/` e disponibilize `axe.min.js` de `axe-core@4.10.3` no mesmo diretório. O pacote oficial é uma dependência de auditoria; não faz parte da publicação.

Abra `/__qa/` no preview gerenciado. A interface permite varrer 81 rotas com WCAG A/AA, ajustar largura/altura, auditar geometria e desativar scripts por sandbox. A varredura deve terminar antes de interagir novamente com o frame. Os resultados completos ficam nos elementos `#axe-report`, `#report` e nos atributos de diagnóstico do documento.

As observações de LCP e CLS são locais, em iframe, sem simulação de CPU/rede, e não são dados de campo. O harness esconde a scrollbar após load; alternar o sandbox ou redimensionar o frame altera artificialmente o layout. Use navegações limpas para métricas, sem misturar esses cenários.

Remova `site/__qa/` antes de preparar o manifest ou exportar. Os verificadores recusam arquivos de QA na publicação. O teste não envia formulários, mensagens ou dados ao CRM.
