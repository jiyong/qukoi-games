(function (root) {
  'use strict';

  let ctx = null;
  let muted = false;
  const lastPlayed = new Map();
  const MIN_GAP = 0.06;

  function tone(freq, dur, type = 'square', vol = 0.1, slide = 0, delay = 0) {
    if (!ctx || muted) return;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur);
  }

  // Many towers fire at once; drop repeats of the same sound inside a short window.
  function throttled(name, fn) {
    return (...args) => {
      if (!ctx) return;
      const now = ctx.currentTime;
      if (now - (lastPlayed.get(name) || 0) < MIN_GAP) return;
      lastPlayed.set(name, now);
      fn(...args);
    };
  }

  const melody = (notes, step, type = 'triangle', vol = 0.12) => notes.forEach((f, i) => tone(f, step * 1.6, type, vol, 0, i * step));

  const FIRE = {
    sprinkler: () => tone(880, 0.06, 'sine', 0.05, -300),
    mint: () => tone(1500, 0.18, 'sine', 0.035, -900),
    cactus: () => tone(500, 0.07, 'sawtooth', 0.035, 200),
    chili: () => tone(160, 0.18, 'square', 0.06, -80),
    hive: () => tone(300, 0.15, 'sawtooth', 0.025, 40),
  };

  root.Sfx = {
    unlock() {
      const AC = root.AudioContext || root.webkitAudioContext;
      if (!ctx && AC) ctx = new AC();
      if (ctx && ctx.state === 'suspended') ctx.resume();
    },
    setMuted(v) { muted = !!v; },
    isMuted: () => muted,
    fire: throttled('fire', (type) => FIRE[type] && FIRE[type]()),
    kill: throttled('kill', () => tone(420, 0.09, 'triangle', 0.08, 300)),
    blast: throttled('blast', () => tone(90, 0.25, 'square', 0.08, -40)),
    bite: () => { tone(200, 0.2, 'sawtooth', 0.12, -120); tone(150, 0.25, 'square', 0.08, -60, 0.08); },
    build: () => melody([523, 784], 0.07),
    upgrade: () => melody([523, 659, 784, 1046], 0.06),
    sell: () => melody([784, 523], 0.07, 'sine'),
    deny: () => tone(140, 0.12, 'square', 0.07),
    clear: () => melody([659, 880, 1175], 0.07),
    wave: () => melody([392, 392, 523], 0.1, 'square', 0.06),
    dash: () => tone(120, 0.5, 'sawtooth', 0.1, 200),
    win: () => melody([523, 659, 784, 1046, 1318], 0.12),
    lose: () => melody([392, 330, 262, 196], 0.18, 'sine', 0.12),
  };
})(window);
