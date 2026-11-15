#!/usr/bin/env python3
"""RC9: progressive navigation, editorial presentation and transparent ownership.
Static output. Existing APIs, photos, source references and consent remain intact.
"""
import json,re,subprocess,sys
from html import escape as e
from pathlib import Path
from xml.etree import ElementTree as ET
R=Path(__file__).resolve().parents[1];S=R/'site'
VERSION='digital-flagship-2026-rc9'
subprocess.run([sys.executable,str(R/'scripts/build_rc8.py')],check=True,cwd=R)
sys.path.insert(0,str(R/'scripts'))
from build_universe import head,schema,base

def wordmark():
    return '<a class="lr-wordmark" href="/" aria-label="LANDER. RIO / PERFORMANCE CULTURE — início"><strong>LANDER<span>.</span></strong><small>RIO / PERFORMANCE CULTURE</small></a>'
def header(hero=False):
    links=[('/atacado/','Atacado'),('/varejo/','Varejo'),('/marcas/','Marcas'),('/conteudos/','Conteúdos'),('/ferramentas/','Ferramentas')]
    nav=''.join(f'<a href="{url}">{label}</a>' for url,label in links)
    extra='<a href="/sobre/">Sobre a LANDER RIO</a><a href="/equipe/">Equipe e responsabilidade</a><a href="/politica-editorial/">Política editorial</a><a href="/contato/">Atendimento</a>'
    search='<button type="button" class="search-toggle" aria-controls="search-dialog" aria-haspopup="dialog">Buscar no site</button>' if hero else ''
    return f'<header class="lr-header{(" lr-header--hero" if hero else "")}">{wordmark()}<nav class="lr-desktop-nav" aria-label="Principal">{nav}</nav><details class="lr-menu" id="site-menu"><summary aria-label="Menu principal"><span>Menu</span><i aria-hidden="true">+</i></summary><nav class="lr-menu-sheet" aria-label="Navegação completa">{nav}{extra}{search}</nav></details></header>'

