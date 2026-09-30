/* NEON RUNNER – ADDON 3 (nach addon2.js einbinden)
   Dash-Fix (Hindernisse verursachen wieder Schaden), Dash-Abklingzeit,
   Ultimate (Q), Boss-Loot (1 von 3), tägliche Missionen. */
(() => {
const R = Math.random;
const safe = f => { try { return f(); } catch (e) {} };
const beep = (...a) => window.nrBeep && window.nrBeep(...a);

/* ---------- Dash-Fix: keine Unverwundbarkeit, Hindernisse werden nicht mehr zerstört ---------- */
let dashCd = 0;
const _d = dash;
dash = function () {
 if (dashCd > 0 || !gameRunning || gamePaused) return;
 const cd = playerDamageCooldown, was = player.dashTimer;
 _d(); playerDamageCooldown = cd;
 if (was <= 0 && player.dashTimer > 0) { dashCd = 1.5; beep(300, .25, 'sawtooth', .07, 900); }
};
const _uo = updateObstacles;
updateObstacles = function (d) {
 const dt = player.dashTimer; player.dashTimer = 0;
 _uo(d); player.dashTimer = dt;
 if (dt > 0) for (const o of obstacles) o.x -= gameSpeed * .35;
};

/* ---------- Ultimate ---------- */
let ult = 0, slowT = 0, slowF = .5, fl = 0, vacT = 0, laserT = 0, autoT = 0, lz = null, utxt = null;
const _ud = updateDifficulty;
updateDifficulty = function () { _ud(); if (slowT > 0) gameSpeed *= slowF; };
const _cp3 = createParticles;
createParticles = function (x, y, c, n = 12) { _cp3(x, y, c, n); if (n === 15 && c === '#ffe600') ult = Math.min(100, ult + 3); };
/* Jeder Skin hat seine eigene Ultimate */
const UL = {
 cyan:    { n: 'CYBER-BLAST',    k: 'boom',  bd: .15, slow: 3.5, inv: 3.5 },
 pink:    { n: 'ZEITLUPE',       k: 'slow',  slow: 6, f: .4, inv: 1 },
 gold:    { n: 'GOLDRAUSCH',     k: 'vac',   t: 5, gold: 25 },
 matrix:  { n: 'MATRIX-MODUS',   k: 'slow',  slow: 6, f: .3, inv: 1.5, fire: true },
 void:    { n: 'SCHWARZES LOCH', k: 'vac',   t: 4, bd: .1 },
 ice:     { n: 'EISZEIT',        k: 'boom',  bd: .1, slow: 6, inv: 2 },
 inferno: { n: 'FEUERSTURM',     k: 'laser', t: 3, c: '#ff6a00' },
 plasma:  { n: 'PLASMA-KANONE',  k: 'laser', t: 3.5, c: '#ff00ff', big: true },
 ghost:   { n: 'GEISTERFORM',    k: 'ghost', inv: 7 },
 galaxy:  { n: 'SUPERNOVA',      k: 'boom',  bd: .3, slow: 4, inv: 4, heal: 30 }
};
const uid = () => UL[getSelectedSkin().id] || UL.cyan;
const inv = t => { playerDamageCooldown = Math.max(playerDamageCooldown, t); };
function clearAhead(x0, x1) {
 for (let i = obstacles.length - 1; i >= 0; i--) { const o = obstacles[i]; if (o.x + o.width > x0 && o.x < x1) { _cp3(o.x, o.y, '#ffe600', 6); obstacles.splice(i, 1); score += 10; } }
}
function hitBoss(f) {
 if (!boss || !(f > 0)) return;
 boss.health -= boss.maxHealth * f; boss.hitFlash = .15;
 if (boss.health <= 0) { boss.health = 0; defeatBoss(); }
}
function fireUlt() {
 if (ult < 100 || !gameRunning || gamePaused) return;
 const u = uid(); ult = 0; utxt = { t: u.n + '!', life: 1.8 }; fl = .5;
 screenShakeTime = .5; screenShakeIntensity = 12; beep(80, .6, 'sawtooth', .12, 600);
 for (let i = 0; i < 12; i++) _cp3(R() * width, R() * height * .7, ['#00ffff', '#ff00cc', '#ffe600'][i % 3], 10);
 if (u.k === 'boom') { obstacles.length = 0; bossProjectiles.length = 0; slowT = u.slow; slowF = .5; inv(u.inv); if (u.heal) playerHealth = Math.min(MAX_PLAYER_HEALTH, playerHealth + u.heal); hitBoss(u.bd); }
 else if (u.k === 'slow') { slowT = u.slow; slowF = u.f; inv(u.inv); if (u.fire) autoT = u.slow; }
 else if (u.k === 'laser') { laserT = u.t; lz = u; }
 else if (u.k === 'vac') { vacT = u.t; if (u.gold) for (let i = 0; i < u.gold; i++) createCoin(player.x + 120 + i * 28, getGroundY() - 60 - Math.sin(i * .5) * 50); hitBoss(u.bd); }
 else if (u.k === 'ghost') inv(u.inv);
}
function ultTick(d) {
 if (utxt && (utxt.life -= d) <= 0) utxt = null;
 if (autoT > 0) { autoT -= d; shootCooldown = 0; shoot(); }
 if (laserT > 0) { laserT -= d; inv(.3); clearAhead(player.x + player.width, width + 60); bossProjectiles.length = 0; hitBoss((lz.big ? .16 : .12) * d); }
 if (vacT > 0) { vacT -= d; inv(.3); for (const c of coins) { c.x += (player.x + 21 - c.x) * Math.min(1, d * 9); c.y += (player.y + 30 - c.y) * Math.min(1, d * 9); } clearAhead(player.x - 30, player.x + 300); }
}
addEventListener('keydown', e => { if (e.key.toLowerCase() === 'q') fireUlt(); });
if ('ontouchstart' in window) {
 const ub = document.createElement('button'); ub.textContent = '⚡';
 Object.assign(ub.style, { position: 'fixed', right: '16px', bottom: '226px', width: '64px', height: '64px', fontSize: '28px', borderRadius: '50%', border: '2px solid #ff00cc', background: 'rgba(8,5,28,.7)', color: '#fff', zIndex: 9000 });
 ub.addEventListener('pointerdown', e => { e.preventDefault(); fireUlt(); });
 document.body.appendChild(ub);
}

/* ---------- Boss-Loot ---------- */
let B = { shield: 0, dmg: 1, coin: 1 }, lootOpen = false, coinFrac = 0;
const POOL = [
 ['🛡️', 'Schild hält 5 Sekunden länger', () => B.shield += 5],
 ['🔫', 'Waffenschaden +20 %', () => B.dmg *= 1.2],
 ['🪙', 'Münzen +25 %', () => B.coin += .25],
 ['❤️', '+40 Leben', () => { playerHealth = Math.min(MAX_PLAYER_HEALTH, playerHealth + 40); }],
 ['⚡', 'Ultimate sofort voll', () => { ult = 100; }]
];
function showLoot() {
 if (!gameRunning) return;
 gamePaused = true; lootOpen = true;
 const d = document.createElement('div');
 Object.assign(d.style, { position: 'fixed', inset: 0, zIndex: 10003, background: 'rgba(0,0,0,.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px', color: '#fff', font: 'bold 18px Arial' });
 d.innerHTML = '<div style="font-size:34px;color:#ffe600;text-shadow:0 0 20px #ffe600">BOSS BESIEGT!</div><div>Wähle 1 von 3 Belohnungen</div>';
 [...POOL].sort(() => R() - .5).slice(0, 3).forEach(([ic, t, fn]) => {
  const b = document.createElement('button'); b.textContent = ic + '  ' + t;
  Object.assign(b.style, { width: 'min(380px,88vw)', padding: '14px', border: '2px solid #00ffff', borderRadius: '10px', background: '#061b25', color: '#00ffff', font: 'bold 17px Arial', cursor: 'pointer' });
  b.onclick = () => { fn(); window.nrShieldBonus = B.shield; d.remove(); lootOpen = false; resumeGame(); };
  d.appendChild(b);
 });
 document.body.appendChild(d);
}
document.addEventListener('keydown', e => { if (lootOpen) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);
const _shoot3 = shoot;
shoot = function () { const n = playerProjectiles.length; _shoot3(); if (playerProjectiles.length > n) playerProjectiles[n].damage *= B.dmg; };

/* ---------- Tägliche Missionen ---------- */
const MS = [
 { t: 'Sammle 300 Münzen', k: 'coins', g: 300, r: 60 },
 { t: 'Laufe 2500 m', k: 'dist', g: 2500, r: 80 },
 { t: 'Besiege 2 Bosse', k: 'boss', g: 2, r: 150 }
];
const today = () => new Date().toISOString().slice(0, 10);
const fresh = () => ({ d: today(), coins: 0, dist: 0, boss: 0, done: [] });
let MD = safe(() => JSON.parse(localStorage.getItem('nrMissions'))) || fresh();
if (MD.d !== today()) MD = fresh();
const saveM = () => localStorage.setItem('nrMissions', JSON.stringify(MD));
const mp = document.createElement('div');
Object.assign(mp.style, { marginTop: '14px', fontSize: '13px', lineHeight: '1.7', color: '#9ff', textAlign: 'left' });
if (homeScreen) homeScreen.appendChild(mp);
const renderM = () => {
 if (MD.d !== today()) { MD = fresh(); saveM(); }
 mp.innerHTML = '<b style="color:#ffe600">TÄGLICHE MISSIONEN</b><br>' + MS.map((m, i) => (MD.done.includes(i) ? '✅ ' : '⬜ ') + m.t + ' (' + Math.min(Math.floor(MD[m.k]), m.g) + '/' + m.g + ') · +' + m.r + ' 🪙').join('<br>');
};
setInterval(() => { renderM(); saveM(); }, 1000); renderM();

/* Boss besiegt: Mission zählen + Loot anzeigen */
const _db = defeatBoss;
defeatBoss = function () { _db(); MD.boss++; ult = Math.min(100, ult + 25); showLoot(); };

/* ---------- Update pro Frame ---------- */
let lastDist = 0, lastCC = 0, lastD = 0;
const _uc3 = updateCoins;
updateCoins = function (d) {
 const t0 = totalCoins; _uc3(d);
 if (distance < lastDist) { ult = 0; slowT = 0; dashCd = 0; vacT = laserT = autoT = 0; slowF = .5; B = { shield: 0, dmg: 1, coin: 1 }; window.nrShieldBonus = 0; lastD = 0; lastCC = 0; } lastDist = distance;
 const gain = totalCoins - t0;
 if (gain > 0 && B.coin > 1) { coinFrac += gain * (B.coin - 1); const e = Math.floor(coinFrac); if (e > 0) { coinFrac -= e; totalCoins += e; coinsCollected += e; localStorage.setItem('neonRunnerCoins', totalCoins); } }
 dashCd -= d; slowT -= d; fl -= d; ultTick(d); ult = Math.min(100, ult + d * 1.2);
 if (player.dashTimer > 0) score += d * 20;
 if (coinsCollected > lastCC) MD.coins += coinsCollected - lastCC; lastCC = coinsCollected;
 const dd = distance - lastD; if (dd > 0 && dd < 50) MD.dist += dd; lastD = distance;
 MS.forEach((m, i) => {
  if (!MD.done.includes(i) && MD[m.k] >= m.g) { MD.done.push(i); totalCoins += m.r; localStorage.setItem('neonRunnerCoins', totalCoins); updateCoinDisplays(); saveM(); alert('✅ Mission geschafft: ' + m.t + '  +' + m.r + ' 🪙'); }
 });
};

/* ---------- HUD: Ultimate-Leiste + Dash-Anzeige ---------- */
const _draw3 = draw;
draw = function () {
 _draw3(); ctx.save();
 const T = performance.now() / 1000, w = 220, x = width / 2 - w / 2, y = height - 34, full = ult >= 100;
 ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(x, y, w, 14);
 const sk = getSelectedSkin(), nm = uid().n;
 ctx.shadowColor = full ? '#ffe600' : sk.glow; ctx.shadowBlur = full ? 14 + Math.sin(T * 8) * 8 : 6;
 ctx.fillStyle = full ? '#ffe600' : sk.glow; ctx.fillRect(x, y, w * ult / 100, 14);
 ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.strokeRect(x, y, w, 14);
 ctx.shadowBlur = 0; ctx.fillStyle = '#fff'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center';
 ctx.fillText(full ? '⚡ Q – ' + nm + ' BEREIT!' : nm + ' ' + Math.floor(ult) + '%', width / 2, y - 6);
 ctx.textAlign = 'left'; ctx.fillStyle = dashCd > 0 ? '#888' : '#00ffff';
 ctx.fillText('💨 ' + (dashCd > 0 ? dashCd.toFixed(1) + 's' : 'DASH BEREIT'), x + w + 14, y + 11);
 if (laserT > 0) {
  const big = lz.big, y0 = player.y + player.height * .42 - (big ? 27 : 17), h = big ? 54 : 34, g = ctx.createLinearGradient(0, y0, 0, y0 + h);
  g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, '#fff'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.shadowColor = lz.c; ctx.shadowBlur = 30; ctx.fillStyle = lz.c; ctx.globalAlpha = .55 + Math.sin(T * 50) * .15;
  ctx.fillRect(player.x + player.width, y0, width, h); ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(player.x + player.width, y0, width, h); ctx.shadowBlur = 0;
 }
 if (vacT > 0) { ctx.strokeStyle = sk.glow; ctx.lineWidth = 3; ctx.globalAlpha = .5; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(player.x + 22, player.y + 30, 200 - (T * 200 + k * 70) % 200, 0, 7); ctx.stroke(); } ctx.globalAlpha = 1; }
 if (utxt) { ctx.globalAlpha = Math.min(1, utxt.life); ctx.textAlign = 'center'; ctx.font = 'bold 44px Arial'; ctx.fillStyle = '#fff'; ctx.shadowColor = sk.glow; ctx.shadowBlur = 24; ctx.fillText(utxt.t, width / 2, height * .4); ctx.globalAlpha = 1; ctx.shadowBlur = 0; }
 if (fl > 0) { ctx.fillStyle = `rgba(255,255,255,${Math.min(1, fl) * .7})`; ctx.fillRect(0, 0, width, height); }
 ctx.restore();
};
const _rs3 = renderShop;
renderShop = function () {
 _rs3();
 [...skinGrid.children].forEach((c, i) => {
  const s = skins[i], u = s && UL[s.id]; if (!u) return;
  c.querySelector('h3').insertAdjacentHTML('afterend', `<div style="font-size:11px;color:#ffe600;margin:3px 0">⚡ ${u.n}</div>`);
 });
};
renderShop();
})();