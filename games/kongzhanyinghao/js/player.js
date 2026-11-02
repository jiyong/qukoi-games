'use strict';

const PLAYER_SPEED = 280;
const FOCUS_SPEED = 130;
const RESPAWN_TIME = 1.4;

G.makePlayer = () => ({
  x: G.W / 2,
  y: G.H - 90,
  r: 4,
  lives: 3,
  power: 1,
  weapon: 'vulcan',
  bombs: 2,
  shield: 0,
  invuln: 2,
  spawnShield: true,
  shieldHitT: 0,
  fireT: 0,
  missileT: 0,
  bank: 0,
  alive: true,
  respawnT: 0,
  focus: false,
});

G.updatePlayer = function (dt, canFire) {
  const p = G.player;
  p.invuln = Math.max(0, p.invuln - dt);
  p.shieldHitT = Math.max(0, p.shieldHitT - dt);
  if (!p.alive) {
    p.respawnT -= dt;
    if (p.respawnT <= 0 && p.lives >= 0) respawn(p);
    return;
  }
  const k = G.keys;
  p.focus = !!(k.ShiftLeft || k.ShiftRight);
  const sp = p.focus ? FOCUS_SPEED : PLAYER_SPEED;
  let dx = (k.ArrowRight ? 1 : 0) - (k.ArrowLeft ? 1 : 0);
  let dy = (k.ArrowDown ? 1 : 0) - (k.ArrowUp ? 1 : 0);
  if (dx && dy) {
    dx *= Math.SQRT1_2;
    dy *= Math.SQRT1_2;
  }
  p.x = G.clamp(p.x + dx * sp * dt, 18, G.W - 18);
  p.y = G.clamp(p.y + dy * sp * dt, 30, G.H - 26);
  p.bank = G.lerp(p.bank, dx, Math.min(1, dt * 10));
  if (canFire) {
    G.weapons.fire(p, dt);
    if (G.hit('Space', 'KeyX')) G.useBomb();
  }
};

function respawn(p) {
  p.alive = true;
  p.x = G.W / 2;
  p.y = G.H - 90;
  p.invuln = 3;
  p.spawnShield = true;
  G.fx.ring(p.x, p.y, 10, 80, '#ffe66a', 0.6, 4);
}

G.playerHit = function () {
  const p = G.player;
  if (!p.alive || p.invuln > 0) return;
  if (p.shield > 0) {
    p.shield--;
    p.invuln = 1;
    p.spawnShield = false;
    p.shieldHitT = 0.4;
    G.audio.play('shieldHit');
    G.fx.sparks(p.x, p.y, 24, '#4ae8ff', 300, 0.5);
    G.cancelBullets(p.x, p.y, 90);
    return;
  }
  p.alive = false;
  p.respawnT = RESPAWN_TIME;
  p.lives--;
  p.power = Math.max(1, p.power - 1);
  p.bombs = Math.max(p.bombs, 2);
  G.fx.explode(p.x, p.y, 2.2, '#ffb347');
  G.fx.ring(p.x, p.y, 10, 160, '#ffffff', 0.7, 6);
  G.audio.play('die');
  G.shake = 14;
  G.cancelBullets(p.x, p.y, 9999);
  if (p.lives < 0) G.onGameOver();
};

G.cancelBullets = function (x, y, radius) {
  const r2 = radius * radius;
  const keep = [];
  let n = 0;
  for (const b of G.eBullets) {
    if (G.d2(x, y, b.x, b.y) > r2) {
      keep.push(b);
      continue;
    }
    if (n++ < 120) G.fx.sparks(b.x, b.y, 1, b.color, 80, 0.4);
  }
  G.eBullets = keep;
  if (radius > 1000) G.lasers.length = 0;
  return n;
};

G.useBomb = function () {
  const p = G.player;
  if (p.bombs <= 0 || !p.alive) return;
  p.bombs--;
  p.invuln = Math.max(p.invuln, 2.2);
  const n = G.cancelBullets(p.x, p.y, 9999);
  G.score += n * 10;
  G.audio.play('bomb');
  G.shake = 18;
  G.flash = { a: 0.8, color: '#fff2c0' };
  for (let i = 0; i < 4; i++) G.fx.ring(p.x, p.y, 20, 300 + i * 120, i % 2 ? '#ffd24a' : '#ff6a2a', 0.6 + i * 0.2, 10);
  G.fx.flash(p.x, p.y, 260, '#ffb347', 0.7);
  for (let i = 0; i < 10; i++) G.fx.explode(G.rand(40, G.W - 40), G.rand(60, G.H - 200), 1.2, '#ffaa33');
  for (const e of G.enemies) G.damageEnemy(e, 45);
  if (G.boss) G.damageBoss(G.boss, 60);
};

G.drawPlayer = function (ctx) {
  const p = G.player;
  if (!p || !p.alive) return;
  const blink = p.invuln > 0 && !p.spawnShield && Math.floor(G.t * 20) % 2 === 0;
  if (!blink) G.drawJet(ctx, p.x, p.y, p.bank);
  G.drawShield(ctx, p);
  if (p.focus) {
    ctx.globalCompositeOperation = 'lighter';
    G.drawGlow(ctx, p.x, p.y, 10, '#ff4a6a', 1);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
};
