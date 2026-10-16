# Spec — Abertura do convite (envelope → borboleta → página)

Referência: vídeo do casal (convite "Ethan & Olivia", envelope verde em relevo). Duração total da abertura ≈ 7 s (vídeo do Blender: 211 quadros a 30 fps), ritmo de cinema: nada rápido, nada linear, nada "seco". **Uma borboleta só.**
Paleta: usar SEMPRE tokens (`--cor-envelope`, `--cor-forro`, `--cor-lacre-*`, `--cor-borboleta-*`, `--cor-fundo`). Nada de hex fora de `css/paletas.css`.

## Observação técnica importante
No vídeo de referência a abertura é quase certamente um **render 3D pré-gravado** (relevo floral profundo com luz dinâmica, borboleta 3D com sombra). Duas formas de chegar lá:

- **Caminho A — CSS/JS (padrão deste projeto):** reproduzir a coreografia abaixo com camadas reais (abas em 3D, lacre, borboleta SVG). Troca de paleta funciona; arquivo leve.
- **Caminho B — vídeo:** tocar um MP4/WebM em tela cheia (`muted playsinline`, poster = envelope fechado) e, ao final, dar fade para a página. Fica idêntico ao vídeo, mas **não muda com a paleta** (precisa de um vídeo por paleta) e pesa 1–3 MB. Só usar se o casal tiver o vídeo do artista ou um gerado especialmente.
  - **Atualização:** o casal está gerando esse vídeo no Blender (`blender/abertura_envelope.py` → `abertura.mp4`, 1080×1920, 7 s). Com `CONFIG.aberturaVideo` preenchido, o overlay toca o vídeo e **termina quando o vídeo termina** (evento `ended`). O último quadro já é o fundo liso `--cor-fundo` (#F2F0A2 na paleta azul-amarelo), então o overlay sai com um fade curto (200 ms) sem "pulo" de cor. O vídeo **não** muda com `?paleta=`.

Implementar o Caminho A. Deixar a estrutura pronta para o B (`CONFIG.aberturaVideo = null`).

## Estado inicial (0,0 s)
- Envelope em tela cheia (full-bleed: `position:fixed; inset:0; height:100lvh`, `viewport-fit=cover`, `theme-color` = token do envelope).
- 4 abas triangulares se encontrando no centro em "X".
- Papel grosso com textura de algodão e relevo (blind emboss) **sem florais** (regra do briefing); luz do canto superior esquerdo, sombras para baixo-direita.
- Lacre de cera no centro, E&G gravado, sombra marcada para baixo-direita.
- Texto "toque para abrir" pequeno, serifa itálica, cor clara, no terço inferior da aba de baixo. Pulsar de opacidade muito sutil (0,7↔1, 2,4 s) é opcional.

## Gatilho
- Toque/clique em qualquer lugar do envelope ou Enter/Espaço (botão acessível com `aria-label="Abrir convite"`).

## Linha do tempo (t = 0 no toque)
Easing padrão "cinema" = `cubic-bezier(.65,0,.35,1)`. Abas: `cubic-bezier(.55,0,.3,1)` nos primeiros 88% e, no fim, um "assentar" de papel (passa ~2% do ângulo e volta), sem parada seca.

| t (ms) | Elemento | Ação | Duração | Easing |
|---|---|---|---|---|
| 0–700 | Envelope fechado | parado; só a câmera começa a se aproximar | 700 | — |
| 0–6700 | Cena | aproximação lenta e contínua da "câmera": container scale 1→1,06 | 6700 | cinema |
| 700–1100 | "toque para abrir" | opacidade 1→0 | 400 | cinema |
| 700–1400 | Lacre | levanta ~10 px (e um pouco em direção à tela), escala 1→1,06; opacidade 1→0 de 850 a 1400 | 700 | cinema |
| 1300–2300 | Aba de cima | `rotateX(0→180deg)`, origem na borda superior. Face interna = papel liso (`--cor-forro`). | 1000 | abas |
| 1800–2800 | Aba de baixo | `rotateX(0→-180deg)`, origem inferior | 1000 | abas |
| 2250–3250 | Aba esquerda | `rotateY(0→-180deg)`, origem esquerda | 1000 | abas |
| 2300–3300 | Aba direita | `rotateY(0→180deg)`, origem direita | 1000 | abas |
| — | Abas | **não** somem com opacidade: saem do quadro girando e ficam deitadas fora dele. `perspective: 1200px` no container. | — | — |
| 1300–3900 | Fundo do envelope | interior começa na sombra (`--cor-forro` escurecido) e clareia conforme as abas abrem | 2600 | cinema |
| 3300–3600 | — | pausa curta no envelope aberto | 300 | — |
| 3600–3850 | Borboleta (única) | sai do centro do envelope aberto: opacidade 0→1, scale .55→1 em ~800 ms, com 6 partículas douradas discretas que somem em 350 ms | 250 / 800 | ease-out |
| 3600–6500 | Borboleta | passeia devagar num "S" suave (direita, sobe, cruza para a esquerda) e **sai pelo alto da tela** (fora do quadro por volta de 6100–6200 ms; ~2,5 s bem visível). Quica levemente a cada batida, inclina nas curvas, cabeça segue a direção do voo. Asas ~2,6 batidas/s, com duas planadas (asas meio abertas, batida lenta) em ~4450 e ~5500 ms. Sombra suave no papel. Não pousa e não voa em direção à tela. | 2900 | início suave |
| 5500–6700 | Fundo | dissolve devagar para a cor exata `--cor-fundo` (papel, #F2F0A2), que é o fundo da página | 1200 | cinema |
| 6700–7000 | Fim | tela parada na cor `--cor-fundo` | 300 | — |
| 6500 | Página (Caminho A) | o conteúdo sobe (translateY 100%→0) revelando a capa com as 3 fotos. No Caminho B (vídeo), isso acontece no `ended` do vídeo (7000 ms). | 700 | cubic-bezier(.2,.7,.2,1) |
| 6800 | Botão de música | se `CONFIG.musicaUrl` existir, aparece a pílula fixa embaixo (fade 300ms). Música **nunca** toca sozinha antes do toque; após o toque de abrir pode iniciar, pois houve gesto do usuário. | 300 | ease-out |

O vídeo do Blender usa desfoque de movimento (motion blur) do Eevee.

Ao fim: remover o overlay do DOM (ou `display:none`), devolver foco ao título da capa, restaurar `theme-color` para o fundo da página.

## Borboleta
- **Uma só.** SVG inline com tokens (Caminho A): asas anteriores pontudas, posteriores recortadas, nervuras finas, borda mais escura, pintas claras, toques de dourado, leve translucidez; corpo segmentado + antenas.
- Bater de asas: duas metades com `transform: scaleX()` (ou `rotateY`) em torno do eixo do corpo.
- Sombra: elipse borrada sob a borboleta; quanto mais alta/rápida, mais distante, menor e mais transparente.
- Só usar `transform` e `opacity` durante a animação; texturas pré-rasterizadas; nada de filtros SVG pesados animando em tela cheia (desempenho no iPhone).

## Acessibilidade e casos-limite
- `prefers-reduced-motion: reduce` → pular toda a abertura e abrir direto na capa.
- Link com âncora (`#rsvp` etc.) → pular a abertura.
- Toques repetidos durante a animação são ignorados.
- Sem dependência de fonte para o lacre (imagem/SVG pronto).

## Critérios de aceite
1. Sequência e tempos batem com a tabela (±50 ms), verificados em captura de Playwright quadro a quadro (0, 700, 1400, 2000, 2800, 3300, 3600, 4450, 5500, 6200, 6700, 7000 ms).
2. Trocar `?paleta=` muda envelope, forro, lacre e borboleta sem regenerar imagens (só no Caminho A; o vídeo do Caminho B é de uma paleta só).
3. 60 fps estável em iPhone 12+ (Safari) na abertura; sem cintilar nas bordas das abas.
4. Sem erros no console; funciona offline via service worker após a 1ª visita.
5. Nenhum floral decorativo, nenhum texto inventado.
