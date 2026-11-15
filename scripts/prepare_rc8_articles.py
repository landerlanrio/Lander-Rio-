#!/usr/bin/env python3
import json,re
from pathlib import Path
R=Path(__file__).resolve().parents[1]
source=R.parent/'research-rc8/peptide-evidence.md'
article=source.read_text().split('<!-- ARTICLE_START -->')[1].split('<!-- ARTICLE_END -->')[0].strip()
articles=[{'slug':'peptideos-o-que-sao','title':'Peptídeos: o que são e como ler a evidência','seo_title':'Peptídeos: o que são e como ler estudos | LANDER RIO','description':'Entenda o que são peptídeos, a diferença entre molécula e marca e como interpretar estudos. Guia educativo com IUPAC, OMS, ICH e CONSORT.','category':'Ciência da performance','intro':'Uma palavra pode reunir muitas moléculas. A pergunta certa é: o que foi realmente estudado?','body':article,'sources':[{'id':'S1','label':'IUPAC · Gold Book: peptides','url':'https://goldbook.iupac.org/terms/view/P04479'},{'id':'S2','label':'OMS · Guidance on INN','url':'https://www.who.int/teams/health-product-and-policy-standards/inn/guidance-on-inn'},{'id':'S3','label':'ICH · General Considerations for Clinical Studies E8(R1), 2021','url':'https://database.ich.org/sites/default/files/E8-R1_Guideline_Step4_2021_1006.pdf'},{'id':'S4','label':'OMS · Clinical trials, perguntas e respostas','url':'https://www.who.int/news-room/questions-and-answers/item/clinical-trials'},{'id':'S5','label':'Hopewell et al. · CONSORT 2025, PLOS Medicine','url':'https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.1004587'}],'related':[{'title':'Life Peptídeos: identidade e catálogo publicado','path':'/marcas/life-peptideos/'},{'title':'Oxygen KW Pharma: nomes e contexto','path':'/marcas/oxygen-kw-pharma/'}]},
{'slug':'como-verificar-procedencia-canais-oficiais','title':'Procedência: como conferir fontes e canais','seo_title':'Como conferir procedência e canais | LANDER RIO','description':'Nome, domínio, fonte e documentação: um roteiro para avaliar informações sobre marcas sem confundir presença online com autenticidade comprovada.','category':'Informação e confiança','intro':'Uma logo reconhecível é o começo da identificação. A verificação exige contexto.','body':'''Antes de confiar em uma publicação sobre uma marca, separe a identidade visual, a empresa descrita e o produto mencionado. Nomes parecidos, páginas republicadas e imagens de embalagens podem levar a associações incorretas. Este roteiro editorial ajuda a organizar a consulta; não autentica produtos nem substitui documentação.

## 1. Comece pelo nome completo

Anote a grafia, a linha e o domínio que aparece como fonte. Evite combinar histórias de empresas apenas porque os nomes coincidem. Cooper Pharma, por exemplo, aparece em identidades institucionais distintas na Índia e no Marrocos. O perfil do nosso diretório explica qual domínio sustenta a apresentação publicada.

## 2. Diferencie origem da informação e procedência do item

Uma página do fabricante pode confirmar que um nome foi incluído em seu catálogo. Isso é diferente de confirmar que uma unidade específica veio daquele fabricante. Fotos, relatos e uma publicação em rede social não fornecem, por si, toda a documentação necessária para essa conclusão.

No Universo de Marcas, “documentado” significa que indicamos a publicação à qual o nome foi atribuído. Não significa que auditamos o processo de fabricação, um lote ou a autorização de comercialização.

## 3. Leia o endereço antes de confiar no código

Um QR code encaminha para um endereço. Observe o domínio completo, confirme a relação dele com a identidade pesquisada e leia o que a página realmente declara. Não digite dados pessoais em uma página desconhecida apenas porque ela foi aberta a partir de uma embalagem.

Se houver um procedimento de autenticidade publicado pela marca, consulte suas instruções no canal correspondente. O resultado dessa consulta deve ser interpretado dentro de seu escopo: não é uma avaliação clínica e não substitui a situação regulatória do produto.

## 4. Guarde as informações que permitem conferir

- Nome completo da marca e da linha.
- Endereço da fonte e data da consulta.
- Denominação exata do produto ou documento citado.
- O que a fonte confirma e o que permanece sem comprovação.

Ao comparar duas publicações, confira se elas tratam da mesma entidade e apresentação. Uma mudança de embalagem ou de nome precisa de documentação; não deve ser presumida pela aparência.

## Quando a documentação é insuficiente

Registre a lacuna. Não transforme uma dúvida em afirmação de qualidade, certificação ou vínculo oficial. Nos perfis Alpha X Prime, ZPHC e Synedica, a LANDER RIO mantém limites de identificação explícitos. É mais útil saber por que uma associação ainda não foi confirmada do que receber uma lista aparentemente completa, mas sem suporte.

Este é um método de leitura de informações públicas. A avaliação de um produto para uso em saúde requer profissional habilitado e a documentação aplicável.''','sources':[],'related':[{'title':'Cooper Pharma: distinguir empresas homônimas','path':'/marcas/cooper-pharma/'},{'title':'Universo de Marcas: fontes por identidade','path':'/marcas/'}]},
{'slug':'como-consultar-disponibilidade-marcas','title':'Como preparar uma consulta de atendimento','seo_title':'Como preparar uma consulta de atendimento | LANDER RIO','description':'Organize seu perfil, objetivo e dúvidas antes do atendimento: um guia para revendedores e clientes, com limites claros entre informação e oferta.','category':'Atendimento e organização','intro':'Uma consulta objetiva começa com o contexto certo, sem expor dados desnecessários.','body':'''Revendedores e visitantes individuais podem precisar de informações diferentes. Antes de iniciar um atendimento, organize o que deseja esclarecer e escolha o caminho que representa seu perfil. A página de uma marca é uma referência editorial; não confirma estoque, preço, entrega ou autorização para comercializar um produto.

## Escolha seu perfil

Se você busca informações sobre uma relação comercial de revenda, use o acesso de atacado. Para atendimento individual, use o acesso de varejo. Esses caminhos ajudam a equipe a compreender a finalidade da consulta; não garantem aprovação de cadastro, condições ou disponibilidade.

## Diga qual informação você precisa

Uma mensagem útil pode começar assim: “Sou revendedor e gostaria de entender como funciona o atendimento.” Para uma dúvida individual: “Quero informações sobre o atendimento e os próximos passos.” Prefira uma pergunta específica a uma lista de dados pessoais.

Se a dúvida surgiu em uma leitura, informe o título ou endereço da página. Isso ajuda a distinguir uma questão editorial sobre a marca de uma solicitação comercial sobre produtos e serviços cuja divulgação e venda sejam permitidas.

## Confirme condições antes de decidir

Quando houver um atendimento permitido e aplicável, peça que a equipe esclareça os pontos relevantes: identificação do responsável, documentos, condições, prazos e meios de suporte. Não deduza uma condição atual a partir de uma imagem antiga ou de uma publicação de terceiros.

As páginas da LANDER RIO não devem ser usadas como confirmação automática de estoque. Informações dinâmicas precisam ser confirmadas no atendimento adequado, e qualquer restrição legal continua aplicável.

## Compartilhe apenas o necessário

Para uma primeira pergunta, geralmente basta explicar seu perfil e o assunto. Não coloque documentos, receitas, dados de saúde ou informações de pagamento em campos genéricos, comentários públicos ou mensagens destinadas apenas a esclarecer a proposta do serviço.

O recurso de mensagem contextual do site é opcional. Ele prepara um texto para você revisar no WhatsApp; abrir o aplicativo não significa que a mensagem foi enviada ou que uma conversa começou.

## Informação de marca não é oferta

O Universo de Marcas reúne identidade, terminologia e referências publicadas. Não tem carrinho, preço ou orçamento de medicamentos. Para assuntos de saúde, não solicite protocolos ou decisões clínicas ao atendimento comercial. Uma dúvida sobre tratamento deve ser levada a um profissional habilitado.''','sources':[],'related':[{'title':'Atendimento para revendedores','path':'/atacado/'},{'title':'Atendimento individual','path':'/varejo/'}]},
{'slug':'atacado-rio-como-avaliar-fornecedor','title':'Como organizar a avaliação de um fornecedor','seo_title':'Como avaliar informações de fornecedor | LANDER RIO','description':'Um roteiro documental para avaliar uma relação comercial: identidade, escopo, condições, rastreabilidade e suporte, sem promessas de disponibilidade.','category':'Atendimento e organização','intro':'Clareza documental e condições explícitas antes de qualquer decisão comercial.','body':'''Avaliar um fornecedor exige mais do que comparar uma condição isolada. Primeiro, entenda quem responde pela operação, quais atividades estão dentro de seu escopo e quais documentos sustentam a relação. Este guia é um roteiro de organização; não certifica empresas e não substitui a avaliação jurídica ou regulatória pertinente.

## Identidade e responsabilidade

Identifique a empresa ou pessoa responsável pelo atendimento e confira a consistência entre nome, canais e documentação apresentada. Uma marca de produto, um distribuidor e uma loja têm papéis diferentes. O uso de uma logo não comprova que existe representação oficial.

Quando houver uma alegação de autorização, peça o documento correspondente e verifique seu escopo, titular e validade. Não atribua a um fornecedor a certificação de um fabricante apenas porque ele menciona a marca.

## Escopo da relação

Descreva quais produtos ou serviços podem fazer parte da negociação e quais requisitos se aplicam. Categorias reguladas exigem verificações próprias; a existência de um catálogo não resolve essas exigências. Mantenha fora do fluxo comercial qualquer item cuja venda ou divulgação não tenha sido confirmada como permitida.

## Condições que precisam ficar claras

- Quem emite os documentos e responde pelo atendimento.
- Quais condições foram confirmadas para aquela consulta.
- Como prazos, alterações e suporte serão comunicados.
- Como registrar uma divergência e acompanhar sua resolução.

Evite preencher lacunas com suposições. Uma condição de outro cliente, outro momento ou outra categoria não é necessariamente válida para sua operação. Confirmações devem ser específicas e compreensíveis para as duas partes.

## Rastreabilidade e registros

Organize as informações necessárias para conferir a operação: identificação das partes, documentos pertinentes e versões das condições recebidas. Preserve o contexto de cada registro. Uma captura de tela recortada pode perder a data ou o alcance de uma afirmação.

Rastreabilidade não é uma promessa estética. Embalagem sofisticada, selo em imagem ou página com aparência profissional não substituem os documentos e verificações exigidos para o caso.

## Compare o processo, além da condição

Observe se a comunicação é clara, se as respostas podem ser verificadas e se existe um caminho definido para suporte. Esses elementos ajudam a organizar a decisão, mas não garantem resultado comercial. Registre o que foi confirmado, o que ainda falta e quem precisa responder.

Na LANDER RIO, os acessos de revendedores e varejo distinguem o contexto do atendimento. O diretório de marcas permanece informativo e não deve ser interpretado como prova de autorização ou disponibilidade.''','sources':[],'related':[{'title':'Preparar uma consulta de atendimento','path':'/conteudos/como-consultar-disponibilidade-marcas/'},{'title':'Procedência: fontes e canais','path':'/conteudos/como-verificar-procedencia-canais-oficiais/'}]}]
(R/'content/articles.json').write_text(json.dumps({'version':'rc8','articles':articles},ensure_ascii=False,indent=2)+'\n')
print('Prepared',len(articles),'articles')
