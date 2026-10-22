/* =========================================================
   ÉCRAN CRT RÉALISTE
   - Chrome / Edge : vraie courbure « bombée » du contenu (filtre SVG de déplacement en backdrop-filter),
     halo lumineux, grille RVB, lignes de balayage, grain, scintillement, reflet, cadre arrondi, allumage.
   - Safari / Firefox / mobile : même rendu sans la courbure (ces navigateurs ne savent pas la faire).
   Clic droit sur le bureau > « Effet CRT » : complet > léger > désactivé. Le choix est mémorisé.
   ========================================================= */
(function () {
  'use strict';
  const KEY = 'effet-crt', NS = 'http://www.w3.org/2000/svg';
  const en = () => window.lang && window.lang() === 'en';
  const canWarp = /Chrome\/\d+/.test(navigator.userAgent) && !/Mobi|Android/.test(navigator.userAgent) && innerWidth <= 2600;
  const MODES = canWarp ? ['full', 'light', 'off'] : ['light', 'off'];
  let mode = MODES[0]; try { const v = localStorage.getItem(KEY); if (MODES.includes(v)) mode = v; } catch (e) {}

  const el = document.createElement('div');
  el.id = 'crt'; el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<i class="crt-warp"></i><i class="crt-glow"></i><i class="crt-scan"></i><i class="crt-noise"></i><i class="crt-glass"></i><i class="crt-band"></i>' + (mode !== 'off' ? '<i class="crt-on"></i>' : '');
  document.body.appendChild(el);
  const pw = el.querySelector('.crt-on'); if (pw) pw.addEventListener('animationend', () => pw.remove());   // l'allumage ne joue qu'une fois

  /* ---- grain analogique : une petite tuile de bruit déplacée par à-coups ---- */
  (function grain() {
    const c = document.createElement('canvas'); c.width = c.height = 96; const g = c.getContext('2d'), d = g.createImageData(96, 96);
    for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255 | 0; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    g.putImageData(d, 0, 0); el.querySelector('.crt-noise').style.backgroundImage = 'url(' + c.toDataURL('image/png') + ')';
  })();

  /* ---- courbure : filtre SVG qui pousse chaque point de l'écran vers le centre, d'autant plus qu'il est loin ---- */
  let svg, feImg, feDisp, resizeT;
  const K = 0.011;                                           // force de la courbure (0.011 = ~13 px au coin, assez pour se voir sans décaler les clics)
  function buildMap() {
    const w = innerWidth, h = innerHeight, cw = Math.ceil(w / 4), ch = Math.ceil(h / 4), S = 64;
    const c = document.createElement('canvas'); c.width = cw; c.height = ch; const g = c.getContext('2d'), d = g.createImageData(cw, ch);
    for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
      const u = (x + .5) / cw * 2 - 1, v = (y + .5) / ch * 2 - 1, r2 = u * u + v * v, k = K * r2;
      const dx = k * u * w / 2, dy = k * v * h / 2, i = (y * cw + x) * 4;
      d.data[i] = Math.max(0, Math.min(255, 127.5 + dx / S * 255)); d.data[i + 1] = Math.max(0, Math.min(255, 127.5 + dy / S * 255)); d.data[i + 2] = 127; d.data[i + 3] = 255;
    }
    g.putImageData(d, 0, 0);
    feImg.setAttribute('width', w); feImg.setAttribute('height', h);
    feImg.setAttribute('href', c.toDataURL('image/png')); feDisp.setAttribute('scale', S);
  }
  function setupWarp() {
    if (svg) return;
    svg = document.createElementNS(NS, 'svg'); svg.setAttribute('width', 0); svg.setAttribute('height', 0); svg.setAttribute('aria-hidden', 'true'); svg.style.cssText = 'position:fixed;left:0;top:0;pointer-events:none';
    svg.innerHTML = '<filter id="crt-warp" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">' +
      '<feImage x="0" y="0" width="100" height="100" preserveAspectRatio="none" result="map"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="map" scale="64" xChannelSelector="R" yChannelSelector="G"/></filter>';
    document.body.appendChild(svg);
    feImg = svg.querySelector('feImage'); feDisp = svg.querySelector('feDisplacementMap');
    buildMap();
    addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(buildMap, 200); });
  }

  /* ---- menu clic droit ---- */
  const ctx = document.getElementById('ctx-menu');
  const btn = document.createElement('button');
  btn.type = 'button'; btn.dataset.act = 'crt';
  const anchor = ctx && ([...ctx.querySelectorAll('[data-theme]')].pop() || null);
  if (ctx) { if (anchor) anchor.insertAdjacentElement('afterend', btn); else ctx.appendChild(btn); }

  const LBL = { full: ['complet', 'full'], off: ['désactivé', 'off'] };
  function paint() {
    if (mode === 'full') setupWarp();
    el.classList.toggle('off', mode === 'off'); el.classList.toggle('full', mode === 'full');
    btn.textContent = (en() ? 'CRT effect : ' : 'Effet CRT : ') + LBL[mode][en() ? 1 : 0];
  }
  btn.addEventListener('click', () => { mode = MODES[(MODES.indexOf(mode) + 1) % MODES.length]; try { localStorage.setItem(KEY, mode); } catch (e) {} paint(); });
  document.addEventListener('langchange', paint);
  paint();
})();
