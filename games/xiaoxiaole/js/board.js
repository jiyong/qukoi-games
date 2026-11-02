'use strict';
(function () {
  const { N, rc } = PVZ.Grid;
  const els = new Map();
  const gridEl = () => document.getElementById('grid');

  const artFor = (cell) => (cell.type < 0 ? PVZ.Art.food() : PVZ.Art.plant(cell.type));
  const place = (el, r, c) => { el.style.transform = `translate(${c * 100}%, ${r * 100}%)`; };

  function makeEl(cell, delay) {
    const el = document.createElement('div');
    el.className = 'tile born';
    el.style.setProperty('--d', `${(-Math.random() * 3).toFixed(2)}s`);
    el.style.setProperty('--bd', `${delay.toFixed(2)}s`);
    el.innerHTML = `<div class="tile-inner">${artFor(cell)}</div>`;
    el.addEventListener('animationend', (e) => { if (e.animationName === 'born') el.classList.remove('born'); });
    gridEl().appendChild(el);
    return el;
  }

  function render(g, spawn = {}, intro = false) {
    const alive = new Set();
    g.forEach((cell, i) => {
      const [r, c] = rc(i);
      alive.add(cell.id);
      let el = els.get(cell.id);
      if (!el) {
        el = makeEl(cell, intro ? r * 0.05 + c * 0.025 : 0);
        els.set(cell.id, el);
        if (cell.id in spawn) {
          el.classList.remove('born');
          el.style.transition = 'none';
          place(el, spawn[cell.id], c);
          void el.offsetWidth;
          el.style.transition = '';
        }
      }
      el.dataset.idx = i;
      el.dataset.special = cell.special;
      place(el, r, c);
    });
    for (const [id, el] of els) {
      if (!alive.has(id)) { el.remove(); els.delete(id); }
    }
  }

  function reset() {
    els.forEach((el) => el.remove());
    els.clear();
  }

  function markClearing(g, clear) {
    clear.forEach((i) => {
      const el = els.get(g[i].id);
      if (!el) return;
      el.classList.add('clearing');
      el.removeAttribute('data-idx');
    });
  }

  const elAt = (i) => gridEl().querySelector(`.tile[data-idx="${i}"]`);

  function select(i) {
    gridEl().querySelectorAll('.tile.selected').forEach((el) => el.classList.remove('selected'));
    if (i !== null) elAt(i)?.classList.add('selected');
  }

  function hint(move) {
    if (move) move.forEach((i) => elAt(i)?.classList.add('hint'));
  }

  function clearHint() {
    gridEl().querySelectorAll('.tile.hint').forEach((el) => el.classList.remove('hint'));
  }

  function centerOf(i) {
    const [r, c] = rc(i);
    const box = gridEl().getBoundingClientRect();
    const app = document.getElementById('app').getBoundingClientRect();
    return {
      x: box.left - app.left + ((c + 0.5) * box.width) / N,
      y: box.top - app.top + ((r + 0.5) * box.height) / N,
    };
  }

  PVZ.Board = { render, reset, markClearing, select, hint, clearHint, centerOf };
})();
