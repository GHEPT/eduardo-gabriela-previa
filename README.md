# Eduardo & Gabriela: convite interativo

Site estático do casamento de **Eduardo & Gabriela**: sexta-feira, **11 de dezembro de 2026**, Cosmópolis-SP.
O convite abre como um envelope de papel algodão. O convidado toca no lacre de cera, as abas viram, uma borboleta voa e o convite sobe. Depois vêm a capa (três fotos e a contagem regressiva), o convite com o calendário, a programação, o RSVP e os presentes.

- **Sem build e sem framework.** É HTML, CSS e JS puro, com caminhos relativos, e roda no GitHub Pages do jeito que está.
- **As cores vêm só de tokens.** Trocar a paleta muda tudo (envelope, forro, lacre, borboleta, textos) sem gerar nenhuma imagem nova.
- **Nada é de mentira.** Não há Pix, cobrança ou envio de RSVP falsos: o que ainda não existe aparece como "pendente".

> **Estado:** projeto em andamento. A v5.2 já foi separada em arquivos e verificada no Chromium (o visual da paleta padrão saiu igual ao da v5.2). Também já existem as 5 paletas, o painel de testes, a tela cheia no iPhone, o PWA e o "Adicionar à agenda". O que falta está em [`docs/ROADMAP.md`](docs/ROADMAP.md), como tarefas para o Cursor com critérios de aceite.
> O arquivo original de página única fica em `reference/index-v5.2.html` (referência visual "de ouro").

Comece por [`AGENTS.md`](AGENTS.md) e [`docs/SPEC.md`](docs/SPEC.md).

## Rodar no computador
Os arquivos precisam ser servidos por http: as máscaras do lacre e o service worker não funcionam abrindo direto pelo `file://`.
```bash
npx serve -l 3000 .        # ou: npm run serve
python3 -m http.server 3000
```
Abra <http://localhost:3000>. No celular, use `http://IP-DO-COMPUTADOR:3000` na mesma rede Wi-Fi.

## Parâmetros de teste (só com `demo: true` em `js/config.js`)
| URL | Efeito |
|---|---|
| `?paleta=malva` | Troca a paleta: `azul-amarelo` · `malva` · `marrom-cafe` · `verde-rosa` · `bordo` |
| `?dev=1` | Abre o painel de testes: paleta ao vivo, fotos locais, enquadramento e cópia dos tokens |
| `?foto1=url` · `?fotos=a,b,c` · `?pos2=50%25%2030%25` | Usa fotos de teste vindas da URL |
| `?dica=1` | Força a dica "Adicione à Tela de Início" |
| `?sw=1` / `?sw=0` | Liga o service worker no localhost / remove o service worker |
| `?convite=civil` | Mostra a versão com a cerimônia civil (funciona sempre, mesmo fora da demo) |
| `#rsvp`, `#presentes`… | Pula o envelope e vai direto para a seção |

## Trocar a paleta em 1 minuto
1. Teste com `?paleta=bordo` (ou pelo painel em `?dev=1`).
2. Para fixar, mude `paleta:` em `js/config.js`.
3. Para ajustar, edite as variáveis `--p-*` do bloco da paleta em `css/paletas.css`. O botão **copiar tokens** do painel `?dev=1` copia o bloco atual.
4. Para criar uma paleta nova, rode `python3 scripts/nova-paleta.py minha.json` (detalhes em `docs/DESIGN-SYSTEM.md`).
5. Rode `npm run lint:cores` para conferir.

## Trocar as fotos em 1 minuto
- Substitua `assets/fotos/foto-1.webp`, `foto-2.webp` e `foto-3.webp` por arquivos **com o mesmo nome** (verticais, 9:20, 560×1244). Outra opção é apontar outros caminhos em `CONFIG.fotos`.
- Para o tratamento automático (recorte 9:20, P&B da v5.2, WebP e **remoção de EXIF/GPS**): `python3 scripts/fotos.py a.jpg b.jpg c.jpg` (requer `pip install pillow numpy`).
- Para só testar, use `?dev=1` e depois "fotos locais". A foto fica apenas no navegador (object URL) e **nunca é enviada**.

> **Privacidade:** o repositório do Pages é **público**, então tudo o que estiver em `assets/fotos/` fica visível para qualquer pessoa, mesmo com `noindex`. Publique só fotos que o casal aceita deixar públicas, já tratadas pelo script. Fotos originais e as referências de terceiros (`docs/referencias/`) estão no `.gitignore`.

## Publicar no GitHub Pages (`GHEPT/eduardo-gabriela-previa`, branch `master`, raiz)
1. No site final, deixe `demo: false` em `js/config.js`.
2. Aumente a `VERSAO` em `sw.js` sempre que mudar algum arquivo.
3. Envie os arquivos para a raiz da `master`: *Add file → Upload files* ou `git push`. O `.gitignore` deixa de fora o que não deve ir.
4. Em *Settings → Pages*, escolha: Deploy from a branch → `master` / `(root)`.
5. O site fica em `https://ghept.github.io/eduardo-gabriela-previa/`. Os caminhos relativos funcionam nessa subpasta.

## iPhone: tela cheia
O envelope ocupa a tela inteira, inclusive atrás da barra de status e da barra translúcida do Safari. Para isso o projeto usa `viewport-fit=cover`, altura `100lvh`, fundo do documento na cor do envelope enquanto ele está fechado e `theme-color` vindo da paleta.
**Um site comum não consegue esconder a barra de endereço do Safari.** A única forma de tela cheia de verdade é *Compartilhar → Adicionar à Tela de Início*. Por isso o site é um PWA: tem ícone do lacre, abre sem as barras do navegador e funciona offline depois da primeira visita.

## Comandos
```bash
npm install && npx playwright install chromium
npm run serve | shots | shots:paletas | lint | lint:cores | lint-taste | inspect
```

## Mapa
`index.html` · `manifest.webmanifest` · `sw.js` · `css/` (paletas → tokens → base/envelope/secoes/dev) · `js/` (config, inicio, main, agenda, pwa, dev) · `assets/` (fotos, texturas, lacre, icones) · `scripts/` · `tests/` · `tools/design-skills/` · `docs/` · `reference/index-v5.2.html`.
