'use strict';

G.fx = (() => {
  const list = [];
  const MAX = 1600;
  const TAU = Math.PI * 2;

  function add(p) {
    if (list.length < MAX) list.push(p);
  }

  function sparks(x, y, n, color, spd = 220, life = 0.5, size = 2) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU;
      const v = spd * (0.3 + Math.random());
      add({ k: 'spark', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, life: life * (0.5 + Math.random() * 0.8), color, size });
    }
  }

  const flash = (x, y, r, color, life = 0.25) => add({ k: 'glow', x, y, r, color, life, t: 0 });
  const ring = (x, y, r0, r1, color, life = 0.5, w = 4) => add({ k: 'ring', x, y, r0, r1, color, life, t: 0, w });
  const text = (x, y, str, color = '#ffffff', size = 14) => add({ k: 'text', x, y, vy: -40, str, color, size, life: 0.9, t: 0 });
  const trail = (x, y, color, r = 4, life = 0.3) => add({ k: 'glow', x, y, r, color, life, t: 0, shrink: true });

  function debris(x, y, n, color) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU;
      const v = G.rand(60, 220);
      add({ k: 'deb', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, rot: Math.random() * TAU, vr: G.rand(-10, 10), size: G.rand(2, 6), t: 0, life: G.rand(0.6, 1.3), color });
    }
  }

  function smoke(x, y, n, size = 14) {
    for (let i = 0; i < n; i++) {
      add({ k: 'smoke', x: x + G.rand(-10, 10), y: y + G.rand(-10, 10), vx: G.rand(-20, 20), vy: G.rand(20, 60), r: size * G.rand(0.6, 1.2), t: 0, life: G.rand(0.7, 1.4) });
    }
  }

  function explode(x, y, size = 1, color = '#ffaa33') {
    flash(x, y, 46 * size, color, 0.4);
    flash(x, y, 20 * size, '#ffffff', 0.16);
    sparks(x, y, Math.round(16 * size), color, 260 * Math.sqrt(size), 0.6);
    sparks(x, y, Math.round(6 * size), '#ffffff', 180 * Math.sqrt(size), 0.35, 1.5);
    debris(x, y, Math.round(4 * size), '#7a7f8a');
    ring(x, y, 6, 50 * size, color, 0.45, 3 * Math.sqrt(size));
    smoke(x, y, Math.round(3 * size), 12 * Math.sqrt(size));
  }

  function update(dt) {
    const drag = Math.exp(-3 * dt);
    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i];
      p.t += dt;
      if (p.t >= p.life) {
        list[i] = list[list.length - 1];
        list.pop();
        continue;
      }
      if (p.vx !== undefined) {
        p.x += p.vx * dt;
        p.vx *= drag;
      }
      if (p.vy !== undefined) {
        p.y += p.vy * dt;
        if (p.k !== 'text') p.vy *= drag;
      }
      if (p.rot !== undefined) p.rot += p.vr * dt;
    }
  }

  function draw(ctx) {
    for (const p of list) {
      if (p.k !== 'smoke') continue;
      const k = p.t / p.life;
      ctx.globalAlpha = 0.35 * (1 - k);
      ctx.fillStyle = '#3a3a44';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * (1 + k * 1.5), 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (const p of list) {
      if (p.k !== 'deb') continue;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = 1 - p.t / p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    }
    drawAdditive(ctx);
    drawText(ctx);
  }

  function drawAdditive(ctx) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (const p of list) {
      const k = p.t / p.life;
      if (p.k === 'glow') {
        const r = p.shrink ? p.r * (1 - k) : p.r * (1 + 0.6 * k);
        G.drawGlow(ctx, p.x, p.y, r, p.color, 1 - k);
      } else if (p.k === 'spark') {
        ctx.globalAlpha = 1 - k;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 0.04, p.y - p.vy * 0.04);
        ctx.stroke();
      } else if (p.k === 'ring') {
        const e = 1 - Math.pow(1 - k, 3);
        ctx.globalAlpha = 1 - k;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.w * (1 - k) + 0.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, G.lerp(p.r0, p.r1, e), 0, TAU);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawText(ctx) {
    ctx.textAlign = 'center';
    for (const p of list) {
      if (p.k !== 'text') continue;
      ctx.globalAlpha = 1 - p.t / p.life;
      ctx.font = `bold ${p.size}px "PingFang SC", "Microsoft YaHei", sans-serif`;
      ctx.fillStyle = p.color;
      ctx.fillText(p.str, p.x, p.y);
    }
    ctx.globalAlpha = 1;
  }

  const clear = () => {
    list.length = 0;
  };

  return { sparks, flash, ring, text, trail, debris, smoke, explode, update, draw, clear };
})();
