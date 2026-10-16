/* =====================================================================
   main.js: comportamento do convite (sem dependências, sem build)
   Lê window.CONFIG (js/config.js). Cores: só via tokens CSS.
   Seções: envelope · fotos · contagem · calendário · programação ·
           RSVP · presentes · música · revelação ao rolar
   ===================================================================== */
(function () {
  'use strict';
  var C = window.CONFIG || {};
  var $ = function (id) { return document.getElementById(id); };
  var html = document.documentElement;
  var reduz = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }); };
  var quando = function (iso) { return Date.parse(iso); };

  /* --- cor da barra do navegador acompanha a paleta --- */
  /* fechado = cor da aba de cima (encosta na barra de status); aberto = papel */
  function corTema() {
    var m = document.querySelector('meta[name="theme-color"]');
    var t = html.classList.contains('fechado') ? '--cor-tema-envelope' : '--cor-tema-navegador';
    var v = getComputedStyle(html).getPropertyValue(t).trim();
    if (m && v) m.setAttribute('content', v);
  }
  corTema();

  /* --- tipo de convite: só "civil" muda algo; qualquer outro valor = convite geral --- */
  var p = '';
  try { p = (new URLSearchParams(location.search).get('convite') || '').trim().toLowerCase(); } catch (e) {}
  var civil = p === 'civil';

  /* ================= ENVELOPE ================= */
  var env = $('env'), bor = $('borboleta');
  /* sombra da borboleta: cópia do desenho, escurecida e desfocada pelo CSS */
  var bc = bor.querySelector('.b-corpo'), bs = bc.cloneNode(true);
  bs.className = 'b-sombra'; var dd = bs.querySelector('defs'); if (dd) dd.remove(); bor.insertBefore(bs, bc);

  function aberto() {
    html.classList.remove('fechado', 'abrindo');
    env.hidden = true; bor.hidden = true;
    corTema();
  }
  function abrir() {
    if (html.classList.contains('abrindo')) return;
    if (reduz) { aberto(); $('nomes').focus({ preventScroll: true }); return; }
    html.classList.add('abrindo');
    bor.classList.add('voa');
    $('abrir').disabled = true;
    setTimeout(function () { aberto(); $('nomes').focus({ preventScroll: true }); }, 4400);
    setTimeout(function () { env.style.pointerEvents = 'none'; }, 3400);
  }
  /* link direto para uma seção (ex.: #rsvp) pula o envelope */
  var alvoHash = null; try { alvoHash = location.hash && document.querySelector(location.hash); } catch (e) {}
  if (reduz || alvoHash) aberto(); else $('abrir').addEventListener('click', abrir);

  /* ================= FOTOS ================= */
  var figs = document.querySelectorAll('.foto');
  function poeFoto(i, u, pos) {
    var faixaEl = $('foto-faixa');
    if (faixaEl) { if (i === 0 && u) faixaEl.src = u; return; }
    var fig = figs[i]; if (!fig) return;
    var img = fig.querySelector('img');
    if (!u) return;
    if (!img) {
      img = new Image();
      img.alt = (C.fotosAlt && C.fotosAlt[i]) || ('Eduardo e Gabriela, foto ' + (i + 1));
      img.width = 560; img.height = 1244; img.decoding = 'async';
      fig.insertBefore(img, fig.firstChild);
    }
    img.src = u;
    if (pos) img.style.objectPosition = pos;
    fig.classList.add('tem-img');
    var r = fig.querySelector('.rotulo'); if (r) r.remove();
  }
  var faixa = $('foto-faixa');
  if (faixa && C.fotoFaixa) {
    if (C.fotoFaixaAlt) faixa.alt = C.fotoFaixaAlt;
    faixa.src = C.fotoFaixa;
  } else {
    (C.fotos || []).forEach(function (u, i) { poeFoto(i, u, C.fotosPos && C.fotosPos[i]); });
  }

  /* ================= CONTAGEM (Brasília, UTC-3) ================= */
  var D = C.datas || {};
  var alvo = quando(civil ? D.civil : D.almoco);
  var fimDoDia = quando(D.fimDoDia);
  var el = $('contagem'), u = {};
  el.querySelectorAll('b').forEach(function (b) { u[b.dataset.u] = b; });
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function tick() {
    var agora = Date.now(), r = alvo - agora;
    if (r <= 0) {
      el.innerHTML = '<span class="fim">' + (agora < fimDoDia ? 'Hoje celebramos.' : 'Celebramos em 11 de dezembro de 2026. Obrigado por fazer parte.') + '</span>';
      return;
    }
    var s = Math.floor(r / 1000);
    u.d.textContent = Math.floor(s / 86400);
    u.h.textContent = pad(Math.floor(s % 86400 / 3600));
    u.m.textContent = pad(Math.floor(s % 3600 / 60));
    u.s.textContent = pad(s % 60);
    setTimeout(tick, 1000 - agora % 1000 + 5);
  }
  tick();

  /* ================= CALENDÁRIO (dez/2026, dia da semana calculado) ================= */
  var g = $('cal-grid'), out = [];
  ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].forEach(function (d) { out.push('<span class="dow" aria-hidden="true">' + d + '</span>'); });
  var inicio = new Date(Date.UTC(2026, 11, 1)).getUTCDay(); // 2 = terça
  for (var i = 0; i < inicio; i++) out.push('<span aria-hidden="true"></span>');
  for (var d = 1; d <= 31; d++) {
    out.push(d === 11
      ? '<span class="d dia">11<svg viewBox="0 0 60 56" aria-hidden="true"><path class="coracao" d="M31 52C21 45 6 35 5 22C4 11 13 4.5 21 6.5C26 8 29 12 30.5 16.5C32 11 36.5 5.5 44 5C53 4.5 57.5 13 55 22.5C52 34 40 44 29.5 52.5"/></svg></span>'
      : '<span class="d">' + d + '</span>');
  }
  g.innerHTML = out.join('');
  g.dataset.inicio = inicio;

  /* ================= PROGRAMAÇÃO (de CONFIG.eventos) ================= */
  function rotas(end) {
    var q = encodeURIComponent(end);
    return '<div class="rotas"><a href="https://www.google.com/maps/search/?api=1&amp;query=' + q + '" target="_blank" rel="noopener">Abrir no Google Maps</a>' +
           '<a href="https://waze.com/ul?q=' + q + '&amp;navigate=yes" target="_blank" rel="noopener">Waze</a></div>';
  }
  $('linha-tempo').innerHTML = (C.eventos || []).filter(function (e) { return civil || !e.soCivil; }).map(function (e) {
    return '<li class="evento rev"><p class="hora">' + esc(e.hora) + '</p><h3>' + esc(e.titulo) + '</h3>' +
      '<p class="local">' + esc(e.local) + '</p>' +
      '<p class="end">' + (e.endereco || []).map(esc).join('<br>') + '</p>' +
      (e.nota ? '<p class="nota">' + esc(e.nota) + '</p>' : '') +
      (e.instagram ? '<p class="insta"><a href="https://www.instagram.com/' + encodeURIComponent(e.instagram) + '/" target="_blank" rel="noopener">@' + esc(e.instagram) + '</a></p>' : '') +
      (e.mapa ? rotas(e.mapa) : '') + (window.Agenda ? window.Agenda.botoes(e) : '') + '</li>';
  }).join('');
  $('convite-tipo').textContent = civil ? 'cerimônia civil e almoço comemorativo' : 'almoço comemorativo';

  /* ================= RSVP ================= */
  if (Date.now() > quando(D.prazoRsvp)) $('prazo').textContent = 'o prazo de confirmação terminou em 31 de outubro de 2026';
  var f = $('form');
  function erro(campo, msg) { $('e-' + campo).textContent = msg; $('c-' + campo).classList.toggle('invalido', !!msg); }
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var nome = $('nome').value.trim(), vai = (f.querySelector('input[name=vai]:checked') || {}).value,
        qtd = parseInt($('qtd').value, 10), rec = $('recado').value.trim(), primeiro = null;
    erro('nome', ''); erro('vai', ''); erro('qtd', '');
    if (nome.length < 2) { erro('nome', 'Escreva seu nome, por favor.'); primeiro = primeiro || $('nome'); }
    if (!vai) { erro('vai', 'Escolha uma das opções.'); primeiro = primeiro || f.querySelector('input[name=vai]'); }
    if (vai === 'sim' && !(qtd >= 1 && qtd <= 20)) { erro('qtd', 'Informe um número entre 1 e 20.'); primeiro = primeiro || $('qtd'); }
    if (primeiro) { $('estado').innerHTML = ''; primeiro.focus(); return; }
    var msg = 'Olá, Eduardo e Gabriela! Aqui é ' + nome + '.\n' +
      (vai === 'sim' ? 'Confirmo presença no casamento: ' + qtd + (qtd === 1 ? ' pessoa' : ' pessoas') + '.'
                     : 'Infelizmente não poderei ir ao casamento.') +
      (rec ? '\nRecado: ' + rec : '');
    var est = $('estado');
    if (!C.whatsapp) { // sem número: NÃO finge envio; mostra a mensagem que seria enviada
      est.innerHTML = '<div class="caixa"><h4>Demo · envio ainda não configurado</h4>' +
        '<p>Nada foi enviado. Quando o número dos noivos estiver definido, este botão abrirá o WhatsApp com a mensagem abaixo pronta.</p><pre></pre></div>';
      est.querySelector('pre').textContent = msg;
      return;
    }
    est.innerHTML = '<div class="caixa"><h4>Abrindo o WhatsApp…</h4><p>Para concluir, toque em enviar na conversa que abriu.</p></div>';
    window.open('https://wa.me/' + C.whatsapp.replace(/\D/g, '') + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  });
  f.querySelector('#c-vai').addEventListener('change', function () {
    var v = (f.querySelector('input[name=vai]:checked') || {}).value;
    $('c-qtd').hidden = v === 'nao';
  });

  /* ================= PRESENTES: só mostra o que estiver configurado ================= */
  if (C.pixChave) $('chave').textContent = C.pixChave;
  if (C.pixQrUrl) { $('qr').innerHTML = ''; var q = new Image(); q.src = C.pixQrUrl; q.alt = 'QR Code Pix'; q.width = 168; q.height = 168; $('qr').appendChild(q); }
  if (C.pixCopiaECola) {
    var b = $('copiar'); b.disabled = false;
    b.addEventListener('click', function () {
      var ok = function () { $('copiado').textContent = 'Código copiado. Cole no app do seu banco, em Pix copia e cola.'; };
      if (navigator.clipboard) navigator.clipboard.writeText(C.pixCopiaECola).then(ok, function () { $('copiado').textContent = 'Não foi possível copiar automaticamente.'; });
    });
  }
  if (C.cartaoUrl) {
    $('cartao').innerHTML = '<a class="copiar" target="_blank" rel="noopener"></a>';
    var a = $('cartao').firstChild; a.href = C.cartaoUrl; a.textContent = 'Presentear no cartão';
  }

  /* ================= MÚSICA OPCIONAL ================= */
  if (C.musicaUrl) {
    var m = $('musica'), au = new Audio(C.musicaUrl); au.loop = true; m.hidden = false;
    m.addEventListener('click', function () {
      if (au.paused) { au.play(); m.setAttribute('aria-pressed', 'true'); m.textContent = 'pausar música'; }
      else { au.pause(); m.setAttribute('aria-pressed', 'false'); m.textContent = 'música'; }
    });
  }

  /* ================= REVELAÇÃO SUAVE AO ROLAR ================= */
  var rev = document.querySelectorAll('.rev');
  if (reduz || !('IntersectionObserver' in window)) { rev.forEach(function (n) { n.classList.add('vis'); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('vis'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rev.forEach(function (n) { io.observe(n); });
  }

  /* pequena API para o painel de testes (js/dev.js) */
  window.Convite = { poeFoto: poeFoto, corTema: corTema, relevo: relevo };
})();
