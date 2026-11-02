(function () {
  const { DIRS, canMove, isSolved, moveOne, solve } = window.Solver;
  const { LEVELS, parseLevel } = window.Levels;
  const board = document.getElementById('board');
  const STORE = 'pvz-hrd-progress';
  const ESCAPE_ROWS = 3;

  const state = { level: 0, pieces: [], history: [], moves: 0, won: false, els: new Map() };

  const readProgress = () => {
    try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch { return {}; }
  };

  const starsFor = (moves, min) => (moves <= min ? 3 : moves <= Math.ceil(min * 1.5) ? 2 : 1);

  function place(p) {
    const el = state.els.get(p.id);
    el.style.setProperty('--x', p.x);
    el.style.setProperty('--y', p.y);
  }

  function buildPieces() {
    board.querySelectorAll('.piece').forEach((el) => el.remove());
    state.els.clear();
    const counters = { B: 0, V: 0, H: 0, S: 0 };
    for (const p of state.pieces) {
      const art = window.Art.svg(p.type, counters[p.type]++, p.w, p.h);
      const el = document.createElement('div');
      el.className = 'piece' + (p.type === 'B' ? ' boss' : '');
      el.dataset.id = p.id;
      el.tabIndex = 0;
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', art.name);
      el.style.setProperty('--w', p.w);
      el.style.setProperty('--h', p.h);
      el.innerHTML = `${art.html}<span class="label">${art.name}</span>`;
      board.appendChild(el);
      state.els.set(p.id, el);
      place(p);
    }
  }

  function clearHint() {
    board.querySelectorAll('.hinted').forEach((el) => el.classList.remove('hinted'));
    board.querySelectorAll('.arrow').forEach((el) => el.remove());
  }

  function updateMoves() {
    Game.onMoves(state.moves);
  }

  function loadLevel(i) {
    state.level = i;
    state.pieces = parseLevel(LEVELS[i]);
    state.history = [];
    state.moves = 0;
    state.won = false;
    buildPieces();
    Game.onLevel(i, LEVELS[i]);
    updateMoves();
  }

  function finish() {
    state.won = true;
    const boss = state.pieces.find((p) => p.type === 'B');
    const el = state.els.get(boss.id);
    el.classList.add('escaping');
    el.style.setProperty('--y', boss.y + ESCAPE_ROWS);
    const { min } = LEVELS[state.level];
    const stars = starsFor(state.moves, min);
    const progress = readProgress();
    const prev = progress[state.level];
    if (!prev || state.moves < prev.best) progress[state.level] = { best: state.moves, stars };
    localStorage.setItem(STORE, JSON.stringify(progress));
    window.Sfx.win();
    Game.onWin({ moves: state.moves, min, stars, isLast: state.level === LEVELS.length - 1 });
  }

  function step(id, dx, dy) {
    const p = state.pieces.find((q) => q.id === id);
    if (state.won || !canMove(state.pieces, p, dx, dy)) return false;
    state.history = [...state.history, state.pieces];
    state.pieces = moveOne(state.pieces, id, dx, dy);
    state.moves += 1;
    clearHint();
    place(state.pieces.find((q) => q.id === id));
    window.Sfx.move();
    updateMoves();
    if (isSolved(state.pieces)) finish();
    return true;
  }

  function legalDirs(id) {
    const p = state.pieces.find((q) => q.id === id);
    return DIRS.filter(([dx, dy]) => canMove(state.pieces, p, dx, dy));
  }

  const Game = (window.Game = {
    state, LEVELS, readProgress, loadLevel, step, legalDirs, clearHint,
    onMoves() {}, onLevel() {}, onWin() {},
  });
  Game.internal = { solve, place, buildPieces, updateMoves, board };
})();
