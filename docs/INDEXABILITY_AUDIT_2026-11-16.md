# Preservação de indexabilidade — 16/11/2026

O alerta do Ahrefs informa duas mudanças de indexabilidade sem identificar as URLs no e-mail. Esta revisão não presume que páginas com `noindex` estejam erradas: compara a implementação atual com um inventário explícito, preservando as retenções editoriais já documentadas.

## Resultado verificado

- Base de código: `572dbe3e93cfbcd8ce6872c8465e6d360e69b02a`, sucessora documental do artefato RC14 publicado. Os 718 arquivos originais foram copiados e conferidos por hash Git antes das mudanças.
- Produção: auditoria HTTP concluída em 16/11/2026 às 20h21 de Brasília. **88 páginas verificadas, 46 elegíveis segundo as diretivas técnicas e 42 com exclusão prevista; zero divergências nesta verificação.**
- Exclusões preservadas: 35 fichas de substâncias e quatro páginas de marca mantidas sob revisão; duas páginas de confirmação e a página de erro.
- Validação local: **47/47 blocos aprovados**, incluindo os 150 testes Node existentes e nove testes de regressão da nova proteção.
- Nenhum arquivo de `site/` alterado. Nenhum deploy, formulário real, envio comercial ou mudança de indexação realizado.

## Melhoria implementada

`content/indexability-policy.json` é um inventário explícito revisável. `scripts/audit_indexability.py` falha quando detecta mudança inesperada em `noindex`, canonical, robots, status HTTP ou sitemap; também detecta páginas acrescentadas sem revisão do inventário. O auditor nunca reescreve a política para aceitar automaticamente a saída atual.

O validador local e o workflow de CI passam a incluir a proteção e os testes. O CI também passa a executar os validadores editoriais já existentes para a integridade das fontes e imagens. Os gatilhos de branch existentes foram preservados; esta entrega registra validação local, não execução confirmada de GitHub Actions.

## Reprodução

```bash
python3 scripts/audit_indexability.py
python3 scripts/test_indexability.py
python3 scripts/validate_titan.py --out /tmp/lander-validation
python3 scripts/audit_indexability.py --live --out /tmp/lander-live-indexability.json
```

`--live` faz apenas leituras HTTP de páginas e arquivos de controle. Não recupera imagens originais nem envia dados. O modo padrão permanece local.

## Evidências e limites

- [Auditoria em produção](evidence/indexability-2026-11-16/live.json)
- [Auditoria local](evidence/indexability-2026-11-16/local.json)
- [Validação completa](evidence/indexability-2026-11-16/validation.json)
- [Preservação dos arquivos publicados](evidence/indexability-2026-11-16/site-preservation.json)

Elegibilidade técnica não comprova indexação pelo Google, ganho de tráfego ou conversão. O rastreamento Ahrefs cobriu 89 URLs e apontou 38 páginas com `noindex`; esta auditoria cobriu os 88 documentos HTML do artefato atual. A diferença de escopo impede comparar os totais como mudança histórica. As duas URLs do alerta continuam sem identificação: a API retornou `Insufficient plan` e a interface exigiu autenticação. O diagnóstico histórico depende da exportação ou leitura autenticada desse relatório; nenhum `noindex` foi removido por suposição.

A revisão é proposta sobre a branch da RC14. A antiga `main` e os PRs empilhados não devem substituir a produção sem reconciliação e aprovação específicas.
