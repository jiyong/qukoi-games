(function () {
  const { board } = window.Game.internal;
  const DRAG_THRESHOLD = 0.42;
  const TAP_SLOP = 6;
  const BOARD_UNITS = 4.16;
  const KEYS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };

  let drag = null;

  const cellPx = () => board.offsetWidth / BOARD_UNITS;

  function bump(el) {
    el.classList.remove('blocked');
    void el.offsetWidth;
    el.classList.add('blocked');
    window.Sfx.bump();
  }

  board.addEventListener('pointerdown', (e) => {
    const el = e.target.closest('.piece');
    if (!el || window.Game.state.won) return;
    el.setPointerCapture(e.pointerId);
    el.classList.add('dragging');
    drag = { el, id: el.dataset.id, ox: e.clientX, oy: e.clientY, sx: e.clientX, sy: e.clientY, moved: false, bumped: false };
    window.Sfx.pick();
    if (el.classList.contains('boss')) window.Sfx.groan();
  });

  board.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const cell = cellPx();
    const dx = e.clientX - drag.ox;
    const dy = e.clientY - drag.oy;
    const horizontal = Math.abs(dx) >= Math.abs(dy);
    const dist = horizontal ? dx : dy;
    if (Math.abs(dist) < cell * DRAG_THRESHOLD) return;
    const dir = Math.sign(dist);
    const [mx, my] = horizontal ? [dir, 0] : [0, dir];
    if (window.Game.step(drag.id, mx, my)) {
      drag.ox += mx * cell;
      drag.oy += my * cell;
      drag.moved = true;
      drag.bumped = false;
    } else if (!drag.bumped) {
      drag.bumped = true;
      bump(drag.el);
    }
  });

  function endDrag(e) {
    if (!drag) return;
    const { el, id, sx, sy, moved } = drag;
    el.classList.remove('dragging');
    drag = null;
    const isTap = !moved && Math.hypot(e.clientX - sx, e.clientY - sy) < TAP_SLOP;
    if (!isTap || window.Game.state.won) return;
    const dirs = window.Game.legalDirs(id);
    if (dirs.length === 1) window.Game.step(id, ...dirs[0]);
    else bump(el);
  }

  board.addEventListener('pointerup', endDrag);
  board.addEventListener('pointercancel', endDrag);

  board.addEventListener('keydown', (e) => {
    const el = e.target.closest('.piece');
    const dir = KEYS[e.key];
    if (!el || !dir) return;
    e.preventDefault();
    if (!window.Game.step(el.dataset.id, ...dir)) bump(el);
  });
})();
