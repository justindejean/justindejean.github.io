/* =========================================================
   STUDIO.APP — boucle de jeu, vue du dessus (2D)
   ========================================================= */
(function () {
  'use strict';

  const VIEW_TW = 15, VIEW_TH = 10;
  const VIEW_W = VIEW_TW * TILE, VIEW_H = VIEW_TH * TILE;

  /* ---------- Éléments DOM ---------- */
  const canvas = document.getElementById('game-canvas');
  const win = document.getElementById('window-studio');
  const boxEl = document.getElementById('game-dialogue');
  const textEl = document.getElementById('dialogue-text');
  const arrowEl = document.getElementById('dialogue-arrow');
  const questEl = document.getElementById('quest-text');
  const badgeEl = document.getElementById('quest-badge');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const SCALE = canvas.width / VIEW_W;
  const cam = { x: 0, y: 0 };

  /* ---------- Son (petits bips carrés) ---------- */
  let audio = null, muted = false;
  function beep(freq, dur, type) {
    if (muted) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const o = audio.createOscillator(), g = audio.createGain();
      o.type = type || 'square'; o.frequency.value = freq;
      g.gain.value = 0.04;
      g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + dur);
      o.connect(g); g.connect(audio.destination);
      o.start(); o.stop(audio.currentTime + dur);
    } catch (e) { /* le son n'est qu'un bonus */ }
  }
  const muteBtn = document.getElementById('game-mute');
  if (muteBtn) muteBtn.addEventListener('click', () => {
    muted = !muted;
    muteBtn.textContent = muted ? '🔇' : '🔊';
    muteBtn.setAttribute('aria-label', muted ? 'Activer le son' : 'Couper le son');
  });

  /* ---------- Dialogues ---------- */
  let dlgLines = [], dlgLine = '', dlgChar = 0, dlgTimer = 0, dlgDone = true, dlgEnd = null;
  const OPEN = () => dlgLines.length > 0 || !dlgDone || boxEl.classList.contains('is-open');   // la bulle reste ouverte jusqu'à ce qu'on la ferme avec A

  function say(lines, onEnd) {
    dlgLines = (Array.isArray(lines) ? lines.slice() : [lines]).map(l => window.tr ? window.tr(l) : l);
    dlgEnd = onEnd || null;
    nextLine();
    beep(660, 0.05);
  }
  function nextLine() {
    if (!dlgLines.length) {
      dlgDone = true; dlgLine = '';
      boxEl.classList.remove('is-open');
      arrowEl.style.visibility = 'hidden';
      showHint();
      const cb = dlgEnd; dlgEnd = null;
      if (cb) cb();
      return;
    }
    dlgLine = dlgLines.shift();
    dlgChar = 0; dlgTimer = 0; dlgDone = false;
    boxEl.classList.add('is-open');
    boxEl.classList.remove('is-quest');
    arrowEl.style.visibility = 'hidden';
  }
  function showHint() {
    if (OPEN()) return;
    textEl.textContent = hint();
    boxEl.classList.toggle('is-quest', mission < 4);
  }
  function advance() {
    if (!dlgDone) { dlgChar = dlgLine.length; dlgDone = true; textEl.textContent = dlgLine; arrowEl.style.visibility = 'visible'; }
    else { nextLine(); }
    beep(880, 0.04);
  }
  function tickDialogue(dt) {
    if (dlgDone) return;
    dlgTimer += dt;
    while (dlgTimer > 22 && dlgChar < dlgLine.length) { dlgTimer -= 22; dlgChar++; }
    textEl.textContent = dlgLine.slice(0, dlgChar);
    if (dlgChar >= dlgLine.length) { dlgDone = true; arrowEl.style.visibility = 'visible'; }
  }
  boxEl.addEventListener('click', () => { if (OPEN()) advance(); });

  /* ---------- Quête : faire le tour de la galerie ---------- */
  let lastPaintingKey = null;
  let mission = 1;                       // 1 = en cours, 4 = terminée
  const TOTAL = TABLEAUX.length;
  const viewed = new Set();
  function hint() {
    return mission < 4
      ? '▶ Objectif : regarde tous les tableaux (' + viewed.size + '/' + TOTAL + ')'
      : '★ Tour terminé ! Un projet en tête ? Clique sur « Me contacter ».';
  }
  function updateQuest(silent) {
    questEl.textContent = mission < 4 ? 'Tableaux vus ' + viewed.size + '/' + TOTAL : 'Tour terminé — contacte-moi !';
    badgeEl.classList.toggle('is-done', mission === 4);
    badgeEl.textContent = mission === 4 ? '★' : viewed.size;
    badgeEl.classList.remove('pulse');
    void badgeEl.offsetWidth;
    badgeEl.classList.add('pulse');
    if (!silent) beep(mission === 4 ? 1320 : 990, 0.12);
    showHint();
  }

  /* ---------- Interactions ---------- */
  const DIRV = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

  function unlock(iconId, label) {
    return !!(window.unlockDesktop && window.unlockDesktop(iconId, label));
  }

  function interact() {
    const [dx, dy] = DIRV[hero.dir];
    const o = objectAt(hero.gx + dx, hero.gy + dy);
    if (!o) { say('Il n\'y a rien par ici.'); return; }
    beep(520, 0.06);

    switch (o.id) {
      case 'tv': {
        tvOn = true;
        const fresh = unlock('icon-videos', 'Vidéos & Pubs');
        if (fresh) {
          if (mission === 1) { mission = 2; updateQuest(); }
          say(['Tu appuies sur le gros bouton. Le tube cathodique claque et s\'allume.',
               'Défilent un plan de drone sur la côte, un timelapse de montage, un spot de vingt secondes pour une asso caennaise.',
               'La cassette s\'éjecte. L\'appli « Vidéos & Pubs » vient de s\'installer sur le bureau du Mac.']);
        } else {
          say(['La télé repasse la même bobine.',
               'Pour regarder les vidéos en entier, ouvre « Vidéos & Pubs » sur le bureau.']);
        }
        break;
      }

      case 'desk': {
        if (mission < 2) {
          say(['Il fait sombre ici, difficile de voir quoi que ce soit sur ce bureau.',
               'Commence par allumer la télévision, au fond de la pièce.']);
          break;
        }
        const fresh = unlock('icon-cv', 'CV.txt');
        if (fresh) {
          mission = 3; updateQuest();
          say(['Sur le bureau : un carnet de tournage écorné, une carte SD pleine et un mug froid.',
               'Le carnet recense quatorze tournages, deux ans de BUT MMI et une liste de logiciels.',
               'Tu copies tout sur une clé. « CV.txt » est maintenant sur le bureau du Mac.']);
        } else {
          say(['Le carnet est déjà recopié. CV.txt t\'attend sur le bureau du Mac.']);
        }
        break;
      }

      case 'board': {
        if (mission < 3) {
          say(mission < 2
            ? ['Le panneau est couvert de photos, mais rien n\'a de sens pour l\'instant.',
               'Commence par allumer la télévision.']
            : ['Le panneau est couvert de photos, mais rien n\'a de sens pour l\'instant.',
               'Regarde d\'abord ce qu\'il y a sur le bureau.']);
          break;
        }
        const fresh = unlock('icon-contact', 'Contact.app');
        if (fresh) {
          mission = 4; updateQuest();
          say(['Le panneau en liège : des photos de tournage, un planning de rendus, une punaise rouge.',
               'Sous les photos, une carte de visite au nom de Justin.',
               'Adresse récupérée. « Contact.app » est installé sur le bureau du Mac.']);
        } else {
          say(['Rien de neuf sur le panneau. La carte de visite est dans Contact.app.']);
        }
        break;
      }

      case 'shelf': {
        const fresh = unlock('icon-projets', 'Projets');
        if (fresh) {
          say(['Des livres de montage, des boîtiers gravés et un trophée poussiéreux.',
               'Derrière les livres, un classeur : la liste complète des projets, courts-métrages et affiches.',
               'Bonus débloqué : le dossier « Projets » est apparu sur le bureau du Mac.']);
        } else {
          say(['Le classeur est déjà recopié dans le dossier Projets.']);
        }
        break;
      }

      case 'couch':
        say(['Le canapé en cuir noir du salon, pile en face de la télé.',
             'L\'endroit idéal pour visionner un montage entre deux prises.']);
        break;

      case 'kitchen':
        say(['Plan de travail, évier et plaques de cuisson.',
             'Un mug traîne encore à côté, du café d\'hier soir de montage.']);
        break;

      case 'fridge':
        fridgeOpen = !fridgeOpen;
        beep(fridgeOpen ? 480 : 340, 0.07, 'triangle');
        say(fridgeOpen
          ? ['Tu ouvres le frigo.', 'Surtout des chutes de rush... et une part de pizza froide.']
          : 'Tu refermes le frigo.');
        break;

      case 'window':
        say(['Par la fenêtre : les toits de Caen sous un ciel gris-bleu.',
             'Belle lumière pour un plan d\'ouverture.']);
        break;

      case 'plant':
        say(['Une plante verte. Arrosée, pour une fois.']);
        break;

      case 'painting': {
        const wasNew = !viewed.has(o.titre);
        viewed.add(o.titre);
        const finished = mission < 4 && viewed.size >= TOTAL;
        const lines = [o.titre, o.texte];
        if (finished) lines.push('Tu as fait le tour de la galerie ! Un projet en tête ? Écris-moi.');
        say(lines, () => {
          if (o.projet && window.openProject) window.openProject(o.projet);           // ouvre la fiche projet
          else if (o.ouvre && window.openWindow) window.openWindow(o.ouvre);
          if (finished) { mission = 4; updateQuest(); }
          else if (wasNew) updateQuest();
        });
        break;
      }

      case 'bed':
        say(['Un lit bien tentant après une nuit de rendu vidéo.',
             'Pas le moment de dormir.']);
        break;

      case 'nightstand':
        lampOn = !lampOn;
        beep(lampOn ? 720 : 380, 0.05);
        say(lampOn ? 'Tu allumes la lampe de chevet. Lumière chaude sur le coin chambre.'
                            : 'Tu éteins la lampe de chevet.');
        break;

      case 'wardrobe':
        say(['L\'armoire : deux trois pulls, une chemise gardée pour les rendus de projet,',
             'et une vieille housse d\'appareil photo tout au fond.']);
        break;

      case 'sink':
        say(['Un lavabo pas franchement nickel.',
             'Idéal pour se réveiller avant un montage qui commence tôt le matin.']);
        break;

      case 'toilet':
        say('Rien à voir ici, on passe.');
        break;

      case 'bathtub':
        say(['Une baignoire.',
             'Le seul endroit du studio où personne ne vient déranger pendant un brief client.']);
        break;

      case 'door-exit':
        say(['Tu refermes la porte du studio.',
             'Sur le bureau du Mac, tout ce que tu as trouvé ici est maintenant ouvrable.'], () => {
          if (window.closeWindow) window.closeWindow('window-studio');
        });
        break;

      case 'door-link':
        beep(440, 0.05);
        goToRoom(o.to.room, o.to.gx, o.to.gy);
        if (catFollowing) { cat.gx = hero.gx; cat.gy = hero.gy; cat.px = hero.px; cat.py = hero.py; cat.moving = false; catQueue.length = 0; }
        say(o.msg || 'Tu changes de pièce.');
        break;

      case 'cat':
        beep(1040, 0.08);
        if (!catFollowing) {
          catFollowing = true;
          cat.gx = o.x; cat.gy = o.y; cat.px = o.x * TILE; cat.py = o.y * TILE;
          cat.dir = 'down'; cat.moving = false; catQueue.length = 0;
          const idx = currentRoom().objects.indexOf(o);
          if (idx >= 0) currentRoom().objects.splice(idx, 1);   // elle ne reste plus assise là, elle te suit
          say(['Mireille, le chat du studio, se frotte contre ta jambe.', 'Elle décide de te suivre.']);
        } else {
          say(['Mireille te suit toujours, la queue en l\'air.']);
        }
        break;
    }
  }

  /* ---------- Entrées : clavier + joystick ---------- */
  const held = [];
  function press(dir) { release(dir); held.push(dir); }
  function release(dir) { const i = held.indexOf(dir); if (i >= 0) held.splice(i, 1); }
  let stickDir = null;
  const wantedDir = () => stickDir || held[held.length - 1] || null;

  const KEYMAP = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    z: 'up', s: 'down', q: 'left', d: 'right',
    Z: 'up', S: 'down', Q: 'left', D: 'right'
  };
  const active = () => win && !win.classList.contains('hidden');

  document.addEventListener('keydown', e => {
    if (!active()) return;
    const dir = KEYMAP[e.key];
    if (dir) { e.preventDefault(); if (!e.repeat) press(dir); return; }
    if (e.key === 'Shift') { hero.running = true; return; }
    if (e.key === 'x' || e.key === 'X' || e.code === 'Space') { e.preventDefault(); if (!e.repeat) triggerJump(); return; }
    if (e.key === 'a' || e.key === 'A' || e.key === 'Enter' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
      if (e.repeat) return;
      if (OPEN()) advance(); else if (!hero.moving) interact();
    }
  });
  document.addEventListener('keyup', e => {
    const dir = KEYMAP[e.key];
    if (dir) release(dir);
    if (e.key === 'Shift') hero.running = false;
  });
  const releaseAll = () => { held.length = 0; stickDir = null; hero.running = false; resetKnob(); setRunBtn(false); };
  window.addEventListener('blur', releaseAll);
  document.addEventListener('visibilitychange', () => { if (document.hidden) releaseAll(); });

  /* ---------- Joystick (souris et tactile) ---------- */
  const stick = document.getElementById('stick');
  const knob = document.getElementById('stick-knob');
  let stickId = null;

  function resetKnob() {
    if (knob) knob.style.transform = 'translate(-50%, -50%)';
    if (stick) stick.classList.remove('is-active');
  }
  function readStick(e) {
    const r = stick.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    let dx = e.clientX - cx, dy = e.clientY - cy;
    const max = r.width / 2 - 14;
    const dist = Math.hypot(dx, dy);
    if (dist > max) { dx *= max / dist; dy *= max / dist; }
    knob.style.transform = 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px))';
    if (dist < max * 0.35) { stickDir = null; return; }
    stickDir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  }
  if (stick) {
    stick.addEventListener('pointerdown', e => {
      e.preventDefault();
      stickId = e.pointerId;
      stick.setPointerCapture(e.pointerId);
      stick.classList.add('is-active');
      readStick(e);
    });
    stick.addEventListener('pointermove', e => {
      if (stickId !== e.pointerId) return;
      e.preventDefault();
      readStick(e);
    });
    const end = e => {
      if (stickId !== e.pointerId) return;
      stickId = null; stickDir = null; resetKnob();
    };
    stick.addEventListener('pointerup', end);
    stick.addEventListener('pointercancel', end);
    stick.addEventListener('lostpointercapture', end);
  }
  document.querySelectorAll('[data-dir]').forEach(btn => {
    const dir = btn.getAttribute('data-dir');
    btn.addEventListener('pointerdown', e => { e.preventDefault(); press(dir); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev =>
      btn.addEventListener(ev, e => { e.preventDefault(); release(dir); }));
  });
  const aBtn = document.getElementById('btn-action');
  if (aBtn) aBtn.addEventListener('pointerdown', e => {
    e.preventDefault();
    if (OPEN()) advance(); else if (!hero.moving) interact();
  });

  function triggerJump() {
    if (hero.jumping) return;
    hero.jumping = true;
    hero.jumpT = 0;
    beep(500, 0.05, 'triangle');
  }
  const jumpBtn = document.getElementById('btn-jump');
  if (jumpBtn) jumpBtn.addEventListener('pointerdown', e => { e.preventDefault(); triggerJump(); });

  function setRunBtn(on) {
    const btn = document.getElementById('btn-run');
    if (btn) btn.classList.toggle('is-active', on);
  }
  const runBtn = document.getElementById('btn-run');
  if (runBtn) {
    runBtn.addEventListener('pointerdown', e => { e.preventDefault(); hero.running = true; setRunBtn(true); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev =>
      runBtn.addEventListener(ev, e => { e.preventDefault(); hero.running = false; setRunBtn(false); }));
  }

  /* ---------- Boucle ---------- */
  let last = 0;

  function startStep(dir) {
    const [dx, dy] = DIRV[dir];
    const r = currentRoom();
    const nx = hero.gx + dx, ny = hero.gy + dy;   // x illimité : le décor se répète autour du héros
    if (blocked(nx, ny)) return false;
    hero.fromX = hero.gx * TILE; hero.fromY = hero.gy * TILE;
    hero.toX = nx * TILE; hero.toY = ny * TILE;
    hero.gx = nx; hero.gy = ny;
    hero.moving = true; hero.t = 0;
    hero.stepPhase = hero.stepPhase === 1 ? 2 : 1;
    return true;
  }
  function tryMove() {
    const dir = wantedDir();
    if (!dir) { hero.frame = 0; hero.bumpT = 0; return; }
    if (dir !== hero.dir && hero.chainT <= 0) {
      hero.dir = dir;
      hero.turnT = TURN_MS;
      return;
    }
    hero.dir = dir;
    if (startStep(dir)) return;
    for (let i = held.length - 1; i >= 0; i--) {
      const alt = held[i];
      if (alt !== dir && startStep(alt)) { hero.dir = alt; return; }
    }
    hero.frame = 0;
    if (hero.bumpT <= 0) { beep(200, 0.04, 'triangle'); hero.bumpT = 400; }
  }
  /* ---------- Chat qui suit (une fois qu'on lui a parlé) ---------- */
  let catFollowing = false;
  const cat = { gx: 0, gy: 0, px: 0, py: 0, moving: false, t: 0, fromX: 0, fromY: 0, toX: 0, toY: 0, dir: 'down', animT: 0 };
  const catQueue = [];
  let lastHeroGX = hero.gx, lastHeroGY = hero.gy;

  function updateCat(dt) {
    cat.animT += dt;
    if (!catFollowing) return;

    if (hero.gx !== lastHeroGX || hero.gy !== lastHeroGY) {
      catQueue.push({ gx: lastHeroGX, gy: lastHeroGY });
      if (catQueue.length > 6) catQueue.shift();   // le chat rattrape, jamais un train de retard
      lastHeroGX = hero.gx; lastHeroGY = hero.gy;
    }

    if (cat.moving) {
      cat.t += dt;
      const dur = hero.running ? RUN_MS : WALK_MS;
      const k = Math.min(1, cat.t / dur);
      cat.px = cat.fromX + (cat.toX - cat.fromX) * k;
      cat.py = cat.fromY + (cat.toY - cat.fromY) * k;
      if (k >= 1) { cat.moving = false; cat.px = cat.toX; cat.py = cat.toY; }
      return;
    }

    if (catQueue.length) {
      const next = catQueue.shift();
      if (next.gx === cat.gx && next.gy === cat.gy) return;
      const dx = next.gx - cat.gx, dy = next.gy - cat.gy;
      cat.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      cat.fromX = cat.gx * TILE; cat.fromY = cat.gy * TILE;
      cat.gx = next.gx; cat.gy = next.gy;
      cat.toX = cat.gx * TILE; cat.toY = cat.gy * TILE;
      cat.moving = true; cat.t = 0;
    }
  }

  function update(dt) {
    updateCat(dt);
    tickDialogue(dt);
    if (hero.bumpT > 0) hero.bumpT -= dt;
    if (hero.chainT > 0) hero.chainT -= dt;
    if (hero.jumping) {
      hero.jumpT += dt;
      if (hero.jumpT >= JUMP_MS) { hero.jumping = false; hero.jumpT = 0; }
    }
    if (OPEN()) { hero.frame = 0; return; }
    if (hero.moving) {
      hero.t += dt;
      const k = Math.min(1, hero.t / (hero.running ? RUN_MS : WALK_MS));
      hero.px = hero.fromX + (hero.toX - hero.fromX) * k;
      hero.py = hero.fromY + (hero.toY - hero.fromY) * k;
      hero.frame = hero.stepPhase;
      if (k >= 1) {
        hero.moving = false;
        hero.px = hero.toX; hero.py = hero.toY;
        hero.chainT = 110;
        hero.turnT = 0;
        const above = objectAt(hero.gx, hero.gy - 1);       // petit son quand on passe devant un tableau
        const key = above && above.id === 'painting' ? above.titre : null;
        if (key && key !== lastPaintingKey) beep(740, 0.06);
        lastPaintingKey = key;
        tryMove();
        if (!hero.moving) hero.frame = 0;
      }
      return;
    }
    if (hero.turnT > 0) { hero.turnT -= dt; return; }
    tryMove();
  }

  function render() {
    const r = currentRoom();
    cam.x = Math.round(hero.px + TILE / 2 - VIEW_W / 2);   // pas de bord : la caméra suit à l'infini
    cam.y = Math.max(0, Math.min(r.h * TILE - VIEW_H, Math.round(hero.py + TILE / 2 - VIEW_H / 2)));

    ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, VIEW_W, VIEW_H);
    ctx.save();
    ctx.translate(-cam.x, -cam.y);

    const tx0 = Math.floor(cam.x / TILE), ty0 = Math.floor(cam.y / TILE);
    const floors = floorSetFor(currentRoomId);
    for (let ty = ty0; ty <= ty0 + VIEW_TH; ty++) {
      for (let tx = tx0; tx <= tx0 + VIEW_TW; tx++) {
        if (ty < 0 || ty >= r.h) continue;
        const ch = r.map[ty][wrapX(tx, r.w)];
        if (interiorReady && floors[ch]) {
          const [sx, sy, sw, sh] = floors[ch];
          ctx.drawImage(interiorImg, sx, sy, sw, sh, tx * TILE, ty * TILE, TILE, TILE);
        } else {
          const t = TILES[ch];
          if (t) ctx.drawImage(t, tx * TILE, ty * TILE);
        }
      }
    }

    const drawables = [];
    const k0 = Math.floor(cam.x / TILE / r.w) - 1, k1 = Math.floor((cam.x + VIEW_W) / TILE / r.w) + 1;
    for (let k = k0; k <= k1; k++) {          // copies du décor, générées à gauche et à droite au besoin
      r.objects.forEach(o => {
        const c = Object.assign({}, o, { x: o.x + k * r.w });
        if ((c.x + c.w) * TILE < cam.x || c.x * TILE > cam.x + VIEW_W) return;
        drawables.push({ y: (c.y + c.h) * TILE, draw: () => drawFurnitureAt(ctx, c) });
      });
    }
    if (catFollowing) {
      drawables.push({ y: cat.py + TILE, draw: () => drawCatSprite(ctx, cat.px, cat.py, cat.dir, cat.animT) });
    }
    drawables.push({ y: hero.py + TILE, draw: () => drawHero(ctx, hero.px, hero.py) });
    drawables.sort((a, b) => a.y - b.y).forEach(d => d.draw());

    ctx.restore();
  }

  function loop(ts) {
    const dt = Math.min(50, ts - last || 16);
    last = ts;
    window.frameCount = (window.frameCount || 0) + 1;
    if (active()) { update(dt); render(); }
    requestAnimationFrame(loop);
  }

  updateQuest(true);
  textEl.textContent = hint();
  arrowEl.style.visibility = 'hidden';
  requestAnimationFrame(loop);

  let welcomed = false;
  window.onStudioOpen = function () {
    if (welcomed) return;
    welcomed = true;
    let seen = false;
    try { seen = localStorage.getItem('galerieVue') === '1'; localStorage.setItem('galerieVue', '1'); } catch (e) {}
    if (seen) { say('Re-bonjour ! Appuie sur A devant un tableau pour ouvrir le projet.'); return; }
    setTimeout(() => say([
      'Bienvenue dans la galerie.',
      'Flèches ou ZQSD pour marcher, A devant un tableau pour ouvrir le projet.',
      'Objectif : regarde tous les tableaux. Le couloir est infini, va où tu veux.'
    ]), 400);
  };
})();
