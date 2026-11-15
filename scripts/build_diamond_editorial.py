#!/usr/bin/env python3
"""Explicit, idempotent editorial patch over the reviewed RC13 page.

Does not regenerate historic brand templates, publish, or contact external APIs.
"""
import json, re
from html import escape as esc
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / 'site'
DATA = json.loads((ROOT / 'content/diamond-gold-evidence.json').read_text())
PAGE = SITE / 'marcas/landerlan/index.html'
START, END = '<!-- DIAMOND-EDITORIAL-START -->', '<!-- DIAMOND-EDITORIAL-END -->'

def replace_once(text, pattern, replacement):
    text, count = re.subn(pattern, lambda _: replacement, text, count=1, flags=re.S)
    if count != 1:
        raise ValueError('Expected one page anchor: ' + pattern[:90])
    return text

def ref(number, label=None):
    return f'<a href="#fonte-{number}" aria-label="Fonte {number}: {esc(label or "documentação")}">[{number:02}]</a>'

def main():
    brands_file = ROOT / 'content/brands.json'
    archive = json.loads(brands_file.read_text())
    brand = next(b for b in archive['brands'] if b['slug'] == 'landerlan')
    added = [{'label': 'Landerpharma · ' + p['name'] + ' Diamond', 'url': p['url'], 'checked': DATA['checked_on']} for p in DATA['products']]
    added += [dict(label='Landerpharma · Durateston Plus Gold', url=DATA['gold_comparator']['url'], checked=DATA['checked_on']), dict(label='IOI Oleo · composição do MIGLYOL 840', url=DATA['excipient_reference']['url'], checked=DATA['checked_on'])]
    brand['sources'] = brand['sources'][:5] + added
    for s in brand['sources'][:3]:
        s['checked'] = DATA['checked_on']
    details = {p['name']: p for p in DATA['products']}
    for p in brand['products']:
        if p['group'] == 'Diamond':
            p['source'] = details[p['name']]['source']
            p['detail'] = details[p['name']]['active']
    brand['seo'].update(title='Landerlan: Diamond, Gold e composição | LANDER RIO', description='Landerlan Diamond e Gold: seis referências do catálogo, apresentações e o que as fichas declaram sobre Miglyol 840. Comparação editorial com fontes.')
    brand['verified_on'] = DATA['checked_on']
    brand['editorial_module'] = 'diamond-gold-evidence.json'
    brand['knowledge'] = [dict(title='Diamond e Gold: o que muda na composição?', text='As páginas de Durateston Plus Diamond e Gold declaram Miglyol 840 e álcool benzílico. Isso não confirma proporções idênticas nem permite generalizar para todos os produtos. Nas outras cinco fichas Diamond consultadas, o veículo não é nomeado.')]
    new_faqs = [
        dict(question='Qual é o óleo da linha Diamond?', answer='A ficha pública de Durateston Plus Diamond cita Miglyol 840 e álcool benzílico. Nas páginas dos outros cinco produtos Diamond consultadas, o veículo não está identificado pelo nome. Não é possível atribuir um único óleo à linha inteira com essas fontes.'),
        dict(question='O óleo diferencia Diamond de Gold?', answer='No par Durateston Plus consultado, ambas as fichas citam Miglyol 840 e álcool benzílico. A diferença documentada nos títulos é a apresentação: Diamond em 10 ampolas de 1 mL; Gold em frasco-ampola de 10 mL. As fichas não estabelecem superioridade clínica ou equivalência entre lotes.')
    ]
    brand['faqs'] = [f for f in brand['faqs'] if f['question'] not in {n['question'] for n in new_faqs}] + new_faqs
    brands_file.write_text(json.dumps(archive, ensure_ascii=False, indent=2) + '\n')

    feature = START + '''
<section id="diamond-gold" class="dg-feature" aria-labelledby="diamond-gold-title">
  <figure aria-hidden="true"><img src="/assets/editorial/composicao-vidro-rc14.webp" width="1672" height="941" alt="" loading="lazy" decoding="async"></figure>
  <div class="dg-hero-copy"><p class="dg-kicker">LANDER RIO / LEITURA DE COMPOSIÇÃO</p>
    <h2 id="diamond-gold-title">Diamond &amp; Gold.<span>O que muda de fato.</span></h2>
    <p class="dg-deck">Apresentação, princípio ativo e veículo: uma leitura das fichas da Landerpharma para esclarecer as diferenças entre as linhas.</p>
    <nav class="dg-links" aria-label="Nesta comparação"><a href="#linha-diamond">As seis referências <span aria-hidden="true">↓</span></a><a href="#oleo-composicao">Entenda o óleo <span aria-hidden="true">↓</span></a></nav>
  </div>
  <p class="dg-art-note">Ilustração conceitual gerada por IA; não representa produtos ou excipientes reais.</p>
</section>
<aside class="dg-takeaway" aria-labelledby="dg-key-finding"><strong id="dg-key-finding">O que a fonte confirma</strong><p>As fichas de <b>Durateston Plus Diamond e Gold</b> declaram <b>Miglyol 840 e álcool benzílico</b>. Nesses dois documentos, o nome do veículo não distingue as linhas. ''' + ref(6, 'Durateston Plus Diamond') + ' ' + ref(12, 'Durateston Plus Gold') + '</p></aside>\n' + END

    cards = []
    for index, p in enumerate(DATA['products'], 1):
        oil = 'Veículo nomeado: Miglyol 840; também consta álcool benzílico.' if p['oil'] else 'Veículo: não identificado pelo nome na página consultada.'
        cards.append(f'<li class="dg-reference" data-diamond-reference="{index}"><div class="dg-reference-top"><span>REFERÊNCIA {index:02} / 06</span>{ref(p["source"], p["name"])}</div><h4>{esc(p["name"])}</h4><p>{esc(p["active"])}</p><p>{esc(p["strength"])} · {esc(p["presentation"])}</p><p class="dg-oil-status">{oil}</p></li>')
    group = '<div class="ba-product-group dg-product-group" id="linha-diamond"><h3>Diamond: seis referências documentadas.</h3><p class="dg-product-intro">Todos os seis itens listados na página Diamond na consulta de 15 nov 2026. Concentrações e apresentações identificam o catálogo; não são orientações de dose. '+ref(1, 'listagem Diamond')+'</p><ul class="dg-reference-list">'+''.join(cards)+'</ul></div>'

    knowledge = '''<section id="conhecimento" class="dg-oil" aria-labelledby="dg-oil-title">
  <p class="dg-kicker">03 / COMPOSIÇÃO EM CONTEXTO</p>
  <div class="dg-oil-heading"><h2 id="dg-oil-title">O veículo, por trás do nome.</h2><p class="dg-lede">A comparação começa pela ficha de cada produto. O nome Diamond ou Gold, sozinho, não identifica todos os excipientes da formulação.</p></div>
  <div id="oleo-composicao" class="dg-chemistry"><h3>Miglyol 840</h3>
    <p>A IOI Oleo identifica esse líquido oleoso como <strong>dicaprilocaprato de propilenoglicol</strong>, da categoria de ésteres C8/C10. Essa é a identificação técnica para conferir na documentação. '''+ref(13, 'identificação química pela IOI Oleo')+'''</p>
    <p>Ele aparece na lista de excipientes de Durateston Plus nas duas linhas. Álcool benzílico também é citado: são componentes distintos. As páginas consultadas não informam suas proporções. '''+ref(6, 'Diamond')+' '+ref(12, 'Gold')+'''</p>
  </div>
  <p class="dg-scroll-hint">Deslize a tabela para ver a coluna Gold →</p>
  <div class="dg-table-wrap" role="region" tabindex="0" aria-label="Comparação de Durateston Plus; deslize horizontalmente em telas pequenas">
    <table class="dg-table"><caption>Durateston Plus: o par que permite comparar o veículo</caption>
      <thead><tr><th scope="col">Na ficha consultada</th><th scope="col">Diamond '''+ref(6, 'ficha Diamond')+'''</th><th scope="col">Gold '''+ref(12, 'ficha Gold')+'''</th></tr></thead>
      <tbody><tr><th scope="row">Apresentação no título</th><td>10 ampolas de 1 mL</td><td>Frasco-ampola de 10 mL</td></tr>
      <tr><th scope="row">Composição ativa declarada</th><td>Mistura de ésteres de testosterona, 250 mg/mL</td><td>Mistura de ésteres de testosterona, 250 mg/mL</td></tr>
      <tr><th scope="row">Excipientes nomeados</th><td>Miglyol 840 e álcool benzílico</td><td>Miglyol 840 e álcool benzílico</td></tr>
      <tr><th scope="row">Proporções dos excipientes</th><td>Não informadas nessa página</td><td>Não informadas nessa página</td></tr></tbody>
    </table>
  </div>
  <p class="dg-limits"><strong>Limite da comparação:</strong> nomes iguais não comprovam formulações integralmente idênticas, equivalência entre lotes ou superioridade clínica. Nas outras cinco páginas Diamond, a fórmula usa uma referência genérica a excipientes; o óleo permanece sem identificação nominal nessas fontes. Esta leitura não avalia pureza, dor, absorção ou segurança comparativa.</p>
  <p class="dg-limits">Conteúdo educativo sobre documentação pública. O catálogo estrangeiro não comprova autorização de comercialização no Brasil. Estes medicamentos exigem avaliação profissional; a comparação não recomenda uso nem substituição de tratamento.</p>
</section>'''

    html = PAGE.read_text()
    if START in html:
        html = replace_once(html, re.escape(START)+'.*?'+re.escape(END), feature)
    else:
        html = replace_once(html, r'(?=<section class="ba-catalog" id="produtos")', feature)
    html = replace_once(html, r'<div class="ba-product-group(?: dg-product-group)?" id="linha-diamond">.*?(?=<div class="ba-product-group" id="linha-gold">)', group)
    html = replace_once(html, r'<section id="conhecimento".*?</section>', knowledge)
    faq = '<section id="perguntas" class="ba-faq"><p class="ba-eyebrow">04 / PERGUNTAS FREQUENTES</p><h2>Dúvidas sobre Landerlan.</h2>' + ''.join('<details><summary>'+esc(f['question'])+'</summary><p>'+esc(f['answer'])+'</p></details>' for f in brand['faqs']) + '</section>'
    html = replace_once(html, r'<section id="perguntas".*?</section>', faq)
    sources = '<section class="ba-sources" aria-labelledby="sources-title"><h2 id="sources-title">Fontes &amp; atualização</h2><p>Composição e listagem Diamond consultadas em <time datetime="2026-11-15">15 de novembro de 2026</time>. Fontes de fabricante para identificação documental; nenhuma auditoria clínica, regulatória ou de lotes é alegada. A seleção Gold permanece parcial.</p><ol>'
    sources += ''.join(f'<li id="fonte-{i}"><a href="{esc(s["url"],quote=True)}" target="_blank" rel="noopener noreferrer">{esc(s["label"])} <span class="ba-sr">(abre em nova aba)</span></a></li>' for i,s in enumerate(brand['sources'],1)) + '</ol></section>'
    html = replace_once(html, r'<section class="ba-sources".*?</section>', sources)
    html = replace_once(html, r'<title>.*?</title>', '<title>'+esc(brand['seo']['title'])+'</title>')
    for key, value in [('name="description"',brand['seo']['description']),('property="og:title"',brand['seo']['title']),('property="og:description"',brand['seo']['description']),('name="lander-release"','digital-flagship-2026-rc14')]:
        html = replace_once(html, r'<meta '+key+r' content="[^"]*">', '<meta '+key+' content="'+esc(value,quote=True)+'">')
    if 'diamond-editorial-rc14.css' not in html:
        html = html.replace('</head>', '<link rel="stylesheet" href="/assets/diamond-editorial-rc14.css"></head>', 1)
    if '<a href="#diamond-gold">' not in html:
        html = html.replace('<a href="#about-title">Sobre</a>', '<a href="#about-title">Sobre</a><a href="#diamond-gold">Diamond × Gold</a>', 1)
    html = html.replace('<time datetime="2026-11-13">Atualizado em 13 nov 2026</time>', '<time datetime="2026-11-15">Atualizado em 15 nov 2026</time>')
    def schema(match):
        data = json.loads(match[1])
        for node in data.get('@graph',[]):
            if node.get('@type') == 'WebPage':
                node['dateModified'] = DATA['checked_on']
                node['description'] = brand['seo']['description']
        return '<script type="application/ld+json">'+json.dumps(data,ensure_ascii=False)+'</script>'
    html = re.sub(r'<script type="application/ld\+json">(.*?)</script>', schema, html, flags=re.S)
    PAGE.write_text(html)
    release_path = SITE / 'release.json'
    release = json.loads(release_path.read_text())
    release.update(release='digital-flagship-2026-rc14',version='digital-flagship-2026-rc14',prepared_on='2026-11-15',manifest='manifest-digital-flagship-2026-rc14.json',previous_candidate='digital-flagship-2026-rc13',previous_candidate_commit='e69940243ce4debe8cc3feec2ebbd2a656815adb',source_base_commit='e69940243ce4debe8cc3feec2ebbd2a656815adb',source_branch='editorial/diamond-gold-2026-11-15',release_note='RC14: seção editorial Diamond/Gold com seis referências e composição atribuída; ilustração conceitual, sem oferta. Candidata não publicada.')
    release_path.write_text(json.dumps(release,ensure_ascii=False,indent=2)+'\n')
    print('Prepared attributed Diamond/Gold editorial module; no publication.')

if __name__ == '__main__':
    main()
