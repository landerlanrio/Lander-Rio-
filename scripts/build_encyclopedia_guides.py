"""Render the encyclopedia reading index and chapters from the editorial sources."""
import json
import unicodedata
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = '/enciclopedia/guias/'
SITE = ROOT / 'site'
GROUPS = json.loads((ROOT / 'content/guias-enciclopedia.json').read_text())
catalog_js = (SITE / 'enciclopedia/assets/catalog-data.js').read_text()
SUBSTANCES = json.loads(catalog_js.split('=', 1)[1].strip().rstrip(';'))['items']


def esc(value):
    return escape(str(value), quote=True)


def plain(value):
    return ''.join(c for c in unicodedata.normalize('NFD', value.casefold()) if not unicodedata.combining(c))


def url_for(group, entry=None):
    url = BASE + group['slug'] + '/'
    return url + '#' + entry['slug'] if entry else url


def link(url, label):
    return f'<a href="{esc(url)}">{esc(label)}</a>'


def page(route, title, description, body, index_page=False):
    script = '<script defer src="/enciclopedia/assets/indice-guias.js"></script>' if index_page else ''
    crumbs = link('/enciclopedia/', 'Enciclopédia')
    if not index_page:
        crumbs += ' <span aria-hidden="true">/</span> ' + link(BASE, 'Índices')
    return f'''<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(title)} | Enciclopédia LANDER RIO</title><meta name="description" content="{esc(description)}">
<link rel="canonical" href="https://landerrio.com.br{route}"><meta name="robots" content="noindex,follow">
<meta property="og:type" content="{'website' if index_page else 'article'}"><meta property="og:locale" content="pt_BR">
<meta property="og:title" content="{esc(title)} | Enciclopédia LANDER RIO"><meta property="og:description" content="{esc(description)}">
<meta property="og:url" content="https://landerrio.com.br{route}">
<meta property="og:site_name" content="LANDER RIO">
<meta property="og:image" content="https://landerrio.com.br/assets/og-lander-v21.jpg">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:image:alt" content="LANDER RIO — Performance Culture"><meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="/assets/reference-fonts-rc6.css"><link rel="stylesheet" href="/enciclopedia/assets/guias-editoriais.css">{script}</head>
<body class="guide-book"><a class="book-skip" href="#leitura">Pular para o conteúdo</a>
<header class="book-header"><div><a class="book-brand" href="/">LANDER<span>.</span>RIO</a><nav aria-label="Navegação da Enciclopédia">{crumbs}</nav></div></header>
<main id="leitura" tabindex="-1">{body}</main>
<footer class="book-foot"><div>{link('/enciclopedia/', 'Enciclopédia do Bodybuilding')} {link('/enciclopedia/metodologia/', 'Metodologia editorial')}</div></footer>
</body></html>'''


def directory():
    rows = []
    for group in GROUPS:
        for entry in group['entries']:
            terms = ' '.join([entry['question'], group['title'], *entry['terms']])
            rows.append((entry['title'], 'Verbete', terms, url_for(group, entry)))
    for item in SUBSTANCES:
        aliases = ' '.join(item['aliases'])
        rows.append((item['name'], 'Ficha', item['category'] + ' ' + aliases, '/enciclopedia/substancias/' + item['slug'] + '/'))
    rows.sort(key=lambda row: plain(row[0]))
    body = []
    for title, kind, terms, url in rows:
        body.append(f'<li data-entry data-terms="{esc(terms)}">{link(url, title)}<span>{kind}</span></li>')
    return '\n'.join(body)


