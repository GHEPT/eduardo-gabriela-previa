"""
Gera um bloco [data-paleta="..."] COMPLETO a partir de poucas cores-âncora.

Uso:
    python3 scripts/nova-paleta.py                 # imprime as paletas de exemplo
    python3 scripts/nova-paleta.py minha.json      # imprime a paleta do JSON
    python3 scripts/nova-paleta.py --amostrar foto.jpg   # 8 cores dominantes de uma imagem

minha.json (exemplo):
    {"nome":"terracota","titulo":"Terracota","papel":"#F5EFE6","tinta":"#3A2219",
     "profundo":"#5A2E1E","envelope":"#B86F4E","forro":"#EED9C4","ouro":"#B8894A",
     "cera":"#7A3A22","asa":"#D9A47E","campo2":"#F3E6D6"}

Cole a saída no fim de css/paletas.css e ajuste à mão o que quiser:
o CSS é a fonte da verdade; este script só dá o ponto de partida.
Precisa só de Python 3 (Pillow apenas para --amostrar).
"""
import json, sys

def hx(c):
    c = c.lstrip('#'); return tuple(int(c[i:i+2], 16) for i in (0, 2, 4))
def css(t): return '#%02X%02X%02X' % tuple(max(0, min(255, round(v))) for v in t)
def rgb(t): return ','.join(str(max(0, min(255, round(v)))) for v in t)
def mix(a, b, t): return tuple(x*(1-t)+y*t for x, y in zip(a, b))
def escurece(c, t): return mix(c, (0, 0, 0), t)
def clareia(c, t): return mix(c, (255, 255, 255), t)

EXEMPLOS = [
  {"nome": "marrom-cafe", "titulo": "Marrom café",
   "nota": "envelope taupe/moca, forro latte, lacre chocolate, texto espresso, acento dourado",
   "papel": "#F4EFE6", "tinta": "#2B1C13", "profundo": "#452411", "envelope": "#8A7763",
   "forro": "#E8DCC6", "ouro": "#B08A4E", "cera": "#5E3622", "asa": "#B39C82", "campo2": "#EFE6D8"},
  {"nome": "verde-rosa", "titulo": "Verde e rosa",
   "nota": "envelope sálvia, forro rosa-blush, lacre vinho, texto verde profundo",
   "papel": "#F6F1EA", "tinta": "#2F3A24", "profundo": "#3E4A2A", "envelope": "#8C977A",
   "forro": "#EBCDBF", "ouro": "#B39368", "cera": "#6E373F", "asa": "#D5A796", "campo2": "#F5E6DF"},
  {"nome": "bordo", "titulo": "Bordô",
   "nota": "envelope vinho, forro creme, lacre dourado, texto vinho escuro",
   "papel": "#F6F2EC", "tinta": "#3D1015", "profundo": "#572028", "envelope": "#7A2E38",
   "forro": "#EDE5D8", "ouro": "#A8885A", "cera": "#B08A52", "asa": "#D9C6A6", "campo2": "#F1E8DC"},
]

