#!/usr/bin/env python3
"""Prepare indexability and release metadata, preserving all existing routes."""
import json,re,hashlib
from pathlib import Path
from xml.etree import ElementTree as ET
R=Path(__file__).resolve().parents[1];S=R/'site';VERSION='digital-flagship-2026-rc8'
def main():
    held=[]
    for p in sorted((S/'enciclopedia/substancias').glob('*/index.html')):
        text=p.read_text()
        assert 'pendente' in text.lower(),p
        text=re.sub(r'<meta\b[^>]*\bname="robots"[^>]*>', '<meta name="robots" content="noindex,follow"/>',text)
        p.write_text(text);held.append('/'+p.parent.relative_to(S).as_posix()+'/')
    brands=json.loads((R/'content/brands.json').read_text())['brands']
    held += ['/marcas/'+b['slug']+'/' for b in brands if not b['indexable']]
    # Keep historical Alpha Laboratory as its own route, with no invented association.
    p=S/'marcas/alpha-laboratory/index.html';text=p.read_text();text=re.sub(r'<meta\b[^>]*\bname="robots"[^>]*>','<meta name="robots" content="noindex,follow"/>',text);p.write_text(text);held.append('/marcas/alpha-laboratory/')
    ns='http://www.sitemaps.org/schemas/sitemap/0.9';ET.register_namespace('',ns)
    root=ET.parse(S/'sitemap.xml').getroot()
    for row in list(root):
        loc=row.find('{'+ns+'}loc')
        if loc is not None and loc.text.removeprefix('https://landerrio.com.br') in held:root.remove(row)
    new='https://landerrio.com.br/conteudos/peptideos-o-que-sao/'
    if new not in [x.text for x in root.iter('{'+ns+'}loc')]:
        row=ET.SubElement(root,'{'+ns+'}url');ET.SubElement(row,'{'+ns+'}loc').text=new;ET.SubElement(row,'{'+ns+'}lastmod').text='2026-11-13'
    ET.ElementTree(root).write(S/'sitemap.xml',encoding='utf-8',xml_declaration=True)
    home=(S/'index.html').read_text().replace('04 / THE LANDER JOURNAL','03 / THE LANDER JOURNAL').replace('03 / FERRAMENTAS','04 / FERRAMENTAS')
    # Journal entry points to the newly sourced educational guide, without adding a pharmacology funnel.
    home=home.replace('href="/enciclopedia/" class="lfx-journal-image"','href="/conteudos/peptideos-o-que-sao/" class="lfx-journal-image"')
    (S/'index.html').write_text(home)
    rel=json.loads((S/'release.json').read_text());rel.update(release=VERSION,version=VERSION,prepared_on='2026-11-13',source_branch='feat/rc8-universo-marcas-seo',previous_candidate_commit='d6e19cb7f73585f5586de6e038bfe2ec46df6ec7',manifest='manifest-digital-flagship-2026-rc8.json',release_note='RC8: Universo de Marcas, perfis enriquecidos, Gold na URL existente, conteúdo e SEO. Candidato isolado; sem deploy de produção.',indexability_held_routes=held)
    rel['changes'][:0]=['Universo de Marcas: diretório com busca, filtros, 14 perfis, 43 FAQs e dados estruturados; Gold ampliada na URL existente.', 'Hub editorial por assunto; um novo guia de peptídeos com 5 fontes e três guias ampliados; relações de leitura corrigidas.', 'Indexação suspensa no candidato para 35 fichas científicas sem revisão e 4 identidades incompletas; conteúdo e URLs preservados.', 'Home preservada; seção editorial antes das ferramentas. Logos originais uniformes sem alterações binárias.']
    rel['changes']=list(dict.fromkeys(rel['changes']))
    (S/'release.json').write_text(json.dumps(rel,ensure_ascii=False,indent=2)+'\n')
    (R/'docs/INDEXABILITY_RC8.json').write_text(json.dumps({'reason':'Declared specialist review pending or unresolved identity','production_changed':False,'held_routes':held},ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'held_routes':len(held),'sitemap_urls':len(root),'html_pages':len(list(S.rglob('*.html')))}))
if __name__=='__main__':main()
