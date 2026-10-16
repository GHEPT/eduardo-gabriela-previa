/* =====================================================================
   pwa.js: service worker + dica discreta "Adicione à Tela de Início".
   • SW só em https (fora de localhost). ?sw=1 força; ?sw=0 remove.
   • Dica: só no Safari do iPhone/iPad, fora do modo app, depois de
     abrir o envelope; aparece uma vez e some para sempre ao fechar.
   ===================================================================== */
(function () {
  'use strict';
  var C = window.CONFIG || {};
  var q; try { q = new URLSearchParams(location.search); } catch (e) { q = { get: function () { return null; } }; }
  var local = /^(localhost|127\.|\[::1\])/.test(location.hostname);

  /* ---- service worker ---- */
  if ('serviceWorker' in navigator) {
    if (q.get('sw') === '0') {
      navigator.serviceWorker.getRegistrations().then(function (rs) { rs.forEach(function (r) { r.unregister(); }); });
    } else if (C.serviceWorker && (q.get('sw') === '1' || (location.protocol === 'https:' && !local))) {
      window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js', { scope: './' }).catch(function () {}); });
    }
  }

  /* ---- dica da Tela de Início (iOS Safari) ---- */
  var CHAVE = 'convite-dica-tela-inicio';
  var ua = navigator.userAgent || '';
  var ios = /iP(hone|od|ad)/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var safari = /Safari\//.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|GSA|Instagram|FBAN|FBAV|Line\/|WhatsApp|Snapchat/.test(ua);
  var app = navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
  var forca = C.demo && q.get('dica') === '1';
  var jaFechou = false; try { jaFechou = localStorage.getItem(CHAVE) === 'fechada'; } catch (e) {}
  if (!C.dicaTelaInicio || app || (!forca && (!ios || !safari || jaFechou))) return;

  var html = document.documentElement;
  function mostra() {
    var d = document.createElement('aside');
    d.className = 'dica-inicio'; d.setAttribute('role', 'note'); d.setAttribute('aria-label', 'Dica');
    d.innerHTML = '<p>Para guardar o convite como app: toque em <b>Compartilhar</b> e depois em <b>Adicionar à Tela de Início</b>.</p>' +
      '<button type="button" aria-label="Fechar dica">fechar</button>';
    document.body.appendChild(d);
    requestAnimationFrame(function () { d.classList.add('vis'); });
    d.querySelector('button').addEventListener('click', function () {
      try { localStorage.setItem(CHAVE, 'fechada'); } catch (e) {}
      d.remove();
    });
  }
  function depoisDeAbrir() { setTimeout(mostra, forca ? 300 : 6000); }
  if (!html.classList.contains('fechado')) depoisDeAbrir();
  else new MutationObserver(function (m, obs) {
    if (!html.classList.contains('fechado')) { obs.disconnect(); depoisDeAbrir(); }
  }).observe(html, { attributes: true, attributeFilter: ['class'] });
})();
