/* =====================================================================
   sw.js: service worker mínimo (escopo relativo: funciona em
   https://ghept.github.io/eduardo-gabriela-previa/ ou em qualquer pasta).
   • HTML: rede primeiro, cache se offline (o convite sempre atualiza)
   • CSS/JS/imagens: cache com atualização em segundo plano
   • Google Fonts: cache depois do 1º acesso
   Ao publicar mudanças, suba a VERSAO para limpar caches antigos.
   ===================================================================== */
const VERSAO = 'convite-v0.5.2-14';
const ESSENCIAIS = [
  './', 'index.html', 'manifest.webmanifest',
  'css/paletas.css', 'css/tokens.css', 'css/base.css', 'css/envelope.css', 'css/secoes.css',
  'js/config.js', 'js/inicio.js', 'js/agenda.js', 'js/main.js', 'js/pwa.js', 'js/dev.js',
  'assets/texturas/papel.webp', 'assets/texturas/algodao.webp', 'assets/texturas/relevo.webp',
  'assets/lacre/lacre-forma.webp', 'assets/lacre/lacre-letras.webp', 'assets/lacre/lacre-sombra.webp',
  'assets/lacre/lacre-sombreado.webp', 'assets/lacre/lacre-brilho.webp',
  'assets/fotos/foto-1.webp', 'assets/fotos/foto-2.webp', 'assets/fotos/foto-3.webp', 'assets/fotos/faixa.webp',
  'assets/icones/apple-touch-icon.png', 'assets/icones/icone-192.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(ESSENCIAIS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSAO).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const fonte = /(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (url.origin !== location.origin && !fonte) return; // mapas, Waze, WhatsApp etc.: direto na rede

  if (req.mode === 'navigate') { // ?paleta=, ?convite=civil… usam o mesmo index em cache
    e.respondWith(fetch(req).then((r) => {
      const copia = r.clone(); caches.open(VERSAO).then((c) => c.put('index.html', copia)); return r;
    }).catch(() => caches.match('index.html', { ignoreSearch: true })));
    return;
  }
  e.respondWith(caches.open(VERSAO).then((c) => c.match(req).then((emCache) => {
    const daRede = fetch(req).then((r) => { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; })
      .catch(() => emCache);
    return fonte ? (emCache || daRede) : (emCache ? (e.waitUntil(daRede), emCache) : daRede);
  })));
});
