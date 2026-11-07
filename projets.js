/* =========================================================
   PROJETS — explorateur XP : les DOSSIERS (CATEGORIES) contiennent des FICHIERS (PROJETS).

   ➜ AUTOMATIQUE (rien à écrire) : crée un dossier dans projets/ (ex. projets/blender/), mets-y
     tes images / vidéos / PDF, envoie sur GitHub : le dossier et ses fichiers apparaissent tout seuls.
     Le titre vient du nom du fichier. Pour régler titre / description / logiciels, ajoute dans le
     dossier un fichier  dossier.json  (voir projets/LISEZMOI.txt). Un dossier « blender » reçoit
     d'office la pastille Blender.

   ➜ (OPTIONNEL) DÉCLARER UN FICHIER À LA MAIN — AJOUTER UNE LIGNE DANS UN DOSSIER EXISTANT
     1. Dépose le fichier dans  projets/<dossier>/   (ex. projets/avatar/mon-affiche.jpg)
     2. Ajoute UNE ligne dans la liste « FICHIERS » plus bas :
          fichier('avatar', 'mon-affiche.jpg', 'Mon affiche', 'Illustrator', 'Ma description.'),

   ➜ CRÉER UN NOUVEAU DOSSIER
     1. Crée le dossier  projets/<nom-du-dossier>/  et mets-y tes fichiers
     2. Ajoute tes lignes fichier('<nom-du-dossier>', ...) : le dossier apparaît tout seul
        (son nom affiché = le nom du dossier avec une majuscule). Pour choisir le nom affiché,
        la couleur ou un dossier différent de l'identifiant, ajoute une ligne dans CATEGORIES.

   ➜ La fonction  fichier(dossier, nomDuFichier, titre, applications, description, options)
     - dossier       : identifiant du dossier (voir CATEGORIES, ou nom du dossier dans projets/)
     - nomDuFichier  : le fichier dans projets/<dossier>/ — le type est deviné par l'extension :
                       jpg png gif webp svg = image · mp4 webm = vidéo · pdf = PDF
     - titre         : nom affiché sous l'icône
     - applications  : logiciels utilisés, ex. 'Illustrator'  ou  'Illustrator, InDesign'  ('' = aucun)
     - description   : texte à droite du nom ('' = rien)
     - options (facultatif) : { image, pages, lien, id, couleur, icone }
         image  : miniature d'une vidéo ou d'un PDF (défaut : <nomDuFichier>.jpg dans le même dossier)
         pages  : PDF affiché page par page → nombre de pages (images p-01.jpg, p-02.jpg… dans
                  projets/<dossier>/<nomDuFichier sans extension>/) ou { dir: '...', n: 24 }
         lien   : bouton « Voir le projet »
   ========================================================= */

/* Dossiers. id = identifiant utilisé dans fichier(...) · dossier = nom réel dans projets/ (défaut : id)
   Facultatif pour un nouveau dossier (créé automatiquement), utile pour le nom affiché et la couleur. */
const CATEGORIES = [
  { id: 'avatar', titre: 'Affiches',           couleur: '#f2c14e' },                              // dossier projets/avatar/
  { id: 'charte', titre: 'Chartes graphiques', couleur: '#e8315a', dossier: 'charte-graphique' },
  { id: 'robot',  titre: 'Robot collectif',    couleur: '#5f8c8c', dossier: 'robot-collectif' },
  { id: 'blender', titre: '3D',                couleur: '#e87d0d' }                               // dossier projets/blender/
  /* Idées d'autres dossiers (crée-les simplement dans projets/ ou ajoute une ligne ici) :
     Logos · Illustrations · Vidéo & motion · Web & maquettes · Photo · Réseaux sociaux */
];

