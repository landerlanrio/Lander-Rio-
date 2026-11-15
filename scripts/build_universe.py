#!/usr/bin/env python3
"""Build static, accessible brand pages from content/brands.json (no runtime framework)."""
import copy,json,re,unicodedata
from html import escape as e
from pathlib import Path
import build_brand_profiles as base
R=Path(__file__).resolve().parents[1]; S=R/'site'; ORIGIN='https://landerrio.com.br'
VERSION='digital-flagship-2026-rc8'; DATE='2026-11-13'
DATA=json.loads((R/'content/brands.json').read_text()); BRANDS=DATA['brands']
base.VERSION=VERSION
def slug(s):return re.sub('[^a-z0-9]+','-',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower()).strip('-')
def schema(path,title,kind='WebPage',extra=None):
    crumbs=[{'@type':'ListItem','position':1,'name':'Início','item':ORIGIN+'/'}]
    if path.startswith('/marcas/'):
        crumbs.append({'@type':'ListItem','position':2,'name':'Universo de Marcas','item':ORIGIN+'/marcas/'})
        if path!='/marcas/':crumbs.append({'@type':'ListItem','position':3,'name':title,'item':ORIGIN+path})
    elif path.startswith('/conteudos/'):
        crumbs.append({'@type':'ListItem','position':2,'name':'Conhecimento','item':ORIGIN+'/conteudos/'})
        if path!='/conteudos/':crumbs.append({'@type':'ListItem','position':3,'name':title,'item':ORIGIN+path})
    graph=[{'@type':kind,'@id':ORIGIN+path+'#page','url':ORIGIN+path,'name':title,'inLanguage':'pt-BR','dateModified':DATE,'publisher':{'@type':'Organization','name':'LANDER RIO','url':ORIGIN+'/'}},{'@type':'BreadcrumbList','itemListElement':crumbs}]
    if extra:graph.append(extra)
    return '<script type="application/ld+json">'+json.dumps({'@context':'https://schema.org','@graph':graph},ensure_ascii=False).replace('</','<\\/')+'</script>'
def head(title,description,path,indexable=True):
    h=base.head(title,description,path).replace('/assets/brand-profiles-rc6.3.css','/assets/brand-universe-rc8.css')
    if not indexable:h=h.replace('content="index,follow"','content="noindex,follow"')
    return h.replace('Todas as marcas','Universo de Marcas')
def related(items):
    return '<section class="ba-related" aria-labelledby="related-title"><p class="ba-eyebrow">CONTINUE A EXPLORAÇÃO</p><h2 id="related-title">Conhecimento conectado.</h2><div class="ba-related-grid">'+''.join(f'<a href="{e(x["path"])}"><span>LEITURA EDITORIAL</span><strong>{e(x["title"])}</strong><span aria-hidden="true">↗</span></a>' for x in items)+'</div></section>'
def policy():
    return '<p class="ba-credit">Redação LANDER RIO · Perfil editorial independente · <time datetime="2026-11-13">Atualizado em 13 nov 2026</time></p>'
def profile(b,i,items):
    old=base.make_profile(b,i,items)
    oldhead=base.head(f'{b["name"]}: marca e produtos | LANDER RIO',f'Conheça {b["name"]}: apresentação da marca, linhas e referências de produtos documentados no arquivo editorial da LANDER RIO.',f'/marcas/{b["slug"]}/')
    h=old.replace(oldhead,head(b['seo']['title'],b['seo']['description'],f'/marcas/{b["slug"]}/',b['indexable']))
    h=h.replace('ARQUIVO DE MARCAS','UNIVERSO DE MARCAS').replace('Uma seleção do catálogo publicado.','Nomes atribuídos ao catálogo consultado.')
    h=h.replace('<p class="ba-focus">',f'<p class="ba-lede">{e(b["summary"])}</p><p class="ba-focus">',1)
    h=h.replace('</figure></section>','</figure></section>'+policy()+'<nav class="ba-jump" aria-label="Nesta página"><a href="#about-title">Sobre</a><a href="#produtos">Linhas e produtos</a><a href="#conhecimento">Entenda</a><a href="#perguntas">Dúvidas</a><a href="#sources-title">Fontes</a></nav>',1)
    for group in dict.fromkeys(p['group'] for p in b['products']):
        h=h.replace(f'<div class="ba-product-group"><h3>{e(group)}</h3>',f'<div class="ba-product-group" id="linha-{slug(group)}"><h3>{e(group)}</h3>')
    block='<section id="conhecimento" class="ba-knowledge"><p class="ba-eyebrow">03 / CONTEXTO</p><h2>Conhecer antes de concluir.</h2>'
    for k in b['knowledge']:block+=f'<article><h3>{e(k["title"])}</h3><p>{e(k["text"])}</p></article>'
    block+='</section><section id="perguntas" class="ba-faq"><p class="ba-eyebrow">04 / PERGUNTAS FREQUENTES</p><h2>Dúvidas sobre '+e(b['name'])+'.</h2>'
    for f in b['faqs']:block+=f'<details><summary>{e(f["question"])}</summary><p>{e(f["answer"])}</p></details>'
    block+='</section>'+related(b['related'])
    h=h.replace('<section class="ba-sources"',block+'<section class="ba-sources"',1)
    h=h.replace('Consulta editorial:','Fontes de catálogo atribuídas; isso não equivale a auditoria clínica, regulatória ou de lotes. Consulta editorial:')
    h=h.replace('</head>',schema(f'/marcas/{b["slug"]}/',b['name'])+'</head>')
    return base.vectors(h)
