'use strict';

const later = (at, fn) => G.pending.push({ at, fn });
const spawn = (type, o) => G.spawnEnemy(type, o);

G.FORMS = {
  line(type, n) {
    for (let i = 0; i < n; i++) spawn(type, { x: (G.W * (i + 1)) / (n + 1), y: -30, v: 110 });
  },
  vee(type, n) {
    const mid = (n - 1) / 2;
    for (let i = 0; i < n; i++) spawn(type, { x: G.W / 2 + (i - mid) * 52, y: -30 - Math.abs(i - mid) * 36, v: 120 });
  },
  swoopL(type, n) {
    for (let i = 0; i < n; i++) later(i * 0.28, () => spawn(type, { x: -24, y: 60, move: 'swoop', vx: 230, vy: 40, turn: 1.25, turnT: 1.7 }));
  },
  swoopR(type, n) {
    for (let i = 0; i < n; i++) later(i * 0.28, () => spawn(type, { x: G.W + 24, y: 60, move: 'swoop', vx: -230, vy: 40, turn: -1.25, turnT: 1.7 }));
  },
  snake(type, n) {
    const x = G.rand(100, G.W - 100);
    for (let i = 0; i < n; i++) later(i * 0.32, () => spawn(type, { x, y: -30, move: 'sine', v: 130, amp: 80, freq: 2.2 }));
  },
  hover(type, n) {
    for (let i = 0; i < n; i++) {
      spawn(type, { x: (G.W * (i + 1)) / (n + 1), y: -40, move: 'stop', stopY: G.rand(90, 190), stay: 6 });
    }
  },
  kami(n) {
    for (let i = 0; i < n; i++) later(i * 0.35, () => spawn('kamikaze', { x: G.rand(40, G.W - 40), y: -20, move: 'chase' }));
  },
  cross(type, n) {
    const left = Math.random() < 0.5;
    const y = G.rand(70, 180);
    for (let i = 0; i < n; i++) later(i * 0.4, () => spawn(type, { x: left ? -30 : G.W + 30, y, move: 'cross', vx: left ? 150 : -150 }));
  },
  carrier(drop) {
    spawn('carrier', { x: G.rand(80, G.W - 80), y: -30, move: 'sine', v: 70, amp: 60, freq: 1.2, drop });
  },
  heavy() {
    spawn('heavy', { x: G.W / 2, y: -90, move: 'stop', stopY: 150, stay: 18, amp: 90 });
  },
};

const P1 = ['line scout 4', 'vee scout 5', 'swoopL scout 5', 'swoopR scout 5', 'snake scout 5'];
const P2 = [...P1, 'vee fighter 4', 'snake fighter 4', 'swoopL fighter 4', 'hover gunship 1'];
const P3 = [...P2, 'kami 4', 'swoopR fighter 5', 'hover gunship 2', 'line fighter 4'];
const P4 = [...P3, 'cross fighter 5', 'hover bomber 1', 'kami 5'];
const P5 = [...P4, 'hover turret 1', 'cross scout 6'];
const P6 = [...P5, 'hover ace 1', 'snake fighter 6', 'hover turret 2'];
const P7 = [...P6, 'hover bomber 2', 'kami 6', 'vee fighter 6'];

const L = (name, theme, song, o) => ({ name, theme, song, boss: 0, heavy: false, ...o });

