'use strict';

G.FONT = '"PingFang SC", "Microsoft YaHei", "Heiti SC", sans-serif';

G.text = function (ctx, str, x, y, size, color, align = 'left', glow = null) {
  ctx.font = `bold ${size}px ${G.FONT}`;
  ctx.textAlign = align;
  if (glow) {
    ctx.shadowColor = glow;
    ctx.shadowBlur = 14;
  }
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillText(str, x + 1, y + 2);
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
  ctx.shadowBlur = 0;
};

function pips(ctx, x, y, n, max, color, draw) {
  for (let i = 0; i < max; i++) draw(ctx, x + i * 18, y, i < n ? color : 'rgba(255,255,255,0.15)');
}

const lifeIcon = (ctx, x, y, c) => {
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.moveTo(x, y - 7);
  ctx.lineTo(x + 7, y + 5);
  ctx.lineTo(x, y + 2);
  ctx.lineTo(x - 7, y + 5);
  ctx.closePath();
  ctx.fill();
};
const bombIcon = (ctx, x, y, c) => {
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x - 2, y - 10, 4, 4);
};
const shieldIcon = (ctx, x, y, c) => {
  ctx.strokeStyle = c;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= 6; i++) ctx.lineTo(x + Math.cos((i / 6) * Math.PI * 2) * 6, y + Math.sin((i / 6) * Math.PI * 2) * 6);
  ctx.stroke();
};

G.drawHUD = function (ctx) {
  const p = G.player;
  G.text(ctx, String(G.score).padStart(8, '0'), 12, 26, 18, '#ffffff');
  G.text(ctx, '最高 ' + Math.max(G.hi, G.score), 12, 44, 11, '#9fb4d0');
  G.text(ctx, `第${G.level + 1}关 ${G.levelDef.name}`, G.W - 12, 26, 13, '#ffe08a', 'right');
  const by = G.H - 16;
  pips(ctx, 18, by - 22, Math.max(0, p.lives), 5, '#ff6a6a', lifeIcon);
  pips(ctx, 18, by, p.bombs, 5, '#ffb000', bombIcon);
  pips(ctx, 116, by - 22, p.shield, 3, '#4ae8ff', shieldIcon);
  const w = G.WEAPONS[p.weapon];
  G.text(ctx, w.name, G.W - 12, by - 16, 13, w.color, 'right');
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i < p.power ? w.color : 'rgba(255,255,255,0.15)';
    ctx.fillRect(G.W - 90 + i * 16, by - 6, 12, 6);
  }
  if (G.boss && !G.boss.dead) drawBossBar(ctx, G.boss);
  drawBanners(ctx);
};

function drawBossBar(ctx, B) {
  const x = 50;
  const y = 74;
  const w = G.W - 100;
  const show = B.entering ? Math.min(1, B.enterT / 1.5) : 1;
  const left = B.d.phases.length - B.phase - 1;
  G.text(ctx, `${B.d.title} · ${B.d.name}`, x, y - 6, 12, '#ffffff');
  for (let i = 0; i < left; i++) bombIcon(ctx, x + w - 6 - i * 14, y - 10, B.d.accent);
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(x - 2, y - 2, w + 4, 10);
  const k = B.dying ? 0 : Math.max(0, B.hp / B.maxHp) * show;
  const grd = ctx.createLinearGradient(x, 0, x + w, 0);
  grd.addColorStop(0, '#ff3a3a');
  grd.addColorStop(1, B.d.accent);
  ctx.fillStyle = grd;
  ctx.fillRect(x, y, w * k, 6);
}

function drawBanners(ctx) {
  if (G.bannerT > 0) {
    const a = Math.min(1, G.bannerT, (3.2 - G.bannerT) * 3);
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, G.H * 0.38, G.W, 90);
    G.text(ctx, `第 ${G.level + 1} 关`, G.W / 2, G.H * 0.38 + 36, 26, '#ffe08a', 'center', '#ff9a3a');
    G.text(ctx, G.levelDef.name, G.W / 2, G.H * 0.38 + 70, 20, '#ffffff', 'center');
    ctx.globalAlpha = 1;
  }
  if (G.phase === 'warning') {
    const blink = 0.5 + 0.5 * Math.sin(G.t * 10);
    ctx.fillStyle = `rgba(255,0,40,${0.12 + 0.12 * blink})`;
    ctx.fillRect(0, 0, G.W, G.H);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, G.H * 0.4, G.W, 80);
    ctx.fillStyle = '#ff2a4a';
    for (let x = -40 + ((G.t * 120) % 40); x < G.W; x += 40) {
      ctx.fillRect(x, G.H * 0.4, 20, 6);
      ctx.fillRect(x, G.H * 0.4 + 74, 20, 6);
    }
    ctx.globalAlpha = 0.6 + 0.4 * blink;
    G.text(ctx, 'WARNING', G.W / 2, G.H * 0.4 + 44, 34, '#ff4a5a', 'center', '#ff0030');
    const d = G.BOSSES[G.levelDef.boss];
    G.text(ctx, `${d.title}「${d.name}」接近中`, G.W / 2, G.H * 0.4 + 66, 13, '#ffffff', 'center');
    ctx.globalAlpha = 1;
  }
}
