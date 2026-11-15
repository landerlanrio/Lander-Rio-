# LANDER RIO — RC12: palavras-chave implementadas

Versão candidata de 14/11/2026. Oito páginas receberam palavras-chave nos títulos, descrições, cabeçalhos, textos e links internos pertinentes. A RC12 incorpora a RC11 e ainda não foi publicada em landerrio.com.br.

## Entrega

- `site/`: conteúdo integral para publicação; somente esta pasta deve compor o ZIP enviado à hospedagem.
- `docs/RC12_PALAVRAS_CHAVE.md`: mapa das páginas, resultado dos testes e limites da validação.
- `docs/evidence/rc12/keyword-map.json`: títulos anteriores e novos, descrições e hashes dos arquivos.
- `docs/evidence/rc12/keywords.patch`: diferenças dos oito HTML em relação à RC11.
- `docs/evidence/rc12/validation/`: testes técnicos e logs.
- `docs/evidence/rc12/browser/`: resultados inicial e final no navegador.
- `docs/evidence/rc12/preservation.json`: comparação de URLs, formulários, scripts e recursos visuais.

As modificações desta versão estão registradas em um novo manifesto RC12. Os manifestos anteriores permanecem intactos. Documentos RC11 e anteriores são histórico e não representam, por si só, pendências atuais.

## Reproduzir a validação

Requisitos: Python 3.10+ e Node.js 22+.

```sh
python3 scripts/validate_titan.py --out docs/evidence/rc12/validation
python3 scripts/package_titan.py --out /caminho/LANDER_RIO_RC12_SITE_DEPLOY.zip
```

O empacotador exige integridade aprovada e não publica.

```sh
python3 scripts/browser_qa_server.py --port 8766
```

Abra a URL impressa pelo servidor e acesse `/__qa/index.html`. O botão “Executar validação” testa as oito páginas modificadas e os principais fluxos. As respostas de cadastro são simuladas; não se criam contatos reais. A prévia visual fica em `/__qa/visual.html`. O servidor e o axe-core ficam fora do ZIP de publicação.

## Publicação pendente

O deploy de produção confirmado durante esta tarefa foi `6af804d36034a689af84dddf`, da RC10. Publicar a RC12 substitui o site ao vivo pelo pacote consolidado, incluindo as correções anteriores da RC11, e utiliza a franquia da hospedagem. A autorização de publicação permanece pendente; nenhuma publicação foi feita nesta tarefa.

Depois de publicar, conferir os oito HTML no domínio, a versão em `/release.json`, os recursos carregados e os fluxos principais. Resultados de posicionamento e indexação precisam ser medidos posteriormente no Search Console; os testes locais não demonstram crescimento de tráfego.
