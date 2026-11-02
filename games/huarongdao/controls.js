(function () {
  const Game = window.Game;
  const { solve, place, updateMoves, board } = Game.internal;
  const $ = (id) => document.getElementById(id);
  const ARROWS = { '-1,0': '←', '1,0': '→', '0,-1': '↑', '0,1': '↓' };
  const WIN_DELAY_MS = 1300;
  const SUN_COUNT = 18;
  const dlgLevels = $('dlg-levels');
  const dlgWin = $('dlg-win');

  Game.onMoves = (n) => {
    const el = $('moves');
    el.textContent = n;
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
    $('btn-undo').disabled = Game.state.history.length === 0 || Game.state.won;
  };

  Game.onLevel = (i, level) => {
    $('level-name').textContent = level.name;
    const best = Game.readProgress()[i];
    $('level-sub').textContent = `第 ${i + 1} 关 · 最少 ${level.min} 步` + (best ? ` · 最佳 ${best.best}` : '');
    localStorage.setItem('pvz-hrd-level', String(i));
  };

  function sunRain() {
    const fx = $('fx');
    for (let i = 0; i < SUN_COUNT; i++) {
      const s = document.createElement('div');
      s.className = 'fx-sun';
      s.style.left = `${Math.random() * 100}vw`;
      s.style.setProperty('--dur', `${2 + Math.random() * 2}s`);
      s.style.setProperty('--dx', `${(Math.random() - 0.5) * 200}px`);
      s.style.animationDelay = `${Math.random() * 1.2}s`;
      fx.appendChild(s);
      setTimeout(() => s.remove(), 5000);
    }
    [0, 400, 800].forEach((t) => setTimeout(() => window.Sfx.sun(), t + 600));
  }

  Game.onWin = ({ moves, min, stars, isLast }) => {
    $('btn-undo').disabled = true;
    sunRain();
    setTimeout(() => {
      $('win-stars').innerHTML = [1, 2, 3].map((n) => `<span class="${n <= stars ? 'on' : ''}">★</span>`).join('');
      $('win-text').textContent = moves <= min
        ? `${moves} 步完美通关！连戴夫都佩服你。`
        : `用了 ${moves} 步，最少只需 ${min} 步，再试试？`;
      $('btn-next').textContent = isLast ? '从头再来' : '下一关';
      dlgWin.showModal();
    }, WIN_DELAY_MS);
  };

  function undo() {
    const s = Game.state;
    if (s.won || s.history.length === 0) return;
    s.pieces = s.history[s.history.length - 1];
    s.history = s.history.slice(0, -1);
    s.moves = Math.max(0, s.moves - 1);
    Game.clearHint();
    s.pieces.forEach(place);
    window.Sfx.undo();
    updateMoves();
  }

  function hint() {
    const s = Game.state;
    if (s.won) return;
    Game.clearHint();
    const result = solve(s.pieces);
    if (!result || !result.first) return;
    const { id, dx, dy } = result.first;
    const el = board.querySelector(`.piece[data-id="${id}"]`);
    el.classList.add('hinted');
    el.insertAdjacentHTML('beforeend', `<span class="arrow">${ARROWS[`${dx},${dy}`]}</span>`);
    window.Sfx.hint();
  }

  function openLevels() {
    const progress = Game.readProgress();
    $('level-grid').innerHTML = Game.LEVELS.map((lv, i) => {
      const p = progress[i];
      const stars = p ? '★'.repeat(p.stars) + '☆'.repeat(3 - p.stars) : '☆☆☆';
      return `<button class="level-btn${i === Game.state.level ? ' current' : ''}" data-level="${i}">
        <span>${i + 1}. ${lv.name}<br><small>最少 ${lv.min} 步${p ? ` · 最佳 ${p.best}` : ''}</small></span>
        <span class="lv-stars">${stars}</span></button>`;
    }).join('');
    dlgLevels.showModal();
  }

  $('level-grid').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-level]');
    if (!btn) return;
    dlgLevels.close();
    Game.loadLevel(Number(btn.dataset.level));
  });
  document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => b.closest('dialog').close()));
  $('btn-levels').addEventListener('click', openLevels);
  $('btn-undo').addEventListener('click', undo);
  $('btn-hint').addEventListener('click', () => setTimeout(hint, 0));
  $('btn-reset').addEventListener('click', () => Game.loadLevel(Game.state.level));
  $('btn-replay').addEventListener('click', () => { dlgWin.close(); Game.loadLevel(Game.state.level); });
  $('btn-next').addEventListener('click', () => {
    dlgWin.close();
    Game.loadLevel((Game.state.level + 1) % Game.LEVELS.length);
  });
  const syncSound = () => { $('sound-ico').textContent = window.Sfx.muted ? '🔇' : '🔊'; };
  $('btn-sound').addEventListener('click', () => { window.Sfx.toggle(); syncSound(); });
  syncSound();

  const saved = Number(localStorage.getItem('pvz-hrd-level'));
  Game.loadLevel(Number.isInteger(saved) && saved >= 0 && saved < Game.LEVELS.length ? saved : 0);
})();
