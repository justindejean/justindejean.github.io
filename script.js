/* =========================================================
   BUREAU MAC OS — horloge, icônes, fenêtres, menus
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Démarrage (Boot Screen XP) ---------- */
  // Le bureau n'apparaît qu'une fois la barre arrivée à 100 % (animationend), jamais avant.
  document.body.classList.add('booting');
  document.addEventListener("DOMContentLoaded", function() {
    const boot = document.getElementById('boot-screen');
    const bar = boot && boot.querySelector('.loading-progress');
    let returning = false;
    try { returning = localStorage.getItem('portfolioVu') === '1'; localStorage.setItem('portfolioVu', '1'); } catch (e) {}
    if (returning) document.body.dataset.returning = '1';
    let finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      setTimeout(() => {                         // petite pause à 100 %, puis fondu
        document.body.classList.remove('booting');
        if (boot) {
          boot.style.opacity = '0';
          setTimeout(() => { boot.style.display = 'none'; }, 520);
        }
      }, returning ? 100 : 450);
    }
    if (!boot || !bar) { finish(); return; }
    if (returning) bar.style.animationDuration = '0.5s';   // visiteur qui revient : démarrage express
    bar.addEventListener('animationend', finish);
    setTimeout(finish, 6000);                                // filet de sécurité
  });

  /* ---------- Horloge ---------- */
  const JOURS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const clock = document.getElementById('clock');
  function updateClock() {
    const now = new Date();
    if (clock) {
        clock.textContent = JOURS[now.getDay()] + ' ' +
          String(now.getHours()).padStart(2, '0') + ':' +
          String(now.getMinutes()).padStart(2, '0');
    }
  }
  updateClock();
  setInterval(updateClock, 10000);

  /* ---------- Fenêtres ---------- */
  let zTop = 10;
  const windows = Array.from(document.querySelectorAll('.window'));
  // taille et position « PC » d'origine, pour les retrouver quand l'écran s'agrandit (mobile -> PC, rotation, redimensionnement)
  windows.forEach(w => { w.dataset.dl = w.style.left; w.dataset.dt = w.style.top; w.dataset.dw = w.style.width; w.dataset.dh = w.style.height; });
  function restoreDefaults(win) {
    win.style.left = win.dataset.dl; win.style.top = win.dataset.dt;
    win.style.width = win.dataset.dw; win.style.height = win.dataset.dh;
    if (win.classList.contains('is-pdf')) win.style.width = 'min(860px, 94vw)';
    delete win.dataset.shrunk;
  }

  function focusWindow(win) {
    windows.forEach(w => w.classList.toggle('is-active', w === win));
    zTop++;
    win.style.zIndex = zTop;
  }

  function openWindow(id, item) {
    const win = document.getElementById(id);
    if (!win) return;
    const wasHidden = win.classList.contains('hidden');
    win.classList.remove('hidden', 'is-minimized');
    focusWindow(win);
    if (wasHidden) {
      win.classList.add('is-opening');
      setTimeout(() => win.classList.remove('is-opening'), 200);
      restoreDefaults(win);
      clampIntoView(win);
      if (isCompact()) phoneFit(win);   // mobile comme PC : fenêtre normale, recadrée dans l'écran (le bouton □ permet le plein écran)
    }
    document.dispatchEvent(new CustomEvent('win:open', { detail: id }));
    if (id === 'window-studio' && window.onStudioOpen) window.onStudioOpen();
    if (id !== 'window-studio') hideInvite();
    if (item) {
      win.querySelectorAll('.item').forEach(i => i.classList.remove('is-highlight'));
      const el = win.querySelector('#' + item);
      if (el) { el.classList.add('is-highlight'); el.scrollIntoView({ block: 'nearest' }); }
    }
  }

  function hideInvite() {
    const inv = document.getElementById('gallery-invite');
    if (inv) inv.classList.add('is-hidden');
  }

  function closeWindow(id) {
    const win = document.getElementById(id);
    if (!win) return;
    win.classList.add('hidden');
    win.classList.remove('is-active', 'is-minimized');
    document.dispatchEvent(new CustomEvent('win:close', { detail: id }));
    if (id === 'window-videos') {
      const tv = document.getElementById('tv-screen');
      if (tv) tv.innerHTML = '<div class="tv-menu tv-menu--center"><p class="tv-status">Téléviseur éteint.</p></div>';
    }
  }

  window.openWindow = openWindow;
  window.closeWindow = closeWindow;

  const TASKBAR_H = 32;
  const EDGE = 4;
  const isCompact = () => window.innerWidth <= 700 || window.innerHeight <= 520;   // téléphone (portrait ou paysage)

  /* Garde toute la fenêtre à l'écran, AU-DESSUS de la barre des tâches (jamais dessous) */
  function clampIntoView(win) {
    if (!win || win.dataset.zoomed) return;
    const maxW = window.innerWidth - 2 * EDGE;
    const maxH = window.innerHeight - TASKBAR_H - 2 * EDGE;
    // offsetWidth / offsetLeft : tailles de mise en page, non faussées par l'animation d'ouverture
    if (win.offsetWidth > maxW) { win.style.width = maxW + 'px'; win.dataset.shrunk = '1'; }
    if (win.offsetHeight > maxH) { win.style.height = maxH + 'px'; win.dataset.shrunk = '1'; }
    const w = win.offsetWidth, h = win.offsetHeight;
    win.style.left = Math.max(EDGE, Math.min(win.offsetLeft, window.innerWidth - w - EDGE)) + 'px';
    win.style.top = Math.max(EDGE, Math.min(win.offsetTop, window.innerHeight - TASKBAR_H - h - EDGE)) + 'px';
  }
  let phoneN = 0;
  function phoneFit(win) {                               // téléphone : vraie fenêtre posée sur le bureau, pas un plein écran
    if (win.dataset.zoomed) return;
    const vw = window.innerWidth, vh = window.innerHeight - TASKBAR_H;
    win.dataset.shrunk = '1';
    const w = Math.min(win.offsetWidth, vw - 28);
    win.style.width = w + 'px';
    const hMax = Math.round(vh * (vw > window.innerHeight ? 0.94 : 0.78));
    if (win.offsetHeight > hMax) win.style.height = hMax + 'px';
    win.style.left = Math.round((vw - w) / 2) + 'px';
    win.style.top = Math.round(Math.max(EDGE, Math.min(vh - win.offsetHeight - 8, 20 + (phoneN++ % 4) * 18))) + 'px';
    clampIntoView(win);
  }
  window.clampWin = clampIntoView;

  function fitMaximized(win) {
    win.style.left = '0px';
    win.style.top = '0px';
    win.style.width = window.innerWidth + 'px';
    win.style.height = (window.innerHeight - TASKBAR_H) + 'px';
  }
  function toggleMaximize(win) {
    if (win.dataset.zoomed) {
      win.style.left = win.dataset.zl;
      win.style.top = win.dataset.zt;
      win.style.width = win.dataset.zw;
      win.style.height = win.dataset.zh;
      delete win.dataset.zoomed;
      win.classList.remove('is-maximized');
      if (win.dataset.shrunk) { restoreDefaults(win); clampIntoView(win); if (isCompact()) phoneFit(win); }
    } else {
      win.dataset.zl = win.style.left;
      win.dataset.zt = win.style.top;
      win.dataset.zw = win.style.width;
      win.dataset.zh = win.style.height;
      win.dataset.zoomed = '1';
      win.classList.add('is-maximized');
      fitMaximized(win);
    }
    focusWindow(win);
  }
  function refitAll() {
    windows.forEach(w => {
      if (w.classList.contains('hidden')) return;
      if (w.dataset.zoomed) { fitMaximized(w); return; }
      if (w.dataset.shrunk) restoreDefaults(w);          // l'écran a changé : on repart de la taille d'origine
      clampIntoView(w);
      if (isCompact()) phoneFit(w);
    });
  }
  window.addEventListener('resize', refitAll);
  window.addEventListener('orientationchange', () => setTimeout(refitAll, 250));

  window.focusWindow = focusWindow;
  window.toggleMaximize = toggleMaximize;
  window.hideInvite = hideInvite;

  windows.forEach(win => {
    const min = win.querySelector('.min-btn');
    if (min) min.addEventListener('click', e => {
      e.stopPropagation();
      win.classList.add('is-minimized');
      win.classList.remove('is-active');
    });
    win.addEventListener('pointerdown', () => focusWindow(win));
    makeResizable(win);

    const close = win.querySelector('.close-btn');
    if (close) close.addEventListener('click', e => {
      e.stopPropagation();
      closeWindow(win.id);
    });

    // case de zoom / double-clic sur la barre de titre : vrai plein écran (au-dessus de la barre des tâches)
    const zoom = win.querySelector('.zoom-btn');
    if (zoom) zoom.addEventListener('click', e => { e.stopPropagation(); toggleMaximize(win); });
    const tb = win.querySelector('.title-bar');
    if (tb) tb.addEventListener('dblclick', e => {
      if (e.target.closest('.window-controls')) return;
      toggleMaximize(win);
    });
  });

  document.addEventListener('click', e => {
    const t = e.target.closest('#gallery-invite button, #taskbar-contact, a[data-window]');
    if (!t) return;
    e.preventDefault();
    openWindow(t.dataset.window);
    hideInvite();
  });
  // l'invitation disparaît seule pour les visiteurs qui reviennent
  try { if (localStorage.getItem('portfolioVu') === '1') setTimeout(hideInvite, 0); } catch (e) {}

  /* ---------- Variables Globales Bureau ---------- */
  const desktop = document.getElementById('desktop');
  
  /* ---------- Icônes du bureau ---------- */
  const coarse = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  document.querySelectorAll('.icon').forEach(icon => {
    const target = icon.dataset.window;

    icon.addEventListener('pointerdown', e => {
      icon._touch = e.pointerType !== 'mouse';          // doigt ou stylet détecté
      e.stopPropagation();
      document.querySelectorAll('.icon').forEach(i => i.classList.remove('is-selected'));
      icon.classList.add('is-selected');
    });

    icon.addEventListener('dblclick', () => target && openWindow(target));
    icon.addEventListener('click', () => { if ((coarse || icon._touch) && target) openWindow(target); });

    icon.tabIndex = 0;
    icon.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && target) { e.preventDefault(); openWindow(target); }
    });
  });

  if (desktop) {
      desktop.addEventListener('pointerdown', (e) => {
        // Ne désélectionne que si on clique sur le fond du bureau
        if(e.target === desktop) {
            document.querySelectorAll('.icon').forEach(i => i.classList.remove('is-selected'));
            windows.forEach(w => w.classList.remove('is-active'));
        }
      });
  }

  /* ---------- Déplacement des fenêtres ---------- */
  let dragWin = null, dx = 0, dy = 0;

  document.querySelectorAll('.title-bar').forEach(bar => {
    bar.addEventListener('pointerdown', e => {
      if (e.target.closest('.close-btn, .zoom-btn, .min-btn, .window-controls')) return;
      if (bar.parentElement.dataset.zoomed) return;
      dragWin = bar.parentElement;
      const r = dragWin.getBoundingClientRect();
      dx = e.clientX - r.left;
      dy = e.clientY - r.top;
      focusWindow(dragWin);
      bar.setPointerCapture(e.pointerId);
    });
    bar.addEventListener('pointerup', () => { dragWin = null; });
    bar.addEventListener('pointercancel', () => { dragWin = null; });
  });

  document.addEventListener('pointermove', e => {
    if (!dragWin) return;
    const r = dragWin.getBoundingClientRect();
    let left = e.clientX - dx;
    let top = e.clientY - dy;
    left = Math.max(0, Math.min(left, window.innerWidth - r.width));
    top = Math.max(0, Math.min(top, window.innerHeight - TASKBAR_H - r.height));
    dragWin.style.left = left + 'px';
    dragWin.style.top = top + 'px';
  });

  document.addEventListener('pointerup', () => { dragWin = null; });

  /* ---------- Menu Pomme / Menu Démarrer ---------- */
  const appleBtn = document.querySelector('.start-button') || document.querySelector('.apple-logo');
  const appleMenu = document.getElementById('apple-menu');

  function toggleAppleMenu(open) {
    if(!appleMenu) return;
    appleMenu.classList.toggle('hidden', !open);
    if(appleBtn) appleBtn.classList.toggle('is-open', open);
  }

  if(appleBtn) {
      appleBtn.addEventListener('pointerdown', e => {
        e.stopPropagation();
        toggleAppleMenu(appleMenu.classList.contains('hidden'));
      });
  }

  if(appleMenu) {
      appleMenu.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          toggleAppleMenu(false);
          if (btn.dataset.window) openWindow(btn.dataset.window);
        });
      });
  }

  const restartBtn = document.getElementById('btn-restart');
  if (restartBtn) restartBtn.addEventListener('click', e => {
    e.stopPropagation();
    location.reload();
  });

  const shutdownBtn = document.getElementById('btn-shutdown');
  if (shutdownBtn) shutdownBtn.addEventListener('click', e => {
    e.stopPropagation();
    toggleAppleMenu(false);
    if (window.showShutdown) window.showShutdown();
  });

  /* ---------- Redimensionnement ---------- */
  function makeResizable(win) {
    const handle = win.querySelector('.resize-handle') || document.createElement('div');
    if(!handle.parentElement) {
        handle.className = 'resize-handle';
        handle.setAttribute('aria-hidden', 'true');
        win.appendChild(handle);
    }

    const minW = parseInt(win.dataset.minWidth || 260, 10);
    const minH = parseInt(win.dataset.minHeight || 180, 10);
    let startW = 0, startH = 0, startX = 0, startY = 0, active = false;

    handle.addEventListener('pointerdown', e => {
      e.stopPropagation();
      e.preventDefault();
      const r = win.getBoundingClientRect();
      startW = r.width; startH = r.height;
      startX = e.clientX; startY = e.clientY;
      active = true;
      handle.setPointerCapture(e.pointerId);
      focusWindow(win);
    });

    handle.addEventListener('pointermove', e => {
      if (!active) return;
      const r = win.getBoundingClientRect();
      const maxW = window.innerWidth - r.left - 2;
      const maxH = window.innerHeight - TASKBAR_H - r.top - 2;
      const w = Math.max(minW, Math.min(maxW, startW + (e.clientX - startX)));
      const h = Math.max(minH, Math.min(maxH, startH + (e.clientY - startY)));
      win.style.width = w + 'px';
      win.style.height = h + 'px';
    });

    const stop = () => { active = false; };
    handle.addEventListener('pointerup', stop);
    handle.addEventListener('pointercancel', stop);
  }

  /* ==========================================
     RECTANGLE DE SÉLECTION WINDOWS XP
     ========================================== */
  if (desktop) {
      const selectionBox = document.createElement('div');
      selectionBox.id = 'selection-box';
      desktop.appendChild(selectionBox);

      let isSelecting = false;
      let selStartX = 0, selStartY = 0;

      desktop.addEventListener('mousedown', (e) => {
          if (e.target !== desktop) return;
          
          isSelecting = true;
          const rect = desktop.getBoundingClientRect();
          selStartX = e.clientX - rect.left;
          selStartY = e.clientY - rect.top;
          
          selectionBox.style.display = 'block';
          selectionBox.style.left = selStartX + 'px';
          selectionBox.style.top = selStartY + 'px';
          selectionBox.style.width = '0px';
          selectionBox.style.height = '0px';
      });

      window.addEventListener('mousemove', (e) => {
          if (!isSelecting) return;
          
          const rect = desktop.getBoundingClientRect();
          let currentX = e.clientX - rect.left;
          let currentY = e.clientY - rect.top;
          
          currentX = Math.max(0, Math.min(currentX, rect.width));
          currentY = Math.max(0, Math.min(currentY, rect.height));

          const boxLeft = Math.min(selStartX, currentX);
          const boxTop = Math.min(selStartY, currentY);
          const boxWidth = Math.abs(selStartX - currentX);
          const boxHeight = Math.abs(selStartY - currentY);

          selectionBox.style.left = boxLeft + 'px';
          selectionBox.style.top = boxTop + 'px';
          selectionBox.style.width = boxWidth + 'px';
          selectionBox.style.height = boxHeight + 'px';

          const boxRect = selectionBox.getBoundingClientRect();
          document.querySelectorAll('#desktop > .icon').forEach(icon => {
              const iconRect = icon.getBoundingClientRect();
              if (iconRect.left < boxRect.right && iconRect.right > boxRect.left &&
                  iconRect.top < boxRect.bottom && iconRect.bottom > boxRect.top) {
                  icon.classList.add('is-selected');
              } else {
                  icon.classList.remove('is-selected');
              }
          });
      });

      window.addEventListener('mouseup', () => {
          isSelecting = false;
          selectionBox.style.display = 'none';
      });
  }

  /* ==========================================
     GLISSER-DÉPOSER (BUREAU <-> CORBEILLE)
     ========================================== */
  const icons = document.querySelectorAll('.icon:not(#icon-trash)');
  const trashIcon = document.getElementById('icon-trash');
  const trashContent = document.querySelector('#window-trash .window-content');

  if (trashIcon && trashContent && desktop) {
      icons.forEach(icon => {
          icon.setAttribute('draggable', 'true');
          
          icon.addEventListener('dragstart', (e) => {
              e.dataTransfer.setData('text/plain', icon.id);
              
              if (!icon.classList.contains('is-selected')) {
                  document.querySelectorAll('.icon').forEach(i => i.classList.remove('is-selected'));
                  icon.classList.add('is-selected');
              }
              setTimeout(() => icon.style.opacity = '0.5', 0);
          });
          
          icon.addEventListener('dragend', () => {
              icon.style.opacity = '1';
          });
      });

      trashIcon.addEventListener('dragover', (e) => {
          e.preventDefault(); 
          trashIcon.style.filter = 'drop-shadow(0 0 8px rgba(255,255,255,0.8)) brightness(1.2)';
      });

      trashIcon.addEventListener('dragleave', () => {
          trashIcon.style.filter = '';
      });

      trashIcon.addEventListener('drop', (e) => {
          e.preventDefault();
          trashIcon.style.filter = '';
          
          const emptyMsg = trashContent.querySelector('p');
          if (emptyMsg) emptyMsg.style.display = 'none';

          document.querySelectorAll('.icon.is-selected').forEach(selectedIcon => {
              if (selectedIcon.id !== 'icon-trash') {
                  trashContent.appendChild(selectedIcon);
                  selectedIcon.classList.remove('is-selected'); 
              }
          });
      });

      desktop.addEventListener('dragover', (e) => {
          if (e.target === desktop) {
              e.preventDefault(); 
          }
      });

      desktop.addEventListener('drop', (e) => {
          if (e.target === desktop) {
              e.preventDefault();
              const draggedId = e.dataTransfer.getData('text/plain');
              const draggedIcon = document.getElementById(draggedId);
              
              if (draggedIcon && draggedIcon.parentElement === trashContent) {
                  desktop.insertBefore(draggedIcon, trashIcon);
                  
                  const emptyMsg = trashContent.querySelector('p');
                  if (trashContent.querySelectorAll('.icon').length === 0 && emptyMsg) {
                      emptyMsg.style.display = 'block';
                  }
              }
          }
      });
  }

})();