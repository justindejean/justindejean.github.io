/* =========================================================
   MASCOTTE — accueille le visiteur, explique le site, s'adapte aux retours
   - 1re visite : fenêtre de bienvenue avec visite guidée (passable à tout moment)
   - visites suivantes : simple bulle discrète, qui disparaît seule (rien de forcé)
   Le nom se change dans config.js (SITE.mascotte).
   ========================================================= */
(function () {
  'use strict';
  const NAME = (typeof SITE !== 'undefined' && SITE.mascotte) || 'Mascotte';
  const t = s => (window.tr ? window.tr(s) : s);
  const $ = id => document.getElementById(id);
  const touch = window.matchMedia('(pointer: coarse)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Combien de fois le visiteur est-il venu ? ---------- */
  let visits = 1;
  try {
    const known = localStorage.getItem('mascotteVisites');
    const oldVisitor = localStorage.getItem('portfolioVu') === '1';        // venu avant l'arrivée de la mascotte
    visits = known ? parseInt(known, 10) || 1 : (oldVisitor ? 1 : 0);
    if (!sessionStorage.getItem('mascotteSession')) {                       // une visite = une session (pas un rechargement)
      visits += 1;
      localStorage.setItem('mascotteVisites', String(visits));
      sessionStorage.setItem('mascotteSession', '1');
    }
  } catch (e) { visits = 1; }
  const first = visits <= 1;

  /* ---------- Dernière application ouverte (pour proposer de reprendre) ---------- */
  const LABELS = {
    'window-projets': 'Projets', 'window-studio': 'la Galerie', 'window-cv': 'le CV',
    'window-musique': 'la Musique', 'window-contact': 'Contact', 'window-nav': 'Internet'
  };
  const last = () => { try { return localStorage.getItem('mascotteDerniere'); } catch (e) { return null; } };
  document.addEventListener('win:open', e => {
    if (LABELS[e.detail]) { try { localStorage.setItem('mascotteDerniere', e.detail); } catch (err) {} }
  });

  /* ---------- Nom de la mascotte partout dans la page ---------- */
  document.querySelectorAll('[data-mascotte-name]').forEach(n => { n.textContent = NAME; });
  function setTitles() {
    document.querySelectorAll('[data-masc-title]').forEach(n => { n.textContent = n.dataset.mascTitle === 'Messenger' ? 'Messenger — ' + NAME : NAME + ' — ' + n.dataset.mascTitle; });
  }
  setTitles();

  /* =========================================================
     1re VISITE : fenêtre de bienvenue + visite guidée
     ========================================================= */
  const winId = 'window-mascotte';
  const text = $('masc-text'), actions = $('masc-actions'), dots = $('masc-dots'), img = $('masc-img'), bubble = $('masc-bubble');
  if (!text) return;
  let step = 0, typer = null;

  const go = id => () => { window.openWindow(id); };
  const STEPS = [
    { text: () => t('Salut ! 👋 Moi c\'est') + ' ' + NAME + t(', la mascotte du portfolio de Justin Dejean. Je te fais visiter en 30 secondes ?'),
      buttons: () => [{ label: t('Oui, je t\'écoute'), main: true, fn: next }, { label: t('Non merci, je me débrouille'), fn: close }] },
    { text: () => t('Ici, tout est un vrai petit bureau Windows. Les icônes sur le côté ouvrent ses travaux : ') + (touch ? t('appuie dessus.') : t('double-clique dessus.')) },
    { text: () => t('En bas à gauche, le bouton « démarrer » ouvre un menu avec tout : projets, galerie, CV et contact.') },
    { text: () => t('Le dossier Projets réunit ses créations : avatars, chartes graphiques et le projet Robot collectif.'),
      buttons: () => [{ label: t('Ouvrir Projets'), main: true, fn: () => { go('window-projets')(); } }, { label: t('Suivant ▸'), fn: next }] },
    { text: () => t('Tu peux aussi te balader dans la galerie en 2D, comme dans un petit musée.'),
      buttons: () => [{ label: t('Visiter la galerie'), main: true, fn: () => { go('window-studio')(); } }, { label: t('Suivant ▸'), fn: next }] },
    { text: () => t('Une question ? Écris-moi dans Messenger, je te réponds. Et pour un stage, Justin est là : ') + ((window.lang && window.lang() === 'en' ? SITE.dispo_en : SITE.dispo) || t('Disponible bientôt !')),
      buttons: () => [
        { label: t('Discuter avec') + ' ' + NAME, main: true, fn: () => { close(); window.openWindow('window-msn'); } },
        { label: t('Contacter Justin'), fn: () => { close(); window.openWindow('window-contact'); } },
        { label: t('Terminer'), fn: close }
      ] }
  ];

  function renderDots() {
    dots.innerHTML = STEPS.map((_, i) => '<i' + (i === step ? ' class="on"' : '') + '></i>').join('');
  }
  function type(full, done) {
    clearInterval(typer);
    text.textContent = '';
    img.classList.add('talking');
    if (reduceMotion) { text.textContent = full; img.classList.remove('talking'); done(); return; }
    let i = 0;
    const finish = () => { clearInterval(typer); text.textContent = full; img.classList.remove('talking'); bubble.onclick = null; done(); };
    bubble.onclick = finish;                                // un clic sur la bulle affiche tout de suite
    typer = setInterval(() => { text.textContent = full.slice(0, ++i); if (i >= full.length) finish(); }, 16);
  }
  function show(i) {
    step = Math.max(0, Math.min(STEPS.length - 1, i));
    const s = STEPS[step];
    actions.innerHTML = '';
    renderDots();
    type(s.text(), () => {
      const btns = s.buttons ? s.buttons() : [{ label: t('Suivant ▸'), main: true, fn: next }, { label: t('Passer la visite'), fn: close }];
      btns.forEach(b => {
        const el = document.createElement('button');
        el.type = 'button'; el.textContent = b.label;
        if (b.main) el.classList.add('main');
        el.addEventListener('click', b.fn);
        actions.appendChild(el);
      });
    });
  }
  function next() { show(step + 1); }
  function close() { clearInterval(typer); window.closeWindow && window.closeWindow(winId); }

  function tour() {                                         // ouvre la visite (aussi depuis Messenger)
    if (window.Guide) { window.Guide.visit(); return; }
    setTitles();
    window.openWindow(winId);
    show(0);
  }

  /* =========================================================
     VISITES SUIVANTES : bulle discrète, jamais bloquante
     ========================================================= */
  const toast = $('masc-toast'), toastText = $('masc-toast-text'), toastActions = $('masc-toast-actions');
  let toastTimer = null;
  function hideToast() { clearTimeout(toastTimer); toast.classList.add('hidden'); }
  function showToast(msg, buttons, ms) {
    toastText.textContent = msg;
    toastActions.innerHTML = '';
    (buttons || []).forEach(b => {
      const el = document.createElement('button');
      el.type = 'button'; el.textContent = b.label;
      el.addEventListener('click', () => { hideToast(); b.fn(); });
      toastActions.appendChild(el);
    });
    toast.classList.remove('hidden');
    toastTimer = setTimeout(hideToast, ms);
  }
  $('masc-toast-close').addEventListener('click', hideToast);
  toast.addEventListener('pointerenter', () => clearTimeout(toastTimer));   // si on le lit/survole, il reste

  function welcomeBack() {
    if (window.Guide) return;                              // le guide gère l'accueil des retours
    const anyOpen = Array.from(document.querySelectorAll('.window')).some(w => !w.classList.contains('hidden'));
    if (anyOpen) return;                                    // il fait déjà quelque chose : on ne le dérange pas
    const lastId = last();
    if (visits === 2) {
      const b = [];
      if (lastId && LABELS[lastId]) b.push({ label: t('Reprendre : ') + t(LABELS[lastId]), fn: () => window.openWindow(lastId) });
      else b.push({ label: t('Discuter avec') + ' ' + NAME, fn: () => window.openWindow('window-msn') });
      showToast(t('Re-bonjour ! 👋 Content de te revoir.'), b, 9000);
    } else if (visits === 3) {
      showToast(t('Te revoilà ! Si tu cherches quelque chose, je suis dans Messenger.'),
        [{ label: t('Ouvrir Messenger'), fn: () => window.openWindow('window-msn') }], 7000);
    } else {
      showToast(t('Re-salut ! 😊'), [], 4000);
    }
  }

  /* ---------- Quand lancer ? Une fois le démarrage terminé ---------- */
  function afterBoot(fn) {
    if (!document.body.classList.contains('booting')) { fn(); return; }
    const mo = new MutationObserver(() => {
      if (!document.body.classList.contains('booting')) { mo.disconnect(); fn(); }
    });
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }
  const wantsChat = /[?&]chat=1\b/.test(location.search);
  afterBoot(() => {
    if (wantsChat) { setTimeout(() => window.openWindow('window-msn'), 500); return; }   // venu de la page 404
    if (first) {
      setTimeout(() => {
        if (window.hideInvite) window.hideInvite();         // la mascotte remplace la bulle « Bienvenue ! »
        if (!window.Guide) tour();                          // Guide gère l'intro (virus.js) ; visite en fenêtre = secours
      }, 700);
    } else {
      setTimeout(welcomeBack, 1200);
    }
  });

  window.Mascotte = { name: NAME, visits, first, tour, last };
})();
