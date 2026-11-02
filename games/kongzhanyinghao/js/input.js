'use strict';

G.keys = {};
G.pressed = {};

const BLOCKED_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space']);

addEventListener('keydown', (e) => {
  if (BLOCKED_KEYS.has(e.code)) e.preventDefault();
  if (!G.keys[e.code]) G.pressed[e.code] = true;
  G.keys[e.code] = true;
  G.audio.unlock();
});

addEventListener('keyup', (e) => {
  G.keys[e.code] = false;
});

addEventListener('blur', () => {
  G.keys = {};
  if (G.state === 'playing') G.state = 'paused';
});

G.hit = (...codes) => {
  for (const c of codes) {
    if (G.pressed[c]) {
      G.pressed[c] = false;
      return true;
    }
  }
  return false;
};

G.hitEnter = () => G.hit('Enter', 'NumpadEnter');

G.endInput = () => {
  G.pressed = {};
};
