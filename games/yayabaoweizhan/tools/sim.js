#!/usr/bin/env node
// Balance check: plays every level with a simple greedy bot and prints the result.
// Usage: node tools/sim.js [--waves]   (--waves also prints per-wave pacing)
const D = require('../data.js');
const M = require('../map.js');
const E = require('../engine.js');

const STEP = 1 / 30;
const showWaves = process.argv.includes('--waves');

// Buildable cells within 1.5 of the road, ordered by how much road they cover.
function spots(map) {
  const road = map.path.points;
  const out = [];
  map.grid.forEach((row, r) => row.forEach((ch, c) => {
    if (ch !== '.') return;
    const x = c + 0.5;
    const y = r + 0.5;
    const cover = road.filter((p) => Math.hypot(p.x - x, p.y - y) <= 2.5).length;
    if (cover > 0) out.push({ c, r, cover });
  }));
  return out.sort((a, b) => b.cover - a.cover);
}

// Bot: buy sprinklers on the best spots, then upgrade, then add chili/mint when rich.
function botAct(g) {
  const s = g.state;
  const open = spots(s.map).filter((p) => g.canBuildAt(p.c, p.r));
  const plan = s.towers.length < 3 ? 'sprinkler' : ['sprinkler', 'mint', 'chili', 'cactus'][s.towers.length % 4];
  if (open.length && s.gold >= D.TOWERS[plan].cost && (s.towers.length < 6 || s.gold > 400)) {
    g.build(plan, open[0].c, open[0].r);
    return;
  }
  const up = s.towers.filter((t) => g.upgradeCost(t) !== null).sort((a, b) => a.lvl - b.lvl)[0];
  if (up && s.gold >= g.upgradeCost(up) + 60) g.upgrade(up.id);
}

function play(level) {
  const g = E.createEngine(level);
  const s = g.state;
  const waves = [];
  let cur = null;
  while (s.status !== 'won' && s.status !== 'lost' && s.time < 1200) {
    botAct(g);
    const before = s.wave;
    g.tick(STEP);
    if (s.wave !== before) {
      if (cur) cur.overlap = s.enemies.length;
      cur = { wave: s.wave, start: +s.time.toFixed(1), hpBefore: s.hp, onField: s.enemies.length };
      waves.push(cur);
    }
  }
  return { status: s.status, hp: s.hp, time: Math.round(s.time), towers: s.towers.length, waves };
}

const rows = D.LEVELS.map((L) => {
  const map = M.parseMap(L.map);
  const r = play(L);
  if (showWaves) {
    console.log(`\nL${L.id} ${L.name}`);
    console.table(r.waves.map((w) => ({ wave: w.wave, start: w.start, leftoverBugs: w.onField, hp: w.hpBefore })));
  }
  return { level: L.id, name: L.name, path: map.path.length, waves: L.waves.length, result: r.status, hp: r.hp, time: r.time, towers: r.towers };
});
console.table(rows);
