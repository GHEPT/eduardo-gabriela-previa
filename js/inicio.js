/* =====================================================================
   inicio.js: roda no <head>, antes de pintar a página.
   1) aplica a paleta (CONFIG.paleta; em demo, ?paleta= sobrepõe)
   2) em demo, aceita fotos de teste pela URL (?foto1=… ou ?fotos=a,b,c)
   ===================================================================== */
(function () {
  var C = window.CONFIG || {}, html = document.documentElement;
  html.classList.add('js');
  var q; try { q = new URLSearchParams(location.search); } catch (e) { q = { get: function () { return null; } }; }

  var paleta = C.paleta;
  if (C.demo && q.get('paleta')) paleta = q.get('paleta').trim().toLowerCase();
  if ((C.paletas || []).indexOf(paleta) === -1) paleta = C.paletas ? C.paletas[0] : 'azul-amarelo';
  html.setAttribute('data-paleta', paleta);

  if (!C.demo) return;
  // só caminhos relativos, https, blob ou data:image: nada é enviado a lugar nenhum
  function ok(u) { return /^(https:\/\/|blob:|data:image\/|\.{0,2}\/?[\w-])/.test(u) && !/^\s*javascript:/i.test(u); }
  var lista = (q.get('fotos') || '').split(',');
  C.fotos = (C.fotos || []).slice();
  C.fotosPos = (C.fotosPos || []).slice();
  var trocouFoto = false;
  for (var i = 0; i < 3; i++) {
    var u = (q.get('foto' + (i + 1)) || lista[i] || '').trim();
    if (u && ok(u)) { C.fotos[i] = u; trocouFoto = true; }
    var p = q.get('pos' + (i + 1));
    if (p) C.fotosPos[i] = p;
  }
  if (trocouFoto) C.fotoFaixa = '';
})();
