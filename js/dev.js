/* =====================================================================
   dev.js: painel de testes. Só existe com CONFIG.demo = true E ?dev=1.
   • troca a paleta ao vivo (e atualiza ?paleta= na URL)
   • escolhe fotos locais (object URL: a foto NÃO sai do seu aparelho)
   • ajusta o enquadramento vertical de cada foto
   • copia os valores atuais dos tokens da paleta (para colar no CSS)
   ===================================================================== */
(function () {
  'use strict';
  var C = window.CONFIG || {};
  var q; try { q = new URLSearchParams(location.search); } catch (e) { return; }
  if (!C.demo || q.get('dev') !== '1') return;

  var html = document.documentElement;
  var css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'css/dev.css';
  document.head.appendChild(css);

  var painel = document.createElement('aside');
  painel.className = 'dev'; painel.setAttribute('aria-label', 'Painel de testes');
  var opcoes = (C.paletas || []).map(function (p) { return '<option value="' + p + '">' + p + '</option>'; }).join('');
  var fotos = [0, 1, 2].map(function (i) {
    return '<div class="dev-foto"><label>foto ' + (i + 1) + ' <input type="file" accept="image/*" data-i="' + i + '"></label>' +
      '<label class="dev-pos">altura <input type="range" min="0" max="100" value="' + posY(i) + '" data-pos="' + i + '"></label></div>';
  }).join('');
  painel.innerHTML =
    '<button type="button" class="dev-alterna" aria-expanded="false">testes</button>' +
    '<div class="dev-corpo" hidden>' +
      '<label class="dev-linha">paleta <select id="dev-paleta">' + opcoes + '</select></label>' +
      '<p class="dev-titulo">fotos locais (não são enviadas)</p>' + fotos +
      '<p class="dev-pos-saida" id="dev-pos-saida"></p>' +
      '<div class="dev-acoes"><button type="button" id="dev-copiar">copiar tokens</button>' +
      '<button type="button" id="dev-rever">rever abertura</button></div>' +
      '<textarea id="dev-saida" rows="5" readonly aria-label="Tokens da paleta atual" hidden></textarea>' +
    '</div>';
  document.body.appendChild(painel);

  var corpo = painel.querySelector('.dev-corpo'), alterna = painel.querySelector('.dev-alterna');
  alterna.addEventListener('click', function () {
    corpo.hidden = !corpo.hidden; alterna.setAttribute('aria-expanded', String(!corpo.hidden));
  });

  function posY(i) { var m = /(\d+(?:\.\d+)?)%\s*$/.exec((C.fotosPos || [])[i] || ''); return m ? m[1] : 0; }
  function urlCom(k, v) {
    var u = new URL(location.href); if (v == null) u.searchParams.delete(k); else u.searchParams.set(k, v);
    history.replaceState(null, '', u);
  }

  /* paleta ao vivo */
  var sel = painel.querySelector('#dev-paleta');
  sel.value = html.getAttribute('data-paleta');
  sel.addEventListener('change', function () {
    html.setAttribute('data-paleta', sel.value);
    urlCom('paleta', sel.value);
    if (window.Convite) window.Convite.corTema();
  });

  /* fotos locais: object URL, nunca enviadas */
  painel.addEventListener('change', function (e) {
    var t = e.target;
    if (t.type === 'file' && t.files && t.files[0] && window.Convite) {
      window.Convite.poeFoto(+t.dataset.i, URL.createObjectURL(t.files[0]));
    }
  });
  var saidaPos = painel.querySelector('#dev-pos-saida');
  painel.addEventListener('input', function (e) {
    var t = e.target; if (!t.dataset.pos) return;
    var i = +t.dataset.pos, fig = document.querySelectorAll('.foto')[i];
    var img = fig && fig.querySelector('img');
    C.fotosPos[i] = '50% ' + t.value + '%';
    if (img) img.style.objectPosition = C.fotosPos[i];
    saidaPos.textContent = "fotosPos: ['" + C.fotosPos.join("', '") + "']";
  });

  /* copia os valores --p-* da paleta atual, prontos para colar em css/paletas.css */
  function nomesPrimitivos() {
    var nomes = [];
    Array.prototype.forEach.call(document.styleSheets, function (s) {
      var regras; try { regras = s.cssRules; } catch (e) { return; }
      Array.prototype.forEach.call(regras || [], function (r) {
        if (!r.style || !/data-paleta/.test(r.selectorText || '')) return;
        for (var k = 0; k < r.style.length; k++) {
          var n = r.style[k]; if (n.indexOf('--p-') === 0 && nomes.indexOf(n) === -1) nomes.push(n);
        }
      });
    });
    return nomes;
  }
  var saida = painel.querySelector('#dev-saida');
  painel.querySelector('#dev-copiar').addEventListener('click', function () {
    var cs = getComputedStyle(html), nome = html.getAttribute('data-paleta');
    var txt = '[data-paleta="' + nome + '"]{\n' + nomesPrimitivos().map(function (n) {
      return '  ' + n + ':' + cs.getPropertyValue(n).trim() + ';';
    }).join('\n') + '\n}';
    saida.hidden = false; saida.value = txt; saida.select();
    if (navigator.clipboard) navigator.clipboard.writeText(txt).catch(function () {});
  });
  painel.querySelector('#dev-rever').addEventListener('click', function () {
    var u = new URL(location.href); u.hash = ''; location.href = u.toString();
  });
})();
