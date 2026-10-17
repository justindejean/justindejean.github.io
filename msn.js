/* Messenger : petit chat guidé pour orienter les visiteurs */
(function () {
  'use strict';
  const log = document.getElementById('msn-log');
  const opts = document.getElementById('msn-options');
  if (!log) return;
  let started = false;

  const NAME = (window.Mascotte && window.Mascotte.name) || (typeof SITE !== 'undefined' && SITE.mascotte) || 'Mascotte';
  const MENU = [
    { id: 'projets',  label: '🎬 Voir ses projets' },
    { id: 'cv',       label: '📄 Voir son CV' },
    { id: 'galerie',  label: '🖼 Visiter la galerie' },
    { id: 'musique',  label: '🎧 Écouter sa playlist' },
    { id: 'dispo',    label: '📅 Il est dispo quand ?' },
    { id: 'contact',  label: '✉ Le contacter' },
    { id: 'visite',   label: '🧭 Revoir la visite' }
  ];
  /* La mascotte parle à la 1re personne ; Justin est « il ». */
  const REPLIES = {
    projets: { me: 'Voir ses projets', bot: 'Je t\'ouvre les projets de Justin. Commence par le dossier Robot collectif !',
               act: () => window.openProjectFolder && window.openProjectFolder('robot') },
    cv:      { me: 'Voir son CV', bot: 'Voilà son CV. Si son profil t\'intéresse, tu peux lui écrire !',
               act: () => window.openWindow('window-cv') },
    galerie: { me: 'Visiter la galerie', bot: 'Bonne balade ! Regarde tous les tableaux.',
               act: () => window.openWindow('window-studio') },
    musique: { me: 'Écouter sa playlist', bot: 'Voici ce que Justin écoute en travaillant.',
               act: () => window.openWindow('window-musique') },
    dispo:   { me: 'Il est dispo quand ?', bot: null,
               act: null },
    contact: { me: 'Le contacter', bot: 'Avec plaisir ! Je t\'ouvre le formulaire pour écrire à Justin.',
               act: () => window.openWindow('window-contact') },
    visite:  { me: 'Revoir la visite', bot: 'C\'est parti pour la visite !',
               act: () => window.Mascotte && window.Mascotte.tour() }
  };

  const t = s => (window.tr ? window.tr(s) : s);

  function add(text, who) {
    const d = document.createElement('div');
    d.className = 'msn-msg ' + who;
    d.textContent = text;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }
  function typing(ms, then) {
    const d = add('…', 'bot typing');
    setTimeout(() => { d.remove(); then(); }, ms);
  }
  function showMenu() {
    opts.innerHTML = '';
    MENU.forEach(m => {
      const b = document.createElement('button');
      b.textContent = m.label;
      b.addEventListener('click', () => choose(m.id));
      opts.appendChild(b);
    });
  }
  function choose(id) {
    const r = REPLIES[id];
    opts.innerHTML = '';
    add(r.me, 'me');
    typing(650, () => {
      if (id === 'dispo') {
        const en = window.lang && window.lang() === 'en';
        add((typeof SITE !== 'undefined' && (en ? SITE.dispo_en : SITE.dispo)) || t('Disponible bientôt !'), 'bot');
        add('Écris-lui pour en parler, je t\'ouvre le formulaire quand tu veux !', 'bot');
      } else add(r.bot, 'bot');
      if (r.act) r.act();
      setTimeout(() => typing(500, () => { add('Autre chose ?', 'bot'); showMenu(); }), 500);
    });
  }
  function start() {
    if (started) return;
    started = true;
    const back = window.Mascotte && !window.Mascotte.first;       // le visiteur est déjà venu : pas de long discours
    if (back) {
      typing(450, () => add('Re-salut ! 😊 Content de te revoir.', 'bot'));
      setTimeout(() => typing(600, () => { add('Je peux t\'aider à quoi ?', 'bot'); showMenu(); }), 800);
    } else {
      typing(500, () => add('Salut ! 👋 Moi c\'est ' + NAME + ', la mascotte du portfolio de Justin.', 'bot'));
      setTimeout(() => typing(800, () => { add('Je peux t\'ouvrir ses projets, son CV ou la galerie. Qu\'est-ce que tu cherches ?', 'bot'); showMenu(); }), 1000);
    }
  }
  /* --- Chat libre avec l'IA (actif seulement si SITE.chatApi est renseigné) --- */
  const form = document.getElementById('msn-form');
  const input = document.getElementById('msn-input');
  const history = [];
  let busy = false;

  function runActions(text) {
    const ids = [];
    const clean = text.replace(/\[\[(\w+)\]\]/g, (_, id) => { if (REPLIES[id] && REPLIES[id].act) ids.push(id); return ''; }).trim();
    return { clean, ids };
  }
  function typeAdd(text) {                                    // la réponse s'écrit lettre par lettre
    const d = add('', 'bot');
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { d.textContent = text; return d; }
    let i = 0; const k = setInterval(() => { d.textContent = text.slice(0, ++i); log.scrollTop = log.scrollHeight; if (i >= text.length) clearInterval(k); }, 14);
    return d;
  }
  async function ask(text) {
    busy = true; form.querySelector('button').disabled = true;
    opts.innerHTML = '';
    add(text, 'me');
    history.push({ role: 'user', content: text });
    const wait = add('…', 'bot typing');
    try {
      const r = await fetch(SITE.chatApi, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.slice(-10), lang: window.lang ? window.lang() : 'fr', visits: window.Mascotte ? window.Mascotte.visits : 1 })
      });
      if (!r.ok) throw new Error(r.status);
      const data = await r.json();
      const { clean, ids } = runActions(String(data.reply || ''));
      wait.remove();
      typeAdd(clean || 'Je n\'ai pas compris, peux-tu reformuler ?', 'bot');
      history.push({ role: 'assistant', content: clean });
      ids.forEach(id => REPLIES[id].act());
    } catch (e) {
      wait.remove();
      add('Oups, je n\'arrive pas à répondre là. Utilise le formulaire pour écrire à Justin !', 'bot');
    }
    busy = false; form.querySelector('button').disabled = false;
    showMenu();
    input.focus();
  }
  if (form && SITE.chatApi) {
    form.classList.remove('hidden');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const v = input.value.trim();
      if (!v || busy) return;
      input.value = '';
      ask(v);
    });
  }

  document.addEventListener('win:open', e => { if (e.detail === 'window-msn') start(); });
})();
