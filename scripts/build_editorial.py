#!/usr/bin/env python3
import json,re
from html import escape as e,unescape
from pathlib import Path
from build_universe import head,schema,related,policy,slug,base,R,S,ORIGIN,write
DATA=json.loads((R/'content/articles.json').read_text())
def inline(text):
    text=e(text)
    text=re.sub(r'\*\*(.+?)\*\*',r'<strong>\1</strong>',text)
    return re.sub(r'\[S(\d)\]',r'<a class="ba-citation" href="#fonte-S\1" aria-label="Consultar fonte \1">[\1]</a>',text)
def markdown(text):
    out=[];toc=[]
    for block in text.split('\n\n'):
        if block.startswith('## '):
            title=block[3:];ident=slug(title);toc.append((ident,title));out.append(f'<h2 id="{ident}">{e(title)}</h2>')
        elif block.startswith('- '):out.append('<ul>'+''.join('<li>'+inline(x[2:])+'</li>' for x in block.split('\n') if x.startswith('- '))+'</ul>')
        else:out.append('<p>'+inline(block)+'</p>')
    return ''.join(out),toc
def make_article(a):
    path='/conteudos/'+a['slug']+'/'
    h=head(a['seo_title'],a['description'],path)
    body,toc=markdown(a['body'])
    h+='<main id="conteudo"><nav class="ba-breadcrumb" aria-label="Caminho da página"><a href="/">Início</a><span>/</span><a href="/conteudos/">Conhecimento</a><span>/</span><span aria-current="page">'+e(a['category'])+'</span></nav>'
    h+=f'<header class="ba-article-head"><p class="ba-eyebrow">LANDER JOURNAL / {e(a["category"].upper())}</p><h1>{e(a["title"])}</h1><p class="ba-lede">{e(a["intro"])}</p>{policy()}</header><div class="ba-article-layout"><nav class="ba-article-nav" aria-label="Neste artigo">'+''.join(f'<a href="#{ident}">{e(title)}</a>' for ident,title in toc)+'</nav><article class="ba-prose">'+body
    h+='<section class="ba-sources" aria-labelledby="sources-title"><h2 id="sources-title">Fontes e escopo editorial</h2>'
    if a['sources']:
        h+='<ol>'+''.join(f'<li id="fonte-{s["id"]}"><a href="{e(s["url"])}" rel="noopener noreferrer" target="_blank">{e(s["label"])} <span class="ba-sr">(abre em nova aba)</span>↗</a></li>' for s in a['sources'])+'</ol><p>Consulta em 13 de novembro de 2026. Síntese editorial das fontes; não representa endosso das instituições. A lista de leitura é uma adaptação para o público, não um instrumento validado de avaliação.</p>'
    else:h+='<p>Roteiro editorial de organização da LANDER RIO. Não é auditoria de fabricante, parecer jurídico, certificação de procedência ou confirmação de autorização comercial.</p>'
    h+='</section></article></div>'+related(a['related'])+'</main>'+base.footer()
    article_schema={'@type':'Article','headline':a['title'],'description':a['description'],'mainEntityOfPage':ORIGIN+path,'datePublished':'2026-11-13','dateModified':'2026-11-13','inLanguage':'pt-BR','author':{'@type':'Organization','name':'Redação LANDER RIO'},'publisher':{'@type':'Organization','name':'LANDER RIO'},'image':ORIGIN+'/assets/og-lander-v21.jpg','citation':[s['url'] for s in a['sources']]}
    return base.vectors(h.replace('</head>',schema(path,a['title'],'WebPage',article_schema)+'</head>'))
