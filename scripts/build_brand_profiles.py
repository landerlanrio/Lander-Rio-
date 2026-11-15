#!/usr/bin/env python3
"""Generate the editorial brand directory from reviewed, attributed source data.

This is explicit content preparation, not a test. It never changes image bytes.
"""
import json, re
from html import escape as e
from html.parser import HTMLParser
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SITE=ROOT/'site'
VERSION='digital-flagship-2026-rc6.3'
DATE='2026-11-13'

class Logos(HTMLParser):
    def __init__(self):super().__init__();self.items=[];self.active=None
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='a' and 'data-brand' in a:
            self.active={'slug':a['data-brand'],'name':a['data-brand-name']};self.items.append(self.active)
        if tag=='img' and self.active is not None:self.active['image']={k:a[k] for k in ('src','width','height')}
    def handle_endtag(self,tag):
        if tag=='a':self.active=None

def source(label,url):return {'label':label,'url':url,'checked':DATE}
def product(name,detail,group,source=1):return {'name':name,'detail':detail,'group':group,'source':source}

# Only names and presentations supported by the cited publisher are included.
# These are editorial catalog excerpts, never inventory, offers or prescriptions.
CONTENT={
'cooper-pharma':dict(
    focus='Indústria farmacêutica',
    about='A Cooper Pharma é uma empresa farmacêutica sediada em Nova Délhi, na Índia. Seu portfólio publicado abrange diferentes áreas, incluindo cardiologia, diabetes, antibióticos e hormônios. A seleção abaixo apresenta nomes encontrados na linha hormonal do fabricante.',
    lines=['Hormônios','Comprimidos','Injetáveis'],
    products=[product('ANAZBOL','Anastrozol · comprimidos','Hormônios'),product('COTROPIN','Gonadotrofina coriônica humana','Hormônios'),product('CORTIS','Hidrocortisona · injetável','Hormônios'),product('NOLVABOLIC','Citrato de tamoxifeno · comprimidos','Hormônios'),product('TESTOBOLIC','Undecanoato de testosterona · injetável','Hormônios'),product('HGH — Somatropin','Somatropina','Hormônios')],
    sources=[source('Cooper Pharma · linha hormonal','https://cooperpharma.com/products/hormones'),source('Cooper Pharma · apresentação institucional','https://cooperpharma.com/')]),
'zphc':dict(
    focus='Identidade e portfólio',
    about='O site institucional atual da ZPHC apresenta a marca no universo esportivo, com acessórios, vestuário e conteúdo de treinamento. Essa apresentação não permite confirmar o catálogo farmacêutico associado ao nome ZPHC em outros canais.',
    lines=['Identidade da marca'],products=[],
    pending='O catálogo farmacêutico desta identidade ainda precisa de uma fonte confirmada. Nenhum produto de outro fabricante foi associado a esta logo.',
    sources=[source('ZPHC · apresentação institucional atual','https://zphc.com/'),source('ZPHC · domínios e identidade','https://zphc.com/official-domains-authenticity/')]),
'landerlan':dict(
    focus='Landerlan · Gold · Diamond',
    about='Landerlan é uma das linhas apresentadas pela Landerpharma, no Paraguai. O grupo organiza seu portfólio em famílias como Landerlan, Silver, Gold e Diamond. Os nomes abaixo constam nos catálogos Gold e Diamond consultados.',
    lines=['Landerlan','Silver','Gold','Diamond'],
    products=[product('Durateston Plus','Mistura de ésteres de testosterona','Diamond'),product('Decaland Depot','Decanoato de nandrolona','Diamond'),product('Testenat Depot','Enantato de testosterona','Diamond'),product('Testoland Depot','Cipionato de testosterona','Diamond'),product('Drostanolona propionato','Apresentação em ampolas','Diamond'),product('Metenolona enantato','Apresentação em ampolas','Diamond'),product('Testosterona propionato','Apresentação em frasco','Gold',2),product('Nandrolona fenilpropionato','Apresentação em frasco','Gold',2)],
    sources=[source('Landerpharma · linha Diamond','https://www.landerpharma.com.py/linea-diamond'),source('Landerpharma · linha Gold','https://www.landerpharma.com.py/linea-gold'),source('Landerpharma · linhas e apresentação','https://www.landerpharma.com.py/')]),
'oxygen-kw-pharma':dict(
    focus='Peptídeos e formulações',
    about='Oxygen KW Pharma publica um portfólio concentrado em peptídeos e formulações hormonais. Entre as denominações apresentadas estão Retagen e Tirzegen, ao lado de compostos como GHK-Cu e BPC-157. A marca descreve apresentações líquidas e liofilizadas.',
    lines=['Peptídeos','Formulações'],
    products=[product('Retagen','Retatrutida','Peptídeos'),product('Tirzegen','Tirzepatida','Peptídeos'),product('GHK-Cu','Peptídeo de cobre','Peptídeos'),product('Glow','Denominação de formulação da marca','Formulações'),product('BPC-157','Peptídeo listado no portfólio','Peptídeos',2),product('MOTS-c','Peptídeo listado no portfólio','Peptídeos',2)],
    note='A presença no catálogo do fabricante não comprova aprovação para uso humano ou autorização de venda no Brasil.',
    sources=[source('Oxygen KW Pharma · apresentação e portfólio','https://www.oxygenkwpharma.com/'),source('Oxygen KW Pharma · lista de formulações','https://oxygenkwpharma.com/certifications')]),
'alpha-x-prime':dict(
    focus='Identidade da marca',
    about='Alpha X Prime é a identidade identificada por esta logomarca na seleção da LANDER RIO. O nome e o símbolo são preservados exatamente como fornecidos, sem associar a marca a empresas com nomes semelhantes.',
    lines=['Alpha X Prime'],products=[],
    pending='A apresentação institucional e os nomes dos produtos aguardam o catálogo original do fabricante. Alpha X Prime não foi confundida com Alpha Laboratory ou Alpha Pharma.',
    sources=[]),
'quimfa':dict(
    focus='Laboratório farmacêutico',
    about='A Quimfa S.A. mantém um vade-mécum farmacêutico organizado por especialidade e ação terapêutica. A seleção consultada inclui linhas de cardiologia, clínica médica, hematologia e apresentações injetáveis.',
    lines=['Cardiologia','Clínica médica','Injetáveis'],
    products=[product('A3','Linha de clínica médica geral','Clínica médica'),product('AAS','Linha de cardiologia','Cardiologia'),product('Ácido Fólico','Linha de ginecologia e pediatria','Vitaminas'),product('Aerofagil','Linha de gastroenterologia','Gastroenterologia'),product('Aftum','Apresentações orais e injetáveis','Hematologia',2),product('Lipostabil','Ácido fenofíbrico · cápsulas de liberação prolongada','Cardiologia',3)],
    sources=[source('Quimfa · vade-mécum','https://www.quimfa.com.py/vademecum/'),source('Quimfa · antifibrinolíticos','https://www.quimfa.com.py/accion-terapeutica/antifibrinoliticos/'),source('Quimfa · Lipostabil','https://www.quimfa.com.py/en/product/lipostabil-135/')]),
'eticos':dict(
    focus='Laboratório e portfólio farmacêutico',
    about='Éticos é um laboratório paraguaio cujo catálogo reúne diferentes áreas terapêuticas, incluindo diabetes, cardiometabolismo e a linha Bioeticos. Lipoless aparece no catálogo em apresentações em vial e em caneta.',
    lines=['Diabetes','Cardiometabólica','Bioeticos'],
    products=[product('Lipoless','Tirzepatida · vial','Diabetes'),product('Lipoless MD Pen','Tirzepatida · caneta','Diabetes'),product('Glimerin','Glimepirida','Diabetes'),product('Glimerin MET','Glimepirida e metformina','Diabetes'),product('Idacio','Adalimumabe · seringa e caneta preenchidas','Bioeticos',2)],
    sources=[source('Éticos · catálogo de diabetes','https://eticos.com.py/product_cat/diabetes?product-page=2'),source('Éticos · Idacio','https://eticos.com.py/producto/idacio'),source('Éticos · institucional','https://eticos.com.py/')]),
'indufar':dict(
    focus='Laboratório farmacêutico paraguaio',
    about='A Indufar CISA é um laboratório farmacêutico do Paraguai. Entre os produtos documentados em seus canais institucionais estão T.G., à base de tirzepatida, e Solufin, à base de semaglutida. A empresa também publica comunicados de identificação de suas apresentações.',
    lines=['Medicamentos','Saúde metabólica'],
    products=[product('T.G.','Tirzepatida · solução injetável em vials','Saúde metabólica'),product('Solufin','Semaglutida','Saúde metabólica',2)],
    sources=[source('Indufar · apresentações de T.G.','https://indufar.com.py/TG'),source('Indufar · publicações institucionais','https://www.indufar.com.py/blog')]),
'life-peptideos':dict(
    focus='Peptídeos · canetas e vials',
    about='Life Peptídeos apresenta um catálogo de peptídeos e formulações em diferentes formatos. O portfólio publicado reúne nomes como Tirzepatide Pen, Retatrutide Pen e GHK-Cu Pen, além das formulações Glow e Klow.',
    lines=['Canetas','Peptídeos','Formulações'],
    products=[product('Tirzepatide Pen','Tirzepatida · caneta','Canetas'),product('Retatrutide Pen','Retatrutida · caneta','Canetas'),product('GHK-Cu Pen','Peptídeo de cobre · caneta','Canetas'),product('Glow Pen','Formulação identificada como Glow','Formulações'),product('Klow Pen','Formulação identificada como Klow','Formulações'),product('NAD+ Pen','NAD+ · caneta','Canetas'),product('GH Life Pen','Denominação apresentada no catálogo','Canetas')],
    note='Alguns compostos citados têm caráter experimental. A listagem não constitui indicação de uso humano.',
    sources=[source('Life Peptídeos · catálogo publicado','https://lifepeptideos.com/')]),
'eminence-labs':dict(
    focus='Comprimidos e injetáveis',
    about='Eminence Labs organiza seu catálogo em duas famílias principais: comprimidos e injetáveis. As linhas utilizam denominações como Oxanprime, Stanoprime, Cypoprime e Decaprime. A seleção abaixo mantém a associação entre nome comercial e composição publicada.',
    lines=['Comprimidos','Injetáveis'],
    products=[product('Oxanprime','Oxandrolona · comprimidos','Comprimidos'),product('Stanoprime','Estanozolol · comprimidos','Comprimidos'),product('Anastroprime','Anastrozol · comprimidos','Comprimidos'),product('Tamoprime','Citrato de tamoxifeno · comprimidos','Comprimidos'),product('Cypoprime','Cipionato de testosterona · injetável','Injetáveis',2),product('Decaprime','Decanoato de nandrolona · injetável','Injetáveis',2),product('Enaprime','Enantato de testosterona · injetável','Injetáveis',2),product('L-Prime','L-carnitina · injetável','Injetáveis',2)],
    sources=[source('Eminence Labs · comprimidos','https://www.eminencelabs.com/category/tablets/'),source('Eminence Labs · injetáveis','https://www.eminencelabs.com/category/injections/')]),
'topharma':dict(
    focus='Linhas Silver e Gold',
    about='Topharma apresenta seu portfólio nas linhas Silver e Gold. O catálogo reúne comprimidos e formulações injetáveis, com denominações próprias como Oxantop, Top Proviron e Top NPP.',
    lines=['Silver','Gold','Comprimidos','Injetáveis'],
    products=[product('Oxantop','Denominação publicada no portfólio','Comprimidos'),product('Top Proviron','Denominação publicada no portfólio','Comprimidos'),product('Dianabol Oral','Apresentação oral','Comprimidos'),product('Stanozolol Oral','Estanozolol · apresentação oral','Comprimidos'),product('Top NPP','Denominação publicada no portfólio','Injetáveis'),product('Enantato de metenolona','Formulação injetável','Injetáveis'),product('Decanoato de nandrolona','Formulação injetável','Injetáveis'),product('Propionato de testosterona','Formulação injetável','Injetáveis')],
    sources=[source('Topharma · portfólio Silver e Gold','https://www.topharma.net/portfolio/')]),
'muscle-labs-india':dict(
    focus='Linha farmacêutica',
    about='Muscle Labs India publica linhas de comprimidos, injetáveis, ampolas e peptídeos. O catálogo consultado pertence à identidade Muscle Labs India apresentada nesta página, distinta de empresas de nutrição esportiva com nomes semelhantes.',
    lines=['Comprimidos','Injetáveis','Ampolas','Peptídeos'],
    products=[product('Trenbolone Acetate','Acetato de trembolona','Injetáveis'),product('Methenolone Enanthate','Enantato de metenolona','Injetáveis'),product('Dianabol','Metandrostenolona','Comprimidos'),product('Somatropin','Somatropina','Peptídeos')],
    sources=[source('Muscle Labs India · linhas e produtos','https://www.musclelabsindia.com/')]),
'synedica':dict(
    focus='Peptídeos e kits',
    about='Synedica aparece em catálogos de peptídeos apresentados em kits e canetas. O catálogo de referência consultado identifica os itens como materiais para pesquisa laboratorial. Retatrutide, Tirzepatide e Semaglutide estão entre as denominações publicadas.',
    lines=['Peptídeos','Kits para pesquisa'],
    products=[product('Retatrutide','Kit em canetas · designação do catálogo','Pesquisa'),product('Tirzepatide','Kit em canetas · designação do catálogo','Pesquisa'),product('Semaglutide','Kit em canetas · designação do catálogo','Pesquisa'),product('BPC-157 & TB-500','Kit combinado · designação do catálogo','Pesquisa'),product('Somatotropin HGH','Kit em canetas · designação do catálogo','Pesquisa')],
    note='Há domínios com reivindicações conflitantes sobre esta marca. A autoria do fabricante não foi confirmada de forma independente. Os nomes são atribuídos ao catálogo citado, que os identifica como destinados à pesquisa, não ao uso humano ou veterinário.',
    sources=[source('Synedica.org · catálogo de kits para pesquisa','https://www.synedica.org/collections/pen-kits'),source('Synedica.org · nota sobre identidade','https://www.synedica.org/pages/about-us-new')]),
'geniqs-pharma':dict(
    focus='Formulações hormonais',
    about='Geniqs Pharma apresenta formulações hormonais nas formas de comprimidos e injetáveis. O site Geniqscare identifica produtos por nome comercial e composição e mantém uma área de autenticação por código. Progenic e Testogenic são exemplos documentados nesse catálogo.',
    lines=['Injetáveis','Comprimidos'],
    products=[product('Progenic','Propionato de testosterona · ampolas','Injetáveis'),product('Testogenic','Testosterona em suspensão · ampolas','Injetáveis',2)],
    sources=[source('Geniqscare · Progenic','https://geniqscare.com/product/progenic/'),source('Geniqscare · Testogenic','https://geniqscare.com/product/testogenic/'),source('Geniqscare · apresentação da Geniqs Pharma','https://geniqscare.com/about-us/')]),
}

