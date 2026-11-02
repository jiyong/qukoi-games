'use strict';

G.WEAPONS = {
  vulcan: { name: '火神炮', color: '#ff8a2a' },
  laser: { name: '光子激光', color: '#3ad8ff' },
  missile: { name: '追踪导弹', color: '#5dff7a' },
};

const VULCAN_ANGLES = [
  [-0.03, 0.03],
  [-0.12, -0.03, 0.03, 0.12],
  [-0.22, -0.11, 0, 0.11, 0.22],
  [-0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.3],
  [-0.42, -0.31, -0.2, -0.1, 0, 0.1, 0.2, 0.31, 0.42],
];
const LASER_LANES = [[0], [-6, 6], [-10, 0, 10], [-14, -5, 5, 14], [-18, -9, 0, 9, 18]];
const MISSILE_COUNT = [2, 2, 4, 4, 6];

function pb(x, y, a, s, dmg, kind, extra) {
  G.pBullets.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, dmg, kind, t: 0, ...extra });
}

G.weapons = {
  fire(p, dt) {
    p.fireT -= dt;
    p.missileT -= dt;
    const lv = p.power - 1;
    const up = -Math.PI / 2;
    if (p.fireT > 0) return;
    if (p.weapon === 'vulcan') {
      p.fireT = 0.075;
      VULCAN_ANGLES[lv].forEach((a, i) => pb(p.x + (i % 2 ? 5 : -5), p.y - 16, up + a, 760, 1, 'vulcan'));
    } else if (p.weapon === 'laser') {
      p.fireT = 0.05;
      const w = 3 + lv;
      LASER_LANES[lv].forEach((off) => pb(p.x + off, p.y - 20, up, 1100, 0.9, 'laser', { w, hit: new Set() }));
    } else {
      p.fireT = 0.1;
      const n = p.power >= 3 ? 4 : 2;
      for (let i = 0; i < n; i++) pb(p.x - 9 + (18 * i) / (n - 1), p.y - 14, up, 720, 1, 'vulcan');
      if (p.missileT <= 0) {
        p.missileT = 0.42;
        const m = MISSILE_COUNT[lv];
        for (let i = 0; i < m; i++) {
          const side = i % 2 ? 1 : -1;
          const a = up + side * (0.6 + Math.floor(i / 2) * 0.35);
          pb(p.x + side * 12, p.y, a, 260, 4, 'missile', { target: null });
        }
      }
    }
    G.audio.play('shoot', 0.09);
  },

  update(dt) {
    const list = G.pBullets;
    for (let i = list.length - 1; i >= 0; i--) {
      const b = list[i];
      b.t += dt;
      if (b.kind === 'missile') steerMissile(b, dt);
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.dead || b.y < -40 || b.y > G.H + 40 || b.x < -40 || b.x > G.W + 40 || b.t > 4) {
        list[i] = list[list.length - 1];
        list.pop();
      }
    }
  },
};

function steerMissile(b, dt) {
  if (!b.target || b.target.dead) b.target = G.nearestTarget(b.x, b.y);
  const sp = Math.min(820, Math.hypot(b.vx, b.vy) + 900 * dt);
  let a = Math.atan2(b.vy, b.vx);
  if (b.target) {
    let d = G.angTo(b.x, b.y, b.target.x, b.target.y) - a;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    a += G.clamp(d, -8 * dt, 8 * dt);
  }
  b.vx = Math.cos(a) * sp;
  b.vy = Math.sin(a) * sp;
  G.fx.trail(b.x, b.y, '#5dff7a', 5, 0.25);
}

G.nearestTarget = function (x, y) {
  let best = null;
  let bd = Infinity;
  for (const e of G.enemies) {
    if (e.dead || e.y < 0) continue;
    const d = G.d2(x, y, e.x, e.y);
    if (d < bd) {
      bd = d;
      best = e;
    }
  }
  const B = G.boss;
  if (B && !B.dead && !B.entering && G.d2(x, y, B.x, B.y) < bd) best = B;
  return best;
};
