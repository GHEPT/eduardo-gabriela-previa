"""
Relevo seco do envelope (assets/texturas/relevo.webp).

Imagem neutra: cinza 128 não altera a cor. O claro/escuro é só a luz
do alto à esquerda sobre o alto relevo. A cor do papel continua no CSS.
O desenho fica nas margens; o centro, onde o lacre pousa, fica liso.

    python3 scripts/gerar-relevo.py
"""
import math
import os
import numpy as np
from PIL import Image, ImageFilter

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAIDA = os.path.join(RAIZ, 'assets', 'texturas', 'relevo.webp')
# mesma proporção do iPhone (390×844), em 2×
W, H = 780, 1688

def curva(p0, p1, p2, n=48):
    t = np.linspace(0, 1, n)
    p0, p1, p2 = map(np.asarray, (p0, p1, p2))
    return (1-t)[:, None]**2 * p0 + 2*(1-t)[:, None]*t[:, None]*p1 + (t**2)[:, None]*p2

def traco(h, pts, largura, altura):
    pts = np.asarray(pts, float)
    for i in range(len(pts) - 1):
        x0, y0 = pts[i]; x1, y1 = pts[i+1]
        comp = max(1.0, math.hypot(x1-x0, y1-y0))
        for s in np.linspace(0, 1, int(comp) + 1):
            x = x0 + (x1-x0)*s; y = y0 + (y1-y0)*s
            disco(h, x, y, largura, altura)

def disco(h, cx, cy, r, altura):
    x0, x1 = max(0, int(cx-r-1)), min(W, int(cx+r+2))
    y0, y1 = max(0, int(cy-r-1)), min(H, int(cy+r+2))
    if x0 >= x1 or y0 >= y1: return
    yy, xx = np.ogrid[y0:y1, x0:x1]
    d = np.sqrt((xx-cx)**2 + (yy-cy)**2) / r
    blob = np.clip(1 - d, 0, 1) ** 1.4
    h[y0:y1, x0:x1] = np.maximum(h[y0:y1, x0:x1], blob * altura)

def elipse(h, cx, cy, rx, ry, ang, altura):
    ca, sa = math.cos(ang), math.sin(ang)
    pad = int(max(rx, ry)) + 3
    x0, x1 = max(0, int(cx-pad)), min(W, int(cx+pad))
    y0, y1 = max(0, int(cy-pad)), min(H, int(cy+pad))
    if x0 >= x1 or y0 >= y1: return
    yy, xx = np.ogrid[y0:y1, x0:x1]
    dx, dy = xx - cx, yy - cy
    xr = (dx*ca + dy*sa) / rx
    yr = (-dx*sa + dy*ca) / ry
    d = np.sqrt(xr*xr + yr*yr)
    blob = np.clip(1 - d, 0, 1) ** 1.15
    h[y0:y1, x0:x1] = np.maximum(h[y0:y1, x0:x1], blob * altura)

def sulco(h, a, b, largura, fundo):
    x0, y0 = a; x1, y1 = b
    comp = max(1.0, math.hypot(x1-x0, y1-y0))
    passos = np.linspace(0, 1, int(comp) + 1)
    for s in passos:
        x = x0 + (x1-x0)*s; y = y0 + (y1-y0)*s
        xa, xb = max(0, int(x-largura-1)), min(W, int(x+largura+2))
        ya, yb = max(0, int(y-largura-1)), min(H, int(y+largura+2))
        if xa >= xb or ya >= yb: continue
        yy, xx = np.ogrid[ya:yb, xa:xb]
        d = np.sqrt((xx-x)**2 + (yy-y)**2) / largura
        h[ya:yb, xa:xb] *= 1 - np.clip(1 - d, 0, 1)**1.6 * fundo

def folha(h, cx, cy, ang, comp, larg, altura):
    elipse(h, cx + math.cos(ang)*comp*.35, cy + math.sin(ang)*comp*.35, comp*.62, larg, ang, altura)
    sulco(h, (cx, cy), (cx + math.cos(ang)*comp*.85, cy + math.sin(ang)*comp*.85), max(1.4, larg*.16), .42)