def picture(b,loading='eager'):
    im=b['image']
    return f'<img src="{e(im["src"])}" width="{im["width"]}" height="{im["height"]}" alt="Logotipo {e(b["name"])}" loading="{loading}" decoding="async">'

def head(title,description,path):
    url='https://landerrio.com.br'+path
    return f'''<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#101211">
<title>{e(title)}</title><meta name="description" content="{e(description)}"><link rel="canonical" href="{url}"><meta name="robots" content="index,follow">
<meta property="og:type" content="website"><meta property="og:locale" content="pt_BR"><meta property="og:site_name" content="LANDER RIO"><meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(description)}"><meta property="og:url" content="{url}"><meta property="og:image" content="https://landerrio.com.br/assets/og-lander-v21.jpg"><meta property="og:image:alt" content="LANDER RIO — Performance Culture"><meta name="twitter:card" content="summary_large_image"><meta name="lander-release" content="{VERSION}">
<link rel="icon" href="/favicon.png"><link rel="stylesheet" href="/assets/reference-fonts-rc6.css"><link rel="stylesheet" href="/assets/brand-profiles-rc6.3.css"><script defer src="/assets/measurement-v23-2.js"></script>
</head><body class="brand-archive" data-informational="true"><a class="skip" href="#conteudo">Pular para o conteúdo</a>
<header class="ba-header"><a class="ba-wordmark" href="/" aria-label="LANDER RIO — início">LANDER RIO<span>PERFORMANCE CULTURE</span></a><a class="ba-back" href="/marcas/">Todas as marcas <span aria-hidden="true">↗</span></a></header>'''

