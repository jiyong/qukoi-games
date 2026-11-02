'use strict';
(function () {
  const L = PVZ.Lane;
  const A = PVZ.ATTACK;
  const T = PVZ.TYPE;
  const SPEED = { pea: 0.9, ice: 0.9, chomp: 1.4, cherry: 0.6, nut: 0.55 };
  const ART = { chomp: T.CHOMP, cherry: T.CHERRY, nut: T.NUT };
  const SPLAT = { pea: '', ice: 'ice', chomp: 'bite', cherry: 'boom', nut: '' };
  const SOUND = { chomp: 'chomp', cherry: 'boom' };
  const track = () => document.getElementById('track');

  function makeShot(kind) {
    const el = document.createElement('div');
    el.className = `shot shot-${kind}${kind in ART ? ' shot-big' : ''}`;
    if (kind in ART) el.innerHTML = PVZ.Art.plant(ART[kind]);
    track().appendChild(el);
    return el;
  }

  function splat(kind, x) {
    const el = document.createElement('div');
    el.className = `splat ${SPLAT[kind]}`;
    el.style.left = `${L.px(x)}px`;
    track().appendChild(el);
    setTimeout(() => el.remove(), 650);
    PVZ.Audio.play(SOUND[kind] || 'hit');
    if (kind === 'cherry') document.getElementById('lane').classList.add('shake');
    setTimeout(() => document.getElementById('lane').classList.remove('shake'), 400);
  }

  function recoil() {
    const guard = document.querySelector('.guard');
    guard.classList.remove('fire');
    void guard.offsetWidth;
    guard.classList.add('fire');
  }

  function keyframes(kind, to) {
    if (kind === 'cherry') {
      return [
        { transform: 'translate(0, 0) rotate(0)' },
        { transform: `translate(${to / 2}px, -36px) rotate(180deg)`, offset: 0.5 },
        { transform: `translate(${to}px, 0) rotate(360deg)` },
      ];
    }
    return [{ transform: 'translateX(0)' }, { transform: `translateX(${to}px)` }];
  }

  function fire(kind, onHit, delay = 0) {
    setTimeout(() => {
      const target = L.front();
      if (!target) return;
      const el = makeShot(kind);
      const to = L.px(target.x);
      recoil();
      PVZ.Audio.play('shoot');
      const anim = el.animate(keyframes(kind, to), { duration: Math.max(160, to / SPEED[kind]), easing: 'linear' });
      anim.onfinish = () => {
        el.remove();
        const z = L.alive(target) ? target : L.front();
        if (!z) return;
        splat(kind, z.x);
        onHit(z);
      };
    }, delay);
  }

  function attack(counts, mult) {
    const n = (t) => counts[t] || 0;
    for (let k = 0; k < n(T.PEA); k++) fire('pea', (z) => L.damage(z, A.pea * mult), k * 110);
    for (let k = 0; k < n(T.ICE); k++) {
      fire('ice', (z) => { L.slow(z, A.slowSec); L.damage(z, A.ice * mult); }, k * 110 + 55);
    }
    if (n(T.CHOMP)) fire('chomp', (z) => L.damage(z, A.chomp * n(T.CHOMP) * mult));
    if (n(T.CHERRY)) {
      fire('cherry', (z) => L.near(z.x, A.cherryRange).forEach((o) => L.damage(o, A.cherry * n(T.CHERRY) * mult)), 80);
    }
    if (n(T.NUT)) {
      fire('nut', (z) => L.near(z.x, 8).forEach((o) => {
        L.push(o, A.nutPush * n(T.NUT));
        L.damage(o, A.nutDamage * n(T.NUT) * mult);
      }), 160);
    }
  }

  PVZ.Attack = attack;
})();
