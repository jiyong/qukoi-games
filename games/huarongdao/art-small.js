(function () {
  const Art = (window.Art = window.Art || {});

  Art.eyes = (x1, x2, y, r = 6, look = 1.5) => `
    <ellipse cx="${x1}" cy="${y}" rx="${r}" ry="${r * 1.25}" fill="#1b1b1b"/>
    <ellipse cx="${x2}" cy="${y}" rx="${r}" ry="${r * 1.25}" fill="#1b1b1b"/>
    <circle cx="${x1 + look}" cy="${y - r * 0.5}" r="${r * 0.38}" fill="#fff"/>
    <circle cx="${x2 + look}" cy="${y - r * 0.5}" r="${r * 0.38}" fill="#fff"/>`;

  Art.leaf = (x, y, rot, s = 1, fill = '#5cb531') => `
    <path transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"
      d="M0 0 C 10 -12, 28 -10, 34 0 C 26 8, 10 9, 0 0 Z"
      fill="${fill}" stroke="#2f7a17" stroke-width="2"/>
    <path transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"
      d="M3 0 L 28 0" stroke="#2f7a17" stroke-width="1.5" opacity=".6"/>`;

  const stem = (x, y1, y2) => `
    <path d="M${x} ${y1} C ${x - 6} ${(y1 + y2) / 2}, ${x + 6} ${(y1 + y2) / 2}, ${x} ${y2}"
      stroke="#3f8f1f" stroke-width="7" fill="none" stroke-linecap="round"/>`;

  function sunflower() {
    let petals = '';
    for (let i = 0; i < 14; i++) {
      petals += `<ellipse cx="50" cy="20" rx="8" ry="15" fill="url(#petal)" stroke="#d18a00"
        stroke-width="1.6" transform="rotate(${i * (360 / 14)} 50 42)"/>`;
    }
    return `<defs><radialGradient id="petal" cx=".5" cy=".7" r=".8">
        <stop offset="0" stop-color="#fff27a"/><stop offset="1" stop-color="#ffb800"/></radialGradient>
      <radialGradient id="sunface" cx=".4" cy=".35" r=".7">
        <stop offset="0" stop-color="#e3a256"/><stop offset="1" stop-color="#a35c1e"/></radialGradient></defs>
      ${stem(50, 60, 94)}${Art.leaf(50, 84, 200, 0.9)}${Art.leaf(50, 82, -20, 0.9)}
      <g class="sway">${petals}
        <circle cx="50" cy="42" r="19" fill="url(#sunface)" stroke="#7a3f10" stroke-width="2"/>
        ${Art.eyes(43, 57, 39, 3.6, 1)}
        <path d="M41 48 Q50 56 59 48" stroke="#4a2306" stroke-width="2.6" fill="none" stroke-linecap="round"/>
        <ellipse cx="38" cy="48" rx="3.5" ry="2" fill="#ff7b5c" opacity=".55"/>
        <ellipse cx="62" cy="48" rx="3.5" ry="2" fill="#ff7b5c" opacity=".55"/></g>`;
  }

  function puffshroom() {
    return `<defs><radialGradient id="cap" cx=".35" cy=".3" r=".8">
        <stop offset="0" stop-color="#d9a6ff"/><stop offset="1" stop-color="#7a3fc0"/></radialGradient></defs>
      <g class="bob">
        <path d="M32 58 Q30 88 50 88 Q70 88 68 58 Z" fill="#f4e8d0" stroke="#9b8462" stroke-width="2"/>
        ${Art.eyes(43, 57, 70, 4, 1)}
        <path d="M45 80 Q50 83 55 80" stroke="#6b4e2a" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path d="M12 58 Q14 18 50 16 Q86 18 88 58 Q50 66 12 58 Z" fill="url(#cap)" stroke="#4d1f86" stroke-width="2.5"/>
        <circle cx="34" cy="38" r="6" fill="#f2e0ff" opacity=".85"/>
        <circle cx="60" cy="30" r="4.5" fill="#f2e0ff" opacity=".85"/>
        <circle cx="70" cy="47" r="3.5" fill="#f2e0ff" opacity=".85"/></g>`;
  }

  function potatomine() {
    return `<defs><radialGradient id="spud" cx=".35" cy=".3" r=".8">
        <stop offset="0" stop-color="#e8bf7d"/><stop offset="1" stop-color="#9a6630"/></radialGradient></defs>
      <path d="M50 40 L50 18" stroke="#6e6e6e" stroke-width="3"/>
      <circle class="blink" cx="50" cy="15" r="6" fill="#ff3b30" stroke="#8a0d06" stroke-width="2"/>
      <ellipse cx="50" cy="94" rx="40" ry="6" fill="#6b4423" opacity=".5"/>
      <path d="M14 90 Q12 42 50 38 Q88 42 86 90 Z" fill="url(#spud)" stroke="#6a3f15" stroke-width="2.5"/>
      <circle cx="30" cy="62" r="2" fill="#7a4a1c"/><circle cx="72" cy="74" r="2.4" fill="#7a4a1c"/>
      ${Art.eyes(41, 59, 64, 4.4, 1)}
      <path d="M42 77 Q50 83 58 77" stroke="#4a2a0e" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  }

  function cherrybomb() {
    const cherry = (cx, cy, r) => `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#cherry)" stroke="#7a0010" stroke-width="2.5"/>
      <ellipse cx="${cx - r * 0.4}" cy="${cy - r * 0.45}" rx="${r * 0.28}" ry="${r * 0.18}" fill="#fff" opacity=".7"/>
      <path d="M${cx - r * 0.55} ${cy - r * 0.28} l${r * 0.4} ${r * 0.15} M${cx + r * 0.55} ${cy - r * 0.28} l${-r * 0.4} ${r * 0.15}"
        stroke="#2a0005" stroke-width="2.6" stroke-linecap="round"/>
      ${Art.eyes(cx - r * 0.3, cx + r * 0.3, cy, r * 0.13, 0.6)}
      <path d="M${cx - r * 0.3} ${cy + r * 0.45} Q${cx} ${cy + r * 0.25} ${cx + r * 0.3} ${cy + r * 0.45}"
        stroke="#2a0005" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    return `<defs><radialGradient id="cherry" cx=".35" cy=".3" r=".8">
        <stop offset="0" stop-color="#ff6a6a"/><stop offset="1" stop-color="#c3001b"/></radialGradient></defs>
      <path d="M30 56 Q40 16 56 10 M70 58 Q66 26 56 10" stroke="#3f8f1f" stroke-width="4" fill="none"/>
      ${Art.leaf(56, 12, -30, 0.7)}
      <g class="shake">${cherry(30, 64, 22)}${cherry(70, 66, 22)}</g>`;
  }

  Art.S = [
    { name: '向日葵', draw: sunflower },
    { name: '小喷菇', draw: puffshroom },
    { name: '土豆地雷', draw: potatomine },
    { name: '樱桃炸弹', draw: cherrybomb },
  ];
})();
