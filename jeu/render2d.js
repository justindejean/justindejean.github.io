/* =========================================================
   RENDU 2D — tuiles, meubles en pixel art généré, personnage
   dessiné à partir de la vraie feuille de sprites (assets/character.png).
   ========================================================= */

/* ---------- Petits outils de dessin pixel art (canvas hors-écran) ---------- */
function cv(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return { c, g: c.getContext('2d') };
}
function R(g, x, y, w, h, color) { g.fillStyle = color; g.fillRect(x, y, w, h); }

function outline(c, g, w, h) {
  const img = g.getImageData(0, 0, w, h);
  const a = img.data;
  const out = g.createImageData(w, h);
  const o = out.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (a[i + 3] > 0) continue;
      let edge = false;
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        if (a[(ny * w + nx) * 4 + 3] > 0) { edge = true; break; }
      }
      if (edge) { o[i]=36; o[i+1]=28; o[i+2]=46; o[i+3]=255; }
    }
  }
  g.putImageData(img, 0, 0);
  g.save(); g.globalCompositeOperation = 'destination-over';
  const tmp = cv(w, h); tmp.g.putImageData(out, 0, 0);
  g.drawImage(tmp.c, 0, 0);
  g.restore();
}
function sprite(w, h, draw, noOutline) {
  const { c, g } = cv(w, h);
  draw(g);
  if (!noOutline) outline(c, g, w, h);
  return c;
}

/* ---------- Tuiles du décor (murs / sol) ---------- */
const TILES = {
  '#': sprite(TILE, TILE, g => R(g, 0, 0, TILE, TILE, C.ink), true),
  'W': sprite(TILE, TILE, g => { R(g, 0, 0, TILE, TILE, C.wall); R(g, 0, TILE - 2, TILE, 2, '#ded9cc'); }, true),
  'B': sprite(TILE, TILE, g => R(g, 0, 0, TILE, TILE, C.woodDark), true),
  '.': sprite(TILE, TILE, g => R(g, 0, 0, TILE, TILE, C.floor), true),
  ',': sprite(TILE, TILE, g => R(g, 0, 0, TILE, TILE, C.floorLight), true)
};

/* ---------- Meubles (pixel art généré) ---------- */
const artDoor = sprite(32, 48, g => {
  R(g, 0, 2, 32, 46, C.woodDark);
  R(g, 3, 5, 26, 43, C.wood);
  R(g, 6, 9, 20, 14, C.woodDark); R(g, 7, 10, 18, 12, C.woodLight);
  R(g, 6, 27, 20, 14, C.woodDark); R(g, 7, 28, 18, 12, C.woodLight);
  R(g, 24, 24, 3, 3, C.gold);
});
const artWindow = sprite(32, 48, g => {
  R(g, 0, 2, 32, 46, C.board);
  R(g, 4, 8, 24, 34, C.screenBlue);
  R(g, 4, 8, 24, 2, '#fff'); R(g, 4, 40, 24, 2, '#fff');
  R(g, 15, 8, 2, 34, '#fff');
});
const artBoard = sprite(32, 48, g => {
  R(g, 1, 4, 30, 40, '#c99a5c');
  R(g, 4, 7, 24, 34, '#dcae6d');
  R(g, 7, 11, 9, 7, C.cloth); R(g, 18, 10, 8, 8, C.metalLight);
  R(g, 8, 24, 14, 10, C.wall); R(g, 9, 36, 12, 3, C.gold);
});
const artTV = on => sprite(48, 32, g => {
  R(g, 2, 4, 44, 22, C.wood);
  R(g, 6, 8, 36, 14, on ? C.screenOn : C.screenOff);
  R(g, 20, 26, 8, 4, C.metal);
  R(g, 14, 30, 20, 2, C.metalLight);
});
const artCouch = sprite(48, 32, g => {
  R(g, 1, 10, 46, 20, C.leather);
  R(g, 1, 6, 46, 10, C.leather);
  R(g, 0, 8, 6, 24, '#141419'); R(g, 42, 8, 6, 24, '#141419');
});
/* ---------- Chat : vraie feuille d'animation (idle réutilisée en guise de marche) ---------- */
const catImg = new Image();
let catImgReady = false;
catImg.onload = () => { catImgReady = true; };
catImg.onerror = () => console.error('Sprite du chat introuvable : ' + catImg.src);
catImg.src = 'jeu/assets/cat/idle.png';
const CAT_FRAME = 32, CAT_FRAMES = 7;
const CAT_DRAW_W = 26, CAT_DRAW_H = 26;

