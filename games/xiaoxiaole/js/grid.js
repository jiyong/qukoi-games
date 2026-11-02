'use strict';
(function () {
  const N = PVZ.SIZE;
  const KINDS = PVZ.PLANTS.length;
  let nextId = 1;

  const idx = (r, c) => r * N + c;
  const rc = (i) => [Math.floor(i / N), i % N];
  const at = (dir, a, b) => (dir === 'h' ? idx(a, b) : idx(b, a));
  const inside = (r, c) => r >= 0 && r < N && c >= 0 && c < N;
  const makeCell = (type, special = '') => ({ id: nextId++, type, special });
  const randType = () => Math.floor(Math.random() * KINDS);

  function isAdjacent(a, b) {
    const [r1, c1] = rc(a);
    const [r2, c2] = rc(b);
    return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
  }

  function swap(g, a, b) {
    const out = g.slice();
    out[a] = g[b];
    out[b] = g[a];
    return out;
  }

  function findRuns(g) {
    const runs = [];
    for (const dir of ['h', 'v']) {
      for (let a = 0; a < N; a++) {
        let start = 0;
        for (let b = 1; b <= N; b++) {
          const t = g[at(dir, a, start)].type;
          if (b < N && t >= 0 && g[at(dir, a, b)].type === t) continue;
          if (t >= 0 && b - start >= 3) {
            const cells = [];
            for (let k = start; k < b; k++) cells.push(at(dir, a, k));
            runs.push({ dir, type: t, cells });
          }
          start = b;
        }
      }
    }
    return runs;
  }

  function findGroups(g) {
    const groups = [];
    for (const run of findRuns(g)) {
      const merged = { type: run.type, set: new Set(run.cells), runs: [run] };
      for (const other of groups.filter((gr) => gr.type === run.type && run.cells.some((i) => gr.set.has(i)))) {
        other.set.forEach((i) => merged.set.add(i));
        merged.runs.push(...other.runs);
        groups.splice(groups.indexOf(other), 1);
      }
      groups.push(merged);
    }
    return groups.map((gr) => ({ type: gr.type, cells: [...gr.set], runs: gr.runs }));
  }

  function groupSpecial(group) {
    const longest = Math.max(...group.runs.map((r) => r.cells.length));
    if (longest >= 5) return 'food';
    if (new Set(group.runs.map((r) => r.dir)).size > 1) return 'bomb';
    if (longest === 4) return group.runs[0].dir === 'h' ? 'row' : 'col';
    return '';
  }

  function lineAt(g, i) {
    const t = g[i].type;
    if (t < 0) return false;
    const [r, c] = rc(i);
    const count = (dr, dc) => {
      let n = 0;
      for (let rr = r + dr, cc = c + dc; inside(rr, cc) && g[idx(rr, cc)].type === t; rr += dr, cc += dc) n++;
      return n;
    };
    return count(0, 1) + count(0, -1) >= 2 || count(1, 0) + count(-1, 0) >= 2;
  }

  function findMove(g) {
    for (let i = 0; i < N * N; i++) {
      const [r, c] = rc(i);
      if (g[i].type < 0) return [i, c < N - 1 ? i + 1 : i - 1];
      for (const j of [c < N - 1 ? i + 1 : -1, r < N - 1 ? i + N : -1]) {
        if (j < 0) continue;
        const s = swap(g, i, j);
        if (lineAt(s, i) || lineAt(s, j)) return [i, j];
      }
    }
    return null;
  }

  PVZ.Grid = { N, KINDS, idx, rc, inside, makeCell, randType, isAdjacent, swap, findRuns, findGroups, groupSpecial, findMove };
})();
