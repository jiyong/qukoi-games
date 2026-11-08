(function (root) {
  'use strict';

  const D = root.YayaData;
  const RING = 70;
  const EDGE = 12;
  const LABEL_SPACE = 40;

  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // handlers: { build(type, cell), upgrade(tower), sell(tower) }
  function create(box, stage, cols, rows, handlers) {
    let mode = null;
    let cell = null;
    let tower = null;
    let buttons = [];

    // Shift the whole ring so every button (plus its price tag) stays inside the stage.
    function place(c, r, kind) {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      const x = ((c + 0.5) / cols) * w;
      const y = ((r + 0.5) / rows) * h;
      const ring = Math.min(RING, w / 7, h / 4.6);
      const btn = Math.max(44, Math.min(60, root.innerWidth * 0.07));
      const mx = ring + btn / 2 + EDGE;
      const my = kind === 'build' ? mx : btn / 2 + LABEL_SPACE;
      const clamp = (v, m, max) => Math.max(m, Math.min(max - m, v));
      box.style.left = `${x}px`;
      box.style.top = `${y}px`;
      box.style.setProperty('--ring', `${ring}px`);
      box.style.setProperty('--dx', `${clamp(x, mx, w) - x}px`);
      box.style.setProperty('--dy', `${clamp(y, my, h) - y}px`);
    }

    function ringButton(index, total, label, onClick) {
      const b = el('button', 'menu-btn');
      b.type = 'button';
      b.setAttribute('aria-label', label);
      b.style.setProperty('--a', `${(index / total) * 360 - 90}deg`);
      b.addEventListener('click', (ev) => {
        ev.stopPropagation();
        if (!b.disabled) onClick();
      });
      box.append(b);
      return b;
    }

    function openBuild(c, r) {
      reset('build', c, r);
      cell = { c, r };
      buttons = D.TOWER_ORDER.map((type, i) => {
        const def = D.TOWERS[type];
        const b = ringButton(i, D.TOWER_ORDER.length, `建造${def.name}，${def.cost} 金币`, () => handlers.build(type, cell));
        const icon = el('canvas', 'menu-icon');
        root.YayaRender.drawIcon(icon, type);
        b.append(icon, el('span', 'menu-price', String(def.cost)), el('kbd', 'menu-key', String(i + 1)));
        b.dataset.cost = def.cost;
        b.title = `${def.name}：${def.desc}`;
        return b;
      });
    }

    function openTower(t, upgradeCost, refund) {
      reset('tower', t.c, t.r);
      tower = t;
      const def = D.TOWERS[t.type];
      box.append(el('div', 'menu-label', `${def.name} · ${t.lvl} 级`));
      const up = ringButton(3, 4, upgradeCost === null ? '已满级' : `升级，${upgradeCost} 金币`, () => handlers.upgrade(tower));
      up.classList.add('menu-up');
      up.append(el('span', 'menu-glyph', '▲'), el('span', 'menu-price', upgradeCost === null ? '满级' : String(upgradeCost)));
      up.dataset.cost = upgradeCost === null ? Infinity : upgradeCost;
      const sell = ringButton(1, 4, `出售，返还 ${refund} 金币`, () => handlers.sell(tower));
      sell.classList.add('menu-sell');
      sell.append(el('span', 'menu-glyph', '¥'), el('span', 'menu-price', `+${refund}`));
      sell.dataset.cost = 0;
      buttons = [up, sell];
    }

    function reset(nextMode, c, r) {
      box.replaceChildren();
      box.hidden = false;
      box.dataset.mode = nextMode;
      mode = nextMode;
      tower = null;
      cell = { c, r };
      place(c, r, nextMode);
    }

    function close() {
      box.hidden = true;
      box.replaceChildren();
      mode = null;
      cell = null;
      tower = null;
      buttons = [];
    }

    function refresh(gold, locked) {
      for (const b of buttons) b.disabled = locked || Number(b.dataset.cost) > gold;
    }

    return {
      openBuild, openTower, close, refresh,
      get mode() { return mode; },
      get cell() { return cell; },
      get tower() { return tower; },
    };
  }

  root.YayaMenu = { create, el };
})(window);
