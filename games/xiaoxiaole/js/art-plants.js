'use strict';
(function () {
  const svg = (body, vb = '0 0 100 100') =>
    `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;
  const shine = (x, y, rx, ry) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".38"/>`;
  const eye = (x, y, r = 6) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="#1d1d1d" stroke-width="1.5"/>` +
    `<circle cx="${x + r * 0.3}" cy="${y}" r="${r * 0.55}" fill="#1d1d1d"/>` +
    `<circle cx="${x + r * 0.45}" cy="${y - r * 0.3}" r="${r * 0.2}" fill="#fff"/>`;
  const stem = (c1 = '#3f8f1f', c2 = '#4caf2a', c3 = '#5cc93b') => `
    <path d="M50 97 C48 84 52 74 50 62" stroke="${c1}" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M50 90 C34 96 20 88 22 78 C34 78 44 82 50 90Z" fill="${c2}" stroke="${c1}" stroke-width="2"/>
    <path d="M50 90 C66 96 80 88 78 78 C66 78 56 82 50 90Z" fill="${c3}" stroke="${c1}" stroke-width="2"/>`;

  function shooter(body, edge, dark, tuft, stemColors) {
    return stem(...stemColors) + tuft + `
      <path d="M58 30 H76 A9 11 0 0 1 76 52 H58Z" fill="${body}" stroke="${edge}" stroke-width="3"/>
      <ellipse cx="78" cy="41" rx="5" ry="8" fill="${dark}"/>
      <circle cx="44" cy="42" r="24" fill="${body}" stroke="${edge}" stroke-width="3"/>
      ${shine(36, 30, 8, 5)}${eye(46, 36, 6.5)}`;
  }
  const peashooter = () => shooter('#72d84b', '#2f7d17', '#1f5c0e',
    '<path d="M26 24 C12 20 10 10 16 5 C20 13 24 17 30 21Z" fill="#4caf2a" stroke="#2f7d17" stroke-width="2"/>', []);
  const snowpea = () => shooter('#9be0ff', '#2f7fb3', '#1b4f73',
    '<path d="M28 24 L14 8 L24 15 L22 1 L31 17 L38 5 L36 21Z" fill="#e6f8ff" stroke="#5aa9d6" stroke-width="2" stroke-linejoin="round"/>',
    ['#2f7d9a', '#5fb9d9', '#7fd0ec']);

  function sunflower() {
    const petals = Array.from({ length: 12 }, (_, i) =>
      `<ellipse cx="50" cy="17" rx="8" ry="14" fill="#ffd23f" stroke="#e59a00" stroke-width="2" transform="rotate(${i * 30} 50 40)"/>`).join('');
    return stem() + petals + `
      <circle cx="50" cy="40" r="19" fill="#9a5418" stroke="#6b3508" stroke-width="2.5"/>
      ${shine(44, 31, 7, 4)}
      <ellipse cx="43" cy="37" rx="3" ry="4.2" fill="#1d1d1d"/><ellipse cx="57" cy="37" rx="3" ry="4.2" fill="#1d1d1d"/>
      <path d="M41 45 Q50 54 59 45" stroke="#1d1d1d" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="38" cy="45" r="3" fill="#ff8a7a" opacity=".7"/><circle cx="62" cy="45" r="3" fill="#ff8a7a" opacity=".7"/>`;
  }

  const wallnut = () => `
    <ellipse cx="50" cy="94" rx="28" ry="5" fill="#000" opacity=".15"/>
    <path d="M50 8 C76 8 86 34 84 58 C82 82 68 94 50 94 C30 94 16 82 16 56 C16 30 26 8 50 8Z" fill="#c98a3f" stroke="#7a4a17" stroke-width="3"/>
    <path d="M30 22 C26 34 26 44 30 52 M70 70 C74 76 72 84 66 88 M40 82 c4 4 10 4 14 2" stroke="#9a6224" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    ${shine(38, 24, 10, 6)}${eye(40, 44, 8)}${eye(64, 44, 8)}
    <path d="M44 66 Q54 62 62 66" stroke="#4a2a0c" stroke-width="3" fill="none" stroke-linecap="round"/>`;

  const bomb = (x, y) => `
    <circle cx="${x}" cy="${y}" r="20" fill="#e8312a" stroke="#8e1410" stroke-width="3"/>
    ${shine(x - 7, y - 9, 6, 4)}
    <path d="M${x - 11} ${y - 7} l8 4 M${x + 11} ${y - 7} l-8 4" stroke="#1d1d1d" stroke-width="3" stroke-linecap="round"/>
    <circle cx="${x - 6}" cy="${y + 1}" r="2.8" fill="#1d1d1d"/><circle cx="${x + 6}" cy="${y + 1}" r="2.8" fill="#1d1d1d"/>
    <path d="M${x - 7} ${y + 11} Q${x} ${y + 6} ${x + 7} ${y + 11}" stroke="#1d1d1d" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  const cherry = () => `
    <path d="M32 46 C34 30 44 20 54 14 M66 42 C64 30 60 22 54 14" stroke="#3f8f1f" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M54 14 C62 4 78 4 84 10 C76 18 64 18 54 14Z" fill="#5cc93b" stroke="#2f7d17" stroke-width="2"/>
    ${bomb(32, 64)}${bomb(66, 60)}`;

  const chomper = () => stem() + `
    <path d="M46 44 L74 24 Q84 42 74 62 Z" fill="#6b0f2a"/>
    <path d="M46 44 L70 28 A28 28 0 1 0 70 58 Z" fill="#9b4fc4" stroke="#5a2380" stroke-width="3" stroke-linejoin="round"/>
    <path d="M54 39 l2 7 l4 -10z M62 34 l2 7 l4 -10z" fill="#fff"/>
    <path d="M55 49 l3 -7 l3 9z M63 53 l3 -7 l3 9z" fill="#fff"/>
    <circle cx="32" cy="28" r="4.5" fill="#c58ae6"/><circle cx="26" cy="47" r="3.2" fill="#c58ae6"/><circle cx="40" cy="60" r="2.6" fill="#c58ae6"/>
    ${shine(34, 24, 7, 4)}`;

  const food = () => svg(`
    <circle cx="50" cy="52" r="40" fill="#b6ff7a" opacity=".35"/>
    <path d="M50 18 C74 22 84 46 74 70 C64 90 36 90 26 70 C16 50 28 22 50 18Z" fill="#5fd62e" stroke="#237a10" stroke-width="3"/>
    <path d="M38 64 C34 50 44 40 56 42 C64 44 64 54 56 56 C50 57 48 52 52 50" stroke="#efffd6" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M50 18 C46 8 54 2 62 4 C60 12 56 16 50 18Z" fill="#3fae1c" stroke="#237a10" stroke-width="2"/>
    ${shine(40, 32, 8, 5)}`);

  const builders = [peashooter, sunflower, wallnut, snowpea, cherry, chomper];
  const cache = [];
  const plant = (t) => (cache[t] ??= svg(builders[t]()));

  PVZ.Art = { svg, plant, food };
})();
