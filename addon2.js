/* NEON RUNNER – ADDON 2 (nach addon.js einbinden)
   Poki-Anbindung, Sound + Musik, Doppelsprung, Schild, Combo, Mobile-Schussknopf,
   Hindernisse überlappen nie mehr. */
(() => {
const R = Math.random, rnd = (a, b) => a + R() * (b - a), m = (a, b) => ((a % b) + b) % b;
const PK = () => window.PokiSDK;
const safe = f => { try { return f(); } catch (e) {} };

/* ---------- Hindernisse überlappen nie: Mindestabstand, der zur Geschwindigkeit passt ---------- */
const _co = createObstacle;
createObstacle = function (type = null, x = null) {
 let nx = x !== null ? x : width + 80;
 const gap = 150 + gameSpeed * 14;
 for (let n = 0; n < 8; n++) {
  const hit = obstacles.find(o => nx < o.x + o.width + gap && nx + 70 > o.x - gap);
  if (!hit) break;
  nx = hit.x + hit.width + gap;
 }
 _co(type, nx);
};

/* ---------- Sound (WebAudio, keine Dateien nötig) ---------- */
let AC = null, muted = localStorage.getItem('nrMute') === '1', adMute = false, lastCoin = 0;
const ac = () => { if (!AC) safe(() => { AC = new (window.AudioContext || window.webkitAudioContext)(); }); if (AC && AC.state === 'suspended') AC.resume(); return AC; };
function beep(f, d = .12, type = 'square', v = .06, to = f) {
 if (muted || adMute) return; const a = ac(); if (!a) return;
 const o = a.createOscillator(), g = a.createGain(), t = a.currentTime;
 o.type = type; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(Math.max(30, to), t + d);
 g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
 o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + d);
}
const bass = [55, 55, 82, 55, 65, 65, 98, 65], arp = [220, 277, 330, 277, 247, 311, 370, 311];
let st = 0;
setInterval(() => {
 if (!gameRunning || gamePaused) return;
 const k = st++ % 8, w = 1 + (Math.floor(distance / 800) % 4) * .06;
 beep(bass[k] * w, .2, 'sawtooth', .035);
 if (k % 2) beep(arp[k] * w, .1, 'triangle', .03);
}, 220);

const mb = document.createElement('button');
mb.textContent = muted ? '🔇' : '🔊';
Object.assign(mb.style, { position: 'fixed', top: '12px', right: '12px', zIndex: 10001, width: '44px', height: '44px', fontSize: '20px', borderRadius: '10px', border: '2px solid #00ffff', background: 'rgba(8,5,28,.8)', color: '#fff', cursor: 'pointer' });
mb.onclick = () => { muted = !muted; localStorage.setItem('nrMute', muted ? '1' : '0'); mb.textContent = muted ? '🔇' : '🔊'; mb.blur(); };
document.body.appendChild(mb);
addEventListener('keydown', e => { if (e.key.toLowerCase() === 'm') mb.click(); });

/* Kleine Hinweis-Box statt alert() (Poki erlaubt kein alert) */
window.alert = msg => {
 const d = document.createElement('div'); d.textContent = msg;
 Object.assign(d.style, { position: 'fixed', left: '50%', bottom: '80px', transform: 'translateX(-50%)', background: 'rgba(8,5,28,.95)', border: '2px solid #ff00cc', color: '#fff', padding: '12px 20px', borderRadius: '10px', font: 'bold 16px Arial', zIndex: 10002 });
 document.body.appendChild(d); setTimeout(() => d.remove(), 1800);
};

/* ---------- Combo + Sounds über die Partikel-Ereignisse ---------- */
let combo = 0, comboT = 0;
const _cpa = createParticles;
createParticles = function (x, y, c, n = 12) {
 _cpa(x, y, c, n);
 if (n === 15 && c === '#ffe600') {
  combo++; comboT = 1.6; if (combo >= 5) score += combo;
  const t = performance.now(); if (t - lastCoin > 40) { lastCoin = t; beep(900 + Math.min(combo, 15) * 40, .09, 'square', .05, 1500 + combo * 40); }
 } else if (n === 16) beep(520, .3, 'triangle', .08, 1300);
 else if (n === 40) beep(90, .4, 'sawtooth', .1, 30);
};

/* ---------- Doppelsprung ---------- */
let dj = false;
const _jump = jump;
jump = function () {
 if (!gameRunning || gamePaused) return;
 if (player.grounded) { _jump(); beep(380, .15, 'square', .07, 820); }
 else if (!dj) {
  dj = true; const s = getSelectedSkin();
  player.velocityY = player.jumpPower * .85 - s.jump * .5;
  createParticles(player.x + 20, player.y + 58, s.glow, 14); beep(600, .15, 'square', .07, 1100);
 }
};

/* ---------- Schuss-Sound, Schild, Treffer-Sound ---------- */
const _sh = shoot;
shoot = function () {
 const n = playerProjectiles.length; _sh();
 if (playerProjectiles.length > n) { const k = playerProjectiles[n].kind; beep(k === 'laser' ? 1400 : k === 'plasma' ? 200 : 700, .08, k === 'plasma' ? 'sawtooth' : 'square', .05, k === 'laser' ? 600 : 100); }
};
let shieldT = 0, sp = [], spT = 12, lastDist = 0;
const _dmg2 = damagePlayer;
damagePlayer = function (a) {
 if (!gameRunning || playerDamageCooldown > 0) return;
 if (shieldT > 0) { shieldT = 0; playerDamageCooldown = .6; _cpa(player.x + 20, player.y + 30, '#66ccff', 22); beep(900, .2, 'triangle', .08, 200); return; }
 const hp0 = playerHealth; _dmg2(a);
 if (playerHealth < hp0) beep(140, .25, 'sawtooth', .1, 40);
};

/* ---------- Mobile: Schuss-Knopf ---------- */
if ('ontouchstart' in window) {
 const sb = document.createElement('button'); sb.textContent = '🔫';
 Object.assign(sb.style, { position: 'fixed', right: '16px', bottom: '150px', width: '64px', height: '64px', fontSize: '28px', borderRadius: '50%', border: '2px solid #ffe600', background: 'rgba(8,5,28,.7)', color: '#fff', zIndex: 9000, touchAction: 'none' });
 let iv = null; const stop = () => { clearInterval(iv); iv = null; };
 sb.addEventListener('pointerdown', e => { e.preventDefault(); shoot(); if (!iv) iv = setInterval(shoot, 80); });
 ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => sb.addEventListener(ev, stop));
 document.body.appendChild(sb);
}

