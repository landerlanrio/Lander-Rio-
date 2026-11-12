/* LANDER RIO | ROX Widget 1.0 — preview-only, offline, ephemeral, no paid calls.
   Enable solely with ?rox-preview=1 on a nonproduction/approved preview.
   Never expose user-entered conversation content through WhatsApp or analytics.
*/
(function (root) {
  'use strict';
  const MAX_INPUT = 600;
  const PHONE_RE = /^55\d{10,11}$/;
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  const patterns = {
    clinical: /\b(tirzepatid[ae]|retatrutid[ae]|semaglutid[ae]|anabolizante[s]?|esteroide[s]?|trembolona|nandrolona|hgh|hcg|ghk.?cu|peptideo[s]?|oxandrolona|testosterona|medicamento[s]? controlado[s]?|remedio[s]? controlado[s]?|caneta[s]? emagrecedora[s]?)\b/i,
    privacy: /\b\d{3}\.\d{3}\.\d{3}[-.]?\d{2}\b|\b[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}\b|\b(?:\d[ -]*?){13,19}\b|(?:\+?55\s?)?\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}\b/,
    commercial: /\b(atacado|revendedor(?:es)?|revenda|varejo|b2b|lojista[s]?|distribuidor|meu pedido|minha compra|estoque|disponibilidade|orcamento|cotacao|catalogo|pedido[s]?|envio|entrega|rastreio|faturamento|desconto|pagamento|parcelamento|comprar|compra|venda|troca|devolucao|prazo|parceria|parceiro[s]?|representante|suporte comercial)\b/i,
    vaguePrice: /\b(preco[s]?|valor(?:es)?|quanto custa|tabela)\b/i,
    external: /\b(iphone|ipad|netflix|cinema|restaurante|hotel|viagem|passagem|ingresso|aluguel|carro|dolar|bitcoin|playstation|uber|99pay)\b/i,
    brand: /\b(lander|lander rio|voces|vcs|loja|nossos?|minha compra|meu pedido)\b/i
  };
  function classify(value, context = {}) {
    const original = String(value || '');
    const q = normalize(original);
    if (patterns.clinical.test(q)) return { intent: 'clinical', topic: 'Saúde e substâncias' };
    if (patterns.privacy.test(original)) return { intent: 'privacy', topic: 'Privacidade' };
    if (patterns.commercial.test(q) && !(patterns.external.test(q) && !patterns.brand.test(q) && !/\b(atacado|revenda|revendedor|varejo|b2b|lojista|distribuidor)\b/.test(q))) return { intent: 'commercial', topic: /\b(atacado|revenda|revendedor|b2b|lojista|distribuidor)\b/.test(q) ? 'Atendimento para revendedores' : /\b(varejo|comprar|compra)\b/.test(q) ? 'Atendimento no varejo' : 'Atendimento comercial' };
    if (patterns.vaguePrice.test(q) && !patterns.external.test(q) && (patterns.brand.test(q) || context.lastIntent === 'commercial')) return { intent: 'commercial', topic: 'Consulta comercial' };
    return { intent: 'general', topic: 'Dúvida geral' };
  }
  function respond(value, context = {}) {
    const q = normalize(value), c = classify(value, context);
    if (c.intent === 'clinical') return { ...c, reply: 'Posso conversar sobre saúde de forma educativa, mas não comercializo medicamentos ou substâncias restritas nem oriento doses ou tratamentos. Para decisões individuais, consulte um profissional habilitado.', link: '' };
    if (c.intent === 'privacy') return { ...c, reply: 'Por segurança, evite enviar telefones, documentos, e-mails e informações clínicas neste chat. Podemos conversar sem dados pessoais.', link: '' };
    if (c.intent === 'commercial') return { ...c, reply: 'Entendi. Isso precisa da confirmação da equipe da LANDER RIO. Posso preparar uma mensagem objetiva para o WhatsApp, sem copiar nossa conversa nem afirmar preço, estoque ou prazo. Você decide se quer enviar.', link: '' };
    if (/^(oi|ola|e ai|bom dia|boa tarde|boa noite|hey|hello)[!?. ]*$/.test(q)) return { ...c, reply: 'Oi! Eu sou o ROX, assistente virtual da LANDER RIO. Posso ajudar com a marca, ferramentas de treino e alimentação, ou orientar como falar com a equipe. Sobre o que você quer conversar?', link: '' };
    if (/\b(quem e voce|seu nome|quem esta falando|voce e humano|voce e robo)\b/.test(q)) return { ...c, reply: 'Sou o ROX, assistente virtual — não sou uma pessoa. Nesta prévia, respondo com uma base de conhecimento local e não acesso pedidos, estoque ou mensagens reais.', link: '' };
    if (/\b(obrigad[oa]|valeu|show|perfeito|entendi|beleza)\b/.test(q)) return { ...c, reply: 'Por nada! Se quiser, posso explicar as ferramentas gratuitas ou indicar o canal de atendimento apropriado.', link: '' };
    if (/\b(lander|empresa|marca|voces fazem|site oficial|quem sao)\b/.test(q)) return { ...c, reply: 'A LANDER RIO — PERFORMANCE CULTURE é uma marca do Rio de Janeiro ligada à musculação, performance e conteúdo especializado. No site você encontra informação, ferramentas gratuitas e caminhos separados para atendimento.', link: '' };
    if (/\b(treino|hipertrofia|musculacao|ficha|exercicio[s]?|series|forca)\b/.test(q)) return { ...c, topic: 'Treino e performance', reply: 'Para começar, vale organizar objetivo, nível, frequência, progressão e recuperação. O site possui um planejador de treino gratuito com informações adaptadas ao perfil informado; ele não substitui orientação profissional.', link: '/treino/' };
    if (/\b(dieta|alimentacao|nutricao|macros|calorias|refeicao|proteina[s]?)\b/.test(q)) return { ...c, topic: 'Alimentação', reply: 'Uma alimentação consistente depende de objetivo, rotina e escolhas sustentáveis. A LANDER RIO oferece uma ferramenta gratuita para planejamento alimentar; resultados individuais precisam de avaliação quando houver indicação clínica.', link: '/dieta/' };
    if (/\b(sono|descanso|recuperacao|cansaco|dormir)\b/.test(q)) return { ...c, topic: 'Recuperação', reply: 'O descanso faz parte do desempenho: sono consistente, carga de treino adequada e recuperação são tão importantes quanto treinar forte. Evite aumentar o volume apenas porque um treino foi fácil.', link: '' };
    if (/\b(whatsapp|contato|como falar|atendente|falar com alguem|equipe)\b/.test(q)) return { intent: 'commercial', topic: 'Contato com a equipe', reply: 'Claro. Posso abrir uma mensagem curta para o atendimento oficial. O envio só acontece se você confirmar dentro do WhatsApp; eu não envio mensagens automaticamente.', link: '' };
    if (/\b(gratis|gratuito|gratuita|ferramenta[s]?|sistema de treino|app)\b/.test(q)) return { ...c, topic: 'Ferramentas gratuitas', reply: 'As ferramentas de treino e alimentação do site são gratuitas; algumas etapas podem pedir cadastro para liberar o resultado. Você quer acessar o planejador de treino ou a ferramenta alimentar?', link: '/ferramentas/' };
    if (/\b(iphone|preco do|quanto custa|valor do|dolar|cinema|restaurante)\b/.test(q)) return { ...c, reply: 'Consigo conversar sobre temas gerais, mas esta versão offline não consulta preços, notícias ou dados em tempo real. Para valores atuais, vale conferir diretamente uma fonte confiável.', link: '' };
    return { ...c, reply: 'Ainda não tenho uma resposta confiável para isso no modo de demonstração. Você pode perguntar sobre a LANDER RIO, treino, alimentação, recuperação ou pedir o contato da equipe. Se quiser, reformule a pergunta que eu tento ajudar.', link: '' };
  }
  function handoffHref(segment, topic, phone) {
    const p = String(phone || '');
    if (!PHONE_RE.test(p)) return '';
    const subject = /revended/i.test(topic) || segment === 'atacado' ? 'atendimento para revendedores' : /varejo/i.test(topic) || segment === 'varejo' ? 'atendimento no varejo' : /pedido|suporte/i.test(topic) ? 'suporte a um atendimento' : 'atendimento geral';
    const message = `Olá! Vim pelo assistente ROX no site da LANDER RIO e gostaria de falar com a equipe sobre ${subject}. Podemos conversar?`;
    return `https://wa.me/${p}?text=${encodeURIComponent(message)}`;
  }
  const api = Object.freeze({ normalize, classify, respond, handoffHref });
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (!root || typeof document === 'undefined' || typeof location === 'undefined') return;
  function init() {
    // Prevent accidental public rollout, even if a staging package is deployed.
    if (new URLSearchParams(location.search).get('rox-preview') !== '1' && document.body?.dataset.roxPreview !== '1') return;
    if (document.getElementById('rox-launcher')) return;
    const rootEl = document.createElement('div');
    rootEl.id = 'rox-root';
    rootEl.innerHTML = `<button type="button" id="rox-launcher" class="rox-launcher" aria-haspopup="dialog" aria-controls="rox-panel" aria-expanded="false" aria-label="Abrir conversa com ROX"><span class="rox-mark" aria-hidden="true">R</span><span>Fale com ROX</span></button>
      <section id="rox-panel" class="rox-panel" role="dialog" aria-modal="false" aria-label="Conversa com ROX" hidden>
        <header class="rox-header"><span class="rox-avatar" aria-hidden="true">R</span><div class="rox-head-copy"><strong>ROX <span class="rox-online" aria-hidden="true"></span></strong><small>Assistente virtual · LANDER RIO</small></div><button type="button" id="rox-close" class="rox-close" aria-label="Fechar conversa">×</button></header>
        <p class="rox-disclaimer">Prévia offline: respostas educativas, sem IA paga. Não envie dados pessoais.</p>
        <div id="rox-messages" class="rox-messages" role="log" aria-live="polite" aria-relevant="additions"></div>
        <nav id="rox-quick" class="rox-quick" aria-label="Perguntas rápidas"><button type="button" data-rox-ask="O que é a LANDER RIO?">A marca</button><button type="button" data-rox-ask="Treino e dieta gratuitos">Treino e dieta</button><button type="button" data-rox-ask="Quero revender no atacado">Sou revendedor</button><button type="button" data-rox-ask="Quero falar com a equipe">Falar com a equipe</button></nav>
        <div class="rox-outcomes"><a id="rox-topic-link" href="/ferramentas/" hidden>Ver ferramenta <span aria-hidden="true">↗</span></a><a id="rox-wa" href="" rel="noopener noreferrer" target="_blank" data-wa="" data-placement="rox-widget" hidden>Conversar com a equipe <span aria-hidden="true">↗</span></a><p id="rox-wa-note" hidden>Contato temporariamente indisponível. Use a página de contato.</p></div>
        <form id="rox-form" class="rox-compose" autocomplete="off"><label for="rox-text" class="rox-sr">Digite uma mensagem</label><textarea id="rox-text" rows="1" maxlength="600" placeholder="Digite sua pergunta..." aria-describedby="rox-counter"></textarea><button type="submit" aria-label="Enviar pergunta ao ROX">↗</button></form><small id="rox-counter" class="rox-counter">0/600 · Enter para enviar · Shift+Enter para nova linha</small>
      </section>`;
    document.body.append(rootEl);
    const launcher = document.getElementById('rox-launcher'), panel = document.getElementById('rox-panel'), close = document.getElementById('rox-close'), log = document.getElementById('rox-messages'), field = document.getElementById('rox-text'), form = document.getElementById('rox-form'), quick = document.getElementById('rox-quick'), wa = document.getElementById('rox-wa'), note = document.getElementById('rox-wa-note'), topicLink = document.getElementById('rox-topic-link'), counter = document.getElementById('rox-counter');
    const state = { opened: false, lastIntent: 'general', segment: 'geral', messages: 0 };
    function addBubble(who, value) {
      const wrap = document.createElement('div');
      wrap.className = `rox-bubble rox-${who}`;
      wrap.textContent = String(value).slice(0,1050);
      log.appendChild(wrap);
      state.messages++;
      if (state.messages > 24) { log.firstElementChild?.remove(); state.messages--; }
      log.scrollTop = log.scrollHeight;
    }
    function selectHandoff(reply) {
      wa.hidden = true; note.hidden = true; topicLink.hidden = true;
      if (reply.intent === 'commercial') {
        const fallback = document.querySelector('a[href^="https://wa.me/"]');
        let phone = '';
        try { phone = new URL(fallback?.href || '').pathname.replace(/^\//, '').split('/')[0]; } catch (_) { /* no configured contact */ }
        const href = handoffHref(state.segment, reply.topic, phone);
        if (href) { wa.href = href; wa.hidden = false; }
        else note.hidden = false;
      }
      if (reply.link && /^\/[a-z-]+\/$/.test(reply.link)) {
        topicLink.href = reply.link;
        topicLink.textContent = reply.link === '/dieta/' ? 'Abrir ferramenta alimentar ↗' : reply.link === '/treino/' ? 'Abrir planejador de treino ↗' : 'Ver ferramentas gratuitas ↗';
        topicLink.hidden = false;
      }
    }
    function submit(value) {
      const message = String(value || '').trim().slice(0,MAX_INPUT);
      if (!message) return;
      const reply = respond(message, state);
      addBubble('user', reply.intent === 'privacy' ? 'Mensagem sensível omitida por segurança.' : message);
      if (reply.intent === 'commercial' && /revended|atacado/.test(normalize(message))) state.segment = 'atacado';
      else if (reply.intent === 'commercial' && /varejo/.test(normalize(message))) state.segment = 'varejo';
      state.lastIntent = reply.intent;
      addBubble('assistant', reply.reply);
      selectHandoff(reply);
      field.value = '';
      counter.textContent = '0/600 · Enter para enviar · Shift+Enter para nova linha';
      quick.hidden = true;
    }
    function openPanel() {
      panel.hidden = false; launcher.setAttribute('aria-expanded','true'); launcher.setAttribute('aria-label','Fechar conversa com ROX'); state.opened = true;
      if (state.messages === 0) addBubble('assistant','Olá! Sou o ROX, assistente virtual da LANDER RIO. Posso te ajudar com treino, alimentação e informações sobre a marca. No comercial, a equipe confirma os detalhes.');
      field.focus({preventScroll:true});
    }
    function closePanel() {panel.hidden = true; launcher.setAttribute('aria-expanded','false'); launcher.setAttribute('aria-label','Abrir conversa com ROX'); state.opened = false; launcher.focus({preventScroll:true});}
    launcher.addEventListener('click', () => state.opened ? closePanel() : openPanel());
    close.addEventListener('click', closePanel);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && state.opened) closePanel(); });
    quick.addEventListener('click', e => { const btn = e.target.closest('[data-rox-ask]'); if (btn) submit(btn.dataset.roxAsk); });
    form.addEventListener('submit', e => { e.preventDefault(); submit(field.value); });
    field.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); submit(field.value); } });
    field.addEventListener('input', () => { counter.textContent = `${field.value.length}/600 · Enter para enviar · Shift+Enter para nova linha`; });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})(typeof window !== 'undefined' ? window : null);