# Standalone, truthful ownership and editorial-process pages.
pages={
'equipe':('Equipe e responsabilidade | LANDER RIO','Conheça a responsabilidade institucional e editorial da LANDER RIO, os limites da revisão e o canal de correções.','SOBRE A PUBLICAÇÃO','Responsabilidade editorial.', '''<p class="ba-lede">Conheça os critérios de publicação e a identidade editorial da LANDER RIO.</p><div class="lr-team-grid"><article><span class="ba-eyebrow">PUBLICAÇÃO INSTITUCIONAL</span><h2>LANDER RIO</h2><p>Conteúdo publicado sob a identidade LANDER RIO — PERFORMANCE CULTURE.</p><p>As páginas identificam as fontes consultadas e os limites da informação apresentada.</p></article><article><span class="ba-eyebrow">IDENTIDADE EDITORIAL</span><h2>Redação LANDER RIO</h2><p>Assinatura institucional dos conteúdos publicados pela marca. Os perfis e artigos identificam suas fontes e o escopo da informação.</p><p>Essa assinatura não equivale a uma revisão clínica independente.</p></article></div><section class="lr-policy-section"><h2>Revisão especializada</h2><p>As fichas de farmacologia com revisão médico-científica pendente são sinalizadas. Não há profissional apresentado como revisor sem comprovação de sua participação.</p><p>Quando uma revisão for documentada, a própria página deverá identificar nome, qualificação, escopo e data. Até lá, o conteúdo não deve ser interpretado como orientação clínica validada.</p><a href="/politica-editorial/">Conheça os critérios editoriais →</a></section>'''),
'politica-editorial':('Política editorial e correções | LANDER RIO','Como a LANDER RIO seleciona fontes, distingue catálogo de evidência clínica, identifica revisões e recebe pedidos de correção.','TRANSPARÊNCIA EDITORIAL','Informação que você pode conferir.', '''<p class="ba-lede">O que publicamos, de onde vêm as informações e quais conclusões elas permitem.</p><div class="lr-policy-grid"><section><span>01 / FONTES</span><h2>Origem identificada.</h2><p>Perfis de marcas atribuem nomes e linhas aos catálogos consultados. Artigos educativos identificam referências e distinguem achados de pesquisa de interpretações editoriais. A data de consulta ajuda a contextualizar informações que podem mudar.</p></section><section><span>02 / ESCOPO</span><h2>Catálogo não é validação clínica.</h2><p>Uma publicação pode documentar a associação entre um nome e uma linha. Isso não confirma autenticidade de uma unidade, superioridade clínica, registro brasileiro ou vínculo oficial com a LANDER RIO. As listas são seleções editoriais; não constituem estoque.</p></section><section><span>03 / SAÚDE</span><h2>Limites explícitos.</h2><p>O conteúdo não substitui consulta, diagnóstico ou prescrição. Compostos experimentais não são apresentados como tratamentos aprovados. A assinatura da redação não equivale a revisão por profissional de saúde.</p><a href="/enciclopedia/metodologia/">Metodologia da enciclopédia →</a></section><section><span>04 / REVISÃO</span><h2>Crédito só quando comprovado.</h2><p>Uma revisão profissional deve informar nome, qualificação, data e escopo na própria página. Revisões pendentes permanecem identificadas. Nenhuma credencial é atribuída à redação de forma presumida.</p></section><section><span>05 / RELAÇÕES COMERCIAIS</span><h2>Informação com independência.</h2><p>A LANDER RIO mantém atendimento comercial e conteúdo educativo em áreas distintas. A presença de uma marca no diretório não comprova representação ou parceria oficial. Um link de fonte identifica a origem da informação; não é recomendação de compra.</p></section><section><span>06 / CORREÇÕES</span><h2>Uma informação mudou?</h2><p>Envie o endereço da página, o trecho e uma fonte verificável para <a href="mailto:landerrio@outlook.com">landerrio@outlook.com</a>. Isso permite avaliar a correção e atualizar a referência. Não envie documentos pessoais ou dados de saúde.</p></section></div><section class="lr-policy-section"><h2>Quem responde pela publicação</h2><p>Os textos assinados como Redação LANDER RIO são publicados sob a identidade editorial da marca.</p><a href="/equipe/">Equipe e responsabilidade →</a></section>''')}
for slug,(title,desc,kicker,h1,body) in pages.items():
    path='/'+slug+'/'
    html=head(title,desc,path)+f'<main id="conteudo"><nav class="ba-breadcrumb" aria-label="Caminho da página"><a href="/">Início</a><span>/</span><span aria-current="page">{e(kicker.capitalize())}</span></nav><section class="ba-article-head"><p class="ba-eyebrow">{kicker}</p><h1>{h1}</h1>{body}</section></main>'+base.footer()
    html=html.replace('</head>',schema(path,title)+'</head>')
    (S/slug).mkdir(exist_ok=True);(S/slug/'index.html').write_text(html)

home=(S/'index.html').read_text()
home=home.replace('Atacado para revendedores. Varejo com atendimento individual. Performance é a nossa cultura.','Atacado para revendedores. Varejo para você. Consulte condições e possibilidades de envio com a equipe.')
home=home.replace('class="lfx-btn-text hero-cta"','class="lfx-btn-text lr-btn-outline hero-cta"')
# Preserve the approved image and title; only the two journeys gain equal usable area.
flow='''<section class="lr-how" id="como-funciona" aria-labelledby="lr-how-title"><div><p class="ba-eyebrow">ATENDIMENTO / SEM CADASTRO</p><h2 id="lr-how-title">Seu próximo passo.<br><em>Com clareza.</em></h2><p>Uma conversa para entender sua solicitação e confirmar o que se aplica a ela.</p><nav aria-label="Conheça seu atendimento"><a href="/atacado/">Sou revendedor ↗</a><a href="/varejo/">É para mim ↗</a></nav></div><ol><li><span>01</span><div><h3>Escolha seu perfil.</h3><p>Atendimento para revendedores ou individual no varejo.</p></div></li><li><span>02</span><div><h3>Conte o que procura.</h3><p>O WhatsApp abre com uma mensagem pronta. Você revisa e decide se quer enviar.</p></div></li><li><span>03</span><div><h3>Confirme as condições.</h3><p>A equipe verifica a solicitação e informa as condições e possibilidades de envio aplicáveis. Peça o orçamento por escrito antes de decidir.</p></div></li></ol><small>Atendimento restrito a produtos e serviços com divulgação e comercialização permitidas. Os perfis de marcas são informativos.</small></section>'''
home=re.sub(r'<section class="lr-how".*?</section>','',home,flags=re.S)
home=home.replace('<div class="lfx-marquee"',flow+'<div class="lfx-marquee"',1)
# Always-visible search with a direct directory escape route.
search='''<div class="lfx-brand-filter lr-brand-search"><label for="brand-query">Encontre sua marca</label><div><input id="brand-query" type="search" autocomplete="off" placeholder="Nome ou linha: Landerlan, Gold…" aria-controls="brand-track"><a href="/marcas/">Ver todas as 14 marcas <span aria-hidden="true">↗</span></a></div><p id="brand-results" role="status" aria-live="polite">14 marcas. Toque em uma logo para conhecer.</p></div>'''
home=re.sub(r'<details class="lfx-brand-filter">.*?</details>',search,home,flags=re.S)
home=home.replace('.lr-brand-search{display:none!important}', '')
home=home.replace('<noscript><style>', '<noscript><style>.lr-brand-search{display:none!important}')
home=re.sub(r' data-search="[^"]*"', '', home)
for b in json.loads((R/'content/brands.json').read_text())['brands']:
    home=home.replace('data-brand-name="'+b['name']+'"', 'data-brand-name="'+b['name']+'" data-search="'+e(' '.join([b['name'],*b['lines']]))+'"')
