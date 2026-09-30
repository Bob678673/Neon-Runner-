/* NEON RUNNER – ADDON: Items, Waffen, Welten, Boss-Phasen, stärkere Skins.
   In index.html NACH deinem bisherigen <script> einbinden: <script src="addon.js"></script> */
(() => {
const R = Math.random, rnd = (a, b) => a + R() * (b - a), m = (a, b) => ((a % b) + b) % b;

/* ---------- Welten ---------- */
const W = [
 { n: 'NEON CITY', ground: '#00ffff', obs: '#ff174f', edge: '#ffb0c0', dark: '#3a0614' },
 { n: 'WELTRAUM', bg: ['#000010', '#05001f', '#0a0030'], ground: '#8a7dff', obs: '#9aa3c7', edge: '#e0e6ff', dark: '#232a4d' },
 { n: 'EISWELT', bg: ['#0a2540', '#1c5a86', '#6fc3e6'], ground: '#bff3ff', obs: '#7fe3ff', edge: '#ffffff', dark: '#1f6f94' },
 { n: 'VULKAN', bg: ['#1a0500', '#3a0a00', '#801a00'], ground: '#ff6a00', obs: '#ff4d00', edge: '#ffd27a', dark: '#2a0d05' }
];

/* ---------- Waffen & Skins ---------- */
const WP = {
 blaster: { n: 'BLASTER', cd: .22, dmg: 10, spd: 13, w: 18, h: 5 },
 laser:   { n: 'LASER',   cd: .11, dmg: 6,  spd: 24, w: 48, h: 3 },
 plasma:  { n: 'PLASMA',  cd: .55, dmg: 30, spd: 8,  w: 24, h: 24 }
};
const SW = ['blaster', 'blaster', 'laser', 'blaster', 'plasma', 'laser', 'plasma', 'plasma', 'laser', 'plasma'];
skins.forEach((s, i) => { s.tier = i; s.wp = SW[i]; s.hpM = 1 + i * .2; s.dmgM = 1 + i * .18; s.dashM = 1 + i * .12; });
const IT = { heart: ['❤️', '#ff3b6b'], magnet: ['🧲', '#ff6bd6'], nuke: ['☢️', '#ffe600'], mult: ['✖2', '#ffd700'], laser: ['⚡', '#00ffff'], plasma: ['🔮', '#ff00ff'] };

/* ---------- Zustand ---------- */
let world = 0, lastWorld = 0, prevDist = 0, items = [], meteors = [], waves = [], toasts = [];
let itemT = 6, magT = 0, multT = 0, tmpW = 'laser', tmpT = 0, meteorT = 0, meteorAcc = 0, darkT = 0, darkA = 0, flashT = 0, dashOff = 0, hadBoss = false;
const reset = () => { items = []; meteors = []; waves = []; toasts = []; itemT = 6; magT = multT = tmpT = meteorT = darkT = darkA = flashT = dashOff = 0; world = lastWorld = 0; hadBoss = false; };
const toast = t => toasts.push({ t, life: 2.4 });
const curW = () => tmpT > 0 ? tmpW : getSelectedSkin().wp;

/* ---------- Skins: mehr Leben (weniger Schaden), stärkerer Dash ---------- */
const _dmg = damagePlayer;
damagePlayer = a => _dmg(a / getSelectedSkin().hpM);

updatePlayerHealth = function (d) { if (playerDamageCooldown > 0) playerDamageCooldown -= d; };

const _dash = dash;
dash = function () {
 const was = player.dashTimer; _dash();
 if (was <= 0 && player.dashTimer > 0) {
  const s = getSelectedSkin();
  player.dashTimer *= s.dashM;
  playerDamageCooldown = Math.max(playerDamageCooldown, player.dashTimer);
  createParticles(player.x, player.y + 30, s.glow, 10 + s.tier * 3);
 }
};

const _rs = renderShop;
renderShop = function () {
 _rs();
 [...skinGrid.children].forEach((c, i) => {
  const s = skins[i]; if (!s) return;
  c.querySelector('h3').insertAdjacentHTML('afterend',
   `<div style="font-size:11px;color:#ff9bf2;line-height:1.5">❤️ x${s.hpM.toFixed(1)} · ⚔️ x${s.dmgM.toFixed(2)} · 💨 x${s.dashM.toFixed(2)}<br>🔫 ${WP[s.wp].n}</div>`);
 });
};

/* ---------- Schießen ---------- */
shoot = function () {
 if (!gameRunning || gamePaused || shootCooldown > 0) return;
 const k = curW(), w = WP[k], sk = getSelectedSkin();
 shootCooldown = w.cd;
 playerProjectiles.push({
  x: player.x + player.width, y: player.y + player.height * .42 - w.h / 2 + 2, width: w.w, height: w.h,
  speed: w.spd, damage: w.dmg * sk.dmgM, life: 3, kind: k,
  color: k === 'blaster' ? '#ffe600' : k === 'laser' ? sk.glow : sk.body
 });
 createParticles(player.x + player.width, player.y + player.height * .42, sk.glow, 4);
};

/* ---------- Items ---------- */
function nuke() {
 obstacles.length = 0; bossProjectiles.length = 0; meteors.length = 0; waves.length = 0;
 flashT = .7; screenShakeTime = .4; screenShakeIntensity = 10; score += 100;
 for (let i = 0; i < 14; i++) createParticles(R() * width, R() * height * .8, '#ffe600', 8);
 toast('NUKE!');
}
function take(t) {
 if (t === 'heart') { playerHealth = Math.min(MAX_PLAYER_HEALTH, playerHealth + 35); toast('+35 LEBEN'); }
 else if (t === 'magnet') { magT = 9; toast('MAGNET!'); }
 else if (t === 'mult') { multT = 10; toast('MÜNZEN x2'); }
 else if (t === 'nuke') nuke();
 else { tmpW = t; tmpT = 20; toast(WP[t].n + ' (20s)'); }
}

/* Waffen-Items liegen oben auf den Parkour-Plattformen */
const _cp = createParkour;
createParkour = function () {
 const n = platforms.length; _cp();
 const np = platforms.slice(n); if (!np.length) return;
 const top = np.reduce((a, b) => b.y < a.y ? b : a);
 if (R() < .8) items.push({ type: R() < .5 ? 'laser' : 'plasma', x: top.x + top.width / 2, y: top.y - 30, b: R() * 6 });
 if (R() < .5) { const o = np[Math.floor(R() * np.length)]; items.push({ type: R() < .6 ? 'heart' : 'mult', x: o.x + o.width / 2, y: o.y - 30, b: R() * 6 }); }
};

/* ---------- Bosse: Phasen & Fähigkeiten ---------- */
const BD = [
 { ab: ['burst', 'wave'],           ph: [[.66, 'meteors'], [.33, 'rage']] },
 { ab: ['burst', 'charge'],         ph: [[.66, 'dark'], [.33, 'meteors']] },
 { ab: ['wave', 'summon', 'burst'], ph: [[.75, 'meteors'], [.5, 'dark'], [.25, 'rage']] }
];
const PH = { meteors: 'METEORITENSCHAUER!', dark: 'DUNKELHEIT!', rage: 'WUTMODUS!' };
function trig(k) {
 toast('PHASE ' + (boss.ph + 2) + ': ' + PH[k]);
 screenShakeTime = .5; screenShakeIntensity = 9; createParticles(boss.x + 40, boss.y + 50, boss.color, 40);
 if (k === 'meteors') meteorT = 8; else if (k === 'dark') darkT = 8; else { boss.rage = true; boss.speed *= 1.25; meteorT = 6; }
}
function ability(k) {
 const b = boss, dir = player.x > b.x ? 1 : -1;
 if (k === 'burst') for (let j = 0; j < 3; j++) bossProjectiles.push({ x: b.x, y: b.y + 20 + j * 26, width: 16, height: 7, speed: 7 + b.index * 1.5 + j, direction: dir, damage: b.damage, life: 4 });
 else if (k === 'wave') waves.push({ x: b.x, y: getGroundY() - 32, vx: -8, dmg: b.damage });
 else if (k === 'charge') b.chg = .45;
 else if (k === 'summon') for (let j = 0; j < 3; j++) createObstacle('spike', width + 40 + j * 190);
}
const _ub = updateBoss;
updateBoss = function (d) {
 _ub(d); if (!boss) return;
 const D = BD[boss.index];
 if (boss.ph === undefined) { boss.ph = 0; boss.abT = 2.5; }
 while (boss.ph < D.ph.length && boss.health / boss.maxHealth <= D.ph[boss.ph][0]) { trig(D.ph[boss.ph][1]); boss.ph++; }
 if ((boss.abT -= d * (boss.rage ? 1.6 : 1)) <= 0) { boss.abT = 2.4 - boss.index * .3; ability(D.ab[Math.floor(R() * D.ab.length)]); }
 if (boss.chg > 0) { boss.chg -= d; boss.x -= 520 * d; }
};

/* ---------- Update pro Frame ---------- */
function upd(d) {
 if (distance < prevDist) reset(); prevDist = distance;
 const f = d * 60, sk = getSelectedSkin(), g = getGroundY();
 world = Math.floor(distance / 800) % 4;
 if (world !== lastWorld) { lastWorld = world; toast('WELT: ' + W[world].n); }
 magT -= d; multT -= d; tmpT -= d; darkT -= d; flashT -= d;
 if (boss) hadBoss = true; else if (hadBoss) { hadBoss = false; meteorT = darkT = 0; }
 if ((itemT -= d) <= 0) { itemT = rnd(7, 13); const r = R(); items.push({ type: r < .4 ? 'heart' : r < .62 ? 'magnet' : r < .84 ? 'mult' : 'nuke', x: width + 60, y: g - rnd(50, 120), b: R() * 6 }); }
 for (let i = items.length - 1; i >= 0; i--) {
  const o = items[i]; o.x -= gameSpeed; o.b += d * 4;
  const dx = player.x + 21 - o.x, dy = player.y + player.height / 2 - o.y;
  if (dx * dx + dy * dy < 1300) { take(o.type); createParticles(o.x, o.y, IT[o.type][1], 16); items.splice(i, 1); }
  else if (o.x < -60) items.splice(i, 1);
 }
 if (magT > 0) for (const c of coins) { const dx = player.x + 21 - c.x, dy = player.y + 30 - c.y; if (dx * dx + dy * dy < 176400) { c.x += dx * Math.min(1, d * 5); c.y += dy * Math.min(1, d * 5); } }
 if (meteorT > 0) { meteorT -= d; if ((meteorAcc -= d) <= 0) { meteorAcc = .32; meteors.push({ x: rnd(width * .3, width + 250), y: -30, vx: -rnd(2, 6), vy: rnd(6, 10), r: rnd(9, 19) }); } }
 for (let i = meteors.length - 1; i >= 0; i--) {
  const o = meteors[i]; o.x += o.vx * f; o.y += o.vy * f;
  if (collision(player, { x: o.x - o.r, y: o.y - o.r, width: o.r * 2, height: o.r * 2 })) { damagePlayer(12); createParticles(o.x, o.y, '#ff8a00', 14); meteors.splice(i, 1); }
  else if (o.y > g - o.r) { createParticles(o.x, g, '#ff8a00', 10); meteors.splice(i, 1); }
 }
 for (let i = waves.length - 1; i >= 0; i--) {
  const o = waves[i]; o.x += o.vx * f;
  if (collision(player, { x: o.x, y: o.y, width: 34, height: 32 })) { damagePlayer(o.dmg); waves.splice(i, 1); }
  else if (o.x < -60) waves.splice(i, 1);
 }
 darkA += ((darkT > 0 ? 1 : 0) - darkA) * Math.min(1, d * 3);
 toasts.forEach(t => t.life -= d); toasts = toasts.filter(t => t.life > 0);
 dashOff += ((player.dashTimer > 0 ? 50 * sk.dashM : 0) - dashOff) * Math.min(1, d * 10);
 player.x = Math.min(120, width * .18) + dashOff;
 if (sk.tier >= 6 && R() < .35) createParticles(player.x + 5, player.y + player.height - 10, sk.glow, 1);
}
/* Münz-Multiplikator: verdoppelt alles, was in diesem Frame eingesammelt wurde */
const _uc = updateCoins;
updateCoins = function (d) {
 const t0 = totalCoins; _uc(d);
 const gain = totalCoins - t0;
 if (multT > 0 && gain > 0) { totalCoins += gain; coinsCollected += gain; localStorage.setItem('neonRunnerCoins', totalCoins); }
 upd(d);
};

/* ---------- Zeichnen: Hintergrund / Hindernisse pro Welt ---------- */
const _bg = drawBackground;
drawBackground = function () {
 if (!world) return _bg();
 const P = W[world], g = ctx.createLinearGradient(0, 0, 0, height), gy = getGroundY(), o = distance * 24;
 P.bg.forEach((c, i) => g.addColorStop(i / 2, c)); ctx.fillStyle = g; ctx.fillRect(0, 0, width, height);
 if (world === 1) {
  ctx.fillStyle = '#fff';
  for (let i = 0; i < 80; i++) ctx.fillRect(m(i * 173 - o * (.05 + i % 3 * .05), width), (i * 97) % gy, 1 + i % 2, 1 + i % 2);
  const px = width * .78, py = gy * .35, pg = ctx.createRadialGradient(px, py, 4, px, py, 70);
  pg.addColorStop(0, '#ffb4f0'); pg.addColorStop(1, '#3a1a7a'); ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(px, py, 62, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(200,180,255,.5)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(px, py, 100, 18, -.3, 0, 7); ctx.stroke();
 } else {
  const ice = world === 2;
  for (let l = 0; l < 2; l++) {
   const sp = l ? .35 : .18, wd = l ? 230 : 330, base = Math.floor(o * sp / wd), off = (o * sp) % wd;
   for (let k = -1; k < width / wd + 2; k++) {
    const x = k * wd - off, h = (l ? 90 : 150) + (((k + base) * 37 + l * 11) & 3) * 28;
    ctx.fillStyle = ice ? (l ? '#5fb7d8' : '#3d8fb5') : (l ? '#3b0d04' : '#240802');
    ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x + wd / 2, gy - h); ctx.lineTo(x + wd, gy); ctx.fill();
    if (!ice && !l) { ctx.fillStyle = '#ff5a00'; ctx.fillRect(x + wd / 2 - 6, gy - h, 12, 10); }
   }
  }
  ctx.fillStyle = ice ? '#fff' : '#ff9a3c';
  for (let i = 0; i < 40; i++) ctx.fillRect(m(i * 211 - o * .6 * (1 + i % 3 * .3), width), m(i * 83 + performance.now() / (ice ? 25 : -12) * (1 + i % 3 * .4), gy), 2, 2);
 }
 ctx.fillStyle = P.ground + '33'; ctx.fillRect(0, gy, width, height - gy);
 ctx.strokeStyle = P.ground; ctx.lineWidth = 2; ctx.shadowColor = P.ground; ctx.shadowBlur = 10;
 ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(width, gy); ctx.stroke(); ctx.shadowBlur = 0;
};

const grad = (y0, y1, c0, c1) => { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, c0); g.addColorStop(1, c1); return g; };
drawObstacles = function () {
 const P = W[world], T = performance.now() / 1000;
 for (const o of obstacles) {
  ctx.save(); ctx.lineJoin = 'round';
  const x = o.x, y = o.y, w = o.width, h = o.height, cx = x + w / 2, pl = .6 + Math.sin(T * 4 + o.pulse) * .4;
  ctx.shadowColor = P.obs; ctx.shadowBlur = 12 + pl * 12; ctx.strokeStyle = P.edge; ctx.lineWidth = 1.6;
  if (o.type === 'ceilingSpike') {
   ctx.translate(cx, 0); ctx.rotate(Math.sin(T * 2 + o.pulse) * .03); ctx.translate(-cx, 0);
   ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, y); ctx.stroke();
   for (let ly = 8; ly < y - 4; ly += 12) { ctx.beginPath(); ctx.ellipse(cx, ly, 4, 3, ly % 24 ? .4 : -.4, 0, 7); ctx.stroke(); }
   ctx.fillStyle = grad(y, y + 14, P.edge, P.dark); ctx.beginPath(); ctx.roundRect(x - 4, y, w + 8, 14, 4); ctx.fill(); ctx.stroke();
   ctx.fillStyle = grad(y + 14, y + h, P.obs, P.edge);
   for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(x + k * w / 3, y + 14); ctx.lineTo(x + k * w / 3 + w / 6, y + h); ctx.lineTo(x + (k + 1) * w / 3, y + 14); ctx.closePath(); ctx.fill(); ctx.stroke(); }
   ctx.fillStyle = '#fff'; ctx.globalAlpha = pl; for (const lx of [x + 6, cx, x + w - 6]) { ctx.beginPath(); ctx.arc(lx, y + 7, 2.5, 0, 7); ctx.fill(); }
   ctx.globalAlpha = 1; ctx.shadowBlur = 0; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center'; ctx.fillText('↓ SLIDE', cx, y - 10);
  } else if (o.type === 'spike') {
   const sh = [[x, x + w * .42, x + w * .2, h * .6], [x + w * .22, x + w * .78, cx, h], [x + w * .58, x + w, x + w * .8, h * .68]];
   ctx.fillStyle = grad(y, y + h, P.edge, P.obs);
   for (const [a1, b1, p, hh] of sh) { ctx.beginPath(); ctx.moveTo(a1, y + h); ctx.lineTo(p, y + h - hh); ctx.lineTo(b1, y + h); ctx.closePath(); ctx.fill(); ctx.stroke(); }
   ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.beginPath(); ctx.moveTo(cx, y + 5); ctx.lineTo(cx - 4, y + h - 4); ctx.stroke();
   ctx.fillStyle = P.dark; ctx.fillRect(x - 2, y + h - 5, w + 4, 5);
   if (world === 3) { ctx.fillStyle = '#ffd27a'; for (let k = 0; k < 2; k++) { ctx.beginPath(); ctx.arc(cx + (k ? 9 : -9), y + 8 - Math.abs(Math.sin(T * 8 + k * 2)) * 9, 3, 0, 7); ctx.fill(); } }
   if (world === 1) { ctx.fillStyle = P.edge; ctx.beginPath(); ctx.arc(cx + Math.cos(T * 3 + o.pulse) * w * .7, y + h * .4 + Math.sin(T * 3 + o.pulse) * 12, 2.5, 0, 7); ctx.fill(); }
   if (world === 2) { ctx.fillStyle = '#fff'; ctx.globalAlpha = pl; ctx.fillRect(x + w * .25, y + h * .35, 3, 3); ctx.fillRect(x + w * .7, y + h * .55, 2, 2); }
  } else {
   ctx.fillStyle = grad(y, y + h, P.obs, P.dark);
   if (world === 1) {
    ctx.beginPath(); ctx.ellipse(cx, y + h / 2, w / 2 + 4, h / 2, 0, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.arc(cx - w * .15, y + h * .35, w * .16, 0, 7); ctx.arc(cx + w * .18, y + h * .65, w * .1, 0, 7); ctx.fill();
   } else { ctx.beginPath(); ctx.roundRect(x, y, w, h, 5); ctx.fill(); ctx.stroke(); }
   if (world === 0) {
    ctx.fillStyle = P.edge; ctx.globalAlpha = pl; for (let yy = y + 10; yy < y + h - 8; yy += 12) ctx.fillRect(x + 6, yy, w - 12, 3);
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + w - 7, y + 7, 3, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
   } else if (world === 2) {
    ctx.fillStyle = P.edge; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(x + k * w / 3, y); ctx.lineTo(x + k * w / 3 + w / 6, y - 11 - k % 2 * 5); ctx.lineTo(x + (k + 1) * w / 3, y); ctx.fill(); }
    ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.moveTo(x + 6, y + 6); ctx.lineTo(x + 6, y + h - 10); ctx.stroke();
   } else if (world === 3) {
    ctx.strokeStyle = '#ffb347'; ctx.lineWidth = 2; ctx.globalAlpha = pl; ctx.beginPath(); ctx.moveTo(x + 4, y + h * .3); ctx.lineTo(cx, y + h * .55); ctx.lineTo(x + w - 5, y + h * .4); ctx.moveTo(cx, y + h * .55); ctx.lineTo(cx - 4, y + h - 4); ctx.stroke(); ctx.globalAlpha = 1;
    ctx.fillStyle = '#ff9a3c'; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(x + w * (.25 + k * .25), y - (T * 28 + k * 9 + o.pulse * 7) % 22, 2, 0, 7); ctx.fill(); }
   }
  }
  ctx.restore();
 }
};