function drawCatSprite(g, x, y, dir, animT) {
  if (!catImgReady) { const a = artCat(0); if (a) g.drawImage(a, x, y); return; }
  const col = Math.floor(animT / 140) % CAT_FRAMES;   // boucle en continu, ~140ms/frame
  const dx = x - (CAT_DRAW_W - TILE) / 2, dy = y - (CAT_DRAW_H - TILE) - 2;
  if (dir === 'left') {                               // la feuille regarde vers la droite par défaut
    g.save();
    g.translate(dx + CAT_DRAW_W, dy);
    g.scale(-1, 1);
    g.drawImage(catImg, col * CAT_FRAME, 0, CAT_FRAME, CAT_FRAME, 0, 0, CAT_DRAW_W, CAT_DRAW_H);
    g.restore();
  } else {
    g.drawImage(catImg, col * CAT_FRAME, 0, CAT_FRAME, CAT_FRAME, dx, dy, CAT_DRAW_W, CAT_DRAW_H);
  }
}

const artCat = frame => sprite(16, 16, g => {
  R(g, 3, 6, 10, 7, C.cat);
  R(g, 11, 4, 5, 5, C.cat);
  R(g, 13, 1, 2, 4, C.cat); R(g, 15, 1, 2, 4, C.cat);
  R(g, frame === 0 ? 0 : 1, 8, 4, 2, C.cat);
});
const artKitchen = sprite(32, 32, g => {
  R(g, 0, 8, 32, 24, C.wood);
  R(g, 0, 6, 32, 4, C.woodLight);
  R(g, 5, 12, 6, 6, C.ink); R(g, 20, 12, 6, 6, C.ink);
});
const artFridge = open => sprite(16, 32, g => {
  R(g, 1, 1, 14, 30, C.metalLight);
  R(g, 2, 6, 12, 1, C.metal);
  if (open) R(g, 11, 8, 3, 18, C.ink);
  else R(g, 11, 8, 2, 4, C.ink);
});
const artDesk = sprite(48, 32, g => {
  R(g, 0, 4, 48, 4, C.woodLight);
  R(g, 4, 8, 3, 22, C.wood); R(g, 41, 8, 3, 22, C.wood);
  R(g, 12, 10, 20, 14, C.screenBlue);
  R(g, 20, 24, 4, 3, C.metal);
});
const artShelf = sprite(32, 32, g => {
  R(g, 0, 0, 32, 32, C.wood);
  for (let i = 0; i < 3; i++) R(g, 2, 4 + i * 9, 28, 2, C.woodDark);
  const books = ['#d94f5c', '#f2c14e', '#4e9e56', '#8ec9f2', '#b06fd8'];
  for (let i = 0; i < 3; i++) for (let b = 0; b < 4; b++) R(g, 3 + b * 6, 6 + i * 9 - 4, 4, 4, books[(i * 4 + b) % books.length]);
});
const artPlant = sprite(16, 32, g => {
  R(g, 3, 22, 10, 8, C.pot);
  R(g, 5, 4, 6, 20, C.leaf);
  R(g, 1, 8, 6, 10, C.leafLight); R(g, 9, 6, 6, 10, C.leafLight);
});
const artBed = sprite(32, 48, g => {
  R(g, 1, 2, 30, 44, C.woodLight);
  R(g, 3, 4, 26, 40, C.cream);
  R(g, 4, 5, 24, 12, '#fff');
  R(g, 4, 17, 24, 26, C.cloth);
  R(g, 4, 21, 24, 2, '#b53a46'); R(g, 4, 30, 24, 2, '#b53a46');
  R(g, 1, 44, 30, 3, C.wood);
});
const artNightstand = on => sprite(16, 32, g => {
  R(g, 1, 20, 14, 11, C.wood);
  R(g, 6, 12, 4, 8, C.metal);
  R(g, 3, 4, 10, 9, on ? C.lamp : C.lampOff);
});
const artWardrobe = sprite(32, 48, g => {
  R(g, 1, 2, 30, 44, C.woodDark);
  R(g, 3, 4, 12, 40, C.wood); R(g, 17, 4, 12, 40, C.wood);
  R(g, 12, 20, 2, 4, C.gold); R(g, 18, 20, 2, 4, C.gold);
  R(g, 1, 44, 30, 3, C.woodDark);
});
const artSink = sprite(32, 32, g => {
  R(g, 3, 18, 26, 12, C.wood);
  R(g, 5, 8, 22, 11, '#fff');
  R(g, 7, 10, 18, 7, '#dfe8ee');
  R(g, 14, 3, 3, 6, C.metal);
});
const artToilet = sprite(16, 32, g => {
  R(g, 2, 4, 10, 8, '#fff');
  R(g, 1, 12, 12, 14, '#fff');
  R(g, 2, 14, 10, 10, '#dfe8ee');
  R(g, 0, 24, 14, 4, '#fff');
});
const artBathtub = sprite(48, 32, g => {
  R(g, 0, 4, 48, 4, '#fff');
  R(g, 1, 6, 46, 22, '#fff');
  R(g, 3, 8, 42, 18, '#dfe8ee');
  R(g, 6, 11, 36, 10, C.screenBlue);
});

