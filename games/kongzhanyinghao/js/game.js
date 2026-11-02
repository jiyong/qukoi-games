'use strict';

G.hi = G.store.get('hi', 0);
G.unlocked = G.store.get('unlocked', 0);
G.menuSel = G.unlocked;
G.overT = 0;

function saveHi() {
  if (G.score > G.hi) {
    G.hi = G.score;
    G.store.set('hi', G.hi);
  }
}

function newRun(level) {
  const p = (G.player = G.makePlayer());
  p.power = Math.min(4, 1 + Math.floor(level / 2));
  p.bombs = 3;
  p.shield = level >= 3 ? 1 : 0;
  G.score = 0;
  G.overT = 0;
  G.startLevel(level);
}

function toMenu() {
  saveHi();
  G.state = 'menu';
  G.menuSel = Math.min(G.menuSel, G.unlocked);
  G.boss = null;
  G.enemies = [];
  G.eBullets = [];
  G.lasers.length = 0;
  G.fx.clear();
  G.bg.setTheme('ocean');
  G.audio.setSong('calm');
}

G.onGameOver = function () {
  G.overT = 2.2;
};

G.onBossDead = function () {
  for (const e of G.enemies) G.damageEnemy(e, 9999);
  G.pending = [];
  G.cancelBullets(0, 0, 99999);
  G.phase = 'clear';
  G.clearT = 3.2;
};

function finishLevel() {
  const p = G.player;
  const lifeBonus = Math.max(0, p.lives) * 10000;
  const bombBonus = p.bombs * 3000;
  G.score += lifeBonus + bombBonus;
  G.clearInfo = {
    t: 0,
    lines: [
      ['首领击破', G.BOSSES[G.levelDef.boss].score],
      ['剩余战机奖励', lifeBonus],
      ['剩余炸弹奖励', bombBonus],
    ],
  };
  G.unlocked = Math.max(G.unlocked, Math.min(G.level + 1, G.LEVELS.length - 1));
  G.store.set('unlocked', G.unlocked);
  G.menuSel = G.unlocked;
  saveHi();
  G.state = 'clear';
  G.audio.play('clear');
  G.audio.setSong('calm');
}

function updateWorld(dt) {
  G.bg.update(dt);
  const canFire = G.phase !== 'clear' && G.overT <= 0 && G.state === 'playing';
  G.updatePlayer(dt, canFire);
  G.weapons.update(dt);
  if (G.state === 'playing') G.updateLevel(dt);
  G.updateEnemies(dt);
  G.updateBoss(dt);
  G.updateEB(dt);
  G.updateLasers(dt);
  G.updatePowerups(dt);
  if (G.state === 'playing') G.collide();
  G.fx.update(dt);
}

function updatePlaying(raw) {
  if (G.hit('KeyP', 'Escape')) {
    G.state = 'paused';
    return;
  }
  let dt = raw;
  if (G.slowmo > 0) {
    G.slowmo -= raw;
    dt = raw * 0.35;
  }
  updateWorld(dt);
  if (G.overT > 0) {
    G.overT -= raw;
    if (G.overT <= 0) {
      saveHi();
      G.state = 'gameover';
      G.audio.setSong(null);
    }
  } else if (G.phase === 'clear') {
    G.clearT -= raw;
    if (G.clearT <= 0) finishLevel();
  }
}

const STATES = {
  menu(raw) {
    G.bg.update(raw);
    G.fx.update(raw);
    if (G.hit('ArrowLeft')) G.menuSel = Math.max(0, G.menuSel - 1);
    if (G.hit('ArrowRight')) G.menuSel = Math.min(G.unlocked, G.menuSel + 1);
    if (G.hitEnter() || G.hit('Space')) newRun(G.menuSel);
  },
  playing: updatePlaying,
  paused() {
    if (G.hit('KeyP', 'Escape')) G.state = 'playing';
    else if (G.hit('KeyQ')) toMenu();
  },
  clear(raw) {
    G.clearInfo.t += raw;
    updateWorld(raw);
    if (G.clearInfo.t > 1 && G.hitEnter()) {
      if (G.level >= G.LEVELS.length - 1) return toMenu();
      G.player.bombs = Math.max(G.player.bombs, 2);
      G.startLevel(G.level + 1);
    }
  },
  gameover(raw) {
    G.bg.update(raw);
    G.fx.update(raw);
    if (G.hitEnter()) newRun(G.level);
    else if (G.hit('Escape')) toMenu();
  },
};

function drawWorld(ctx) {
  G.drawPowerups(ctx);
  G.drawEnemies(ctx);
  G.drawBoss(ctx);
  G.drawPB(ctx);
  G.drawPlayer(ctx);
  G.drawLasers(ctx);
  G.fx.draw(ctx);
  G.drawEB(ctx);
}

function render() {
  const ctx = G.ctx;
  ctx.setTransform(G.scale, 0, 0, G.scale, 0, 0);
  ctx.save();
  if (G.shake > 0) ctx.translate(G.rand(-G.shake, G.shake), G.rand(-G.shake, G.shake));
  G.bg.draw(ctx);
  if (G.state === 'menu') G.fx.draw(ctx);
  else drawWorld(ctx);
  ctx.restore();
  if (G.flash.a > 0) {
    ctx.fillStyle = G.rgba(G.flash.color, Math.min(1, G.flash.a));
    ctx.fillRect(0, 0, G.W, G.H);
  }
  if (G.state === 'menu') return G.drawMenu(ctx);
  G.drawHUD(ctx);
  if (G.state === 'paused') G.drawPause(ctx);
  else if (G.state === 'clear') G.drawClear(ctx);
  else if (G.state === 'gameover') G.drawGameOver(ctx);
}

let lastTs = 0;
function frame(ts) {
  const raw = Math.min(0.05, (ts - lastTs) / 1000 || 0);
  lastTs = ts;
  if (G.hit('KeyM')) G.audio.toggleMusic();
  G.audio.tick();
  if (G.state !== 'paused') G.t += raw;
  STATES[G.state](raw);
  G.shake = Math.max(0, G.shake - raw * 40);
  G.flash.a = Math.max(0, G.flash.a - raw * 2.5);
  render();
  G.endInput();
  requestAnimationFrame(frame);
}

G.initCanvas();
G.bg.setTheme('ocean');
G.audio.setSong('calm');
requestAnimationFrame(frame);