def flor(h, cx, cy, comp, n, rot, altura=1):
    for i in range(n):
        a = rot + i * 2*math.pi/n
        elipse(h, cx + math.cos(a)*comp*.46, cy + math.sin(a)*comp*.46, comp*.62, comp*.40, a, altura)
    elipse(h, cx, cy, comp*.28, comp*.28, 0, altura*.9)
    disco(h, cx, cy, comp*.12, altura*.55)

def ramo(h, p0, p1, p2, folhas, altura=.72):
    pts = curva(p0, p1, p2, 64)
    traco(h, pts, 2.4, altura*.55)
    for t, ang, comp in folhas:
        i = min(len(pts)-1, int(t*(len(pts)-1)))
        d = pts[min(i+1, len(pts)-1)] - pts[max(i-1, 0)]
        base = math.atan2(d[1], d[0])
        folha(h, pts[i,0], pts[i,1], base + ang, comp, comp*.38, altura)

def desenha():
    h = np.zeros((H, W), np.float32)
    # flores grandes, cortadas pela borda, como numa folha prensada
    flor(h, -10, 520, 150, 5, .35, 1)
    flor(h, 40, 1480, 170, 5, .9, 1)
    flor(h, 700, 80, 130, 5, .15, .95)
    flor(h, 790, 1180, 120, 5, .5, .9)
    flor(h, 180, 40, 90, 5, 1.2, .85)
    flor(h, 560, 1620, 100, 5, .4, .85)
    ramo(h, (-20, 80), (160, 40), (80, 260),
         [(.2, 1.1, 110), (.42, -.9, 90), (.68, 1.0, 80), (.9, -.7, 60)], .8)
    ramo(h, (800, 200), (640, 340), (760, 520),
         [(.18, -1.15, 100), (.4, .95, 86), (.62, -1.0, 74), (.85, .8, 64)], .78)
    ramo(h, (-30, 860), (90, 1040), (20, 1240),
         [(.25, .85, 96), (.5, -1.05, 84), (.78, .75, 70)], .75)
    ramo(h, (800, 700), (700, 860), (780, 1080),
         [(.2, -1.0, 88), (.48, .9, 96), (.75, -.85, 70)], .75)
    for x, y, r in ((690, 640, 16), (650, 720, 11), (720, 800, 13), (140, 700, 12), (200, 640, 9)):
        disco(h, x, y, r, .6)
    # o lacre fica no centro: ali o papel continua liso
    yy, xx = np.ogrid[:H, :W]
    d = np.sqrt(((xx-390)/230)**2 + ((yy-820)/210)**2)
    h *= np.clip((d - .55) / .45, 0, 1)
    return h

def luz(h):
    suave = np.asarray(Image.fromarray(np.clip(h*255, 0, 255).astype('uint8'), 'L')
                       .filter(ImageFilter.GaussianBlur(1.6)), float) / 255
    gx = np.zeros_like(suave); gy = np.zeros_like(suave)
    gx[:, 1:-1] = suave[:, 2:] - suave[:, :-2]
    gy[1:-1, :] = suave[2:, :] - suave[:-2, :]
    lx, ly, lz = -.5, -.62, .6
    n = math.sqrt(lx*lx + ly*ly + lz*lz)
    lx, ly, lz = lx/n, ly/n, lz/n
    nx, ny = -gx*5.5, -gy*5.5
    nn = np.sqrt(nx*nx + ny*ny + 1)
    nd = (nx*lx + ny*ly + lz) / nn
    alto = nd - lz
    sombra = np.roll(np.roll(suave, 8, axis=0), 6, axis=1)
    sombra[:8, :] = 0; sombra[:, :6] = 0
    sombra *= np.clip(1 - suave*4, 0, 1)
    out = 128 + alto*190 - sombra*70
    out = np.clip(out, 28, 228)
    out += 128 - out.mean()
    return np.clip(out, 0, 255).astype('uint8')

def main():
    img = luz(desenha())
    Image.fromarray(img, 'L').save(SAIDA, 'WEBP', quality=82, method=6)
    print(SAIDA, os.path.getsize(SAIDA), 'média', round(float(img.mean()), 1))

if __name__ == '__main__':
    main()