/* ---------- Pack de déco intérieure n°1 (remplace certains meubles générés) ---------- */
const interiorImg = new Image();
let interiorReady = false;
interiorImg.onload = () => { interiorReady = true; };
interiorImg.onerror = () => console.error('Pack déco intérieure introuvable : ' + interiorImg.src);
interiorImg.src = 'jeu/assets/interior/cozy.png';   // chemin relatif à index.html

/* ---------- Pack de déco intérieure n°2 (lit, chevet, étagère, bureau) ---------- */
const interior2Img = new Image();
let interior2Ready = false;
interior2Img.onload = () => { interior2Ready = true; };
interior2Img.onerror = () => console.error('Pack déco intérieure (2) introuvable : ' + interior2Img.src);
interior2Img.src = 'jeu/assets/interior2/pixellands.png';

// id -> quelle feuille et quel rectangle source [sx, sy, sw, sh] y découper
const INTERIOR_SPRITES = {
  kitchen:    { img: () => interiorImg,  ready: () => interiorReady,  rect: [96, 0, 32, 32] },
  window:     { img: () => interiorImg,  ready: () => interiorReady,  rect: [128, 0, 32, 32] },
  couch:      { img: () => interiorImg,  ready: () => interiorReady,  rect: [34, 128, 60, 33] },
  plant:      { img: () => interiorImg,  ready: () => interiorReady,  rect: [73, 100, 14, 22] },
  sink:       { img: () => interiorImg,  ready: () => interiorReady,  rect: [33, 255, 30, 35] },
  toilet:     { img: () => interiorImg,  ready: () => interiorReady,  rect: [1, 255, 28, 33] },
  board:      { img: () => interiorImg,  ready: () => interiorReady,  rect: [7, 71, 18, 19] },
  painting:   { img: () => interiorImg,  ready: () => interiorReady,  rect: [7, 71, 18, 19] },
  bed:        { img: () => interior2Img, ready: () => interior2Ready, rect: [177, 37, 46, 59] },
  nightstand: { img: () => interior2Img, ready: () => interior2Ready, rect: [144, 44, 16, 36] },
  shelf:      { img: () => interior2Img, ready: () => interior2Ready, rect: [160, 121, 33, 56] },
  desk:       { img: () => interior2Img, ready: () => interior2Ready, rect: [192, 131, 47, 46] }
};
const DOOR_SPRITE = { img: () => interiorImg, ready: () => interiorReady, rect: [190, 329, 34, 55] };

const FLOOR_WOOD = { '.': [0, 352, 16, 16], ',': [16, 352, 16, 16] };   // salon, chambre
const FLOOR_TILE = { '.': [96, 352, 16, 16], ',': [112, 352, 16, 16] }; // salle de bain
function floorSetFor(roomId) { return roomId === 'bain' ? FLOOR_TILE : FLOOR_WOOD; }

