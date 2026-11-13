/* LANDER RIO — ROX v3 offline browser, generated from prototypes/rox-ai-v2/agent-v3.mjs. No network, cookies or storage. */
(function(){'use strict';
/* LANDER RIO — ROX Agent v3 | isolated deterministic core
 * No network, database, persistent memory, credentials, or automated messages.
 * No claim that a WhatsApp click represents a received conversation or sale.
 * This engine augments the established ROX 2.0 stack; it does not deploy eve.
 */
const ROX_AGENT_VERSION = '3.1.0-titan-rc1-isolated';
const shortcuts = Object.freeze({qro:'quero',qr:'quero',vcs:'voces',vc:'voce',atacdo:'atacado',atcdo:'atacado',varej:'varejo',revendedor:'revendedor',catalog:'catalogo',catlogo:'catalogo',vlr:'valor',obg:'obrigado'});
const fold = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\b[a-z]+\b/g, word=>shortcuts[word]||word).replace(/\s+/g, ' ').trim();
const pii = /\b\d{3}\.\d{3}\.\d{3}[-.]?\d{2}\b|\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b|\b(?:\d[ -]*?){13,19}\b|(?:\+?55\s?)?\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}\b/i;
const regulated = /\b(tirzepatid[ae]|retatrutid[ae]|semaglutid[ae]|tirzena|tirzec|lipoless|ozempic|mounjaro|wegovy|retagen|anabolizantes?|esteroides?|trembolona|nandrolona|oxandrolona|testosterona|hgh|hcg|ghk.?cu|peptideos?|medicamento(?:s)? controlado(?:s)?|remedio(?:s)? controlado(?:s)?|caneta(?:s)? emagrecedora(?:s)?|glp.?1)\b/i;
const medical = /\b(diagnostico|prescricao|posologia|dose medica|dor no peito|falta de ar|tratamento clinico)\b/i;
const b2b = /\b(atacado|revenda|revender|revendedor(?:es)?|lojista(?:s)?|distribuidor(?:es)?|b2b)\b/i;
const b2c = /\b(varejo|consumidor final|comprar para mim|b2c)\b/i;
const business = /\b(pedido(?:s)?|minha compra|comprar|compra|produto(?:s)?|catalogo|cotacao|orcamento|preco(?:s)?|valor(?:es)?|estoque|frete|envio|entrega|rastreio|reclamacao|troca|devolucao|pagamento|parcelamento|desconto|parceria|parceiro(?:s)?|representante|atendente|atendimento humano|falar com a equipe|whatsapp)\b/i;
const external = /\b(iphone|ipad|cinema|netflix|passagem|restaurante|hotel|viagem|uber|carro|dolar|bitcoin|playstation|notebook)\b/i;
const brand = /\b(lander|lander rio|de voces|da empresa|da marca|meu pedido|minha compra)\b/i;
const topics = Object.freeze([
 {id:'pedido',label:'Suporte de pedido',re:/\b(meu pedido|minha compra|pedido|rastreio|entrega|envio|frete|devolucao|troca|reclamacao)\b/i},
 {id:'parceria',label:'Parcerias',re:/\b(parceria|parceiro|representante|influenciador|colaboracao)\b/i},
 {id:'catalogo',label:'Catálogo e produtos',re:/\b(catalogo|produto|produtos|linha de produtos)\b/i},
 {id:'condicoes',label:'Condições comerciais',re:/\b(preco|precos|cotacao|orcamento|valor|valores|pagamento|parcelamento|desconto|quantidade minima|condicoes)\b/i},
 {id:'estoque',label:'Disponibilidade',re:/\b(estoque|disponibilidade|disponivel)\b/i},
 {id:'humano',label:'Atendimento humano',re:/\b(atendente|falar com|equipe|whatsapp|humano)\b/i}
]);
const SEGMENT_LABEL = Object.freeze({atacado:'atacado e revenda',varejo:'varejo',geral:'atendimento geral'});
const result = (mode, topic, reply, extra={}) => Object.freeze({mode,topic,reply,...extra});