def footer():
    return '''<footer class="ba-footer"><a class="ba-wordmark" href="/">LANDER RIO<span>PERFORMANCE CULTURE</span></a><nav aria-label="Rodapé"><a href="/#marcas">Voltar ao site</a><a href="/enciclopedia/">Enciclopédia</a><a href="/privacidade">Privacidade</a></nav><p>© 2026 LANDER RIO. Marcas e logotipos pertencem aos seus titulares. A presença neste arquivo não indica parceria oficial.</p></footer></body></html>'''

def vectors(html):
    return html.replace('↗', '<svg class="ba-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg>')

def make_profile(b,index,items):
    slug,name=b['slug'],b['name']
    description=f'Conheça {name}: apresentação da marca, linhas e referências de produtos documentados no arquivo editorial da LANDER RIO.'
    title=f'{name}: marca e produtos | LANDER RIO'
    h=head(title,description,f'/marcas/{slug}/')
    tags=''.join(f'<li>{e(x)}</li>' for x in b['lines'])
    action='Explorar produtos' if b['products'] else 'Ver situação do catálogo'
    h+=f'''<main id="conteudo"><nav class="ba-breadcrumb" aria-label="Caminho da página"><a href="/">Início</a><span aria-hidden="true">/</span><a href="/marcas/">Marcas</a><span aria-hidden="true">/</span><span aria-current="page">{e(name)}</span></nav>
<section class="ba-hero" aria-labelledby="brand-title"><div class="ba-intro"><p class="ba-eyebrow">ARQUIVO DE MARCAS <span>{index+1:02d} / {len(items):02d}</span></p><h1 id="brand-title">{e(name)}</h1><p class="ba-focus">{e(b['focus'])}</p><a class="ba-action" href="#produtos">{action} <span aria-hidden="true">↓</span></a></div><figure class="ba-showcase">{picture(b)}<figcaption>IDENTIDADE / {e(name).upper()}</figcaption></figure></section>
<section class="ba-about" aria-labelledby="about-title"><div><p class="ba-eyebrow">01 / IDENTIDADE</p><h2 id="about-title">Sobre a marca.</h2></div><div><p>{e(b['about'])}</p><ul class="ba-tags" aria-label="Linhas da marca">{tags}</ul></div></section>
<section class="ba-catalog" id="produtos" aria-labelledby="products-title"><div class="ba-section-head"><div><p class="ba-eyebrow">02 / PORTFÓLIO</p><h2 id="products-title">Linhas &amp; produtos.</h2></div><p>Uma seleção do catálogo publicado.<br>Referência editorial, sem indicação de estoque.</p></div>'''
    if b['products']:
        groups=list(dict.fromkeys(p['group'] for p in b['products']))
        for group in groups:
            h+=f'<div class="ba-product-group"><h3>{e(group)}</h3><ul class="ba-products">'
            for p in (p for p in b['products'] if p['group']==group):
                h+=f'<li class="ba-product"><div><strong>{e(p["name"])}</strong><p>{e(p["detail"])}</p></div><a class="ba-source-ref" href="#fonte-{p["source"]}" aria-label="Fonte {p["source"]} de {e(p["name"])}">[{p["source"]:02d}]</a></li>'
            h+='</ul></div>'
    else:
        h+=f'<div class="ba-pending"><h3>Catálogo em verificação</h3><p>{e(b["pending"])}</p></div>'
    if b.get('note'):h+=f'<p class="ba-context">{e(b["note"])}</p>'
    h+='''<p class="ba-editorial-note">Informação sobre portfólio não equivale a autorização de comercialização ou recomendação de uso. Medicamentos exigem avaliação profissional; compostos experimentais não devem ser tratados como medicamentos aprovados.</p></section>'''
    h+=f'<section class="ba-sources" aria-labelledby="sources-title"><h2 id="sources-title">Fontes &amp; atualização</h2><p>Consulta editorial: <time datetime="{DATE}">13 de novembro de 2026</time>. Nomes e apresentações atribuídos às publicações abaixo; seleção não exaustiva.</p>'
    if b['sources']:
        h+='<ol>'
        for i,s in enumerate(b['sources']):h+=f'<li id="fonte-{i+1}"><a href="{e(s["url"])}" target="_blank" rel="noopener noreferrer">{e(s["label"])} <span class="ba-sr">(abre em nova aba)</span><span aria-hidden="true">↗</span></a></li>'
        h+='</ol>'
    else:h+='<p>Logo fornecida pela LANDER RIO. Documentação do fabricante ainda não confirmada.</p>'
    next_b=items[(index+1)%len(items)]
    h+=f'''</section><nav class="ba-next" aria-label="Continuar explorando"><a href="/marcas/">← Todas as marcas</a><a href="/marcas/{next_b['slug']}/"><small>PRÓXIMA MARCA</small><strong>{e(next_b['name'])} <span aria-hidden="true">↗</span></strong></a></nav></main>'''+footer()
    return h

