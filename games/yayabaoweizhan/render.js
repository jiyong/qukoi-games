(function (root) {
  'use strict';

  const A = root.YayaArt;
  const S = root.YayaScene;
  const D = root.YayaData;
  const CELL = S.CELL;
  const FLY_LIFT = 14;

  function create(canvas, opts = {}) {
    const ctx = canvas.getContext('2d');
    const bg = document.createElement('canvas');
    const reduced = !!opts.reducedMotion;
    let map = null;
    let scale = 1;
    let particles = [];
    let texts = [];

    function resize() {
      if (!map) return;
      const w = map.cols * CELL;
      const h = map.rows * CELL;
      const css = canvas.getBoundingClientRect().width || w;
      scale = Math.max(0.5, Math.min(3, (css * (root.devicePixelRatio || 1)) / w));
      canvas.width = Math.round(w * scale);
      canvas.height = Math.round(h * scale);
      bg.width = canvas.width;
      bg.height = canvas.height;
      const b = bg.getContext('2d');
      b.setTransform(scale, 0, 0, scale, 0, 0);
      S.drawBackground(b, map);
    }

    function setMap(m) {
      map = m;
      particles = [];
      texts = [];
      resize();
    }

    function burst(x, y, color, n = 8) {
      if (reduced) return;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * A.TAU;
        const v = 40 + Math.random() * 80;
        particles.push({ x: x * CELL, y: y * CELL, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 30, life: 0.5, max: 0.5, color, r: 2 + Math.random() * 3 });
      }
    }

    function text(x, y, label, color = '#ffd23f') {
      texts.push({ x: x * CELL, y: y * CELL, label, color, life: 0.9, max: 0.9 });
    }

    function update(dt) {
      for (const p of particles) {
        p.life -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 220 * dt;
      }
      for (const t of texts) {
        t.life -= dt;
        t.y -= 30 * dt;
      }
      particles = particles.filter((p) => p.life > 0);
      texts = texts.filter((t) => t.life > 0);
    }

    function drawTower(t, time) {
      ctx.save();
      ctx.translate(t.x * CELL, t.y * CELL - 4);
      A.shadow(ctx, 0, 26, 20);
      A.TOWER_ART[t.type](ctx, t.lvl, t.angle, time);
      ctx.restore();
    }

    function drawEnemy(e, time, now) {
      const x = e.x * CELL;
      const y = e.y * CELL;
      const k = A.SCALE[e.type];
      const size = e.boss ? 2 : 1;
      const lift = e.flying ? FLY_LIFT + Math.sin(time * 3 + e.id) * 3 : 0;
      A.shadow(ctx, x, y + 10, 12 * k * size);
      ctx.save();
      ctx.translate(x, y - lift);
      ctx.save();
      ctx.rotate(e.dir);
      ctx.scale(k, k);
      A.ENEMY_ART[e.type](ctx, time + e.id, { dashUntil: e.dashUntil, now });
      ctx.restore();
      if (e.slowUntil > now) A.blob(ctx, 0, 0, 16 * k * size, 14 * k * size, 'rgba(170,230,255,.45)', '#bfefff', 1.5);
      ctx.restore();
      if (e.hp < e.maxHp) S.hpBar(ctx, x, y - 24 * size - lift, 28 * size, e.hp / e.maxHp, '#7ee36b');
    }

    function drawShot(sh) {
      const x = sh.x * CELL;
      const y = sh.y * CELL;
      const fade = sh.maxLife ? sh.life / sh.maxLife : 1;
      if (sh.kind === 'bullet') {
        A.blob(ctx, x, y, 5, 5, '#6cc4f5', '#2f7fb5', 1.5);
        A.blob(ctx, x - 1.5, y - 1.5, 1.6, 1.6, '#fff', null);
      } else if (sh.kind === 'bee') {
        A.drawBee(ctx, x, y + Math.sin(sh.x * 9 + sh.phase) * 2, 0.8);
      } else if (sh.kind === 'shell') {
        A.shadow(ctx, x, y + 6, 6);
        A.blob(ctx, x, y - sh.h * 46, 7, 7, '#ff7a2f', '#b8321c', 2);
      } else if (sh.kind === 'spike') {
        ctx.strokeStyle = `rgba(90,170,70,${fade})`;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        const len = sh.len * CELL * (1 - fade * 0.6);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(sh.angle) * len, y + Math.sin(sh.angle) * len);
        ctx.stroke();
      } else if (sh.kind === 'ring') {
        A.blob(ctx, x, y, sh.r * CELL * (1 - fade * 0.7), sh.r * CELL * (1 - fade * 0.7), `rgba(190,240,255,${fade * 0.35})`, `rgba(140,220,255,${fade})`, 3);
      } else if (sh.kind === 'blast') {
        const r = sh.r * CELL * (1.1 - fade * 0.5);
        A.blob(ctx, x, y, r, r * 0.8, `rgba(255,140,50,${fade * 0.55})`, `rgba(255,90,40,${fade})`, 3);
      }
    }

    function drawRange(t) {
      const r = D.TOWERS[t.type] && root.YayaEngine.stat(D.TOWERS[t.type], 'range', t.lvl);
      A.blob(ctx, (t.c + 0.5) * CELL, (t.r + 0.5) * CELL, r * CELL, r * CELL, 'rgba(255,255,255,.18)', 'rgba(255,255,255,.8)', 2);
    }

    function drawFocus(target, time) {
      const x = target.x * CELL;
      const y = target.y * CELL - (target.flying ? FLY_LIFT : 0);
      const r = (target.size || (target.boss ? 2 : 1)) * 18 + Math.sin(time * 6) * 2;
      ctx.strokeStyle = '#ff6b5a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, A.TAU);
      ctx.stroke();
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * (r - 6), y + Math.sin(a) * (r - 6));
        ctx.lineTo(x + Math.cos(a) * (r + 6), y + Math.sin(a) * (r + 6));
        ctx.stroke();
      }
    }

    function drawCell(cell, ok) {
      ctx.strokeStyle = ok ? 'rgba(255,255,255,.95)' : 'rgba(255,107,90,.9)';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.roundRect(cell.c * CELL + 4, cell.r * CELL + 4, CELL - 8, CELL - 8, 10);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // view: { cell, cellOk, rangeOf, shake }
    function draw(state, view, time) {
      if (!map) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(bg, 0, 0);
      const jolt = !reduced && view.shake > 0 ? view.shake * 6 : 0;
      ctx.setTransform(scale, 0, 0, scale, (Math.random() - 0.5) * jolt * scale, (Math.random() - 0.5) * jolt * scale);
      const focus = state.focus && (state.focus.kind === 'obstacle' ? state.obstacles : state.enemies)
        .find((x) => x.id === state.focus.id);
      for (const o of state.obstacles) S.drawObstacle(ctx, o, time, focus === o);
      if (view.cell) drawCell(view.cell, view.cellOk);
      if (view.rangeOf) drawRange(view.rangeOf);
      S.drawSprout(ctx, state.map.goal, state.hp, state.maxHp, time, view.shake);
      const ground = [...state.towers, ...state.enemies.filter((e) => !e.flying)].sort((a, b) => a.y - b.y);
      for (const u of ground) {
        if (u.kind === 'tower') drawTower(u, time);
        else drawEnemy(u, time, state.time);
      }
      for (const e of state.enemies) if (e.flying) drawEnemy(e, time, state.time);
      for (const sh of state.shots) drawShot(sh);
      if (focus) drawFocus(focus, time);
      for (const p of particles) {
        ctx.globalAlpha = p.life / p.max;
        A.blob(ctx, p.x, p.y, p.r, p.r, p.color, null);
      }
      ctx.globalAlpha = 1;
      ctx.font = 'bold 18px "ZCOOL KuaiLe", sans-serif';
      ctx.textAlign = 'center';
      ctx.lineWidth = 4;
      for (const t of texts) {
        ctx.globalAlpha = Math.min(1, (t.life / t.max) * 2);
        ctx.strokeStyle = A.INK;
        ctx.strokeText(t.label, t.x, t.y);
        ctx.fillStyle = t.color;
        ctx.fillText(t.label, t.x, t.y);
      }
      ctx.globalAlpha = 1;
    }

    return { setMap, resize, draw, update, burst, text };
  }

  function drawIcon(canvas, type, px = 44) {
    const dpr = Math.min(2, root.devicePixelRatio || 1);
    canvas.width = px * dpr;
    canvas.height = px * dpr;
    const ctx = canvas.getContext('2d');
    const k = (px / CELL) * dpr;
    ctx.setTransform(k, 0, 0, k, (px * dpr) / 2, (px * dpr) / 2 + 2 * k);
    A.TOWER_ART[type](ctx, 1, -Math.PI / 4, 0);
  }

  root.YayaRender = { create, drawIcon };
})(typeof window !== 'undefined' ? window : globalThis);

