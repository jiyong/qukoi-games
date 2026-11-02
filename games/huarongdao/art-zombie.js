(function () {
  const Art = window.Art;

  function conehead() {
    return `<defs>
        <radialGradient id="zskin" cx=".38" cy=".32" r=".8">
          <stop offset="0" stop-color="#d4e2b8"/><stop offset="1" stop-color="#8ea870"/></radialGradient>
        <linearGradient id="zcone" x1="0" x2="1">
          <stop offset="0" stop-color="#ffb347"/><stop offset=".55" stop-color="#ff7a1a"/><stop offset="1" stop-color="#d4560a"/></linearGradient>
        <linearGradient id="zcoat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#7a5636"/><stop offset="1" stop-color="#4a321d"/></linearGradient></defs>
      <ellipse cx="100" cy="194" rx="70" ry="6" fill="#1a2a0c" opacity=".35"/>
      <g class="shamble">
        <path d="M58 118 L142 118 L156 196 L44 196 Z" fill="url(#zcoat)" stroke="#2e1d0e" stroke-width="3" stroke-linejoin="round"/>
        <path d="M82 118 L100 160 L118 118 Z" fill="#f1ede0" stroke="#7c7564" stroke-width="2"/>
        <path d="M100 124 L93 134 L100 172 L107 134 Z" fill="#d6262b" stroke="#7a0d10" stroke-width="2"/>
        <path d="M70 150 l10 6 M130 160 l-10 4 M64 178 l12 -2" stroke="#2e1d0e" stroke-width="2.4" opacity=".7"/>
        <g class="reach">
          <path d="M62 126 C 40 128, 24 136, 10 132" stroke="url(#zcoat)" stroke-width="18" fill="none" stroke-linecap="round"/>
          <path d="M12 124 l-8 -4 M10 132 l-10 0 M12 140 l-8 4" stroke="#8ea870" stroke-width="5" stroke-linecap="round"/>
          <path d="M70 140 C 48 146, 32 156, 18 156" stroke="#5e4128" stroke-width="16" fill="none" stroke-linecap="round"/>
          <path d="M20 150 l-8 -3 M18 157 l-9 2" stroke="#8ea870" stroke-width="5" stroke-linecap="round"/>
        </g>
        <path d="M86 108 L114 108 L112 124 L88 124 Z" fill="#8ea870" stroke="#5a6e44" stroke-width="2"/>
        <g class="head">
          <ellipse cx="100" cy="76" rx="44" ry="40" fill="url(#zskin)" stroke="#55683f" stroke-width="3"/>
          <path d="M66 54 q-6 -10 2 -16 M78 44 q-2 -10 6 -14" stroke="#3a3a2a" stroke-width="2.4" fill="none"/>
          <circle cx="82" cy="72" r="15" fill="#fbfbef" stroke="#55683f" stroke-width="2"/>
          <circle cx="78" cy="74" r="4" fill="#1b1b1b"/>
          <circle cx="114" cy="74" r="10" fill="#fbfbef" stroke="#55683f" stroke-width="2"/>
          <circle cx="111" cy="76" r="3" fill="#1b1b1b"/>
          <path d="M70 58 L92 62 M106 64 L124 60" stroke="#3a3a2a" stroke-width="3.2" stroke-linecap="round"/>
          <path d="M76 96 Q100 116 128 94 Q104 104 76 96 Z" fill="#3b1414" stroke="#2a0d0d" stroke-width="2"/>
          <rect x="88" y="98" width="7" height="7" fill="#f4f0d8"/>
          <rect x="104" y="99" width="7" height="6" fill="#f4f0d8"/>
          <ellipse cx="132" cy="84" rx="6" ry="4" fill="#7a9460" opacity=".7"/>
          <g transform="rotate(-8 100 40)">
            <path d="M100 2 L136 52 Q100 62 64 52 Z" fill="url(#zcone)" stroke="#8a3a05" stroke-width="3" stroke-linejoin="round"/>
            <path d="M82 28 L118 28 L124 38 L76 38 Z" fill="#fff4e0" opacity=".85"/>
            <path d="M58 52 Q100 66 142 52 L144 60 Q100 74 56 60 Z" fill="#e8610f" stroke="#8a3a05" stroke-width="2.5"/>
          </g>
        </g>
      </g>`;
  }

  Art.B = [{ name: '路障僵尸', draw: conehead }];

  Art.svg = (type, index, w, h) => {
    const list = Art[type];
    const item = list[index % list.length];
    return {
      name: item.name,
      html: `<svg viewBox="0 0 ${w * 100} ${h * 100}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${item.draw()}</svg>`,
    };
  };
})();
