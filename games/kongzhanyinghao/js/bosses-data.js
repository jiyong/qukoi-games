'use strict';

// Each attack entry is one track or an array of tracks fired concurrently; dur comes from the first track.
G.BOSSES = [
  {
    name: '海鹰', title: '重型轰炸机', art: 'bomber', color: '#6b7a4a', accent: '#ffcc33', bullet: '#ff5a3a',
    hw: 95, hh: 42, baseY: 140, muzzle: 24, score: 20000,
    phases: [
      { hp: 320, move: 'sway', atk: [
        { a: 'aimFan', dur: 2.4, every: 0.8, n: 3, spread: 0.5, s: 160 },
        { a: 'ring', dur: 2.4, every: 0.8, n: 10, s: 115 },
      ] },
      { hp: 380, move: 'sway', atk: [
        { a: 'twin', dur: 2.4, every: 0.3, dx: 55, s: 200 },
        { a: 'ring', dur: 3, every: 0.6, n: 14, s: 125, rot: 0.2 },
      ] },
    ],
  },
  {
    name: '毒蛇', title: '武装直升机', art: 'heli', color: '#4f6b3a', accent: '#ffe066', bullet: '#ffcc33',
    hw: 70, hh: 52, baseY: 150, muzzle: 30, score: 30000,
    phases: [
      { hp: 450, move: 'eight', atk: [
        { a: 'aimFan', dur: 2.8, every: 0.7, n: 5, spread: 0.8, s: 165 },
        { a: 'spiral', dur: 3, every: 0.1, arms: 2, step: 0.32, s: 145 },
      ] },
      { hp: 520, move: 'chase', atk: [
        [{ a: 'homing', dur: 3.6, every: 1.2, s: 160 }, { a: 'aimFan', every: 0.8, n: 3, spread: 0.3, s: 190 }],
        { a: 'ring', dur: 3, every: 0.5, n: 16, s: 130 },
      ] },
    ],
  },
  {
    name: '沙暴', title: '空中堡垒', art: 'fortress', color: '#a07a4a', accent: '#ff9a3a', bullet: '#ff8a2a',
    hw: 115, hh: 50, baseY: 135, muzzle: 30, score: 40000,
    phases: [
      { hp: 520, move: 'hover', atk: [
        { a: 'wall', dur: 4.5, every: 0.9, gap: 120, s: 135 },
        { a: 'twin', dur: 3, every: 0.6, dx: 75, n: 3, spread: 0.4, s: 180 },
      ] },
      { hp: 560, move: 'sway', atk: [
        { a: 'split', dur: 4, every: 1, s: 200, n: 12 },
        { a: 'spiral', dur: 3.5, every: 0.12, arms: 3, step: 0.25, s: 140 },
      ] },
      { hp: 620, move: 'hover', atk: [
        [{ a: 'ring', dur: 4, every: 0.8, n: 18, s: 120 }, { a: 'needles', every: 0.14, s: 290 }],
        { a: 'rain', dur: 3, every: 0.16, n: 2, s: 180 },
      ] },
    ],
  },
  {
    name: '雷霆', title: '风暴战舰', art: 'fortress', color: '#3a4a66', accent: '#9fe8ff', bullet: '#66ccff',
    hw: 115, hh: 50, baseY: 135, muzzle: 30, score: 50000,
    phases: [
      { hp: 650, move: 'sway', atk: [
        [{ a: 'laser', dur: 4.8, every: 2.4, angles: [-0.55, 0, 0.55] }, { a: 'aimFan', every: 0.8, n: 3, spread: 0.4, s: 170 }],
        { a: 'flower', dur: 3.6, every: 0.6, n: 12, s: 130, turn: 0.8 },
      ] },
      { hp: 700, move: 'eight', atk: [
        [{ a: 'aimLaser', dur: 5.4, every: 1.8, dx: 80 }, { a: 'ring', every: 0.9, n: 12, s: 125 }],
        { a: 'spiral', dur: 3.5, every: 0.12, arms: 4, step: 0.2, s: 150 },
      ] },
      { hp: 760, move: 'hover', atk: [
        [{ a: 'sweep', dur: 6, every: 3, arc: 2.2 }, { a: 'rain', every: 0.3, n: 2, s: 165 }],
        { a: 'split', dur: 3.2, every: 0.8, s: 210, n: 14 },
      ] },
    ],
  },
  {
    name: '深渊', title: '巨型飞艇', art: 'airship', color: '#2f5a6e', accent: '#33ffcc', bullet: '#66ff99',
    hw: 125, hh: 52, baseY: 135, muzzle: 34, score: 60000,
    phases: [
      { hp: 800, move: 'sway', atk: [
        [{ a: 'wall', dur: 4.5, every: 1, gap: 110, s: 140 }, { a: 'twin', every: 0.7, dx: 90, s: 190 }],
        { a: 'flower', dur: 3.6, every: 0.45, n: 14, s: 125, turn: 0.9 },
      ] },
      { hp: 850, move: 'hover', atk: [
        [{ a: 'minions', dur: 6, every: 3, form: 'kami', args: [4] }, { a: 'ring', every: 0.7, n: 16, s: 125 }],
        { a: 'spiral', dur: 4, every: 0.1, arms: 2, step: 0.28, both: true, s: 140 },
      ] },
      { hp: 900, move: 'eight', atk: [
        [{ a: 'homing', dur: 4, every: 1, s: 170 }, { a: 'needles', every: 0.16, s: 300 }],
        { a: 'laser', dur: 4.8, every: 1.6, angles: [-0.8, -0.4, 0, 0.4, 0.8], w: 16, warn: 1 },
      ] },
    ],
  },
  {
    name: '极光', title: '冰原飞翼', art: 'wing', color: '#cfe8f5', accent: '#7ae0ff', bullet: '#a0e8ff',
    hw: 125, hh: 40, baseY: 130, muzzle: 22, score: 70000,
    phases: [
      { hp: 850, move: 'sway', atk: [
        { a: 'fanDown', dur: 3.5, every: 0.25, n: 7, spread: 1.4, s: 170, wob: 0.4 },
        { a: 'flower', dur: 3.6, every: 0.5, n: 16, s: 130, turn: 1 },
      ] },
      { hp: 900, move: 'eight', atk: [
        [{ a: 'sweep', dur: 5, every: 2.5, n: 2, arc: 1.8, gapA: 0.9 }, { a: 'aimFan', every: 0.7, n: 3, spread: 0.3, s: 200 }],
        { a: 'split', dur: 3.2, every: 0.7, s: 210, n: 14 },
      ] },
      { hp: 950, move: 'hover', atk: [
        [{ a: 'spiral', dur: 4.5, every: 0.09, arms: 3, step: 0.22, both: true, s: 135 }],
        [{ a: 'wall', dur: 4.5, every: 0.9, gap: 100, s: 150 }, { a: 'needles', every: 0.2, s: 300 }],
      ] },
      { hp: 1000, move: 'chase', atk: [
        [{ a: 'cross', dur: 6, every: 3, n: 4, spin: 0.5 }, { a: 'ring', every: 0.8, n: 14, s: 120 }],
        { a: 'homing', dur: 3, every: 0.6, s: 180 },
      ] },
    ],
  },
  {
    name: '熔岩', title: '机械巨像', art: 'mech', color: '#5a3a30', accent: '#ffcc33', bullet: '#ff6633',
    hw: 90, hh: 70, baseY: 150, muzzle: 40, score: 80000,
    phases: [
      { hp: 900, move: 'sway', atk: [
        [{ a: 'twin', dur: 3.5, every: 0.18, dx: 70, s: 230 }],
        { a: 'split', dur: 3.5, every: 0.6, s: 220, n: 12, s2: 140 },
      ] },
      { hp: 950, move: 'hover', atk: [
        [{ a: 'rain', dur: 4, every: 0.12, n: 2, s: 190 }, { a: 'aimFan', every: 0.9, n: 5, spread: 0.6, s: 180, kind: 'big', r: 7 }],
        { a: 'flower', dur: 3.6, every: 0.4, n: 18, s: 135, turn: 1.1 },
      ] },
      { hp: 1000, move: 'eight', atk: [
        [{ a: 'aimLaser', dur: 5.4, every: 1.8, dx: 70, w: 26 }, { a: 'spiral', every: 0.12, arms: 3, step: 0.3, s: 140 }],
        { a: 'homing', dur: 3.6, every: 0.9, s: 180 },
      ] },
      { hp: 1100, move: 'chase', atk: [
        [{ a: 'sweep', dur: 6, every: 3, n: 3, arc: 1.6, gapA: 0.7 }, { a: 'ring', every: 1, n: 16, s: 120 }],
        [{ a: 'wall', dur: 4, every: 0.8, gap: 95, s: 160 }, { a: 'twin', every: 0.5, dx: 70, n: 3, spread: 0.3, s: 200 }],
      ] },
    ],
  },
  {
    name: '夜魔', title: '隐形战机', art: 'wing', color: '#20202c', accent: '#ff66cc', bullet: '#cc66ff',
    hw: 125, hh: 40, baseY: 135, muzzle: 22, score: 90000,
    phases: [
      { hp: 950, move: 'chase', atk: [
        [{ a: 'needles', dur: 3, every: 0.07, s: 330, jit: 0.12 }],
        { a: 'flower', dur: 3.6, every: 0.35, n: 16, s: 135, turn: 1.2 },
      ] },
      { hp: 1000, move: 'eight', atk: [
        [{ a: 'spiral', dur: 4.5, every: 0.08, arms: 4, step: 0.17, both: true, s: 140 }],
        [{ a: 'minions', dur: 4, every: 2, form: 'swoopL', args: ['scout', 4] }, { a: 'split', every: 0.8, s: 220, n: 14 }],
      ] },
      { hp: 1050, move: 'sway', atk: [
        [{ a: 'cross', dur: 6, every: 3, n: 6, spin: -0.45 }, { a: 'aimFan', every: 0.6, n: 3, spread: 0.35, s: 200 }],
        { a: 'rain', dur: 3.5, every: 0.08, n: 2, s: 200 },
      ] },
      { hp: 1150, move: 'chase', atk: [
        [{ a: 'homing', dur: 5, every: 0.8, s: 190 }, { a: 'ring', every: 0.6, n: 20, s: 125 }],
        [{ a: 'aimLaser', dur: 5.4, every: 1.4 }, { a: 'fanDown', every: 0.4, n: 9, spread: 1.8, s: 150 }],
      ] },
    ],
  },
  {
    name: '天穹', title: '轨道要塞', art: 'station', color: '#4a5a7a', accent: '#ff3366', bullet: '#66ccff',
    hw: 110, hh: 80, baseY: 160, muzzle: 0, score: 120000,
    phases: [
      { hp: 1000, move: 'hover', atk: [
        { a: 'spiral', dur: 4, every: 0.08, arms: 5, step: 0.15, s: 135 },
        { a: 'split', dur: 3.2, every: 0.6, s: 220, n: 16 },
      ] },
      { hp: 1050, move: 'sway', atk: [
        [{ a: 'cross', dur: 6, every: 3, n: 4, spin: 0.55 }, { a: 'flower', every: 0.7, n: 12, s: 120, turn: 0.9 }],
        { a: 'wall', dur: 4, every: 0.7, gap: 95, s: 160 },
      ] },
      { hp: 1100, move: 'eight', atk: [
        [{ a: 'homing', dur: 4, every: 0.7, s: 190 }, { a: 'needles', every: 0.1, s: 320 }],
        [{ a: 'laser', dur: 4.8, every: 1.6, angles: [-0.9, -0.3, 0.3, 0.9], w: 18 }, { a: 'ring', every: 0.8, n: 16, s: 125 }],
      ] },
      { hp: 1150, move: 'hover', atk: [
        [{ a: 'spiral', dur: 5, every: 0.07, arms: 3, step: 0.21, both: true, s: 145 }, { a: 'aimLaser', every: 2.2 }],
      ] },
      { hp: 1250, move: 'chase', atk: [
        [{ a: 'sweep', dur: 6, every: 3, n: 3, arc: 2, gapA: 0.8 }, { a: 'rain', every: 0.2, n: 2, s: 180 }, { a: 'aimFan', every: 1, n: 5, spread: 0.7, s: 190 }],
        [{ a: 'split', dur: 3.5, every: 0.5, s: 230, n: 16 }],
      ] },
    ],
  },
  {
    name: '虚空之心', title: '异星母核', art: 'core', color: '#3c0050', accent: '#ff3c8a', bullet: '#ff3c8a',
    hw: 80, hh: 80, baseY: 170, muzzle: 0, score: 200000,
    phases: [
      { hp: 1100, move: 'sway', atk: [
        [{ a: 'flower', dur: 4, every: 0.3, n: 18, s: 135, turn: 1.1 }],
        [{ a: 'homing', dur: 3.5, every: 0.7, s: 190 }, { a: 'needles', every: 0.12, s: 320 }],
      ] },
      { hp: 1150, move: 'eight', atk: [
        [{ a: 'cross', dur: 6, every: 3, n: 5, spin: 0.6 }, { a: 'ring', every: 0.6, n: 18, s: 125 }],
        { a: 'split', dur: 3.5, every: 0.5, s: 230, n: 16, color: '#cc66ff' },
      ] },
      { hp: 1200, move: 'hover', atk: [
        [{ a: 'spiral', dur: 5, every: 0.07, arms: 4, step: 0.19, both: true, s: 140, color: '#66ccff' }],
        [{ a: 'wall', dur: 4, every: 0.7, gap: 90, s: 165 }, { a: 'aimLaser', every: 1.6 }],
      ] },
      { hp: 1300, move: 'chase', atk: [
        [{ a: 'sweep', dur: 6, every: 3, n: 4, arc: 1.8, gapA: 0.6 }, { a: 'flower', every: 0.8, n: 12, s: 120, turn: 1 }],
        [{ a: 'minions', dur: 4, every: 2, form: 'kami', args: [5] }, { a: 'rain', every: 0.12, n: 2, s: 190 }],
      ] },
      { hp: 1500, move: 'eight', atk: [
        [{ a: 'spiral', dur: 6, every: 0.06, arms: 5, step: 0.13, s: 135, color: '#ffcc33' }, { a: 'cross', every: 3, n: 3, spin: -0.5 }, { a: 'homing', every: 1.5, s: 180 }],
        [{ a: 'split', dur: 4, every: 0.45, s: 240, n: 18 }, { a: 'needles', every: 0.1, s: 340 }],
      ] },
    ],
  },
];
