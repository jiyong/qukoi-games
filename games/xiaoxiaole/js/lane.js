'use strict';
(function () {
  const S = { zombies: [], queue: [], t: 0, nextAt: 0, spawned: 0, total: 0, killed: 0, gap: 6, huge: false, mower: true, width: 1, hooks: {} };
  let uid = 0;
  const $ = (id) => document.getElementById(id);
  const px = (x) => (x / 100) * S.width;
  const alive = (z) => S.zombies.includes(z);

  function start(spec, hooks) {
    S.zombies.forEach((z) => z.el.remove());
    $('track').querySelectorAll('.zombie, .shot, .splat').forEach((e) => e.remove());
    const queue = PVZ.buildWave(spec);
    Object.assign(S, { zombies: [], queue, t: 0, nextAt: 3, spawned: 0, total: queue.length, killed: 0, gap: spec.gap, huge: false, mower: true, hooks });
    const m = $('mower');
    m.className = 'mower';
    m.innerHTML = PVZ.Art.mower();
    $('lane').classList.remove('danger');
    S.width = $('track').clientWidth;
  }

  function spawn(type) {
    const def = PVZ.ZOMBIES[type];
    const el = document.createElement('div');
    el.className = `zombie z-${type}`;
    el.innerHTML = `<div class="hp"><i></i></div><div class="z-body">${PVZ.Art.zombie(type)}</div>`;
    el.style.transform = `translateX(${S.width + 10}px)`;
    $('track').appendChild(el);
    S.zombies.push({ id: ++uid, type, hp: def.hp, max: def.hp, x: 106, speed: def.speed * (0.9 + Math.random() * 0.2), slowUntil: 0, el });
    if (Math.random() < 0.5) PVZ.Audio.play('groan');
  }

  function kill(z, delay = 0) {
    if (!alive(z)) return;
    S.zombies.splice(S.zombies.indexOf(z), 1);
    S.killed++;
    setTimeout(() => {
      z.el.classList.add('dying');
      setTimeout(() => z.el.remove(), 1000);
    }, delay);
    S.hooks.onKill(S.killed, S.total);
  }

  function damage(z, amount) {
    if (!alive(z)) return;
    z.hp -= amount;
    z.el.querySelector('.hp i').style.width = `${Math.max(0, z.hp / z.max) * 100}%`;
    z.el.classList.add('hit');
    setTimeout(() => z.el.classList.remove('hit'), 120);
    if (z.hp <= 0) kill(z);
  }

  function front() {
    let best = null;
    for (const z of S.zombies) if (z.x < 100 && (!best || z.x < best.x)) best = z;
    return best;
  }
  const near = (x, range) => S.zombies.filter((z) => z.x < 100 && Math.abs(z.x - x) <= range);
  const slow = (z, sec) => { z.slowUntil = Math.max(z.slowUntil, S.t + sec); };
  const push = (z, amount) => { z.x = Math.min(99, z.x + amount); };

  function fireMower() {
    S.mower = false;
    PVZ.Audio.play('mower');
    const m = $('mower');
    m.classList.add('go');
    S.zombies.filter((z) => z.x < 100).forEach((z) => kill(z, z.x * 14));
    setTimeout(() => m.classList.add('used'), 1500);
  }

  function draw() {
    S.width = $('track').clientWidth;
    for (const z of S.zombies) z.el.style.transform = `translateX(${px(z.x) - 26}px)`;
    const f = front();
    $('lane').classList.toggle('danger', !!f && f.x < 22);
  }

  function update(dt) {
    S.t += dt;
    if (S.spawned < S.total && S.t >= S.nextAt) {
      spawn(S.queue[S.spawned++]);
      const late = S.spawned >= Math.ceil(S.total * 0.65);
      if (late && !S.huge) { S.huge = true; S.hooks.onHugeWave(); }
      S.nextAt = S.t + S.gap * (late ? 0.55 : 1) * (0.75 + Math.random() * 0.5);
    }
    for (const z of [...S.zombies]) {
      if (!alive(z)) continue;
      const factor = S.t < z.slowUntil ? PVZ.ATTACK.slowFactor : 1;
      z.x -= z.speed * factor * dt;
      z.el.classList.toggle('slowed', factor < 1);
      if (z.x > 1) continue;
      if (!S.mower) { S.hooks.onLose(); return; }
      fireMower();
    }
    draw();
    if (S.spawned === S.total && !S.zombies.length) S.hooks.onWin();
  }

  PVZ.Lane = { start, update, front, near, damage, slow, push, px, alive };
})();