function getUserHistory(history) {
 if(!Array.isArray(history)) return '';
 return history.filter(x=>x && x.role==='user' && typeof x.content==='string' && !pii.test(x.content) && !regulated.test(fold(x.content))).slice(-4).map(x=>fold(x.content).slice(0,250)).join(' ');
}
function segmentFor(q,previous,hint) {
 if(b2b.test(q)) return 'atacado';
 if(b2c.test(q)) return 'varejo';
 if(b2b.test(previous)) return 'atacado';
 if(b2c.test(previous)) return 'varejo';
 if(hint==='b2b') return 'atacado';
 if(hint==='b2c') return 'varejo';
 return 'geral';
}
function topicFor(q,previous) {
 for(const t of topics) if(t.re.test(q)) return t;
 // The last explicit subject is useful only as a conversation hint, never as proof of a transaction.
 for(const t of topics) if(t.re.test(previous)) return t;
 return {id:'novo',label:'Nova solicitação'};
}
function buildHumanHandoff({segment='geral', topicId='novo',quantity=null}={}) {
 const safeSegment=Object.hasOwn(SEGMENT_LABEL,segment)?segment:'geral';
 const topic=topics.find(t=>t.id===topicId);
 const name=topic?.label ?? 'Nova solicitação';
 const amount=Number.isInteger(quantity)&&quantity>0&&quantity<=999?' Quantidade de interesse: '+quantity+' unidades.':'';
 return 'Olá! Vim pelo ROX da LANDER RIO e gostaria de falar com a equipe sobre ' + SEGMENT_LABEL[safeSegment] + ' — ' + name.toLowerCase() + '.'+amount+' Podem me orientar?';
}
function dryRunIntegrations(segment, topicId, quantity) {
 return Object.freeze({
  whatsapp:{method:'manual_draft',message:buildHumanHandoff({segment,topicId,quantity}),sent:false,conversation_confirmed:false},
  hubspot:{mode:'disabled_dry_run',lead_created:false,synced:false},
  supabase:{mode:'disabled_dry_run',row_written:false,conversation_recorded:false}
 });
}
function knownGeneral(q) {
 if(/^(oi|ola|opa|bom dia|boa tarde|boa noite|e ai)[!?. ]*$/.test(q))
  return result('offline','Boas-vindas','Olá! Sou o ROX, assistente virtual da LANDER RIO. Você quer organizar treino e alimentação, conhecer o site ou falar sobre atacado, varejo e parcerias?');
 if(/^(obrigad[oa]|valeu|show|perfeito)[!?. ]*$/.test(q))
  return result('offline','Conversa','Por nada! Pode continuar a conversa ou escolher uma das ferramentas do site.');
 if(/\b(capital do brasil)\b/.test(q))return result('offline','Informação geral','A capital do Brasil é Brasília.');
 const math=q.match(/^(?:quanto (?:e|da)|calcule)?\s*(-?\d{1,6}(?:[.,]\d{1,2})?)\s*([+*x/−-])\s*(-?\d{1,6}(?:[.,]\d{1,2})?)\s*\??$/);
 if(math){const a=Number(math[1].replace(',','.')),b=Number(math[3].replace(',','.')),op=math[2];const n=op==='+'?a+b:op==='-'||op==='−'?a-b:op==='/'?a/b:a*b;return result('offline','Cálculo',Number.isFinite(n)?'O resultado é '+Number(n.toFixed(8)).toLocaleString('pt-BR',{maximumFractionDigits:8})+'.':'Não é possível dividir por zero.');}
 if(/\b(ferramenta(?:s)?|site|menu|navegar)\b/.test(q))return result('offline','Ferramentas e navegação','Em Ferramentas você encontra os planejadores gratuitos de treino e alimentação. Em Conteúdos ficam os guias. Para atendimento, escolha Atacado ou Varejo.',{link:'/ferramentas/'});
 if(/\b(quem e voce|seu nome|voce e humano|voce e um robo|como voce funciona)\b/.test(q))
  return result('offline','Sobre ROX','Sou o ROX, assistente virtual da LANDER RIO. Nesta versão de testes, uso respostas verificadas e regras de triagem, sem acessar dados de clientes ou fazer promessas comerciais.');
 if(/\b(como comeco|sou iniciante|primeiro treino)\b/.test(q))
  return result('offline','Iniciantes','Uma boa forma de começar é manter frequência realista, aprender a execução e ajustar a progressão com calma. A ferramenta gratuita de treino pode ajudar a organizar a rotina.',{link:'/treino/'});
 if(/\b(treinos?|exercicio|exercicios|hipertrofia|musculacao|ganhar massa|progressao de carga|forca)\b/.test(q))
  return result('offline','Treino e performance','O progresso depende de consistência, técnica, recuperação e ajustes graduais. O planejador gratuito organiza a estrutura do treino; não substitui avaliação individual.',{link:'/treino/'});
 if(/\b(dieta|alimentacao|nutricao|refeicao|proteina|calorias|macros)\b/.test(q))
  return result('offline','Alimentação','Para organizar a alimentação, considere objetivo, rotina e consistência. A LANDER RIO disponibiliza um planejador gratuito; situações clínicas exigem profissional habilitado.',{link:'/dieta/'});
 if(/\b(sono|descanso|recuperacao|dormir)\b/.test(q))
  return result('offline','Recuperação','Dormir bem, recuperar-se e distribuir a carga de treino são parte da performance. Tente manter uma rotina sustentável em vez de apenas aumentar o volume de exercícios.');
 if(/\b(quem e a lander|o que e a lander|sobre a lander|o que voces fazem)\b/.test(q))
  return result('offline','Sobre a marca','A LANDER RIO — PERFORMANCE CULTURE é uma marca do Rio de Janeiro voltada à cultura de musculação, performance e conteúdo especializado. O site também disponibiliza ferramentas gratuitas de treino e alimentação.');
 if(/\b(onde ficam|endereco|localizacao|onde voces estao)\b/.test(q))
  return result('offline','Localização','A LANDER RIO atua a partir do Rio de Janeiro. Não tenho um endereço de atendimento presencial confirmado; consulte a página de contato.');
 return null;
}
/**
 * Stateless agent turn. History is an untrusted client hint, not authentication,
 * consent, durable memory or proof of any real-world event.
 * All outputs are allowlisted; raw user messages never enter a handoff draft.
 */
