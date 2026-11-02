'use strict';
(function () {
  const MUTE_KEY = 'pvz-m3-mute';
  let ctx = null;
  let muted = localStorage.getItem(MUTE_KEY) === '1';

  function ac() {
    if (!ctx) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, { type = 'sine', vol = 0.2, slide = 0, delay = 0 } = {}) {
    const c = ac();
    if (!c || muted) return;
    const t = c.currentTime + delay;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq * slide), t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  function noise(dur, { vol = 0.3, freq = 800, delay = 0 } = {}) {
    const c = ac();
    if (!c || muted) return;
    const t = c.currentTime + delay;
    const buf = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    const filter = c.createBiquadFilter();
    const gain = c.createGain();
    src.buffer = buf;
    filter.type = 'lowpass';
    filter.frequency.value = freq;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(filter).connect(gain).connect(c.destination);
    src.start(t);
  }

  const notes = (list, gap, opts) => list.forEach((f, i) => tone(f, gap * 1.6, { ...opts, delay: i * gap }));

  const SFX = {
    swap: () => tone(520, 0.08, { type: 'triangle', slide: 1.4, vol: 0.12 }),
    bad: () => notes([220, 180], 0.1, { type: 'square', vol: 0.07 }),
    pop: (chain = 1) => tone(440 * 1.12 ** (Math.min(chain, 10) - 1), 0.14, { type: 'triangle', slide: 1.8, vol: 0.16 }),
    shoot: () => tone(320, 0.06, { type: 'square', slide: 0.6, vol: 0.04 }),
    hit: () => noise(0.07, { vol: 0.12, freq: 1600 }),
    boom: () => { noise(0.6, { vol: 0.45, freq: 420 }); tone(90, 0.5, { slide: 0.4, vol: 0.35 }); },
    chomp: () => { noise(0.12, { vol: 0.3, freq: 900 }); tone(150, 0.15, { type: 'sawtooth', slide: 0.5, vol: 0.12, delay: 0.05 }); },
    beam: () => tone(1200, 0.25, { type: 'sawtooth', slide: 0.3, vol: 0.06 }),
    sun: () => tone(880, 0.15, { slide: 1.5, vol: 0.08 }),
    food: () => notes([523, 659, 784, 1047], 0.07, { type: 'triangle', vol: 0.13 }),
    groan: () => tone(110 + Math.random() * 30, 0.7, { type: 'sawtooth', slide: 0.7, vol: 0.05 }),
    huge: () => notes([196, 185, 175, 165], 0.18, { type: 'sawtooth', vol: 0.08 }),
    mower: () => noise(1.3, { vol: 0.22, freq: 300 }),
    win: () => notes([523, 659, 784, 659, 784, 1047], 0.12, { type: 'triangle', vol: 0.15 }),
    lose: () => notes([392, 330, 262, 196], 0.22, { type: 'sawtooth', vol: 0.08 }),
  };

  PVZ.Audio = {
    play(name, arg) { if (SFX[name]) SFX[name](arg); },
    unlock: ac,
    get on() { return !muted; },
    toggle() {
      muted = !muted;
      localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
      return !muted;
    },
  };
})();
