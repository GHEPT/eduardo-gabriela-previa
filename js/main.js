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
  function movimentoReduzido() {
    return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  var reduz = movimentoReduzido();
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

  /* ================= MÚSICA (só aparece se houver arquivo; nunca toca antes do toque) ================= */
  var musica = null;
  if (C.musicaUrl) {
    var mBtn = $('musica'), au = new Audio(C.musicaUrl); au.loop = true;
    musica = { m: mBtn, au: au };
    mBtn.addEventListener('click', function () {
      if (au.paused) { au.play(); mBtn.setAttribute('aria-pressed', 'true'); mBtn.textContent = 'pausar música'; }
      else { au.pause(); mBtn.setAttribute('aria-pressed', 'false'); mBtn.textContent = 'música'; }
    });
  }
  function revelaMusica(tocar) {
    if (!musica) return;
    musica.m.hidden = false;
    musica.m.classList.add('pronta');
    if (!tocar) { musica.m.classList.add('ja'); return; }
    var promessa = musica.au.play();
    if (promessa && promessa.catch) promessa.catch(function () {});
    musica.m.setAttribute('aria-pressed', 'true');
    musica.m.textContent = 'pausar música';
  }

  /* ================= ENVELOPE (docs/ABERTURA.md: idle → opening → complete) ================= */
  var env = $('env'), bor = $('borboleta'), estado = 'idle';
  bor.classList.add('b1');
  var b2 = bor.cloneNode(true);
  b2.id = 'borboleta-2';
  b2.classList.remove('b1');
  b2.classList.add('b2');
  ['bf-ant', 'bf-pos', 'bf-ouro', 'bf-borda', 'bf-corpo'].forEach(function (id) {
    var no = b2.querySelector('[id="' + id + '"]');
    if (no) no.id = id + '2';
    b2.querySelectorAll('[fill],[stroke]').forEach(function (el) {
      ['fill', 'stroke'].forEach(function (attr) {
        var v = el.getAttribute(attr);
        if (v && v.indexOf('url(#' + id + ')') !== -1) el.setAttribute(attr, v.replace('url(#' + id + ')', 'url(#' + id + '2)'));
      });
    });
  });
  bor.parentNode.insertBefore(b2, bor.nextSibling);
  var chao = function (el) { var s = document.createElement('span'); s.className = 'chao'; el.appendChild(s); };
  chao(bor); chao(b2);
  for (var pi = 0; pi < 8; pi++) {
    var part = document.createElement('span');
    part.className = 'particula';
    part.style.setProperty('--i', String(pi));
    bor.appendChild(part);
  }
  /* Caminho B: parado no poster até o toque. Âncora ou menos movimento não carregam o vídeo. */
  var video = null;
  var toqueEm = 0;
  var alvoHash = null; try { alvoHash = location.hash && document.querySelector(location.hash); } catch (e) {}
  function tiraVideo() {
    html.classList.remove('video-capa', 'video-abre');
    if (video) { video.remove(); video = null; }
  }
  if (!reduz && !alvoHash && typeof C.aberturaVideo === 'string' && C.aberturaVideo) {
    video = document.createElement('video');
    video.className = 'abertura-video';
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.preload = 'auto';
    video.poster = 'assets/abertura/abertura-poster.png';
    video.setAttribute('aria-hidden', 'true');
    video.src = C.aberturaVideo;
    env.appendChild(video);
    html.classList.add('video-capa');
    var encerrando = false;
    function pertoDoFim() {
      return !!(video && video.duration > 0.5 && video.currentTime >= video.duration - 0.25);
    }
    /* O Safari dispara `ended` no load ou no play, com currentTime ainda em 0.
       Só vale o fim de verdade: o vídeo chegou ao final. */
    function aoTerminar() {
      if (encerrando || !video || estado !== 'opening') return;
      if (Date.now() - toqueEm < 800) return;
      if (!(video.currentTime > 0.4) || !pertoDoFim()) return;
      encerrando = true;
      html.classList.remove('fechado');
      corTema();
      video.classList.add('saindo');
      var saiu = false;
      var comecou = Date.now();
      var fim = function () {
        if (saiu || estado !== 'opening') return;
        if (Date.now() - comecou < 180) return;
        saiu = true;
        completo();
      };
      video.addEventListener('transitionend', function (ev) {
        if (ev.target !== video || ev.propertyName !== 'opacity') return;
        fim();
      });
      setTimeout(fim, 220);
    }
    video.addEventListener('ended', aoTerminar);
    video.addEventListener('timeupdate', function () {
      if (video && video.paused && pertoDoFim()) aoTerminar();
    });
    video.addEventListener('error', function () {
      var noMeio = estado === 'opening';
      tiraVideo();
      if (noMeio) segueCss();
    });
  }
  env.dataset.cena = 'idle';

  function aberto() {
    html.classList.remove('fechado', 'abrindo', 'video-abre', 'video-capa');
    env.hidden = true; bor.hidden = true; b2.hidden = true;
    corTema();
  }
  function completo() {
    if (estado === 'complete') return;
    estado = 'complete';
    env.dataset.cena = 'complete';
    aberto();
    var nomes = $('nomes');
    if (nomes) nomes.focus({ preventScroll: true });
    if (movimentoReduzido()) {
      html.classList.remove('capa-espera');
      return;
    }
    comecaCapa();
  }
  /* O WebKit não roda a animação no mesmo quadro em que a camada some,
     nem se ela começou enquanto a capa estava coberta. Espera dois frames
     e recomeça os mesmos keyframes. */
  function reinicia(sel) {
    var els = document.querySelectorAll(sel);
    var i;
    for (i = 0; i < els.length; i++) els[i].style.animation = 'none';
    void html.offsetWidth;
    for (i = 0; i < els.length; i++) els[i].style.animation = '';
  }
  function comecaCapa() {
    html.classList.add('capa-espera');
    html.classList.remove('capa-entra');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (estado !== 'complete' || movimentoReduzido()) return;
        html.classList.add('capa-entra');
        reinicia('.nome-e, .nome-d, .capa h1 .amp');
        ligaFimDosNomes();
      });
    });
  }
  function ligaFimDosNomes() {
    var titulo = $('nomes');
    if (!titulo || fimNomes) return;
    var inicio = Date.now();
    var min = tempoMs('--dur-nome') * 2 + tempoMs('--atraso-nome') * 2;
    titulo.addEventListener('animationend', function (ev) {
      var nome = ev.animationName;
      if (fimNomes || nome !== 'sobe-nome' || !ev.target.classList.contains('nome-d')) return;
      if (Date.now() - inicio < min - 80) return;
      liberaNomes();
    });
    setTimeout(liberaNomes, min + tempoMs('--dur-nome'));
  }
  function liberaNomes() {
    if (fimNomes) return;
    fimNomes = true;
    setTimeout(function () { nomesLiberados = true; soltaFoto(); }, tempoMs('--atraso-nome'));
  }
  var fimNomes = false, nomesLiberados = false, fotoPronta = false;
  function tempoMs(nome) {
    var v = getComputedStyle(html).getPropertyValue(nome).trim();
    var n = parseFloat(v);
    if (!n) return 200;
    return /ms/.test(v) ? n : n * 1000;
  }
  function soltaFoto() {
    if (movimentoReduzido() || !nomesLiberados || !fotoPronta || html.classList.contains('capa-foto')) return;
    html.classList.add('capa-foto');
    reinicia('.janela img, .janela .vela, .janela .num, .capa .linha span, .contagem .bloco, .contagem i');
  }
  function marcaFoto() { fotoPronta = true; soltaFoto(); }
  function abrir() {
    if (estado !== 'idle') return;
    estado = 'opening';
    env.dataset.cena = 'opening';
    $('abrir').disabled = true;
    revelaMusica(true);
    if (video) {
      toqueEm = Date.now();
      try { if (video.currentTime > 0) video.currentTime = 0; } catch (e) {}
      vigiaVideo();
      var toca = video.play();
      if (toca && toca.catch) toca.catch(function () { tiraVideo(); segueCss(); });
      return;
    }
    segueCss();
  }
  function vigiaVideo() {
    var parado = 0;
    var id = setInterval(function () {
      if (!video || estado !== 'opening') { clearInterval(id); return; }
      if (video.readyState >= 2 && !video.paused && video.currentTime > 0.2) { parado = 0; return; }
      parado += 1;
      if (parado < 4) return;
      clearInterval(id);
      tiraVideo();
      segueCss();
    }, 1000);
  }
  function segueCss() {
    if (estado === 'complete') return;
    html.classList.add('abrindo');
    bor.classList.add('voa');
    b2.classList.add('voa');
    var site = document.querySelector('.site');
    requestAnimationFrame(function () {
      var total = 2400;
      if (site && site.getAnimations) {
        site.getAnimations().forEach(function (a) {
          if (a.animationName !== 'sobe' || !a.effect || !a.effect.getComputedTiming) return;
          var t = a.effect.getComputedTiming();
          var soma = (t.delay || 0) + (t.duration || 0);
          if (soma > 500) total = soma + 40;
        });
      }
      setTimeout(function () { if (estado === 'opening') completo(); }, total);
    });
  }
  document.addEventListener('animationend', function (ev) {
    if (estado !== 'opening') return;
    if (ev.animationName === 'sobe') completo();
  });
  if (!reduz) html.classList.add('capa-espera');
  /* âncora (#rsvp) ou movimento reduzido: a capa, sem o vídeo e sem a coreografia */
  if (alvoHash || reduz) {
    revelaMusica(false);
    completo();
    if (alvoHash) alvoHash.scrollIntoView();
  } else {
    var btnAbrir = $('abrir');
    btnAbrir.addEventListener('click', abrir);
    document.addEventListener('keydown', function (ev) {
      if (estado !== 'idle') return;
      if (ev.key !== 'Enter' && ev.key !== ' ') return;
      if (ev.target === btnAbrir) return;
      ev.preventDefault();
      abrir();
    });
  }

  /* Foto inteira acompanha o scroll devagar; os nomes sobem e somem. Sem monograma. */
  if (!reduz) {
    var janela = document.querySelector('.janela');
    var titulo = $('nomes');
    var pedidoScroll = false;
    var estilo = getComputedStyle(html);
    var curso = parseFloat(estilo.getPropertyValue('--curso-scroll')) || 200;
    var maxFoto = parseFloat(estilo.getPropertyValue('--desloc-foto')) || 20;
    var sobe = parseFloat(estilo.getPropertyValue('--desloc-nome')) || 12;
    function aplicaScroll() {
      pedidoScroll = false;
      var y = window.scrollY || 0;
      var p = y <= 0 ? 0 : Math.min(1, y / curso);
      if (janela) janela.style.transform = p ? 'translate3d(0,' + (p * maxFoto).toFixed(2) + 'px,0)' : '';
      if (titulo) {
        titulo.style.transform = p ? 'translate3d(0,' + (-p * sobe).toFixed(2) + 'px,0)' : '';
        titulo.style.opacity = p ? String(1 - p) : '';
      }
    }
    window.addEventListener('scroll', function () {
      if (pedidoScroll) return;
      pedidoScroll = true;
      requestAnimationFrame(aplicaScroll);
    }, { passive: true });
  }

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
    if (faixa.complete && faixa.naturalWidth > 0) marcaFoto();
    else {
      faixa.addEventListener('load', marcaFoto);
      faixa.addEventListener('error', marcaFoto);
    }
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
  function poe(b, valor) {
    if (!b || b.textContent === valor) return;
    var bloco = b.parentNode;
    var subindo = !reduz && bloco && bloco.getAnimations().some(function (a) {
      return a.animationName === 'sobe-nome' && a.playState === 'running';
    });
    if (reduz || subindo || !html.classList.contains('capa-foto')) { b.textContent = valor; return; }
    b.classList.remove('troca');
    b.textContent = valor;
    void b.offsetWidth;
    b.classList.add('troca');
  }
  function tick() {
    var agora = Date.now(), r = alvo - agora;
    if (r <= 0) {
      el.innerHTML = '<span class="fim">' + (agora < fimDoDia ? 'Hoje celebramos.' : 'Celebramos em 11 de dezembro de 2026. Obrigado por fazer parte.') + '</span>';
      return;
    }
    var s = Math.floor(r / 1000);
    poe(u.d, String(Math.floor(s / 86400)));
    poe(u.h, pad(Math.floor(s % 86400 / 3600)));
    poe(u.m, pad(Math.floor(s % 3600 / 60)));
    poe(u.s, pad(s % 60));
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

  /* Versículo acompanha o scroll no CSS. Este caminho só vale sem animation-timeline. */
  var verso = $('versiculo');
  var timeline = window.CSS && CSS.supports && CSS.supports('animation-timeline: view()');
  if (verso && !reduz && !timeline) {
    html.classList.add('verso-js');
    var partes = verso.querySelectorAll('.verso-parte, cite');
    var faixas = [[0, .16], [.12, .28], [.24, .40], [.36, .52], [.48, .64], [.66, .80]];
    var sobeVerso = parseFloat(getComputedStyle(html).getPropertyValue('--desloc-verso')) || 8;
    var pedidoVerso = false;
    function aplicaVerso() {
      pedidoVerso = false;
      var vh = window.innerHeight;
      var percurso = verso.offsetHeight - vh;
      var p = percurso <= 0 ? 1 : Math.min(1, Math.max(0, -verso.getBoundingClientRect().top / percurso));
      for (var i = 0; i < partes.length; i++) {
        var faixa = faixas[i] || [0, 1];
        var t = (p - faixa[0]) / (faixa[1] - faixa[0]);
        t = Math.min(1, Math.max(0, t));
        partes[i].style.opacity = String(t);
        partes[i].style.transform = t >= 1 ? '' : 'translate3d(0,' + ((1 - t) * sobeVerso).toFixed(2) + 'px,0)';
      }
    }
    function pedeVerso() {
      if (pedidoVerso) return;
      pedidoVerso = true;
      requestAnimationFrame(aplicaVerso);
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function () { pedeVerso(); }, { rootMargin: '25% 0px' }).observe(verso);
    }
    window.addEventListener('scroll', pedeVerso, { passive: true });
    window.addEventListener('resize', pedeVerso);
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
  window.Convite = { poeFoto: poeFoto, corTema: corTema };
})();
