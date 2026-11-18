(() => {
  'use strict';
  const input = document.getElementById('book-query');
  if (!input) return;
  const status = document.getElementById('book-status');
  const normalize = value => value.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const entries = [...document.querySelectorAll('[data-entry]')].map(element => ({
    element, text: normalize(element.textContent + ' ' + element.dataset.terms)
  }));
  function update() {
    const words = normalize(input.value).trim().split(/\s+/).filter(Boolean);
    let count = 0;
    for (const row of entries) {
      row.element.hidden = !words.every(word => row.text.includes(word));
      if (!row.element.hidden) count++;
    }
    status.textContent = count ? count + (count === 1 ? ' entrada' : ' entradas') : 'Nenhum resultado. Tente outro nome ou sigla.';
  }
  document.querySelector('[data-search-box]').hidden = false;
  input.addEventListener('input', update);
  document.getElementById('book-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  update();
})();
