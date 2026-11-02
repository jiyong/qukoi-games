'use strict';
window.PVZ = {
  SIZE: 8,
  FOOD_COST: 150,
  START_SUN: 50,
  SUN_PER_TILE: 10,
  HINT_AFTER: 6,
  STORE_KEY: 'pvz-m3-level',
  TYPE: { PEA: 0, SUN: 1, NUT: 2, ICE: 3, CHERRY: 4, CHOMP: 5 },
  PLANTS: [
    { id: 'pea', name: '豌豆射手', desc: '射击最前面的僵尸' },
    { id: 'sun', name: '向日葵', desc: '收集阳光买能量豆' },
    { id: 'nut', name: '坚果墙', desc: '把僵尸撞回去' },
    { id: 'ice', name: '寒冰射手', desc: '伤害并冻慢僵尸' },
    { id: 'cherry', name: '樱桃炸弹', desc: '炸伤一片僵尸' },
    { id: 'chomp', name: '大嘴花', desc: '狠咬最前面的僵尸' },
  ],
  ZOMBIES: {
    basic: { name: '普通僵尸', hp: 8, speed: 3.0 },
    flag: { name: '旗帜僵尸', hp: 8, speed: 4.2 },
    cone: { name: '路障僵尸', hp: 18, speed: 2.8 },
    bucket: { name: '铁桶僵尸', hp: 32, speed: 2.4 },
  },
  ATTACK: {
    pea: 1,
    ice: 0.8,
    slowSec: 4,
    slowFactor: 0.45,
    chomp: 1.6,
    cherry: 0.9,
    cherryRange: 24,
    nutPush: 3.5,
    nutDamage: 0.4,
  },
  LEVELS: [
    { total: 5, mix: { basic: 1 }, gap: 7 },
    { total: 8, mix: { basic: 3, cone: 1 }, gap: 6.5 },
    { total: 10, mix: { basic: 3, cone: 2, flag: 1 }, gap: 6 },
    { total: 12, mix: { basic: 2, cone: 2, flag: 1, bucket: 1 }, gap: 5.5 },
    { total: 15, mix: { basic: 2, cone: 3, flag: 1, bucket: 2 }, gap: 5 },
  ],
};

PVZ.levelSpec = function levelSpec(n) {
  if (n <= PVZ.LEVELS.length) return PVZ.LEVELS[n - 1];
  const k = n - PVZ.LEVELS.length;
  return {
    total: 15 + k * 2,
    mix: { basic: 2, cone: 3, flag: 2, bucket: 2 + k },
    gap: Math.max(3, 5 - k * 0.25),
  };
};

PVZ.buildWave = function buildWave(spec) {
  const entries = Object.entries(spec.mix);
  const sum = entries.reduce((s, [, w]) => s + w, 0);
  const pick = () => {
    let r = Math.random() * sum;
    for (const [type, w] of entries) {
      r -= w;
      if (r < 0) return type;
    }
    return entries[0][0];
  };
  return Array.from({ length: spec.total }, (_, i) => (i === 0 ? 'basic' : pick()));
};