/* ---------- Zeichnen: Bosse (3 eigene Designs) ---------- */
drawBoss = function () {
 if (!boss) return;
 const b = boss, i = b.index, A = b.animation, H = b.sliding ? 55 : 100, c = b.hitFlash > 0 ? '#fff' : b.color, pul = Math.sin(A * 1.3);
 ctx.save(); ctx.translate(b.x, b.y + H); ctx.scale(1, H / 100);
 ctx.shadowColor = b.color; ctx.shadowBlur = 26; ctx.fillStyle = b.color;
 for (let k = 0; k < 3 + i; k++) { const a = A * .5 + k * 6.283 / (3 + i); ctx.beginPath(); ctx.arc(40 + Math.cos(a) * 64, -52 + Math.sin(a) * 50, 4, 0, 7); ctx.fill(); }
 if (i === 2) { ctx.globalAlpha = .55; const fl = Math.sin(A) * 14; for (const s of [0, 1]) { const bx = s ? 80 : 0, d = s ? 1 : -1; ctx.beginPath(); ctx.moveTo(bx, -75); ctx.lineTo(bx + d * 70, -115 + fl); ctx.lineTo(bx + d * 48, -70); ctx.lineTo(bx + d * 72, -44 + fl); ctx.lineTo(bx, -40); ctx.fill(); } ctx.globalAlpha = 1; }
 const leg = Math.sin(A) * 8; ctx.strokeStyle = c; ctx.lineWidth = 10; ctx.lineCap = 'round';
 ctx.beginPath(); ctx.moveTo(26, -30); ctx.lineTo(20 + leg, 0); ctx.moveTo(54, -30); ctx.lineTo(60 - leg, 0); ctx.stroke();
 const g = ctx.createLinearGradient(0, -80, 0, -25); g.addColorStop(0, c); g.addColorStop(1, '#1a0d2e');
 ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(10, -78, 60, 52, 10); ctx.fill();
 ctx.fillStyle = c; ctx.beginPath(); ctx.arc(6, -66, 14, 0, 7); ctx.arc(74, -66, 14, 0, 7); ctx.fill();
 ctx.beginPath(); ctx.roundRect(14, -104, 52, 32, 10); ctx.fill();
 ctx.beginPath();
 if (i === 0) { ctx.moveTo(18, -102); ctx.lineTo(10, -124); ctx.lineTo(28, -104); ctx.moveTo(62, -102); ctx.lineTo(70, -124); ctx.lineTo(52, -104); }
 else if (i === 1) { ctx.moveTo(40, -104); ctx.lineTo(28, -140); ctx.lineTo(52, -104); ctx.moveTo(-6, -78); ctx.lineTo(6, -100); ctx.lineTo(8, -74); ctx.moveTo(86, -78); ctx.lineTo(74, -100); ctx.lineTo(72, -74); }
 else for (let k = 0; k < 5; k++) { ctx.moveTo(16 + k * 12, -104); ctx.lineTo(22 + k * 12, -(k % 2 ? 122 : 132)); ctx.lineTo(28 + k * 12, -104); }
 ctx.fill();
 ctx.shadowBlur = 0; ctx.fillStyle = '#0a0614'; ctx.beginPath(); ctx.roundRect(19, -96, 42, 14, 6); ctx.fill();
 ctx.fillStyle = b.rage ? '#ff3030' : '#fff'; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 10;
 if (i === 1) { ctx.beginPath(); ctx.arc(40 + Math.sin(A * .6) * 8, -89, 5, 0, 7); ctx.fill(); } else { ctx.fillRect(24, -92, 13, 5); ctx.fillRect(43, -92, 13, 5); }
 ctx.shadowColor = '#fff'; ctx.shadowBlur = 18; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(40, -52, 7 + pul * 2, 0, 7); ctx.fill();
 ctx.strokeStyle = b.color; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(40, -52, 13 + pul * 2, 0, 7); ctx.stroke();
 ctx.fillStyle = '#2b2b3d'; ctx.shadowColor = b.color; ctx.shadowBlur = 12; ctx.beginPath(); ctx.roundRect(-28, -62, 44, 12, 4); ctx.fill(); ctx.stroke();
 if (b.shootTimer < .3) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-28, -56, 8, 0, 7); ctx.fill(); }
 ctx.restore();
 ctx.save(); ctx.fillStyle = '#fff'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center'; ctx.fillText(b.name, b.x + 40, b.y - 42); ctx.restore();
};

