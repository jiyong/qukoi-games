'use strict';

G.pat = {
  fan(x, y, a, n, spread, s, o = {}) {
    for (let i = 0; i < n; i++) {
      const k = n === 1 ? 0 : i / (n - 1) - 0.5;
      G.spawnEB({ ...o, x, y, a: a + k * spread, s });
    }
  },

  aimed(x, y, s, n = 1, spread = 0.3, o = {}) {
    G.pat.fan(x, y, G.aim(x, y), n, spread, s, o);
  },

  ring(x, y, n, s, off = 0, o = {}) {
    for (let i = 0; i < n; i++) {
      G.spawnEB({ ...o, x, y, a: off + (i / n) * Math.PI * 2, s });
    }
  },

  wall(gapX, gapW, s, o = {}) {
    for (let x = 12; x < G.W; x += 26) {
      if (Math.abs(x - gapX) < gapW / 2) continue;
      G.spawnEB({ ...o, x, y: -10, a: Math.PI / 2, s });
    }
  },

  rain(n, s, o = {}) {
    for (let i = 0; i < n; i++) {
      G.spawnEB({ ...o, x: G.rand(10, G.W - 10), y: -10, a: Math.PI / 2 + G.rand(-0.15, 0.15), s: s * G.rand(0.8, 1.2) });
    }
  },
};
