/* =========================================================
   BUGSY - le "virus ami" : intro 1re visite (alerte, antivirus, infection), visite guidée qui marche
   jusqu'aux icônes, puis compagnon de bureau (yeux, drag, sommeil, réactions). Nom : config.js (SITE.mascotte).
   ========================================================= */
(function () {
  'use strict';
  if (!window.GUIDE_SVG) return;
  const $ = id => document.getElementById(id);
  const L = (fr, en) => (window.lang && window.lang() === 'en') ? en : fr;
  const NAME = (typeof SITE !== 'undefined' && SITE.mascotte) || 'Pixel';
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = () => innerWidth < 700;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const snd = k => { try { window.Sons && window.Sons[k] && window.Sons[k](); } catch (e) {} };
  const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  const W = () => small() ? 70 : document.body.classList.contains('gd-tour') ? 124 : 92;
  const tbh = () => ($('menu-bar') || {}).offsetHeight || 36;
  let pos = { x: 0, y: 0 }, busy = false, hideT, typer, idleT, lastPoke = 0, lastR = 0, qi = -1;

  const bug = el('div', '', '<div id="guide-bubble" class="hidden"><p></p><div class="gd-btns"></div></div><div class="gd-body">' + window.GUIDE_SVG + '</div>');
  bug.id = 'guide'; bug.tabIndex = 0; bug.setAttribute('role', 'button'); bug.setAttribute('aria-label', NAME); bug.style.display = 'none';
  document.body.appendChild(bug);
  const bub = bug.querySelector('#guide-bubble'), pu = bug.querySelectorAll('.pu');

  /* ---------- poses : wave, point-l, think, cheer (classes pose-* animées en CSS) ---------- */
  let poseT;
  function pose(n, ms) {
    clearTimeout(poseT); Array.from(bug.classList).filter(c => c.indexOf('pose-') === 0).forEach(c => bug.classList.remove(c));
    if (n) { bug.classList.add('pose-' + n); if (ms) poseT = setTimeout(() => pose(null), ms); }
  }

  /* ---------- déplacement ---------- */
  function side() {
    bub.classList.toggle('left', pos.x + W() + 330 > innerWidth);
    bub.classList.toggle('down', pos.y < 170);
  }
  function go(x, y, anim) {
    x = Math.max(0, Math.min(innerWidth - W(), x)); y = Math.max(0, y);
    const dur = typeof anim === 'number' ? anim : .8;
    const t = (anim !== false && !calm) ? 'left ' + dur + 's cubic-bezier(.5,0,.3,1), top ' + dur + 's cubic-bezier(.5,0,.3,1)' : 'none';
    bug.style.transition = t; bug.style.left = x + 'px'; bug.style.top = y + 'px'; pos = { x, y };
    if (t !== 'none') { bug.classList.add('walk'); setTimeout(() => bug.classList.remove('walk'), dur * 1000 + 50); }
    side();
  }
  const groundY = () => innerHeight - tbh() - W() * 1.083 + 6;
  const dock = anim => go(innerWidth - W() - 14, groundY(), anim);
  function show(x, y) {
    bug.style.display = 'block'; go(x == null ? innerWidth - W() - 14 : x, y == null ? groundY() : y, false);
    bug.classList.remove('beam'); void bug.offsetWidth; bug.classList.add('beam'); rest(); if (level >= 1) pose('wave', 1800);
    setTimeout(() => bug.classList.remove('beam'), 1100);        // sinon l'apparition se rejoue à chaque changement de pose (ex. quand la fenêtre où il est assis se ferme)
  }

  /* ---------- parole ---------- */
  function hideB() { bub.classList.add('hidden'); }
  function say(txt, btns) {
    return new Promise(res => {
      clearInterval(typer); clearTimeout(hideT);
      const p = bub.querySelector('p'), bx = bub.querySelector('.gd-btns');
      bx.innerHTML = ''; p.textContent = ''; bub.classList.remove('hidden'); bug.classList.add('talk'); side();
      const done = () => {
        clearInterval(typer); p.textContent = txt; bug.classList.remove('talk'); bub.onclick = null;
        (btns || []).forEach(b => {
          const k = el('button', b.main ? 'main' : '', b.label); k.type = 'button';
          k.onclick = () => { bx.innerHTML = ''; res(b.v); if (b.fn) b.fn(); };
          bx.appendChild(k);
        });
        if (!btns || !btns.length) res();
      };
      if (calm) { done(); return; }
      let i = 0; bub.onclick = done;
      typer = setInterval(() => { p.textContent = txt.slice(0, ++i); if (i >= txt.length) done(); }, document.body.classList.contains('gd-tour') ? 7 : 18);   // texte du tuto plus rapide
    });
  }
  function quip(txt) {
    if (busy) return;
    say(txt).then(() => { hideT = setTimeout(hideB, 2600 + txt.length * 45); });
  }
  const QUIPS = () => [
    L('Hihi, chatouilles !', 'Hehe, tickles!'),
    L('Je suis un virus, mais je ne mords pas.', "I'm a virus, but I don't bite."),
    L('Double-clique sur moi pour discuter.', 'Double-click me to chat.'),
    L('Antivirus ? Quel antivirus ?', 'Antivirus? What antivirus?'),
    ((window.lang && window.lang() === 'en' ? SITE.dispo_en : SITE.dispo) || '') + L(' (je dis ça, je dis rien)', " (just saying)")
  ];

  /* ---------- visite guidée : il marche jusqu'à chaque icône ---------- */
  /* Tuto en VRAIS gestes : le visiteur ouvre, déplace puis réduit une vraie fenêtre ; chaque geste est détecté et commenté,
     une étape ne passe que si elle est faite. Aucun overlay : un cadre jaune, et « Passer le tuto » reste toujours visible (ou Échap).
     Version tactile plus courte : ouvrir puis fermer. */
  let skipFn = null;
  addEventListener('keydown', e => { if (e.key === 'Escape' && skipFn) skipFn(); });
  function placeBy(r) {                                       // Pixel se place à côté de la cible, sans la cacher
    if (small()) return;
    const w = W(), h = w * 1.083, m = 16, bw = 330;
    const c = [[r.right + m, r.top - 10, r.right + m + w + bw < innerWidth, 'point-l'], [r.left - w - m, r.top - 10, r.left - w - m - bw > 0, 'point-r'], [r.left, r.top - h - 12, r.top - h - 12 > 0, 'point-l']].find(x => x[2]);
    if (c) { go(c[0], Math.min(c[1], groundY()), .45); pose(c[3]); } else { dock(true); pose('wave', 2500); }
  }
  async function visit() {
    const touch = small() || matchMedia('(hover: none) and (pointer: coarse)').matches, ID = 'window-projets', w = $(ID);
    const ring = el('div'); ring.id = 'gd-ring'; ring.style.opacity = 0; document.body.appendChild(ring);
    const dimEl = el('div'); dimEl.id = 'gd-dim'; dimEl.style.opacity = 0; document.body.appendChild(dimEl); let dimOn = false;   // grisé : un voile avec un trou autour de la cible (ne bloque aucun clic)
    const skipB = el('button', 'gd-skip', L('Passer le tuto', 'Skip tutorial')); skipB.type = 'button'; bub.appendChild(skipB);
    const stepEl = el('div', 'gd-step'); bub.insertBefore(stepEl, bub.firstChild); document.body.classList.add('gd-tour');
    let skipped = false; const off = [];
    const skipP = new Promise(r => { skipFn = () => { skipped = true; r('skip'); }; }); skipB.onclick = () => skipFn();
    // Les fenêtres sont mesurées par leur boîte de mise en page (insensible à l'animation d'ouverture) ; le halo jaune est une classe
    // posée sur la fenêtre / la barre de titre / le bouton : il bouge, grandit et disparaît avec eux, au même instant.
    const rectOf = t => t.classList.contains('window') ? { left: t.offsetLeft, top: t.offsetTop, right: t.offsetLeft + t.offsetWidth, bottom: t.offsetTop + t.offsetHeight, width: t.offsetWidth, height: t.offsetHeight } : t.getBoundingClientRect();
    const poly = (x1, y1, x2, y2) => 'polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ' + [x1 + 'px ' + y1 + 'px', x1 + 'px ' + y2 + 'px', x2 + 'px ' + y2 + 'px', x2 + 'px ' + y1 + 'px', x1 + 'px ' + y1 + 'px'].join(', ') + ')';
    const setHole = r => {
      if (!dimOn) return; const x1 = r.left - 10, y1 = r.top - 10, x2 = r.right + 10, y2 = r.bottom + 10;
      if (!dimEl.style.clipPath) { const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2; dimEl.style.clipPath = poly(cx, cy, cx, cy); void dimEl.offsetWidth; }   // 1er trou : part du centre, donc il s'ouvre en douceur
      dimEl.style.clipPath = poly(x1, y1, x2, y2); dimEl.style.opacity = 1;
    };
    const target = sel => {                                    // cadre jaune pour les cibles fixes (icônes)
      const t = document.querySelector(sel); if (!t) { ring.style.opacity = 0; return null; }
      const r = rectOf(t); ring.style.cssText = 'opacity:1;left:' + (r.left - 4) + 'px;top:' + (r.top - 4) + 'px;width:' + (r.width + 8) + 'px;height:' + (r.height + 8) + 'px'; setHole(r); return r;
    };
    let lit = [];
    const clearLit = () => { lit.forEach(t => t.classList.remove('gd-hl')); lit = []; };
    const light = sel => { const t = document.querySelector(sel); if (t) { t.classList.add('gd-hl'); lit.push(t); } };
    const wait = (names, test) => Promise.race([skipP, new Promise(r => {
      const h = e => { if (!test || test(e)) { names.forEach(n => document.removeEventListener(n, h)); r('ok'); } };
      names.forEach(n => document.addEventListener(n, h)); off.push(() => names.forEach(n => document.removeEventListener(n, h)));
    })]);
    const step = (n, tot, msg, sel, names, test, glow) => {         // affiche la consigne puis attend le geste réel
      if (skipped) return 'skip';
      stepEl.textContent = n + ' / ' + tot; clearLit();
      if (glow) { glow.forEach(light); ring.style.opacity = 0; const t = document.querySelector(sel); if (t && !touch) placeBy(rectOf(t)); }
      else { const r = target(sel); if (r && !touch) placeBy(r); }
      say(msg); return wait(names, test);
    };
    const react = async txt => { if (skipped) return; ring.style.opacity = 0; clearLit(); await say(txt); await Promise.race([skipP, sleep(calm ? 0 : 900)]); };
    const open = () => !w.classList.contains('hidden') && !w.classList.contains('is-minimized');
    /* Partie 1 : présentation des applis, le reste du bureau est grisé (le grisé ne bloque aucun clic) */
    const PRES = [
      ['#icon-projets', 'window-projets', 'Ses projets : avatars, chartes graphiques et le Robot collectif.', 'His projects: avatars, brand guidelines and the Collective Robot.'],
      ['#icon-studio', null, 'La galerie : un petit musée 2D à explorer.', 'The gallery: a small 2D museum to explore.'],
      ['#icon-cv', 'window-cv', 'Son CV : formation, compétences, expériences.', 'His resume: education, skills, experience.'],
      ['#icon-msn', null, 'Messenger : discute avec une IA qui répond comme Justin. Pose-lui tes questions.', 'Messenger: chat with an AI that answers like Justin. Ask it anything.'],
      ['#icon-contact', null, "Un stage ou un projet ? C'est ici que ça se passe.", 'An internship or a project? This is where it happens.']
    ];
    dimOn = true; let shown = null;
    for (let i = 0; i < PRES.length && !skipped;) {
      const s = PRES[i], msg = L(s[2], s[3]); let r; clearLit();
      if (shown && shown !== s[1]) { window.closeWindow(shown); shown = null; }
      if (s[1] && !touch) { window.openWindow(s[1]); shown = s[1]; light('#' + s[1]); ring.style.opacity = 0; r = rectOf($(s[1])); setHole(r); }
      else r = target(s[0]);
      stepEl.textContent = L('Présentation ', 'Overview ') + (i + 1) + ' / ' + PRES.length;
      if (r && !touch) placeBy(r);
      const nav = [{ label: L('Suivant ▸', 'Next ▸'), main: true, v: 'next' }]; if (i > 0) nav.unshift({ label: L('◂ Précédent', '◂ Back'), v: 'prev' });
      const res = await Promise.race([skipP, say(msg, nav)]);       // aucune avance automatique : on attend que le visiteur décide
      i = res === 'prev' ? Math.max(0, i - 1) : i + 1;
    }
    if (shown) window.closeWindow(shown);
    dimOn = false; dimEl.style.opacity = 0; ring.style.opacity = 0;
    const N = touch ? 2 : 4; let pre = '', minimized = false;
    const onMin = e => { if (e.detail === ID) minimized = true; }; document.addEventListener('win:min', onMin); off.push(() => document.removeEventListener('win:min', onMin));
          // la réaction au geste précédent est dite DANS la consigne suivante : aucune attente entre les étapes
    if (!open()) {
      const r1 = await step(1, N, L('À toi ! ', 'Your turn! ') + (touch ? L("Touche l'icône « Projets » pour l'ouvrir.", 'Tap the "Projects" icon to open it.') : L("Ouvre « Projets » : double-clique sur l'icône.", 'Open "Projects": double-click the icon.')), '#icon-projets', ['win:open'], e => e.detail === ID);
      if (r1 !== 'skip') pre = L('Voilà, une vraie fenêtre ! ', 'There, a real window! ');
    }
    if (!skipped && !touch && open()) {
      const b = { l: w.offsetLeft, t: w.offsetTop };
      const r2 = await step(2, N, pre + L('Déplace-la : attrape sa barre de titre et fais-la glisser.', 'Move it: grab its title bar and drag.'), '#' + ID + ' .title-bar', ['win:move', 'win:min', 'win:close'],
        e => e.detail.id ? (e.detail.id === ID && Math.hypot(e.detail.rect.left - b.l, e.detail.rect.top - b.t) > 60) : e.detail === ID, ['#' + ID, '#' + ID + ' .title-bar']);
      if (r2 !== 'skip') pre = L('Bien joué ! ', 'Nice! ');
    }
    if (!skipped && open()) {
      const r3 = await step(touch ? 2 : 3, N, pre + (touch ? L('Touche × en haut à droite pour la fermer.', 'Tap × at the top right to close it.') : L('Réduis-la avec le bouton « _ » en haut à droite.', 'Minimize it with the "_" button at the top right.')),
        '#' + ID + (touch ? ' .close-btn' : ' .min-btn'), touch ? ['win:close'] : ['win:min', 'win:close'], e => e.detail === ID, ['#' + ID + (touch ? ' .close-btn' : ' .min-btn')]);
      if (r3 !== 'skip') { if (touch) await react(L("Parfait, tu sais tout ce qu'il faut.", 'Perfect, that is all you need.')); else pre = L('Elle est dans la barre des tâches. ', 'It is in the taskbar. '); }
    }
    if (!skipped && !touch && minimized) {                      // le tuto ne se termine que lorsqu'elle est vraiment rouverte
      const r4 = await step(4, N, pre + L('Clique sur son bouton pour la rouvrir.', 'Click its button to reopen it.'), '#menu-bar .taskbar-item', ['win:restore', 'win:open'], e => e.detail === ID, ['#menu-bar .taskbar-item']);
      if (r4 !== 'skip') await react(L('Parfait, tu maîtrises les fenêtres !', 'Perfect, you have got windows figured out!'));
    }
    clearLit(); off.forEach(f => f()); skipFn = null; ring.remove(); dimEl.remove(); skipB.remove(); stepEl.remove(); document.body.classList.remove('gd-tour'); pose(null); dock(true);
    try { localStorage.setItem('guideTuto', '1'); } catch (e) {}
    if (skipped) { await say(L('Pas de souci. Clique sur moi si tu as besoin.', 'No problem. Click me if you need anything.')); hideT = setTimeout(hideB, 2500); return; }
    await sleep(calm ? 0 : 300);
    await say(L("C'est tout ! Astuce : Ctrl+K pour aller n'importe où. Je me fais discret.", 'That is it! Tip: Ctrl+K to go anywhere. I will keep a low profile.'), [{ label: L('Compris', 'Got it'), main: true }]);
    hideB();
  }
  async function startVisit() { if (busy) return; busy = true; if (bug.style.display === 'none') show(); await visit(); busy = false; }

  /* ---------- niveau d'aide : 1re visite = guide complet, puis de moins en moins ---------- */
  const FORCE = /[?&#]tuto\b/.test(location.search + location.hash);       // ajoute ?tuto=1 à l'adresse pour revoir l'accueil comme un 1er visiteur
  const V = FORCE ? 1 : ((window.Mascotte && window.Mascotte.visits) || 1);
  let muted = false, seen = [];
  try { muted = localStorage.getItem('guideMute') === '1'; seen = JSON.parse(localStorage.getItem('guideVu') || '[]'); } catch (e) {}
  if (FORCE) { muted = false; seen = []; try { ['guideMute', 'guideVu', 'guideTold', 'guideTuto', 'guideAch'].forEach(k => localStorage.removeItem(k)); } catch (e) {} }
  // 1re visite : tuto + astuces ; visites 2-3 : astuces seulement ; ensuite : silence (sauf si on le sollicite)
  let tutoFait = false; try { tutoFait = localStorage.getItem('guideTuto') === '1'; } catch (e) {}   // tuto terminé ou refusé : un F5 ne le relance plus (?tuto=1 pour le revoir)
  const base = V <= 1 && !tutoFait ? 3 : V <= 3 ? 2 : 0;
  let level = muted ? 0 : base;
  const setMute = v => { muted = v; level = v ? 0 : base; try { localStorage.setItem('guideMute', v ? '1' : '0'); } catch (e) {} };
  const mark = id => { if (seen.indexOf(id) < 0) { seen.push(id); try { localStorage.setItem('guideVu', JSON.stringify(seen)); } catch (e) {} } };
  const NUDGE = [
    ['window-projets', L("Tu n'as pas encore ouvert les projets : c'est le cœur du portfolio.", "You haven't opened the projects yet: it's the heart of the portfolio."), L('Voir les projets', 'See projects'), 'icon-projets'],
    ['window-cv', L('Son CV se lit en 30 secondes.', 'His resume takes 30 seconds to read.'), L('Lire le CV', 'Read resume'), 'icon-cv'],
    ['window-studio', L('La galerie se visite comme un petit jeu 2D.', 'The gallery plays like a small 2D game.'), L('Explorer', 'Explore'), 'icon-studio'],
    ['window-contact', L('Un stage ou un projet à proposer ? Ça se passe ici.', 'An internship or project to offer? Right here.'), L('Écrire', 'Write'), 'icon-contact']
  ];
  const maxN = () => 0;                                   // plus de suggestions spontanées let nudges = 0;
  async function nudge() {
    if (busy || nudges >= maxN() || bug.style.display === 'none' || !bub.classList.contains('hidden')) return;
    if (document.querySelector('.window:not(.hidden)')) return;            // pas pendant qu'il lit
    const n = NUDGE.find(x => seen.indexOf(x[0]) < 0 && !x.done); if (!n) return;
    n.done = true; nudges++; busy = true;
    const ic = $(n[3]); if (ic && !small()) { const r = ic.getBoundingClientRect(); go(r.right + 16, r.top - 18); await sleep(calm ? 0 : 850); }
    const c = await say(n[1], [{ label: n[2], main: true, v: 1 }, { label: L('Plus tard', 'Later') }]);
    hideB(); if (c) window.openWindow(n[0]); dock(true); busy = false;
  }
  function wander() {                                                       // il se balade seul le long de la barre des tâches
    if (busy || level < 2 || (window.Guide && window.Guide.perched) || small() || bug.style.display === 'none' || bug.classList.contains('sleep') || !bub.classList.contains('hidden') || Math.random() < .5) return;
    go(40 + Math.random() * (innerWidth - 200), groundY(), true);
  }
  async function intro() {                                   // 1re visite : choix immédiat, rien d'automatique
    busy = true; if (window.hideInvite) window.hideInvite();
    show(innerWidth / 2 - W() / 2 - 120, innerHeight / 2 - 120); await sleep(calm ? 0 : 500);
    const c = await (say(L("Salut ! Moi c'est " + NAME + ", je vis dans cet ordinateur. Bienvenue sur le portfolio de Justin Dejean. Je te montre comment ça marche ?", "Hi! I'm " + NAME + ", I live inside this computer. Welcome to Justin Dejean's portfolio. Want a quick demo?"),
      [{ label: L('Visite rapide', 'Quick tour'), main: true, v: 'tour' }, { label: L('Je me débrouille', "I'll manage"), v: 'no' }]));   // rien d'automatique : on attend la décision du visiteur
    if (c === 'tour') await visit();
    else { try { localStorage.setItem('guideTuto', '1'); } catch (e) {} dock(true); await sleep(calm ? 0 : 800); await say(L('Pas de souci. Clique sur moi si tu as besoin.', 'No problem. Click me if you need anything.')); hideT = setTimeout(hideB, 2500); }
    busy = false;
  }
  const NOMS = { 'window-projets': 'Projets', 'window-cv': 'CV', 'window-studio': 'Galerie', 'window-contact': 'Contact', 'window-musique': 'Musique', 'window-msn': 'Messenger' };
  async function welcome() {                                                // 2e visite
    busy = true; show(); await sleep(calm ? 0 : 900);
    let last = null; try { last = localStorage.getItem('guideDernier'); } catch (e) {}
    const b = [{ label: L('Merci', 'Thanks') }]; if (last && NOMS[last]) b.unshift({ label: L('Reprendre : ', 'Resume: ') + NOMS[last], main: true, v: 1, fn: () => window.openWindow(last) });
    await say(L('Re-bonjour ! Content de te revoir.', 'Welcome back!'), b); hideB(); busy = false;
  }

  /* ---------- Exécuter... (Ctrl+K ou menu Démarrer) ---------- */
  const CMD = { projets: 'window-projets', cv: 'window-cv', galerie: 'window-studio', musique: 'window-musique', contact: 'window-contact', stage: 'window-contact', recruteur: 'recruteur', messenger: 'window-msn', chat: 'window-msn', mines: 'window-demineur', demineur: 'window-demineur', visite: 'tour', aide: 'tour' };
  const run = el('div', '', '<div class="gd-tb"><span>' + L('Exécuter', 'Run') + '</span><i>×</i></div><form class="gd-bd"><p>' + L("Entrez le nom d'un programme, d'un dossier ou d'un document, et Windows l'ouvrira pour vous.", 'Type the name of a program, folder or document, and Windows will open it for you.') + '</p><input list="gd-cmds" autocomplete="off" spellcheck="false" aria-label="' + L('Ouvrir', 'Open') + '"><datalist id="gd-cmds">' + Object.keys(CMD).map(k => '<option value="' + k + '">').join('') + '</datalist><p class="gd-err"></p><div class="gd-bt"><button class="main">OK</button><button type="button">' + L('Annuler', 'Cancel') + '</button></div></form>');
  run.id = 'gd-run'; run.hidden = true; document.body.appendChild(run);
  const inp = run.querySelector('input'), err = run.querySelector('.gd-err');
  const closeRun = () => { run.hidden = true; pose(null); };
  const openRun = () => { pose('think'); run.hidden = false; err.textContent = ''; inp.value = ''; inp.focus(); };
  run.querySelector('form').onsubmit = e => {
    e.preventDefault(); const k = inp.value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f\s]/g, '');
    const t = CMD[k]; if (!t) { if (window.Guide && window.Guide.intent && window.Guide.intent(inp.value)) { closeRun(); return; } snd('error'); err.textContent = L("Windows ne trouve pas « " + inp.value + " ». Essayez : projets, cv, galerie, contact, musique.", "Windows cannot find '" + inp.value + "'. Try: projets, cv, galerie, contact, musique."); return; }
    closeRun(); if (t === 'tour') startVisit(); else if (t === 'recruteur') window.Guide.actions.recruteur(); else window.openWindow(t);
  };
  run.querySelector('.gd-bt button:last-child').onclick = run.querySelector('.gd-tb i').onclick = closeRun;
  addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); run.hidden ? openRun() : closeRun(); }
    else if (e.key === 'Escape' && !run.hidden) closeRun();
  });
  document.addEventListener('click', e => { if (e.target.closest('[data-run]')) openRun(); });

  /* ---------- compagnon : yeux, clic, drag, sommeil, réactions ---------- */
  let ptr = null;
  addEventListener('pointermove', e => {
    rest();
    if (ptr || bug.style.display === 'none') return;
    ptr = requestAnimationFrame(() => {
      ptr = null; const r = bug.getBoundingClientRect(), a = Math.atan2(e.clientY - (r.top + r.height * .5), e.clientX - (r.left + r.width * .5));
      pu.forEach(p => { p.style.transform = 'translate(' + (Math.cos(a) * 3).toFixed(1) + 'px,' + (Math.sin(a) * 3).toFixed(1) + 'px)'; });
    });
  }, { passive: true });
  let idleQ, idleSaid = false;
  function rest() {
    clearTimeout(idleQ);                                      // 30 s d'inactivité : une seule remarque par session
    idleQ = setTimeout(() => { if (!busy && level >= 2 && !idleSaid && bub.classList.contains('hidden') && bug.style.display !== 'none') { idleSaid = true; quip(L('Toujours là ? Si tu cherches quelque chose, clique sur moi.', 'Still there? If you are looking for something, click me.')); } }, 30000);
    clearTimeout(idleT);
    if (bug.classList.contains('sleep')) { bug.classList.remove('sleep'); if (level >= 2) quip(L("Hein ? Je ne dormais pas !", "Huh? I wasn't sleeping!")); }
    idleT = setTimeout(() => { if (!busy) bug.classList.add('sleep'); }, 45000);
  }
  function poke() {
    bug.classList.remove('jump'); void bug.offsetWidth; bug.classList.add('jump'); snd('click');
    const n = Date.now(); if (n - lastPoke < 380) { lastPoke = 0; hideB(); window.openWindow('window-msn'); return; } lastPoke = n;
    const q = QUIPS(); qi = (qi + 1 + Math.floor(Math.random() * (q.length - 1))) % q.length; quip(q[qi]);
  }
  let drag = null;
  bug.addEventListener('pointerdown', e => {
    if (e.target.closest('#guide-bubble')) return;
    drag = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y, m: false }; bug.setPointerCapture(e.pointerId);
  });
  bug.addEventListener('pointermove', e => {
    if (!drag) return; const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
    if (!drag.m && Math.hypot(dx, dy) < 6) return;
    drag.m = true; bug.classList.add('drag'); go(drag.ox + dx, drag.oy + dy, false);
  });
  bug.addEventListener('pointerup', () => {
    if (!drag) return; const m = drag.m; drag = null; bug.classList.remove('drag');
    if (m) { bug.style.transition = calm ? 'none' : 'top .6s cubic-bezier(.3,1.6,.5,1)'; pos.y = groundY(); bug.style.top = pos.y + 'px'; side(); }   // il retombe sur la barre des tâches
    else poke();
  });
  bug.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); poke(); } });
  addEventListener('resize', () => { if (bug.style.display !== 'none') go(pos.x, Math.min(pos.y, groundY()), false); });

  const note = id => { const n = typeof SITE !== 'undefined' && SITE.guideNotes && SITE.guideNotes[id]; return n ? L(n[0], n[1]) : null; };   // textes dans config.js
  const R = {
    'window-projets': [L('Regarde le Robot collectif en premier !', 'Check out the Collective Robot first!')],
    'window-studio': [L('Bonne balade dans la galerie !', 'Enjoy the gallery!')],
    'window-musique': [L('Bon choix, un peu de musique.', 'Good call, some music.')],
    'window-demineur': [L('Attention aux mines. Moi, je ne pète que des plombs.', "Careful with the mines. I only blow fuses.")]
  };
  document.addEventListener('win:open', e => {
    const first = seen.indexOf(e.detail) < 0; mark(e.detail); try { localStorage.setItem('guideDernier', e.detail); } catch (x) {}
    const txt = note(e.detail) || (R[e.detail] && R[e.detail][0]);
    if (!txt || busy || level < 2 || !first || bug.style.display === 'none') return;
    setTimeout(() => quip(txt), 700);
  });

  function afterBoot(fn) {
    const b = document.body; if (!b.classList.contains('booting')) { fn(); return; }
    const mo = new MutationObserver(() => { if (!b.classList.contains('booting')) { mo.disconnect(); fn(); } });
    mo.observe(b, { attributes: true, attributeFilter: ['class'] });
  }
  afterBoot(() => {
    const chat = /[?&]chat=1\b/.test(location.search);
    setTimeout(() => {
      if (level === 3 && !chat) intro();
      else show();
      setInterval(nudge, 25000); setInterval(wander, 17000);
    }, level === 3 ? 250 : 1000);
  });
  window.Guide = { name: NAME, intro, visit: startVisit, say: quip, run: openRun, _: { pose, bug, go, groundY, W, small, quip, hideB, level: () => level, busy: () => busy, pos: () => pos, setPos: (x, y) => { pos = { x, y }; }, setMute, muted: () => muted } };
})();