/* FICHIERS — une ligne = un fichier. L'ordre ici = l'ordre dans le dossier. */
const PROJETS = [];
(function () {
  const EXT = { jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', webp: 'image', svg: 'image',
                mp4: 'video', webm: 'video', pdf: 'pdf' };
  const slug = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  function fichier(dossier, nom, titre, applications, description, o) {
    o = o || {};
    let cat = CATEGORIES.find(c => c.id === dossier);
    if (!cat) {                                              // dossier non déclaré : on le crée automatiquement
      const t = String(dossier).replace(/[-_]+/g, ' ');
      cat = { id: dossier, titre: t.charAt(0).toUpperCase() + t.slice(1), couleur: '#5f8c8c' };
      CATEGORIES.push(cat);
    }
    const dir = 'projets/' + (cat.dossier || cat.id) + '/';
    const base = nom.replace(/\.[^.]+$/, '');
    const ext = (nom.split('.').pop() || '').toLowerCase();
    const type = EXT[ext] || 'image';
    const p = {
      id: o.id || slug(base), cat: cat.id, titre: titre || base, type: type, src: dir + nom,
      image: o.image || (type === 'image' ? dir + nom : dir + base + '.jpg'),
      couleur: o.couleur || cat.couleur || '#5f8c8c',
      icone: o.icone || (type === 'video' ? '▶' : '✎'),
      outils: Array.isArray(applications) ? applications : String(applications || '').split(',').map(s => s.trim()).filter(Boolean),
      description: description || ''
    };
    if (o.pages) p.pages = typeof o.pages === 'number' ? { dir: dir + base + '/p-', n: o.pages } : o.pages;
    if (o.lien) p.lien = o.lien;
    PROJETS.push(p);
  }

  /* ================= TES FICHIERS (ajoute tes lignes ici) ================= */

  /* ---- Avatar ---- */
  fichier('avatar', 'wallpaper.jpg', 'Wallpaper de moi', 'Illustrator',
    'Illustration vectorielle de mon avatar dans les rues de Caen.');
  fichier('avatar', 'art-deco.jpg', 'Art Déco', 'Illustrator',
    'Affiche de style Art déco.', { couleur: '#d12b1f' });

  /* ---- Charte Graphique ---- */
  fichier('charte', 'charte-mmi-saint-lo.pdf', 'Charte MMI Saint-Lô', 'Illustrator, InDesign',
    'Charte graphique vectorisée du département MMI de Saint-Lô (PDF, 24 pages).',
    { id: 'charte-mmi', pages: { dir: 'projets/charte-graphique/mmi/p-', n: 24 }, couleur: '#1b2036' });
  fichier('charte', 'charte-mediarte.pdf', 'Charte Médiarte', 'Illustrator, InDesign',
    'Charte graphique Médiarte (PDF, 28 pages).',
    { id: 'charte-mediarte', pages: { dir: 'projets/charte-graphique/mediarte/p-', n: 28 } });

  /* ---- Robot collectif ---- */
  fichier('robot', 'robot-collectif.mp4', 'Robot Collectif (vidéo)', 'Premiere Pro',
    'Vidéo animée du projet collectif sur les robots domestiques.',
    { id: 'robot-video', image: 'projets/robot-collectif/robot-collectif-poster.jpg' });
  fichier('robot', 'robot-illustrator.jpg', 'Robot Collectif Illustrator', 'Illustrator',
    'Illustrations du robot réalisées pour la vidéo.', { id: 'robot-illustrator' });
  fichier('robot', 'articles-neo.jpg', 'Articles Néo', '',
    'Page d\'article sur le robot Néo.', { id: 'robot-articles' });
  fichier('robot', 'coin-ia-neo.jpg', 'Coin IA Néo', '',
    'Page « Coin IA » sur le robot Néo.', { id: 'robot-coin-ia' });

  /* ---- Exemple de NOUVEAU dossier (décommente pour tester) ----
  fichier('web', 'mon-site.jpg', 'Mon site', 'Figma, VS Code', 'Maquette et intégration.', { lien: 'https://exemple.fr' });
  */
})();

/* ---- DOSSIERS AUTOMATIQUES : tout dossier créé dans projets/ apparaît tout seul ----
   1) au chargement : liste de secours projets-auto.js (générée par GitHub à chaque envoi)
   2) ensuite : lecture en direct du dépôt GitHub (voir tout en bas) → affichage immédiat, sans attendre.
   Les fichiers déjà déclarés avec fichier(...) plus haut ne sont pas ajoutés deux fois. */
