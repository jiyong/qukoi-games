(function (root) {
  'use strict';

  const KEY = 'yaya-td:v1';

  function sanitize(raw, levelCount) {
    const src = raw && typeof raw === 'object' && raw.best && typeof raw.best === 'object' ? raw.best : {};
    const best = {};
    for (let id = 1; id <= levelCount; id++) {
      const v = src[id];
      if (Number.isInteger(v) && v >= 1 && v <= 3) best[id] = v;
    }
    return { best, muted: !!(raw && raw.muted === true) };
  }

  function load(storage, levelCount) {
    try {
      return sanitize(JSON.parse(storage.getItem(KEY)), levelCount);
    } catch {
      return sanitize(null, levelCount);
    }
  }

  function save(storage, data) {
    try {
      storage.setItem(KEY, JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  }

  const isUnlocked = (data, id) => id === 1 || (data.best[id - 1] || 0) >= 1;
  const totalStars = (data) => Object.values(data.best).reduce((a, b) => a + b, 0);

  function record(data, id, stars) {
    const prev = data.best[id] || 0;
    return stars > prev ? { ...data, best: { ...data.best, [id]: stars } } : data;
  }

  const api = { KEY, sanitize, load, save, isUnlocked, totalStars, record };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.YayaSave = api;
})(typeof window !== 'undefined' ? window : globalThis);
