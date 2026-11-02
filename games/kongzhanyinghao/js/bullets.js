'use strict';

G.spawnEB = function (o) {
  const s = o.s * G.bulletMul;
  const b = {
    x: o.x,
    y: o.y,
    vx: Math.cos(o.a) * s,
    vy: Math.sin(o.a) * s,
    r: o.r || 5,
    color: o.color || '#ff3366',
    kind: o.kind || 'orb',
    accel: o.accel || 0,
    maxS: (o.maxS || 420) * G.bulletMul,
    turn: o.turn || 0,
    turnT: o.turnT || 99,
    home: o.home || 0,
    homeT: o.homeT || 1.4,
    split: o.split || null,
    t: 0,
    grazed: false,
  };
  G.eBullets.push(b);
  return b;
};

G.updateEB = function (dt) {
  const list = G.eBullets;
  const p = G.player;
  for (let i = list.length - 1; i >= 0; i--) {
    const b = list[i];
    b.t += dt;
    if (b.turn && b.t < b.turnT) {
      const c = Math.cos(b.turn * dt);
      const s = Math.sin(b.turn * dt);
      const vx = b.vx * c - b.vy * s;
      b.vy = b.vx * s + b.vy * c;
      b.vx = vx;
    }
    if (b.accel) {
      const sp = Math.hypot(b.vx, b.vy) || 1;
      const ns = G.clamp(sp + b.accel * dt, 30, b.maxS);
      b.vx *= ns / sp;
      b.vy *= ns / sp;
    }
    if (b.home && b.t < b.homeT && p && p.alive) {
      const sp = Math.hypot(b.vx, b.vy);
      const cur = Math.atan2(b.vy, b.vx);
      let diff = G.angTo(b.x, b.y, p.x, p.y) - cur;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      const na = cur + G.clamp(diff, -b.home * dt, b.home * dt);
      b.vx = Math.cos(na) * sp;
      b.vy = Math.sin(na) * sp;
    }
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (b.split && b.t >= b.split.t) {
      const sp = b.split;
      G.pat.ring(b.x, b.y, sp.n, sp.s, Math.random() * 6.28, { color: sp.color || b.color, r: 4 });
      G.fx.flash(b.x, b.y, 30, b.color, 0.25);
      list[i] = list[list.length - 1];
      list.pop();
      continue;
    }
    if (b.x < -40 || b.x > G.W + 40 || b.y < -60 || b.y > G.H + 40 || b.t > 14) {
      list[i] = list[list.length - 1];
      list.pop();
    }
  }
};

G.drawEB = function (ctx) {
  const list = G.eBullets;
  ctx.globalCompositeOperation = 'lighter';
  for (const b of list) G.drawGlow(ctx, b.x, b.y, b.r * (b.kind === 'big' ? 3.2 : 2.6), b.color, 0.85);
  ctx.globalCompositeOperation = 'source-over';
  for (const b of list) {
    if (b.kind === 'needle') {
      const a = Math.atan2(b.vy, b.vx);
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(a);
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, b.r * 2.2, b.r * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(0, 0, b.r * 1.5, b.r * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      continue;
    }
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r * (b.kind === 'big' ? 0.7 : 0.55), 0, Math.PI * 2);
    ctx.fill();
  }
};
