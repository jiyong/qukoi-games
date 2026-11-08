(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const board = $('board');
  const tpl = $('hole-tpl');
  const overlay = $('overlay');
  const holeEls = new Map();
  const WHACK_MS = 260;
  const GONE_MS = 380;

  const game = Whack.createGame({ onEvent: (type, data) => handlers[type] && handlers[type](data) });

  function bestCols(n) {
    const { width: W, height: H } = board.parentElement.getBoundingClientRect();
    let best = 1;
    let bestSize = 0;
    for (let c = 1; c <= n; c++) {
      const size = Math.min(W / c, H / Math.ceil(n / c));
      if (size > bestSize + 0.5) { best = c; bestSize = size; }
    }
    return best;
  }

  function layout() {
    const n = holeEls.size;
    if (!n) return;
    const cols = bestCols(n);
    board.style.setProperty('--cols', cols);
    board.style.setProperty('--rows', Math.ceil(n / cols));
  }

  function buildBoard(holeIds) {
    board.replaceChildren();
    holeEls.clear();
    holeIds.forEach((id, i) => {
      const el = tpl.content.firstElementChild.cloneNode(true);
      el.dataset.id = id;
      el.classList.add('enter');
      el.style.animationDelay = `${i * 30}ms`;
      el.setAttribute('aria-label', `地洞 ${i + 1}`);
      holeEls.set(id, el);
      board.append(el);
    });
    layout();
  }

  function floatText(el, text, gold) {
    const f = document.createElement('span');
    f.className = gold ? 'float gold' : 'float';
    f.textContent = text;
    el.append(f);
    f.addEventListener('animationend', () => f.remove());
  }

  function toast(text) {
    const t = $('toast');
    t.textContent = text;
    t.classList.remove('show');
    void t.offsetWidth;
    t.classList.add('show');
  }

  function renderHud() {
    const s = game.state;
    $('level').textContent = s.level;
    $('score').textContent = s.score;
    $('target').textContent = s.target;
    $('total').textContent = s.total;
    $('holes').textContent = s.holes.length;
    const pct = s.target ? Math.min(100, Math.round((s.score / s.target) * 100)) : 0;
    $('bar').style.width = `${pct}%`;
    $('bar').parentElement.setAttribute('aria-valuenow', pct);
  }

  function lowerMole(el) {
    el.classList.remove('up', 'king', 'whacked');
    el.setAttribute('aria-label', '地洞');
  }

  const handlers = {
    level() { buildBoard(game.state.holes); },
    spawn(m) {
      const el = holeEls.get(m.holeId);
      el.style.setProperty('--stay', `${m.expiresAt - m.bornAt}ms`);
      el.classList.remove('whacked');
      el.classList.toggle('king', m.type === 'king');
      el.classList.add('up');
      el.setAttribute('aria-label', m.type === 'king' ? '地鼠王' : '地鼠');
    },
    escape(m) { lowerMole(holeEls.get(m.holeId)); },
    hit(m) {
      const el = holeEls.get(m.holeId);
      el.classList.add('whacked');
      floatText(el, `+${m.points}`, m.type === 'king');
      m.type === 'king' ? Sfx.king() : Sfx.hit();
      setTimeout(() => { if (!game.state.moles.some((x) => x.holeId === m.holeId)) lowerMole(el); }, WHACK_MS);
      renderHud();
    },
    miss() { Sfx.miss(); },
    combo({ holeId }) {
      Sfx.combo();
      if (holeId === null) return toast('连击！地洞已是最少');
      toast('连击！消除一个洞');
      const el = holeEls.get(holeId);
      el.classList.add('gone');
      holeEls.delete(holeId);
      setTimeout(() => { el.remove(); layout(); }, GONE_MS);
      renderHud();
    },
    clear({ level, score, total }) {
      Sfx.clear();
      holeEls.forEach((el) => { if (!el.classList.contains('whacked')) lowerMole(el); });
      const next = Whack.levelConfig(level + 1);
      showOverlay(`第 ${level} 关通过`,
        `<div class="big">${score} 分</div>总分 ${total}<br>下一关：${next.holes} 个洞，目标 ${next.target} 分`,
        '下一关', () => game.nextLevel(performance.now()));
      $('pause').disabled = true;
    },
  };

  let onOverlayBtn = null;
  function showOverlay(title, html, btnText, action) {
    $('ov-title').textContent = title;
    $('ov-body').innerHTML = html;
    $('ov-btn').textContent = btnText;
    onOverlayBtn = action;
    overlay.hidden = false;
    $('ov-btn').focus();
  }

  $('ov-btn').addEventListener('click', () => {
    Sfx.unlock();
    overlay.hidden = true;
    const action = onOverlayBtn || (() => game.start(performance.now()));
    onOverlayBtn = null;
    action();
    $('pause').disabled = false;
    renderHud();
  });

  function pause() {
    if (game.state.status !== 'playing') return;
    game.pause(performance.now());
    document.body.classList.add('paused');
    $('pause').disabled = true;
    showOverlay('暂停中', `第 ${game.state.level} 关 · ${game.state.score}/${game.state.target} 分`, '继续', () => {
      game.resume(performance.now());
      document.body.classList.remove('paused');
    });
  }

  $('pause').addEventListener('click', pause);
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' || e.key === 'p') pause(); });

  function whack(target) {
    const el = target.closest('.hole');
    if (!el || el.classList.contains('gone')) return;
    game.hit(Number(el.dataset.id), performance.now());
  }

  board.addEventListener('pointerdown', (e) => { e.preventDefault(); Sfx.unlock(); whack(e.target); });
  board.addEventListener('click', (e) => { if (e.detail === 0) whack(e.target); });
  board.addEventListener('contextmenu', (e) => e.preventDefault());
  addEventListener('resize', layout);

  (function loop() {
    game.tick(performance.now());
    requestAnimationFrame(loop);
  })();

  buildBoard(Array.from({ length: Whack.levelConfig(1).holes }, (_, i) => -1 - i));
})();
