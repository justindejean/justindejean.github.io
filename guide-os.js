/* =========================================================
   Assistant intégré au PC : icône de notification + menu, bulles XP, découvertes, perchoir sur les fenêtres,
   registre d'actions (Guide.actions) et compréhension simple du langage naturel (Ctrl+K). Dépend de guide.js.
   ========================================================= */
(function () {
  'use strict';
  const G = window.Guide; if (!G || !G._) return;
  const { bug, go, groundY, W, small, quip } = G._;
  const $ = id => document.getElementById(id);
  const L = (fr, en) => (window.lang && window.lang() === 'en') ? en : fr;
  const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  const lvl = () => G._.level();
  const store = (k, v) => { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} return null; };

  /* ---------- bulle de notification XP ---------- */
  let balT;
  function balloon(title, text) {
    const old = $('gd-balloon'); if (old) old.remove(); clearTimeout(balT);
    const b = el('div', '', '<b>' + title + '</b><i>×</i><p>' + text + '</p>'); b.id = 'gd-balloon'; b.setAttribute('role', 'status');
    b.onclick = () => b.remove(); document.body.appendChild(b); balT = setTimeout(() => b.remove(), 7000);
  }

  /* ---------- succès cachés : notifications XP + compteur (menu de l'icône) ---------- */
  const ACH = { saver: ['Rêveur éveillé', 'Daydreamer'], range: ['Bureau bien rangé', 'Tidy desktop'], recruteur: ['Mode recruteur', 'Recruiter mode'], tickle: ['Chatouilleur', 'Tickler'],
    konami: ['Code secret', 'Secret code'], night: ['Oiseau de nuit', 'Night owl'], power: ['Utilisateur avancé', 'Power user'], tout: ['Bureau exploré en entier', 'Whole desktop explored'] };
  const TOTAL = Object.keys(ACH).length;
  function ach(id) {
    const a = ACH[id], list = store('guideAch') || []; if (!a || list.indexOf(id) >= 0) return;
    list.push(id); store('guideAch', list);
    balloon('🏆 ' + L('Succès débloqué ', 'Achievement unlocked ') + list.length + '/' + TOTAL, L('Vous avez découvert : ', 'You discovered: ') + L(a[0], a[1]));
  }
  G.achieve = ach; document.addEventListener('ach', e => ach(e.detail));
  let tk = 0; bug.addEventListener('click', e => { if (!e.target.closest('#guide-bubble') && ++tk === 10) ach('tickle'); });
  const KON = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a']; let ki = 0;
  addEventListener('keydown', e => {
    const k = (e.key || '').toLowerCase(); ki = k === KON[ki] ? ki + 1 : (k === KON[0] ? 1 : 0);
    if (ki === KON.length) { ki = 0; ach('konami'); G._.pose('cheer', 2500); }
    if ((e.ctrlKey || e.metaKey) && k === 'k') ach('power');
  });
  if (new Date().getHours() < 5) setTimeout(() => ach('night'), 8000);

  /* ---------- fenêtre fermée en moins de 4 s : une seule remarque par session ---------- */
  const openedAt = {}; let hasty = false;
  document.addEventListener('win:open', e => { openedAt[e.detail] = Date.now(); });
  document.addEventListener('win:close', e => {
    if (hasty || lvl() < 2 || G._.busy() || !TARGET[e.detail] || Date.now() - (openedAt[e.detail] || 0) > 4000) return;
    hasty = true; quip(L('Déjà fermée ? Il y avait de belles choses dedans, rouvre-la quand tu veux.', 'Closed already? There was good stuff inside, reopen it anytime.'));
  });
  document.addEventListener('click', e => { if (e.target.closest('[data-tour]')) G.visit(); });     // « Revoir la visite » (menu Démarrer)

  /* ---------- découvertes ---------- */
  const TARGET = { 'window-projets': ['Projets', 'Projects'], 'window-cv': ['CV', 'Resume'], 'window-studio': ['Galerie', 'Gallery'], 'window-contact': ['Contact', 'Contact'], 'window-musique': ['Musique', 'Music'] };
  const IDS = Object.keys(TARGET), count = () => (store('guideVu') || []).filter(i => IDS.indexOf(i) >= 0).length;
  document.addEventListener('win:open', e => {
    const id = e.detail; if (!TARGET[id]) return;
    const told = store('guideTold') || []; if (told.indexOf(id) >= 0) return; told.push(id); store('guideTold', told);
    if (lvl() < 1) return;
    const n = count(), done = n >= IDS.length;
    setTimeout(() => {
      if (G._.busy()) return;                                        // pas de bulle pendant le tuto
      balloon(done ? L('Bureau complet !', 'Desktop complete!') : L('Découverte ', 'Discovery ') + n + '/' + IDS.length, done ? L("Tu as tout exploré. Merci d'avoir pris le temps !", 'You explored everything. Thanks for taking the time!') : L(TARGET[id][0], TARGET[id][1]));
      if (done) { G._.pose('cheer', 1800); quip(L('Bravo, tu as tout vu ! 🎉', 'Well done, you saw it all! 🎉')); ach('tout'); }
    }, 900);
  });

  /* ---------- icône de notification + menu (clic ou clic droit) ---------- */
  const tray = el('button', '', '<img src="assets/mascotte.svg" alt="" width="16" height="16">'); tray.id = 'gd-tray'; tray.setAttribute('aria-label', G.name); tray.setAttribute('aria-haspopup', 'menu');
  const anchor = $('lang-btn'); if (anchor) anchor.parentNode.insertBefore(tray, anchor);
  const menu = el('div'); menu.id = 'gd-menu'; menu.hidden = true; menu.setAttribute('role', 'menu'); document.body.appendChild(menu);
  function renderMenu() {
    const hid = bug.style.display === 'none', m = G._.muted();
    const items = [
      [L('Visite guidée', 'Guided tour'), () => G.visit()],
      [L('Exécuter... (Ctrl+K)', 'Run... (Ctrl+K)'), () => G.run()],
      [L('Mode recruteur (CV + projets + contact)', 'Recruiter mode (resume + projects + contact)'), () => A.recruteur()],
      [L('Succès : ', 'Achievements: ') + (store('guideAch') || []).length + '/' + TOTAL, null],
      [L('Découvertes : ', 'Discoveries: ') + count() + '/' + IDS.length, null],
      [m ? L('Réactiver les conseils', 'Turn tips back on') : L('Moins de conseils', 'Fewer tips'), () => G._.setMute(!m)],
      [(hid ? L('Afficher ', 'Show ') : L('Masquer ', 'Hide ')) + G.name, () => { bug.style.display = hid ? 'block' : 'none'; }],
      [L('Changer de langue (EN)', 'Switch language (FR)'), () => $('lang-btn').click()]
    ];
    menu.innerHTML = '';
    items.forEach(([t, f]) => { const b = el('button', f ? '' : 'off', t); b.type = 'button'; b.setAttribute('role', 'menuitem'); if (f) b.onclick = () => { menu.hidden = true; f(); }; menu.appendChild(b); });
  }
  const toggle = e => {
    e.preventDefault(); e.stopPropagation();
    if (!menu.hidden) { menu.hidden = true; return; }
    renderMenu(); menu.hidden = false; const r = tray.getBoundingClientRect();
    menu.style.right = Math.max(4, innerWidth - r.right) + 'px'; menu.style.bottom = (innerHeight - r.top + 2) + 'px'; menu.querySelector('button:not(.off)').focus();
  };
  tray.addEventListener('click', toggle); tray.addEventListener('contextmenu', toggle);
  document.addEventListener('pointerdown', e => { if (!menu.hidden && !e.target.closest('#gd-menu,#gd-tray')) menu.hidden = true; });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') menu.hidden = true; });

  /* ---------- perchoir : il s'assoit sur la barre de titre de la fenêtre et la suit ---------- */
  let perch = null;
  const H = () => W() * 1.083;
  function unperch(fall) { if (!perch) return; perch = null; G.perched = false; bug.classList.remove('sit'); if (fall) go(G._.pos().x, groundY(), true); }
  document.addEventListener('win:open', e => {
    if (lvl() < 2 || small()) return; const id = e.detail; unperch(false);
    setTimeout(() => {
      const w = $(id); if (!w || w.classList.contains('hidden') || w.classList.contains('is-minimized') || w.dataset.zoomed || G._.busy() || bug.style.display === 'none') return;
      const x = w.offsetLeft + w.offsetWidth - W() - 70, y = w.offsetTop - H() + 12; if (y < 0) return;
      perch = { id, ox: x - w.offsetLeft, oy: y - w.offsetTop }; G.perched = true; go(x, y, true); setTimeout(() => { if (perch) bug.classList.add('sit'); }, 850);
    }, 1400);
  });
  document.addEventListener('win:move', e => {
    if (!perch || perch.id !== e.detail.id) return;
    const w = $(perch.id); if (w.dataset.zoomed) { unperch(true); return; }
    const x = e.detail.rect.left + perch.ox, y = e.detail.rect.top + perch.oy;     // écriture directe : le plus court chemin possible
    bug.style.transition = 'none'; bug.style.left = x + 'px'; bug.style.top = y + 'px'; G._.setPos(x, y);
  });
  ['win:close', 'win:min'].forEach(n => document.addEventListener(n, e => {
    if (perch && perch.id === e.detail) { unperch(true); if (lvl() >= 3 && Math.random() < .5) quip(L('Oups, je tombe !', "Whoa, I'm falling!")); }
  }));
  bug.addEventListener('pointerdown', () => unperch(false));

  /* ---------- il passe la tête derrière une fenêtre, dit coucou, puis repart ---------- */
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  setInterval(async () => {
    if (lvl() < 2 || small() || G._.busy() || perch || G.perched || bug.style.display === 'none' || Math.random() > .4) return;
    const w = Array.from(document.querySelectorAll('.window')).filter(x => !x.classList.contains('hidden') && !x.classList.contains('is-minimized') && !x.dataset.zoomed && parseInt(x.style.zIndex))
      .sort((a, b) => b.style.zIndex - a.style.zIndex)[0];
    if (!w) return;
    const hw = W() * .5, right = w.offsetLeft + w.offsetWidth + hw < innerWidth;
    if (!right && w.offsetLeft < hw) return;
    G.perched = true; bug.style.zIndex = parseInt(w.style.zIndex) - 1;                 // derrière la fenêtre
    go(right ? w.offsetLeft + w.offsetWidth - hw : w.offsetLeft - W() + hw, Math.min(groundY(), w.offsetTop + 50), true);
    await sleep(1900); if (!G.perched) { bug.style.zIndex = ''; return; }
    G._.pose('wave', 1500); await sleep(2800);
    bug.style.zIndex = ''; if (G.perched) { G.perched = false; go(innerWidth - W() - 14, groundY(), true); }
  }, 35000);

  /* ---------- actions réelles + langage naturel ---------- */
  const dispoTxt = () => (typeof SITE !== 'undefined' && (L(SITE.dispo, SITE.dispo_en) || SITE.dispo)) || '';
  const A = G.actions = {
    open: id => window.openWindow(id),
    project: n => window.openProjectFolder ? window.openProjectFolder(n) : window.openWindow('window-projets'),
    cv: () => window.openWindow('window-cv'),
    contact: txt => {
      window.openWindow('window-contact');
      if (txt) setTimeout(() => { const f = document.querySelector('#window-contact textarea'); if (f && !f.value) { f.value = txt; f.dispatchEvent(new Event('input', { bubbles: true })); } }, 300);
    },
    lang: () => $('lang-btn').click(),
    tour: () => G.visit(),
    mute: v => G._.setMute(v !== false),
    dispo: () => quip(dispoTxt()),
    recruteur: () => {                                         // ouvre CV, projets et contact, puis les range en cascade
      ['window-cv', 'window-projets', 'window-contact'].forEach((id, i) => setTimeout(() => window.openWindow(id), i * 250));
      setTimeout(() => window.Bureau2 && window.Bureau2.arrange('cascade'), 1200);
      ach('recruteur');
      quip(L('Mode recruteur : CV, projets et contact, tout est ouvert.', 'Recruiter mode: resume, projects and contact are all open.'));
    }
  };
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const RULES = [
    [/recruteur|recruiter|\brh\b|\bhr\b/, () => A.recruteur()],
    [/stage|recrut|embauch|hire|intern|job|alternance/, () => A.contact(L('Bonjour Justin, je vous écris au sujet d\'un stage : ', 'Hello Justin, I am writing about an internship: '))],
    [/contact|ecrire|mail|write|message/, () => A.contact()],
    [/\bcv\b|resume|curriculum|parcours|formation/, A.cv],
    [/robot/, () => A.project('robot')],
    [/projet|project|portfolio|travaux|realisation|web|video|graphi|avatar/, () => A.open('window-projets')],
    [/galerie|gallery|tableau|expo/, () => A.open('window-studio')],
    [/music|playlist|ecouter|listen/, () => A.open('window-musique')],
    [/mine|jeu|game/, () => A.open('window-demineur')],
    [/dispo|quand|available|when/, A.dispo],
    [/langue|english|anglais|francais|french|language/, A.lang],
    [/visite|aide|help|tour|guide|perdu/, A.tour],
    [/chut|silence|tais|quiet/, () => A.mute(true)]
  ];
  G.intent = text => {
    const r = RULES.find(x => x[0].test(norm(text)));
    if (r) { r[1](); return true; }
    if (typeof SITE !== 'undefined' && SITE.chatApi && $('msn-form')) {      // pas de règle : on passe la question au chat IA
      window.openWindow('window-msn');
      setTimeout(() => { $('msn-input').value = text; $('msn-form').requestSubmit(); }, 500); return true;
    }
    return false;
  };
})();