/* ---------- Zeichnen: Schüsse, Spieler-Effekte ---------- */
drawProjectiles = function () {
 for (const s of playerProjectiles) {
  ctx.save(); const c = s.color || '#ffe600'; ctx.shadowColor = c; ctx.shadowBlur = 20; ctx.fillStyle = c;
  if (s.kind === 'plasma') { const r = s.width / 2, cx = s.x + r, cy = s.y + r, g = ctx.createRadialGradient(cx, cy, 2, cx, cy, r); g.addColorStop(0, '#fff'); g.addColorStop(1, c); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r + Math.sin(performance.now() / 60) * 2, 0, 7); ctx.fill(); }
  else if (s.kind === 'laser') { const g = ctx.createLinearGradient(s.x, 0, s.x + s.width, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, '#fff'); ctx.globalAlpha = .6; ctx.fillRect(s.x, s.y - 3, s.width, s.height + 6); ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(s.x, s.y - 1, s.width, s.height + 2); }
  else { ctx.beginPath(); ctx.roundRect(s.x, s.y, s.width, s.height, 3); ctx.fill(); }
  ctx.restore();
 }
 for (const s of bossProjectiles) {
  ctx.save(); const c = boss ? boss.color : '#ff174f'; ctx.shadowColor = c; ctx.shadowBlur = 20; ctx.strokeStyle = c; ctx.lineWidth = 5; ctx.globalAlpha = .5;
  ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.direction * 26, s.y); ctx.stroke(); ctx.globalAlpha = 1;
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s.x, s.y, 4, 0, 7); ctx.fill(); ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
 }
};

