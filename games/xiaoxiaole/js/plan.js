'use strict';
(function () {
  const Grid = PVZ.Grid;
  const { N, idx, rc, inside, makeCell, randType } = Grid;

  function createGrid() {
    const g = new Array(N * N);
    for (let i = 0; i < N * N; i++) {
      const [r, c] = rc(i);
      let t;
      do t = randType();
      while ((c >= 2 && g[i - 1].type === t && g[i - 2].type === t) || (r >= 2 && g[i - N].type === t && g[i - 2 * N].type === t));
      g[i] = makeCell(t);
    }
    return Grid.findMove(g) ? g : createGrid();
  }

  function collapse(placed) {
    const out = new Array(N * N);
    const spawn = {};
    for (let c = 0; c < N; c++) {
      const keep = [];
      for (let r = N - 1; r >= 0; r--) if (placed[idx(r, c)]) keep.push(placed[idx(r, c)]);
      const fresh = N - keep.length;
      for (let r = N - 1, k = 0; r >= 0; r--, k++) {
        if (k < keep.length) { out[idx(r, c)] = keep[k]; continue; }
        const cell = makeCell(randType());
        spawn[cell.id] = r - fresh;
        out[idx(r, c)] = cell;
      }
    }
    return { grid: out, spawn };
  }

  function shuffle(g) {
    for (let tries = 0; tries < 200; tries++) {
      const out = g.slice();
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      if (!Grid.findRuns(out).length && Grid.findMove(out)) return out;
    }
    return createGrid();
  }

  function tally(g, clear) {
    const counts = new Array(Grid.KINDS).fill(0);
    clear.forEach((i) => { if (g[i].type >= 0) counts[g[i].type]++; });
    return counts;
  }

  function mostCommonType(g) {
    const counts = tally(g, new Set(g.keys()));
    return counts.indexOf(Math.max(...counts));
  }

  function specialArea(g, i, special) {
    const [r, c] = rc(i);
    const out = [];
    if (special === 'row') for (let k = 0; k < N; k++) out.push(idx(r, k));
    if (special === 'col') for (let k = 0; k < N; k++) out.push(idx(k, c));
    if (special === 'bomb') {
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) if (inside(r + dr, c + dc)) out.push(idx(r + dr, c + dc));
    }
    if (special === 'food') {
      const t = mostCommonType(g);
      g.forEach((cell, k) => { if (cell.type === t) out.push(k); });
    }
    return out;
  }

  function expand(g, seed, fx, done = new Set()) {
    const clear = new Set(seed);
    const queue = [...seed];
    while (queue.length) {
      const i = queue.pop();
      const special = g[i].special;
      if (!special || done.has(i)) continue;
      done.add(i);
      fx.push({ kind: special, idx: i });
      for (const k of specialArea(g, i, special)) if (!clear.has(k)) { clear.add(k); queue.push(k); }
    }
    return clear;
  }

  function pivotOf(group) {
    const h = group.runs.find((r) => r.dir === 'h');
    const v = group.runs.find((r) => r.dir === 'v');
    const cross = h && v ? h.cells.find((i) => v.cells.includes(i)) : undefined;
    if (cross !== undefined) return cross;
    const longest = group.runs.reduce((a, b) => (b.cells.length > a.cells.length ? b : a));
    return longest.cells[Math.floor(longest.cells.length / 2)];
  }

  function build(g, groups, prefer) {
    const seed = new Set();
    const creates = [];
    for (const group of groups) {
      group.cells.forEach((i) => seed.add(i));
      const special = Grid.groupSpecial(group);
      if (!special) continue;
      const pivot = group.cells.find((i) => prefer.includes(i)) ?? pivotOf(group);
      if (!creates.some((c) => c.idx === pivot)) creates.push({ idx: pivot, special, type: special === 'food' ? -1 : group.type });
    }
    const fx = [];
    return { clear: expand(g, seed, fx), creates, fx };
  }

  function food(g, fi, oi) {
    const both = g[oi].type < 0;
    const seed = new Set([fi]);
    g.forEach((cell, i) => { if (both || cell.type === g[oi].type) seed.add(i); });
    const fx = [{ kind: 'food', idx: fi }];
    return { clear: expand(g, seed, fx, new Set(both ? [fi, oi] : [fi])), creates: [], fx };
  }

  Object.assign(Grid, { createGrid, collapse, shuffle, tally });
  PVZ.Plan = { build, food };
})();
