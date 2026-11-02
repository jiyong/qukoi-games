'use strict';
(function () {
  const { rc } = PVZ.Grid;
  const $ = (id) => document.getElementById(id);
  const pct = (n) => `${n * 12.5}%`;

  function spawn(parent, cls, style, ttl) {
    const el = document.createElement('div');
    el.className = cls;
    Object.entries(style).forEach(([k, v]) => el.style.setProperty(k, v));
    parent.appendChild(el);
    setTimeout(() => el.remove(), ttl);
    return el;
  }

  function shake() {
    const app = $('app');
    app.classList.remove('shake');
    void app.offsetWidth;
    app.classList.add('shake');
    setTimeout(() => app.classList.remove('shake'), 420);
  }

  function special({ kind, idx }) {
    const [r, c] = rc(idx);
    const grid = $('grid');
    if (kind === 'row') spawn(grid, 'beam row', { top: pct(r) }, 500);
    if (kind === 'col') spawn(grid, 'beam col', { left: pct(c) }, 500);
    if (kind === 'bomb') { spawn(grid, 'blast', { left: pct(c - 1), top: pct(r - 1) }, 600); shake(); }
    if (kind === 'food') spawn(grid, 'rays', { '--x': pct(c + 0.5), '--y': pct(r + 0.5) }, 850);
    PVZ.Audio.play({ row: 'beam', col: 'beam', bomb: 'boom', food: 'food' }[kind]);
  }

  function floatText(x, y, text, cls = '') {
    const el = spawn($('app'), `float-text ${cls}`, { left: `${x}px`, top: `${y}px` }, 950);
    el.textContent = text;
  }

  function combo(n) {
    const box = $('grid').getBoundingClientRect();
    const app = $('app').getBoundingClientRect();
    floatText(box.left - app.left + box.width / 2, box.top - app.top + box.height * 0.4, `连击 ×${n}!`, 'combo');
  }

  function suns(points, onEach) {
    const app = $('app').getBoundingClientRect();
    const target = document.querySelector('.sun-icon').getBoundingClientRect();
    const tx = target.left - app.left + target.width / 2;
    const ty = target.top - app.top + target.height / 2;
    points.forEach((p, i) => {
      const el = spawn($('app'), 'fly-sun', { left: `${p.x}px`, top: `${p.y}px` }, 2500);
      const dx = tx - p.x;
      const dy = ty - p.y;
      const anim = el.animate([
        { transform: 'translate(0, 0) scale(.4)' },
        { transform: `translate(${dx * 0.15}px, ${dy * 0.15 - 30}px) scale(1.1)`, offset: 0.3 },
        { transform: `translate(${dx}px, ${dy}px) scale(.7)` },
      ], { duration: 750, delay: i * 70, easing: 'ease-in', fill: 'both' });
      anim.onfinish = () => {
        el.remove();
        onEach();
        PVZ.Audio.play('sun');
      };
    });
  }

  PVZ.Effects = { special, floatText, combo, suns, shake };
})();
