'use strict';

G.audio = (() => {
  let ac = null;
  let master = null;
  let musicGain = null;
  let noiseBuf = null;
  let musicOn = true;
  let song = null;
  let step = 0;
  let nextNote = 0;
  const last = {};

  function unlock() {
    if (ac) {
      if (ac.state === 'suspended') ac.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    master = ac.createGain();
    master.gain.value = 0.45;
    master.connect(ac.destination);
    musicGain = ac.createGain();
    musicGain.gain.value = 0.16;
    musicGain.connect(master);
    nextNote = ac.currentTime + 0.1;
  }

  function tone(freq, dur, type, vol, slideTo, when = 0, dest = master) {
    const t0 = ac.currentTime + when;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g);
    g.connect(dest);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  }

  function noise(dur, vol, freq, when = 0) {
    if (!noiseBuf) {
      noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const t0 = ac.currentTime + when;
    const s = ac.createBufferSource();
    s.buffer = noiseBuf;
    const f = ac.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(freq, t0);
    f.frequency.exponentialRampToValueAtTime(60, t0 + dur);
    const g = ac.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    s.connect(f);
    f.connect(g);
    g.connect(master);
    s.start(t0);
    s.stop(t0 + dur);
  }

  const arp = (notes, gap, type, vol) =>
    notes.forEach((f, i) => tone(f, gap * 2, type, vol, null, i * gap));

  const SFX = {
    shoot: () => tone(900, 0.05, 'square', 0.025, 500),
    hit: () => tone(320, 0.04, 'square', 0.03, 160),
    boom: () => noise(0.45, 0.35, 1800),
    bigBoom: () => {
      noise(1.4, 0.6, 2600);
      tone(110, 1, 'sawtooth', 0.22, 30);
    },
    power: () => arp([523, 659, 784, 1047], 0.06, 'triangle', 0.15),
    shield: () => tone(380, 0.45, 'sine', 0.22, 1300),
    shieldHit: () => tone(1600, 0.25, 'sine', 0.16, 300),
    bomb: () => {
      noise(1.6, 0.6, 4000);
      tone(70, 1.3, 'sine', 0.4, 20);
    },
    warn: () => [0, 0.55, 1.1].forEach((w) => tone(440, 0.4, 'sawtooth', 0.12, 220, w)),
    laser: () => tone(180, 0.7, 'sawtooth', 0.07, 1400),
    die: () => {
      noise(1.1, 0.5, 3000);
      tone(420, 1, 'square', 0.14, 40);
    },
    phase: () => arp([330, 440, 330, 554], 0.08, 'sawtooth', 0.1),
    clear: () => arp([523, 659, 784, 1047, 1319], 0.12, 'square', 0.1),
    graze: () => tone(2200, 0.03, 'sine', 0.025),
  };

  function play(name, throttle = 0.035) {
    if (!ac || !SFX[name]) return;
    const now = ac.currentTime;
    if (last[name] && now - last[name] < throttle) return;
    last[name] = now;
    SFX[name]();
  }

  const SONGS = {
    calm: {
      bpm: 128,
      bass: [45, 0, 45, 57, 43, 0, 43, 55, 41, 0, 41, 53, 43, 0, 43, 55],
      lead: [69, 0, 72, 0, 76, 74, 72, 0, 67, 0, 71, 0, 74, 72, 71, 0],
    },
    tense: {
      bpm: 140,
      bass: [40, 40, 52, 40, 43, 43, 55, 43, 38, 38, 50, 38, 42, 42, 54, 42],
      lead: [64, 0, 67, 71, 0, 72, 71, 67, 62, 0, 66, 69, 0, 71, 69, 66],
    },
    boss: {
      bpm: 156,
      bass: [40, 52, 40, 52, 41, 53, 41, 53, 43, 55, 43, 55, 39, 51, 39, 51],
      lead: [76, 0, 75, 76, 0, 79, 77, 76, 74, 0, 72, 74, 0, 71, 72, 74],
    },
  };

  const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

  function setSong(name) {
    song = SONGS[name] || null;
    step = 0;
    if (ac) nextNote = ac.currentTime + 0.1;
  }

  function tick() {
    if (!ac || !song || !musicOn) return;
    const len = 60 / song.bpm / 2;
    if (nextNote < ac.currentTime) nextNote = ac.currentTime + 0.05;
    while (nextNote < ac.currentTime + 0.15) {
      const when = nextNote - ac.currentTime;
      const b = song.bass[step % song.bass.length];
      const l = song.lead[step % song.lead.length];
      if (b) tone(midi(b), len * 0.9, 'triangle', 0.55, null, when, musicGain);
      if (l && step % 32 < 24) tone(midi(l), len * 0.8, 'square', 0.16, null, when, musicGain);
      nextNote += len;
      step++;
    }
  }

  function toggleMusic() {
    musicOn = !musicOn;
    return musicOn;
  }

  return { unlock, play, setSong, tick, toggleMusic };
})();
