'use strict';
(function () {
  const { Grid, Board, Lane, UI, Audio, Input } = PVZ;
  const app = document.getElementById('app');
  const G = { level: 1, sun: 0, score: 0, grid: [], busy: false, running: false, paused: false, won: false, idle: 0, hinted: false, last: 0 };
  const saved = () => Math.max(1, Number(localStorage.getItem(PVZ.STORE_KEY)) || 1);

  function setSun(n, bump = false) {
    G.sun = n;
    UI.setSun(n, bump);
    UI.setFood(G.running && G.sun >= PVZ.FOOD_COST);
  }

  function addScore(n) {
    G.score += n;
    UI.setScore(G.score);
  }

  function touch() {
    G.idle = 0;
    G.hinted = false;
    Board.clearHint();
  }

  function end(win) {
    if (!G.running) return;
    G.running = false;
    G.won = win;
    Input.clear();
    UI.setFood(false);
    if (win) localStorage.setItem(PVZ.STORE_KEY, String(Math.max(saved(), G.level + 1)));
    Audio.play(win ? 'win' : 'lose');
    setTimeout(() => UI.showResult(win, G.level, G.score), win ? 900 : 600);
  }

  const hooks = {
    onKill: (killed, total) => UI.setProgress(killed / total),
    onHugeWave: () => { UI.banner('一大波僵尸正在接近！', 'danger', 2200); Audio.play('huge'); },
    onWin: () => end(true),
    onLose: () => end(false),
  };

  function startLevel(n) {
    Object.assign(G, { level: n, score: 0, busy: false, running: true, paused: false, won: false, idle: 0, hinted: false });
    app.classList.remove('paused');
    UI.hideAll();
    UI.setLevel(n);
    UI.setScore(0);
    UI.setProgress(0);
    setSun(PVZ.START_SUN);
    Board.reset();
    G.grid = Grid.createGrid();
    Board.render(G.grid, {}, true);
    Lane.start(PVZ.levelSpec(n), hooks);
    UI.banner(`第 ${n} 关 · 守住草坪！`);
  }

  function buyFood() {
    if (!G.running || G.paused || G.busy || G.sun < PVZ.FOOD_COST) return;
    const options = G.grid.map((c, i) => (c.type >= 0 && !c.special ? i : -1)).filter((i) => i >= 0);
    if (!options.length) return;
    const k = options[Math.floor(Math.random() * options.length)];
    setSun(G.sun - PVZ.FOOD_COST);
    G.grid = G.grid.map((c, i) => (i === k ? Grid.makeCell(-1, 'food') : c));
    Board.render(G.grid);
    touch();
    Audio.play('food');
    UI.banner('能量豆！把它和任意植物交换');
  }

  function setPaused(on) {
    if (!G.running) return;
    G.paused = on;
    app.classList.toggle('paused', on);
    UI.showPause(on);
  }

  function loop(ts) {
    const dt = Math.min(0.05, (ts - G.last) / 1000 || 0);
    G.last = ts;
    if (G.running && !G.paused) {
      Lane.update(dt);
      if (!G.busy) G.idle += dt;
      if (G.running && !G.hinted && G.idle > PVZ.HINT_AFTER) {
        G.hinted = true;
        Board.hint(Grid.findMove(G.grid));
      }
    }
    requestAnimationFrame(loop);
  }

  PVZ.Game = { addSun: (n) => setSun(G.sun + n, true), addScore, touch };

  UI.init({
    start: () => startLevel(saved()),
    reset: () => { localStorage.removeItem(PVZ.STORE_KEY); startLevel(1); },
    primary: () => startLevel(G.won ? G.level + 1 : G.level),
    menu: () => { G.running = false; UI.showMenu(saved()); },
    pause: () => setPaused(!G.paused),
    resume: () => setPaused(false),
    restart: () => startLevel(G.level),
    food: buyFood,
    sound: () => UI.setSound(Audio.toggle()),
  });
  Input.init(document.getElementById('grid'), {
    onSwap: (a, b) => PVZ.Resolve.swap(G, a, b),
    enabled: () => G.running && !G.paused && !G.busy,
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) setPaused(true); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' || e.key === 'p') setPaused(!G.paused); });

  UI.setSound(Audio.on);
  setSun(0);
  G.grid = Grid.createGrid();
  Board.render(G.grid, {}, true);
  UI.showMenu(saved());
  requestAnimationFrame(loop);
})();
