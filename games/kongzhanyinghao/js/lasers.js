'use strict';

const LASER_LEN = 1000;

G.spawnLaser = function (o) {
  G.lasers.push({
    owner: o.owner || null,
    x: o.x,
    y: o.y,
    offx: o.offx || 0,
    offy: o.offy || 0,
    a: o.a,
    w: o.w || 18,
    warn: o.warn || 0.9,
    dur: o.dur || 1.2,
    spin: o.spin || 0,
    spinWarn: o.spinWarn || false,
    color: o.color || '#ff3a6a',
    t: 0,
    sounded: false,
  });
};

G.updateLasers = function (dt) {
  const list = G.lasers;
  for (let i = list.length - 1; i >= 0; i--) {
    const L = list[i];
    L.t += dt;
    if (L.owner) {
      if (L.owner.dead) L.t = Math.max(L.t, L.warn + L.dur);
      L.x = L.owner.x + L.offx;
      L.y = L.owner.y + L.offy;
    }
    const active = L.t >= L.warn;
    if (active || L.spinWarn) L.a += L.spin * dt;
    if (active && !L.sounded) {
      L.sounded = true;
      G.audio.play('laser', 0.1);
    }
    if (L.t >= L.warn + L.dur) {
      list[i] = list[list.length - 1];
      list.pop();
    }
  }
};

function laserWidth(L) {
  const k = L.t - L.warn;
  if (k < 0) return 0;
  const grow = Math.min(1, k / 0.12);
  const fade = Math.min(1, (L.dur - k) / 0.2);
  return L.w * grow * fade;
}

G.laserHits = function (px, py, pr) {
  for (const L of G.lasers) {
    const w = laserWidth(L);
    if (w < L.w * 0.5) continue;
    const dx = px - L.x;
    const dy = py - L.y;
    const along = dx * Math.cos(L.a) + dy * Math.sin(L.a);
    if (along < 0) continue;
    const perp = Math.abs(-dx * Math.sin(L.a) + dy * Math.cos(L.a));
    if (perp < w * 0.35 + pr) return true;
  }
  return false;
};

G.drawLasers = function (ctx) {
  for (const L of G.lasers) {
    ctx.save();
    ctx.translate(L.x, L.y);
    ctx.rotate(L.a);
    if (L.t < L.warn) {
      const blink = 0.35 + 0.35 * Math.sin(L.t * 40);
      ctx.fillStyle = G.rgba(L.color, blink);
      ctx.fillRect(0, -1, LASER_LEN, 2);
      ctx.fillStyle = G.rgba(L.color, 0.08);
      ctx.fillRect(0, -L.w / 2, LASER_LEN, L.w);
      ctx.restore();
      continue;
    }
    const w = laserWidth(L);
    const flick = 1 + 0.12 * Math.sin(G.t * 60);
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = G.rgba(L.color, 0.25);
    ctx.fillRect(0, (-w * 1.6 * flick) / 2, LASER_LEN, w * 1.6 * flick);
    ctx.fillStyle = G.rgba(L.color, 0.8);
    ctx.fillRect(0, -w / 2, LASER_LEN, w);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, -w / 5, LASER_LEN, (w * 2) / 5);
    G.drawGlow(ctx, 0, 0, w * 2.2, L.color, 1);
    ctx.restore();
  }
  ctx.globalCompositeOperation = 'source-over';
};
