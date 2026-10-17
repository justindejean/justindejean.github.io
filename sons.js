/* Sons du bureau, synthétisés (aucun fichier audio). Coupés/activés avec le bouton 🔊 de la barre des tâches. */
(function () {
  'use strict';
  let ctx = null;
  let muted = false;
  try { const v = localStorage.getItem('sonCoupe'); muted = v === null ? true : v === '1'; } catch (e) {}

  function getCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function note(freq, start, dur, vol, type) {
    const c = getCtx(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.value = freq;
    const t0 = c.currentTime + start;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }
  window.Sons = {
    get muted() { return muted; },
    setMuted(v) { muted = v; try { localStorage.setItem('sonCoupe', v ? '1' : '0'); } catch (e) {} },
    startup() {               // petit carillon montant, composé pour ce site
      if (muted) return;
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => note(f, i * 0.16, 1.1, 0.12, 'sine'));
      [261.63, 392.0, 523.25].forEach(f => note(f, 0.64, 1.6, 0.07, 'triangle'));
    },
    error() {
      if (muted) return;
      note(440, 0, 0.18, 0.1, 'square'); note(330, 0.14, 0.3, 0.1, 'square');
    },
    click() { if (!muted) note(900, 0, 0.04, 0.05, 'square'); }
  };
})();
