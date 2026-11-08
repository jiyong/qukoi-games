(function (root) {
  'use strict';

  const isNode = typeof module !== 'undefined' && module.exports;
  const D = isNode ? require('./data.js') : root.YayaData;
  const M = isNode ? require('./map.js') : root.YayaMap;

  const MAX_HP = 10;
  const PREP_TIME = 15;
  const WAVE_BREAK = 8;
  const EARLY_BONUS = 2;
  const SELL_RATE = 0.7;
  const GROUP_GAP = 0.22;
  const SHOT_SPEED = { bullet: 9, bee: 6 };
  const SHELL_TIME = 0.6;
  const PIERCE_HALF_WIDTH = 0.4;
  const HIT_RADIUS = 0.15;
  const BEE_SEEK = 4;
  const DASH = { time: 2, mult: 2 };
  const FX_LIFE = { spike: 0.25, ring: 0.35, blast: 0.35 };

  const stat = (def, name, lvl) => (Array.isArray(def[name]) ? def[name][lvl - 1] : def[name]);
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const ref = (x) => ({ kind: x.kind, id: x.id });
  const fail = (reason) => ({ ok: false, reason });

  function hpScale(level, waveIdx) {
    return (1 + (level - 1) * 0.15) * (1 + waveIdx * 0.06);
  }

  function starsFor(hp) {
    if (hp >= MAX_HP) return 3;
    if (hp >= 6) return 2;
    return hp >= 1 ? 1 : 0;
  }

  function buildQueue(wave, start, waveIdx) {
    const queue = [];
    for (const [type, count, gap, delay = 0] of wave) {
      const group = D.ENEMIES[type].group || 1;
      for (let k = 0; k < count; k++) {
        for (let g = 0; g < group; g++) {
          queue.push({ at: start + delay + k * gap + g * GROUP_GAP, type, waveIdx });
        }
      }
    }
    return queue.sort((a, b) => a.at - b.at);
  }

  function createEngine(level, opts = {}) {
    const emit = opts.onEvent || (() => {});
    const map = M.parseMap(level.map);
    let nextId = 1;
    const s = {
      status: 'prep', level: level.id, map, path: map.path,
      gold: level.gold, hp: MAX_HP, maxHp: MAX_HP,
      wave: 0, totalWaves: level.waves.length,
      time: 0, nextWaveAt: PREP_TIME, queue: [],
      towers: [], enemies: [], obstacles: [], shots: [], focus: null, stars: 0,
    };

    placeObstacles(level.obstacles || []);

    function placeObstacles(list) {
      const covered = new Set();
      for (const o of list) {
        const def = D.OBSTACLES[o.type];
        if (!def) throw new Error(`obstacle: unknown type ${o.type}`);
        if (o.gift && !D.TOWERS[o.gift]) throw new Error(`obstacle: unknown gift ${o.gift}`);
        for (let r = o.r; r < o.r + def.size; r++) {
          for (let c = o.c; c < o.c + def.size; c++) {
            if (map.grid[r]?.[c] !== 'o') throw new Error(`obstacle ${o.type} at ${o.c},${o.r} must sit on "o" cells`);
            covered.add(`${c},${r}`);
          }
        }
        s.obstacles.push({
          kind: 'obstacle', id: nextId++, type: o.type, c: o.c, r: o.r, size: def.size,
          x: o.c + def.size / 2, y: o.r + def.size / 2,
          hp: def.hp, maxHp: def.hp, gold: def.gold, gift: o.gift || null, dead: false,
        });
      }
      map.grid.forEach((row, r) => row.forEach((ch, c) => {
        if (ch === 'o' && !covered.has(`${c},${r}`)) throw new Error(`map: "o" at ${c},${r} has no obstacle`);
      }));
    }

    const isOver = () => s.status === 'won' || s.status === 'lost';
    const towerAt = (c, r) => s.towers.find((t) => t.c === c && t.r === r) || null;
    const obstacleAt = (c, r) => s.obstacles.find((o) => !o.dead
      && c >= o.c && c < o.c + o.size && r >= o.r && r < o.r + o.size) || null;
    const canBuildAt = (c, r) => map.grid[r]?.[c] === '.' && !towerAt(c, r);
    const upgradeCost = (t) => (t.lvl >= 3 ? null : D.TOWERS[t.type].upgrade[t.lvl - 1]);
    const sellValue = (t) => Math.floor(t.invested * SELL_RATE);

    function resolve(target) {
      if (!target) return null;
      const list = target.kind === 'obstacle' ? s.obstacles : s.enemies;
      return list.find((x) => x.id === target.id && !x.dead) || null;
    }

    function addTower(type, c, r) {
      const tower = {
        kind: 'tower', id: nextId++, type, c, r, x: c + 0.5, y: r + 0.5,
        lvl: 1, invested: D.TOWERS[type].cost, cooldown: 0, angle: -Math.PI / 2,
      };
      s.towers.push(tower);
      return tower;
    }

    function build(type, c, r) {
      const def = D.TOWERS[type];
      if (!def) return fail('unknown');
      if (isOver()) return fail('over');
      if (!canBuildAt(c, r)) return fail('blocked');
      if (s.gold < def.cost) return fail('gold');
      s.gold -= def.cost;
      const tower = addTower(type, c, r);
      emit('build', { tower });
      return { ok: true, tower };
    }

    function upgrade(id) {
      const t = s.towers.find((x) => x.id === id);
      if (!t) return fail('missing');
      if (isOver()) return fail('over');
      const cost = upgradeCost(t);
      if (cost === null) return fail('max');
      if (s.gold < cost) return fail('gold');
      s.gold -= cost;
      t.invested += cost;
      t.lvl += 1;
      emit('upgrade', { tower: t });
      return { ok: true, tower: t };
    }

    function sell(id) {
      const i = s.towers.findIndex((x) => x.id === id);
      if (i < 0) return fail('missing');
      if (isOver()) return fail('over');
      const [t] = s.towers.splice(i, 1);
      const refund = sellValue(t);
      s.gold += refund;
      emit('sell', { tower: t, refund });
      return { ok: true, refund };
    }

    function setFocus(target) {
      const cur = resolve(s.focus);
      const next = resolve(target);
      s.focus = !next || (cur && cur.kind === next.kind && cur.id === next.id) ? null : ref(next);
      return s.focus;
    }

    function startNow() {
      if (s.status !== 'prep') return 0;
      const bonus = Math.floor(s.nextWaveAt - s.time) * EARLY_BONUS;
      s.gold += bonus;
      s.nextWaveAt = s.time;
      return bonus;
    }

    function startWave() {
      const idx = s.wave;
      s.wave += 1;
      s.status = 'playing';
      const queue = buildQueue(level.waves[idx], s.time, idx);
      s.queue.push(...queue);
      s.queue.sort((a, b) => a.at - b.at);
      s.nextWaveAt = Infinity;
      emit('wave', { wave: s.wave, total: s.totalWaves });
    }

    // The next wave is only scheduled once the current one is fully cleared, so waves never stack.
    function checkBreak() {
      if (s.status !== 'playing' || s.wave >= s.totalWaves) return;
      if (s.queue.length || s.enemies.length) return;
      s.status = 'prep';
      s.nextWaveAt = s.time + WAVE_BREAK;
      emit('cleared', { wave: s.wave, total: s.totalWaves });
    }

    function spawn(item) {
      const def = D.ENEMIES[item.type];
      const hp = Math.round(def.hp * hpScale(level.id, def.boss ? 0 : item.waveIdx));
      const p = M.pointAt(s.path, 0);
      s.enemies.push({
        kind: 'enemy', id: nextId++, type: item.type, x: p.x, y: p.y, dir: Math.atan2(p.dy, p.dx),
        d: 0, hp, maxHp: hp, speed: def.speed, flying: !!def.flying, armor: def.armor || 0,
        boss: !!def.boss, slow: 0, slowUntil: 0, dashUntil: 0, dashed: false, dead: false,
      });
    }

    function damage(target, amount, explosive = false) {
      if (!target || target.dead) return;
      const dealt = target.armor && !explosive ? amount * (1 - target.armor) : amount;
      target.hp -= dealt;
      if (target.boss && !target.dashed && target.hp > 0 && target.hp <= target.maxHp / 2) {
        target.dashed = true;
        target.dashUntil = s.time + DASH.time;
        emit('dash', { enemy: target });
      }
      if (target.hp > 0) return;
      target.dead = true;
      if (target.kind === 'obstacle') clearObstacle(target);
      else {
        const gold = D.ENEMIES[target.type].gold;
        s.gold += gold;
        emit('kill', { enemy: target, gold });
      }
      if (s.focus && s.focus.id === target.id) s.focus = null;
    }

    function clearObstacle(o) {
      for (let r = o.r; r < o.r + o.size; r++) {
        for (let c = o.c; c < o.c + o.size; c++) map.grid[r][c] = '.';
      }
      s.gold += o.gold;
      const tower = o.gift ? addTower(o.gift, o.c, o.r) : null;
      emit('clear', { obstacle: o, gold: o.gold, tower });
    }

    function slow(e, amount, time) {
      const active = e.slowUntil > s.time ? e.slow : 0;
      e.slow = Math.max(active, amount);
      e.slowUntil = s.time + time;
    }

    function moveEnemies(dt) {
      for (const e of s.enemies) {
        if (e.dead) continue;
        const slowed = e.slowUntil > s.time ? e.slow : 0;
        const dash = e.dashUntil > s.time ? DASH.mult : 1;
        e.d += e.speed * dash * (1 - slowed) * dt;
        if (e.d >= s.path.length) {
          e.dead = true;
          e.reached = true;
          const bite = D.ENEMIES[e.type].bite;
          s.hp = Math.max(0, s.hp - bite);
          emit('bite', { enemy: e, bite, hp: s.hp });
          if (s.focus && s.focus.id === e.id) s.focus = null;
          continue;
        }
        const p = M.pointAt(s.path, e.d);
        e.x = p.x;
        e.y = p.y;
        e.dir = Math.atan2(p.dy, p.dx);
      }
    }

    const reach = (t, x, range) => dist(t, x) <= range + (x.size ? (x.size - 1) / 2 : 0);
    const hittable = (def, e) => def.air || !e.flying;

    function pickTarget(t, def, range) {
      const f = resolve(s.focus);
      if (f && reach(t, f, range) && (f.kind === 'obstacle' || hittable(def, f))) return f;
      let best = null;
      for (const e of s.enemies) {
        if (e.dead || !hittable(def, e) || !reach(t, e, range)) continue;
        const better = !best
          || (def.prefersAir && e.flying !== best.flying ? e.flying : e.d > best.d);
        if (better) best = e;
      }
      return best;
    }

    const ATTACKS = {
      bullet(t, dmg, target) {
        s.shots.push({ kind: 'bullet', x: t.x, y: t.y, target: ref(target), dmg, speed: SHOT_SPEED.bullet });
      },
      bee(t, dmg, target, def) {
        const n = stat(def, 'bees', t.lvl);
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2;
          s.shots.push({
            kind: 'bee', x: t.x + Math.cos(a) * 0.25, y: t.y + Math.sin(a) * 0.25,
            target: ref(target), dmg, speed: SHOT_SPEED.bee, phase: a,
          });
        }
      },
      shell(t, dmg, target, def) {
        s.shots.push({
          kind: 'shell', x: t.x, y: t.y, sx: t.x, sy: t.y, tx: target.x, ty: target.y, h: 0,
          target: ref(target), dmg, splash: stat(def, 'splash', t.lvl), elapsed: 0,
        });
      },
      pierce(t, dmg, target, def, range) {
        const ux = Math.cos(t.angle);
        const uy = Math.sin(t.angle);
        for (const e of s.enemies) {
          if (e.dead || !hittable(def, e)) continue;
          const px = e.x - t.x;
          const py = e.y - t.y;
          const along = px * ux + py * uy;
          if (along >= 0 && along <= range && Math.abs(px * uy - py * ux) <= PIERCE_HALF_WIDTH) damage(e, dmg);
        }
        if (target.kind === 'obstacle') damage(target, dmg);
        s.shots.push({ kind: 'spike', x: t.x, y: t.y, angle: t.angle, len: range, life: FX_LIFE.spike, maxLife: FX_LIFE.spike });
      },
      aura(t, dmg, target, def, range) {
        const amount = stat(def, 'slow', t.lvl);
        for (const e of s.enemies) {
          if (e.dead || !hittable(def, e) || !reach(t, e, range)) continue;
          slow(e, amount, def.slowTime);
          damage(e, dmg);
        }
        if (target.kind === 'obstacle') damage(target, dmg);
        s.shots.push({ kind: 'ring', x: t.x, y: t.y, r: range, life: FX_LIFE.ring, maxLife: FX_LIFE.ring });
      },
    };

    function towersAct(dt) {
      for (const t of s.towers) {
        t.cooldown = Math.max(0, t.cooldown - dt);
        if (t.cooldown > 0) continue;
        const def = D.TOWERS[t.type];
        const range = stat(def, 'range', t.lvl);
        const target = pickTarget(t, def, range);
        if (!target) continue;
        t.angle = Math.atan2(target.y - t.y, target.x - t.x);
        ATTACKS[def.attack](t, stat(def, 'damage', t.lvl), target, def, range);
        t.cooldown = stat(def, 'rate', t.lvl);
        emit('fire', { tower: t });
      }
    }

    function nearestEnemy(p, maxDist) {
      let best = null;
      let bestD = maxDist;
      for (const e of s.enemies) {
        const d = dist(p, e);
        if (!e.dead && d <= bestD) {
          best = e;
          bestD = d;
        }
      }
      return best;
    }

    function stepHoming(sh, dt) {
      let target = resolve(sh.target);
      if (!target && sh.kind === 'bee') {
        target = nearestEnemy(sh, BEE_SEEK);
        if (target) sh.target = ref(target);
      }
      if (!target) return true;
      const d = dist(sh, target);
      const step = sh.speed * dt;
      if (d <= Math.max(step, HIT_RADIUS)) {
        damage(target, sh.dmg);
        return true;
      }
      sh.x += ((target.x - sh.x) / d) * step;
      sh.y += ((target.y - sh.y) / d) * step;
      sh.angle = Math.atan2(target.y - sh.y, target.x - sh.x);
      return false;
    }

    function stepShell(sh, dt) {
      sh.elapsed += dt;
      const k = Math.min(1, sh.elapsed / SHELL_TIME);
      sh.x = sh.sx + (sh.tx - sh.sx) * k;
      sh.y = sh.sy + (sh.ty - sh.sy) * k;
      sh.h = Math.sin(k * Math.PI);
      if (k < 1) return false;
      for (const e of s.enemies) {
        if (!e.dead && !e.flying && dist(sh, e) <= sh.splash) damage(e, sh.dmg, true);
      }
      const target = resolve(sh.target);
      if (target && target.kind === 'obstacle') damage(target, sh.dmg, true);
      s.shots.push({ kind: 'blast', x: sh.tx, y: sh.ty, r: sh.splash, life: FX_LIFE.blast, maxLife: FX_LIFE.blast });
      emit('blast', { x: sh.tx, y: sh.ty });
      return true;
    }

    function moveShots(dt) {
      const current = s.shots;
      s.shots = [];
      const kept = current.filter((sh) => {
        if (sh.life !== undefined) {
          sh.life -= dt;
          return sh.life > 0;
        }
        return !(sh.kind === 'shell' ? stepShell(sh, dt) : stepHoming(sh, dt));
      });
      s.shots = kept.concat(s.shots);
    }

    function checkEnd() {
      if (s.hp <= 0) {
        s.status = 'lost';
        emit('lose', {});
        return;
      }
      if (s.wave === s.totalWaves && s.queue.length === 0 && s.enemies.length === 0) {
        s.status = 'won';
        s.stars = starsFor(s.hp);
        emit('win', { stars: s.stars });
      }
    }

    function tick(dt) {
      if (isOver()) return;
      s.time += dt;
      if (s.status === 'prep' && s.time >= s.nextWaveAt) startWave();
      while (s.queue.length && s.queue[0].at <= s.time) spawn(s.queue.shift());
      moveEnemies(dt);
      towersAct(dt);
      moveShots(dt);
      s.enemies = s.enemies.filter((e) => !e.dead);
      s.obstacles = s.obstacles.filter((o) => !o.dead);
      checkEnd();
      if (!isOver()) checkBreak();
    }

    function enemyNear(x, y, radius) {
      return nearestEnemy({ x, y }, radius);
    }

    return {
      state: s, tick, build, upgrade, sell, setFocus, startNow,
      canBuildAt, towerAt, obstacleAt, enemyNear, upgradeCost, sellValue,
      spawn: (type, d = 0) => {
        spawn({ type, waveIdx: 0 });
        const e = s.enemies[s.enemies.length - 1];
        e.d = d;
        Object.assign(e, M.pointAt(s.path, d));
        return e;
      },
    };
  }

  const api = { createEngine, starsFor, hpScale, buildQueue, stat, MAX_HP, PREP_TIME, WAVE_BREAK, EARLY_BONUS, SELL_RATE };
  if (isNode) module.exports = api;
  else root.YayaEngine = api;
})(typeof window !== 'undefined' ? window : globalThis);
