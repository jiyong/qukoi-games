'use strict';

const BTAU = Math.PI * 2;

function bpoly(ctx, pts) {
  ctx.beginPath();
  for (let i = 0; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
  ctx.closePath();
  ctx.fill();
}

function glowAt(ctx, x, y, r, color, a = 1) {
  ctx.globalCompositeOperation = 'lighter';
  G.drawGlow(ctx, x, y, r, color, a);
  ctx.globalCompositeOperation = 'source-over';
}

function turret(ctx, B, x, y, r, color) {
  const p = G.player;
  const a = p ? Math.atan2(p.y - (B.y + y), p.x - (B.x + x)) : Math.PI / 2;
  ctx.fillStyle = G.shade(color, -0.5);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, BTAU);
  ctx.fill();
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(a);
  ctx.fillStyle = '#222';
  ctx.fillRect(0, -2.5, r + 8, 5);
  ctx.restore();
  ctx.fillStyle = G.shade(color, 0.2);
  ctx.beginPath();
  ctx.arc(x, y, r * 0.55, 0, BTAU);
  ctx.fill();
}

function props(ctx, x, y, len) {
  ctx.strokeStyle = 'rgba(30,30,30,0.6)';
  ctx.lineWidth = 3;
  const a = G.t * 30;
  ctx.beginPath();
  ctx.moveTo(x - Math.cos(a) * len, y - Math.sin(a) * len * 0.3);
  ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len * 0.3);
  ctx.stroke();
}

