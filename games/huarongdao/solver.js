(function (root) {
  const COLS = 4;
  const ROWS = 5;
  const DIRS = [[0, -1], [0, 1], [-1, 0], [1, 0]];
  const GOAL = { x: 1, y: 3 };

  function keyOf(pieces) {
    const g = new Array(COLS * ROWS).fill('.');
    for (const p of pieces) {
      for (let dy = 0; dy < p.h; dy++) {
        for (let dx = 0; dx < p.w; dx++) g[(p.y + dy) * COLS + p.x + dx] = p.type;
      }
    }
    return g.join('');
  }

  function canMove(pieces, piece, dx, dy) {
    const nx = piece.x + dx;
    const ny = piece.y + dy;
    if (nx < 0 || ny < 0 || nx + piece.w > COLS || ny + piece.h > ROWS) return false;
    return pieces.every((o) => o.id === piece.id
      || nx >= o.x + o.w || o.x >= nx + piece.w
      || ny >= o.y + o.h || o.y >= ny + piece.h);
  }

  function isSolved(pieces) {
    const boss = pieces.find((p) => p.type === 'B');
    return boss.x === GOAL.x && boss.y === GOAL.y;
  }

  function moveOne(pieces, id, dx, dy) {
    return pieces.map((p) => (p.id === id ? { ...p, x: p.x + dx, y: p.y + dy } : p));
  }

  function occupancy(pieces) {
    const g = new Uint8Array(COLS * ROWS);
    for (const p of pieces) {
      for (let dy = 0; dy < p.h; dy++) {
        for (let dx = 0; dx < p.w; dx++) g[(p.y + dy) * COLS + p.x + dx] = 1;
      }
    }
    return g;
  }

  function fastCanMove(g, p, dx, dy) {
    const nx = p.x + dx;
    const ny = p.y + dy;
    if (nx < 0 || ny < 0 || nx + p.w > COLS || ny + p.h > ROWS) return false;
    for (let y = ny; y < ny + p.h; y++) {
      for (let x = nx; x < nx + p.w; x++) {
        const inside = x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.h;
        if (!inside && g[y * COLS + x]) return false;
      }
    }
    return true;
  }

  function solve(start, maxStates = 300000) {
    if (isSolved(start)) return { steps: 0, first: null };
    const seen = new Set([keyOf(start)]);
    const queue = [{ pieces: start, depth: 0, first: null }];
    for (let head = 0; head < queue.length && seen.size < maxStates; head++) {
      const node = queue[head];
      const g = occupancy(node.pieces);
      for (const p of node.pieces) {
        for (const [dx, dy] of DIRS) {
          if (!fastCanMove(g, p, dx, dy)) continue;
          const next = moveOne(node.pieces, p.id, dx, dy);
          const key = keyOf(next);
          if (seen.has(key)) continue;
          seen.add(key);
          const first = node.first || { id: p.id, dx, dy };
          if (isSolved(next)) return { steps: node.depth + 1, first };
          queue.push({ pieces: next, depth: node.depth + 1, first });
        }
      }
    }
    return null;
  }

  const api = { COLS, ROWS, DIRS, canMove, isSolved, moveOne, solve };
  root.Solver = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
