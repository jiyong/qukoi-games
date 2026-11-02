'use strict';

const DOWN = Math.PI / 2;

const ENEMY_FIRE = {
  scout: { every: 2.4, fn: (e) => G.pat.aimed(e.x, e.y + 10, 150, 1, 0, { color: '#ff5a3a' }) },
  fighter: { every: 1.8, fn: (e) => G.pat.aimed(e.x, e.y + 10, 165, 3, 0.4, { color: '#ffcc33' }) },
  gunship: { every: 1.5, fn: (e) => G.pat.fan(e.x, e.y + 12, DOWN, 5, 1.1, 150, { color: '#ff8a2a' }) },
  bomber: { every: 2, fn: (e) => G.pat.ring(e.x, e.y, 12, 125, e.t, { color: '#ff66cc' }) },
  turret: {
    every: 0.16,
    fn: (e) => {
      for (let i = 0; i < 3; i++) G.spawnEB({ x: e.x, y: e.y, a: e.t * 2.2 + (i * Math.PI * 2) / 3, s: 140, color: '#cc66ff', r: 4 });
    },
  },
  ace: {
    every: 1.1,
    fn: (e) => {
      for (let i = 0; i < 5; i++) G.spawnEB({ x: e.x, y: e.y + 12, a: G.aim(e.x, e.y), s: 200 + i * 35, color: '#66ccff', kind: 'needle', r: 4 });
    },
  },
  heavy: {
    every: 1.3,
    fn: (e) => {
      e.shots = (e.shots || 0) + 1;
      if (e.shots % 2) G.pat.ring(e.x, e.y + 20, 20, 120, e.t, { color: '#ff66cc' });
      else for (const sx of [-50, 50]) G.pat.aimed(e.x + sx, e.y + 10, 180, 3, 0.3, { color: '#ffcc33', kind: 'big', r: 6 });
    },
  },
};

G.spawnEnemy = function (type, o) {
  const T = G.ENEMY_TYPES[type];
  const hp = Math.round(T.hp * (G.levelDef ? G.levelDef.hpMul : 1));
  const e = { type, ...T, move: 'down', v: 120, ...o, hp, maxHp: hp, t: 0, hitT: 0, dead: false, rot: 0 };
  e.x0 = e.x;
  e.fireT = G.rand(0.5, 1.5);
  if (e.vx === undefined) e.vx = 0;
  if (e.vy === undefined) e.vy = e.v;
  G.enemies.push(e);
  return e;
};

const MOVES = {
  down(e, dt) {
    e.y += e.v * dt;
  },
  sine(e, dt) {
    e.y += e.v * dt;
    e.x = e.x0 + Math.sin(e.t * (e.freq || 2)) * (e.amp || 70);
  },
  swoop(e, dt) {
    if (e.t < (e.turnT || 1.6)) {
      const c = Math.cos(e.turn * dt);
      const s = Math.sin(e.turn * dt);
      const vx = e.vx * c - e.vy * s;
      e.vy = e.vx * s + e.vy * c;
      e.vx = vx;
    }
    e.x += e.vx * dt;
    e.y += e.vy * dt;
  },
  stop(e, dt) {
    const stay = e.stay || 5;
    if (e.t < stay) e.y = G.lerp(e.y, e.stopY, Math.min(1, dt * 1.8));
    else e.y += (e.y < G.H / 2 ? -1 : 1) * 70 * dt * Math.min(1, e.t - stay);
    e.x = e.x0 + Math.sin(e.t * 0.8) * (e.amp || 20);
    if (e.t > stay && e.y < -60) e.dead = true;
  },
  chase(e, dt) {
    if (e.t < 0.7) {
      e.y += 110 * dt;
      e.rot = 0;
      return;
    }
    if (!e.locked) {
      e.locked = true;
      const a = G.aim(e.x, e.y);
      e.vx = Math.cos(a) * 400;
      e.vy = Math.sin(a) * 400;
      e.rot = a - DOWN;
    }
    e.x += e.vx * dt;
    e.y += e.vy * dt;
    if (Math.random() < 0.6) G.fx.trail(e.x - e.vx * 0.03, e.y - e.vy * 0.03, '#ff7a2a', 7, 0.3);
  },
  cross(e, dt) {
    e.x += e.vx * dt;
    e.y += Math.sin(e.t * 2) * 20 * dt + 12 * dt;
  },
};

function canFire(e) {
  const p = G.player;
  if (e.y < 12 || e.y > G.H * 0.62 || !p || !p.alive) return false;
  return G.d2(e.x, e.y, p.x, p.y) > 120 * 120;
}

G.updateEnemies = function (dt) {
  const list = G.enemies;
  const fireMul = G.levelDef ? G.levelDef.fireMul : 1;
  for (let i = list.length - 1; i >= 0; i--) {
    const e = list[i];
    e.t += dt;
    e.hitT = Math.max(0, e.hitT - dt);
    MOVES[e.move](e, dt);
    const F = ENEMY_FIRE[e.type];
    if (F && G.phase !== 'clear') {
      e.fireT -= dt;
      if (e.fireT <= 0) {
        e.fireT = F.every * fireMul * G.rand(0.85, 1.15);
        if (canFire(e)) F.fn(e);
      }
    }
    const out = e.t > 1.5 && (e.y > G.H + 70 || e.y < -120 || e.x < -90 || e.x > G.W + 90);
    if (e.dead || out) {
      list[i] = list[list.length - 1];
      list.pop();
    }
  }
};

G.damageEnemy = function (e, dmg) {
  if (e.dead) return;
  e.hp -= dmg;
  e.hitT = 0.06;
  G.audio.play('hit', 0.06);
  if (e.hp <= 0) killEnemy(e);
};

function killEnemy(e) {
  e.dead = true;
  const size = e.r / 16;
  G.fx.explode(e.x, e.y, size, e.type === 'turret' ? '#ff66cc' : '#ffaa33');
  G.audio.play(size > 2 ? 'bigBoom' : 'boom', 0.05);
  G.score += e.score;
  G.fx.text(e.x, e.y - 10, String(e.score), '#ffe08a', size > 2 ? 18 : 12);
  if (size > 2) {
    G.shake = Math.max(G.shake, 10);
    G.flash = { a: 0.4, color: '#ffd9a0' };
    ['P', 'S', 'B'].forEach((k) => G.spawnPowerup(k, e.x + G.rand(-30, 30), e.y));
    for (let i = 0; i < 5; i++) G.pending.push({ at: i * 0.12, fn: () => G.fx.explode(e.x + G.rand(-50, 50), e.y + G.rand(-30, 30), 1.4) });
  } else if (e.drop) {
    G.spawnPowerup(e.drop, e.x, e.y);
  } else if (Math.random() < (size > 1.4 ? 0.6 : 0.12)) {
    G.spawnPowerup('M', e.x, e.y);
  }
}
