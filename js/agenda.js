/* =====================================================================
   agenda.js: "Adicionar à agenda" sem servidor.
   • .ics gerado no navegador (RFC 5545), fuso America/Sao_Paulo,
     alarmes de CONFIG.lembretes (7 dias, 1 dia, 2 horas antes)
   • link do Google Agenda (ctz=America/Sao_Paulo)
   Usado por main.js: window.Agenda.botoes(evento) → HTML
   ===================================================================== */
(function () {
  'use strict';
  var C = window.CONFIG || {};
  var TZ = 'America/Sao_Paulo';
  // Brasil sem horário de verão desde 2019: offset fixo -03:00
  var VTIMEZONE = ['BEGIN:VTIMEZONE', 'TZID:' + TZ, 'BEGIN:STANDARD', 'DTSTART:19700101T000000',
    'TZOFFSETFROM:-0300', 'TZOFFSETTO:-0300', 'TZNAME:-03', 'END:STANDARD', 'END:VTIMEZONE'];

  function local(iso) { return iso.replace(/[-:]/g, '').slice(0, 13) + '00'; } // 2026-12-11T11:30 → 20261211T113000
  function texto(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n'); }
  function bytes(c) { var n = c.codePointAt(0); return n < 0x80 ? 1 : n < 0x800 ? 2 : n < 0x10000 ? 3 : 4; }
  function dobra(l) { // RFC 5545: no máx. 75 octetos (UTF-8) por linha; continuação começa com espaço
    var out = [], atual = '', tam = 0;
    Array.from(l).forEach(function (c) {
      var b = bytes(c);
      if (tam + b > 74) { out.push(atual); atual = ' '; tam = 1; }
      atual += c; tam += b;
    });
    out.push(atual); return out.join('\r\n');
  }
  function urlSite() { return location.origin + location.pathname; }
  function lugar(e) { return [e.local].concat(e.endereco || []).join(', ').replace(/ · /g, ', '); }
  function descricao(e) {
    return 'Casamento de Eduardo & Gabriela: ' + e.titulo + '.' + (e.nota ? ' ' + e.nota : '') + '\nConvite: ' + urlSite();
  }

  function ics(e) {
    var a = e.agenda, agora = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    var L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Eduardo e Gabriela//Convite//PT-BR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH']
      .concat(VTIMEZONE, [
        'BEGIN:VEVENT',
        'UID:' + e.id + '-' + local(a.inicio) + '@eduardo-gabriela',
        'DTSTAMP:' + agora,
        'DTSTART;TZID=' + TZ + ':' + local(a.inicio)
      ]);
    if (a.fim) L.push('DTEND;TZID=' + TZ + ':' + local(a.fim));
    L.push('SUMMARY:' + texto(e.titulo + ': Eduardo & Gabriela'),
      'LOCATION:' + texto(lugar(e)),
      'DESCRIPTION:' + texto(descricao(e)),
      'URL:' + urlSite());
    (C.lembretes || []).forEach(function (t) {
      L.push('BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + texto(e.titulo + ': Eduardo & Gabriela'), 'TRIGGER:' + t, 'END:VALARM');
    });
    L.push('END:VEVENT', 'END:VCALENDAR');
    return L.map(dobra).join('\r\n') + '\r\n';
  }

  function google(e) {
    var a = e.agenda, ini = local(a.inicio), fim = a.fim ? local(a.fim) : ini;
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      '&text=' + encodeURIComponent(e.titulo + ': Eduardo & Gabriela') +
      '&dates=' + ini + '/' + fim + '&ctz=' + encodeURIComponent(TZ) +
      '&location=' + encodeURIComponent(lugar(e)) +
      '&details=' + encodeURIComponent(descricao(e));
  }

  function botoes(e) {
    if (!e.agenda || !e.agenda.inicio) return '';
    var dados = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics(e));
    return '<div class="rotas agenda"><a href="' + dados + '" download="casamento-eduardo-gabriela-' + e.id + '.ics">Adicionar à agenda</a>' +
      '<a href="' + google(e).replace(/&/g, '&amp;') + '" target="_blank" rel="noopener">Google Agenda</a></div>';
  }

  window.Agenda = { ics: ics, google: google, botoes: botoes };
})();
