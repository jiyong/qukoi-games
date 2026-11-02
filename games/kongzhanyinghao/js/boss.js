'use strict';

const ENTER_TIME = 2.5;
const TRANS_TIME = 1.6;
const DEATH_TIME = 2.6;

const BOSS_MOVES = {
  hover: (B) => [G.W / 2 + Math.sin(B.t * 0.6) * 50, B.d.baseY],
  sway: (B) => [G.W / 2 + Math.sin(B.t * 0.8) * 130, B.d.baseY + Math.sin(B.t * 1.6) * 12],
  eight: (B) => [G.W / 2 + Math.sin(B.t * 0.7) * 140, B.d.baseY + Math.sin(B.t * 1.4) * 45],
  chase: (B) => {
    const px = G.player && G.player.alive ? G.player.x : G.W / 2;
    return [G.clamp(px, B.d.hw * 0.6, G.W - B.d.hw * 0.6), B.d.baseY + Math.sin(B.t) * 25];
  },
};

function tracksFor(entry) {
  const list = Array.isArray(entry) ? entry : [entry];
  return list.map((o) => ({ o, shotT: 0, k: 0 }));
}

function startAttack(B) {
  const ph = B.d.phases[B.phase];
  const entry = ph.atk[B.atkIdx % ph.atk.length];
  B.tracks = tracksFor(entry);
  B.atkDur = B.tracks[0].o.dur;
  B.atkT = 0;
}

G.makeBoss = function (idx) {
  const d = G.BOSSES[idx];
  const B = { d, idx, x: G.W / 2, y: -d.hh - 60, t: 0, phase: 0, atkIdx: 0, pauseT: 0.8, entering: true, enterT: 0 };
  Object.assign(B, { hp: d.phases[0].hp, maxHp: d.phases[0].hp, transT: 0, dying: false, dyingT: 0, boomT: 0, hitT: 0, dead: false });
  startAttack(B);
  return B;
};

G.updateBoss = function (dt) {
  const B = G.boss;
  if (!B || B.dead) return;
  B.t += dt;
  B.hitT = Math.max(0, B.hitT - dt);
  if (B.dying) return updateDying(B, dt);
  if (B.entering) {
    B.enterT += dt;
    const k = Math.min(1, B.enterT / ENTER_TIME);
    B.y = G.lerp(-B.d.hh - 60, B.d.baseY, 1 - Math.pow(1 - k, 3));
    if (k >= 1) B.entering = false;
    return;
  }
  const [tx, ty] = BOSS_MOVES[B.d.phases[B.phase].move](B);
  const f = Math.min(1, dt * 2.2);
  B.x = G.lerp(B.x, tx, f);
  B.y = G.lerp(B.y, ty, f);
  if (B.hp / B.maxHp < 0.35 && Math.random() < dt * 8) {
    G.fx.smoke(B.x + G.rand(-B.d.hw, B.d.hw) * 0.7, B.y + G.rand(-B.d.hh, B.d.hh) * 0.6, 1, 10);
  }
  if (B.transT > 0) {
    B.transT -= dt;
    return;
  }
  if (B.pauseT > 0) {
    B.pauseT -= dt;
    return;
  }
  runAttack(B, dt);
};

function runAttack(B, dt) {
  B.atkT += dt;
  for (const tr of B.tracks) {
    tr.shotT -= dt;
    if (tr.shotT <= 0) {
      G.BA[tr.o.a](B, tr.k, tr.o);
      tr.k++;
      tr.shotT += tr.o.every;
    }
  }
  if (B.atkT >= B.atkDur) {
    B.atkIdx++;
    B.pauseT = 0.6;
    startAttack(B);
  }
}

G.bossInside = function (B, x, y, pad = 0) {
  const dx = (x - B.x) / (B.d.hw + pad);
  const dy = (y - B.y) / (B.d.hh + pad);
  return dx * dx + dy * dy < 1;
};

G.damageBoss = function (B, dmg) {
  if (!B || B.dead || B.dying || B.entering || B.transT > 0) return false;
  B.hp -= dmg;
  B.hitT = 0.05;
  if (B.hp <= 0) nextPhase(B);
  return true;
};

function burst(B, n, size) {
  for (let i = 0; i < n; i++) {
    G.fx.explode(B.x + G.rand(-B.d.hw, B.d.hw) * 0.8, B.y + G.rand(-B.d.hh, B.d.hh) * 0.8, size, G.pick(['#ffaa33', B.d.accent, '#ff5a3a']));
  }
}

function nextPhase(B) {
  const cancelled = G.cancelBullets(B.x, B.y, 9999);
  G.score += cancelled * 20 + 5000;
  if (B.phase < B.d.phases.length - 1) {
    B.phase++;
    B.hp = B.maxHp = B.d.phases[B.phase].hp;
    B.transT = TRANS_TIME;
    B.atkIdx = 0;
    B.pauseT = 0.3;
    startAttack(B);
    burst(B, 5, 1.4);
    G.fx.ring(B.x, B.y, 20, 260, B.d.accent, 0.8, 8);
    G.flash = { a: 0.5, color: B.d.accent };
    G.shake = 12;
    G.audio.play('phase');
    G.audio.play('bigBoom');
    G.spawnPowerup(B.phase % 2 ? 'S' : 'P', B.x, B.y + 20);
    return;
  }
  B.dying = true;
  B.dyingT = 0;
  G.slowmo = 1.6;
  G.audio.play('bigBoom');
}

function updateDying(B, dt) {
  B.dyingT += dt;
  B.boomT -= dt;
  B.y += 14 * dt;
  if (B.boomT <= 0) {
    B.boomT = 0.1;
    burst(B, 1, G.rand(1, 1.8));
    G.audio.play('boom', 0.08);
    G.shake = Math.max(G.shake, 6);
  }
  if (B.dyingT < DEATH_TIME) return;
  B.dead = true;
  burst(B, 14, 2.2);
  for (let i = 0; i < 3; i++) G.fx.ring(B.x, B.y, 20, 380 + i * 120, i === 1 ? '#ffffff' : B.d.accent, 0.8 + i * 0.25, 12);
  G.fx.flash(B.x, B.y, 300, '#fff0c0', 0.9);
  G.flash = { a: 1, color: '#ffffff' };
  G.shake = 26;
  G.audio.play('bigBoom');
  G.score += B.d.score;
  G.fx.text(B.x, B.y, '+' + B.d.score, '#ffe08a', 26);
  for (let i = 0; i < 12; i++) G.spawnPowerup('M', B.x + G.rand(-60, 60), B.y + G.rand(-30, 30));
  G.onBossDead();
}