CLUSTERS=[
('treinamento','Treino que cabe na vida.','Organização, técnica de leitura da ficha e registro de progresso.', ['como-organizar-semana-treino','como-ler-ficha-treino','diario-de-treino-como-registrar','rir-o-que-significa','academia-lotada-organizar-treino','acompanhar-progresso-treino']),
('nutricao','Alimentação com contexto.','Planejamento da semana e precisão ao registrar alimentos.', ['planejar-compras-refeicoes-semana','alimento-cru-cozido-registro']),
('ciencia','Ciência antes da conclusão.','Termos, desenhos de estudo e limites do que se pode afirmar.', ['peptideos-o-que-sao']),
('confianca','Informação e confiança.','Identidade, canais, documentação e atendimento com escopo claro.', ['como-verificar-procedencia-canais-oficiais','como-consultar-disponibilidade-marcas','atacado-rio-como-avaliar-fornecedor'])]
def title_for(sl):
    html=(S/'conteudos'/sl/'index.html').read_text()
    return unescape(re.sub('<[^>]+>','',re.search(r'<h1[^>]*>(.*?)</h1>',html,re.S)[1]))
def hub():
    h=head('Conhecimento: treino, marcas e ciência | LANDER RIO','Guias de treino e alimentação, leitura de evidências e informações sobre marcas. Explore o conhecimento editorial da LANDER RIO por assunto.','/conteudos/')
    h+='''<main id="conteudo"><section class="ba-universe-hero"><div><p class="ba-eyebrow">THE LANDER JOURNAL / CONHECIMENTO</p><h1>IDEIAS QUE<br><em>MOVEM.</em></h1><p class="ba-universe-lede">Treino, ciência e informação.<br>Da pergunta certa à próxima leitura.</p></div><div class="ba-universe-aside"><span class="ba-orbit" aria-hidden="true">↗</span><p>Conteúdo para quem<br>treina sério.</p><a href="/marcas/">Universo de Marcas ↗</a></div></section><nav class="ba-jump" aria-label="Assuntos">'''+''.join(f'<a href="#{c[0]}">{label}</a>' for c,label in zip(CLUSTERS,['Treinamento','Nutrição','Ciência','Confiança']))+'</nav>'
    for ident,title,desc,slugs in CLUSTERS:
        h+=f'<section class="ba-cluster" id="{ident}"><h2>{e(title)}</h2><p>{e(desc)}</p><div class="ba-related-grid">'+''.join(f'<a href="/conteudos/{s}/"><span>GUIA EDITORIAL</span><strong>{e(title_for(s))}</strong><span aria-hidden="true">↗</span></a>' for s in slugs)+'</div></section>'
    h+='''<section class="ba-review-state"><h2>Farmacologia: consulte o escopo.</h2><p>A enciclopédia possui metodologia e fichas de referência com revisão médico-científica independente pendente. Elas não são apresentadas aqui como orientação clínica validada.</p><a href="/enciclopedia/metodologia/">Ler a metodologia e os limites</a></section><section class="ba-related"><p class="ba-eyebrow">DA LEITURA À ORGANIZAÇÃO</p><h2>Ferramentas gratuitas.</h2><div class="ba-related-grid"><a href="/treino/"><span>PLANEJAMENTO</span><strong>Organize seu treino.</strong><span aria-hidden="true">↗</span></a><a href="/dieta/"><span>PLANEJAMENTO</span><strong>Organize sua alimentação.</strong><span aria-hidden="true">↗</span></a></div></section></main>'''+base.footer()
    return base.vectors(h.replace('</head>',schema('/conteudos/','Conhecimento','CollectionPage')+'</head>'))
def fix_related():
    groups=[CLUSTERS[0][3],CLUSTERS[1][3]]
    for group in groups:
        for i,sl in enumerate(group):
            path=S/'conteudos'/sl/'index.html';text=path.read_text();others=[group[(i+1)%len(group)],group[(i+2)%len(group)]] if len(group)>2 else [x for x in group if x!=sl]
            nav='<nav aria-label="Continue a leitura"><h2>Continue a leitura</h2>'+''.join(f'<a href="/conteudos/{x}/">{e(title_for(x))} →</a>' for x in others)+'</nav>'
            text=re.sub(r'<nav aria-label="Continue a leitura">.*?</nav>',lambda _:nav,text,flags=re.S);path.write_text(text)
def main():
    for a in DATA['articles']:write('conteudos/'+a['slug']+'/index.html',make_article(a))
    write('conteudos/index.html',hub());fix_related();print('Editorial built: 4 articles + existing hub; 8 related blocks corrected')
if __name__=='__main__':main()