def directory():
    h=head('Universo de Marcas: linhas e informações | LANDER RIO','Explore 14 marcas, suas identidades e linhas documentadas. Perfis independentes, fontes, perguntas frequentes e conhecimento sobre performance.','/marcas/')
    h+='''<main id="conteudo"><section class="ba-universe-hero"><div><p class="ba-eyebrow">LANDER RIO / BRAND INTELLIGENCE / 2026</p><h1>UNIVERSO<br>DE <em>MARCAS.</em></h1><p class="ba-universe-lede">Cada identidade tem uma história.<br>Conheça o que está por trás do nome.</p></div><div class="ba-universe-aside"><span class="ba-orbit" aria-hidden="true">↗</span><p>14 identidades. Fontes abertas.<br>Uma leitura independente.</p><a href="#catalogo">Explorar o diretório ↓</a></div></section>
<section class="ba-feature" aria-labelledby="feature-title"><div><p class="ba-eyebrow">EM FOCO / LANDERPHARMA</p><h2 id="feature-title">Uma marca.<br>Diferentes linhas.</h2><p>Landerlan, Gold e Diamond: nomes que aparecem nas buscas, com categorias próprias no portfólio. Entenda a organização sem confundir apresentação com evidência clínica.</p><nav aria-label="Linhas em destaque"><a href="/marcas/landerlan/">Landerlan ↗</a><a href="/marcas/landerlan-gold/">Gold ↗</a><a href="/marcas/landerlan/#linha-diamond">Diamond ↗</a></nav></div><a class="ba-feature-logo" href="/marcas/landerlan/" aria-label="Conhecer Landerlan">'''
    lander=next(b for b in BRANDS if b['slug']=='landerlan');h+=base.picture(lander)+'<span>LANDERLAN / IDENTIDADE</span></a></section>'
    h+='''<section id="catalogo" class="ba-collection" aria-labelledby="directory-title"><div class="ba-collection-head"><div><p class="ba-eyebrow">01 / DIRETÓRIO</p><h2 id="directory-title">Encontre sua próxima leitura.</h2></div><p>Perfis, linhas, dúvidas e referências.<br>Toque em uma marca para conhecer.</p></div><div class="ba-controls" data-enhanced hidden><label for="brand-query">Buscar no universo de marcas<input id="brand-query" type="search" placeholder="Nome ou linha da marca" autocomplete="off"></label><fieldset><legend>Filtrar por contexto</legend><button type="button" data-filter="all" aria-pressed="true">Todas</button><button type="button" data-filter="laboratorios" aria-pressed="false">Laboratórios</button><button type="button" data-filter="peptideos" aria-pressed="false">Peptídeos</button><button type="button" data-filter="verificacao" aria-pressed="false">Em verificação</button></fieldset><p id="brand-count" role="status" aria-live="polite">14 marcas</p></div><div class="ba-directory">'''
    for i,b in enumerate(BRANDS):
        hay=' '.join([b['name'],b['focus'],*b['lines']]);
        h+=f'<a id="{b["slug"]}" class="ba-directory-card" data-brand="{b["slug"]}" data-search="{e(hay)}" data-category="{b["category"]}" href="/marcas/{b["slug"]}/"><div class="ba-logo-canvas"><span>{i+1:02d} / 14</span>{base.picture(b,"lazy")}</div><div class="ba-directory-label"><h3>{e(b["name"])}</h3><p>{e(b["summary"])}</p><span class="ba-card-link">Conhecer a marca <span aria-hidden="true">↗</span></span></div></a>'
    h+='''</div><p id="brand-empty" hidden>Nenhuma marca encontrada. Tente outro nome ou selecione “Todas”.</p></section><section class="ba-reading-note"><p class="ba-eyebrow">02 / CRITÉRIO EDITORIAL</p><h2>Clareza é parte<br>da performance.</h2><div><p>Este universo organiza informações de fontes identificadas. Uma linha é uma família de catálogo; uma apresentação descreve o formato. Nenhuma dessas informações, isoladamente, comprova qualidade clínica ou autorização de venda.</p><p>Identidades com documentação insuficiente permanecem sinalizadas. Os perfis não representam vínculo oficial, recomendação, estoque ou oferta comercial da LANDER RIO.</p><a href="/conteudos/como-verificar-procedencia-canais-oficiais/">Como ler e conferir as fontes ↗</a></div></section>'''
    h+=related([{'title':'Peptídeos: da definição à leitura de estudos','path':'/conteudos/peptideos-o-que-sao/'},{'title':'Treino, alimentação e cultura de performance','path':'/conteudos/'}])+'</main>'+base.footer()
    itemlist={'@type':'ItemList','name':'Universo de Marcas','itemListElement':[{'@type':'ListItem','position':i+1,'name':b['name'],'url':ORIGIN+'/marcas/'+b['slug']+'/'} for i,b in enumerate(BRANDS)]}
    return base.vectors(h.replace('</head>',schema('/marcas/','Universo de Marcas','CollectionPage',itemlist)+'<script defer src="/assets/brand-universe-rc8.js"></script></head>'))
