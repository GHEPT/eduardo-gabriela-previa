#!/usr/bin/env node
/* Capturas de tela com Playwright (iPhone 390x844 @2x + desktop).
   Uso:
     npm run serve            (em outro terminal: sobe http://localhost:3000)
     npm run shots            capturas da paleta padrão  → tests/capturas/
     npm run shots:paletas    envelope + capa de TODAS as paletas
   Opções: --url http://localhost:8080/   --paleta malva   --saida pasta
   Primeira vez: npm install && npx playwright install chromium
   Falha (código 1) se houver erro no console ou recurso que não carregou. */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : d; };
const BASE = arg('url', 'http://localhost:3000/');
const SAIDA = arg('saida', 'tests/capturas');
const TODAS = process.argv.includes('--paletas');
const PALETAS = TODAS ? ['azul-amarelo', 'malva', 'marrom-cafe', 'verde-rosa', 'bordo'] : [arg('paleta', 'azul-amarelo')];
mkdirSync(SAIDA, { recursive: true });

// timers longos (4s) viram imediatos só no teste, para congelar quadros da abertura
const STUB = '(()=>{const o=window.setTimeout;window.setTimeout=(f,t,...a)=>t>=2000?0:o(f,t,...a)})()';
const congela = (pg, ms) => pg.evaluate((t) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = t; }), ms);
const abreDeVez = (pg) => pg.evaluate(() => {
  document.getAnimations().forEach((a) => { try { a.finish(); } catch (e) {} });
  document.documentElement.classList.remove('fechado', 'abrindo');
  document.getElementById('env').hidden = true;
  document.querySelectorAll('.borboleta').forEach((n) => { n.hidden = true; });
  document.querySelectorAll('.rev').forEach((n) => n.classList.add('vis'));
});

const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
const erros = [];
async function pagina(vp, url) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2 });
  const pg = await ctx.newPage();
  pg.on('console', (m) => { if (m.type() === 'error') erros.push(`${url}: ${m.text()}`); });
  pg.on('pageerror', (e) => erros.push(`${url}: ${e.message}`));
  pg.on('requestfailed', (r) => erros.push(`${url}: falhou ${r.url()}`));
  await pg.goto(url); await pg.waitForLoadState('networkidle'); await pg.waitForTimeout(500);
  return { ctx, pg };
}

const CEL = { width: 390, height: 844 }, DESK = { width: 1440, height: 900 };
for (const pal of PALETAS) {
  const url = `${BASE}?paleta=${pal}`;
  const { ctx, pg } = await pagina(CEL, url);
  await pg.screenshot({ path: `${SAIDA}/${pal}-01-envelope.png` });
  await pg.screenshot({ path: `${SAIDA}/${pal}-abertura-0ms.png` });
  await pg.evaluate(STUB); await pg.click('#abrir'); await pg.waitForTimeout(40);
  for (const ms of [120, 350, 600, 1200, 1700, 2100, 2500]) { await congela(pg, ms); await pg.waitForTimeout(60); await pg.screenshot({ path: `${SAIDA}/${pal}-abertura-${ms}ms.png` }); }
  await abreDeVez(pg); await pg.waitForTimeout(400);
  await pg.screenshot({ path: `${SAIDA}/${pal}-03-capa.png` });
  if (!TODAS || pal === 'azul-amarelo') {
    await pg.waitForTimeout(1200);
    await pg.screenshot({ path: `${SAIDA}/${pal}-04-pagina-inteira.png`, fullPage: true });
  }
  await ctx.close();
}
if (!TODAS) {
  const pal = PALETAS[0];
  for (const [nome, url] of [['05-civil', `${BASE}?paleta=${pal}&convite=civil#programacao`], ['06-rsvp', `${BASE}?paleta=${pal}#rsvp`]]) {
    const { ctx, pg } = await pagina(CEL, url); await abreDeVez(pg); await pg.waitForTimeout(400);
    await pg.screenshot({ path: `${SAIDA}/${pal}-${nome}.png` }); await ctx.close();
  }
  const { ctx, pg } = await pagina(DESK, `${BASE}?paleta=${pal}`);
  await pg.screenshot({ path: `${SAIDA}/${pal}-07-desktop-envelope.png` });
  await abreDeVez(pg); await pg.waitForTimeout(400);
  await pg.screenshot({ path: `${SAIDA}/${pal}-08-desktop-capa.png` });
  await ctx.close();
}
await browser.close();
if (erros.length) { console.error('ERROS:\n' + erros.join('\n')); process.exit(1); }
console.log(`ok · capturas em ${SAIDA}/`);
