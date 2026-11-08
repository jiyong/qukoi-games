(function (root) {
  'use strict';

  const A = root.YayaArt;
  const CELL = 64;
  const ROAD = new Set(['#', 'S', 'G']);
  const hash = (c, r) => {
    const n = Math.sin(c * 127.1 + r * 311.7) * 43758.5453;
    return n - Math.floor(n);
  };

  function drawBackground(ctx, map) {
    for (let r = 0; r < map.rows; r++) {
      for (let c = 0; c < map.cols; c++) {
        ctx.fillStyle = (c + r) % 2 ? '#9bd46b' : '#a6db76';
        ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
        if (!ROAD.has(map.grid[r][c])) tufts(ctx, c, r);
      }
    }
    roadLayer(ctx, map, 6, '#c9a46a');
    roadLayer(ctx, map, 10, '#e8c98f');
    pebbles(ctx, map);
    map.grid.forEach((row, r) => row.forEach((ch, c) => {
      if (ch === 'x') decor(ctx, c, r);
    }));
    burrow(ctx, map.start);
    blob(ctx, (map.goal.c + 0.5) * CELL, (map.goal.r + 0.6) * CELL, 28, 20, '#8a5a3b', null);
  }

  const blob = (...a) => A.blob(...a);

  function tufts(ctx, c, r) {
    ctx.strokeStyle = '#6fae45';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const x = c * CELL + 8 + hash(c + i, r) * 48;
      const y = r * CELL + 12 + hash(c, r + i) * 44;
      ctx.beginPath();
      ctx.moveTo(x - 3, y);
      ctx.lineTo(x - 1, y - 6);
      ctx.moveTo(x + 2, y);
      ctx.lineTo(x + 4, y - 7);
      ctx.stroke();
    }
    if (hash(c, r) > 0.82) blob(ctx, c * CELL + 40, r * CELL + 40, 3.5, 3.5, hash(r, c) > 0.5 ? '#fff' : '#ffd23f', null);
  }

  function roadLayer(ctx, map, inset, color) {
    ctx.fillStyle = color;
    map.path.cells.forEach((p, i) => {
      ctx.beginPath();
      ctx.roundRect(p.c * CELL + inset, p.r * CELL + inset, CELL - inset * 2, CELL - inset * 2, 14);
      ctx.fill();
      const n = map.path.cells[i + 1];
      if (!n) return;
      const x = Math.min(p.c, n.c) * CELL + inset;
      const y = Math.min(p.r, n.r) * CELL + inset;
      ctx.fillRect(x, y, (Math.abs(n.c - p.c) + 1) * CELL - inset * 2, (Math.abs(n.r - p.r) + 1) * CELL - inset * 2);
    });
  }

  function pebbles(ctx, map) {
    for (const p of map.path.cells) {
      for (let i = 0; i < 2; i++) {
        const x = p.c * CELL + 16 + hash(p.c * 3 + i, p.r) * 32;
        const y = p.r * CELL + 16 + hash(p.c, p.r * 3 + i) * 32;
        blob(ctx, x, y, 2.5, 2, '#cfae78', null);
      }
    }
  }

  function decor(ctx, c, r) {
    const x = (c + 0.5) * CELL;
    const y = (r + 0.5) * CELL;
    if (hash(c, r) > 0.45) {
      blob(ctx, x, y, 28, 22, '#7fd3f0', '#4f9fc0', 3);
      blob(ctx, x - 8, y - 6, 9, 4, 'rgba(255,255,255,.6)', null);
      blob(ctx, x + 10, y + 6, 7, 3, '#5fb36b', null);
      return;
    }
    blob(ctx, x, y + 4, 24, 18, '#4f9a3b');
    blob(ctx, x - 10, y - 4, 14, 12, '#5fae45');
    for (const [dx, dy] of [[-8, -6], [6, 2], [12, -8]]) blob(ctx, x + dx, y + dy, 3, 3, '#ff8fa3', null);
  }

  function burrow(ctx, p) {
    const x = (p.c + 0.5) * CELL;
    const y = (p.r + 0.5) * CELL;
    blob(ctx, x, y + 4, 26, 18, '#8a5a3b');
    blob(ctx, x, y + 6, 17, 11, '#2d1a0c', null);
    blob(ctx, x - 6, y + 4, 4, 2, 'rgba(255,255,255,.12)', null);
  }

  const OBSTACLE_ART = {
    rock(ctx, s) {
      blob(ctx, 0, 6, 22 * s, 16 * s, '#a3a8ad');
      blob(ctx, -6 * s, 0, 8 * s, 5 * s, '#c7cbcf', null);
    },
    boulder(ctx, s) {
      blob(ctx, 0, 6, 26 * s, 20 * s, '#9aa0a6', A.INK, 3);
      blob(ctx, -12 * s, -4 * s, 10 * s, 6 * s, '#c7cbcf', null);
      blob(ctx, 10 * s, 12 * s, 12 * s, 5 * s, '#6fae45', null);
    },
    stump(ctx) {
      blob(ctx, 0, 10, 20, 12, '#8a5a3b');
      ctx.fillStyle = '#8a5a3b';
      ctx.fillRect(-20, -4, 40, 14);
      blob(ctx, 0, -4, 20, 11, '#d9a46b');
      blob(ctx, 0, -4, 12, 6, '#c48a50', null);
      blob(ctx, 0, -4, 4, 2, '#a86f3a', null);
    },
    mushroom(ctx) {
      for (const [x, y, k] of [[-10, 6, 0.8], [8, 8, 0.7], [0, -2, 1]]) {
        ctx.fillStyle = '#fff3dc';
        ctx.fillRect(x - 4 * k, y, 8 * k, 14 * k);
        blob(ctx, x, y, 14 * k, 9 * k, '#e2513f');
        blob(ctx, x - 4 * k, y - 3 * k, 2.5, 2.5, '#fff', null);
        blob(ctx, x + 5 * k, y - 1, 2, 2, '#fff', null);
      }
    },
    crate(ctx) {
      ctx.fillStyle = '#c98f4f';
      ctx.strokeStyle = A.INK;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-20, -8, 40, 28, 4);
      ctx.fill();
      ctx.stroke();
      for (const y of [1, 11]) {
        ctx.beginPath();
        ctx.moveTo(-20, y);
        ctx.lineTo(20, y);
        ctx.stroke();
      }
      for (const x of [-10, 0, 10]) blob(ctx, x, -10, 6, 6, x ? '#ff9f43' : '#4fb66b');
    },
    hay(ctx, s) {
      blob(ctx, 0, 6, 28 * s, 22 * s, '#f2c94c', A.INK, 3);
      ctx.strokeStyle = '#c9982a';
      ctx.lineWidth = 2;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 10 * s, -12 * s);
        ctx.lineTo(i * 12 * s, 24 * s);
        ctx.stroke();
      }
    },
  };

  function drawObstacle(ctx, o, t, focused) {
    const x = o.x * CELL;
    const y = o.y * CELL;
    const s = o.size;
    ctx.save();
    ctx.translate(x, y);
    A.shadow(ctx, 0, 18 * s, 22 * s);
    OBSTACLE_ART[o.type](ctx, s, t);
    if (o.gift) {
      const k = 1 + Math.sin(t * 4) * 0.08;
      blob(ctx, 16 * s, -16 * s, 9 * k, 9 * k, '#ffd23f');
      ctx.fillStyle = A.INK;
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', 16 * s, -16 * s + 1);
    }
    ctx.restore();
    if (o.hp < o.maxHp || focused) hpBar(ctx, x, y - 24 * s, 34 * s, o.hp / o.maxHp, '#ffb347');
  }

  function hpBar(ctx, x, y, w, ratio, color) {
    ctx.fillStyle = 'rgba(40,30,10,.55)';
    ctx.fillRect(x - w / 2 - 1, y - 1, w + 2, 6);
    ctx.fillStyle = ratio > 0.5 ? color : ratio > 0.25 ? '#ffd23f' : '#ff6b5a';
    ctx.fillRect(x - w / 2, y, w * Math.max(0, ratio), 4);
  }

  // Sprout mood: 'happy' at full hp, 'hurt' mid, 'cry' when low; `shake` > 0 after a bite.
  function drawSprout(ctx, p, hp, maxHp, t, shake) {
    const x = (p.c + 0.5) * CELL + (shake > 0 ? Math.sin(t * 80) * 3 * shake : 0);
    const y = (p.r + 0.5) * CELL;
    const mood = hp >= maxHp ? 'happy' : hp > maxHp * 0.4 ? 'hurt' : 'cry';
    const sway = Math.sin(t * 2) * 0.08;
    ctx.save();
    ctx.translate(x, y + 4);
    ctx.rotate(sway);
    ctx.strokeStyle = A.INK;
    ctx.lineWidth = 2;
    ctx.fillStyle = '#3f9a55';
    ctx.fillRect(-2.5, -26, 5, 16);
    ctx.strokeRect(-2.5, -26, 5, 16);
    const leaves = Math.max(1, Math.ceil((hp / maxHp) * 2));
    for (let i = 0; i < 2; i++) {
      const s = i ? 1 : -1;
      ctx.save();
      ctx.translate(0, -26);
      ctx.rotate(s * (0.7 + Math.sin(t * 3 + i) * 0.1));
      blob(ctx, 0, -11, 7, 13, i < leaves ? '#4fb66b' : '#b8a35a');
      ctx.restore();
    }
    blob(ctx, 0, 0, 17, 15, '#7fd47a');
    blob(ctx, -6, -6, 5, 3, 'rgba(255,255,255,.5)', null);
    face(ctx, mood, t);
    ctx.restore();
  }

  function face(ctx, mood, t) {
    ctx.strokeStyle = A.INK;
    ctx.lineWidth = 2;
    if (mood === 'happy') {
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(s * 6, 0, 3, Math.PI, 0);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(0, 4, 4, 0, Math.PI);
      ctx.stroke();
    } else {
      A.eyes(ctx, 0, 0, 6, 3);
      ctx.beginPath();
      ctx.arc(0, 10, 4, Math.PI, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-10, -6);
      ctx.lineTo(-3, -4);
      ctx.moveTo(10, -6);
      ctx.lineTo(3, -4);
      ctx.stroke();
    }
    if (mood === 'cry') {
      const drop = (t * 20) % 10;
      for (const s of [-1, 1]) blob(ctx, s * 7, 5 + drop, 2, 3, '#6cc4f5', null);
    }
    for (const s of [-1, 1]) blob(ctx, s * 11, 4, 3, 2, 'rgba(255,120,140,.5)', null);
  }

  root.YayaScene = { CELL, drawBackground, drawObstacle, drawSprout, hpBar };
})(typeof window !== 'undefined' ? window : globalThis);
