(function () {
  const Art = window.Art;

  const grad = (id, a, b) => `<radialGradient id="${id}" cx=".35" cy=".3" r=".85">
    <stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient>`;

  function shooter({ id, light, dark, line, crest, brow }) {
    return () => `<defs>${grad(id, light, dark)}</defs>
      <path d="M48 92 C 38 130, 60 150, 50 186" stroke="#3f8f1f" stroke-width="8" fill="none" stroke-linecap="round"/>
      ${Art.leaf(50, 182, 195, 1.15)}${Art.leaf(50, 180, -15, 1.15)}
      <g class="bob">${crest}
        <path d="M60 50 L86 46 Q92 62 86 78 L60 74 Z" fill="url(#${id})" stroke="${line}" stroke-width="2.5"/>
        <ellipse cx="88" cy="62" rx="7" ry="16" fill="url(#${id})" stroke="${line}" stroke-width="2.5"/>
        <ellipse cx="89" cy="62" rx="3.5" ry="10" fill="#14300a"/>
        <circle cx="42" cy="62" r="28" fill="url(#${id})" stroke="${line}" stroke-width="2.5"/>
        <ellipse cx="32" cy="50" rx="8" ry="5" fill="#fff" opacity=".35"/>
        <ellipse cx="52" cy="54" rx="6" ry="8" fill="#1b1b1b"/><circle cx="54" cy="50" r="2.4" fill="#fff"/>
        ${brow}</g>`;
  }

  const peashooter = shooter({
    id: 'pea', light: '#b6f06a', dark: '#4fa82a', line: '#2c6d12', brow: '',
    crest: '<path d="M18 44 Q2 36 6 22 Q20 30 24 40 Z" fill="#5cb531" stroke="#2c6d12" stroke-width="2"/>',
  });
  const repeater = shooter({
    id: 'rep', light: '#8fd84c', dark: '#2f8a1a', line: '#1d5a0b',
    brow: '<path d="M44 40 L60 46" stroke="#14300a" stroke-width="4" stroke-linecap="round"/>',
    crest: `<path d="M18 44 Q-2 40 2 22 Q20 28 24 40 Z" fill="#3f9a22" stroke="#1d5a0b" stroke-width="2"/>
      <path d="M22 38 Q8 20 18 8 Q30 20 28 36 Z" fill="#3f9a22" stroke="#1d5a0b" stroke-width="2"/>`,
  });
  const snowpea = shooter({
    id: 'ice', light: '#d8f6ff', dark: '#4fb3e6', line: '#1f6f9c', brow: '',
    crest: `<path d="M16 50 L2 30 L20 40 L14 14 L28 36 L34 10 L38 36 Z" fill="#bfeeff" stroke="#1f6f9c" stroke-width="2" stroke-linejoin="round"/>`,
  });

  function tallnut() {
    return `<defs>${grad('tnut', '#f0c98a', '#a8692c')}</defs>
      <ellipse cx="50" cy="190" rx="40" ry="6" fill="#6b4423" opacity=".45"/>
      <path d="M50 10 C 88 12, 92 60, 90 110 C 88 170, 80 188, 50 188 C 20 188, 12 170, 10 110 C 8 60, 12 12, 50 10 Z"
        fill="url(#tnut)" stroke="#6a3f15" stroke-width="3"/>
      <path d="M24 120 q8 10 4 24 M74 136 q-6 12 0 22 M30 34 q6 -4 14 -2" stroke="#7a4a1c" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".7"/>
      <path d="M30 56 L44 62 M70 56 L56 62" stroke="#3b1f08" stroke-width="3.6" stroke-linecap="round"/>
      ${Art.eyes(38, 62, 74, 6, 1.4)}
      <path d="M40 98 Q50 94 60 98" stroke="#3b1f08" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  }

  const ammo = {
    melon: `<ellipse cx="164" cy="30" rx="26" ry="21" fill="#4fa82a" stroke="#1d5a0b" stroke-width="2.5"/>
      <path d="M142 26 Q164 10 188 26 M140 36 Q164 22 190 36 M146 44 Q164 36 184 44" stroke="#1d5a0b" stroke-width="3" fill="none"/>`,
    cabbage: `<circle cx="164" cy="30" r="22" fill="#c6f08a" stroke="#4f8a1d" stroke-width="2.5"/>
      <path d="M164 10 Q150 30 164 50 M164 10 Q178 30 164 50 M144 30 Q164 22 184 30" stroke="#6fae2e" stroke-width="2.4" fill="none"/>`,
    corn: `<rect x="146" y="14" width="34" height="30" rx="7" fill="#ffe36b" stroke="#c99700" stroke-width="2.5"/>
      <path d="M150 20 h26" stroke="#fff6b8" stroke-width="4" stroke-linecap="round"/>`,
  };

  function pult(kind, headLight, headDark, line) {
    return () => `<defs>${grad('pult' + kind, headLight, headDark)}</defs>
      <ellipse cx="100" cy="94" rx="80" ry="5" fill="#2f5e14" opacity=".35"/>
      ${Art.leaf(60, 88, 190, 1.2)}${Art.leaf(64, 88, -10, 1.2)}${Art.leaf(62, 90, 250, 0.9)}
      <g class="lob">
        <path d="M72 50 Q110 6 148 34" stroke="#6e4a1e" stroke-width="7" fill="none" stroke-linecap="round"/>
        <path d="M136 44 Q164 62 192 44 L188 38 Q164 52 140 38 Z" fill="#8a5a24" stroke="#4e3010" stroke-width="2"/>
        ${ammo[kind]}</g>
      <circle cx="56" cy="56" r="28" fill="url(#pult${kind})" stroke="${line}" stroke-width="2.5"/>
      <ellipse cx="46" cy="42" rx="8" ry="5" fill="#fff" opacity=".35"/>
      ${Art.eyes(48, 66, 52, 4.6, 1.2)}
      <path d="M48 68 Q57 75 66 68" stroke="#14300a" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  }

  Art.V = [
    { name: '豌豆射手', draw: peashooter },
    { name: '寒冰射手', draw: snowpea },
    { name: '高坚果', draw: tallnut },
    { name: '双发射手', draw: repeater },
  ];
  Art.H = [
    { name: '西瓜投手', draw: pult('melon', '#b6f06a', '#4fa82a', '#2c6d12') },
    { name: '卷心菜投手', draw: pult('cabbage', '#e6ffb0', '#8cc84a', '#4f8a1d') },
    { name: '玉米投手', draw: pult('corn', '#fff3a6', '#e0b52a', '#9a7400') },
  ];
})();
