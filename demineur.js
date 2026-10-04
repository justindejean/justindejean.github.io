/* Démineur (9x9, 10 mines) — clic gauche : révéler, clic droit ou bouton 🚩 : drapeau */
(function () {
  'use strict';
  const W = 9, H = 9, M = 10;
  const grid = document.getElementById('mines-grid');
  if (!grid) return;
  const face = document.getElementById('mines-face');
  const cntEl = document.getElementById('mines-count');
  const timeEl = document.getElementById('mines-time');
  const flagBtn = document.getElementById('mines-flag');
  const msg = document.getElementById('mines-msg');
  let cells, started, over, flagsLeft, t, timer, flagMode = false;

  const idx = (x, y) => y * W + x;
  const neighbors = (x, y) => {
    const out = [];
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < W && ny < H) out.push([nx, ny]);
    }
    return out;
  };

  function reset() {
    clearInterval(timer);
    cells = Array.from({ length: W * H }, () => ({ m: false, o: false, f: false, n: 0 }));
    started = false; over = false; flagsLeft = M; t = 0;
    face.textContent = '🙂'; msg.textContent = '';
    draw();
  }
  function place(sx, sy) {
    let placed = 0;
    while (placed < M) {
      const x = Math.floor(Math.random() * W), y = Math.floor(Math.random() * H);
      if (Math.abs(x - sx) <= 1 && Math.abs(y - sy) <= 1) continue;   // premier clic toujours sûr
      if (cells[idx(x, y)].m) continue;
      cells[idx(x, y)].m = true; placed++;
    }
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      cells[idx(x, y)].n = neighbors(x, y).filter(([a, b]) => cells[idx(a, b)].m).length;
    }
  }
  function open(x, y) {
    const c = cells[idx(x, y)];
    if (c.o || c.f) return;
    c.o = true;
    if (c.n === 0 && !c.m) neighbors(x, y).forEach(([a, b]) => open(a, b));
  }
  function click(x, y, rightOrFlag) {
    if (over) return;
    const c = cells[idx(x, y)];
    if (rightOrFlag) {
      if (c.o) return;
      c.f = !c.f; flagsLeft += c.f ? -1 : 1;
      draw(); return;
    }
    if (c.f || c.o) return;
    if (!started) {
      started = true; place(x, y);
      timer = setInterval(() => { t++; timeEl.textContent = String(Math.min(t, 999)).padStart(3, '0'); }, 1000);
    }
    if (c.m) {
      over = true; clearInterval(timer); face.textContent = '😵';
      cells.forEach(k => { if (k.m) k.o = true; });
      c.boom = true;
      msg.textContent = 'Boum ! Rejoue avec 🙂.';
    } else {
      open(x, y);
      const opened = cells.filter(k => k.o).length;
      if (opened === W * H - M) {
        over = true; clearInterval(timer); face.textContent = '😎';
        msg.innerHTML = 'Gagné en ' + t + ' s ! Et si on travaillait ensemble ? <a href="#" data-window="window-contact">Me contacter</a>';
      }
    }
    draw();
  }
  function draw() {
    cntEl.textContent = String(Math.max(flagsLeft, 0)).padStart(3, '0');
    timeEl.textContent = String(Math.min(t, 999)).padStart(3, '0');
    grid.innerHTML = '';
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const c = cells[idx(x, y)];
      const b = document.createElement('button');
      b.className = 'mcell' + (c.o ? ' open' : '') + (c.boom ? ' boom' : '');
      if (c.o) { if (c.m) b.textContent = '💣'; else if (c.n) { b.textContent = c.n; b.dataset.n = c.n; } }
      else if (c.f) b.textContent = '🚩';
      b.addEventListener('click', () => click(x, y, flagMode));
      b.addEventListener('contextmenu', e => { e.preventDefault(); click(x, y, true); });
      grid.appendChild(b);
    }
  }
  face.addEventListener('click', reset);
  flagBtn.addEventListener('click', () => { flagMode = !flagMode; flagBtn.classList.toggle('on', flagMode); });
  reset();
})();