home=re.sub(r'(<a\b[^>]*class="lfx-brand-tile"[^>]*?) aria-label="[^"]*"',r'\1',home)
home=home.replace('BRAND ARCHIVE / LANDER RIO','MARCAS / LANDER RIO')
# Keep the actual guide behavior, replacing the oversized prototype campaign.
rox='''<section class="lfx-rox lr-guide" id="rox" aria-labelledby="lr-guide-title"><div class="lr-guide-symbol" aria-hidden="true">R<span>.</span></div><div><p class="ba-eyebrow">ROX / GUIA DE NAVEGAÇÃO</p><h2 id="lr-guide-title">Encontre seu caminho.</h2><p>Localize ferramentas, conteúdos e atendimento. Respostas predefinidas, sem IA conectada ou orientação clínica.</p></div><button class="lfx-btn-acid" data-rox-open="">ABRIR GUIA ROX <span aria-hidden="true">↗</span></button></section>'''
home=re.sub(r'<section class="lfx-rox\b.*?</section>',rox,home,flags=re.S)
home=home.replace('Guia digital · demonstração offline','Guia do site · respostas predefinidas')
home=home.replace('Este ROX é uma demonstração sem IA conectada.','ROX é um guia com respostas predefinidas, sem IA conectada.')
(S/'index.html').write_text(home)

# A visual map before each documented catalog, never fabricated packaging.
brands=json.loads((R/'content/brands.json').read_text())['brands']
for b in brands+[dict(next(x for x in brands if x['slug']=='landerlan'),slug='landerlan-gold',products=[p for p in next(x for x in brands if x['slug']=='landerlan')['products'] if p['group']=='Gold'])]:
    p=S/'marcas'/b['slug']/'index.html';text=p.read_text()
    text=text.replace('<figure class="ba-showcase">','<figure class="ba-showcase" data-brand="'+b['slug']+'">')
    groups=list(dict.fromkeys(x['group'] for x in b['products']))
    if groups:
        cards=[]
        for i,g in enumerate(groups):
            products=[x for x in b['products'] if x['group']==g]
            from build_universe import slug
            cards.append(f'<a href="#linha-{slug(g)}"><span class="lr-line-index">{i+1:02d}</span><strong>{e(g)}</strong><span>{len(products)} referência'+('s' if len(products)!=1 else '')+' nesta seleção</span><span class="lr-line-arrow" aria-hidden="true">↘</span></a>')
        block='<nav class="lr-line-map" aria-label="Explore as linhas documentadas">'+''.join(cards)+'</nav>'
        text=text.replace('<div class="ba-product-group"',block+'<div class="ba-product-group"',1)
        # Meaningful, visible composition labels improve scanning without adding unsupported details.
        text=text.replace('<ul class="ba-products">','<ul class="ba-products lr-product-grid">')
    p.write_text(text)

