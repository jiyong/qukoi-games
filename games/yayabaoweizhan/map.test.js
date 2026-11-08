const test = require('node:test');
const assert = require('node:assert/strict');
const { parseMap, pointAt } = require('./map.js');
const { LEVELS } = require('./data.js');
const { createEngine } = require('./engine.js');

test('straight map yields one unit per segment', () => {
  const m = parseMap(['....', 'S##G', '....']);
  assert.equal(m.path.length, 3);
  assert.deepEqual(m.start, { c: 0, r: 1 });
  assert.deepEqual(m.path.points[3], { x: 3.5, y: 1.5 });
});

test('path follows corners in order', () => {
  const m = parseMap(['S#..', '.#..', '.##G']);
  assert.deepEqual(m.path.cells.map((p) => `${p.c},${p.r}`), ['0,0', '1,0', '1,1', '1,2', '2,2', '3,2']);
});

test('pointAt interpolates and clamps', () => {
  const m = parseMap(['S##G']);
  assert.deepEqual(pointAt(m.path, 1.5), { x: 2, y: 0.5, dx: 1, dy: 0 });
  assert.equal(pointAt(m.path, -2).x, 0.5);
  assert.equal(pointAt(m.path, 99).x, 3.5);
});

test('invalid maps throw', () => {
  assert.throws(() => parseMap([]), /no rows/);
  assert.throws(() => parseMap(['S#G', '..']), /cols/);
  assert.throws(() => parseMap(['S#?G']), /bad char/);
  assert.throws(() => parseMap(['..#G']), /missing/);
  assert.throws(() => parseMap(['S#.G']), /dead end/);
  assert.throws(() => parseMap(['S##G', '.#..']), /branch/);
  assert.throws(() => parseMap(['S#G.', '...#']), /not on the path/);
});

test('every shipped level is valid and wave counts match the design', () => {
  assert.deepEqual(LEVELS.map((l) => l.waves.length), [8, 10, 12, 14, 16, 20]);
  for (const level of LEVELS) {
    assert.doesNotThrow(() => createEngine(level), `level ${level.id}`);
    assert.ok(level.gold >= 400 && level.gold <= 800);
  }
});

test('obstacles must match "o" cells', () => {
  const base = { id: 1, gold: 100, waves: [[['caterpillar', 1, 1]]] };
  assert.throws(() => createEngine({ ...base, map: ['S#G', '.o.'], obstacles: [] }), /no obstacle/);
  assert.throws(() => createEngine({ ...base, map: ['S#G', '...'], obstacles: [{ type: 'rock', c: 0, r: 1 }] }), /must sit/);
});
