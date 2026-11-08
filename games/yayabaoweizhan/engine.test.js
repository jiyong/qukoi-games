const test = require('node:test');
const assert = require('node:assert/strict');
const E = require('./engine.js');

const MAP = ['............', 'S##########G', '............', '.o.oo.......', '...oo.......'];
const OBST = [{ type: 'rock', c: 1, r: 3, gift: 'sprinkler' }, { type: 'boulder', c: 3, r: 3 }];

function setup(over = {}) {
  const events = [];
  const level = { id: 1, gold: 1000, map: MAP, obstacles: OBST, waves: [[['caterpillar', 1, 1]]], ...over };
  const g = E.createEngine(level, { onEvent: (t, d) => events.push([t, d]) });
  return { g, s: g.state, events, has: (t) => events.some(([x]) => x === t) };
}

const run = (g, secs, dt = 1 / 60) => {
  for (let t = 0; t < secs; t += dt) g.tick(dt);
};

test('build charges gold and rejects bad cells', () => {
  const { g, s } = setup();
  assert.equal(g.build('sprinkler', 2, 0).ok, true);
  assert.equal(s.gold, 900);
  assert.equal(g.build('sprinkler', 2, 0).reason, 'blocked');
  assert.equal(g.build('sprinkler', 2, 1).reason, 'blocked');
  assert.equal(g.build('sprinkler', 1, 3).reason, 'blocked');
  assert.equal(g.build('nope', 5, 0).reason, 'unknown');
});

test('build fails without enough gold', () => {
  const { g, s } = setup({ gold: 90 });
  assert.equal(g.build('sprinkler', 2, 0).reason, 'gold');
  assert.equal(s.gold, 90);
  assert.equal(s.towers.length, 0);
});

test('upgrade to level 3 then refuses; sell refunds 70% of invested', () => {
  const { g, s } = setup();
  const { tower } = g.build('sprinkler', 2, 0);
  assert.equal(g.upgrade(tower.id).ok, true);
  assert.equal(g.upgrade(tower.id).ok, true);
  assert.equal(tower.lvl, 3);
  assert.equal(g.upgrade(tower.id).reason, 'max');
  assert.equal(s.gold, 1000 - 100 - 150 - 250);
  assert.equal(g.sell(tower.id).refund, Math.floor(500 * 0.7));
  assert.equal(s.gold, 500 + 350);
  assert.equal(s.towers.length, 0);
});

test('start early pays 2 gold per remaining second', () => {
  const { g, s } = setup();
  run(g, 3.5);
  assert.equal(g.startNow(), 6 * 2);
  g.tick(0.01);
  assert.equal(s.wave, 1);
  assert.equal(g.startNow(), 0);
});

test('waves spawn by schedule with ant groups expanded', () => {
  const q = E.buildQueue([['caterpillar', 2, 1, 0], ['ant', 1, 1, 0.5]], 10, 0);
  assert.equal(q.length, 8);
  assert.equal(q[0].at, 10);
  assert.equal(q.filter((x) => x.type === 'ant').length, 6);
  assert.ok(q.every((x, i) => i === 0 || x.at >= q[i - 1].at));
});

test('enemy reaching goal bites the sprout and gives no gold', () => {
  const { g, s, has } = setup({ gold: 0 });
  g.spawn('snail', 10.9);
  g.tick(0.5);
  assert.equal(s.hp, 8);
  assert.equal(s.gold, 0);
  assert.ok(has('bite'));
});

test('losing all hp ends the level', () => {
  const { g, s, has } = setup();
  for (let i = 0; i < 5; i++) g.spawn('snail', 10.95);
  g.tick(0.2);
  assert.equal(s.status, 'lost');
  assert.ok(has('lose'));
  assert.equal(g.build('sprinkler', 5, 0).reason, 'over');
});

test('stars by remaining hp', () => {
  assert.deepEqual([10, 9, 6, 5, 1, 0].map(E.starsFor), [3, 2, 2, 1, 1, 0]);
});

test('hp scales with level and wave index', () => {
  assert.equal(E.hpScale(1, 0), 1);
  assert.ok(Math.abs(E.hpScale(3, 2) - 1.3 * 1.12) < 1e-9);
});

test('tower ignores enemies out of range and kills those in range for gold', () => {
  const { g, s, has } = setup({ gold: 100 });
  g.build('sprinkler', 9, 0);
  const far = g.spawn('caterpillar', 0);
  far.speed = 0;
  run(g, 2);
  assert.equal(far.hp, far.maxHp);
  const near = g.spawn('caterpillar', 9);
  near.speed = 0;
  run(g, 5);
  assert.ok(near.dead);
  assert.equal(s.gold, 10);
  assert.ok(has('kill'));
});

test('default target is the bug closest to the sprout', () => {
  const { g } = setup();
  const t = g.build('sprinkler', 5, 0).tower;
  const back = g.spawn('caterpillar', 4);
  const front = g.spawn('caterpillar', 6);
  back.speed = 0;
  front.speed = 0;
  g.tick(1 / 60);
  assert.equal(g.state.shots[0].target.id, front.id);
  assert.ok(t.angle > 0);
});

