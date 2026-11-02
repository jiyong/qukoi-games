'use strict';

G.drawJet = function (ctx, x, y, bank, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale * (1 - Math.abs(bank) * 0.18), scale);
  const flame = 10 + Math.sin(G.t * 50) * 3;
  ctx.globalCompositeOperation = 'lighter';
  G.drawGlow(ctx, -5, 18, 9, '#4aa8ff', 0.9);
  G.drawGlow(ctx, 5, 18, 9, '#4aa8ff', 0.9);
  ctx.fillStyle = '#9fe0ff';
  for (const ex of [-5, 5]) {
    ctx.beginPath();
    ctx.moveTo(ex - 3, 16);
    ctx.lineTo(ex, 16 + flame);
    ctx.lineTo(ex + 3, 16);
    ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#2e4a6e';
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.lineTo(24, 8);
  ctx.lineTo(24, 13);
  ctx.lineTo(6, 10);
  ctx.lineTo(-6, 10);
  ctx.lineTo(-24, 13);
  ctx.lineTo(-24, 8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d8e4f0';
  ctx.beginPath();
  ctx.moveTo(0, -24);
  ctx.lineTo(6, -8);
  ctx.lineTo(8, 16);
  ctx.lineTo(-8, 16);
  ctx.lineTo(-6, -8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#e8414a';
  ctx.fillRect(-11, 12, 4, 7);
  ctx.fillRect(7, 12, 4, 7);
  ctx.fillRect(-23, 7, 4, 3);
  ctx.fillRect(19, 7, 4, 3);
  const cg = ctx.createLinearGradient(0, -16, 0, -2);
  cg.addColorStop(0, '#bff4ff');
  cg.addColorStop(1, '#1f6fae');
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.ellipse(0, -9, 3.4, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

G.drawShield = function (ctx, p) {
  const lv = p.shield;
  const spawn = p.invuln > 0 && p.spawnShield;
  if (lv <= 0 && !spawn && p.shieldHitT <= 0) return;
  const R = 32;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.globalCompositeOperation = 'lighter';
  const pulse = 0.75 + 0.25 * Math.sin(G.t * 6);
  const col = spawn && lv <= 0 ? '#ffe66a' : '#4ae8ff';
  G.drawGlow(ctx, 0, 0, R * 1.5, col, 0.35 * pulse);
  for (let ring = 0; ring < Math.max(1, lv); ring++) {
    const rr = R - ring * 5;
    const rot = G.t * (ring % 2 ? -1.6 : 1.2);
    ctx.strokeStyle = G.rgba(col, 0.7 * pulse);
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 6; i++) {
      const a = rot + (i / 6) * Math.PI * 2;
      ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const a = rot + (i / 6) * Math.PI * 2;
      G.drawGlow(ctx, Math.cos(a) * rr, Math.sin(a) * rr, 6, col, pulse);
    }
  }
  ctx.strokeStyle = G.rgba(col, 0.35);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, R + 4 + Math.sin(G.t * 3) * 2, 0, Math.PI * 2);
  ctx.stroke();
  if (p.shieldHitT > 0) {
    const k = 1 - p.shieldHitT / 0.4;
    ctx.strokeStyle = G.rgba('#ffffff', 1 - k);
    ctx.lineWidth = 6 * (1 - k);
    ctx.beginPath();
    ctx.arc(0, 0, R + k * 30, 0, Math.PI * 2);
    ctx.stroke();
    G.drawGlow(ctx, 0, 0, R * 2, '#ffffff', 0.6 * (1 - k));
  }
  ctx.restore();
};

G.drawPB = function (ctx) {
  ctx.globalCompositeOperation = 'lighter';
  for (const b of G.pBullets) {
    if (b.kind === 'vulcan') {
      const a = Math.atan2(b.vy, b.vx);
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(a);
      G.drawGlow(ctx, 0, 0, 12, '#ff8a2a', 0.5);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#ff9a2a';
      ctx.beginPath();
      ctx.ellipse(0, 0, 9, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff3c0';
      ctx.beginPath();
      ctx.ellipse(2, 0, 5, 1.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'lighter';
      ctx.restore();
    } else if (b.kind === 'laser') {
      ctx.fillStyle = 'rgba(58,216,255,0.35)';
      ctx.fillRect(b.x - b.w, b.y - 16, b.w * 2, 34);
      ctx.fillStyle = '#bff4ff';
      ctx.fillRect(b.x - b.w / 3, b.y - 16, (b.w * 2) / 3, 34);
    } else {
      const a = Math.atan2(b.vy, b.vx);
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(a);
      G.drawGlow(ctx, -6, 0, 10, '#5dff7a', 0.9);
      ctx.fillStyle = '#e8ffe8';
      ctx.fillRect(-5, -2, 10, 4);
      ctx.restore();
    }
  }
  ctx.globalCompositeOperation = 'source-over';
};
