"""
Gera as máscaras NEUTRAS do lacre de cera (assets/lacre/*.webp).

As imagens não têm cor: são só canais alfa (forma, letras, sombreado,
brilho e sombra projetada). A cor vem 100% dos tokens CSS
(--cor-lacre-*), então trocar de paleta NÃO exige rodar este script.

Rode só se quiser mudar o DESENHO do lacre (forma, monograma, relevo):
    pip install playwright pillow numpy && python -m playwright install chromium
    python3 scripts/gerar-lacre.py
(precisa de internet para baixar as fontes do Google Fonts)
"""
import math, os, sys
import numpy as np
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAIDA = os.path.join(RAIZ, 'assets', 'lacre')
ESCALA = 3  # 160px de desenho -> 480px de imagem (nítido em telas 3x)

# ---- borda de cera: moeda quase redonda, com uma gota só embaixo à direita
cx = cy = 80
th = np.linspace(0, 2*np.pi, 240, endpoint=False)
r = 46.4 + .28*np.sin(5*th+1.2) + .18*np.sin(11*th+.6)
for a, amp, w in [(1.05, 5.6, .15), (3.6, 1.8, .22), (5.4, 1.5, .26)]:
    d = np.angle(np.exp(1j*(th-a))); r += amp*np.exp(-(d/w)**2)
pts = [(cx+ri*math.cos(t), cy+ri*math.sin(t)) for ri, t in zip(r, th)]
def caminho(p):
    n = len(p); s = f"M{p[0][0]:.2f} {p[0][1]:.2f}"
    for i in range(n):
        p0, p1, p2, p3 = p[i-1], p[i], p[(i+1) % n], p[(i+2) % n]
        c1 = (p1[0]+(p2[0]-p0[0])/6, p1[1]+(p2[1]-p0[1])/6); c2 = (p2[0]-(p3[0]-p1[0])/6, p2[1]-(p3[1]-p1[1])/6)
        s += f"C{c1[0]:.2f} {c1[1]:.2f} {c2[0]:.2f} {c2[1]:.2f} {p2[0]:.2f} {p2[1]:.2f}"
    return s+"Z"
D = caminho(pts)
xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
BBOX = (min(xs), min(ys), max(xs), max(ys))

# o sinete entrou um pouco torto, mas continua legível
PRENSA = 'transform="translate(1.6 2.2) rotate(-3.5 80 82)"'
LETRAS = '''
 <text x="58.5" y="91" font-family="'Cormorant Garamond',Garamond,serif" font-weight="500" font-size="32" text-anchor="middle">E</text>
 <text x="80.5" y="91" font-family="'Pinyon Script',cursive" font-size="36" text-anchor="middle">&amp;</text>
 <text x="101.5" y="91" font-family="'Cormorant Garamond',Garamond,serif" font-style="italic" font-weight="500" font-size="32" text-anchor="middle">G</text>'''

# altura da cera (mesmo relevo do v5.2): alfa desfocado + ruído baixo
ALTURA = '''<feGaussianBlur in="SourceAlpha" stdDeviation="5.5" result="h0"/>
   <feTurbulence type="fractalNoise" baseFrequency=".18" numOctaves="3" seed="3" result="n"/>
   <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  .5 0 0 0 0" result="na"/>
   <feComposite in="h0" in2="na" operator="arithmetic" k2="1" k3=".05" result="h"/>'''

def svg(corpo, defs=''):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160"><defs>{defs}</defs>{corpo}</svg>'''

