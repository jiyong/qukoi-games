'use strict';

const BA_TAU = Math.PI * 2;
const BA_DOWN = Math.PI / 2;
const bopt = (B, o) => ({ color: o.color || B.d.bullet, kind: o.kind, r: o.r });
const muzzle = (B, o) => [B.x + (o.dx || 0), B.y + (o.oy ?? B.d.muzzle)];

function laserFrom(B, o, offx, a, extra) {
  const offy = o.oy ?? B.d.muzzle;
  G.spawnLaser({
    owner: B,
    offx,
    offy,
    x: B.x + offx,
    y: B.y + offy,
    a,
    w: o.w || 22,
    warn: o.warn || 0.9,
    dur: o.ldur || 1.2,
    color: o.lcolor || B.d.accent,
    ...extra,
  });
}

G.BA = {
  aimFan(B, k, o) {
    const [x, y] = muzzle(B, o);
    G.pat.aimed(x, y, o.s, o.n || 1, o.spread || 0, bopt(B, o));
  },
  twin(B, k, o) {
    const y = B.y + (o.oy ?? B.d.muzzle);
    for (const sx of [-1, 1]) G.pat.aimed(B.x + sx * o.dx, y, o.s, o.n || 1, o.spread || 0, bopt(B, o));
  },
  fanDown(B, k, o) {
    const [x, y] = muzzle(B, o);
    const wob = Math.sin(k * 0.6) * (o.wob || 0.3);
    G.pat.fan(x, y, BA_DOWN + wob, o.n, o.spread, o.s, bopt(B, o));
  },
  ring(B, k, o) {
    const [x, y] = muzzle(B, o);
    G.pat.ring(x, y, o.n, o.s, k * (o.rot ?? 0.13), bopt(B, o));
  },
  spiral(B, k, o) {
    const [x, y] = muzzle(B, o);
    const arms = o.arms || 1;
    const dirs = o.both ? [1, -1] : [o.dir || 1];
    for (const dir of dirs) {
      for (let i = 0; i < arms; i++) {
        G.spawnEB({ ...bopt(B, o), x, y, a: k * o.step * dir + (i * BA_TAU) / arms, s: o.s });
      }
    }
  },
  flower(B, k, o) {
    const [x, y] = muzzle(B, o);
    const turn = (k % 2 ? 1 : -1) * o.turn;
    G.pat.ring(x, y, o.n, o.s, k * 0.2, { ...bopt(B, o), turn, turnT: o.turnT || 1.6 });
  },
  wall(B, k, o) {
    const gx = G.W / 2 + Math.sin(k * (o.drift || 0.5)) * G.W * 0.32;
    G.pat.wall(gx, o.gap || 100, o.s, bopt(B, o));
  },
  rain(B, k, o) {
    G.pat.rain(o.n, o.s, bopt(B, o));
  },
  homing(B, k, o) {
    for (const sx of [-1, 1]) {
      G.spawnEB({ ...bopt(B, o), kind: 'big', r: o.r || 7, x: B.x + sx * (o.dx || 40), y: B.y, a: BA_DOWN - sx * 1.1, s: o.s, home: o.home || 1.8, homeT: o.homeT || 1.6 });
    }
  },
  split(B, k, o) {
    const [x, y] = muzzle(B, o);
    const a = G.aim(x, y) + G.rand(-0.35, 0.35);
    G.spawnEB({ ...bopt(B, o), kind: 'big', r: 10, x, y, a, s: o.s, accel: -o.s * 0.5, split: { t: o.t || 1.1, n: o.n || 12, s: o.s2 || 130 } });
  },
  needles(B, k, o) {
    const [x, y] = muzzle(B, o);
    const jit = o.jit || 0.06;
    G.spawnEB({ ...bopt(B, o), kind: 'needle', r: 4, x, y, a: G.aim(x, y) + G.rand(-jit, jit), s: o.s });
  },
  laser(B, k, o) {
    for (const a of o.angles) laserFrom(B, o, o.dx || 0, BA_DOWN + a);
  },
  aimLaser(B, k, o) {
    const offs = o.dx ? [-o.dx, o.dx] : [0];
    const offy = o.oy ?? B.d.muzzle;
    for (const dx of offs) laserFrom(B, o, dx, G.aim(B.x + dx, B.y + offy));
  },
  sweep(B, k, o) {
    const dir = k % 2 ? -1 : 1;
    const ldur = o.ldur || 2.4;
    const arc = o.arc || 2;
    const n = o.n || 1;
    for (let i = 0; i < n; i++) {
      const off = (i - (n - 1) / 2) * (o.gapA || 0.6);
      laserFrom(B, o, 0, BA_DOWN - (dir * arc) / 2 + off, { dur: ldur, spin: (dir * arc) / ldur });
    }
  },
  cross(B, k, o) {
    const n = o.n || 4;
    for (let i = 0; i < n; i++) {
      laserFrom(B, o, 0, k * 0.4 + (i * BA_TAU) / n, { dur: o.ldur || 3, spin: o.spin || 0.6, w: o.w || 16 });
    }
  },
  minions(B, k, o) {
    G.FORMS[o.form](...o.args);
  },
};
