#!/usr/bin/env node
// Scans sub-directories for games, captures thumbnails, writes games.json.
// Usage: node tools/build.js [--no-shots] [--force]
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const GAMES_DIR = path.join(ROOT, 'games');
const THUMB_DIR = path.join(ROOT, 'thumbs');
const SKIP = new Set(['.DS_Store']);
const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);

const args = new Set(process.argv.slice(2));
const takeShots = !args.has('--no-shots');
const force = args.has('--force');

function findChrome() {
  return CHROME_CANDIDATES.find((p) => fs.existsSync(p));
}

function pick(html, re) {
  const m = html.match(re);
  return m ? m[1].replace(/\s+/g, ' ').trim() : '';
}

function readOverride(dir) {
  const file = path.join(dir, 'game.json');
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    console.warn(`[warn] invalid ${file}: ${err.message}`);
    return {};
  }
}

function latestMtime(dir) {
  let latest = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const t = entry.isDirectory() ? latestMtime(full) : fs.statSync(full).mtimeMs;
    if (t > latest) latest = t;
  }
  return latest;
}

function capture(chrome, name, htmlFile) {
  const png = path.join(THUMB_DIR, `${name}.png`);
  const jpg = path.join(THUMB_DIR, `${name}.jpg`);
  execFileSync(chrome, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--mute-audio',
    '--window-size=1280,800', '--virtual-time-budget=4000',
    `--screenshot=${png}`, `file://${htmlFile}`,
  ], { stdio: 'ignore', timeout: 60000 });
  try {
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '80',
      '-Z', '720', png, '--out', jpg], { stdio: 'ignore' });
    fs.unlinkSync(png);
    return `thumbs/${name}.jpg`;
  } catch {
    return `thumbs/${name}.png`;
  }
}

function existingThumb(name) {
  for (const ext of ['jpg', 'png', 'webp']) {
    if (fs.existsSync(path.join(THUMB_DIR, `${name}.${ext}`))) return `thumbs/${name}.${ext}`;
  }
  return '';
}

function main() {
  fs.mkdirSync(THUMB_DIR, { recursive: true });
  const chrome = takeShots ? findChrome() : null;
  if (takeShots && !chrome) console.warn('[warn] Chrome not found, skipping screenshots');

  const games = [];
  for (const entry of fs.readdirSync(GAMES_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('.') || SKIP.has(entry.name)) continue;
    const dir = path.join(GAMES_DIR, entry.name);
    const htmlFile = path.join(dir, 'index.html');
    if (!fs.existsSync(htmlFile)) {
      console.log(`[skip] ${entry.name} (no index.html)`);
      continue;
    }
    const html = fs.readFileSync(htmlFile, 'utf8');
    const meta = readOverride(dir);
    const updated = latestMtime(dir);
    let thumb = meta.thumb ? `games/${entry.name}/${meta.thumb}` : existingThumb(entry.name);
    const thumbFile = thumb && path.join(ROOT, thumb);
    const stale = !thumb || (thumbFile && fs.statSync(thumbFile).mtimeMs < updated);
    if (chrome && !meta.thumb && (force || stale)) {
      try {
        thumb = capture(chrome, entry.name, htmlFile);
        console.log(`[shot] ${entry.name}`);
      } catch (err) {
        console.warn(`[warn] screenshot failed for ${entry.name}: ${err.message}`);
      }
    }
    games.push({
      id: entry.name,
      url: `games/${entry.name}/`,
      title: meta.title || pick(html, /<title[^>]*>([^<]*)<\/title>/i) || entry.name,
      desc: meta.desc || pick(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i),
      tags: Array.isArray(meta.tags) ? meta.tags : [],
      thumb,
      updated: new Date(updated).toISOString().slice(0, 10),
      order: Number.isFinite(meta.order) ? meta.order : 0,
    });
  }
  games.sort((a, b) => b.order - a.order || b.updated.localeCompare(a.updated));
  const out = { generated: new Date().toISOString(), games };
  fs.writeFileSync(path.join(ROOT, 'games.json'), JSON.stringify(out, null, 2) + '\n');
  console.log(`[done] ${games.length} games -> games.json`);
}

main();
