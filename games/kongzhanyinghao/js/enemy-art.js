'use strict';

G.shade = function (hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k);
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
};

G.ENEMY_TYPES = {
  scout: { hp: 3, r: 14, score: 100, color: '#c0392b', art: 'fighter', size: 0.8 },
  fighter: { hp: 7, r: 16, score: 200, color: '#2d7d46', art: 'fighter', size: 1 },
  kamikaze: { hp: 4, r: 13, score: 150, color: '#e67e22', art: 'dart', size: 0.9 },
  gunship: { hp: 28, r: 24, score: 600, color: '#5d6d7e', art: 'heli', size: 1 },
  bomber: { hp: 60, r: 32, score: 1200, color: '#7a6640', art: 'bomber', size: 1 },
  turret: { hp: 45, r: 26, score: 900, color: '#7a2f5a', art: 'saucer', size: 1 },
  carrier: { hp: 14, r: 18, score: 300, color: '#d4ac0d', art: 'carrier', size: 1 },
  ace: { hp: 40, r: 18, score: 1500, color: '#2b2b38', art: 'fighter', size: 1.25 },
  heavy: { hp: 700, r: 56, score: 8000, color: '#3b4a5a', art: 'bomber', size: 1.9 },
};

function engine(ctx, x, y, r, color = '#ff9a3a') {
  ctx.globalCompositeOperation = 'lighter';
  G.drawGlow(ctx, x, y, r * (0.85 + Math.sin(G.t * 40) * 0.15), color, 0.9);
  ctx.globalCompositeOperation = 'source-over';
}

function poly(ctx, pts) {
  ctx.beginPath();
  for (let i = 0; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
  ctx.closePath();
  ctx.fill();
}

G.ENEMY_ART = {
  fighter(ctx, e) {
    engine(ctx, 0, -18, 8);
    ctx.fillStyle = G.shade(e.color, -0.3);
    poly(ctx, [0, 8, 22, -4, 22, -9, 0, -5, -22, -9, -22, -4]);
    ctx.fillStyle = e.color;
    poly(ctx, [0, 22, 5, 8, 4, -16, -4, -16, -5, 8]);
    ctx.fillRect(-10, -17, 20, 4);
    ctx.fillStyle = e.type === 'ace' ? '#ff3a3a' : '#ffd27a';
    ctx.beginPath();
    ctx.ellipse(0, 4, 2.5, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  },
  dart(ctx, e) {
    engine(ctx, 0, -14, 12, '#ff5a1a');
    ctx.fillStyle = e.color;
    poly(ctx, [0, 18, 13, -12, 0, -6, -13, -12]);
    ctx.fillStyle = '#ffe08a';
    poly(ctx, [0, 12, 4, -2, -4, -2]);
  },
  heli(ctx, e) {
    ctx.fillStyle = G.shade(e.color, -0.3);
    ctx.fillRect(-3, -34, 6, 26);
    ctx.fillRect(-9, -36, 18, 4);
    ctx.fillRect(-22, -2, 44, 5);
    ctx.fillStyle = e.color;
    ctx.beginPath();
    ctx.ellipse(0, 4, 12, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#9fd8ff';
    ctx.beginPath();
    ctx.ellipse(0, 13, 7, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(20,20,20,0.55)';
    ctx.lineWidth = 3;
    const a = G.t * 26;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 30, Math.sin(a) * 30);
    ctx.lineTo(-Math.cos(a) * 30, -Math.sin(a) * 30);
    ctx.moveTo(Math.cos(a + 1.57) * 30, Math.sin(a + 1.57) * 30);
    ctx.lineTo(-Math.cos(a + 1.57) * 30, -Math.sin(a + 1.57) * 30);
    ctx.stroke();
  },
  bomber(ctx, e) {
    for (const x of [-22, 22]) engine(ctx, x, -14, 10);
    ctx.fillStyle = G.shade(e.color, -0.3);
    poly(ctx, [-44, -2, 44, -2, 38, 10, -38, 10]);
    ctx.fillRect(-18, -26, 36, 6);
    for (const x of [-22, 22]) ctx.fillRect(x - 5, -10, 10, 22);
    ctx.fillStyle = e.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd27a';
    ctx.beginPath();
    ctx.ellipse(0, 20, 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  },
  saucer(ctx, e) {
    ctx.fillStyle = G.shade(e.color, -0.35);
    ctx.beginPath();
    ctx.ellipse(0, 0, 28, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = e.color;
    ctx.beginPath();
    ctx.ellipse(0, -2, 22, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 6; i++) {
      const a = G.t * 3 + (i / 6) * Math.PI * 2;
      G.drawGlow(ctx, Math.cos(a) * 24, Math.sin(a) * 11, 6, '#ff66cc', 0.9);
    }
    G.drawGlow(ctx, 0, -3, 14, '#ff9ae0', 0.6);
    ctx.globalCompositeOperation = 'source-over';
  },
  carrier(ctx, e) {
    engine(ctx, 0, -16, 9);
    ctx.fillStyle = G.shade(e.color, -0.3);
    poly(ctx, [-26, -2, 26, -2, 22, 8, -22, 8]);
    ctx.fillStyle = e.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★', 0, 5);
  },
};

G.drawEnemy = function (ctx, e) {
  ctx.save();
  ctx.translate(e.x, e.y);
  if (e.rot) ctx.rotate(e.rot);
  ctx.scale(e.size, e.size);
  G.ENEMY_ART[e.art](ctx, e);
  if (e.hitT > 0) {
    ctx.globalCompositeOperation = 'lighter';
    G.drawGlow(ctx, 0, 0, e.r * 1.4, '#ffffff', 0.8);
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
  if (e.maxHp >= 50 && e.hp < e.maxHp) {
    const w = e.r * 1.6;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(e.x - w / 2, e.y - e.r - 12, w, 4);
    ctx.fillStyle = '#ff4a3a';
    ctx.fillRect(e.x - w / 2, e.y - e.r - 12, (w * e.hp) / e.maxHp, 4);
  }
};

G.drawEnemies = function (ctx) {
  for (const e of G.enemies) G.drawEnemy(ctx, e);
};
