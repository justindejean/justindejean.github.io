/* =========================================================
   BUREAU XP — barre des tâches, clic droit, extinction, easter eggs
   ========================================================= */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const session = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k) { try { sessionStorage.setItem(k, '1'); } catch (e) {} }
  };

  /* ---------- Boutons des fenêtres ouvertes dans la barre des tâches ---------- */
  const tasks = document.querySelector('.taskbar-windows');
  const btns = {};
  function titleOf(id) { const t = $(id).querySelector('.title-text'); return t ? t.textContent : id; }
  function refreshTasks() {
    Object.keys(btns).forEach(id => {
      const w = $(id);
      btns[id].classList.toggle('is-active', w.classList.contains('is-active') && !w.classList.contains('is-minimized'));
      btns[id].textContent = titleOf(id);
    });
  }
  document.addEventListener('win:open', e => {
    const id = e.detail;
    if (!btns[id]) {
      const b = document.createElement('button');
      b.className = 'taskbar-item';
      b.addEventListener('click', () => {
        const w = $(id);
        if (w.classList.contains('is-minimized')) { w.classList.remove('is-minimized'); window.focusWindow(w); }
        else if (w.classList.contains('is-active')) { w.classList.add('is-minimized'); w.classList.remove('is-active'); }
        else window.focusWindow(w);
        refreshTasks();
      });
      tasks.appendChild(b); btns[id] = b;
    }
    refreshTasks();
  });
  document.addEventListener('win:close', e => {
    if (btns[e.detail]) { btns[e.detail].remove(); delete btns[e.detail]; }
  });
  document.addEventListener('pointerdown', () => setTimeout(refreshTasks, 0));
  document.addEventListener('click', () => setTimeout(refreshTasks, 0));

  /* ---------- Menu Démarrer : se ferme quand on clique ailleurs ---------- */
  document.addEventListener('pointerdown', e => {
    const m = $('apple-menu');
    if (m && !m.classList.contains('hidden') && !e.target.closest('#apple-menu, .start-button')) {
      m.classList.add('hidden');
      const sb = document.querySelector('.start-button'); if (sb) sb.classList.remove('is-open');
    }
  });

  /* ---------- Photo / avatar ---------- */
  if (typeof SITE !== 'undefined') {
    document.querySelectorAll('[data-site-email]').forEach(el => { el.textContent = SITE.email; el.href = 'mailto:' + SITE.email; });
    if (SITE.cv) { const l = $('cv-pdf'); l.href = SITE.cv; l.style.display = ''; }
    if (SITE.photo) {
      document.querySelectorAll('.avatar').forEach(a => { a.innerHTML = '<img src="' + SITE.photo + '" alt="' + SITE.nom + '">'; });
    }
  }

  /* ---------- Clic droit sur le bureau ---------- */
  const ctx = $('ctx-menu');
  function hideCtx() { ctx.classList.add('hidden'); }
  $('desktop').addEventListener('contextmenu', e => {
    if (e.target.closest('.window')) return;
    e.preventDefault();
    ctx.classList.remove('hidden');
    ctx.style.left = Math.min(e.clientX, window.innerWidth - 190) + 'px';
    ctx.style.top = Math.min(e.clientY, window.innerHeight - 140) + 'px';
  });
  document.addEventListener('pointerdown', e => { if (!e.target.closest('#ctx-menu')) hideCtx(); });
  ctx.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    hideCtx();
    if (b.dataset.act === 'reload') location.reload();
    else if (b.dataset.window) window.openWindow(b.dataset.window);
  });

  /* ---------- Son : bouton + carillon au premier geste ---------- */
  const vol = $('vol-btn');
  function paintVol() { vol.textContent = window.Sons.muted ? '🔇' : '🔊'; }
  paintVol();
  vol.addEventListener('click', () => { window.Sons.setMuted(!window.Sons.muted); paintVol(); window.Sons.click(); });
  if (document.body.dataset.returning !== '1') {
    const once = () => {
      document.removeEventListener('pointerdown', once); document.removeEventListener('keydown', once);
      if (!document.body.classList.contains('booting')) window.Sons.startup();
    };
    document.addEventListener('pointerdown', once); document.addEventListener('keydown', once);
  }

  /* ---------- Extinction ---------- */
  const sd = $('shutdown-screen');
  window.showShutdown = function () {
    sd.className = 'stage1';
    sd.querySelector('.sd-text').textContent = 'Arrêt de Windows…';
    setTimeout(() => {
      sd.className = 'stage2';
      sd.querySelector('.sd-text').textContent = 'Il est maintenant possible d\'éteindre votre ordinateur.';
    }, 1700);
  };
  $('sd-restart').addEventListener('click', () => location.reload());

  /* ---------- Fausse erreur XP (une fois par session) ---------- */
  const err = $('xp-error');
  function showError() {
    if (session.get('erreurVue')) return;
    session.set('erreurVue');
    err.classList.remove('hidden');
    window.Sons.error();
  }
  $('err-yes').addEventListener('click', () => { err.classList.add('hidden'); window.openWindow('window-contact'); });
  $('err-no').addEventListener('click', () => {
    err.querySelector('.err-text').textContent = 'Cette option n\'est pas disponible. Veuillez réessayer avec « Oui ».';
    $('err-no').disabled = true;
  });
  setTimeout(showError, 95000);

  /* ---------- Assistant (clin d'œil) ---------- */
  const clip = $('clippy');
  function hideClippy() { clip.classList.add('hidden'); }
  function showClippy() {
    if (session.get('clippyVu')) return;
    session.set('clippyVu');
    if (window.hideInvite) window.hideInvite();
    clip.classList.remove('hidden');
  }
  clip.addEventListener('click', e => {
    const b = e.target.closest('[data-clippy]'); if (!b) return;
    hideClippy();
    if (b.dataset.clippy === 'contact') window.openWindow('window-contact');
    if (b.dataset.clippy === 'msn') window.openWindow('window-msn');
    if (b.dataset.clippy === 'videos' && window.openProjectFolder) window.openProjectFolder('video');
  });
  setTimeout(showClippy, 28000);

  /* ---------- Formulaire de contact ---------- */
  const form = $('contact-form');
  const status = $('contact-status');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const id = typeof SITE !== 'undefined' ? SITE.formspree : '';
    if (id) {
      status.textContent = 'Envoi…';
      try {
        const r = await fetch('https://formspree.io/f/' + id, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data)
        });
        if (!r.ok) throw new Error('http ' + r.status);
        status.textContent = 'Merci ! Ton message est bien parti, je te réponds vite.';
        form.reset();
        return;
      } catch (err) { status.textContent = 'Envoi impossible, ouverture de ton application mail…'; }
    }
    const to = typeof SITE !== 'undefined' ? SITE.email : '';
    const body = data.message + '\n\n— ' + data.nom + ' (' + data.email + ')';
    location.href = 'mailto:' + to + '?subject=' + encodeURIComponent('Contact depuis le portfolio') + '&body=' + encodeURIComponent(body);
    status.textContent = 'Ton application mail s\'ouvre avec le message prêt à envoyer.';
  });

  /* ---------- Thèmes ---------- */
  function applyTheme(name) {
    document.body.classList.remove('theme-desert', 'theme-nuit');
    if (name === 'desert' || name === 'nuit') document.body.classList.add('theme-' + name);
    try { localStorage.setItem('theme', name); } catch (e) {}
  }
  try { applyTheme(localStorage.getItem('theme') || 'colline'); } catch (e) {}
  ctx.addEventListener('click', e => {
    const b = e.target.closest('button[data-theme]');
    if (b) applyTheme(b.dataset.theme);
  });

  /* ---------- Badge de disponibilité ---------- */
  const dispo = $('dispo-badge');
  if (typeof SITE !== 'undefined' && SITE.dispo) {
    const d = $('dispo-text');
    d.textContent = SITE.dispo;
    if (SITE.dispo_en) d.dataset.en = SITE.dispo_en;
  } else dispo.classList.add('hidden');

  /* ---------- Musique : YouTube (titres complets + volume dans le lecteur) et/ou Spotify (extraits) ---------- */
  const yt = $('youtube-frame'), sp = $('spotify-frame'), tabs = $('music-tabs'), note = $('music-note'), spLink = $('spotify-link');
  const hasYT = typeof SITE !== 'undefined' && !!SITE.youtube;
  const hasSP = typeof SITE !== 'undefined' && !!SITE.spotify;
  function showTab(name) {
    tabs.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.tab === name));
    yt.classList.toggle('hidden', name !== 'youtube');
    sp.classList.toggle('hidden', name !== 'spotify');
    if (name === 'youtube' && !yt.getAttribute('src') && hasYT)
      yt.src = 'https://www.youtube-nocookie.com/embed/videoseries?list=' + encodeURIComponent(SITE.youtube);
    if (name === 'spotify' && !sp.getAttribute('src') && hasSP)
      sp.src = 'https://open.spotify.com/embed/playlist/' + SITE.spotify + '?utm_source=generator';
    note.textContent = name === 'youtube'
      ? 'Titres joués en entier · volume réglable dans le lecteur.'
      : 'Extraits de 30 s, sauf si tu es connecté à Spotify.';
    spLink.style.display = hasSP ? '' : 'none';
  }
  if (hasSP) spLink.href = 'https://open.spotify.com/playlist/' + SITE.spotify;
  tabs.addEventListener('click', e => { const t = e.target.closest('button'); if (t) showTab(t.dataset.tab); });
  if (!(hasYT && hasSP)) tabs.classList.add('hidden');          // un seul service configuré : pas d'onglets
  tabs.querySelector('[data-tab=youtube]').style.display = hasYT ? '' : 'none';
  tabs.querySelector('[data-tab=spotify]').style.display = hasSP ? '' : 'none';
  const musicStart = hasYT ? 'youtube' : 'spotify';
  showTab(musicStart);
  if (!hasYT) yt.classList.add('hidden');
  document.addEventListener('win:open', e => { if (e.detail === 'window-musique') showTab(tabs.querySelector('button.on') ? tabs.querySelector('button.on').dataset.tab : musicStart); });

  /* ---------- Langue ---------- */
  const langBtn = $('lang-btn');
  function paintLang() { langBtn.textContent = window.lang() === 'en' ? 'FR' : 'EN'; }
  langBtn.addEventListener('click', () => { window.setLang(window.lang() === 'en' ? 'fr' : 'en'); paintLang(); });
  paintLang();

  /* ---------- Statistiques (Plausible, sans cookies) ---------- */
  if (typeof SITE !== 'undefined' && SITE.plausible) {
    const s = document.createElement('script');
    s.defer = true; s.dataset.domain = SITE.plausible; s.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(s);
    window.plausible = window.plausible || function () { (window.plausible.q = window.plausible.q || []).push(arguments); };
    document.addEventListener('win:open', e => window.plausible('Fenêtre ouverte', { props: { fenetre: e.detail } }));
  }
})();