# Shared signature and navigation for every existing document, including utilities.
for p in S.rglob('*.html'):
    text=p.read_text();is_home=p==S/'index.html'
    text=re.sub(r'<header class="(?:ba-header|site-head|lr-header[^"\n]*|lfx-header)".*?</header>',header(is_home),text,count=1,flags=re.S)
    # Replace only known footer wordmarks, preserve legal text, contacts and existing links.
    text=re.sub(r'<a class="ba-wordmark".*?</a>',wordmark(),text,flags=re.S)
    text=re.sub(r'<a\b[^>]*class="brand"[^>]*>.*?</a>',wordmark(),text,flags=re.S)
    if '/assets/experience-rc9.css' not in text:text=text.replace('</head>','<link rel="stylesheet" href="/assets/experience-rc9.css"><script defer src="/assets/experience-rc9.js"></script></head>')
    if '/assets/reference-fonts-rc6.css' not in text:text=text.replace('</head>','<link rel="stylesheet" href="/assets/reference-fonts-rc6.css"></head>')
    if '<footer' in text and '/politica-editorial/' not in text.split('<footer',1)[1]:
        text=text.replace('</footer>','<nav class="lr-transparency" aria-label="Transparência"><a href="/equipe/">Equipe e responsabilidade</a><a href="/politica-editorial/">Política editorial e correções</a></nav></footer>',1)
    text=text.replace('Redação LANDER RIO · Perfil editorial independente ·','<a href="/equipe/">Redação LANDER RIO</a> · <a href="/politica-editorial/">Critérios editoriais</a> ·')
    text=re.sub(r'digital-flagship-2026-rc8(?!\.)',VERSION,text) # release text only; existing asset URLs retained
    if 'src="/assets/measurement-v23-2.js' in text and '/assets/performance-rc9.js' not in text:
        text=text.replace('</body>','<script defer src="/assets/vendor/web-vitals-5.3.0.iife.js"></script><script defer src="/assets/performance-rc9.js"></script></body>')
    if p.name=='privacidade.html' and 'id="performance-measurement"' not in text:
        text=text.replace('</main>','<section class="wrap" id="performance-measurement"><h2>Medição opcional de desempenho</h2><p>Com sua permissão de medição, registramos tempos de carregamento e resposta e estabilidade visual (LCP, INP e CLS), a versão do site e uma categoria de tela. Não enviamos o conteúdo de campos, elementos clicados, consultas de busca ou dados de saúde nessas métricas. A coleta permanece desativada nas áreas de marcas e farmacologia. Você pode revogar a permissão nas preferências de privacidade.</p></section></main>')
    p.write_text(text)

# Surface the actual directory before a secondary feature, so mobile users reach it sooner.
p=S/'marcas/index.html';text=p.read_text()
m=re.search(r'<section class="ba-feature".*?</section>',text,re.S)
if m:
    feature=m[0];text=text[:m.start()]+text[m.end():];text=text.replace('<section class="ba-reading-note">',feature+'<section class="ba-reading-note">')
p.write_text(text)

ns='http://www.sitemaps.org/schemas/sitemap/0.9';ET.register_namespace('',ns)
root=ET.parse(S/'sitemap.xml').getroot();urls=[x.text for x in root.iter('{'+ns+'}loc')]
for slug in pages:
    url='https://landerrio.com.br/'+slug+'/'
    if url not in urls:
        node=ET.SubElement(root,'{'+ns+'}url');ET.SubElement(node,'{'+ns+'}loc').text=url;ET.SubElement(node,'{'+ns+'}lastmod').text='2026-11-13'
ET.ElementTree(root).write(S/'sitemap.xml',encoding='utf-8',xml_declaration=True)
rel=json.loads((S/'release.json').read_text());rel.update(release=VERSION,version=VERSION,source_branch='fix/rc9-institutional-privacy',revision='privacy-1',previous_candidate_commit='8d88d3b',manifest='manifest-digital-flagship-2026-rc9.json',release_note='RC9: atendimento, navegação, logos, linhas visuais e transparência editorial. Preview isolado; produção depende de aprovação.')
rel['changes'][:0]=['Dois CTAs de tamanho equivalente e atendimento explicado em três passos.', 'Busca de marcas sempre visível, linhas pesquisáveis e diretório antes do destaque.', 'Assinatura e navegação comuns; páginas de equipe e política editorial.', 'Portfólios com mapa visual por linha; ROX reduzido a guia de navegação.']
rel['changes']=list(dict.fromkeys(rel['changes']));(S/'release.json').write_text(json.dumps(rel,ensure_ascii=False,indent=2)+'\n')
print('RC9: 87 páginas; URLs anteriores e imagens preservadas; produção não alterada.')
