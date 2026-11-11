(() => {
  'use strict';
  const strip = document.querySelector('[data-brand-strip]');
  if (!strip) return;
  const track = strip.querySelector('.brand-track');
  const cards = [...track.children];
  const previous = strip.querySelector('[data-brand-previous]');
  const next = strip.querySelector('[data-brand-next]');
  const range = strip.querySelector('[data-brand-range]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pad = number => String(number).padStart(2, '0');
  let frame = 0;

  const update = () => {
    frame = 0;
    const max = Math.max(0, track.scrollWidth - track.clientWidth);
    previous.setAttribute('aria-disabled', String(track.scrollLeft <= 2));
    next.setAttribute('aria-disabled', String(track.scrollLeft >= max - 2));
    const bounds = track.getBoundingClientRect();
    const visible = cards.map((card, index) => ({index, box:card.getBoundingClientRect()}))
      .filter(({box}) => box.left < bounds.right - 12 && box.right > bounds.left + 12);
    if (visible.length) range.textContent = `${pad(visible[0].index + 1)}–${pad(visible.at(-1).index + 1)} / ${pad(cards.length)}`;
  };
  const scheduleUpdate = () => {
    if (!frame) frame = window.requestAnimationFrame(update);
  };
  const move = direction => {
    const control = direction < 0 ? previous : next;
    if (control.getAttribute('aria-disabled') === 'true') return;
    const step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth;
    const page = step * Math.max(1, Math.floor(track.clientWidth / step));
    track.scrollBy({left:direction * page, behavior:reduceMotion.matches ? 'auto' : 'smooth'});
  };

  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  track.addEventListener('scroll', scheduleUpdate, {passive:true});
  track.addEventListener('keydown', event => {
    if (event.target !== track || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      move(event.key === 'ArrowLeft' ? -1 : 1);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      track.scrollTo({left:event.key === 'Home' ? 0 : track.scrollWidth, behavior:reduceMotion.matches ? 'auto' : 'smooth'});
    }
  });
  window.addEventListener('resize', scheduleUpdate, {passive:true});
  strip.querySelector('.brand-strip-controls').hidden = false;
  update();
})();
