'use strict';
(function () {
  const { svg } = PVZ.Art;
  const SKIN = '#a3bd8f';
  const SKIN_EDGE = '#566e4a';

  const legs = `
    <g class="z-leg z-leg2"><path d="M40 78 L44 102" stroke="#3b3022" stroke-width="9" stroke-linecap="round"/><ellipse cx="45" cy="104" rx="8" ry="4" fill="#2b2016"/></g>
    <g class="z-leg z-leg1"><path d="M30 78 L26 102" stroke="#4a3b2a" stroke-width="9" stroke-linecap="round"/><ellipse cx="23" cy="104" rx="8" ry="4" fill="#2b2016"/></g>`;
  const torso = `
    <path d="M20 48 H50 L54 82 H16Z" fill="#6b4f32" stroke="#3b2a18" stroke-width="2" stroke-linejoin="round"/>
    <path d="M30 48 H42 L40 70 H32Z" fill="#ebe4d0"/>
    <path d="M34 50 H38 L39.5 64 L36 68 L32.5 64Z" fill="#c0262a"/>`;
  const arm = (cls, y) =>
    `<g class="${cls}"><path d="M24 ${y} L4 ${y + 6}" stroke="#5c432a" stroke-width="8" stroke-linecap="round"/>` +
    `<circle cx="3" cy="${y + 7}" r="5" fill="${SKIN}" stroke="${SKIN_EDGE}" stroke-width="1.5"/></g>`;
  const head = `
    <circle cx="34" cy="30" r="18" fill="${SKIN}" stroke="${SKIN_EDGE}" stroke-width="2"/>
    <circle cx="23" cy="27" r="6.5" fill="#fff" stroke="#333" stroke-width="1.2"/><circle cx="21.5" cy="28" r="2.4" fill="#222"/>
    <circle cx="36" cy="25" r="5" fill="#fff" stroke="#333" stroke-width="1.2"/><circle cx="34.5" cy="26" r="2" fill="#222"/>
    <path d="M17 38 Q24 45 34 40 L33 44 Q24 48 18 42Z" fill="#4a1f18"/>
    <rect x="22" y="39.5" width="4" height="3.5" fill="#f3efd8"/><rect x="28" y="39" width="4" height="3.5" fill="#f3efd8"/>
    <path d="M38 13 Q44 5 50 9 Q44 9 42 15Z" fill="#3a2a20"/>`;
  const hats = {
    cone: `<path d="M18 20 L35 -10 L52 20Z" fill="#f08a1c" stroke="#a34f06" stroke-width="2" stroke-linejoin="round"/>
      <path d="M25 9 H45 M29 1 H41" stroke="#ffd1a0" stroke-width="3"/>
      <path d="M14 20 H56" stroke="#a34f06" stroke-width="4" stroke-linecap="round"/>`,
    bucket: `<path d="M16 20 L21 -6 H49 L54 20Z" fill="#b4bcc2" stroke="#5d666c" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M18 12 H52" stroke="#8a9399" stroke-width="2"/>
      <path d="M24 -4 Q35 -14 46 -4" stroke="#5d666c" stroke-width="2" fill="none"/>
      <ellipse cx="28" cy="5" rx="3.5" ry="8" fill="#fff" opacity=".35"/>`,
  };
  const flagPole = `<path d="M52 -10 V80" stroke="#6b4a2a" stroke-width="3"/>
    <path d="M53 -10 H74 L69 -2 L74 6 H53Z" fill="#c0262a" stroke="#7a1416" stroke-width="1.5"/>
    <circle cx="62" cy="-2" r="3.5" fill="#f4b8c0"/>`;

  const cache = {};
  function zombie(type) {
    cache[type] ??= svg(
      (type === 'flag' ? flagPole : '') + arm('z-arm z-arm2', 54) + legs + torso + head +
        (hats[type] || '') + arm('z-arm', 58),
      '0 -14 76 124',
    );
    return cache[type];
  }

  const mower = () => svg(`
    <path d="M8 6 L22 22" stroke="#555" stroke-width="3" stroke-linecap="round"/>
    <path d="M2 4 H12" stroke="#333" stroke-width="4" stroke-linecap="round"/>
    <path d="M16 20 H50 Q56 20 56 28 V34 H14Z" fill="#d9412b" stroke="#7a1a10" stroke-width="2"/>
    <rect x="22" y="14" width="18" height="8" rx="2" fill="#555"/>
    <circle cx="22" cy="36" r="7" fill="#333"/><circle cx="22" cy="36" r="3" fill="#bbb"/>
    <circle cx="48" cy="36" r="7" fill="#333"/><circle cx="48" cy="36" r="3" fill="#bbb"/>`, '0 0 60 44');

  const house = () => svg(`
    <rect x="4" y="40" width="44" height="58" fill="#f1e2c0" stroke="#7a5a34" stroke-width="2"/>
    <path d="M0 42 L26 12 L52 42Z" fill="#b5442c" stroke="#6e2414" stroke-width="2" stroke-linejoin="round"/>
    <rect x="18" y="64" width="16" height="34" rx="2" fill="#7a4a24"/><circle cx="30" cy="82" r="1.6" fill="#ffd23f"/>
    <rect x="9" y="47" width="13" height="11" fill="#8fd0ff" stroke="#7a5a34" stroke-width="1.5"/>
    <rect x="30" y="47" width="13" height="11" fill="#8fd0ff" stroke="#7a5a34" stroke-width="1.5"/>`, '0 0 52 100');

  Object.assign(PVZ.Art, { zombie, mower, house });
})();
