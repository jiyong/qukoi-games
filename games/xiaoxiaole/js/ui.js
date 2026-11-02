'use strict';
(function () {
  const $ = (id) => document.getElementById(id);
  let bannerTimer = 0;

  function init(on) {
    $('legend').innerHTML = PVZ.PLANTS.map((p, i) =>
      `<li><span class="lg-ico">${PVZ.Art.plant(i)}</span><b>${p.name}</b><small>${p.desc}</small></li>`).join('');
    $('foodIco').innerHTML = PVZ.Art.food();
    $('foodCost').textContent = PVZ.FOOD_COST;
    $('defenders').innerHTML = `<div class="house-art">${PVZ.Art.house()}</div><div class="guard">${PVZ.Art.plant(PVZ.TYPE.PEA)}</div>`;
    const bind = { btnStart: on.start, btnReset: on.reset, btnPrimary: on.primary, btnMenu: on.menu, btnMenu2: on.menu,
      btnPause: on.pause, btnResume: on.resume, btnRestart: on.restart, btnFood: on.food, btnSound: on.sound };
    Object.entries(bind).forEach(([id, fn]) => $(id).addEventListener('click', () => { PVZ.Audio.unlock(); fn(); }));
  }

  function setSun(n, bump) {
    const el = $('sunCount');
    el.textContent = n;
    if (!bump) return;
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
  }

  const setScore = (n) => { $('scoreVal').textContent = n; };
  const setLevel = (n) => { $('levelTitle').textContent = `第 ${n} 关`; };
  const setFood = (enabled) => { $('btnFood').disabled = !enabled; };

  function setProgress(p) {
    const v = `${Math.round(p * 100)}%`;
    $('progressFill').style.width = v;
    const bar = $('progressFill').parentElement;
    bar.style.setProperty('--p', v);
    bar.setAttribute('aria-valuenow', Math.round(p * 100));
  }

  function setSound(on) {
    $('btnSound').classList.toggle('off', !on);
    $('btnSound').textContent = on ? '音' : '静';
  }

  function banner(text, cls = '', ms = 1600) {
    const el = $('banner');
    el.textContent = text;
    el.className = `banner show ${cls}`;
    clearTimeout(bannerTimer);
    bannerTimer = setTimeout(() => { el.className = `banner ${cls}`; }, ms);
  }

  const toggle = (id, show) => $(id).classList.toggle('hidden', !show);

  function hideAll() {
    ['menu', 'result', 'pause'].forEach((id) => toggle(id, false));
  }

  function showMenu(saved) {
    hideAll();
    toggle('menu', true);
    $('btnStart').textContent = saved > 1 ? `继续第 ${saved} 关` : '开始冒险';
    $('btnReset').hidden = saved <= 1;
  }

  function showResult(win, level, score) {
    hideAll();
    $('resultArt').innerHTML = win ? PVZ.Art.plant(PVZ.TYPE.SUN) : PVZ.Art.zombie('basic');
    $('resultTitle').textContent = win ? '守住了！' : '僵尸吃掉了你的脑子！';
    $('resultText').textContent = win ? `第 ${level} 关通过 · 得分 ${score}` : `第 ${level} 关失败 · 得分 ${score}`;
    $('btnPrimary').textContent = win ? '下一关' : '再试一次';
    toggle('result', true);
  }

  const showPause = (on) => toggle('pause', on);

  PVZ.UI = { init, setSun, setScore, setLevel, setFood, setProgress, setSound, banner, hideAll, showMenu, showResult, showPause };
})();
