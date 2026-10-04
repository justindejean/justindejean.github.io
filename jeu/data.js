/* =========================================================
   DONNÉES DU JEU — cartes, collisions, position des objets.
   Aucune dépendance à Three.js ici : uniquement de la logique.
   ========================================================= */

const TILE = 16;                    // unité "logique" (déplacement, collisions)
const WALK_MS = 180;
const RUN_MS = 110;
const JUMP_MS = 420;
const TURN_MS = 90;

const C = {
  ink: '#241c2e',
  wall: '#f2f0ea',
  board: '#efe3cd',
  floor: '#cf9a58', floorLight: '#e2b57e',
  wood: '#8a5a3b', woodLight: '#b07a45', woodDark: '#5e3a24',
  metal: '#40404f', metalLight: '#5a5a6e',
  screenOn: '#7fdcd0', screenBlue: '#8ec9f2', screenOff: '#1d2733',
  cloth: '#d94f5c', cream: '#f7ecd6',
  skin: '#f4c28c', hair: '#4a3526', hoodie: '#3f6fd8',
  pants: '#3a4257', shoe: '#23232f',
  leaf: '#4e9e56', leafLight: '#6cc46f', pot: '#c1663f',
  cat: '#e0913f', white: '#ffffff', gold: '#f2c14e',
  leather: '#1c1c22',
  lamp: '#ffe9b0', lampOff: '#8a7a52'
};

function buildMap(w, h) {
  const rows = [];
  rows.push('#'.repeat(w));
  rows.push('W'.repeat(w));
  rows.push('W'.repeat(w));
  rows.push('B'.repeat(w));
  for (let y = 4; y < h; y++) {
    let row = '';
    for (let x = 0; x < w; x++) row += ((x + y) % 2 === 0) ? '.' : ',';
    rows.push(row);
  }
  return rows;
}
const wrapX = (tx, w) => ((tx % w) + w) % w;   // le couloir est périodique : x se répète à l'infini
const isWall = (tx, ty) => {
  const r = currentRoom();
  if (ty < 0 || ty >= r.h) return true;
  const ch = r.map[ty][wrapX(tx, r.w)];
  return ch === '#' || ch === 'W' || ch === 'B';
};

/* ---------- Objets du décor ---------- */
// tx, ty en cases ; les tuiles du rect sont "interactives" et bloquent le passage.
// Couloir-galerie unique, qui boucle sur lui-même (on marche vers la droite indéfiniment
// et on revient au début) — le sentiment d'infini sans génération procédurale réelle.
/* ---------- TABLEAUX À PERSONNALISER ----------
   Un tableau = une entrée. Remplace les exemples fictifs par tes vrais travaux.
   - x       : position dans le couloir (en cases, doit rester < GALLERY_W)
   - titre   : titre affiché dans la bulle de dialogue
   - texte   : courte description
   - projet  : id d'un projet défini dans projets.js (ouvre sa fiche)
   - ouvre   : OU id d'une fenêtre du Mac ('window-cv', 'window-contact')
   - couleur / icone : apparence du tableau dans le couloir
   Le couloir se répète à l'infini : après le dernier tableau, tout se régénère. */
const GALLERY_W = 70;   // longueur d'un "tour" de couloir, en cases
const TABLEAUX = [
  { x: 8,  titre: 'Spot Hinge — publicité vidéo', texte: 'Scénario, storyboard et motion design sur After Effects. (exemple fictif)',
    projet: 'hinge', couleur: '#d94f5c', icone: '▶' },
  { x: 17, titre: 'Court-métrage « Marée basse »', texte: 'Huit minutes tournées sur la côte normande. (exemple fictif)',
    projet: 'maree', couleur: '#3f6fd8', icone: '▶' },
  { x: 26, titre: 'Affiche — Festival Caen Jazz', texte: 'Affiche A2 et déclinaisons réseaux sociaux. (exemple fictif)',
    projet: 'jazz', couleur: '#f2c14e', icone: '✎' },
  { x: 35, titre: 'Identité visuelle — Café Mirabelle', texte: 'Logo, charte graphique et menus. (exemple fictif)',
    projet: 'mirabelle', couleur: '#4e9e56', icone: '✎' },
  { x: 44, titre: 'Site web — Atelier Lumen', texte: 'Site vitrine responsive en HTML, CSS et JavaScript. (exemple fictif)',
    projet: 'lumen', couleur: '#8a5a3b', icone: '</>' },
  { x: 53, titre: 'Mon CV', texte: 'Formation, compétences et logiciels.',
    ouvre: 'window-cv', couleur: '#7fdcd0', icone: '☰' },
  { x: 62, titre: 'Un projet en tête ?', texte: 'Écris-moi, je réponds vite.',
    ouvre: 'window-contact', couleur: '#ff8fb1', icone: '✉' }
];
const rooms = {
  galerie: {
    w: GALLERY_W, h: 10, map: buildMap(GALLERY_W, 10),
    objects: [
      { id: 'door-exit', x: 2, y: 1, w: 2, h: 3 },
      ...TABLEAUX.map(t => Object.assign({ id: 'painting', y: 1, w: 2, h: 3 }, t))
    ]
  }
};
let currentRoomId = 'galerie';
const currentRoom = () => rooms[currentRoomId];

/* état des meubles à bascule (lu par render2d.js, écrit par jeu.js) */
let tvOn = false, fridgeOpen = false, lampOn = false;

function objectAt(tx, ty) {
  const r = currentRoom();
  const x = wrapX(tx, r.w);
  return r.objects.find(o => x >= o.x && x < o.x + o.w && ty >= o.y && ty < o.y + o.h);
}
function blocked(tx, ty) {
  if (isWall(tx, ty)) return true;
  return !!objectAt(tx, ty);
}
function goToRoom(roomId, gx, gy) {
  currentRoomId = roomId;
  hero.gx = gx; hero.gy = gy;
  hero.px = gx * TILE; hero.py = gy * TILE;
  hero.moving = false; hero.turnT = 0; hero.chainT = 0; hero.frame = 0;
}

/* ---------- État du joueur ---------- */
const hero = {
  gx: 3, gy: 4, px: 3 * TILE, py: 4 * TILE,   // juste devant la porte
  dir: 'down', moving: false, t: 0, fromX: 0, fromY: 0, toX: 0, toY: 0,
  stepPhase: 1, frame: 0, turnT: 0, chainT: 0, bumpT: 0,
  running: false, jumping: false, jumpT: 0
};