window.fusionnerProjets = function (AUTO, remplacer) {
  const slug = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const COULEURS = ['#5f8c8c', '#8a5a3b', '#4e9e56', '#3f6fd8', '#d94f5c', '#f2c14e'];
  const deja = new Set(PROJETS.map(p => p.key || p.src));
  const vus = new Set();
  AUTO.forEach((d, i) => {
    let cat = CATEGORIES.find(c => (c.dossier || c.id) === d.dossier);
    if (!cat) {
      cat = { id: d.dossier, titre: d.titre, couleur: d.couleur || COULEURS[i % COULEURS.length], dossier: d.dossier, auto: true };
      CATEGORIES.push(cat);
    }
    const dir = 'projets/' + d.dossier + '/';
    d.fichiers.forEach(f => {
      const key = dir + f.nom;
      vus.add(key);
      if (deja.has(key)) return;
      const b = f.nom.replace(/\.[^.]+$/, '');
      const p = { id: slug(d.dossier + '-' + b), key: key, auto: true, cat: cat.id, titre: f.titre, type: f.type, src: encodeURI(key),
        image: f.image ? encodeURI(dir + f.image) : (f.type === 'image' ? encodeURI(key) : ''),
        couleur: cat.couleur || '#5f8c8c', icone: f.type === 'video' ? '▶' : f.type === 'pdf' ? '📄' : '✎',
        outils: f.outils || [], description: f.description || '' };
      if (f.pages) p.pages = { dir: encodeURI(dir + b) + '/p-', n: f.pages };
      PROJETS.push(p);
    });
  });
  if (remplacer) {                                           // lecture en direct : on retire ce qui n'existe plus
    for (let k = PROJETS.length - 1; k >= 0; k--) if (PROJETS[k].auto && !vus.has(PROJETS[k].key)) PROJETS.splice(k, 1);
    for (let k = CATEGORIES.length - 1; k >= 0; k--) if (CATEGORIES[k].auto && !PROJETS.some(p => p.cat === CATEGORIES[k].id)) CATEGORIES.splice(k, 1);
  }
};
window.fusionnerProjets(window.PROJETS_AUTO || []);

