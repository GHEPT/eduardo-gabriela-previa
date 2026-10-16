"""
Prepara as 3 fotos da capa: recorte vertical 9:20, P&B com o tratamento
da v5.2, WebP 560x1244, SEM EXIF/GPS (os metadados nunca são copiados).

Uso:
    pip install pillow numpy
    python3 scripts/fotos.py original-1.jpg original-2.jpg original-3.jpg
    python3 scripts/fotos.py a.jpg b.jpg c.jpg --ajustes '{"1":{"cx":0.40,"zoom":1.1,"top":0.04}}'
    python3 scripts/fotos.py a.jpg --so 2         # troca só a foto 2

Ajustes por foto (todos opcionais):
    cx    centro horizontal do recorte, 0..1  (padrão 0.5)
    zoom  1 = altura inteira da foto; 1.2 = aproxima 20%
    top   início vertical do recorte, 0..1    (padrão 0)
    cor   true = mantém colorida (o CSS ainda aplica grayscale; útil p/ testes)

Saída: assets/fotos/foto-N.webp (substitui o arquivo; o site usa estes nomes).
Ajustes usados na v5.2: {"1":{"cx":0.40,"zoom":1.1,"top":0.04},"2":{"cx":0.47,"zoom":1.15,"top":0.05},"3":{"cx":0.52}}
LEMBRE: o repositório é público, então as fotos publicadas também são.
"""
import argparse, json, os
import numpy as np
from PIL import Image, ImageOps, ImageFilter

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAIDA = os.path.join(RAIZ, 'assets', 'fotos')
ASP = 9 / 20
LARG = 560

def processa(origem, n, aj):
    cx, zoom, top = aj.get('cx', .5), aj.get('zoom', 1.0), aj.get('top', 0.0)
    im = ImageOps.exif_transpose(Image.open(origem))      # respeita a rotação do celular
    im = im.convert('RGB' if aj.get('cor') else 'L')       # nova imagem: sem EXIF/GPS
    W, H = im.size
    h = H / zoom; w = h * ASP
    if w > W: w = W; h = w / ASP
    x0 = min(max(cx * W - w / 2, 0), W - w); y0 = min(max(top * H, 0), H - h)
    im = im.crop((int(x0), int(y0), int(x0 + w), int(y0 + h))).resize((LARG, round(LARG / ASP)), Image.LANCZOS)
    if not aj.get('cor'):
        a = np.asarray(im).astype(float) / 255
        lo, hi = np.percentile(a, .4), np.percentile(a, 99.6); a = np.clip((a - lo) / (hi - lo), 0, 1)
        a = a - 0.10 * np.sin(2 * np.pi * a) / (2 * np.pi)   # curva S suave
        a = 0.035 + 0.94 * a                                 # pretos levemente lavados
        a = a + np.random.default_rng(n).normal(0, .004, a.shape)  # grão de filme leve
        im = Image.fromarray((np.clip(a, 0, 1) * 255).astype('uint8'), 'L')
    im = im.filter(ImageFilter.UnsharpMask(1.2, 40, 2))
    destino = os.path.join(SAIDA, f'foto-{n}.webp')
    im.save(destino, 'WEBP', quality=68, method=6)          # sem exif= → nenhum metadado
    assert not Image.open(destino).getexif(), 'EXIF não deveria existir'
    print(f'foto-{n}.webp', im.size, f'{os.path.getsize(destino)//1024} KB')

if __name__ == '__main__':
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('originais', nargs='+')
    ap.add_argument('--ajustes', default='{}')
    ap.add_argument('--so', type=int, help='número da foto a substituir (1, 2 ou 3) quando passar só um arquivo')
    a = ap.parse_args()
    aj = json.loads(a.ajustes)
    os.makedirs(SAIDA, exist_ok=True)
    nums = [a.so] if a.so else list(range(1, len(a.originais) + 1))
    for n, f in zip(nums, a.originais):
        processa(f, n, aj.get(str(n), {}))