G.LEVELS = [
  L('珊瑚海', 'ocean', 'calm', { length: 55, gap: 3.4, cap: 10, bulletMul: 0.8, fireMul: 1.7, hpMul: 1, carrierGap: 12, drops: ['P', 'P', 'W', 'S'], pool: P1, intro: ['line scout 3', 'swoopL scout 4', 'swoopR scout 4'] }),
  L('热带雨林', 'jungle', 'calm', { length: 60, gap: 3.1, cap: 11, bulletMul: 0.85, fireMul: 1.5, hpMul: 1, carrierGap: 13, drops: ['P', 'W', 'S', 'B'], pool: P2, intro: ['vee fighter 3', 'hover gunship 1'] }),
  L('黄沙大漠', 'desert', 'tense', { length: 65, gap: 3, cap: 12, bulletMul: 0.9, fireMul: 1.35, hpMul: 1.1, carrierGap: 14, drops: ['P', 'S', 'W', 'B'], pool: P3, intro: ['kami 4', 'hover gunship 2'] }),
  L('雷暴海域', 'storm', 'tense', { length: 70, gap: 2.9, cap: 12, bulletMul: 0.95, fireMul: 1.25, hpMul: 1.2, carrierGap: 14, drops: ['P', 'S', 'B', 'W'], pool: P4, heavy: true, intro: ['cross fighter 5', 'hover bomber 1'] }),
  L('深海迷踪', 'deepsea', 'calm', { length: 72, gap: 2.8, cap: 13, bulletMul: 1, fireMul: 1.15, hpMul: 1.3, carrierGap: 14, drops: ['S', 'P', 'L', 'B'], pool: P5, heavy: true, intro: ['hover turret 1'] }),
  L('冰封极地', 'arctic', 'tense', { length: 75, gap: 2.7, cap: 13, bulletMul: 1.03, fireMul: 1.05, hpMul: 1.4, carrierGap: 15, drops: ['P', 'S', 'W', 'B'], pool: P6, heavy: true, intro: ['hover ace 1'] }),
  L('炼狱火山', 'volcano', 'tense', { length: 78, gap: 2.6, cap: 14, bulletMul: 1.06, fireMul: 0.95, hpMul: 1.5, carrierGap: 15, drops: ['S', 'P', 'B', 'L'], pool: P7, heavy: true, intro: ['hover bomber 2'] }),
  L('暗夜都市', 'night', 'tense', { length: 80, gap: 2.5, cap: 14, bulletMul: 1.1, fireMul: 0.88, hpMul: 1.6, carrierGap: 15, drops: ['P', 'S', 'W', 'B'], pool: P7, heavy: true, intro: ['kami 6'] }),
  L('近地轨道', 'orbit', 'tense', { length: 82, gap: 2.4, cap: 15, bulletMul: 1.12, fireMul: 0.8, hpMul: 1.7, carrierGap: 15, drops: ['S', 'P', 'B', 'L'], pool: P7, heavy: true, intro: ['hover turret 2'] }),
  L('虚空彼岸', 'void', 'tense', { length: 85, gap: 2.3, cap: 16, bulletMul: 1.15, fireMul: 0.75, hpMul: 1.8, carrierGap: 14, drops: ['S', 'P', 'B', 'S', 'L'], pool: P7, heavy: true, intro: ['hover ace 2'] }),
];
G.LEVELS.forEach((lv, i) => {
  lv.boss = i;
});

function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildWaves(lv, idx) {
  const r = seeded(idx * 977 + 13);
  const waves = [];
  let t = 2.5;
  let nextCarrier = 7;
  let ci = 0;
  let heavyDone = !lv.heavy;
  const queue = [...lv.intro];
  while (t < lv.length) {
    if (!heavyDone && t >= lv.length * 0.5) {
      waves.push([t, 'heavy']);
      heavyDone = true;
      t += 3;
      continue;
    }
    if (t >= nextCarrier) {
      waves.push([t, 'carrier', lv.drops[ci++ % lv.drops.length]]);
      nextCarrier += lv.carrierGap;
    }
    const spec = queue.length ? queue.shift() : lv.pool[Math.floor(r() * lv.pool.length)];
    waves.push([t, ...spec.split(' ')]);
    t += lv.gap * (0.8 + r() * 0.4);
  }
  return waves;
}

function runWave(w) {
  const args = w.slice(2).map((a) => (isNaN(a) ? a : Number(a)));
  G.FORMS[w[1]](...args);
}

G.startLevel = function (i) {
  const lv = G.LEVELS[i];
  Object.assign(G, { level: i, levelDef: lv, waves: buildWaves(lv, i), waveIdx: 0, levelT: 0, pending: [], phase: 'waves' });
  Object.assign(G, { enemies: [], eBullets: [], pBullets: [], powerups: [], boss: null, bulletMul: lv.bulletMul, bannerT: 3.2, clearT: 0 });
  G.lasers.length = 0;
  G.fx.clear();
  G.bg.setTheme(lv.theme);
  G.audio.setSong(lv.song);
  const p = G.player;
  Object.assign(p, { x: G.W / 2, y: G.H - 90, alive: true, invuln: 2.5, spawnShield: true });
  G.state = 'playing';
};

G.updateLevel = function (dt) {
  for (let i = G.pending.length - 1; i >= 0; i--) {
    const it = G.pending[i];
    it.at -= dt;
    if (it.at <= 0) {
      G.pending.splice(i, 1);
      it.fn();
    }
  }
  G.bannerT = Math.max(0, G.bannerT - dt);
  if (G.phase === 'waves') {
    const heavyAlive = G.enemies.some((e) => e.type === 'heavy');
    if (!heavyAlive && G.enemies.length < G.levelDef.cap) G.levelT += dt;
    while (G.waveIdx < G.waves.length && G.waves[G.waveIdx][0] <= G.levelT) runWave(G.waves[G.waveIdx++]);
    const done = G.waveIdx >= G.waves.length && G.levelT > G.levelDef.length;
    if (done && (G.enemies.length === 0 || G.levelT > G.levelDef.length + 8)) {
      G.phase = 'warning';
      G.warnT = 3.2;
      G.audio.play('warn', 1);
      G.audio.setSong('boss');
    }
  } else if (G.phase === 'warning') {
    G.warnT -= dt;
    if (G.warnT <= 0) {
      G.boss = G.makeBoss(G.levelDef.boss);
      G.phase = 'boss';
    }
  }
};