def write_index():
    total = sum(len(g['entries']) for g in GROUPS)
    topics = ''.join(f'<li><a href="{url_for(g)}"><strong>{esc(g["title"])}</strong><span>{esc(g["intro"])}</span></a></li>' for g in GROUPS)
    questions = []
    for group in GROUPS:
        entries = ''.join(f'<li>{link(url_for(group, e), e["question"])}</li>' for e in group['entries'])
        questions.append(f'<details><summary>{esc(group["title"])}</summary><ul>{entries}</ul></details>')
    html = f'''<div class="book-wrap"><div class="book-hero">
<p class="book-eyebrow">Enciclopédia do Bodybuilding</p><h1>Índices do <em>acervo.</em></h1>
<p class="book-lead">{total} verbetes para investigar o treino, a composição corporal e a ciência por trás das fichas de substâncias.</p>
<nav class="book-jumps" aria-label="Tipos de índice">{link('#temas','Por tema')}{link('#perguntas','Por pergunta')}{link('#a-z','Busca de A a Z')}</nav></div>
<section id="temas" class="book-block"><h2>Por tema</h2><ul class="book-topics">{topics}</ul></section>
<section id="perguntas" class="book-block"><h2>Por pergunta</h2><p>Abra um capítulo para ir direto à dúvida que trouxe você aqui.</p><div class="book-questions">{''.join(questions)}</div></section>
<section id="a-z" class="book-block"><h2>Busca de A a Z</h2><p>Encontre verbetes e fichas pelo nome, pela sigla ou pelo termo usado na academia.</p>
<div class="book-search" data-search-box hidden><label for="book-query">Pesquisar no acervo</label><div><input id="book-query" type="search" autocomplete="off" placeholder="Ex.: GH, whey, RIR, sono"><button type="button" id="book-clear">Limpar</button></div></div>
<p id="book-status" role="status">{len(SUBSTANCES) + total} entradas</p>
<ul id="book-directory" class="book-directory">{directory()}</ul></section></div>'''
    write(BASE, page(BASE, 'Índices do acervo', 'Busque fichas de substâncias e verbetes por tema, por pergunta ou em ordem alfabética.', html, True))


RELATED = {
    'gh-massa-magra-e-forca': ('somatropina-gh', 'Consultar a ficha de somatropina (GH)'),
    'tirzepatida-peso-e-composicao': ('tirzepatida', 'Consultar a ficha de tirzepatida'),
}


def write_chapter(group):
    items = group['entries']
    jumps = ''.join(f'<li>{link("#" + e["slug"], e["title"])}</li>' for e in items)
    d = [f'''<div class="book-wrap"><div class="book-hero"><p class="book-eyebrow">Enciclopédia do Bodybuilding</p>
<h1>{esc(group['title'])}</h1><p class="book-lead">{esc(group['intro'])}</p></div>
<div class="book-chapter"><nav class="book-contents" aria-label="Verbetes do capítulo"><h2>Neste capítulo</h2><ul>{jumps}</ul>{link(BASE+'#temas','Ver outros capítulos')}</nav><div>''']
    for e in items:
        source = f'<a href="{esc(e["url"])}">{esc(e["source"])}</a>'
        related = ''
        if e['slug'] in RELATED:
            slug, label = RELATED[e['slug']]
            target = '/enciclopedia/substancias/' + slug + '/'
            related = '<p class="book-related">' + link(target, label) + '</p>'
        d.append(f'''<article id="{esc(e["slug"])}" class="book-article"><p class="book-eyebrow">{esc(e['title'])}</p>
<h2>{esc(e['question'])}</h2><p class="book-answer">{esc(e['answer'])}</p>
<h3>O que a pesquisa mediu</h3><p>{esc(e['evidence'])}</p>
<h3>Até onde vai a conclusão</h3><p>{esc(e['limit'])}</p>
<div class="book-application"><h3>Na prática</h3><p>{esc(e['practice'])}</p></div>
<p class="book-reference">Referência<br>{source}<br><span>DOI {esc(e['doi'])}</span></p>{related}</article>''')
    d.append('</div></div><nav class="book-end" aria-label="Continuar a leitura">'+link(BASE+'#perguntas','Escolher outra pergunta')+link(BASE+'#a-z','Abrir índice A–Z')+'</nav></div>')
    write(url_for(group),page(url_for(group),group['title'],group['intro'],''.join(d)))


def write(route, content):
    folder = SITE / route.strip('/')
    folder.mkdir(parents=True, exist_ok=True)
    (folder / 'index.html').write_text(content + '\n')


if __name__ == '__main__':
    write_index()
    for group in GROUPS:
        write_chapter(group)
