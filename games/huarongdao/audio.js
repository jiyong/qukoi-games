(function () {
  let ctx = null;
  let muted = localStorage.getItem('pvz-hrd-muted') === '1';

  function ac() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone({ freq, to = freq, dur = 0.12, type = 'sine', vol = 0.25, delay = 0 }) {
    if (muted) return;
    const a = ac();
    const t = a.currentTime + delay;
    const osc = a.createOscillator();
    const gain = a.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(to, t + dur);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(a.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  function noise(dur = 0.15, vol = 0.2, cutoff = 900) {
    if (muted) return;
    const a = ac();
    const buf = a.createBuffer(1, a.sampleRate * dur, a.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = a.createBufferSource();
    const filter = a.createBiquadFilter();
    const gain = a.createGain();
    filter.type = 'lowpass';
    filter.frequency.value = cutoff;
    gain.gain.value = vol;
    src.buffer = buf;
    src.connect(filter).connect(gain).connect(a.destination);
    src.start();
  }

  const melody = (notes, step, opts) => notes.forEach((f, i) => tone({ freq: f, delay: i * step, ...opts }));

  window.Sfx = {
    get muted() { return muted; },
    toggle() {
      muted = !muted;
      localStorage.setItem('pvz-hrd-muted', muted ? '1' : '0');
      if (!muted) this.pick();
      return muted;
    },
    pick: () => tone({ freq: 520, to: 780, dur: 0.08, type: 'triangle', vol: 0.18 }),
    move: () => { tone({ freq: 300, to: 160, dur: 0.1, type: 'sine', vol: 0.3 }); noise(0.08, 0.12, 600); },
    bump: () => tone({ freq: 120, to: 70, dur: 0.14, type: 'square', vol: 0.08 }),
    groan: () => tone({ freq: 140, to: 95, dur: 0.5, type: 'sawtooth', vol: 0.07 }),
    hint: () => melody([880, 1175], 0.09, { dur: 0.18, type: 'triangle', vol: 0.15 }),
    undo: () => tone({ freq: 700, to: 420, dur: 0.12, type: 'triangle', vol: 0.15 }),
    sun: () => melody([1320, 1760], 0.06, { dur: 0.12, type: 'sine', vol: 0.12 }),
    win() {
      melody([523, 659, 784, 1047, 784, 1047, 1319], 0.12, { dur: 0.22, type: 'triangle', vol: 0.2 });
      melody([262, 330, 392, 523], 0.24, { dur: 0.4, type: 'sine', vol: 0.12 });
    },
  };
})();
