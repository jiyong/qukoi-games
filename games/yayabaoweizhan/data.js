(function (root) {
  'use strict';

  const TOWERS = {
    sprinkler: {
      name: '喷壶塔', desc: '单体水弹，可打飞行', cost: 100, upgrade: [150, 250],
      attack: 'bullet', air: true, damage: [10, 18, 30], rate: [1.0, 0.8, 0.7], range: [2.5, 2.8, 3.2],
    },
    mint: {
      name: '薄荷霜', desc: '范围冷气，减速', cost: 140, upgrade: [180, 260],
      attack: 'aura', air: true, damage: [4, 8, 12], rate: 1.5, range: [2.0, 2.3, 2.6],
      slow: [0.3, 0.4, 0.5], slowTime: 1.5,
    },
    cactus: {
      name: '仙人掌', desc: '直线尖刺，穿透', cost: 160, upgrade: [220, 320],
      attack: 'pierce', air: true, damage: [14, 24, 38], rate: 1.2, range: 3.0,
    },
    chili: {
      name: '辣椒炮', desc: '爆炸溅射，打不到飞行', cost: 220, upgrade: [280, 400],
      attack: 'shell', air: false, damage: [30, 50, 80], rate: 2.0, range: 3.5, splash: [1.0, 1.2, 1.4],
    },
    hive: {
      name: '蜂箱', desc: '追踪蜜蜂，优先飞行', cost: 260, upgrade: [300, 420],
      attack: 'bee', air: true, prefersAir: true, damage: [8, 8, 10], bees: [2, 3, 4], rate: 1.4, range: 4.0,
    },
  };
  const TOWER_ORDER = ['sprinkler', 'mint', 'cactus', 'chili', 'hive'];

  // weight: how many "basic bugs" one unit is worth when sizing a wave.
  const ENEMIES = {
    caterpillar: { name: '小青虫', hp: 40, speed: 1.0, bite: 1, gold: 10, weight: 1 },
    ladybug: { name: '瓢虫', hp: 30, speed: 1.8, bite: 1, gold: 12, weight: 1 },
    snail: { name: '蜗牛', hp: 160, speed: 0.6, bite: 2, gold: 25, armor: 0.3, weight: 2.5 },
    moth: { name: '飞蛾', hp: 50, speed: 1.4, bite: 1, gold: 15, flying: true, weight: 1.2 },
    ant: { name: '蚁群', hp: 15, speed: 1.3, bite: 1, gold: 4, group: 6, weight: 3 },
    beetle: { name: '甲虫王', hp: 1200, speed: 0.5, bite: 5, gold: 150, boss: true, weight: 10 },
  };

  const OBSTACLES = {
    rock: { name: '石头', size: 1, hp: 80, gold: 20 },
    stump: { name: '木桩', size: 1, hp: 150, gold: 40 },
    mushroom: { name: '蘑菇丛', size: 1, hp: 120, gold: 30 },
    crate: { name: '菜筐', size: 1, hp: 100, gold: 25 },
    boulder: { name: '大石块', size: 2, hp: 600, gold: 120 },
    hay: { name: '草垛', size: 2, hp: 400, gold: 90 },
  };

  // Wave = list of groups [type, count, gap, delay].
  // The first two waves only use pool[0] so players can set up; heavy bugs (weight >= 2) wait until wave 4;
  // from wave 5 every other wave mixes in a second, smaller group.
  const WARMUP_WAVES = 2;
  const HEAVY_FROM = 3;
  function makeWaves(n, pool, extra = {}) {
    const waves = [];
    const light = pool.filter((t) => ENEMIES[t].weight < 2);
    for (let i = 0; i < n; i++) {
      const base = 5 + Math.floor(i * 0.7);
      const gap = Math.max(0.7, 1.4 - i * 0.035);
      const group = (type, share, delay) => {
        const w = ENEMIES[type].weight;
        const count = Math.max(1, Math.round((base * share) / w));
        return [type, count, Math.round(gap * Math.sqrt(w) * 100) / 100, delay];
      };
      const pick = (k) => {
        const type = pool[k % pool.length];
        return i < HEAVY_FROM && ENEMIES[type].weight >= 2 ? light[k % light.length] : type;
      };
      const wave = [group(i < WARMUP_WAVES ? pool[0] : pick(i), 1, 0)];
      if (i >= 4 && i % 2 === 0) wave.push(group(pick(i + 1), 0.5, 3));
      waves.push(wave.concat(extra[i + 1] || []));
    }
    return waves;
  }

  const LEVELS = [
    {
      id: 1, name: '晨露菜畦', gold: 500,
      map: [
        'xx..........',
        'S####.......',
        '....#.......',
        '..o.#..####.',
        '....#..#..#.',
        '....####oo#.',
        '.o......oo#G',
        '............',
      ],
      obstacles: [{ type: 'rock', c: 2, r: 3 }, { type: 'hay', c: 8, r: 5 }, { type: 'mushroom', c: 1, r: 6 }],
      waves: makeWaves(8, ['caterpillar', 'ladybug']),
    },
    {
      id: 2, name: '南瓜藤架', gold: 550,
      map: [
        '............',
        '..#####.....',
        '..#...#..oo.',
        '..#.o.#..oo.',
        'S##...#.....',
        '......#####.',
        '.x........#.',
        '..........G.',
      ],
      obstacles: [{ type: 'stump', c: 4, r: 3 }, { type: 'boulder', c: 9, r: 2 }],
      waves: makeWaves(10, ['caterpillar', 'ladybug', 'snail']),
    },
    {
      id: 3, name: '向日葵坡', gold: 600,
      map: [
        'S####.......',
        '....#...oo..',
        '.o..#...oo..',
        '....######..',
        '.o.......#..',
        '..########..',
        '..#.......o.',
        '..#########G',
      ],
      obstacles: [
        { type: 'boulder', c: 8, r: 1, gift: 'sprinkler' }, { type: 'crate', c: 1, r: 2, gift: 'cactus' },
        { type: 'crate', c: 1, r: 4 }, { type: 'rock', c: 10, r: 6 },
      ],
      waves: makeWaves(12, ['caterpillar', 'ant', 'ladybug', 'snail']),
    },
    {
      id: 4, name: '夜光菌林', gold: 750,
      map: [
        '....x.......',
        '.#######....',
        '.#.....#.oo.',
        '.#.oo..#.oo.',
        'S#.oo..#....',
        '.......#..o.',
        '.o.....####G',
        '............',
      ],
      obstacles: [
        { type: 'boulder', c: 3, r: 3, gift: 'chili' }, { type: 'hay', c: 9, r: 2 },
        { type: 'mushroom', c: 10, r: 5 }, { type: 'mushroom', c: 1, r: 6 },
      ],
      waves: makeWaves(14, ['caterpillar', 'moth', 'snail', 'ant', 'ladybug']),
    },
    {
      id: 5, name: '风车田埂', gold: 650,
      map: [
        'S##########x',
        '..........#.',
        '.##########.',
        '.#....o.....',
        '.##########.',
        '..........#.',
        '.o.oo.....#.',
        '...oo.....#G',
      ],
      obstacles: [{ type: 'rock', c: 1, r: 6 }, { type: 'boulder', c: 3, r: 6 }, { type: 'crate', c: 6, r: 3, gift: 'hive' }],
      waves: makeWaves(16, ['ladybug', 'moth', 'snail', 'ant', 'caterpillar']),
    },
    {
      id: 6, name: '老橡树根', gold: 700,
      map: [
        'xx.....####S',
        'xx.....#....',
        '..######..o.',
        '..#....oo...',
        '..#.o..oo...',
        '..#######...',
        '.o......#...',
        'G########...',
      ],
      obstacles: [
        { type: 'boulder', c: 7, r: 3, gift: 'mint' }, { type: 'rock', c: 4, r: 4 },
        { type: 'crate', c: 10, r: 2, gift: 'sprinkler' }, { type: 'mushroom', c: 1, r: 6 },
      ],
      waves: makeWaves(20, ['caterpillar', 'ladybug', 'snail', 'moth', 'ant'], {
        10: [['beetle', 1, 1, 4]],
        20: [['beetle', 2, 6, 3]],
      }),
    },
  ];

  const api = { TOWERS, TOWER_ORDER, ENEMIES, OBSTACLES, LEVELS, makeWaves };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.YayaData = api;
})(typeof window !== 'undefined' ? window : globalThis);
