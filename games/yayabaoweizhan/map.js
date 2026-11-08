(function (root) {
  'use strict';

  const CHARS = new Set(['S', 'G', '#', '.', 'o', 'x']);
  const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  const key = (c, r) => `${c},${r}`;

  function parseMap(rows) {
    if (!Array.isArray(rows) || rows.length === 0) throw new Error('map: no rows');
    const cols = rows[0].length;
    let start = null;
    let goal = null;
    let roads = 0;
    const grid = rows.map((line, r) => {
      if (line.length !== cols) throw new Error(`map: row ${r} has ${line.length} cols, expected ${cols}`);
      return [...line].map((ch, c) => {
        if (!CHARS.has(ch)) throw new Error(`map: bad char "${ch}" at ${c},${r}`);
        if (ch === 'S') {
          if (start) throw new Error('map: more than one S');
          start = { c, r };
        }
        if (ch === 'G') {
          if (goal) throw new Error('map: more than one G');
          goal = { c, r };
        }
        if (ch === '#') roads++;
        return ch;
      });
    });
    if (!start || !goal) throw new Error('map: missing S or G');
    const cells = trace(grid, start, goal);
    if (cells.length - 2 !== roads) throw new Error('map: road cells not on the path');
    return { cols, rows: rows.length, grid, start, goal, path: makePath(cells) };
  }

  function walkable(grid, c, r) {
    const ch = grid[r] && grid[r][c];
    return ch === '#' || ch === 'G';
  }

  function trace(grid, start, goal) {
    const cells = [start];
    const seen = new Set([key(start.c, start.r)]);
    let cur = start;
    while (cur.c !== goal.c || cur.r !== goal.r) {
      const next = DIRS
        .map(([dc, dr]) => ({ c: cur.c + dc, r: cur.r + dr }))
        .filter((p) => !seen.has(key(p.c, p.r)) && walkable(grid, p.c, p.r));
      if (next.length === 0) throw new Error(`map: dead end at ${cur.c},${cur.r}`);
      if (next.length > 1) throw new Error(`map: branch at ${cur.c},${cur.r}`);
      [cur] = next;
      seen.add(key(cur.c, cur.r));
      cells.push(cur);
    }
    return cells;
  }

  // Consecutive cells are adjacent, so every segment has length 1 and distance == segment index.
  function makePath(cells) {
    return {
      cells,
      points: cells.map((p) => ({ x: p.c + 0.5, y: p.r + 0.5 })),
      length: cells.length - 1,
    };
  }

  function pointAt(path, d) {
    const t = Math.max(0, Math.min(d, path.length));
    const i = Math.min(Math.floor(t), path.length - 1);
    const f = t - i;
    const a = path.points[i];
    const b = path.points[i + 1];
    return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f, dx: b.x - a.x, dy: b.y - a.y };
  }

  const api = { parseMap, pointAt };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.YayaMap = api;
})(typeof window !== 'undefined' ? window : globalThis);