# 1) sombreado: branco = sem efeito; escuro = quanto a cera escurece.
#    O CSS usa (1 - luminância) como alfa de uma camada escura, e o grupo
#    recebe brightness(1.2) para devolver os pontos de luz difusa > 100%.
K = 1/1.2
SOMBREADO = svg(f'''
<rect width="160" height="160" fill="#fff"/>
<path d="{D}" fill="#fff" filter="url(#dif)"/>
<g {PRENSA}>
<circle cx="80" cy="80" r="36" fill="rgb({int(255*K)},{int(255*K)},{int(255*K)})" filter="url(#prensa)"/>
<circle cx="80" cy="80" r="32.2" fill="none" stroke="rgb({int(255*K)},{int(255*K)},{int(255*K)})" stroke-width="1.15"/>
<g fill="rgb({int(255*K)},{int(255*K)},{int(255*K)})" filter="url(#corte)">{LETRAS}</g>
</g>''', f'''
 <filter id="dif" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">{ALTURA}
   <feDiffuseLighting in="h" surfaceScale="8" diffuseConstant="1" lighting-color="#fff" result="d"><feDistantLight azimuth="225" elevation="36"/></feDiffuseLighting>
   <feComposite in="SourceGraphic" in2="d" operator="arithmetic" k1="{1.1*K:.4f}" k2="{.05*K:.4f}" result="lit"/>
   <feComposite in="lit" in2="SourceAlpha" operator="in"/>
 </filter>
 <filter id="prensa" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
   <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="b"/>
   <feOffset in="b" dx="2" dy="2.2" result="o1"/><feComposite in="SourceAlpha" in2="o1" operator="out" result="r1"/>
   <feFlood flood-color="#000" flood-opacity=".62"/><feComposite in2="r1" operator="in" result="sombra"/>
   <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="8" result="n"/>
   <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .1 0" result="nn"/>
   <feComposite in="nn" in2="SourceAlpha" operator="in" result="grao"/>
   <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="grao"/><feMergeNode in="sombra"/></feMerge>
 </filter>
 <filter id="corte" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
   <feOffset in="SourceAlpha" dx="-.6" dy="-.7" result="o"/><feFlood flood-color="#000" flood-opacity=".8"/><feComposite in2="o" operator="in" result="corte"/>
   <feMerge><feMergeNode in="corte"/><feMergeNode in="SourceGraphic"/></feMerge>
 </filter>''')

# 2) brilho: preto = nada; branco = luz especular/realce (vira alfa).
#    Constante especular 1.0 aqui; cada paleta dosa com --lacre-brilho-forca.
BRILHO = svg(f'''
<rect width="160" height="160" fill="#000"/>
<path d="{D}" fill="#000" filter="url(#esp)"/>
<g {PRENSA}>
<circle cx="80" cy="80" r="36" fill="#000" filter="url(#luzdisco)"/>
<circle cx="80" cy="80" r="32.2" fill="none" stroke="#000" stroke-width="1.15" filter="url(#anel)"/>
<g fill="#000" filter="url(#ouro)">{LETRAS}</g>
</g>''', f'''
 <filter id="esp" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">{ALTURA}
   <feSpecularLighting in="h" surfaceScale="6" specularConstant="1.25" specularExponent="56" lighting-color="#fff" result="s"><fePointLight x="52" y="14" z="34"/></feSpecularLighting>
   <feComposite in="s" in2="SourceAlpha" operator="in" result="s2"/>
   <feComposite in="s2" in2="SourceGraphic" operator="arithmetic" k2="1" k3="1"/>
 </filter>
 <filter id="luzdisco" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
   <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="b"/>
   <feOffset in="b" dx="-1.6" dy="-1.8" result="o2"/><feComposite in="SourceAlpha" in2="o2" operator="out" result="r2"/>
   <feFlood flood-color="#fff" flood-opacity=".45"/><feComposite in2="r2" operator="in" result="luz"/>
   <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="luz"/></feMerge>
 </filter>
 <filter id="anel" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
   <feGaussianBlur in="SourceAlpha" stdDeviation=".6" result="h"/>
   <feSpecularLighting in="h" surfaceScale="3.2" specularConstant="1.3" specularExponent="40" lighting-color="#fff" result="s"><fePointLight x="48" y="16" z="40"/></feSpecularLighting>
   <feComposite in="s" in2="SourceAlpha" operator="in" result="s2"/>
   <feComposite in="SourceGraphic" in2="s2" operator="arithmetic" k2="1" k3=".8"/>
 </filter>
 <filter id="ouro" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
   <feGaussianBlur in="SourceAlpha" stdDeviation=".7" result="h"/>
   <feSpecularLighting in="h" surfaceScale="3" specularConstant="1.45" specularExponent="36" lighting-color="#fff" result="s"><fePointLight x="46" y="18" z="42"/></feSpecularLighting>
   <feComposite in="s" in2="SourceAlpha" operator="in" result="s2"/>
   <feComposite in="SourceGraphic" in2="s2" operator="arithmetic" k2="1" k3=".75" result="g"/>
   <feOffset in="SourceAlpha" dx=".5" dy=".6" result="o2"/><feFlood flood-color="#fff" flood-opacity=".25"/><feComposite in2="o2" operator="in" result="brilho"/>
   <feMerge><feMergeNode in="brilho"/><feMergeNode in="g"/></feMerge>
 </filter>''')

