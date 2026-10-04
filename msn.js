/* Messenger : petit chat guidé pour orienter les visiteurs */
(function () {
  'use strict';
  const log = document.getElementById('msn-log');
  const opts = document.getElementById('msn-options');
  if (!log) return;
  let started = false;

  const MENU = [
    { id: 'projets',  label: '🎬 Voir tes projets' },
    { id: 'cv',       label: '📄 Voir ton CV' },
    { id: 'galerie',  label: '🖼 Visiter la galerie' },
    { id: 'musique',  label: '🎧 Écouter ta playlist' },
    { id: 'dispo',    label: '📅 Tu es dispo quand ?' },
    { id: 'contact',  label: '✉ Te contacter' }
  ];
  const REPLIES = {
    projets: { me: 'Voir tes projets', bot: 'Je t\'ouvre mes projets. Commence par le dossier Vidéo & Pub !',
               act: () => window.openProjectFolder && window.openProjectFolder('video') },
    cv:      { me: 'Voir ton CV', bot: 'Voilà mon CV. Dis-moi si un profil comme le mien t\'intéresse.',
               act: () => window.openWindow('window-cv') },
    galerie: { me: 'Visiter la galerie', bot: 'Bonne balade ! Regarde tous les tableaux.',
               act: () => window.openWindow('window-studio') },
    musique: { me: 'Écouter ta playlist', bot: 'Voici ce que j\'écoute en travaillant.',
               act: () => window.openWindow('window-musique') },
    dispo:   { me: 'Tu es dispo quand ?', bot: null,
               act: null },
    contact: { me: 'Te contacter', bot: 'Avec plaisir ! Je t\'ouvre le formulaire.',
               act: () => window.openWindow('window-contact') }
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
        add('Écris-moi pour en parler !', 'bot');
      } else add(r.bot, 'bot');
      if (r.act) r.act();
      setTimeout(() => typing(500, () => { add('Autre chose ?', 'bot'); showMenu(); }), 500);
    });
  }
  function start() {
    if (started) return;
    started = true;
    typing(500, () => add('Salut ! 👋 Moi c\'est Justin.', 'bot'));
    setTimeout(() => typing(700, () => { add('Qu\'est-ce que tu cherches ?', 'bot'); showMenu(); }), 900);
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
        body: JSON.stringify({ messages: history.slice(-10) })
      });
      if (!r.ok) throw new Error(r.status);
      const data = await r.json();
      const { clean, ids } = runActions(String(data.reply || ''));
      wait.remove();
      add(clean || 'Je n\'ai pas compris, peux-tu reformuler ?', 'bot');
      history.push({ role: 'assistant', content: clean });
      ids.forEach(id => REPLIES[id].act());
    } catch (e) {
      wait.remove();
      add('Oups, je n\'arrive pas à répondre là. Utilise le formulaire de contact !', 'bot');
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