(function () {
  'use strict';
  const byId = id => PROJETS.find(p => p.id === id);

  function esc(s) {
    return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  /* ---- Loupe plein écran : molette / boutons / pincement pour zoomer, glisser pour déplacer, ◀ ▶ entre les pages ---- */
  let lb = null;
  const pageSrc = (pg, i) => pg.dir + String(i + 1).padStart(2, '0') + '.jpg';
  function openLightbox(list, start, title) {
    if (!lb) {
      lb = document.createElement('div');
      lb.className = 'lightbox hidden';
      lb.innerHTML = '<div class="lb-bar"><span class="lb-title"></span><span class="lb-count"></span>' +
        '<button type="button" data-z="prev" title="Page précédente">◀</button><button type="button" data-z="next" title="Page suivante">▶</button>' +
        '<button type="button" data-z="out" title="Dézoomer">−</button><button type="button" data-z="in" title="Zoomer">+</button>' +
        '<button type="button" data-z="fit" title="Ajuster">1:1</button><button type="button" data-z="close" title="Fermer (Échap)">×</button></div>' +
        '<div class="lb-stage"><img class="lb-img" alt="" draggable="false"></div>';
      document.body.appendChild(lb);
    }
    const stage = lb.querySelector('.lb-stage'), im = lb.querySelector('.lb-img');
    lb.querySelector('.lb-title').textContent = title || '';
    lb.classList.remove('hidden');
    lb.classList.toggle('single', list.length < 2);
    let idx = start || 0, sc = 1, tx = 0, ty = 0;
    const apply = () => { im.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + sc + ')'; };
    function fit() { sc = 1; tx = 0; ty = 0; apply(); }
    function show(i) {
      idx = (i + list.length) % list.length;
      im.src = list[idx]; fit();
      lb.querySelector('.lb-count').textContent = list.length > 1 ? (idx + 1) + ' / ' + list.length : '';
    }
    function close() { lb.classList.add('hidden'); im.removeAttribute('src'); document.removeEventListener('keydown', onKey); }
    function onKey(e) {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight' && list.length > 1) show(idx + 1);
      else if (e.key === 'ArrowLeft' && list.length > 1) show(idx - 1);
      else if (e.key === '+' || e.key === '=') zoomAt(1.4, 0, 0);
      else if (e.key === '-') zoomAt(1 / 1.4, 0, 0);
    }
    document.addEventListener('keydown', onKey);
    function zoomAt(f, cx, cy) {                   // zoom centré sur le point (cx, cy) relatif au centre de la scène
      const ns = Math.min(8, Math.max(0.5, sc * f)); f = ns / sc;
      tx = cx - (cx - tx) * f; ty = cy - (cy - ty) * f; sc = ns; apply();
    }
    const center = e => { const r = stage.getBoundingClientRect(); return [e.clientX - r.left - r.width / 2, e.clientY - r.top - r.height / 2]; };
    stage.onwheel = e => { e.preventDefault(); const [x, y] = center(e); zoomAt(e.deltaY < 0 ? 1.2 : 1 / 1.2, x, y); };
    stage.ondblclick = e => { if (sc > 1.05) fit(); else { const [x, y] = center(e); zoomAt(2.5, x, y); } };
    const ptrs = new Map(); let lastDist = 0;
    stage.onpointerdown = e => { stage.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]); lastDist = 0; stage.classList.add('drag'); };
    stage.onpointermove = e => {
      if (!ptrs.has(e.pointerId)) return;
      const prev = ptrs.get(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]);
      if (ptrs.size === 2) {                       // pincement
        const [a, b] = [...ptrs.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
        if (lastDist) { const r = stage.getBoundingClientRect(); zoomAt(d / lastDist, (a[0] + b[0]) / 2 - r.left - r.width / 2, (a[1] + b[1]) / 2 - r.top - r.height / 2); }
        lastDist = d;
      } else { tx += e.clientX - prev[0]; ty += e.clientY - prev[1]; apply(); }
    };
    stage.onpointerup = stage.onpointercancel = e => { ptrs.delete(e.pointerId); lastDist = 0; if (!ptrs.size) stage.classList.remove('drag'); };
    lb.onpointerdown = e => e.stopPropagation();      // un appui sur le fond sombre ne ferme rien et ne traverse pas vers le bureau
    lb.onclick = e => {
      const z = e.target.closest('[data-z]'); if (!z) return;
      const k = z.dataset.z;
      if (k === 'close') close(); else if (k === 'fit') fit();
      else if (k === 'prev') show(idx - 1); else if (k === 'next') show(idx + 1);
      else zoomAt(k === 'in' ? 1.4 : 1 / 1.4, 0, 0);
    };
    show(idx);
  }

  /* ---- Fiche projet : image à gauche, nom (+ description facultative) à droite ---- */
  function openProject(id) {
    const p = byId(id);
    const win = document.getElementById('window-projet');
    if (!p || !win) return;
    win.querySelector('.title-text').textContent = p.titre + ' — Visionneuse';
    const img = win.querySelector('.projet-image');
    const medias = p.medias && p.medias.length ? p.medias
      : p.src ? [{ type: p.type || 'image', src: p.src, poster: p.image, pages: p.pages, label: p.titre }]
      : (p.image ? [{ type: 'image', src: p.image }] : []);
    let strip = win.querySelector('.projet-medias');
    if (!strip) {
      strip = document.createElement('div');
      strip.className = 'projet-medias';
      img.parentNode.insertBefore(strip, img.nextSibling);
    }
    function showMedia(i) {
      const m = medias[i];
      win.classList.toggle('is-pdf', !!m && m.type === 'pdf');
      const big = !!m && m.type === 'pdf';
      win.style.width = big ? 'min(860px, 94vw)' : '600px';
      if (big) { win.style.top = '3%'; win.style.left = '12%'; }
      if (window.clampWin) window.clampWin(win);
      img.style.background = m ? '' : p.couleur;
      if (!m) { img.innerHTML = '<span>' + esc(p.icone) + '</span>'; return; }
      const zoomBtn = '<button type="button" class="zoom-open" title="Agrandir / zoomer">🔍 Agrandir</button>';
      if (m.type === 'video') {
        img.innerHTML = '<video controls preload="metadata" playsinline' + (m.poster ? ' poster="' + esc(m.poster) + '"' : '') +
          ' src="' + esc(m.src) + (m.poster ? '' : '#t=0.1') + '"></video>';
        img.onclick = null;
      } else if (m.type === 'pdf' && m.pages) {
        const srcs = Array.from({ length: m.pages.n }, (_, k) => pageSrc(m.pages, k));
        img.innerHTML = '<div class="pdf-pages">' + srcs.map((u, k) =>
          '<img class="zoomable" loading="lazy" data-k="' + k + '" src="' + esc(u) + '" alt="Page ' + (k + 1) + '">').join('') + '</div>' +
          '<a class="pdf-open" href="' + esc(m.src) + '" target="_blank" rel="noopener" download>⬇ Télécharger le PDF</a>';
        img.onclick = e => { const t = e.target.closest('img[data-k]'); if (t) openLightbox(srcs, +t.dataset.k, (m.label || p.titre)); };
      } else if (m.type === 'pdf') {
        img.innerHTML = (m.poster ? '<img src="' + esc(m.poster) + '" alt="">' : '<span>📄</span>') +
          '<a class="pdf-open" href="' + esc(m.src) + '" target="_blank" rel="noopener">⬇ Ouvrir le PDF</a>';
        img.onclick = null;
      } else {
        img.innerHTML = '<img class="zoomable" src="' + esc(m.src) + '" alt="' + esc(m.label || p.titre) + '">' + zoomBtn;
        img.onclick = e => { if (e.target.closest('.zoom-open, img.zoomable')) openLightbox([m.src], 0, m.label || p.titre); };
      }
      strip.querySelectorAll('button').forEach((b, k) => b.classList.toggle('on', k === i));
    }
    strip.innerHTML = medias.length > 1
      ? medias.map((m, i) => '<button type="button" data-i="' + i + '" title="' + esc(m.label || '') + '">' +
          (m.type === 'image' ? '<img src="' + esc(m.src) + '" alt="">'
            : m.poster ? '<img src="' + esc(m.poster) + '" alt="">' : '') +
          '<small>' + esc((m.type === 'video' ? '▶ ' : m.type === 'pdf' ? '📄 ' : '') + (m.label || '')) + '</small></button>').join('')
      : '';
    strip.style.display = medias.length > 1 ? '' : 'none';
    strip.onclick = e => { const b = e.target.closest('button[data-i]'); if (b) showMedia(+b.dataset.i); };
    showMedia(0);
    win.querySelector('.projet-nom').textContent = p.titre;
    const desc = win.querySelector('.projet-desc');
    desc.textContent = p.description || '';
    desc.style.display = p.description ? '' : 'none';
    const tags = win.querySelector('.projet-tags');
    tags.innerHTML = (p.outils || []).map(o => '<span>' + esc(o) + '</span>').join('');
    const lien = win.querySelector('.projet-lien');
    lien.style.display = p.lien ? '' : 'none';
    if (p.lien) lien.href = p.lien;
    window.openWindow('window-projet');
  }
  window.openProject = openProject;

  /* ---- Explorateur XP : racine = dossiers de catégories, dossier = fichiers ---- */
  const grid = document.getElementById('projets-grid');
  const addr = document.getElementById('exp-address');
  const btnBack = document.getElementById('exp-back');
  const btnUp = document.getElementById('exp-up');
  const details = document.getElementById('exp-details');
  const status = document.getElementById('exp-status');
  const winTitle = document.querySelector('#window-projets .title-text');
  let here = null;            // null = racine, sinon id de catégorie
  const history = [];

  const FOLDER_SVG = '<svg viewBox="0 0 56 48" width="56" height="48" aria-hidden="true">' +
    '<path d="M3,8 Q3,5 6,5 H20 L25,11 H50 Q53,11 53,14 V41 Q53,44 50,44 H6 Q3,44 3,41 Z" fill="#e8c35a" stroke="#a37a1c" stroke-width="1.5"/>' +
    '<path d="M3,17 H53 V41 Q53,44 50,44 H6 Q3,44 3,41 Z" fill="#f6dc86" stroke="#a37a1c" stroke-width="1.5"/></svg>';

  function render() {
    const cat = CATEGORIES.find(c => c.id === here);
    if (!cat) {
      grid.innerHTML = CATEGORIES.map(c => {
        const n = PROJETS.filter(p => p.cat === c.id).length;
        return '<button class="file" data-cat="' + esc(c.id) + '" data-info="' + n + ' élément' + (n > 1 ? 's' : '') + '">' +
          '<span class="file-icon">' + FOLDER_SVG + '</span>' +
          '<span class="file-name">' + esc(c.titre) + '</span></button>';
      }).join('');
      addr.textContent = 'C:\\Mes documents\\Projets';
      winTitle.textContent = 'Projets';
      status.textContent = CATEGORIES.length + ' objets';
      details.innerHTML = '<strong>Projets</strong><br>Dossier de fichiers';
    } else {
      const list = PROJETS.filter(p => p.cat === cat.id);
      grid.innerHTML = list.map(p =>
        '<button class="file" data-projet="' + esc(p.id) + '" data-info="Fiche projet">' +
          '<span class="file-icon thumb">' +
            (p.image ? '<img src="' + esc(p.image) + '" alt="">'
                     : p.type === 'video' ? '<video muted playsinline preload="metadata" src="' + esc(p.src) + '#t=0.1" style="width:100%;height:100%;object-fit:cover;pointer-events:none"></video>'
                     : '<span style="background:' + esc(p.couleur) + '">' + esc(p.icone) + '</span>') +
          '</span>' +
          '<span class="file-name">' + esc(p.titre) + '</span></button>'
      ).join('');
      addr.textContent = 'C:\\Mes documents\\Projets\\' + cat.titre;
      winTitle.textContent = cat.titre;
      status.textContent = list.length + ' objet' + (list.length > 1 ? 's' : '');
      details.innerHTML = '<strong>' + esc(cat.titre) + '</strong><br>Dossier de fichiers';
    }
    btnBack.disabled = history.length === 0;
    btnUp.disabled = here === null;
  }
  function goTo(id, push) {
    if (push !== false) history.push(here);
    here = id; render();
  }
  if (grid) {
    render();
    btnBack.addEventListener('click', () => { if (history.length) { here = history.pop(); render(); } });
    btnUp.addEventListener('click', () => { if (here !== null) goTo(null); });
    document.getElementById('exp-root').addEventListener('click', e => { e.preventDefault(); if (here !== null) goTo(null); });
    grid.addEventListener('click', e => {
      const f = e.target.closest('[data-cat]');
      if (f) goTo(f.dataset.cat);
    });
    grid.addEventListener('mouseover', e => {          // panneau « Détails » à gauche, comme dans XP
      const f = e.target.closest('.file');
      if (f) details.innerHTML = '<strong>' + f.querySelector('.file-name').innerHTML + '</strong><br>' + esc(f.dataset.info || '');
    });
    grid.addEventListener('mouseleave', () => {
      const cat = CATEGORIES.find(c => c.id === here);
      details.innerHTML = '<strong>' + esc(cat ? cat.titre : 'Projets') + '</strong><br>Dossier de fichiers';
    });
  }

  window.rafraichirProjets = function () { if (grid) render(); };
  window.openProjectFolder = function (catId) { if (grid) goTo(catId); window.openWindow('window-projets'); };

  // clic sur un fichier du dossier, ou sur un élément de la liste vidéos
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-projet]');
    if (!t) return;
    e.preventDefault();
    openProject(t.dataset.projet);
  });
})();

