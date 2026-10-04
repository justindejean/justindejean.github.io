/* Navigateur Internet (style XP) : page d'accueil du portfolio + sites externes dans un cadre.
   Beaucoup de sites (Google, YouTube, Instagram…) refusent d'être affichés dans un cadre : un lien « Ouvrir dans un nouvel onglet » est donc toujours proposé. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  if (!$('nav-frame')) return;
  const frame = $('nav-frame'), home = $('nav-homepage'), url = $('nav-url'), status = $('nav-status'), hint = $('nav-hint'), ext = $('nav-ext');
  const back = $('nav-back'), fwd = $('nav-fwd');
  let hist = ['about:home'], pos = 0;

  function normalize(raw) {
    let v = raw.trim();
    if (!v || v === 'about:home') return { home: true };
    if (/\s/.test(v) || (!/[.:]/.test(v) && v !== 'localhost')) return { search: v };   // « chat mignon » → recherche
    if (!/^[a-z][a-z0-9+.-]*:/i.test(v)) v = 'https://' + v;
    v = v.replace(/^http:\/\//i, 'https://');                                              // le site est en https
    if (!/^https:\/\//i.test(v)) return { search: raw.trim() };                              // pas de javascript:, file:, etc.
    return { url: v };
  }
  function search(q) { window.open('https://duckduckgo.com/?q=' + encodeURIComponent(q), '_blank', 'noopener'); }
  function render() {
    const cur = hist[pos];
    url.value = cur;
    back.disabled = pos === 0; fwd.disabled = pos >= hist.length - 1;
    if (cur === 'about:home') {
      frame.classList.add('hidden'); frame.removeAttribute('src'); home.classList.remove('hidden');
      hint.classList.add('hidden'); status.textContent = 'Terminé';
    } else {
      home.classList.add('hidden'); frame.classList.remove('hidden');
      status.textContent = 'Ouverture de la page…';
      frame.src = cur; ext.href = cur; hint.classList.remove('hidden');
    }
  }
  function go(raw) {
    const n = normalize(raw);
    if (n.search) { search(n.search); return; }
    const target = n.home ? 'about:home' : n.url;
    if (target === hist[pos]) { render(); return; }
    hist = hist.slice(0, pos + 1); hist.push(target); pos++;
    render();
  }
  frame.addEventListener('load', () => { if (hist[pos] !== 'about:home') status.textContent = 'Terminé'; });
  $('nav-form').addEventListener('submit', e => { e.preventDefault(); go(url.value); });
  $('nav-search').addEventListener('submit', e => { e.preventDefault(); const q = $('nav-q').value.trim(); if (q) search(q); });
  back.addEventListener('click', () => { if (pos > 0) { pos--; render(); } });
  fwd.addEventListener('click', () => { if (pos < hist.length - 1) { pos++; render(); } });
  $('nav-home').addEventListener('click', () => go('about:home'));
  $('nav-reload').addEventListener('click', () => { if (hist[pos] !== 'about:home') { status.textContent = 'Ouverture de la page…'; frame.src = hist[pos]; } });

  // favoris configurables (config.js → liens)
  const favs = $('nav-favs');
  const liens = (typeof SITE !== 'undefined' && SITE.liens) || [];
  if (!liens.length) favs.parentElement.querySelectorAll('h4:last-of-type, #nav-favs').forEach(e => e.remove());
  liens.forEach(l => {
    const a = document.createElement('a'); a.href = '#'; a.textContent = '⭐ ' + l.titre;
    a.addEventListener('click', e => { e.preventDefault(); go(l.url); });
    favs.appendChild(a);
  });
  window.navGo = go;
})();
