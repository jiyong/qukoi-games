'use strict';

G.THEMES = {
  ocean: { top: '#0b4f8a', bot: '#2a8fd0', deco: 'islands', count: 5, speed: 40, cloud: '#ffffff', cloudA: 0.55 },
  jungle: { top: '#16401f', bot: '#3c7a3a', deco: 'trees', count: 14, speed: 45, cloud: '#ffffff', cloudA: 0.45 },
  desert: { top: '#b97a3e', bot: '#e7bb78', deco: 'dunes', count: 8, speed: 45, cloud: '#fff1d6', cloudA: 0.3 },
  storm: { top: '#151c29', bot: '#38475c', deco: 'waves', count: 26, speed: 60, cloud: '#8e9bb0', cloudA: 0.75, lightning: true },
  deepsea: { top: '#021630', bot: '#0b4272', deco: 'waves', count: 22, speed: 50, cloud: '#bfe3ff', cloudA: 0.25 },
  arctic: { top: '#24506e', bot: '#4c86a8', deco: 'ice', count: 9, speed: 45, cloud: '#ffffff', cloudA: 0.5 },
  volcano: { top: '#150605', bot: '#4a1408', deco: 'lava', count: 8, speed: 50, cloud: '#55332c', cloudA: 0.6 },
  night: { top: '#04060d', bot: '#141b36', deco: 'city', count: 10, speed: 55, cloud: '#2c3b66', cloudA: 0.5 },
  orbit: { top: '#00000a', bot: '#0b0b2e', deco: 'stars', count: 70, speed: 30, cloud: '#6a3cff', cloudA: 0.22 },
  void: { top: '#0d0014', bot: '#2c003c', deco: 'stars', count: 80, speed: 35, cloud: '#ff3c8a', cloudA: 0.22, lightning: true },
};

