'use strict';
(function () {
  const { N, rc, idx, inside, isAdjacent } = PVZ.Grid;
  const DRAG_THRESHOLD = 0.35;
  let start = null;
  let selected = null;
  let opts = null;

  function setSelected(i) {
    selected = i;
    PVZ.Board.select(i);
  }

  function idxOf(e) {
    const tile = e.target.closest('.tile');
    return tile && tile.dataset.idx !== undefined ? Number(tile.dataset.idx) : -1;
  }

  function down(e) {
    if (!opts.enabled()) return;
    PVZ.Audio.unlock();
    const i = idxOf(e);
    if (i < 0) return;
    start = { i, x: e.clientX, y: e.clientY, size: e.currentTarget.clientWidth / N, moved: false };
  }

  function move(e) {
    if (!start || start.moved) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < start.size * DRAG_THRESHOLD) return;
    start.moved = true;
    const [r, c] = rc(start.i);
    const [nr, nc] = Math.abs(dx) > Math.abs(dy) ? [r, c + Math.sign(dx)] : [r + Math.sign(dy), c];
    if (!inside(nr, nc)) return;
    setSelected(null);
    opts.onSwap(start.i, idx(nr, nc));
  }

  function up() {
    if (!start) return;
    const s = start;
    start = null;
    if (s.moved || !opts.enabled()) return;
    if (selected === null) return setSelected(s.i);
    if (selected === s.i) return setSelected(null);
    if (isAdjacent(selected, s.i)) {
      const a = selected;
      setSelected(null);
      opts.onSwap(a, s.i);
      return;
    }
    setSelected(s.i);
  }

  function init(gridEl, options) {
    opts = options;
    gridEl.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', () => { start = null; });
  }

  PVZ.Input = { init, clear: () => setSelected(null) };
})();