function agentTurnV3({message='',history=[],segment='general',intent='general'}={}) {
 const input=String(message).slice(0,700);
 const q=fold(input);
 if(!q) return result('unknown','Atendimento','Não recebi uma pergunta. Pode escrever novamente?');
 if(pii.test(input))return result('privacy','Privacidade','Para sua segurança, não envie CPF, telefone, e-mail, números de cartão ou dados pessoais pelo chat. Podemos continuar sem essas informações.');
 if(regulated.test(q)||medical.test(q))return result('clinical','Saúde','Posso fornecer informações educativas gerais, mas não oriento doses, tratamentos nem intermedio a venda de medicamentos e substâncias restritas. Consulte um profissional habilitado para orientação individual.');
 const previous=getUserHistory(history);
 const quantityMatch=q.match(/\b([1-9]\d{0,2})\s*(?:pecas?|unidades?|itens)\b/)||previous.match(/\b([1-9]\d{0,2})\s*(?:pecas?|unidades?|itens)\b/);
 const quantity=quantityMatch?Number(quantityMatch[1]):null;
 const brandBusiness=business.test(q);
 const commerciallyExplicit=intent==='commercial'||b2b.test(q)||b2c.test(q)||brandBusiness||(quantity!==null&&(b2b.test(previous)||b2c.test(previous)));
 // Do not turn unrelated questions about consumer goods into sales inquiries.
 const unrelated=external.test(q) && !brand.test(q) && !b2b.test(q) && !b2c.test(q) && intent!=='commercial';
 if(commerciallyExplicit && !unrelated) {
  const s=segmentFor(q,previous,segment);
  const t=topicFor(q,previous);
  const needsClarification=t.id==='novo' && s!=='geral';
  const reply=needsClarification
   ? 'Posso organizar seu contato para ' + SEGMENT_LABEL[s] + '. Você procura catálogo, condições comerciais, parceria ou suporte de pedido? Não confirmo preços, estoque ou prazos. Você decide se abre o WhatsApp e envia a solicitação.'
   : 'Entendi: ' + SEGMENT_LABEL[s] + ', assunto ' + t.label.toLowerCase() + '. A equipe precisa confirmar qualquer detalhe comercial, como preço, disponibilidade, prazo ou pedido. Você decide se abre o WhatsApp e envia a mensagem preparada.';
  return result('handoff',t.label,reply,{
   qualification:{segment:s,topic_id:t.id,quantity,stage:needsClarification?'needs_topic':'ready_for_human',requires_human:true,contact_captured:false},
   integrations:dryRunIntegrations(s,t.id,quantity)
  });
 }
 const answer=knownGeneral(q);
 return answer||result('unknown','Conversa geral','Não tenho uma resposta verificada para esse assunto no modo offline. Posso ajudar com treino, alimentação e conteúdo da LANDER RIO, ou indicar o contato da equipe sem inventar informações.');
}

window.LanderRoxAgentV3=Object.freeze({agentTurnV3,buildHumanHandoff,ROX_AGENT_VERSION});
})();
