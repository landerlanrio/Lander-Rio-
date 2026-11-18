(() => {
  'use strict';

  const figure = document.querySelector('.lr-atlas-figure');
  if (!figure) return;
  const atlas = figure.closest('.lr-atlas');
  const preview = figure.querySelector('picture source');
  if (!window.IntersectionObserver) {
    preview?.remove();
    return;
  }

  const canvas = figure.querySelector('canvas');
  const poster = figure.querySelector('img');
  const ctx = canvas.getContext('2d');
  const canAnimate = Boolean(ctx && window.ResizeObserver);
  // The static image remains available if this script or canvas support is absent.
  if (canAnimate) poster.hidden = true;
  else preview?.remove();

  const prepare = new IntersectionObserver((entries, observer) => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    observer.disconnect();
    atlas.classList.add('lr-atlas-near');
    if (canAnimate) startModel();
  }, {rootMargin: '420px 0px'});
  prepare.observe(atlas);

  function startModel() {
    const button = figure.querySelector('button');
    const label = button.querySelector('.lr-atlas-motion-label');
    // Coordinates describe an editorial ball-and-stick model in its own 3D space.
    const atoms = [];
    const bonds = [];
    const palette = [[181, 214, 86], [176, 194, 187], [120, 141, 93], [139, 150, 144]];
    const turnsPerStep = 2 * Math.PI / 10.5;
    const levels = 28;
    function atom(angle, y, radius, size, material) {
      const i = atoms.length;
      atoms.push({x: radius * Math.cos(angle), y, z: radius * Math.sin(angle), size, material});
      return i;
    }
    function bond(a, b, radius, material) { bonds.push({a, b, radius, material}); }
    for (let side = 0; side < 2; side++) {
      let last = null;
      for (let i = 0; i < levels; i++) {
        const angle = i * turnsPerStep + side * 2.94;
        const y = (i - (levels - 1) / 2) * .109;
        const sugar = atom(angle, y, .54, .073, side);
        const phosphate = atom(angle + turnsPerStep * .46, y + .048, .58, .058, side);
        const outer = atom(angle + .064, y + .041, .63, .041, side);
        bond(sugar, outer, .024, side);
        if (i < levels - 1) bond(sugar, phosphate, .039, side);
        if (last !== null) bond(last, sugar, .039, side);
        last = phosphate;
        const shoulder = atom(angle, y, .365, .043, side + 2);
        const base = atom(angle, y, .145, .043, side);
        const tip = atom(angle, y, .035, .021, side + 2);
        bond(sugar, shoulder, .03, side + 2);
        bond(shoulder, base, .036, side);
        bond(base, tip, .015, side + 2);
        if (i % 2 === side) {
          const corner = atom(angle + .13, y + .042, .25, .028, side + 2);
          bond(shoulder, corner, .015, side + 2);
          bond(corner, base, .015, side + 2);
        }
      }
    }

    // Cache metal highlights for each depth band. Raster work per frame stays bounded.
    const bands = 14;
    const spriteSize = 52;
    function color(rgb, light, white = 0) {
      return 'rgb(' + rgb.map(v => Math.min(255, Math.round(v * light + white))).join(',') + ')';
    }
    const materials = palette.map(rgb => Array.from({length: bands}, (_, band) => {
      const light = .51 + .52 * band / (bands - 1);
      const sprite = document.createElement('canvas');
      sprite.width = sprite.height = spriteSize;
      const brush = sprite.getContext('2d');
      const g = brush.createRadialGradient(17, 13, 1, 26, 26, 26);
      g.addColorStop(0, color(rgb, light, 110));
      g.addColorStop(.14, color(rgb, light, 52));
      g.addColorStop(.37, color(rgb, light));
      g.addColorStop(.72, color(rgb, light * .52));
      g.addColorStop(.89, color(rgb, light * .25));
      g.addColorStop(1, color(rgb, light * .57));
      brush.fillStyle = g;
      brush.beginPath();
      brush.arc(26, 26, 25, 0, 2 * Math.PI);
      brush.fill();
      return {sprite, shell: color(rgb, light * .50), core: color(rgb, light * .90, 10)};
    }));
    const tilt = -.48;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let paused = reduced.matches;
    let onScreen = false;
    let frame = 0;
    let lastDraw = 0;
    let phase = .82;
    let pointerX = 0;
    let pointerY = 0;
    let width = 0;
    let height = 0;

    function draw() {
      if (width <= 0 || height <= 0) return;
      const scale = Math.min(width * .267, height * .265);
      const angle = phase + pointerX * .15;
      const ca = Math.cos(angle), sa = Math.sin(angle);
      const lean = tilt + pointerY * .04;
      const ct = Math.cos(lean), st = Math.sin(lean);
      const points = atoms.map(p => {
        const x = p.x * ca + p.z * sa;
        const z = p.z * ca - p.x * sa;
        const k = 4.7 / (4.7 - z);
        return {x: width * .5 + (x * ct - p.y * st) * scale * k,
          y: height * .50 - (x * st + p.y * ct) * scale * k, z, k};
      });
      const drawables = bonds.map(b => ({bond: b, z: (points[b.a].z + points[b.b].z) / 2}));
      points.forEach((p, i) => drawables.push({atom: i, z: p.z + .023}));
      drawables.sort((a, b) => a.z - b.z);
      ctx.clearRect(0, 0, width, height);
      ctx.lineCap = 'round';
      for (const shape of drawables) {
        const band = Math.max(0, Math.min(bands - 1, Math.round((shape.z + .65) / 1.3 * (bands - 1))));
        if (shape.bond) {
          const b = shape.bond, a = points[b.a], end = points[b.b];
          const material = materials[b.material][band];
          const stroke = Math.max(.8, b.radius * scale * (a.k + end.k));
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(end.x, end.y);
          ctx.strokeStyle = material.shell;
          ctx.lineWidth = stroke;
          ctx.stroke();
          ctx.strokeStyle = material.core;
          ctx.lineWidth = stroke * .46;
          ctx.stroke();
        } else {
          const i = shape.atom, p = points[i], r = atoms[i].size * scale * p.k;
          ctx.drawImage(materials[atoms[i].material][band].sprite, p.x - r, p.y - r, r * 2, r * 2);
        }
      }
    }
    function resize() {
      const rect = figure.querySelector('.lr-atlas-model').getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }
    function tick(time) {
      if (!lastDraw || time - lastDraw >= 1000 / 30 - 1) {
        if (lastDraw) phase += Math.min(time - lastDraw, 100) * .00033;
        lastDraw = time;
        draw();
      }
      frame = requestAnimationFrame(tick);
    }
    function sync() {
      cancelAnimationFrame(frame);
      lastDraw = 0;
      button.toggleAttribute('data-paused', paused);
      label.textContent = paused ? 'Iniciar rotação' : 'Pausar rotação';
      if (onScreen && !paused && !document.hidden) frame = requestAnimationFrame(tick);
    }
    button.addEventListener('click', () => { paused = !paused; sync(); });
    reduced.addEventListener('change', () => {
      paused = reduced.matches;
      pointerX = pointerY = 0;
      if (onScreen) draw();
      sync();
    });
    figure.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse' || paused || reduced.matches) return;
      const r = figure.getBoundingClientRect();
      pointerX = 2 * (e.clientX - r.left) / r.width - 1;
      pointerY = 2 * (e.clientY - r.top) / r.height - 1;
    });
    figure.addEventListener('pointerleave', () => { pointerX = pointerY = 0; });
    document.addEventListener('visibilitychange', sync);
    const sizeObserver = new ResizeObserver(() => { if (onScreen) resize(); });
    sizeObserver.observe(figure);
    new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) {
        canvas.hidden = false;
        resize();
        poster.hidden = true;
        button.hidden = false;
      }
      sync();
    }).observe(figure);
  }
})();
