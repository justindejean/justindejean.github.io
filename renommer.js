/* =========================================================
   RENOMMER (clic droit ou F2) — icônes du bureau et dossiers/projets de l'explorateur.
   Les noms choisis sont gardés dans le navigateur (localStorage) et réappliqués à chaque visite.
   ========================================================= */
(function () {
  'use strict';
  const KEY = 'noms-perso', $ = id => document.getElementById(id);
  const lang = () => (window.lang && window.lang() === 'en') ? 'en' : 'fr';
  const T = { ren: ['Renommer', 'Rename'], rst: ["Rétablir le nom d'origine", 'Restore original name'] };
  const t = k => T[k][lang() === 'en' ? 1 : 0];
  let saved = {}; try { saved = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) {}
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {} };

  // cible renommable : { key, label, host }
  function targetOf(node) {
    const ic = node.closest && node.closest('.icon[id]'); if (ic && ic.querySelector(':scope > span')) return { key: 'i:' + ic.id, label: ic.querySelector(':scope > span'), host: ic };
    const f = node.closest && node.closest('.file[data-cat], .file[data-projet]');
    if (f) return { key: f.dataset.cat ? 'c:' + f.dataset.cat : 'p:' + f.dataset.projet, label: f.querySelector('.file-name'), host: f };
    return null;
  }
  const originOf = tg => { if (tg.label.dataset.orig === undefined) tg.label.dataset.orig = tg.label.textContent; return tg.label.dataset.orig; };

  /* ---- réapplique les noms enregistrés (icônes + grille de l'explorateur qui se redessine) ---- */
  function applyAll() {
    document.querySelectorAll('.icon[id], #projets-grid .file').forEach(h => {
      const tg = targetOf(h); if (!tg || !tg.label) return;
      const name = saved[tg.key]; if (name === undefined) return;
      originOf(tg); if (tg.label.textContent !== name) tg.label.textContent = name;
    });
  }
  applyAll();
  const grid = $('projets-grid');
  if (grid) new MutationObserver(() => { if (!grid._busy) applyAll(); }).observe(grid, { childList: true });
  document.addEventListener('langchange', () => setTimeout(applyAll, 0));

  /* ---- édition sur place ---- */
  function edit(tg) {
    const lab = tg.label; if (lab.querySelector('input')) return;
    const orig = originOf(tg), cur = lab.textContent, host = tg.host, wasDrag = host.getAttribute('draggable'), over = host.tagName === 'BUTTON';
    const inp = document.createElement('input'); inp.type = 'text'; inp.value = cur; inp.maxLength = 30; inp.spellcheck = false;
    inp.className = 'rn-input'; inp.setAttribute('aria-label', t('ren'));
    ['pointerdown', 'click', 'dblclick', 'keydown', 'keyup', 'contextmenu', 'mousedown'].forEach(n => inp.addEventListener(n, e => { if (n !== 'keydown' || e.key !== 'Escape') e.stopPropagation(); if (n === 'keydown') kd(e); }));
    let done = false;
    function finish(ok) {
      if (done) return; done = true;
      const v = inp.value.trim().replace(/\s+/g, ' ');
      if (grid) grid._busy = true;
      if (ok && v && v !== cur) { if (v === orig) delete saved[tg.key]; else saved[tg.key] = v; persist(); lab.textContent = v; }
      else if (!over) lab.textContent = cur;
      if (over) { inp.remove(); lab.style.visibility = ''; }
      if (grid) setTimeout(() => { grid._busy = false; }, 0);
      if (wasDrag !== null) host.setAttribute('draggable', wasDrag);
    }
    function kd(e) { if (e.key === 'Enter') { e.preventDefault(); finish(true); } else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); finish(false); } }
    inp.addEventListener('blur', () => finish(true));
    if (grid) grid._busy = true;
    if (over) {                                                       // dans un <button>, la barre d'espace déclencherait un clic : le champ flotte au-dessus du libellé
      const r = lab.getBoundingClientRect(), w = Math.max(r.width + 24, 120);
      inp.style.cssText = 'position:fixed;z-index:9600;width:' + w + 'px;left:' + Math.max(4, Math.min(innerWidth - w - 4, r.left + r.width / 2 - w / 2)) + 'px;top:' + (r.top - 1) + 'px';
      document.body.appendChild(inp); lab.style.visibility = 'hidden';
    } else { lab.textContent = ''; lab.appendChild(inp); }
    if (wasDrag !== null) host.setAttribute('draggable', 'false');
    inp.focus(); inp.select();
    if (grid) setTimeout(() => { grid._busy = false; }, 0);
  }

  /* ---- menu clic droit ---- */
  const menu = document.createElement('div'); menu.id = 'rn-menu'; menu.className = 'hidden'; menu.setAttribute('role', 'menu'); document.body.appendChild(menu);
  const hide = () => menu.classList.add('hidden');
  function show(tg, x, y) {
    menu.innerHTML = '';
    const add = (txt, fn, off) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = txt; b.disabled = !!off; b.setAttribute('role', 'menuitem'); b.onclick = () => { hide(); fn(); }; menu.appendChild(b); };
    add(t('ren'), () => setTimeout(() => edit(tg), 0));
    add(t('rst'), () => { const o = originOf(tg); delete saved[tg.key]; persist(); tg.label.textContent = o; }, saved[tg.key] === undefined);
    menu.classList.remove('hidden');
    menu.style.left = Math.min(x, innerWidth - 230) + 'px'; menu.style.top = Math.min(y, innerHeight - 90) + 'px';
  }
  // capture : passe avant le menu « bureau » (qui s'affiche sur tout le fond)
  document.addEventListener('contextmenu', e => {
    const tg = targetOf(e.target); if (!tg || !tg.label) return;
    e.preventDefault(); e.stopPropagation();
    const c = $('ctx-menu'); if (c) c.classList.add('hidden');
    show(tg, e.clientX, e.clientY);
  }, true);
  document.addEventListener('pointerdown', e => { if (!e.target.closest('#rn-menu')) hide(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') hide();
    if (e.key === 'F2' && !/INPUT|TEXTAREA/.test((document.activeElement || {}).tagName || '')) {
      const sel = document.querySelector('.icon.is-selected[id]') || (document.activeElement && document.activeElement.closest && document.activeElement.closest('.icon[id], .file'));
      const tg = sel && targetOf(sel); if (tg && tg.label) { e.preventDefault(); edit(tg); }
    }
  });

  /* ---- tactile : appui long = clic droit ---- */
  let lp = null, sx = 0, sy = 0;
  document.addEventListener('touchstart', e => {
    const tg = e.touches.length === 1 && targetOf(e.target); if (!tg || !tg.label || e.target.closest('.rn-input')) return;
    sx = e.touches[0].clientX; sy = e.touches[0].clientY;
    lp = setTimeout(() => { lp = null; tg.host._lp = Date.now(); show(tg, sx, sy); }, 600);
  }, { passive: true });
  const cancelLp = () => { clearTimeout(lp); lp = null; };
  document.addEventListener('touchmove', e => { const p = e.touches[0]; if (lp && Math.hypot(p.clientX - sx, p.clientY - sy) > 10) cancelLp(); }, { passive: true });
  document.addEventListener('touchend', cancelLp); document.addEventListener('touchcancel', cancelLp);
  document.addEventListener('click', e => { const tg = targetOf(e.target); if (tg && tg.host._lp && Date.now() - tg.host._lp < 900) { e.stopPropagation(); e.preventDefault(); } }, true);
})();