const _dpl = drawPlayer;
drawPlayer = function () {
 const sk = getSelectedSkin(), t = sk.tier, cx = player.x + 22, cy = player.y + player.height / 2, A = performance.now() / 400;
 ctx.save(); ctx.shadowColor = sk.glow; ctx.shadowBlur = 20; ctx.fillStyle = sk.glow; ctx.strokeStyle = sk.glow;
 if (t >= 5) { const fl = Math.sin(A * 3) * 8; ctx.globalAlpha = .35; ctx.beginPath(); ctx.moveTo(cx - 6, cy - 10); ctx.lineTo(cx - 46, cy - 34 + fl); ctx.lineTo(cx - 30, cy + 4); ctx.moveTo(cx - 6, cy); ctx.lineTo(cx - 42, cy - 8 + fl); ctx.lineTo(cx - 26, cy + 16); ctx.fill(); }
 if (t >= 1) { ctx.globalAlpha = .25 + Math.sin(A * 2) * .1; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, 34 + Math.sin(A) * 3, 0, 7); ctx.stroke(); }
 ctx.globalAlpha = 1;
 if (t >= 3) { const n = Math.min(4, t - 2); for (let k = 0; k < n; k++) { const a = A * 2 + k * 6.283 / n; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * 40, cy + Math.sin(a) * 40, 4, 0, 7); ctx.fill(); } }
 if (t >= 7) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(cx, player.y - 12, 14, 4, 0, 0, 7); ctx.stroke(); }
 ctx.restore(); _dpl();
};

