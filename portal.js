(function() {
  'use strict';

  const grid = document.querySelector('.grid');
  const search = document.querySelector('.search');
  const count = document.querySelector('.count');
  const footer = document.querySelector('#year');

  footer.textContent = new Date().getFullYear();

  let allGames = [];

  function hashColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 60%, 30%)`;
  }

  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (k === 'class') node.className = v;
        else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
        else node.setAttribute(k, v);
      }
    }
    for (const child of children) {
      if (typeof child === 'string') node.appendChild(document.createTextNode(child));
      else if (child) node.appendChild(child);
    }
    return node;
  }

  function placeholder(title) {
    const initial = (title.match(/[一-龥]/) ? title.slice(0, 1) : title.slice(0, 2)).toUpperCase();
    const bg = hashColor(title);
    return el('div', { class: 'placeholder', style: `background: ${bg}` }, initial);
  }

  function renderCard(game) {
    const card = el('a', { class: 'card', href: game.url, role: 'listitem' });
    const screen = el('div', { class: 'screen' });
    if (game.thumb) {
      const img = el('img', { src: game.thumb, alt: game.title, loading: 'lazy' });
      img.onerror = () => {
        img.replaceWith(placeholder(game.title));
      };
      screen.appendChild(img);
    } else {
      screen.appendChild(placeholder(game.title));
    }
    const info = el('div', { class: 'info' });
    info.appendChild(el('h2', { class: 'title' }, game.title));
    if (game.desc) {
      info.appendChild(el('p', { class: 'desc' }, game.desc));
    }
    if (game.tags && game.tags.length) {
      const tags = el('div', { class: 'tags' });
      for (const tag of game.tags) {
        tags.appendChild(el('span', { class: 'tag' }, tag));
      }
      info.appendChild(tags);
    }
    card.appendChild(screen);
    card.appendChild(info);
    return card;
  }

  function filterGames() {
    const query = search.value.toLowerCase().trim();
    const filtered = allGames.filter(g => {
      const text = [g.title, g.desc, ...g.tags].join(' ').toLowerCase();
      return text.includes(query);
    });
    grid.innerHTML = '';
    filtered.forEach(g => grid.appendChild(renderCard(g)));
    count.textContent = `${filtered.length} 款游戏`;
  }

  async function loadGames() {
    try {
      const res = await fetch('games.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      allGames = data.games || [];
      filterGames();
    } catch (err) {
      grid.innerHTML = '';
      grid.appendChild(el('div', { class: 'error' },
        el('p', {}, '无法加载游戏列表'),
        el('p', {}, err.message)
      ));
    }
  }

  search.addEventListener('input', filterGames);
  loadGames();
})();
