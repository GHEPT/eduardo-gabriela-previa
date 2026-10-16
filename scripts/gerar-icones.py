"""
Gera os ícones do app (Tela de Início / PWA) a partir do lacre + envelope,
nas cores de UMA paleta (ícones são imagens: não mudam sozinhos com o CSS).

    pip install playwright pillow && python -m playwright install chromium
    python3 scripts/gerar-icones.py                 # paleta azul-amarelo
    python3 scripts/gerar-icones.py malva           # outra paleta

Saída em assets/icones/: apple-touch-icon.png (180), icone-192.png,
icone-512.png e icone-maskable-512.png (lacre dentro da zona segura de 80%).
Depois, atualize theme_color/background_color do manifest.webmanifest com a
cor --p-env-cima da paleta (o script imprime o valor).
"""
import os, sys, threading, functools, http.server
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PALETA = sys.argv[1] if len(sys.argv) > 1 else 'azul-amarelo'
LACRE = ('<span class="lacre"><span class="lacre-sombra"></span><span class="lacre-base"><span class="lacre-cera"></span>'
         '<span class="lacre-disco"></span><span class="lacre-anel"></span><span class="lacre-letras"></span>'
         '<span class="lacre-sombreado"></span></span><span class="lacre-brilho"></span></span>')
PAGINA = '''<!doctype html><html data-paleta="%s"><head>
<link rel="stylesheet" href="/css/paletas.css"><link rel="stylesheet" href="/css/tokens.css"><link rel="stylesheet" href="/css/envelope.css">
<style>html,body{margin:0}.i{width:512px;height:512px;background-color:var(--cor-envelope-claro);background-image:var(--textura-algodao);
background-size:360px;background-blend-mode:soft-light;display:grid;place-items:center}.i .lacre{width:%dpx;height:%dpx}</style></head>
<body><div class="i">%s</div></body></html>'''

def main():
    from playwright.sync_api import sync_playwright
    class Quieto(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    H = functools.partial(Quieto, directory=RAIZ)
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), H); porta = srv.server_address[1]
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    destino = os.path.join(RAIZ, 'assets', 'icones'); os.makedirs(destino, exist_ok=True)
    chrome = os.environ.get('CHROME', '/usr/bin/google-chrome')
    with sync_playwright() as p:
        b = p.chromium.launch(**({'executable_path': chrome} if os.path.exists(chrome) else {}))
        pg = b.new_page(viewport={'width': 600, 'height': 600})
        cor = None
        for nome, tam in [('normal', 376), ('maskable', 300)]:
            with open(os.path.join(RAIZ, '_icone.html'), 'w') as f: f.write(PAGINA % (PALETA, tam, tam, LACRE))
            pg.goto(f'http://127.0.0.1:{porta}/_icone.html'); pg.wait_for_load_state('networkidle'); pg.wait_for_timeout(400)
            pg.locator('.i').screenshot(path=f'/tmp/icone-{nome}.png')
            cor = pg.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--cor-envelope-claro').trim()")
        b.close()
    os.remove(os.path.join(RAIZ, '_icone.html')); srv.shutdown()
    def salva(im, arq, lado):
        im.resize((lado, lado), Image.LANCZOS).quantize(128, method=Image.Quantize.MEDIANCUT).save(os.path.join(destino, arq), optimize=True)
        print(arq, os.path.getsize(os.path.join(destino, arq)) // 1024, 'KB')
    n = Image.open('/tmp/icone-normal.png').convert('RGB'); m = Image.open('/tmp/icone-maskable.png').convert('RGB')
    salva(n, 'apple-touch-icon.png', 180); salva(n, 'icone-192.png', 192); salva(n, 'icone-512.png', 512)
    salva(m, 'icone-maskable-512.png', 512)
    print('theme_color / background_color do manifest:', cor)

if __name__ == '__main__':
    main()
