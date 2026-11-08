const test = require('node:test');
const assert = require('node:assert/strict');
const { createGame, levelConfig } = require('./game.js');

const seq = (...vals) => { let i = 0; return () => vals[i++ % vals.length]; };
const NORMAL = 0.5;
const KING = 0.01;

function setup(rngVals = [NORMAL]) {
  const events = [];
  const g = createGame({ rng: seq(...rngVals), onEvent: (t, d) => events.push([t, d]) });
  g.start(0);
  return { g, events };
}

function spawnTwo(g) {
  g.tick(1000);
  g.tick(3000);
  assert.equal(g.state.moles.length, 2);
}

test('level 1 config: 9 holes, 10s normal, 5s king, 300 target', () => {
  const c = levelConfig(1);
  assert.equal(c.holes, 9);
  assert.equal(c.stay.normal, 10000);
  assert.equal(c.stay.king, 5000);
  assert.equal(c.target, 300);
});

test('later levels add holes, shorten stay, raise target by 20', () => {
  const [a, b] = [levelConfig(1), levelConfig(2)];
  assert.ok(b.holes > a.holes);
  assert.ok(b.stay.normal < a.stay.normal);
  assert.ok(b.stay.king < a.stay.king);
  assert.equal(b.target, 320);
  assert.equal(levelConfig(3).target, 340);
});

test('endless mode starts at level 7 where holes and stay times are capped', () => {
  assert.equal(levelConfig(6).endless, false);
  const [l7, l9] = [levelConfig(7), levelConfig(9)];
  assert.equal(l7.endless, true);
  assert.equal(l7.round, 1);
  assert.equal(l9.round, 3);
  assert.equal(l9.holes, l7.holes);
  assert.deepEqual(l9.stay, l7.stay);
  assert.equal(l9.target, l7.target + 40);
});

test('never more than two moles at once', () => {
  const { g } = setup();
  for (let t = 0; t < 9000; t += 100) g.tick(t);
  assert.equal(g.state.moles.length, 2);
});

test('normal mole escapes after 10s, king after 5s', () => {
  const { g, events } = setup([KING, 0, NORMAL]);
  g.tick(1000);
  const king = g.state.moles[0];
  assert.equal(king.type, 'king');
  assert.equal(king.expiresAt - king.bornAt, 5000);
  g.tick(5999);
  assert.ok(g.state.moles.some((m) => m.id === king.id));
  g.tick(6000);
  assert.ok(events.some(([t, d]) => t === 'escape' && d.id === king.id));
});

test('normal hit +10, king hit +50', () => {
  let calls = 0;
  const g = createGame({ rng: () => (calls++ === 0 ? KING : NORMAL) });
  g.start(0);
  g.tick(1000);
  const king = g.state.moles[0];
  assert.equal(king.type, 'king');
  assert.equal(g.hit(king.holeId, 1100).points, 50);
  g.tick(5000);
  const mole = g.state.moles[0];
  assert.equal(mole.type, 'normal');
  assert.equal(g.hit(mole.holeId, 5100).points, 10);
  assert.equal(g.state.score, 60);
});

test('hitting both simultaneous moles removes one hole', () => {
  const { g, events } = setup();
  spawnTwo(g);
  const [a, b] = g.state.moles;
  g.hit(a.holeId, 3100);
  assert.equal(g.state.holes.length, 9);
  g.hit(b.holeId, 3200);
  assert.equal(g.state.holes.length, 8);
  assert.ok(events.some(([t]) => t === 'combo'));
});

test('a lone mole hit does not remove a hole', () => {
  const { g } = setup();
  g.tick(1000);
  g.hit(g.state.moles[0].holeId, 1100);
  assert.equal(g.state.holes.length, 9);
});

test('holes never drop below 7', () => {
  const { g } = setup();
  let t = 0;
  for (let round = 0; round < 6; round++) {
    t += 2000; g.tick(t);
    t += 2000; g.tick(t);
    for (const m of g.state.moles) g.hit(m.holeId, ++t);
  }
  assert.equal(g.state.holes.length, 7);
});

test('reaching target clears level; next level resets score and holes', () => {
  const { g, events } = setup([KING, 0]);
  let t = 0;
  while (g.state.status === 'playing') {
    t += 2000; g.tick(t);
    for (const m of g.state.moles) g.hit(m.holeId, ++t);
  }
  assert.equal(g.state.status, 'cleared');
  assert.ok(events.some(([e]) => e === 'clear'));
  g.nextLevel(t);
  assert.equal(g.state.level, 2);
  assert.equal(g.state.score, 0);
  assert.equal(g.state.target, 320);
  assert.equal(g.state.holes.length, levelConfig(2).holes);
});

test('pause freezes mole timers', () => {
  const { g } = setup();
  g.tick(1000);
  const id = g.state.moles[0].id;
  g.pause(2000);
  g.tick(50000);
  g.resume(50000);
  g.tick(50000);
  assert.ok(g.state.moles.some((m) => m.id === id));
});
