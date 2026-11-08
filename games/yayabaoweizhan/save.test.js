const test = require('node:test');
const assert = require('node:assert/strict');
const S = require('./save.js');

const memory = (initial) => {
  const m = new Map(initial ? [[S.KEY, initial]] : []);
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, v) };
};

test('missing or corrupt data resets to empty progress', () => {
  assert.deepEqual(S.load(memory(), 6), { best: {}, muted: false });
  assert.deepEqual(S.load(memory('{not json'), 6), { best: {}, muted: false });
  assert.deepEqual(S.load(memory('[1,2]'), 6), { best: {}, muted: false });
});

test('out-of-range values are dropped', () => {
  const raw = JSON.stringify({ best: { 1: 3, 2: 9, 3: 'x', 4: 2.5, 7: 3 }, muted: 'yes' });
  assert.deepEqual(S.load(memory(raw), 6), { best: { 1: 3 }, muted: false });
});

test('round trip through storage', () => {
  const store = memory();
  assert.equal(S.save(store, { best: { 1: 2 }, muted: true }), true);
  assert.deepEqual(S.load(store, 6), { best: { 1: 2 }, muted: true });
  assert.equal(S.save({ setItem() { throw new Error('quota'); } }, {}), false);
});

test('levels unlock in order and record keeps the best result without mutating', () => {
  const empty = { best: {}, muted: false };
  assert.equal(S.isUnlocked(empty, 1), true);
  assert.equal(S.isUnlocked(empty, 2), false);
  const after = S.record(empty, 1, 2);
  assert.deepEqual(empty.best, {});
  assert.equal(S.isUnlocked(after, 2), true);
  assert.equal(S.record(after, 1, 1), after);
  assert.equal(S.totalStars(S.record(after, 2, 3)), 5);
});
