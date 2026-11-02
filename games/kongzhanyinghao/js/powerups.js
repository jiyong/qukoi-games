'use strict';

const WEAPON_CYCLE = ['vulcan', 'laser', 'missile'];
const PU = {
  P: { color: '#ff4a3a', label: 'P' },
  S: { color: '#3ad8ff', label: 'S' },
  B: { color: '#ffb000', label: 'B' },
  L: { color: '#ff6ad5', label: '1UP' },
  M: { color: '#ffd700', label: '' },
};
const MAGNET = 80;

G.spawnPowerup = function (kind, x, y) {
  G.powerups.push({ kind, x, y, vx: G.rand(-50, 50), vy: -90, t: 0, wi: G.randi(0, 2) });
};

function puColor(u) {
  return u.kind === 'W' ? G.WEAPONS[WEAPON_CYCLE[u.wi]].color : PU[u.kind].color;
}

G.updatePowerups = function (dt) {
  const p = G.player;
  const list = G.powerups;
  for (let i = list.length - 1; i >= 0; i--) {
    const u = list[i];
    u.t += dt;
    if (u.kind === 'W' && Math.floor(u.t / 1.8) !== u.lastCycle) {
      u.lastCycle = Math.floor(u.t / 1.8);
      if (u.t > 0.1) u.wi = (u.wi + 1) % 3;
    }
    u.vy = Math.min(70, u.vy + 140 * dt);
    u.vx *= Math.exp(-1.2 * dt);
    if (p.alive) {
      const d2 = G.d2(u.x, u.y, p.x, p.y);
      if (d2 < MAGNET * MAGNET) {
        const a = G.angTo(u.x, u.y, p.x, p.y);
        u.x += Math.cos(a) * 380 * dt;
        u.y += Math.sin(a) * 380 * dt;
      }
      if (d2 < 24 * 24) {
        collect(u, p);
        list[i] = list[list.length - 1];
        list.pop();
        continue;
      }
    }
    u.x += u.vx * dt;
    u.y += u.vy * dt;
    if (u.x < 14 || u.x > G.W - 14) u.vx = -u.vx;
    u.x = G.clamp(u.x, 14, G.W - 14);
    if (u.y > G.H + 30) {
      list[i] = list[list.length - 1];
      list.pop();
    }
  }
};

function collect(u, p) {
  const color = puColor(u);
  let msg = '';
  if (u.kind === 'P') {
    if (p.power < 5) p.power++;
    else G.score += 5000;
    msg = p.power >= 5 ? '火力 MAX' : '火力提升';
  } else if (u.kind === 'S') {
    p.shield = Math.min(3, p.shield + 1);
    p.spawnShield = false;
    msg = '护盾 +1';
    G.audio.play('shield');
    G.fx.ring(p.x, p.y, 10, 70, '#4ae8ff', 0.5, 4);
  } else if (u.kind === 'B') {
    p.bombs = Math.min(5, p.bombs + 1);
    msg = '炸弹 +1';
  } else if (u.kind === 'W') {
    const w = WEAPON_CYCLE[u.wi];
    if (p.weapon === w && p.power < 5) p.power++;
    p.weapon = w;
    msg = G.WEAPONS[w].name;
  } else if (u.kind === 'L') {
    p.lives = Math.min(5, p.lives + 1);
    msg = '奖命 +1';
  } else {
    G.score += 500;
    G.fx.text(u.x, u.y, '500', '#ffd700', 12);
    G.audio.play('graze', 0.02);
    return;
  }
  G.fx.text(p.x, p.y - 30, msg, color, 15);
  G.fx.sparks(u.x, u.y, 14, color, 200, 0.4);
  if (u.kind !== 'S') G.audio.play('power');
}

G.drawPowerups = function (ctx) {
  for (const u of G.powerups) {
    const color = puColor(u);
    const bob = Math.sin(u.t * 5) * 2;
    ctx.save();
    ctx.translate(u.x, u.y + bob);
    ctx.globalCompositeOperation = 'lighter';
    G.drawGlow(ctx, 0, 0, 22, color, 0.6 + 0.3 * Math.sin(u.t * 8));
    ctx.globalCompositeOperation = 'source-over';
    if (u.kind === 'M') {
      ctx.scale(Math.abs(Math.cos(u.t * 4)) * 0.9 + 0.1, 1);
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff3a0';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      continue;
    }
    ctx.rotate(Math.sin(u.t * 2) * 0.2);
    ctx.fillStyle = 'rgba(10,16,30,0.85)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-13, -10, 26, 20, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.font = `bold ${u.kind === 'L' ? 9 : 13}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const label = u.kind === 'W' ? G.WEAPONS[WEAPON_CYCLE[u.wi]].name[0] : PU[u.kind].label;
    ctx.fillText(label, 0, 1);
    ctx.textBaseline = 'alphabetic';
    ctx.restore();
  }
};
