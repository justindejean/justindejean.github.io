/* =========================================================
   Animations de fenêtres XP : ouverture depuis l'icône, réduction/restauration vers le bouton de la barre des tâches,
   agrandir/restaurer, fermeture. Transform/opacity uniquement (technique FLIP) : le drag et le resize ne sont pas touchés.
   Le module observe les classes des fenêtres, script.js n'est pas modifié. Émet aussi win:move / win:min / win:restore.
   ========================================================= */
(function () {
  'use strict';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const $ = id => document.getElementById(id);
  const wins = Array.from(document.querySelectorAll('.window'));
  const EASE = 'cubic-bezier(.2,.8,.2,1)';
  const emit = (n, d) => document.dispatchEvent(new CustomEvent(n, { detail: d }));
  const title = w => { const t = w.querySelector('.title-text'); return t ? t.textContent : ''; };
  const btnOf = w => Array.from(document.querySelectorAll('.taskbar-item')).find(b => b.textContent === title(w));
  const originOf = w => {
    const ic = document.querySelector('.icon[data-window="' + w.id + '"]');
    if (ic && ic.offsetParent) return ic.getBoundingClientRect();
    const b = btnOf(w); return b ? b.getBoundingClientRect() : null;
  };
  // transformation qui place la boîte "to" exactement sur la boîte "from"
  const tfm = (f, t) => 'translate(' + (f.left + f.width / 2 - t.left - t.width / 2) + 'px,' + (f.top + f.height / 2 - t.top - t.height / 2) + 'px) scale(' + (f.width / t.width) + ',' + (f.height / t.height) + ')';
  function play(w, frames, ms, done) {
    if (w._a) w._a.cancel();
    const a = w._a = w.animate(frames, { duration: ms, easing: EASE, fill: 'both' });
    a.onfinish = () => { if (w._a === a) { w._a = null; a.cancel(); if (done) done(); } };
  }
  // change une classe sans que l'observateur y voie un nouvel événement
  const setCls = (w, c, on) => { const k = { 'is-minimized': 'min', hidden: 'hid' }[c]; w._p[k] = on; w.classList.toggle(c, on); };

  document.addEventListener('win:open', e => {                       // ouverture
    const w = $(e.detail); if (!w || !w.classList.contains('is-opening')) return;
    const o = originOf(w);
    play(w, [{ transform: o ? tfm(o, w.getBoundingClientRect()) : 'scale(.9)', opacity: 0 }, { transform: 'none', opacity: 1 }], 240);
  });

  const mo = new MutationObserver(list => list.forEach(m => {
    const w = m.target, c = w.classList, p = w._p;
    const now = { min: c.contains('is-minimized'), hid: c.contains('hidden'), max: c.contains('is-maximized') };
    w._p = Object.assign({}, now);
    if (now.min && !p.min && !now.hid) {                             // réduction
      setCls(w, 'is-minimized', false);
      const r = w.getBoundingClientRect(), b = btnOf(w);
      const t = b ? b.getBoundingClientRect() : { left: r.left + r.width / 2, top: innerHeight - 30, width: 10, height: 10 };
      emit('win:min', w.id);
      play(w, [{ transform: 'none', opacity: 1 }, { transform: tfm(t, r), opacity: .15 }], 230, () => setCls(w, 'is-minimized', true));
    } else if (!now.min && p.min && !now.hid) {                      // restauration
      const r = w.getBoundingClientRect(), b = btnOf(w);
      emit('win:restore', w.id);
      if (b) play(w, [{ transform: tfm(b.getBoundingClientRect(), r), opacity: .15 }, { transform: 'none', opacity: 1 }], 230);
    } else if (now.hid && !p.hid && !p.min) {                        // fermeture
      setCls(w, 'hidden', false);
      play(w, [{ transform: 'none', opacity: 1 }, { transform: 'scale(.92)', opacity: 0 }], 160, () => setCls(w, 'hidden', true));
    } else if (now.max !== p.max && !now.hid && !now.min && w._last) {   // agrandir / restaurer
      const o = w._last, n = w.getBoundingClientRect();
      if (Math.abs(o.width - n.width) + Math.abs(o.height - n.height) + Math.abs(o.left - n.left) + Math.abs(o.top - n.top) > 4)
        play(w, [{ transform: tfm(o, n) }, { transform: 'none' }], 230);
    }
  }));
  const mv = new MutationObserver(list => list.forEach(m => {         // la fenêtre bouge : l'assistant peut la suivre
    const w = m.target;                                              // émis tout de suite (avant l'affichage) : Pixel et le cadre du tuto n'ont aucun retard
    if (!w.classList.contains('hidden')) emit('win:move', { id: w.id, rect: { left: w.offsetLeft, top: w.offsetTop, width: w.offsetWidth, height: w.offsetHeight } });
  }));
  wins.forEach(w => {
    const c = w.classList; w._p = { min: c.contains('is-minimized'), hid: c.contains('hidden'), max: c.contains('is-maximized') };
    w.addEventListener('pointerdown', () => { w._last = w.getBoundingClientRect(); }, true);
    mo.observe(w, { attributes: true, attributeFilter: ['class'] });
    mv.observe(w, { attributes: true, attributeFilter: ['style'] });
  });
})();