def gold():
    b=copy.deepcopy(next(x for x in BRANDS if x['slug']=='landerlan'))
    b.update(slug='landerlan-gold',name='Landerlan Gold',focus='Uma linha do portfólio Landerpharma',summary='A linha Gold, seus nomes publicados e as diferenças de classificação em relação à Diamond.',about='Gold é uma das linhas apresentadas no catálogo da Landerpharma, empresa que se identifica como paraguaia. Esta página preserva a URL existente de Landerlan Gold e organiza referências da linha sem tratá-la como um fabricante independente.')
    b['seo']={'title':'Landerlan Gold: linha, catálogo e dúvidas | LANDER RIO','description':'Entenda Landerlan Gold, sua relação com a Landerpharma e a classificação Gold versus Diamond. Referências de catálogo e dúvidas com fontes.','keyword':'landerlan gold'}
    b['lines']=['Gold'];b['products']=[p for p in b['products'] if p['group']=='Gold']
    b['knowledge']=[{'title':'A mesma denominação pode aparecer em linhas diferentes','text':'O catálogo Gold e o catálogo Diamond incluem nomes em comum, como Durateston Plus e Testenat Depot. O nome da referência, sozinho, não basta para identificar sua linha ou apresentação. Confira a fonte específica e não transfira informações entre produtos.'}]
    b['faqs']=[{'question':'Gold é um fabricante independente?','answer':'No site consultado, Gold aparece como linha da Landerpharma, ao lado de Landerlan, Silver e Diamond.'},{'question':'Quais referências aparecem na linha Gold?','answer':'A página consultada lista, entre outros, Decaland Depot, Durateston Plus, Testenat Depot, testosterona propionato e nandrolona fenilpropionato. É uma lista parcial do catálogo publicado.'},{'question':'Gold é melhor que Diamond?','answer':'A pesquisa confirmou famílias de catálogo e apresentações distintas. Não verificou uma comparação clínica que permita afirmar superioridade em segurança ou eficácia.'},{'question':'Como diferenciar a linha antes de consultar informações?','answer':'Confira a identificação completa, a apresentação e a página de origem no catálogo. A cor ou o nome comercial isolado não foi validado como prova de autenticidade.'}]
    b['related']=[{'title':'Landerlan: visão geral das linhas','path':'/marcas/landerlan/'},{'title':'Diamond: referências documentadas','path':'/marcas/landerlan/#linha-diamond'},{'title':'Procedência e canais de informação','path':'/conteudos/como-verificar-procedencia-canais-oficiais/'}]
    return profile(b,0,[b,BRANDS[0]])
def write(path,html):
    p=S/path;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(html)
def main():
    for i,b in enumerate(BRANDS):write('marcas/'+b['slug']+'/index.html',profile(b,i,BRANDS))
    write('marcas/index.html',directory());write('marcas/landerlan-gold/index.html',gold())
    home=(S/'index.html').read_text()
    home=home.replace('<span>MARCAS</span>','<span>UNIVERSO</span>').replace('<span>EM DESTAQUE.</span>','<span>DE MARCAS.</span>')
    home=home.replace('MARCAS<br/>EM DESTAQUE.','UNIVERSO<br/>DE MARCAS.')
    home=home.replace('MARCAS<br><em>EM DESTAQUE.</em>','UNIVERSO<br><em>DE MARCAS.</em>')
    home=home.replace('VER TODAS AS MARCAS','EXPLORAR UNIVERSO DE MARCAS')
    home=home.replace('digital-flagship-2026-rc6.3',VERSION)
    home=home.replace('/assets/brand-profiles-rc6.3.css','/assets/brand-universe-rc8.css')
    # Existing editorial section precedes utilities; preserve the actual sections and assets.
    pattern=r'<section\b[^>]*id="ciencia"[^>]*>.*?</section>'
    journal=re.search(pattern,home,re.S)
    tools=re.search(r'<section\b[^>]*id="ferramentas"',home)
    if journal and tools and journal.start()>tools.start():
        section=journal[0];home=home[:journal.start()]+home[journal.end():];pos=re.search(r'<section\b[^>]*id="ferramentas"',home).start();home=home[:pos]+section+'\n'+home[pos:]
    write('index.html',home)
    print(json.dumps({'brands':len(BRANDS),'expanded_existing_gold':True,'products':sum(len(b['products']) for b in BRANDS),'faqs':sum(len(b['faqs']) for b in BRANDS),'held_profiles':[b['slug'] for b in BRANDS if not b['indexable']]}))
if __name__=='__main__':main()
