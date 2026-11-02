'use strict';
(function () {
  const { Grid, Board, Plan } = PVZ;
  const T_SWAP = 190;
  const T_CLEAR = 270;
  const T_FALL = 290;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  function average(points) {
    const sum = points.reduce((s, p) => ({ x: s.x + p.x, y: s.y + p.y }), { x: 0, y: 0 });
    return { x: sum.x / points.length, y: sum.y / points.length };
  }

  function applyPlan(G, plan, chain) {
    const g = G.grid;
    const mult = 1 + (chain - 1) * 0.25;
    const cells = [...plan.clear];
    Board.markClearing(g, plan.clear);
    plan.fx.forEach(PVZ.Effects.special);
    PVZ.Attack(Grid.tally(g, plan.clear), mult);
    PVZ.Audio.play('pop', chain);

    const suns = cells.filter((i) => g[i].type === PVZ.TYPE.SUN).map((i) => Board.centerOf(i));
    if (suns.length) PVZ.Effects.suns(suns, () => PVZ.Game.addSun(Math.round(PVZ.SUN_PER_TILE * mult)));

    const pts = cells.length * 10 * chain;
    PVZ.Game.addScore(pts);
    const mid = average(cells.map((i) => Board.centerOf(i)));
    PVZ.Effects.floatText(mid.x, mid.y, `+${pts}`);
    if (chain > 1) PVZ.Effects.combo(chain);
  }

  async function cascade(G, first) {
    let plan = first;
    for (let chain = 1; plan; chain++) {
      applyPlan(G, plan, chain);
      await wait(T_CLEAR);
      const placed = G.grid.map((cell, i) => (plan.clear.has(i) ? null : cell));
      plan.creates.forEach((c) => { placed[c.idx] = Grid.makeCell(c.type, c.special); });
      const { grid, spawn } = Grid.collapse(placed);
      G.grid = grid;
      Board.render(grid, spawn);
      await wait(T_FALL);
      if (!G.running) return;
      const groups = Grid.findGroups(G.grid);
      plan = groups.length ? Plan.build(G.grid, groups, []) : null;
    }
    if (!Grid.findMove(G.grid)) {
      PVZ.UI.banner('没有可走的步了，洗牌！');
      await wait(600);
      G.grid = Grid.shuffle(G.grid);
      Board.render(G.grid);
      await wait(T_FALL);
    }
  }

  function planFor(G, a, b, A, B) {
    if (A.type < 0) return Plan.food(G.grid, b, a);
    if (B.type < 0) return Plan.food(G.grid, a, b);
    const groups = Grid.findGroups(G.grid);
    return groups.length ? Plan.build(G.grid, groups, [a, b]) : null;
  }

  async function swap(G, a, b) {
    if (G.busy || !G.running || G.paused) return;
    G.busy = true;
    PVZ.Game.touch();
    const A = G.grid[a];
    const B = G.grid[b];
    G.grid = Grid.swap(G.grid, a, b);
    Board.render(G.grid);
    PVZ.Audio.play('swap');
    await wait(T_SWAP);
    const plan = planFor(G, a, b, A, B);
    if (plan) {
      await cascade(G, plan);
    } else {
      G.grid = Grid.swap(G.grid, a, b);
      Board.render(G.grid);
      PVZ.Audio.play('bad');
      await wait(T_SWAP);
    }
    G.busy = false;
  }

  PVZ.Resolve = { swap };
})();
