/* =========================================================
   EFFET « VIEUX PC » (écran à tube cathodique) : lignes de balayage, vignettage, scintillement léger.
   Interrupteur : clic droit sur le bureau > « Effet vieux PC ». Le choix est gardé dans le navigateur.
   ========================================================= */
(function () {
  'use strict';
  const KEY = 'effet-crt';
  let on = true; try { on = localStorage.getItem(KEY) !== 'off'; } catch (e) {}
  const en = () => window.lang && window.lang() === 'en';

  const el = document.createElement('div');
  el.id = 'crt'; el.setAttribute('aria-hidden', 'true'); el.innerHTML = '<i class="crt-band"></i>' + (on ? '<i class="crt-on"></i>' : '');
  document.body.appendChild(el);
  const pw = el.querySelector('.crt-on'); if (pw) pw.addEventListener('animationend', () => pw.remove());   // l'allumage ne joue qu'une fois, au chargement

  const ctx = document.getElementById('ctx-menu');
  const btn = document.createElement('button');
  btn.type = 'button'; btn.dataset.act = 'crt';
  const anchor = ctx && ([...ctx.querySelectorAll('[data-theme]')].pop() || null);
  if (ctx) { if (anchor) anchor.insertAdjacentElement('afterend', btn); else ctx.appendChild(btn); }

  function paint() {
    el.classList.toggle('off', !on);
    btn.textContent = (en() ? 'Old-PC effect : ' : 'Effet vieux PC : ') + (on ? (en() ? 'on' : 'activé') : (en() ? 'off' : 'désactivé'));
  }
  btn.addEventListener('click', () => { on = !on; try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch (e) {} paint(); });
  document.addEventListener('langchange', paint);
  paint();
})();
