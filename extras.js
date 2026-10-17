/* =========================================================
   EXTRAS : menu clic droit de la barre des tâches (afficher le bureau, cascade, mosaïques, tout fermer)
   + économiseur d'écran étoilé avec ton nom et ta disponibilité (après 2 min d'inactivité).
   Expose window.Bureau2 = { arrange, showDesktop, closeAll, saver } (utilisé par le "mode recruteur" de l'assistant).
   ========================================================= */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const L = (fr, en) => (window.lang && window.lang() === 'en') ? en : fr;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = () => innerWidth < 700;
  const bar = $('menu-bar'); if (!bar) return;
  const tfm = (f, t) => 'translate(' + (f.left + f.width / 2 - t.left - t.width / 2) + 'px,' + (f.top + f.height / 2 - t.top - t.height / 2) + 'px) scale(' + (f.width / t.width) + ',' + (f.height / t.height) + ')';
  const live = () => Array.from(document.querySelectorAll('.window')).filter(w => !w.classList.contains('hidden') && !w.classList.contains('is-minimized'))
    .sort((a, b) => (parseInt(a.style.zIndex) || 0) - (parseInt(b.style.zIndex) || 0));   // l'ordre d'empilement (z-index) n'est jamais modifié

  /* ---------- organiser les fenêtres ---------- */
  function arrange(kind) {
    if (small()) return;
    const ws = live().filter(w => !w.dataset.zoomed); if (!ws.length) return;
    const before = ws.map(w => w.getBoundingClientRect()), n = ws.length, H = innerHeight - bar.offsetHeight;
    ws.forEach((w, i) => {
      let x, y, wd, ht;
      if (kind === 'cascade') { x = 30 + i * 34; y = 20 + i * 34; wd = Math.min(w.offsetWidth, innerWidth - x - 10); ht = Math.min(w.offsetHeight, H - y - 10); }
      else if (kind === 'v') { wd = Math.floor(innerWidth / n); ht = H; x = i * wd; y = 0; }
      else { wd = innerWidth; ht = Math.floor(H / n); x = 0; y = i * ht; }
      Object.assign(w.style, { left: x + 'px', top: y + 'px', width: wd + 'px', height: ht + 'px' });
      if (!calm && w.animate) w.animate([{ transform: tfm(before[i], w.getBoundingClientRect()) }, { transform: 'none' }], { duration: 300, easing: 'cubic-bezier(.2,.8,.2,1)' });
    });
    document.dispatchEvent(new CustomEvent('ach', { detail: 'range' }));
  }
  const showDesktop = () => live().forEach(w => { const b = w.querySelector('.min-btn'); if (b) b.click(); });
  const closeAll = () => document.querySelectorAll('.window:not(.hidden) .close-btn').forEach(b => b.click());

  /* ---------- menu de la barre des tâches ---------- */
  const menu = document.createElement('div'); menu.id = 'tb-menu'; menu.className = 'hidden'; menu.setAttribute('role', 'menu'); document.body.appendChild(menu);
  bar.addEventListener('contextmenu', e => {
    e.preventDefault(); const has = live().length > 0;
    const items = [[L('Afficher le bureau', 'Show the desktop'), showDesktop, has], null];
    if (!small()) items.push([L('Cascade', 'Cascade windows'), () => arrange('cascade'), has], [L('Mosaïque horizontale', 'Tile horizontally'), () => arrange('h'), has], [L('Mosaïque verticale', 'Tile vertically'), () => arrange('v'), has], null);
    items.push([L('Fermer toutes les fenêtres', 'Close all windows'), closeAll, has]);
    menu.innerHTML = '';
    items.forEach(it => {
      if (!it) { menu.appendChild(document.createElement('hr')); return; }
      const b = document.createElement('button'); b.type = 'button'; b.textContent = it[0]; b.setAttribute('role', 'menuitem'); b.disabled = !it[2];
      b.onclick = () => { menu.className = 'hidden'; it[1](); }; menu.appendChild(b);
    });
    menu.className = ''; menu.style.left = Math.min(e.clientX, innerWidth - 220) + 'px'; menu.style.bottom = (innerHeight - bar.getBoundingClientRect().top + 2) + 'px';
  });
  document.addEventListener('pointerdown', e => { if (!e.target.closest('#tb-menu')) menu.className = 'hidden'; });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') menu.className = 'hidden'; });

  /* ---------- économiseur d'écran : champ d'étoiles + nom + disponibilité ---------- */
  const cv = document.createElement('canvas'); cv.id = 'ss'; cv.hidden = true; cv.setAttribute('aria-hidden', 'true'); document.body.appendChild(cv);
  let last = Date.now(), on = false, onAt = 0, raf = 0;
  function stop() { document.dispatchEvent(new CustomEvent('ach', { detail: 'saver' })); cancelAnimationFrame(raf); cv.hidden = true; on = false; last = Date.now(); }
  function start() {
    on = true; onAt = Date.now(); cv.hidden = false; cv.width = innerWidth; cv.height = innerHeight;
    const g = cv.getContext('2d'), S = typeof SITE !== 'undefined' ? SITE : {};
    const name = S.nom || 'Justin Dejean', dispo = (window.lang && window.lang() === 'en' ? S.dispo_en : S.dispo) || S.dispo || '';
    const stars = Array.from({ length: 220 }, () => ({ x: (Math.random() - .5) * 2, y: (Math.random() - .5) * 2, z: Math.random() }));
    let t = 0;
    const frame = () => {
      t += .016; g.globalAlpha = 1; g.fillStyle = 'rgba(0,0,18,.35)'; g.fillRect(0, 0, cv.width, cv.height);
      const cx = cv.width / 2, cy = cv.height / 2;
      stars.forEach(s => {
        s.z -= .006; if (s.z <= .01) { s.x = (Math.random() - .5) * 2; s.y = (Math.random() - .5) * 2; s.z = 1; }
        g.globalAlpha = Math.min(1, (1 - s.z) * 1.6); g.fillStyle = '#fff'; g.beginPath();
        g.arc(cx + s.x / s.z * cx * .5, cy + s.y / s.z * cy * .5, Math.min(3, .4 + (1 - s.z) * 2.6), 0, 6.3); g.fill();
      });
      g.globalAlpha = 1; g.textAlign = 'center'; g.fillStyle = '#fff'; g.font = 'bold ' + Math.max(24, Math.min(64, cv.width / 14)) + 'px Tahoma, sans-serif';
      g.fillText(name, cx, cy + Math.sin(t) * 10);
      g.font = Math.max(14, cv.width / 60) + 'px Tahoma, sans-serif'; g.fillStyle = '#9ed0ff'; if (dispo) g.fillText(dispo, cx, cy + 42 + Math.sin(t) * 10);
      g.fillStyle = '#7a8aa8'; g.font = '13px Tahoma, sans-serif'; g.fillText(L('Bouge la souris ou clique pour revenir', 'Move the mouse or click to return'), cx, cv.height - 36);
      raf = requestAnimationFrame(frame);
    };
    frame(); if (calm) cancelAnimationFrame(raf);
  }
  ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(t => addEventListener(t, () => { if (on && Date.now() - onAt > 500) stop(); else if (!on) last = Date.now(); }, { passive: true }));
  addEventListener('resize', () => { if (on) { cv.width = innerWidth; cv.height = innerHeight; } });
  setInterval(() => {
    const sd = $('shutdown-screen');
    if (on || Date.now() - last < 120000 || document.body.classList.contains('booting') || document.body.classList.contains('gd-tour') || (sd && !sd.classList.contains('hidden'))) return;
    if (Array.from(document.querySelectorAll('video,audio')).some(m => !m.paused)) return;   // pas pendant une vidéo ou la musique
    start();
  }, 4000);
  window.Bureau2 = { arrange, showDesktop, closeAll, saver: start };
})();