def make_directory(items):
    h=head('Marcas e produtos | LANDER RIO','Explore as 14 marcas da LANDER RIO: identidade, apresentação, linhas e seleção de produtos com referências de catálogo.','/marcas/')
    h+='''<main id="conteudo"><section class="ba-directory-head"><p class="ba-eyebrow">LANDER RIO / ARQUIVO DE MARCAS</p><h1>Identidades.<br><span>Universos.</span></h1><p>Conheça a apresentação, as linhas e os produtos documentados de cada marca. Escolha uma identidade para explorar.</p><a class="ba-action" href="#catalogo">Explorar 14 marcas <span aria-hidden="true">↓</span></a></section><section id="catalogo" class="ba-directory" aria-label="Escolha uma marca">'''
    for i,b in enumerate(items):
        h+=f'<a id="{b["slug"]}" class="ba-directory-card" data-brand="{b["slug"]}" href="/marcas/{b["slug"]}/"><div class="ba-logo-canvas"><span>{i+1:02d} / 14</span>{picture(b,"lazy")}</div><div class="ba-directory-label"><h2>{e(b["name"])}</h2><p>{e(b["focus"])}</p><span aria-hidden="true">↗</span></div></a>'
    return h+'</section><p class="ba-directory-note">A presença das marcas não indica parceria oficial. Produtos são referências editoriais, sem oferta comercial. Catálogos sem documentação suficiente são identificados nas respectivas páginas.</p></main>'+footer()

