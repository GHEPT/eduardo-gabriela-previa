#!/usr/bin/env node
/* Confere as regras de cor do projeto (sem dependências):
   1) nenhuma cor literal (#hex, rgb(), hsl(), white/black) fora de
      css/tokens.css e css/paletas.css — use var(--cor-*) / rgba(var(--rgb-*),a)
   2) toda paleta define exatamente as mesmas --p-* do bloco padrão
   3) toda --p-* usada em tokens.css existe nas paletas
   Uso: node scripts/checar-cores.mjs   (ou npm run lint:cores) */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const ler = (f) => readFileSync(join(raiz, f), 'utf8');
const LIVRES = new Set(['css/tokens.css', 'css/paletas.css']);
const arquivos = ['index.html',
  ...readdirSync(join(raiz, 'css')).filter((f) => f.endsWith('.css')).map((f) => 'css/' + f),
  ...readdirSync(join(raiz, 'js')).filter((f) => f.endsWith('.js')).map((f) => 'js/' + f)];

const PROIBIDO = [
  [/#[0-9a-fA-F]{3,8}\b(?![-\w])/g, 'hex'],
  [/\brgba?\(\s*\d/g, 'rgb() literal'],
  [/\bhsla?\(\s*\d/g, 'hsl() literal'],
  [/:\s*(white|black)\b/g, 'cor nomeada'],
];
// exceções conscientes (documentadas em docs/DESIGN-SYSTEM.md)
const EXCECOES = [/<meta name="theme-color"/, /url\(#bf-/, /href="#/, /querySelector\(location\.hash\)/, /id="bf-/];

let falhas = 0;
for (const f of arquivos) {
  if (LIVRES.has(f)) continue;
  ler(f).split('\n').forEach((linha, i) => {
    if (EXCECOES.some((r) => r.test(linha))) return;
    const semUrl = linha.replace(/url\((["']?)data:[^)]*\1\)/g, '').replace(/href="[^"]*"/g, '').replace(/location\.hash/g, '');
    for (const [re, nome] of PROIBIDO) {
      for (const m of semUrl.matchAll(re)) {
        if (nome === 'hex' && /&#$/.test(semUrl.slice(0, m.index + 1))) continue; // entidade HTML
        console.log(`${f}:${i + 1}  ${nome}: ${m[0]}  → use um token`); falhas++;
      }
    }
  });
}

const pal = ler('css/paletas.css');
const blocos = [...pal.matchAll(/((?::root,\s*)?\[data-paleta="([\w-]+)"\])\s*\{([\s\S]*?)\n\}/g)];
const nomes = (b) => new Set([...b.matchAll(/(--p-[\w-]+)\s*:/g)].map((m) => m[1]));
const padrao = nomes(blocos[0][3]);
for (const [, , nome, corpo] of blocos) {
  const n = nomes(corpo);
  const faltam = [...padrao].filter((x) => !n.has(x)), sobram = [...n].filter((x) => !padrao.has(x));
  if (faltam.length) { console.log(`paleta "${nome}": faltam ${faltam.join(', ')}`); falhas++; }
  if (sobram.length) { console.log(`paleta "${nome}": não existem no padrão ${sobram.join(', ')}`); falhas++; }
}
const usadas = new Set([...ler('css/tokens.css').matchAll(/var\((--p-[\w-]+)\)/g)].map((m) => m[1]));
for (const u of usadas) if (!padrao.has(u)) { console.log(`tokens.css usa ${u}, que nenhuma paleta define`); falhas++; }

console.log(falhas ? `\n${falhas} problema(s).` : `cores ok · ${blocos.length} paletas · ${padrao.size} primitivas · ${arquivos.length} arquivos`);
process.exit(falhas ? 1 : 0);