function drawFurnitureAt(g, o) {
  if (o.id === 'cat') {                 // même sprite que le chat qui suit, orientation neutre (non retournée)
    drawCatSprite(g, o.x * TILE, o.y * TILE, 'right', frameCount * 16);
    return;
  }
  const isDoor = (o.id === 'door-exit' || o.id === 'door-link');
  const entry = isDoor ? DOOR_SPRITE : INTERIOR_SPRITES[o.id];
  if (entry && entry.ready()) {
    const [sx, sy, sw, sh] = entry.rect;
    g.drawImage(entry.img(), sx, sy, sw, sh, o.x * TILE, o.y * TILE, o.w * TILE, o.h * TILE);
    if (o.id === 'painting' && o.couleur) {        // chaque tableau a sa couleur et son icône
      const px = o.x * TILE, py = o.y * TILE, pw = o.w * TILE, ph = o.h * TILE;
      g.fillStyle = o.couleur;
      g.globalAlpha = 0.85;
      g.fillRect(px + 5, py + 6, pw - 10, ph - 16);
      g.globalAlpha = 1;
      g.fillStyle = '#fff';
      g.font = 'bold 12px monospace';
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(o.icone || '', px + pw / 2, py + ph / 2 - 3);
      g.textAlign = 'start'; g.textBaseline = 'alphabetic';
    }
    return;
  }
  const a = artFor(o);                  // pas encore chargé, ou pas de remplacement : dessin généré
  if (a) g.drawImage(a, o.x * TILE, o.y * TILE);
}

const artByRoomKind = {
  'door-exit': () => artDoor,
  'door-link': () => artDoor,
  window: () => artWindow,
  board: () => artBoard,
  painting: () => artBoard,
  couch: () => artCouch,
  kitchen: () => artKitchen,
  desk: () => artDesk,
  shelf: () => artShelf,
  plant: () => artPlant,
  bed: () => artBed,
  wardrobe: () => artWardrobe,
  sink: () => artSink,
  toilet: () => artToilet,
  bathtub: () => artBathtub
};
function artFor(o) {
  if (o.id === 'tv') return artTV(tvOn);
  if (o.id === 'fridge') return artFridge(fridgeOpen);
  if (o.id === 'nightstand') return artNightstand(lampOn);
  if (o.id === 'cat') return artCat((frameCount >> 5) & 1);
  return (artByRoomKind[o.id] || (() => null))();
}

/* ---------- Personnage : vraies frames dessinées (exportées individuellement, pas de devinette) ---------- */
const HERO_ANIM_FRAMES = { walk: 9, run: 8, jump: 5 };
const HERO_FRAME = 64;
const heroImgs = {};        // heroImgs.walk.up = HTMLImageElement (bande de 9 frames), etc.
let heroAssetsFailed = false;
['walk', 'run', 'jump'].forEach(anim => {
  heroImgs[anim] = {};
  ['up', 'down', 'left', 'right'].forEach(dir => {
    const img = new Image();
    img.onerror = () => {
      heroAssetsFailed = true;
      console.error('Sprite du personnage introuvable : ' + img.src);
    };
    img.src = `jeu/assets/character/${anim}_${dir}.png`;   // chemin relatif à index.html
    heroImgs[anim][dir] = img;
  });
});
function heroImgReady(anim, dir) {
  const img = heroImgs[anim][dir];
  return img.complete && img.naturalWidth > 0;
}

const HERO_DRAW_W = 34, HERO_DRAW_H = 34;      // taille affichée dans le jeu (~2 cases)

function drawHero(g, x, y) {
  let anim = 'walk';
  if (hero.jumping) anim = 'jump';
  else if (hero.running) anim = 'run';
  const dir = hero.dir;

  if (!heroImgReady(anim, dir)) {
    if (heroAssetsFailed) {             // sprite manquant : on affiche un repère plutôt que rien
      g.fillStyle = '#d94f5c';
      g.fillRect(x + 2, y - 14, TILE - 4, TILE + 10);
    }
    return;
  }

  const frames = HERO_ANIM_FRAMES[anim];
  const duration = anim === 'run' ? RUN_MS : anim === 'jump' ? JUMP_MS : WALK_MS;
  let col = 0;
  if (hero.jumping) {
    col = Math.min(frames - 1, Math.floor((hero.jumpT / JUMP_MS) * frames));
  } else if (hero.moving) {
    // le cycle complet s'étale sur 2 pas, synchronisé sur l'avancée réelle du pas
    // (hero.t / duration) — jamais désynchronisé du déplacement, donc pas d'effet de glisse.
    const k = Math.min(1, hero.t / duration);
    const half = frames / 2;
    const base = hero.stepPhase === 1 ? 0 : Math.ceil(half);
    col = base + Math.min(Math.floor(half) - 1, Math.floor(k * half));
  }

  g.drawImage(
    heroImgs[anim][dir],
    col * HERO_FRAME, 0, HERO_FRAME, HERO_FRAME,
    x - (HERO_DRAW_W - TILE) / 2, y - (HERO_DRAW_H - TILE) - 4, HERO_DRAW_W, HERO_DRAW_H
  );
}
