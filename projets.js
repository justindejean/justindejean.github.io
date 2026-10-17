/* =========================================================
   PROJETS — explorateur XP : les dossiers (CATEGORIES) contiennent des fichiers (PROJETS).
   Pour ajouter un fichier : dépose-le dans projets/<dossier>/ puis ajoute une ligne dans PROJETS.
   - cat         : id du dossier (voir CATEGORIES)
   - id, titre   : identifiant unique et nom affiché
   - type, src   : 'image' | 'video' | 'pdf' et chemin du fichier
   - image       : miniature (pour une vidéo ou un PDF : image d'aperçu)
   - description : texte à droite du nom ('' = rien). outils : pastilles de logiciels
   - lien        : (facultatif) bouton « Voir le projet »
   - couleur / icone : apparence si pas d'image
   ========================================================= */
const CATEGORIES = [
  { id: 'avatar', titre: 'Avatar',           couleur: '#f2c14e' },
  { id: 'charte', titre: 'Charte Graphique', couleur: '#e8315a' },
  { id: 'robot',  titre: 'Robot collectif',  couleur: '#5f8c8c' }
];

/* Chaque fichier = un élément du dossier `cat`. type : 'image' | 'video' | 'pdf' */
const PROJETS = [
  /* ---- Avatar ---- */
  { id: 'wallpaper', cat: 'avatar', titre: 'Wallpaper de moi', type: 'image', src: 'projets/avatar/wallpaper.jpg',
    image: 'projets/avatar/wallpaper.jpg', couleur: '#f2c14e', icone: '✎', outils: ['Illustrator'],
    description: 'Illustration vectorielle de mon avatar dans les rues de Caen.' },
  { id: 'art-deco', cat: 'avatar', titre: 'Art Déco', type: 'image', src: 'projets/avatar/art-deco.jpg',
    image: 'projets/avatar/art-deco.jpg', couleur: '#d12b1f', icone: '✎', outils: ['Illustrator'],
    description: 'Affiche de style Art déco.' },
  /* ---- Charte Graphique ---- */
  { id: 'charte-mmi', cat: 'charte', titre: 'Charte MMI Saint-Lô', type: 'pdf', src: 'projets/charte-graphique/charte-mmi-saint-lo.pdf',
    image: 'projets/charte-graphique/charte-mmi-saint-lo.jpg', pages: { dir: 'projets/charte-graphique/mmi/p-', n: 24 }, couleur: '#1b2036', icone: '✎', outils: ['Illustrator', 'InDesign'],
    description: 'Charte graphique vectorisée du département MMI de Saint-Lô (PDF, 24 pages).' },
  { id: 'charte-mediarte', cat: 'charte', titre: 'Charte Médiarte', type: 'pdf', src: 'projets/charte-graphique/charte-mediarte.pdf',
    image: 'projets/charte-graphique/charte-mediarte.jpg', pages: { dir: 'projets/charte-graphique/mediarte/p-', n: 28 }, couleur: '#e8315a', icone: '✎', outils: ['Illustrator', 'InDesign'],
    description: 'Charte graphique Médiarte (PDF, 28 pages).' },
  /* ---- Robot collectif ---- */
  { id: 'robot-video', cat: 'robot', titre: 'Robot Collectif (vidéo)', type: 'video', src: 'projets/robot-collectif/robot-collectif.mp4',
    image: 'projets/robot-collectif/robot-collectif-poster.jpg', couleur: '#5f8c8c', icone: '▶', outils: ['Premiere Pro'],
    description: 'Vidéo animée du projet collectif sur les robots domestiques.' },
  { id: 'robot-illustrator', cat: 'robot', titre: 'Robot Collectif Illustrator', type: 'image', src: 'projets/robot-collectif/robot-illustrator.jpg',
    image: 'projets/robot-collectif/robot-illustrator.jpg', couleur: '#5f8c8c', icone: '✎', outils: ['Illustrator'],
    description: 'Illustrations du robot réalisées pour la vidéo.' },
  { id: 'robot-articles', cat: 'robot', titre: 'Articles Néo', type: 'image', src: 'projets/robot-collectif/articles-neo.jpg',
    image: 'projets/robot-collectif/articles-neo.jpg', couleur: '#5f8c8c', icone: '✎',
    description: 'Page d\'article sur le robot Néo.' },
  { id: 'robot-coin-ia', cat: 'robot', titre: 'Coin IA Néo', type: 'image', src: 'projets/robot-collectif/coin-ia-neo.jpg',
    image: 'projets/robot-collectif/coin-ia-neo.jpg', couleur: '#5f8c8c', icone: '✎',
    description: 'Page « Coin IA » sur le robot Néo.' }
];

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
          ' src="' + esc(m.src) + '"></video>';
        img.onclick = null;
      } else if (m.type === 'pdf' && m.pages) {
        const srcs = Array.from({ length: m.pages.n }, (_, k) => pageSrc(m.pages, k));
        img.innerHTML = '<div class="pdf-pages">' + srcs.map((u, k) =>
          '<img class="zoomable" loading="lazy" data-k="' + k + '" src="' + esc(u) + '" alt="Page ' + (k + 1) + '">').join('') + '</div>' +
          '<a class="pdf-open" href="' + esc(m.src) + '" target="_blank" rel="noopener" download>⬇ Télécharger le PDF</a>';
        img.onclick = e => { const t = e.target.closest('img[data-k]'); if (t) openLightbox(srcs, +t.dataset.k, (m.label || p.titre)); };
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

  window.openProjectFolder = function (catId) { if (grid) goTo(catId); window.openWindow('window-projets'); };

  // clic sur un fichier du dossier, ou sur un élément de la liste vidéos
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-projet]');
    if (!t) return;
    e.preventDefault();
    openProject(t.dataset.projet);
  });
})();