/* ---------- Zeichnen: Items, Gefahren, Overlays ---------- */
function drawItems() {
 ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
 for (const o of items) {
  const [ic, c] = IT[o.type], y = o.y + Math.sin(o.b) * 5;
  ctx.shadowColor = c; ctx.shadowBlur = 20; ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.strokeStyle = c; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(o.x, y, 17, 0, 7); ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0; ctx.fillStyle = '#fff'; ctx.font = 'bold 17px Arial'; ctx.fillText(ic, o.x, y + 1);
 }
}
function drawHaz() {
 for (const o of meteors) {
  const g = ctx.createRadialGradient(o.x, o.y, 1, o.x, o.y, o.r); g.addColorStop(0, '#fff6b0'); g.addColorStop(1, '#ff4d00');
  ctx.shadowColor = '#ff6a00'; ctx.shadowBlur = 22; ctx.strokeStyle = 'rgba(255,120,0,.5)'; ctx.lineWidth = o.r * .8;
  ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.lineTo(o.x - o.vx * 7, o.y - o.vy * 7); ctx.stroke();
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, 7); ctx.fill();
 }
 for (const o of waves) {
  ctx.shadowColor = '#ff174f'; ctx.shadowBlur = 20; ctx.fillStyle = '#ff174f';
  ctx.beginPath(); ctx.moveTo(o.x, o.y + 32); ctx.lineTo(o.x + 10, o.y); ctx.lineTo(o.x + 20, o.y + 12); ctx.lineTo(o.x + 34, o.y + 32); ctx.fill();
 }
 ctx.shadowBlur = 0;
}
const _draw = draw;
draw = function () {
 _draw(); ctx.save(); drawItems(); drawHaz();
 if (darkA > .01) { const cx = player.x + 22, cy = player.y + 30, g = ctx.createRadialGradient(cx, cy, 50, cx, cy, 230); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${.97 * darkA})`); ctx.fillStyle = g; ctx.fillRect(0, 0, width, height); }
 if (flashT > 0) { ctx.fillStyle = `rgba(255,255,255,${Math.min(1, flashT) * .8})`; ctx.fillRect(0, 0, width, height); }
 ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'center';
 toasts.forEach((t, k) => { ctx.globalAlpha = Math.min(1, t.life); ctx.font = 'bold 34px Arial'; ctx.fillStyle = '#fff'; ctx.shadowColor = '#ff00cc'; ctx.shadowBlur = 20; ctx.fillText(t.t, width / 2, height * .28 + k * 44); });
 ctx.globalAlpha = 1;
 const L = [];
 if (magT > 0) L.push('🧲 MAGNET ' + magT.toFixed(0) + 's');
 if (multT > 0) L.push('✖2 MÜNZEN ' + multT.toFixed(0) + 's');
 if (tmpT > 0) L.push('🔫 ' + WP[tmpW].n + ' ' + tmpT.toFixed(0) + 's');
 ctx.font = 'bold 15px Arial'; ctx.textAlign = 'left'; ctx.fillStyle = '#fff'; ctx.shadowColor = '#00ffff'; ctx.shadowBlur = 8;
 L.forEach((t, k) => ctx.fillText(t, 16, height - 22 - k * 24));
 ctx.restore();
};

renderShop();
})();