(function () {
  'use strict';

  const D = window.YayaData;
  const E = window.YayaEngine;
  const Save = window.YayaSave;
  const { el } = window.YayaMenu;
  const Sfx = window.Sfx;

  const STEP = 1 / 60;
  const MAX_STEPS = 5;
  const SHAKE_TIME = 0.35;
  const $ = (id) => document.getElementById(id);
  const dom = {
    gold: $('gold'), hp: $('hp'), wave: $('wave'), waves: $('waves'), start: $('start'), countdown: $('countdown'),
    speed: $('speed'), pause: $('pause'), mute: $('mute'), stage: $('stage'), canvas: $('board'), menu: $('menu'),
    toast: $('toast'), overlay: $('overlay'), ovTitle: $('ov-title'), ovBody: $('ov-body'), ovActions: $('ov-actions'),
  };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let save = Save.load(window.localStorage, D.LEVELS.length);
  let level = D.LEVELS[0];
  let game = null;
  let paused = true;
  let speed = 1;
  let shake = 0;
  let hover = null;
  let lastHud = '';
  let toastTimer = 0;

  const renderer = window.YayaRender.create(dom.canvas, { reducedMotion });
  const menu = window.YayaMenu.create(dom.menu, dom.stage, 12, 8, {
    build: (type, cell) => tryBuild(type, cell),
    upgrade: (t) => act(game.upgrade(t.id), () => Sfx.upgrade()),
    sell: (t) => act(game.sell(t.id), () => Sfx.sell()),
  });

  Sfx.setMuted(save.muted);

  function toast(msg) {
    dom.toast.textContent = msg;
    dom.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => dom.toast.classList.remove('show'), 1400);
  }

  const REASONS = { gold: '金币不够', blocked: '这里不能建造', max: '已经满级啦', over: '本关已结束' };

  function act(result, onOk) {
    if (result.ok) {
      onOk();
      menu.close();
    } else {
      Sfx.deny();
      toast(REASONS[result.reason] || '操作失败');
    }
    return result;
  }

  function tryBuild(type, cell) {
    if (paused) return toast('暂停中无法建造');
    act(game.build(type, cell.c, cell.r), () => Sfx.build());
  }

  function onEvent(type, d) {
    if (type === 'fire') Sfx.fire(d.tower.type);
    else if (type === 'kill') {
      Sfx.kill();
      renderer.burst(d.enemy.x, d.enemy.y, '#9be36b');
      renderer.text(d.enemy.x, d.enemy.y - 0.3, `+${d.gold}`);
    } else if (type === 'blast') Sfx.blast();
    else if (type === 'bite') {
      Sfx.bite();
      shake = SHAKE_TIME;
      renderer.burst(game.state.map.goal.c + 0.5, game.state.map.goal.r + 0.5, '#4fb66b', 10);
    } else if (type === 'clear') {
      Sfx.clear();
      renderer.burst(d.obstacle.x, d.obstacle.y, '#c7cbcf', 14);
      renderer.text(d.obstacle.x, d.obstacle.y, `+${d.gold}`);
      if (d.tower) toast(`发现了一座${D.TOWERS[d.tower.type].name}！`);
    } else if (type === 'wave') {
      Sfx.wave();
      toast(d.wave === d.total ? '最后一波！' : `第 ${d.wave} 波来了`);
    } else if (type === 'cleared') {
      toast(`第 ${d.wave} 波已清空，抓紧布防`);
    } else if (type === 'dash') {
      Sfx.dash();
      toast('甲虫王发怒了！');
    } else if (type === 'win') setTimeout(() => showResult(true), 600);
    else if (type === 'lose') setTimeout(() => showResult(false), 600);
  }

  function openOverlay(title, body, actions, kind = 'info') {
    dom.ovTitle.dataset.kind = kind;
    dom.ovTitle.textContent = title;
    dom.ovBody.replaceChildren(...body);
    dom.ovActions.replaceChildren(...actions.map(({ label, onClick, primary }) => {
      const b = el('button', primary ? 'btn btn-primary' : 'btn', label);
      b.type = 'button';
      b.addEventListener('click', () => {
        Sfx.unlock();
        onClick();
      });
      return b;
    }));
    dom.overlay.classList.add('show');
    const first = dom.overlay.querySelector('.btn-primary, .level-card:not([disabled]), .btn');
    if (first) first.focus();
  }

  function closeOverlay() {
    dom.overlay.classList.remove('show');
  }

  const starText = (n) => '★'.repeat(n) + '☆'.repeat(3 - n);

  function showLevels() {
    paused = true;
    menu.close();
    const grid = el('div', 'level-grid');
    for (const lv of D.LEVELS) {
      const open = Save.isUnlocked(save, lv.id);
      const card = el('button', 'level-card');
      card.type = 'button';
      card.disabled = !open;
      card.append(el('span', 'level-no', String(lv.id)), el('span', 'level-name', lv.name),
        el('span', 'level-stars', open ? starText(save.best[lv.id] || 0) : '未解锁'));
      card.setAttribute('aria-label', `第 ${lv.id} 关 ${lv.name}${open ? '' : '，未解锁'}`);
      card.addEventListener('click', () => {
        Sfx.unlock();
        startLevel(lv);
      });
      grid.append(card);
    }
    const intro = el('p', 'ov-text', '害虫要来啃芽芽了！在小路边种下防御塔，撑过所有波次。');
    const total = el('p', 'ov-sub', `已获得 ${Save.totalStars(save)} / ${D.LEVELS.length * 3} 星`);
    openOverlay('芽芽保卫战', [intro, grid, total], []);
  }

  function startLevel(lv) {
    level = lv;
    game = E.createEngine(lv, { onEvent });
    renderer.setMap(game.state.map);
    menu.close();
    hover = null;
    shake = 0;
    lastHud = '';
    paused = false;
    closeOverlay();
    toast(`第 ${lv.id} 关 · ${lv.name}`);
  }

  function showPause() {
    if (!game || game.state.status === 'won' || game.state.status === 'lost') return;
    paused = true;
    menu.close();
    openOverlay('暂停中', [el('p', 'ov-text', `第 ${level.id} 关 · ${level.name}`)], [
      { label: '继续', primary: true, onClick: resume },
      { label: '重新开始', onClick: () => startLevel(level) },
      { label: '选择关卡', onClick: showLevels },
    ], 'pause');
  }

  function resume() {
    paused = false;
    closeOverlay();
  }

  function showResult(won) {
    paused = true;
    menu.close();
    const next = D.LEVELS.find((l) => l.id === level.id + 1);
    if (!won) {
      Sfx.lose();
      openOverlay('芽芽被啃光了', [el('p', 'ov-text', '换个布局再试一次吧。')], [
        { label: '再试一次', primary: true, onClick: () => startLevel(level) },
        { label: '选择关卡', onClick: showLevels },
      ]);
      return;
    }
    Sfx.win();
    const stars = game.state.stars;
    save = Save.record(save, level.id, stars);
    Save.save(window.localStorage, save);
    const body = [el('p', 'big-stars', starText(stars)), el('p', 'ov-text', `芽芽还剩 ${game.state.hp} 点生命`)];
    if (!next) body.push(el('p', 'ov-sub', '全部关卡已通关，菜园安全啦！'));
    openOverlay('守住啦！', body, [
      ...(next ? [{ label: '下一关', primary: true, onClick: () => startLevel(next) }] : []),
      { label: '再玩一次', primary: !next, onClick: () => startLevel(level) },
      { label: '选择关卡', onClick: showLevels },
    ]);
  }

  function toCell(ev) {
    const rect = dom.canvas.getBoundingClientRect();
    const map = game.state.map;
    const x = ((ev.clientX - rect.left) / rect.width) * map.cols;
    const y = ((ev.clientY - rect.top) / rect.height) * map.rows;
    return { x, y, c: Math.floor(x), r: Math.floor(y) };
  }

  function onBoardClick(ev) {
    if (!game || dom.overlay.classList.contains('show')) return;
    Sfx.unlock();
    if (menu.mode) {
      menu.close();
      return;
    }
    const p = toCell(ev);
    const tower = game.towerAt(p.c, p.r);
    if (tower) {
      menu.openTower(tower, game.upgradeCost(tower), game.sellValue(tower));
      return;
    }
    const target = game.enemyNear(p.x, p.y, 0.55) || game.obstacleAt(p.c, p.r);
    if (target) {
      const f = game.setFocus(target);
      toast(f ? '集火目标已标记' : '已取消集火');
      return;
    }
    if (game.canBuildAt(p.c, p.r)) menu.openBuild(p.c, p.r);
  }

  function onKey(ev) {
    if (ev.repeat || !game) return;
    const overlayOpen = dom.overlay.classList.contains('show');
    if (ev.key === 'Escape') {
      if (menu.mode) menu.close();
      else if (overlayOpen && dom.ovTitle.dataset.kind === 'pause') resume();
      else if (!overlayOpen) showPause();
      return;
    }
    if (overlayOpen) return;
    if (ev.code === 'Space') {
      ev.preventDefault();
      showPause();
    } else if (ev.key === 'f' || ev.key === 'F') toggleSpeed();
    else if (menu.mode === 'build' && /^[1-5]$/.test(ev.key)) tryBuild(D.TOWER_ORDER[Number(ev.key) - 1], menu.cell);
  }

  function toggleSpeed() {
    speed = speed === 1 ? 2 : 1;
    dom.speed.textContent = `${speed}×`;
    dom.speed.setAttribute('aria-pressed', String(speed === 2));
  }

  function toggleMute() {
    Sfx.unlock();
    save = { ...save, muted: !save.muted };
    Sfx.setMuted(save.muted);
    Save.save(window.localStorage, save);
    dom.mute.setAttribute('aria-pressed', String(save.muted));
  }

  function updateHud() {
    const s = game.state;
    const prep = s.status === 'prep';
    const left = Math.max(0, Math.ceil(s.nextWaveAt - s.time));
    const key = [s.gold, s.hp, s.wave, s.totalWaves, prep, left].join('|');
    if (key === lastHud) return;
    lastHud = key;
    dom.gold.textContent = s.gold;
    dom.hp.textContent = s.hp;
    dom.wave.textContent = s.wave;
    dom.waves.textContent = s.totalWaves;
    dom.hp.closest('.stat').classList.toggle('low', s.hp <= 4);
    dom.start.hidden = !prep;
    dom.countdown.textContent = prep ? `${left}s` : '';
  }

  let last = 0;
  let acc = 0;
  function frame(now) {
    const real = Math.min(0.1, (now - (last || now)) / 1000);
    last = now;
    if (game) {
      if (!paused) {
        acc += real * speed;
        let steps = 0;
        while (acc >= STEP && steps < MAX_STEPS * speed) {
          game.tick(STEP);
          acc -= STEP;
          steps++;
        }
        if (steps >= MAX_STEPS * speed) acc = 0;
        renderer.update(real);
        shake = Math.max(0, shake - real);
      }
      updateHud();
      menu.refresh(game.state.gold, paused);
      const view = { cell: menu.mode === 'build' ? menu.cell : hover, shake: shake / SHAKE_TIME, rangeOf: menu.tower };
      if (view.cell) view.cellOk = game.canBuildAt(view.cell.c, view.cell.r);
      renderer.draw(game.state, view, now / 1000);
    }
    requestAnimationFrame(frame);
  }

  dom.canvas.addEventListener('click', onBoardClick);
  dom.canvas.addEventListener('pointermove', (ev) => {
    if (!game || ev.pointerType !== 'mouse') return;
    const p = toCell(ev);
    hover = game.canBuildAt(p.c, p.r) ? { c: p.c, r: p.r } : null;
    dom.canvas.style.cursor = hover || game.towerAt(p.c, p.r) || game.obstacleAt(p.c, p.r) ? 'pointer' : 'default';
  });
  dom.canvas.addEventListener('pointerleave', () => { hover = null; });
  document.addEventListener('keydown', onKey);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && !paused) showPause();
  });
  window.addEventListener('resize', () => {
    renderer.resize();
    menu.close();
  });
  dom.start.addEventListener('click', () => {
    Sfx.unlock();
    const bonus = game.startNow();
    if (bonus > 0) toast(`提前开战 +${bonus} 金币`);
  });
  dom.speed.addEventListener('click', toggleSpeed);
  dom.pause.addEventListener('click', showPause);
  dom.mute.addEventListener('click', toggleMute);
  dom.mute.setAttribute('aria-pressed', String(save.muted));

  game = E.createEngine(level, { onEvent: () => {} });
  renderer.setMap(game.state.map);
  showLevels();
  requestAnimationFrame(frame);
})();