G.BOSS_ART = {
  bomber(ctx, B, d) {
    const c = d.color;
    for (const x of [-62, -32, 32, 62]) glowAt(ctx, x, -28, 14, '#ff9a3a', 0.8);
    ctx.fillStyle = G.shade(c, -0.25);
    bpoly(ctx, [-98, -8, 98, -8, 88, 14, -88, 14]);
    ctx.fillRect(-36, -52, 72, 10);
    for (const x of [-62, -32, 32, 62]) {
      ctx.fillStyle = G.shade(c, -0.45);
      ctx.fillRect(x - 8, -22, 16, 44);
      props(ctx, x, 24, 16);
    }
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 56, 0, 0, BTAU);
    ctx.fill();
    ctx.fillStyle = '#9fd8ff';
    ctx.beginPath();
    ctx.ellipse(0, 38, 8, 10, 0, 0, BTAU);
    ctx.fill();
    ctx.fillStyle = '#c0392b';
    for (const x of [-78, 78]) {
      ctx.beginPath();
      ctx.arc(x, 2, 6, 0, BTAU);
      ctx.fill();
    }
    turret(ctx, B, -48, 16, 8, c);
    turret(ctx, B, 48, 16, 8, c);
  },
  heli(ctx, B, d) {
    const c = d.color;
    ctx.fillStyle = G.shade(c, -0.3);
    ctx.fillRect(-6, -95, 12, 60);
    ctx.fillRect(-22, -98, 44, 8);
    props(ctx, 0, -94, 24);
    ctx.fillRect(-70, -6, 140, 10);
    for (const x of [-62, 62]) {
      ctx.fillStyle = '#2b2b2b';
      ctx.fillRect(x - 9, -14, 18, 30);
      glowAt(ctx, x, 18, 8, d.accent, 0.6 + 0.4 * Math.sin(G.t * 9));
    }
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.ellipse(0, 0, 32, 48, 0, 0, BTAU);
    ctx.fill();
    ctx.fillStyle = '#9fd8ff';
    ctx.beginPath();
    ctx.ellipse(0, 26, 18, 14, 0, 0, BTAU);
    ctx.fill();
    turret(ctx, B, 0, 36, 9, c);
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(0, -4, 95, 0, BTAU);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(20,20,20,0.7)';
    ctx.lineWidth = 5;
    const a = G.t * 18;
    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const r = a + (i * BTAU) / 3;
      ctx.moveTo(0, -4);
      ctx.lineTo(Math.cos(r) * 95, -4 + Math.sin(r) * 95);
    }
    ctx.stroke();
  },
  fortress(ctx, B, d) {
    const c = d.color;
    for (const x of [-80, -40, 40, 80]) glowAt(ctx, x, -48, 16, d.accent, 0.8);
    ctx.fillStyle = G.shade(c, -0.4);
    bpoly(ctx, [-118, -20, -90, -48, 90, -48, 118, -20, 104, 34, -104, 34]);
    ctx.fillStyle = c;
    bpoly(ctx, [-96, -18, -76, -38, 76, -38, 96, -18, 84, 24, -84, 24]);
    ctx.strokeStyle = G.shade(c, -0.55);
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (const x of [-56, -20, 20, 56]) {
      ctx.moveTo(x, -36);
      ctx.lineTo(x, 22);
    }
    ctx.stroke();
    ctx.fillStyle = G.shade(c, 0.25);
    bpoly(ctx, [-30, -24, 30, -24, 36, 18, 0, 50, -36, 18]);
    const pulse = 0.6 + 0.4 * Math.sin(G.t * 5);
    glowAt(ctx, 0, 14, 22, d.accent, pulse);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, 14, 6, 0, BTAU);
    ctx.fill();
    for (const x of [-75, -38, 38, 75]) turret(ctx, B, x, 14, 9, c);
  },
  airship(ctx, B, d) {
    const c = d.color;
    for (const x of [-100, 100]) glowAt(ctx, x, -30, 18, d.accent, 0.7);
    ctx.fillStyle = G.shade(c, -0.4);
    bpoly(ctx, [-128, -10, -110, -44, -96, -10]);
    bpoly(ctx, [128, -10, 110, -44, 96, -10]);
    const grd = ctx.createLinearGradient(0, -50, 0, 50);
    grd.addColorStop(0, G.shade(c, 0.3));
    grd.addColorStop(1, G.shade(c, -0.4));
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.ellipse(0, -6, 120, 44, 0, 0, BTAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = -90; x <= 90; x += 30) {
      ctx.moveTo(x, -46 + Math.abs(x) * 0.12);
      ctx.lineTo(x, 34 - Math.abs(x) * 0.12);
    }
    ctx.stroke();
    ctx.fillStyle = '#2a2a33';
    ctx.fillRect(-46, 26, 92, 22);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 6; i++) G.drawGlow(ctx, -38 + i * 15, 37, 6, d.accent, 0.5 + 0.5 * Math.sin(G.t * 6 + i));
    ctx.globalCompositeOperation = 'source-over';
    for (const x of [-90, -45, 45, 90]) turret(ctx, B, x, 14, 8, c);
  },
  wing(ctx, B, d) {
    const c = d.color;
    const stealth = d.color === '#20202c';
    for (const x of [-26, 26]) glowAt(ctx, x, -30, 16, d.accent, 0.8);
    if (stealth) ctx.globalAlpha = 0.55 + 0.45 * Math.abs(Math.sin(G.t * 0.9));
    ctx.fillStyle = G.shade(c, -0.3);
    bpoly(ctx, [0, 42, 128, -18, 118, -30, 60, -22, 30, -36, 0, -26, -30, -36, -60, -22, -118, -30, -128, -18]);
    ctx.fillStyle = c;
    bpoly(ctx, [0, 36, 100, -14, 56, -16, 0, -18, -56, -16, -100, -14]);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = G.rgba(d.accent, 0.5 + 0.4 * Math.sin(G.t * 4));
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-104, -16);
    ctx.lineTo(0, 30);
    ctx.lineTo(104, -16);
    ctx.stroke();
    G.drawGlow(ctx, 0, 6, 20, d.accent, 0.7);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.ellipse(0, 6, 10, 14, 0, 0, BTAU);
    ctx.fill();
    turret(ctx, B, -70, -4, 7, c);
    turret(ctx, B, 70, -4, 7, c);
  },
  mech(ctx, B, d) {
    const c = d.color;
    for (const x of [-30, 30]) glowAt(ctx, x, -66, 20, '#ff6a1a', 0.9);
    ctx.fillStyle = G.shade(c, -0.4);
    for (const sx of [-1, 1]) {
      ctx.fillRect(sx * 58 - 16, -40, 32, 70);
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(sx * 70 - 6, 26, 12, 36);
      glowAt(ctx, sx * 70, 62, 10, d.accent, 0.5 + 0.5 * Math.sin(G.t * 10));
      ctx.fillStyle = G.shade(c, -0.4);
    }
    ctx.fillStyle = c;
    bpoly(ctx, [-44, -56, 44, -56, 52, 10, 30, 44, -30, 44, -52, 10]);
    ctx.fillStyle = G.shade(c, 0.2);
    bpoly(ctx, [-22, 4, 22, 4, 16, 34, -16, 34]);
    ctx.globalCompositeOperation = 'lighter';
    const lava = 0.5 + 0.5 * Math.sin(G.t * 3);
    ctx.strokeStyle = G.rgba('#ff6a1a', 0.5 + 0.5 * lava);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-40, -40);
    ctx.lineTo(-12, -10);
    ctx.lineTo(-30, 20);
    ctx.moveTo(40, -40);
    ctx.lineTo(12, -10);
    ctx.lineTo(30, 20);
    ctx.stroke();
    G.drawGlow(ctx, 0, 20, 16, '#ff3a1a', 0.8 + 0.2 * lava);
    G.drawGlow(ctx, -9, 20, 5, '#ffffff', 1);
    G.drawGlow(ctx, 9, 20, 5, '#ffffff', 1);
    ctx.globalCompositeOperation = 'source-over';
  },
  station(ctx, B, d) {
    const c = d.color;
    const rot = G.t * 0.5;
    ctx.strokeStyle = G.shade(c, -0.3);
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.ellipse(0, 0, 100, 70, 0, 0, BTAU);
    ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const a = rot + (i * BTAU) / 6;
      const x = Math.cos(a) * 100;
      const y = Math.sin(a) * 70;
      ctx.fillStyle = c;
      ctx.fillRect(x - 12, y - 9, 24, 18);
      glowAt(ctx, x, y, 9, i % 2 ? d.accent : '#66ccff', 0.8);
    }
    ctx.strokeStyle = G.shade(c, -0.1);
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = -rot * 0.6 + (i * BTAU) / 4;
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * 100, Math.sin(a) * 70);
    }
    ctx.stroke();
    ctx.fillStyle = G.shade(c, 0.2);
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, BTAU);
    ctx.fill();
    glowAt(ctx, 0, 0, 40, d.accent, 0.6 + 0.4 * Math.sin(G.t * 4));
    glowAt(ctx, 0, 0, 14, '#ffffff', 1);
  },
  core(ctx, B, d) {
    const pulse = 1 + 0.08 * Math.sin(G.t * 4);
    ctx.fillStyle = G.shade(d.color, -0.2);
    for (let i = 0; i < 8; i++) {
      const a = G.t * 0.7 + (i * BTAU) / 8;
      ctx.save();
      ctx.rotate(a);
      bpoly(ctx, [40, -10, 92 * pulse, 0, 40, 10]);
      ctx.restore();
    }
    ctx.fillStyle = d.color;
    ctx.beginPath();
    ctx.arc(0, 0, 52 * pulse, 0, BTAU);
    ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    G.drawGlow(ctx, 0, 0, 80 * pulse, d.accent, 0.55);
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = G.rgba(i === 1 ? '#66ccff' : d.accent, 0.6);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 70, 22, G.t * (1 + i * 0.4) + i, 0, BTAU);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
    const p = G.player;
    const a = p ? Math.atan2(p.y - B.y, p.x - B.x) : Math.PI / 2;
    ctx.fillStyle = '#fff4f8';
    ctx.beginPath();
    ctx.ellipse(0, 0, 26, 18, 0, 0, BTAU);
    ctx.fill();
    ctx.fillStyle = '#c0004a';
    ctx.beginPath();
    ctx.arc(Math.cos(a) * 10, Math.sin(a) * 6, 9, 0, BTAU);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(Math.cos(a) * 11, Math.sin(a) * 7, 4, 0, BTAU);
    ctx.fill();
  },
};

G.drawBoss = function (ctx) {
  const B = G.boss;
  if (!B || B.dead) return;
  ctx.save();
  const jit = B.dying ? 4 : 0;
  ctx.translate(B.x + G.rand(-jit, jit), B.y + G.rand(-jit, jit));
  G.BOSS_ART[B.d.art](ctx, B, B.d);
  if (B.hitT > 0 || B.transT > 0) {
    const a = B.transT > 0 ? 0.4 + 0.3 * Math.sin(G.t * 30) : 0.45;
    glowAt(ctx, 0, 0, Math.max(B.d.hw, B.d.hh) * 1.1, B.transT > 0 ? B.d.accent : '#ffffff', a);
  }
  ctx.restore();
};
