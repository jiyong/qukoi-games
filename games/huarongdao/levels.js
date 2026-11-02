(function (root) {
  const LEVELS = [
    { name: '前院清晨', min: 19, grid: ['abcd', 'BBef', 'BBgh', 'ijkl', 'm..n'] },
    { name: '迷雾之夜', min: 33, grid: ['BBab', 'BBcd', 'eeff', 'ghij', '..kk'] },
    { name: '泳池派对', min: 41, grid: ['aBBc', 'dBBe', 'fghi', 'jjkk', 'l..m'] },
    { name: '屋顶突围', min: 56, grid: ['aBBb', 'aBBb', 'cdde', 'fghi', 'j..k'] },
    { name: '僵王博士', min: 116, grid: ['aBBb', 'aBBb', 'cdde', 'cfge', 'h..i'] },
  ];

  function parseLevel(level) {
    const cells = {};
    level.grid.forEach((row, y) => {
      [...row].forEach((ch, x) => {
        if (ch === '.') return;
        const c = cells[ch] || (cells[ch] = { minX: x, minY: y, maxX: x, maxY: y });
        c.minX = Math.min(c.minX, x); c.maxX = Math.max(c.maxX, x);
        c.minY = Math.min(c.minY, y); c.maxY = Math.max(c.maxY, y);
      });
    });
    return Object.entries(cells).map(([ch, c]) => {
      const w = c.maxX - c.minX + 1;
      const h = c.maxY - c.minY + 1;
      const type = ch === 'B' ? 'B' : w === 2 ? 'H' : h === 2 ? 'V' : 'S';
      return { id: ch, type, x: c.minX, y: c.minY, w, h };
    });
  }

  const api = { LEVELS, parseLevel };
  root.Levels = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