test('focus target overrides default priority and toggles off', () => {
  const { g } = setup();
  g.build('sprinkler', 5, 0);
  const back = g.spawn('caterpillar', 4);
  g.spawn('caterpillar', 6);
  assert.deepEqual(g.setFocus(back), { kind: 'enemy', id: back.id });
  g.tick(1 / 60);
  assert.equal(g.state.shots[0].target.id, back.id);
  assert.equal(g.setFocus(back), null);
});

test('slow keeps the strongest value and refreshes duration', () => {
  const { g } = setup();
  const strong = g.build('mint', 5, 0).tower;
  g.upgrade(strong.id);
  g.upgrade(strong.id);
  g.build('mint', 5, 2);
  const e = g.spawn('snail', 5);
  g.tick(1 / 60);
  assert.equal(e.slow, 0.5);
  run(g, 1.6);
  assert.equal(e.slow, 0.5);
  assert.ok(e.slowUntil > g.state.time);
});

test('snail shell reduces normal damage but not explosions', () => {
  const { g } = setup();
  g.build('sprinkler', 5, 0);
  const e = g.spawn('snail', 5);
  e.speed = 0;
  run(g, 0.5);
  assert.equal(e.maxHp - e.hp, 7);
  const { g: g2 } = setup();
  g2.build('chili', 5, 0);
  const e2 = g2.spawn('snail', 5);
  e2.speed = 0;
  run(g2, 0.8);
  assert.equal(e2.maxHp - e2.hp, 30);
});

test('chili cannot hit flying moths but the sprinkler can', () => {
  const { g } = setup();
  g.build('chili', 5, 0);
  const moth = g.spawn('moth', 5);
  moth.speed = 0;
  run(g, 3);
  assert.equal(moth.hp, moth.maxHp);
  g.build('sprinkler', 6, 0);
  run(g, 1);
  assert.ok(moth.hp < moth.maxHp);
});

test('cactus spikes pierce every bug in the line', () => {
  const { g } = setup({ map: ['S###G.'], obstacles: [] });
  g.build('cactus', 5, 0);
  const line = [2, 3, 3.5].map((d) => g.spawn('caterpillar', d));
  const behind = g.spawn('caterpillar', 1);
  [...line, behind].forEach((b) => { b.speed = 0; });
  g.tick(1 / 60);
  assert.ok(line.every((b) => b.maxHp - b.hp === 14));
  assert.equal(behind.hp, behind.maxHp);
});

test('chili splash hits every ground bug near the impact', () => {
  const { g } = setup();
  g.build('chili', 5, 0);
  const bugs = [5, 5.6, 7.5].map((d) => g.spawn('caterpillar', d));
  bugs.forEach((b) => { b.speed = 0; });
  g.setFocus(bugs[0]);
  run(g, 0.7);
  assert.deepEqual(bugs.map((b) => b.maxHp - b.hp), [30, 30, 0]);
});

test('hive bees prefer flying bugs', () => {
  const { g } = setup();
  g.build('hive', 5, 0);
  g.spawn('caterpillar', 8);
  const moth = g.spawn('moth', 3);
  g.tick(1 / 60);
  assert.equal(g.state.shots.length, 2);
  assert.ok(g.state.shots.every((sh) => sh.target.id === moth.id));
});

test('beetle king dashes once below half hp', () => {
  const { g, has } = setup();
  const boss = g.spawn('beetle', 1);
  g.state.towers.length = 0;
  boss.hp = boss.maxHp * 0.6;
  const before = boss.d;
  g.tick(0.1);
  const normal = boss.d - before;
  boss.hp = boss.maxHp * 0.5 + 1;
  g.build('chili', 2, 0);
  run(g, 0.7);
  assert.ok(has('dash'));
  const mid = boss.d;
  g.state.towers.length = 0;
  g.tick(0.1);
  assert.ok(Math.abs(boss.d - mid - normal * 2) < 1e-9);
});

test('obstacles are only attacked when focused; clearing pays gold and drops the gift tower', () => {
  const { g, s, has } = setup({ gold: 100 });
  g.build('sprinkler', 1, 2);
  run(g, 2);
  const rock = g.obstacleAt(1, 3);
  assert.equal(rock.hp, rock.maxHp);
  g.setFocus(rock);
  run(g, 9);
  assert.equal(g.obstacleAt(1, 3), null);
  assert.ok(has('clear'));
  assert.equal(s.gold, 20);
  const gift = g.towerAt(1, 3);
  assert.equal(gift.type, 'sprinkler');
  assert.equal(g.sellValue(gift), 70);
});

test('clearing a 2x2 obstacle frees all four cells', () => {
  const { g } = setup();
  const boulder = g.obstacleAt(4, 4);
  assert.equal(g.canBuildAt(4, 4), false);
  boulder.hp = 1;
  g.build('sprinkler', 5, 3);
  g.setFocus(boulder);
  run(g, 1);
  assert.ok([[3, 3], [4, 3], [3, 4], [4, 4]].every(([c, r]) => g.canBuildAt(c, r)));
});

test('winning after the last wave rates stars', () => {
  const { g, s, has } = setup({ waves: [[['caterpillar', 2, 1]]] });
  g.build('sprinkler', 2, 0);
  g.build('sprinkler', 4, 2);
  g.startNow();
  run(g, 20);
  assert.equal(s.status, 'won');
  assert.equal(s.stars, 3);
  assert.ok(has('win'));
});

