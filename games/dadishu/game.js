(function (root) {
  'use strict';

  const MAX_MOLES = 2;
  const MIN_HOLES = 7;
  const MAX_HOLES = 25;
  const SCORE = { normal: 10, king: 50 };
  const KING_CHANCE = 0.12;
  const SPAWN_DELAY = [350, 1100];
  const FIRST_SPAWN_DELAY = 600;

  function levelConfig(level) {
    const n = level - 1;
    return {
      level,
      holes: Math.min(9 + n * 3, MAX_HOLES),
      stay: {
        normal: Math.max(10000 - n * 1500, 2000),
        king: Math.max(5000 - n * 750, 1200),
      },
      target: 300 + n * 20,
    };
  }

  function createGame(opts = {}) {
    const rng = opts.rng || Math.random;
    const emit = opts.onEvent || (() => {});
    let nextHoleId = 0;
    let nextMoleId = 0;
    const s = {
      status: 'idle', level: 0, cfg: null, score: 0, total: 0,
      holes: [], moles: new Map(), nextSpawnAt: 0, pausedAt: 0,
    };

    const between = ([a, b]) => a + rng() * (b - a);
    const pick = (arr) => arr[Math.floor(rng() * arr.length)];
    const emptyHoles = () => s.holes.filter((id) => !s.moles.has(id));

    function startLevel(level, now) {
      s.level = level;
      s.cfg = levelConfig(level);
      s.score = 0;
      s.holes = Array.from({ length: s.cfg.holes }, () => nextHoleId++);
      s.moles.clear();
      s.status = 'playing';
      s.nextSpawnAt = now + FIRST_SPAWN_DELAY;
      emit('level', { level });
    }

    function spawn(now) {
      const free = emptyHoles();
      if (!free.length) return;
      const type = rng() < KING_CHANCE ? 'king' : 'normal';
      const mole = {
        id: nextMoleId++, holeId: pick(free), type,
        bornAt: now, expiresAt: now + s.cfg.stay[type], combo: false,
      };
      s.moles.set(mole.holeId, mole);
      emit('spawn', mole);
    }

    function freeSlot(now) {
      s.nextSpawnAt = Math.max(s.nextSpawnAt, now + between(SPAWN_DELAY));
    }

    function tick(now) {
      if (s.status !== 'playing') return;
      for (const mole of [...s.moles.values()]) {
        if (now < mole.expiresAt) continue;
        s.moles.delete(mole.holeId);
        freeSlot(now);
        emit('escape', mole);
      }
      if (s.moles.size < MAX_MOLES && now >= s.nextSpawnAt) {
        spawn(now);
        s.nextSpawnAt = now + between(SPAWN_DELAY);
      }
    }

    // Both moles of a simultaneous pair were hit: drop one empty hole.
    function combo(hitHoleId) {
      if (s.holes.length <= MIN_HOLES) return emit('combo', { holeId: null });
      const candidates = emptyHoles().filter((id) => id !== hitHoleId);
      const holeId = pick(candidates.length ? candidates : [hitHoleId]);
      s.holes = s.holes.filter((id) => id !== holeId);
      emit('combo', { holeId });
    }

    function hit(holeId, now) {
      if (s.status !== 'playing') return null;
      const mole = s.moles.get(holeId);
      if (!mole) {
        emit('miss', { holeId });
        return null;
      }
      s.moles.delete(holeId);
      const points = SCORE[mole.type];
      s.score += points;
      s.total += points;
      s.moles.forEach((other) => { other.combo = true; });
      emit('hit', { ...mole, points });
      if (mole.combo) combo(holeId);
      freeSlot(now);
      if (s.score >= s.cfg.target) {
        s.status = 'cleared';
        s.moles.clear();
        emit('clear', { level: s.level, score: s.score, total: s.total });
      }
      return { ...mole, points };
    }

    function pause(now) {
      if (s.status !== 'playing') return;
      s.status = 'paused';
      s.pausedAt = now;
    }

    function resume(now) {
      if (s.status !== 'paused') return;
      const shift = now - s.pausedAt;
      s.moles.forEach((m) => { m.bornAt += shift; m.expiresAt += shift; });
      s.nextSpawnAt += shift;
      s.status = 'playing';
    }

    return {
      start(now) { s.total = 0; startLevel(1, now); },
      nextLevel(now) { if (s.status === 'cleared') startLevel(s.level + 1, now); },
      tick, hit, pause, resume,
      get state() {
        return {
          status: s.status, level: s.level, score: s.score, total: s.total,
          target: s.cfg ? s.cfg.target : 0, holes: [...s.holes],
          moles: [...s.moles.values()].map((m) => ({ ...m })),
        };
      },
    };
  }

  const api = { createGame, levelConfig, MAX_MOLES, MIN_HOLES, SCORE };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Whack = api;
})(typeof window !== 'undefined' ? window : globalThis);