def deriva(a):
    P = {k: hx(v) for k, v in a.items() if isinstance(v, str) and v.startswith('#')}
    papel, tinta, prof, env, forro, ouro, cera, asa = (P[k] for k in
        ('papel', 'tinta', 'profundo', 'envelope', 'forro', 'ouro', 'cera', 'asa'))
    campo = mix(papel, env, .12); campo2 = P.get('campo2', mix(papel, ouro, .12))
    sombra = escurece(tinta, .45)
    v = {}
    v['p-papel'] = css(papel); v['p-papel-rgb'] = rgb(papel)
    v['p-papel-mesa'] = css(mix(papel, env, .07))
    v['p-campo'] = css(campo); v['p-campo-rgb'] = rgb(campo); v['p-campo-2'] = css(campo2)
    v['p-tinta'] = css(tinta); v['p-tinta-media'] = css(mix(tinta, papel, .25))
    v['p-tinta-clara'] = css(mix(tinta, papel, .42)); v['p-tinta-placeholder'] = css(mix(tinta, papel, .5))
    v['p-linha'] = css(mix(env, tinta, .15)); v['p-filete'] = css(mix(env, papel, .6))
    v['p-profundo'] = css(prof); v['p-profundo-rgb'] = rgb(prof); v['p-profundo-hover'] = css(escurece(prof, .18))
    v['p-sobre-profundo'] = css(clareia(papel, .3)); v['p-erro'] = '#9A3B2E'
    v['p-desab'] = css(mix(papel, env, .22)); v['p-desab-tinta'] = css(mix(tinta, papel, .3))
    v['p-ouro'] = css(ouro)
    for i, f in enumerate([escurece(ouro, .13), clareia(ouro, .3), ouro, clareia(ouro, .25), escurece(ouro, .18)], 1):
        v[f'p-foil-{i}'] = css(f)
    v['p-env-cima'] = css(clareia(env, .07)); v['p-env-baixo'] = css(env)
    v['p-env-esq'] = css(escurece(env, .04)); v['p-env-dir'] = css(escurece(env, .08))
    v['p-env-tinta'] = css(clareia(papel, .4)); v['p-env-realce'] = css(clareia(ouro, .45))
    v['p-aba-sombra'] = css(escurece(tinta, .35))
    v['p-forro'] = css(forro); v['p-forro-verso'] = css(clareia(forro, .15))
    v['p-forro-oclusao-rgb'] = rgb(escurece(forro, .55)); v['p-forro-verso-rgb'] = rgb(escurece(forro, .45))
    v['p-sombra-rgb'] = rgb(sombra); v['p-env-sombra-rgb'] = rgb(sombra); v['p-luz-rgb'] = rgb(clareia(papel, .85))
    v['p-verso-sombra'] = '.22'; v['p-verso-clareia'] = '.26'
    v['p-cera-1'] = css(clareia(cera, .25)); v['p-cera-2'] = css(cera); v['p-cera-3'] = css(escurece(cera, .4))
    v['p-cera-disco-1'] = css(escurece(cera, .03)); v['p-cera-disco-2'] = css(escurece(cera, .17))
    v['p-cera-anel'] = css(escurece(cera, .06)); v['p-cera-letra'] = css(escurece(cera, .3))
    v['p-cera-sombreado'] = css(escurece(cera, .85)); v['p-cera-brilho'] = css(clareia(cera, .85))
    v['p-cera-brilho-forca'] = '.62'; v['p-cera-sombra-rgb'] = rgb(sombra)
    for pre, k in (('p-asa', 0), ('p-asa-pos', .03)):
        v[f'{pre}-1'] = css(clareia(asa, .88+k)); v[f'{pre}-2'] = css(clareia(asa, .5+k))
        v[f'{pre}-3'] = css(asa); v[f'{pre}-4'] = css(escurece(asa, .35+k))
    v['p-asa-borda-1'] = css(mix(escurece(asa, .5), tinta, .3)); v['p-asa-borda-2'] = css(mix(escurece(asa, .65), tinta, .4))
    v['p-asa-veia'] = css(escurece(asa, .45)); v['p-asa-ponto'] = css(clareia(papel, .5))
    v['p-asa-tracejado'] = css(clareia(ouro, .35)); v['p-asa-ocelo'] = css(clareia(ouro, .22))
    for i, f in enumerate([escurece(ouro, .13), clareia(ouro, .35), ouro, clareia(ouro, .2)], 1):
        v[f'p-asa-ouro-{i}'] = css(f)
    v['p-corpo-1'] = css(escurece(tinta, .35)); v['p-corpo-2'] = css(mix(tinta, asa, .4))
    v['p-corpo-listra'] = css(mix(asa, papel, .2)); v['p-corpo-brilho'] = css(clareia(asa, .4))
    v['p-antena'] = css(escurece(tinta, .2)); v['p-olho'] = css(tinta)
    cinza = (154, 160, 166)
    for i, t in enumerate((.18, .1, .24), 1):
        v[f'p-foto-{i}'] = css(mix(escurece(cinza, .04*(i == 2)), env, t))
    v['p-foto-rotulo'] = css(clareia(papel, .5))
    return v

def bloco(a):
    v = deriva(a)
    linhas = [f'/* ---------------------------------------------------------------------',
              f'   {a.get("titulo", a["nome"]).upper()} — gerada por scripts/nova-paleta.py (ajuste à mão)',
              f'   {a.get("nota", "")}',
              f'   Moodboard: docs/referencias/moodboard-{a["nome"]}.jpg',
              f'   --------------------------------------------------------------------- */',
              f'[data-paleta="{a["nome"]}"]{{']
    for k, val in v.items(): linhas.append(f'  --{k}:{val};')
    linhas.append('}')
    return '\n'.join(linhas)

def amostrar(caminho):
    from PIL import Image
    im = Image.open(caminho).convert('RGB'); im.thumbnail((240, 240))
    q = im.quantize(8, method=Image.Quantize.MEDIANCUT); pal = q.getpalette()[:24]
    cont = sorted(q.getcolors(), reverse=True)
    for n, i in cont:
        print(css(pal[i*3:i*3+3]), f'{100*n/(im.width*im.height):.0f}%')

if __name__ == '__main__':
    if len(sys.argv) > 2 and sys.argv[1] == '--amostrar':
        amostrar(sys.argv[2])
    elif len(sys.argv) > 1:
        print(bloco(json.load(open(sys.argv[1], encoding='utf-8'))))
    else:
        print('\n\n'.join(bloco(a) for a in EXEMPLOS))