G.DECO = {
  islands(ctx, it) {
    ctx.fillStyle = '#e8d49a';
    ctx.beginPath();
    ctx.ellipse(it.x, it.y, 46 * it.s, 30 * it.s, it.seed * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3e8a3c';
    ctx.beginPath();
    ctx.ellipse(it.x, it.y, 36 * it.s, 22 * it.s, it.seed * 3, 0, Math.PI * 2);
    ctx.fill();
  },
  trees(ctx, it) {
    ctx.fillStyle = it.seed > 0.5 ? '#1f5a26' : '#2d6e2c';
    ctx.beginPath();
    ctx.arc(it.x, it.y, 22 * it.s, 0, Math.PI * 2);
    ctx.arc(it.x + 18 * it.s, it.y + 8 * it.s, 16 * it.s, 0, Math.PI * 2);
    ctx.fill();
  },
  dunes(ctx, it) {
    ctx.fillStyle = 'rgba(255,230,180,0.35)';
    ctx.beginPath();
    ctx.ellipse(it.x, it.y, 120 * it.s, 24 * it.s, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(150,95,45,0.25)';
    ctx.beginPath();
    ctx.ellipse(it.x + 10, it.y + 14 * it.s, 110 * it.s, 10 * it.s, 0.2, 0, Math.PI * 2);
    ctx.fill();
  },
  waves(ctx, it) {
    ctx.strokeStyle = 'rgba(200,230,255,0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(it.x, it.y, 14 * it.s, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
  },
  ice(ctx, it) {
    ctx.fillStyle = 'rgba(235,248,255,0.9)';
    ctx.beginPath();
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      const r = (30 + 14 * Math.sin(it.seed * 20 + i * 2.3)) * it.s;
      ctx.lineTo(it.x + Math.cos(a) * r, it.y + Math.sin(a) * r * 0.7);
    }
    ctx.fill();
  },
  lava(ctx, it) {
    ctx.fillStyle = '#2a0f0a';
    ctx.beginPath();
    ctx.ellipse(it.x, it.y, 60 * it.s, 40 * it.s, it.seed, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    const pulse = 0.6 + 0.4 * Math.sin(G.t * 2 + it.seed * 10);
    G.drawGlow(ctx, it.x, it.y, 34 * it.s, '#ff5a1a', pulse * 0.8);
    ctx.globalCompositeOperation = 'source-over';
  },
  city(ctx, it) {
    const n = 4;
    for (let i = 0; i < n; i++) {
      const w = 16 * it.s;
      const x = it.x + i * (w + 6);
      ctx.fillStyle = '#0c1226';
      ctx.fillRect(x, it.y, w, 40 * it.s);
      ctx.fillStyle = (i + Math.floor(it.seed * 9)) % 3 ? '#ffd27a' : '#6ad8ff';
      ctx.fillRect(x + 4, it.y + 6, 3, 3);
      ctx.fillRect(x + 9, it.y + 18 * it.s, 3, 3);
    }
  },
  stars(ctx, it) {
    const tw = 0.5 + 0.5 * Math.sin(G.t * 3 + it.seed * 30);
    ctx.fillStyle = `rgba(255,255,255,${0.3 + 0.7 * tw})`;
    ctx.fillRect(it.x, it.y, 2 * it.s, 2 * it.s);
  },
};

G.bg = (() => {
  let theme = G.THEMES.ocean;
  let items = [];
  let clouds = [];
  let streaks = [];
  let sprites = [];
  let bolt = 0;

  function makeCloud(w, h, color) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const g = c.getContext('2d');
    for (let i = 0; i < 14; i++) {
      const x = G.rand(w * 0.2, w * 0.8);
      const y = G.rand(h * 0.35, h * 0.65);
      const r = G.rand(h * 0.2, h * 0.45);
      const grd = g.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, G.rgba(color, 0.5));
      grd.addColorStop(1, G.rgba(color, 0));
      g.fillStyle = grd;
      g.fillRect(0, 0, w, h);
    }
    return c;
  }

  const newItem = (y) => ({ x: G.rand(-30, G.W + 30), y, s: G.rand(0.6, 1.4), seed: Math.random() });
  const newCloud = (y) => {
    const front = Math.random() < 0.35;
    return { x: G.rand(-140, G.W - 60), y, spr: G.randi(0, 2), v: front ? 230 : 110, a: theme.cloudA * (front ? 0.6 : 1), sc: front ? 1.5 : 1 };
  };

  function setTheme(name) {
    theme = G.THEMES[name] || G.THEMES.ocean;
    sprites = [makeCloud(260, 130, theme.cloud), makeCloud(180, 100, theme.cloud), makeCloud(340, 150, theme.cloud)];
    items = Array.from({ length: theme.count }, () => newItem(G.rand(-60, G.H)));
    clouds = Array.from({ length: 5 }, () => newCloud(G.rand(-160, G.H)));
    streaks = Array.from({ length: 14 }, () => ({ x: G.rand(0, G.W), y: G.rand(0, G.H), v: G.rand(500, 900) }));
  }

  function update(dt) {
    const sp = G.bgSpeed || 1;
    for (const it of items) {
      it.y += theme.speed * sp * dt;
      if (it.y > G.H + 90) Object.assign(it, newItem(-90));
    }
    for (const c of clouds) {
      c.y += c.v * sp * dt;
      if (c.y > G.H + 20) Object.assign(c, newCloud(-200));
    }
    for (const s of streaks) {
      s.y += s.v * sp * dt;
      if (s.y > G.H) {
        s.y = -40;
        s.x = G.rand(0, G.W);
      }
    }
    if (theme.lightning) {
      bolt = Math.max(0, bolt - dt * 3);
      if (Math.random() < dt * 0.15) bolt = 1;
    }
  }

  function draw(ctx) {
    const grd = ctx.createLinearGradient(0, 0, 0, G.H);
    grd.addColorStop(0, theme.top);
    grd.addColorStop(1, theme.bot);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, G.W, G.H);
    const deco = G.DECO[theme.deco];
    for (const it of items) deco(ctx, it);
    for (const c of clouds) {
      const s = sprites[c.spr];
      ctx.globalAlpha = c.a;
      ctx.drawImage(s, c.x, c.y, s.width * c.sc, s.height * c.sc);
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const s of streaks) {
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x, s.y + 40);
    }
    ctx.stroke();
    if (bolt > 0) {
      ctx.fillStyle = `rgba(200,220,255,${bolt * 0.25})`;
      ctx.fillRect(0, 0, G.W, G.H);
    }
  }

  return { setTheme, update, draw };
})();