def main():
    home=(SITE/'index.html').read_text();parser=Logos();parser.feed(home)
    assert len(parser.items)==14
    items=[dict(b,**CONTENT[b['slug']]) for b in parser.items]
    for i,b in enumerate(items):
        path=SITE/'marcas'/b['slug']/'index.html';path.parent.mkdir(exist_ok=True);path.write_text(vectors(make_profile(b,i,items)))
    (SITE/'marcas/index.html').write_text(vectors(make_directory(items)))
    # Amend actual anchors, retaining existing images, carousel and analytics attributes.
    def link(m):
        tag=m[0];slug=re.search(r'data-brand="([^"]+)"',tag)[1]
        tag=re.sub(r'href="[^"]+"',f'href="/marcas/{slug}/"',tag)
        tag=re.sub(r'data-canvas="[^"]+"','data-canvas="white"',tag)
        if 'data-canvas=' not in tag:tag=tag[:-1]+' data-canvas="white">'
        tag=tag.replace('no diretório LANDER RIO','— marca e produtos')
        return tag
    home=re.sub(r'<a\b[^>]*\bdata-brand="[^"]+"[^>]*>',link,home)
    css='<link rel="stylesheet" href="/assets/brand-profiles-rc6.3.css">'
    if css not in home:home=home.replace('</head>',css+'</head>')
    home=re.sub(r'content="digital-flagship-2026-rc[^"]+" name="lander-release"',f'content="{VERSION}" name="lander-release"',home)
    home=home.replace('IDENTIDADES / CURADORIA VISUAL','MARCAS / CONHEÇA OS PORTFÓLIOS')
    home=home.replace('Identidades do diretório LANDER RIO, com suas logomarcas originais e acesso às páginas institucionais.','Conheça cada marca, suas linhas e os produtos documentados. Toque em uma identidade para explorar.')
    home=home.replace('As marcas não indicam parceria, oferta ou disponibilidade. Referência informativa. A presença de uma marca não indica vínculo oficial, disponibilidade ou oferta.','As marcas não indicam parceria oficial, oferta ou disponibilidade. Conteúdo informativo com referências de catálogo.')
    (SITE/'index.html').write_text(home)
    data={'version':VERSION,'reviewed_on':DATE,'scope':'Editorial excerpts; no inventory or offer','brands':items}
    (ROOT/'docs/BRAND_PROFILES_RC6.3.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    # New routes only; retain the complete pre-existing sitemap.
    sitemap=(SITE/'sitemap.xml').read_text()
    for b in items:
        url=f'https://landerrio.com.br/marcas/{b["slug"]}/'
        if url not in sitemap:
            closing='</ns0:urlset>' if '</ns0:urlset>' in sitemap else '</urlset>'
            prefix='ns0:' if closing.startswith('</ns0:') else ''
            entry=f'<{prefix}url><{prefix}loc>{url}</{prefix}loc><{prefix}lastmod>{DATE}</{prefix}lastmod></{prefix}url>'
            sitemap=sitemap.replace(closing,entry+closing)
    (SITE/'sitemap.xml').write_text(sitemap)
    print(json.dumps({'profiles':len(items),'with_product_examples':sum(bool(b['products']) for b in items),'product_references':sum(len(b['products']) for b in items),'catalog_pending':[b['name'] for b in items if not b['products']]},ensure_ascii=False))
if __name__=='__main__':main()