/* ---------- Update pro Frame ---------- */
const _uc2 = updateCoins;
updateCoins = function (d) {
 _uc2(d);
 if (distance < lastDist) { shieldT = 0; sp = []; spT = 12; combo = 0; dj = false; } lastDist = distance;
 if (player.grounded) dj = false;
 shieldT -= d; comboT -= d; if (comboT <= 0) combo = 0;
 if (shieldT <= 0 && (spT -= d) <= 0) { spT = rnd(14, 22); sp.push({ x: width + 60, y: getGroundY() - rnd(50, 120), b: R() * 6 }); }
 for (let i = sp.length - 1; i >= 0; i--) {
  const o = sp[i]; o.x -= gameSpeed;
  const dx = player.x + 21 - o.x, dy = player.y + player.height / 2 - o.y;
  if (dx * dx + dy * dy < 1400) { shieldT = 10 + (window.nrShieldBonus || 0); _cpa(o.x, o.y, '#66ccff', 16); sp.splice(i, 1); }
  else if (o.x < -60) sp.splice(i, 1);
 }
};

/* ---------- Zeichnen: Speedlines, Schild, Combo ---------- */
const _draw2 = draw;
draw = function () {
 _draw2(); ctx.save();
 const T = performance.now() / 1000, cx = player.x + 22, cy = player.y + player.height / 2;
 if (gameSpeed > 7.5) {
  ctx.strokeStyle = 'rgba(255,255,255,.13)'; ctx.lineWidth = 1;
  for (let i = 0; i < 12; i++) { const x = m(i * 197 - T * 900 * (1 + i % 3 * .4), width), y = (i * 61) % getGroundY(); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 40 + i % 4 * 12, y); ctx.stroke(); }
 }
 ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
 for (const o of sp) {
  const y = o.y + Math.sin(o.b + T * 4) * 5;
  ctx.shadowColor = '#66ccff'; ctx.shadowBlur = 20; ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.strokeStyle = '#66ccff'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(o.x, y, 17, 0, 7); ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0; ctx.fillStyle = '#fff'; ctx.font = 'bold 17px Arial'; ctx.fillText('🛡️', o.x, y + 1);
 }
 if (shieldT > 0) {
  ctx.globalAlpha = (shieldT < 2 ? .3 + Math.sin(T * 20) * .3 : .5 + Math.sin(T * 4) * .2);
  ctx.shadowColor = '#66ccff'; ctx.shadowBlur = 20; ctx.fillStyle = 'rgba(102,204,255,.15)'; ctx.strokeStyle = '#66ccff'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(cx, cy, 42, 0, 7); ctx.fill(); ctx.stroke(); ctx.globalAlpha = 1;
 }
 ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic'; ctx.shadowColor = '#ffe600'; ctx.shadowBlur = 12; ctx.font = 'bold 15px Arial'; ctx.fillStyle = '#fff';
 if (shieldT > 0) ctx.fillText('🛡️ SCHILD ' + shieldT.toFixed(0) + 's', width - 20, 92);
 if (combo >= 3) { ctx.font = 'bold ' + Math.min(34, 20 + combo) + 'px Arial'; ctx.fillStyle = '#ffe600'; ctx.fillText('COMBO x' + combo, width - 20, 122); }
 ctx.restore();
};

/* ---------- Poki: Gameplay-Events, Werbepausen, Auto-Pause ---------- */
let gpOn = false, starting = false;
const gp = v => { if (v === gpOn) return; gpOn = v; safe(() => PK() && (v ? PK().gameplayStart() : PK().gameplayStop())); };
setInterval(() => gp(gameRunning && !gamePaused), 250);
const brk = () => {
 try { if (PK()) return PK().commercialBreak(() => { adMute = true; }).then(() => { adMute = false; }).catch(() => { adMute = false; }); } catch (e) {}
 return Promise.resolve();
};
const _sg = startGame;
startGame = function () { if (starting) return; starting = true; brk().then(() => { starting = false; _sg(); }); };
[playButton, restartButton, pauseRestartButton].forEach(b => b && b.addEventListener('click', e => { e.stopImmediatePropagation(); startGame(); }, true));
document.addEventListener('visibilitychange', () => { if (document.hidden && gameRunning && !gamePaused) pauseGame(); });
addEventListener('blur', () => { if (gameRunning && !gamePaused) pauseGame(); });
window.nrBeep = beep;
safe(() => PK() && PK().gameLoadingFinished());
})();