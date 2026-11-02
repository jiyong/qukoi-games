'use strict';

const GRAZE_R = 20;

function hitTargets() {
  const B = G.boss;
  for (const b of G.pBullets) {
    if (b.dead) continue;
    for (const e of G.enemies) {
      if (e.dead || e.y < -10) continue;
      const rr = e.r + (b.kind === 'laser' ? b.w : 5);
      if (G.d2(b.x, b.y, e.x, e.y) > rr * rr) continue;
      if (b.kind === 'laser') {
        if (b.hit.has(e)) continue;
        b.hit.add(e);
      } else {
        b.dead = true;
      }
      G.damageEnemy(e, b.dmg);
      G.fx.sparks(b.x, b.y, 2, '#ffe08a', 140, 0.2);
      if (b.dead) break;
    }
    if (b.dead || !B || B.dead || !G.bossInside(B, b.x, b.y)) continue;
    b.dead = true;
    const hurt = G.damageBoss(B, b.dmg);
    if (Math.random() < 0.5) G.fx.sparks(b.x, b.y, 2, hurt ? '#ffe08a' : '#88aaff', 160, 0.25);
    if (hurt) G.audio.play('hit', 0.07);
  }
}

function hitPlayer() {
  const p = G.player;
  if (!p.alive) return;
  const list = G.eBullets;
  for (let i = list.length - 1; i >= 0; i--) {
    const b = list[i];
    const d = G.d2(b.x, b.y, p.x, p.y);
    const hr = p.r + b.r * 0.65;
    if (d < hr * hr) {
      if (p.invuln > 0) continue;
      list[i] = list[list.length - 1];
      list.pop();
      G.playerHit();
      return;
    }
    if (!b.grazed && d < GRAZE_R * GRAZE_R) {
      b.grazed = true;
      G.score += 20;
      G.fx.sparks(p.x, p.y, 1, '#ffffff', 120, 0.2);
      G.audio.play('graze', 0.05);
    }
  }
  if (p.invuln > 0) return;
  if (G.laserHits(p.x, p.y, p.r)) return G.playerHit();
  for (const e of G.enemies) {
    const rr = e.r * 0.7 + p.r;
    if (!e.dead && G.d2(e.x, e.y, p.x, p.y) < rr * rr) {
      G.damageEnemy(e, 20);
      return G.playerHit();
    }
  }
  const B = G.boss;
  if (B && !B.dead && !B.dying && G.bossInside(B, p.x, p.y, -12)) G.playerHit();
}

G.collide = function () {
  hitTargets();
  hitPlayer();
};