# 3) forma da cera, 4) letras, 5) sombra projetada na mesa (só alfa)
FORMA = svg(f'<path d="{D}" fill="#000"/>')
LETRAS_SVG = svg(f'<g fill="#000" {PRENSA}>{LETRAS}</g>')
SOMBRA = svg(f'<path d="{D}" fill="#000" filter="url(#sombra)"/>', '''
 <filter id="sombra" x="-30%" y="-30%" width="160%" height="160%">
   <feGaussianBlur in="SourceAlpha" stdDeviation="4.5" result="b1"/><feOffset in="b1" dx="3.5" dy="5" result="o1"/>
   <feFlood flood-color="#000" flood-opacity=".42"/><feComposite in2="o1" operator="in" result="s1"/>
   <feGaussianBlur in="SourceAlpha" stdDeviation="1.1" result="b2"/><feOffset in="b2" dx="1" dy="1.6" result="o2"/>
   <feFlood flood-color="#000" flood-opacity=".5"/><feComposite in2="o2" operator="in" result="s2"/>
   <feMerge><feMergeNode in="s1"/><feMergeNode in="s2"/></feMerge>
 </filter>''')

PAGINA = '''<!doctype html><html><head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,500&family=Pinyon+Script&display=swap">
<style>html,body{margin:0;background:transparent}#s{width:160px;height:160px;display:block}</style></head><body><div id="s">%s</div></body></html>'''

def main():
    from playwright.sync_api import sync_playwright
    os.makedirs(SAIDA, exist_ok=True)
    chrome = os.environ.get('CHROME', '/usr/bin/google-chrome')
    tmp = {}
    with sync_playwright() as p:
        b = p.chromium.launch(**({'executable_path': chrome} if os.path.exists(chrome) else {}))
        pg = b.new_page(viewport={'width': 300, 'height': 300}, device_scale_factor=ESCALA)
        for nome, s in [('sombreado', SOMBREADO), ('brilho', BRILHO), ('forma', FORMA), ('letras', LETRAS_SVG), ('sombra', SOMBRA)]:
            pg.set_content(PAGINA % s); pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(900)
            arq = f'/tmp/lacre-{nome}.png'
            pg.locator('#s').screenshot(path=arq, omit_background=True); tmp[nome] = arq
        b.close()
    def salva(nome, alfa):
        a = Image.fromarray(np.clip(alfa, 0, 255).astype('uint8'), 'L')
        im = Image.new('RGBA', a.size, (0, 0, 0, 0)); im.putalpha(a)
        caminho_saida = os.path.join(SAIDA, f'lacre-{nome}.webp')
        im.save(caminho_saida, 'WEBP', lossless=True, method=6)  # sem metadados
        print(caminho_saida, os.path.getsize(caminho_saida))
    lum = lambda n: np.asarray(Image.open(tmp[n]).convert('L')).astype(float)
    alfa = lambda n: np.asarray(Image.open(tmp[n]).convert('RGBA'))[..., 3].astype(float)
    salva('forma', alfa('forma'))
    salva('letras', alfa('letras'))
    salva('sombra', alfa('sombra'))
    salva('sombreado', (255 - lum('sombreado')) * (alfa('forma') / 255))
    salva('brilho', lum('brilho') * (alfa('forma') / 255))
    # geometria para o CSS (gradientes da cera em % da caixa 160x160)
    x0, y0, x1, y1 = BBOX; w, h = x1-x0, y1-y0
    print('cera: centro %.1f%% %.1f%%, raio %.1f%% %.1f%%' % ((x0+.4*w)/1.6, (y0+.34*h)/1.6, .72*w/1.6, .72*h/1.6))

if __name__ == '__main__':
    main()