/* ---- LECTURE EN DIRECT DU DÉPÔT : les dossiers/fichiers ajoutés dans projets/ s'affichent sans rien faire d'autre ----
   Dépôt lu : justindejean/justindejean.github.io (modifiable ci-dessous). Un seul appel à l'API GitHub, mis en cache 1 min.
   Si l'API est indisponible, la liste de secours projets-auto.js reste affichée. */
(function () {
  'use strict';
  const owner = 'justindejean', repo = 'justindejean.github.io';   // ton dépôt GitHub (fonctionne aussi hors github.io)
  const TYPES = { jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', webp: 'image', svg: 'image', mp4: 'video', webm: 'video', pdf: 'pdf' };
  const LOGICIELS = { blender: 'Blender', illustrator: 'Illustrator', photoshop: 'Photoshop', indesign: 'InDesign',
    premiere: 'Premiere Pro', 'premiere-pro': 'Premiere Pro', 'after-effects': 'After Effects', figma: 'Figma',
    lightroom: 'Lightroom', 'davinci-resolve': 'DaVinci Resolve', 'cinema-4d': 'Cinema 4D', unity: 'Unity' };
  const joli = s => { s = s.replace(/[-_]+/g, ' ').trim(); return s.charAt(0).toUpperCase() + s.slice(1); };
  const liste = v => Array.isArray(v) ? v : String(v || '').split(',').map(x => x.trim()).filter(Boolean);
  const nat = (a, b) => a.localeCompare(b, 'fr', { numeric: true });
  const base = f => f.replace(/\.[^.]+$/, '');
  const ext = f => f.split('.').pop().toLowerCase();

  async function lireArbre() {
    const CLE = 'projets-arbre-v1';
    try { const c = JSON.parse(localStorage.getItem(CLE) || 'null'); if (c && Date.now() - c.t < 60000) return c.chemins; } catch (e) {}
    for (const br of ['main', 'master']) {
      try {
        const r = await fetch('https://api.github.com/repos/' + owner + '/' + repo + '/git/trees/' + br + '?recursive=1');
        if (!r.ok) { console.warn('[projets] API GitHub : erreur ' + r.status + ' (' + br + ')'); continue; }
        const j = await r.json();
        const chemins = (j.tree || []).filter(t => t.type === 'blob' && t.path.indexOf('projets/') === 0).map(t => t.path);
        try { localStorage.setItem(CLE, JSON.stringify({ t: Date.now(), chemins: chemins })); } catch (e) {}
        return chemins;
      } catch (e) {}
    }
    return null;
  }

  async function construire(chemins) {
    const dossiers = {};
    chemins.forEach(c => {
      const parts = c.split('/');                                // projets / dossier / fichier  (ou / sous-dossier / p-01.jpg)
      if (parts.length < 3) return;
      (dossiers[parts[1]] = dossiers[parts[1]] || []).push(parts.slice(2));
    });
    const noms = Object.keys(dossiers).sort(nat);
    const metas = {};
    await Promise.all(noms.filter(n => dossiers[n].some(x => x.length === 1 && x[0] === 'dossier.json')).map(async n => {
      try { const r = await fetch('projets/' + encodeURI(n) + '/dossier.json', { cache: 'no-store' }); if (r.ok) metas[n] = await r.json(); } catch (e) {}
    }));
    return noms.map(nom => {
      const meta = metas[nom] || {};
      const fichiers = dossiers[nom].filter(x => x.length === 1).map(x => x[0]).sort(nat);
      const gros = new Set(fichiers.filter(f => ['pdf', 'video'].includes(TYPES[ext(f)])).map(base));
      const outilsDossier = liste(meta.outils).length ? liste(meta.outils) : liste(LOGICIELS[nom.toLowerCase()]);
      const items = [];
      fichiers.forEach(f => {
        const type = TYPES[ext(f)]; if (!type) return;
        const b = base(f);
        if (type === 'image' && (gros.has(b) || (b.endsWith('-poster') && gros.has(b.slice(0, -7))))) return;
        const m = (meta.fichiers && meta.fichiers[f]) || {};
        const it = { nom: f, titre: m.titre || joli(b), type: type,
          outils: m.outils !== undefined ? liste(m.outils) : outilsDossier, description: m.description || '' };
        if (type !== 'image') {
          const th = ['.jpg', '.png', '-poster.jpg', '-poster.png'].map(x => b + x).find(x => fichiers.includes(x));
          if (th) it.image = th;
        }
        if (type === 'pdf') {
          const n = dossiers[nom].filter(x => x.length === 2 && x[0] === b && /^p-\d+\.jpg$/i.test(x[1])).length;
          if (n) it.pages = n;
        }
        items.push(it);
      });
      return { dossier: nom, titre: meta.titre || joli(nom), couleur: meta.couleur || '', fichiers: items };
    }).filter(d => d.fichiers.length);
  }

  lireArbre().then(async chemins => {
    if (!chemins) { console.warn('[projets] lecture en direct impossible : liste de secours utilisée'); return; }
    window.fusionnerProjets(await construire(chemins), true);
    console.info('[projets] lecture en direct OK : ' + chemins.length + ' fichiers dans projets/');
    if (window.rafraichirProjets) window.rafraichirProjets();
  }).catch(() => {});
})();
