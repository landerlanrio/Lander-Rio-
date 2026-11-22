/* Progressive filtering. All destinations and content work without JavaScript. */
(() => {
  'use strict';
  const controls = document.querySelector('[data-enhanced]');
  if (!controls) return;
  const query = document.querySelector('#brand-query');
  const cards = [...document.querySelectorAll('.ba-directory-card')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  const count = document.querySelector('#brand-count');
  const empty = document.querySelector('#brand-empty');
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  let selected = 'all';
  function apply() {
    const term = normalize(query.value);
    let shown = 0;
    cards.forEach(card => {
      const match = (selected === 'all' || card.dataset.category === selected) && normalize(card.dataset.search).includes(term);
      card.hidden = !match;
      if (match) shown++;
    });
    count.textContent = shown + (shown === 1 ? ' marca encontrada' : ' marcas encontradas');
    empty.hidden = shown !== 0;
  }
  filters.forEach(button => button.addEventListener('click', () => {
    selected = button.dataset.filter;
    filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    apply();
  }));
  query.addEventListener('input', apply);
  query.addEventListener('search', apply);
  controls.hidden = false;
})();
