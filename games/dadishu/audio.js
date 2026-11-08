(function (root) {
  'use strict';
  let ctx = null;

  function tone(freq, dur, type = 'square', vol = 0.12, slide = 0) {
    if (!ctx) return;
    const t = ctx.currentTime;
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

  root.Sfx = {
    unlock() {
      const AC = root.AudioContext || root.webkitAudioContext;
      if (!ctx && AC) ctx = new AC();
      if (ctx && ctx.state === 'suspended') ctx.resume();
    },
    hit() { tone(220, 0.12, 'square', 0.15, -140); },
    king() { tone(660, 0.1, 'triangle', 0.15); setTimeout(() => tone(990, 0.18, 'triangle', 0.15), 80); },
    miss() { tone(120, 0.08, 'sine', 0.08); },
    combo() { [523, 659, 784].forEach((f, i) => setTimeout(() => tone(f, 0.12, 'triangle', 0.13), i * 70)); },
    clear() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.2, 'triangle', 0.14), i * 120)); },
  };
})(window);
