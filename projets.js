/* =========================================================
   PROJETS — dossier XP + fiche projet
   Pour ajouter un projet : ajoute une ligne dans PROJETS.
   - cat         : dossier où range le projet ('video', 'graphisme' ou 'web', voir CATEGORIES)
   - id          : identifiant unique (utilisé par les tableaux de la galerie : champ `projet`)
   - titre       : nom affiché sous l'icône et sur la fiche
   - image       : chemin de l'image (ex. 'projets/hinge.jpg'). Laisse '' pour afficher un aperçu coloré.
   - description : texte à droite du nom. Laisse '' pour ne PAS afficher de description.
   - outils      : liste de logiciels/technos affichés en pastilles (ex. ['After Effects', 'Premiere'])
   - lien        : (facultatif) adresse du projet en ligne : un bouton « Voir le projet » apparaît
   - couleur / icone : apparence de l'aperçu quand il n'y a pas d'image
   ========================================================= */
const CATEGORIES = [
  { id: 'video',     titre: 'Vidéo & Pub', couleur: '#d94f5c' },
  { id: 'graphisme', titre: 'Graphisme',   couleur: '#f2c14e' },
  { id: 'web',       titre: 'Web',         couleur: '#3f6fd8' }
];

const PROJETS = [
  { id: 'hinge', cat: 'video',     titre: 'Spot Hinge',               image: '', couleur: '#d94f5c', icone: '▶', outils: ['After Effects', 'Premiere Pro'],
    description: 'Publicité de 30 s : scénario, storyboard, motion design sur After Effects et intégration sonore. (exemple fictif)' },
  { id: 'maree', cat: 'video',     titre: 'Marée basse',              image: '', couleur: '#3f6fd8', icone: '▶',
    description: 'Court-métrage de 8 minutes tourné sur la côte normande. (exemple fictif)' },
  { id: 'jazz', cat: 'graphisme',      titre: 'Affiche Caen Jazz',        image: '', couleur: '#f2c14e', icone: '✎',
    description: '' },   // pas de description : seule l'image et le nom s'affichent
  { id: 'mirabelle', cat: 'graphisme', titre: 'Café Mirabelle',           image: '', couleur: '#4e9e56', icone: '✎', outils: ['Illustrator'],
    description: 'Identité visuelle : logo, charte graphique et menus. (exemple fictif)' },
  { id: 'lumen', cat: 'web',     titre: 'Atelier Lumen',            image: '', couleur: '#8a5a3b', icone: '</>', outils: ['HTML', 'CSS', 'JavaScript'],
    description: 'Site vitrine responsive en HTML, CSS et JavaScript. (exemple fictif)' },
  { id: 'asso', cat: 'video',      titre: 'Teaser association',       image: '', couleur: '#8a6fd8', icone: '▶',
    description: 'Vidéo de 20 secondes pour les réseaux sociaux. (exemple fictif)' },
  { id: 'flyer',     cat: 'graphisme', titre: 'Flyer Soirée étudiante',  image: '', couleur: '#e0702f', icone: '✎',
    description: 'Flyer recto-verso pour le BDE. (exemple fictif)' },
  { id: 'meteo',     cat: 'web',       titre: 'Application Météo',       image: '', couleur: '#2f9ec9', icone: '</>',
    description: 'Mini-application JavaScript consommant une API météo. (exemple fictif)' }
];

(function () {
  'use strict';
  const byId = id => PROJETS.find(p => p.id === id);

  function esc(s) {
    return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  /* ---- Fiche projet : image à gauche, nom (+ description facultative) à droite ---- */
  function openProject(id) {
    const p = byId(id);
    const win = document.getElementById('window-projet');
    if (!p || !win) return;
    win.querySelector('.title-text').textContent = p.titre + ' — Visionneuse';
    const img = win.querySelector('.projet-image');
    img.style.background = p.image ? '' : p.couleur;
    img.innerHTML = p.image
      ? '<img src="' + esc(p.image) + '" alt="' + esc(p.titre) + '">'
      : '<span>' + esc(p.icone) + '</span>';
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
