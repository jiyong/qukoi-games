(function (root) {
  'use strict';

  const INK = '#3b2a1a';
  const TAU = Math.PI * 2;

  function blob(ctx, x, y, rx, ry, fill, stroke = INK, lw = 2) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.lineWidth = lw;
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
  }

  function shadow(ctx, x, y, rx) {
    blob(ctx, x, y, rx, rx * 0.35, 'rgba(40,30,10,.22)', null);
  }

  function eyes(ctx, x, y, gap, r = 3) {
    for (const s of [-1, 1]) {
      blob(ctx, x + s * gap, y, r, r, '#fff', INK, 1.2);
      blob(ctx, x + s * gap + 0.8, y + 0.6, r * 0.5, r * 0.5, INK, null);
    }
  }

  function pot(ctx, lvl, color = '#d9774a') {
    ctx.beginPath();
    ctx.moveTo(-18, 6);
    ctx.lineTo(18, 6);
    ctx.lineTo(13, 26);
    ctx.lineTo(-13, 26);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = INK;
    ctx.stroke();
    ctx.fillStyle = '#b85a33';
    ctx.fillRect(-20, 2, 40, 7);
    ctx.strokeRect(-20, 2, 40, 7);
    for (let i = 0; i < lvl; i++) blob(ctx, -8 + i * 8, 17, 2.6, 2.6, '#ffd23f', INK, 1);
  }

  // Tower bodies are drawn around (0,0) in a 64px cell, turned by `angle` where it makes sense.
  const TOWER_ART = {
    sprinkler(ctx, lvl, angle) {
      pot(ctx, lvl);
      ctx.save();
      ctx.rotate(angle);
      ctx.fillStyle = '#5fb0e8';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(4, -8 - lvl, 18 + lvl * 2, 7, 3);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      blob(ctx, 0, -6, 13 + lvl, 12 + lvl, '#6cc4f5');
      ctx.beginPath();
      ctx.arc(0, -18 - lvl, 7, Math.PI, 0);
      ctx.stroke();
      eyes(ctx, 0, -6, 5);
    },
    mint(ctx, lvl, _a, t) {
      pot(ctx, lvl, '#7ab4c9');
      const n = 3 + lvl;
      for (let i = 0; i < n; i++) {
        ctx.save();
        ctx.rotate((i / n) * TAU + t * 0.6);
        blob(ctx, 0, -12, 6, 11, i % 2 ? '#7fdcb4' : '#a6f0cf');
        ctx.restore();
      }
      blob(ctx, 0, -2, 8, 8, '#e9fff6');
      eyes(ctx, 0, -3, 3.5, 2.4);
    },
    cactus(ctx, lvl, angle) {
      pot(ctx, lvl, '#e0a452');
      const h = 18 + lvl * 4;
      ctx.save();
      ctx.rotate(angle + Math.PI / 2);
      blob(ctx, 0, -h / 2 + 4, 10, h / 2 + 4, '#55b04f');
      blob(ctx, -11, -2, 4, 7, '#55b04f');
      blob(ctx, 11, -6, 4, 7, '#55b04f');
      ctx.strokeStyle = '#fff6c8';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(-4, -h + 8 + i * 7);
        ctx.lineTo(-8, -h + 6 + i * 7);
        ctx.moveTo(4, -h + 10 + i * 7);
        ctx.lineTo(8, -h + 8 + i * 7);
        ctx.stroke();
      }
      blob(ctx, 0, -h - 2, 4, 3, lvl === 3 ? '#ff7aa8' : '#ffd1e0', INK, 1);
      ctx.restore();
    },
    chili(ctx, lvl, angle) {
      blob(ctx, 0, 14, 20, 10, '#8a5a3b');
      ctx.save();
      ctx.rotate(angle);
      ctx.fillStyle = '#5a5f66';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-2, -6, 24 + lvl * 2, 12, 4);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      blob(ctx, 0, -2, 14 + lvl, 13 + lvl, lvl === 3 ? '#c81d25' : '#e63946');
      ctx.fillStyle = '#4fb66b';
      ctx.beginPath();
      ctx.moveTo(-6, -14 - lvl);
      ctx.quadraticCurveTo(0, -26 - lvl, 6, -14 - lvl);
      ctx.fill();
      ctx.stroke();
      eyes(ctx, 0, -3, 5);
    },
    hive(ctx, lvl, _a, t) {
      blob(ctx, 0, 18, 18, 6, '#8a5a3b');
      const rings = 3 + Math.min(lvl, 2);
      for (let i = 0; i < rings; i++) {
        const w = 12 + Math.sin(((i + 0.5) / rings) * Math.PI) * 8;
        blob(ctx, 0, 14 - i * 8, w, 5.5, i % 2 ? '#f5b82e' : '#ffd23f');
      }
      blob(ctx, 0, 6, 4, 4, INK, null);
      for (let i = 0; i < lvl; i++) {
        const a = t * 3 + (i * TAU) / lvl;
        drawBee(ctx, Math.cos(a) * 20, -14 + Math.sin(a) * 6, 0.7);
      }
    },
  };

  function drawBee(ctx, x, y, k = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(k, k);
    blob(ctx, -2, -5, 4, 3, 'rgba(255,255,255,.85)', INK, 1);
    blob(ctx, 0, 0, 6, 4.5, '#ffd23f', INK, 1.2);
    ctx.fillStyle = INK;
    ctx.fillRect(-1.5, -4, 2.5, 8);
    ctx.restore();
  }

  function segments(ctx, n, size, color, dir, t) {
    for (let i = n - 1; i >= 0; i--) {
      const wob = Math.sin(t * 10 - i) * 1.5;
      blob(ctx, -i * size * 1.3 * Math.cos(dir), -i * size * 1.3 * Math.sin(dir) + wob, size, size, color);
    }
  }

  // Bugs are drawn facing +x; the caller rotates the context toward the walking direction.
  const ENEMY_ART = {
    caterpillar(ctx, t) {
      segments(ctx, 4, 7, '#8fd14f', 0, t);
      blob(ctx, 4, 0, 9, 9, '#6fbf3a');
      eyes(ctx, 7, 0, 4, 2.6);
    },
    ladybug(ctx) {
      blob(ctx, 9, 0, 6, 6, INK, null);
      blob(ctx, 0, 0, 12, 11, '#e63946');
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(10, 0);
      ctx.lineWidth = 2;
      ctx.stroke();
      for (const [x, y] of [[-4, -5], [-4, 5], [3, -6], [3, 6], [-9, 0]]) blob(ctx, x, y, 2.4, 2.4, INK, null);
    },
    snail(ctx, t) {
      blob(ctx, 2, 4, 18, 6, '#f2d27a');
      ctx.beginPath();
      ctx.moveTo(16, 0);
      ctx.lineTo(22, -6 + Math.sin(t * 4));
      ctx.lineWidth = 1.5;
      ctx.stroke();
      blob(ctx, -3, -4, 13, 13, '#c9824a');
      ctx.beginPath();
      for (let a = 0; a < 10; a += 0.3) ctx.lineTo(-3 + Math.cos(a) * a * 1.2, -4 + Math.sin(a) * a * 1.2);
      ctx.strokeStyle = '#7a4a28';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.strokeStyle = INK;
    },
    moth(ctx, t) {
      const flap = 0.55 + Math.abs(Math.sin(t * 14)) * 0.45;
      for (const s of [-1, 1]) {
        ctx.save();
        ctx.scale(1, s * flap);
        blob(ctx, -2, 9, 9, 10, '#b9a6d6');
        blob(ctx, -2, 10, 3, 3, '#7e62a8', null);
        ctx.restore();
      }
      blob(ctx, 0, 0, 10, 4.5, '#6e5a8a');
      eyes(ctx, 7, 0, 2.5, 2);
    },
    ant(ctx, t) {
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.2;
      for (const x of [-3, 0, 3]) {
        const k = Math.sin(t * 20 + x) * 2;
        ctx.beginPath();
        ctx.moveTo(x, -7 + k);
        ctx.lineTo(x, 7 - k);
        ctx.stroke();
      }
      blob(ctx, -6, 0, 4.5, 3.5, '#7a3e1d', INK, 1);
      blob(ctx, 0, 0, 3, 2.5, '#7a3e1d', INK, 1);
      blob(ctx, 5, 0, 3.5, 3.5, '#5a2c14', INK, 1);
    },
    beetle(ctx, t, e) {
      const dash = e && e.dashUntil > e.now;
      blob(ctx, 22, -6, 7, 3, '#2b2140');
      blob(ctx, 22, 6, 7, 3, '#2b2140');
      blob(ctx, 0, 0, 26, 22, '#4b3b6b', INK, 3);
      ctx.beginPath();
      ctx.moveTo(-26, 0);
      ctx.lineTo(16, 0);
      ctx.lineWidth = 2;
      ctx.stroke();
      blob(ctx, -6, -10, 8, 4, 'rgba(255,255,255,.25)', null);
      blob(ctx, 18, 0, 9, 11, '#2b2140');
      for (const s of [-1, 1]) blob(ctx, 22, s * 5, 2.6, 2.6, dash ? '#ff3b30' : '#ffd23f', null);
      ctx.fillStyle = '#ffd23f';
      ctx.beginPath();
      ctx.moveTo(-6, -20);
      ctx.lineTo(0, -28 - Math.sin(t * 3) * 2);
      ctx.lineTo(6, -20);
      ctx.fill();
    },
  };

  const SCALE = { caterpillar: 0.9, ladybug: 0.9, snail: 0.95, moth: 1, ant: 0.75, beetle: 1 };

  root.YayaArt = { INK, TAU, blob, shadow, eyes, drawBee, TOWER_ART, ENEMY_ART, SCALE };
})(typeof window !== 'undefined' ? window : globalThis);
