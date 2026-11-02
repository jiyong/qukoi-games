'use strict';

function dim(ctx, a = 0.6) {
  ctx.fillStyle = `rgba(2,4,12,${a})`;
  ctx.fillRect(0, 0, G.W, G.H);
}

function panel(ctx, y, h) {
  ctx.fillStyle = 'rgba(8,14,30,0.82)';
  ctx.strokeStyle = 'rgba(120,190,255,0.45)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(40, y, G.W - 80, h, 12);
  ctx.fill();
  ctx.stroke();
}

const CONTROLS = [
  ['方向键', '移动战机'],
  ['自动射击', '无需按键'],
  ['Shift', '精确移动（显示判定点）'],
  ['空格 / X', '全屏炸弹（清弹+无敌）'],
  ['P / Esc', '暂停'],
  ['M', '音乐开关'],
];

G.drawMenu = function (ctx) {
  dim(ctx, 0.35);
  const ty = 150 + Math.sin(G.t * 2) * 4;
  G.text(ctx, '空战英豪', G.W / 2, ty, 60, '#ffe08a', 'center', '#ff7a1a');
  G.text(ctx, 'SKY  ACE  HEROES', G.W / 2, ty + 32, 14, '#9fd8ff', 'center');
  G.drawJet(ctx, G.W / 2 + Math.sin(G.t) * 30, 270, Math.cos(G.t) * 0.5, 1.6);
  panel(ctx, 330, 100);
  const sel = G.menuSel;
  const lv = G.LEVELS[sel];
  const boss = G.BOSSES[lv.boss];
  G.text(ctx, '◀', 70, 380, 22, sel > 0 ? '#ffffff' : '#444c5c', 'center');
  G.text(ctx, '▶', G.W - 70, 380, 22, sel < G.unlocked ? '#ffffff' : '#444c5c', 'center');
  G.text(ctx, `第 ${sel + 1} 关 · ${lv.name}`, G.W / 2, 368, 20, '#ffffff', 'center');
  G.text(ctx, `首领：${boss.title}「${boss.name}」  ${boss.phases.length} 阶段`, G.W / 2, 394, 12, '#ffb38a', 'center');
  G.text(ctx, `已解锁 ${G.unlocked + 1} / ${G.LEVELS.length}`, G.W / 2, 416, 11, '#7f93b0', 'center');
  const blink = 0.5 + 0.5 * Math.sin(G.t * 5);
  ctx.globalAlpha = 0.5 + 0.5 * blink;
  G.text(ctx, '按 Enter 出击', G.W / 2, 470, 20, '#ffe08a', 'center', '#ff9a3a');
  ctx.globalAlpha = 1;
  CONTROLS.forEach(([k, v], i) => {
    const y = 520 + i * 22;
    G.text(ctx, k, G.W / 2 - 16, y, 13, '#9fd8ff', 'right');
    G.text(ctx, v, G.W / 2 + 4, y, 13, '#d0d8e8');
  });
  G.text(ctx, `最高分 ${G.hi}`, G.W / 2, G.H - 20, 12, '#7f93b0', 'center');
};

G.drawPause = function (ctx) {
  dim(ctx);
  G.text(ctx, '暂停', G.W / 2, G.H / 2 - 30, 40, '#ffffff', 'center', '#4aa8ff');
  G.text(ctx, 'P / Esc 继续    Q 返回主菜单', G.W / 2, G.H / 2 + 14, 14, '#c0cce0', 'center');
};

G.drawClear = function (ctx) {
  dim(ctx, 0.45);
  const c = G.clearInfo;
  const last = G.level >= G.LEVELS.length - 1;
  panel(ctx, 210, 290);
  G.text(ctx, last ? '全面胜利！' : '任务完成', G.W / 2, 262, 34, '#ffe08a', 'center', '#ff9a3a');
  G.text(ctx, `第 ${G.level + 1} 关 · ${G.levelDef.name}`, G.W / 2, 292, 14, '#9fd8ff', 'center');
  c.lines.forEach(([k, v], i) => {
    const y = 336 + i * 28;
    G.text(ctx, k, 80, y, 15, '#d0d8e8');
    G.text(ctx, String(v), G.W - 80, y, 15, '#ffffff', 'right');
  });
  G.text(ctx, `总分  ${G.score}`, G.W / 2, 452, 20, '#ffe08a', 'center');
  if (c.t > 1) {
    ctx.globalAlpha = 0.5 + 0.5 * Math.sin(G.t * 5);
    G.text(ctx, last ? '按 Enter 返回主菜单' : '按 Enter 进入下一关', G.W / 2, 484, 15, '#ffffff', 'center');
    ctx.globalAlpha = 1;
  }
  if (last) G.text(ctx, '你击败了虚空之心，天空重归和平！', G.W / 2, 545, 15, '#ffb3d9', 'center', '#ff3c8a');
};

G.drawGameOver = function (ctx) {
  dim(ctx, 0.65);
  G.text(ctx, '战机坠毁', G.W / 2, G.H / 2 - 50, 44, '#ff5a5a', 'center', '#ff0030');
  G.text(ctx, `得分 ${G.score}`, G.W / 2, G.H / 2, 20, '#ffffff', 'center');
  if (G.score >= G.hi && G.score > 0) G.text(ctx, '新纪录！', G.W / 2, G.H / 2 + 28, 16, '#ffe08a', 'center');
  G.text(ctx, 'Enter 重试本关    Esc 返回主菜单', G.W / 2, G.H / 2 + 70, 14, '#c0cce0', 'center');
};
