'use strict';

const G = (window.G = {
  W: 480,
  H: 720,
  t: 0,
  state: 'menu',
  phase: 'waves',
  pBullets: [],
  eBullets: [],
  enemies: [],
  powerups: [],
  lasers: [],
  player: null,
  boss: null,
  level: 0,
  score: 0,
  bulletMul: 1,
  shake: 0,
  slowmo: 0,
  flash: { a: 0, color: '#ffffff' },
});

G.rand = (a, b) => a + Math.random() * (b - a);
G.randi = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
G.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
G.lerp = (a, b, k) => a + (b - a) * k;
G.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
G.d2 = (ax, ay, bx, by) => {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
};
G.angTo = (ax, ay, bx, by) => Math.atan2(by - ay, bx - ax);
G.aim = (x, y) => {
  const p = G.player;
  return p && p.alive ? G.angTo(x, y, p.x, p.y) : Math.PI / 2;
};
G.rgba = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
};

G.initCanvas = function () {
  const c = document.getElementById('game');
  G.canvas = c;
  G.ctx = c.getContext('2d');
  const fit = () => {
    const s = Math.min(innerWidth / G.W, innerHeight / G.H) * 0.98;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.style.width = G.W * s + 'px';
    c.style.height = G.H * s + 'px';
    c.width = Math.round(G.W * s * dpr);
    c.height = Math.round(G.H * s * dpr);
    G.scale = s * dpr;
  };
  fit();
  addEventListener('resize', fit);
};

const glowCache = new Map();
const GLOW_R = 64;
G.glowSprite = function (color) {
  let cv = glowCache.get(color);
  if (cv) return cv;
  cv = document.createElement('canvas');
  cv.width = cv.height = GLOW_R * 2;
  const g = cv.getContext('2d');
  const grd = g.createRadialGradient(GLOW_R, GLOW_R, 0, GLOW_R, GLOW_R, GLOW_R);
  grd.addColorStop(0, G.rgba(color, 1));
  grd.addColorStop(0.25, G.rgba(color, 0.6));
  grd.addColorStop(0.6, G.rgba(color, 0.15));
  grd.addColorStop(1, G.rgba(color, 0));
  g.fillStyle = grd;
  g.fillRect(0, 0, GLOW_R * 2, GLOW_R * 2);
  glowCache.set(color, cv);
  return cv;
};

G.drawGlow = function (ctx, x, y, r, color, alpha = 1) {
  if (r <= 0 || alpha <= 0) return;
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.drawImage(G.glowSprite(color), x - r, y - r, r * 2, r * 2);
  ctx.globalAlpha = 1;
};

G.store = {
  get(key, def) {
    try {
      const v = localStorage.getItem('kzyh_' + key);
      return v === null ? def : JSON.parse(v);
    } catch (e) {
      return def;
    }
  },
  set(key, val) {
    try {
      localStorage.setItem('kzyh_' + key, JSON.stringify(val));
    } catch (e) {
      /* storage unavailable (private mode); progress just won't persist */
    }
  },
};
