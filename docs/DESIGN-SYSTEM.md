# DESIGN-SYSTEM

## 1. Tokens em duas camadas
1. **Primitivas** (`--p-*`), em `css/paletas.css`: um bloco `[data-paleta="nome"]` por paleta, todos com **as mesmas 80 variáveis**. Elas são as "amostras" de cor da paleta.
2. **Semânticas** (`--cor-*`, `--rgb-*`, `--lacre-*`), em `css/tokens.css`: dizem **onde** cada primitiva é usada. Todo o resto do CSS e do JS usa só as semânticas.

O mesmo arquivo `tokens.css` também guarda os tokens que não são de cor: tipografia (`--fonte-serif`, `--fonte-script`, tamanhos), espaçamento (`--secao-y`, `--espaco-1..5`, `--largura-miolo`), forma (`--raio: 0`, tamanhos do lacre), sombras (só a geometria: a cor vem das `--rgb-*`), movimento (`--curva-abrir`, `--curva-suave`, `--curva-voo`, `--curva-sobe`, `--dur-aba`, `--dur-revelar`) e texturas.

As `--rgb-*` guardam trios do tipo `16,30,56`, usados como `rgba(var(--rgb-sombra), .3)` quando é preciso transparência.

### Tokens semânticos principais
| Token | Uso |
|---|---|
| `--cor-fundo`, `--cor-texto`, `--cor-texto-suave`, `--cor-texto-pendente`, `--cor-placeholder` | Página e texto |
| `--cor-linha`, `--cor-filete` | Linhas de campo, linha do tempo |
| `--cor-destaque` / `-hover`, `--cor-sobre-destaque` | Botões, coração, links, foco |
| `--cor-acento`, `--cor-foil-1..5`, `--foil` | Dourado: pontos e "&" em foil |
| `--cor-fundo-secao-programacao`, `--cor-fundo-secao-presentes` | Fundos de seção |
| `--cor-mesa`, `--cor-envelope`, `-claro`, `-medio`, `-sombra` | Mesa e as 4 abas (baixo, cima, esquerda, direita) |
| `--cor-envelope-texto`, `--cor-envelope-realce`, `--cor-toque` | Relevo seco no envelope |
| `--cor-forro`, `--cor-forro-verso`, `--rgb-forro-oclusao`, `--rgb-forro-verso` | Papel de dentro |
| `--rgb-sombra`, `--rgb-luz`, `--rgb-sombra-envelope`, `--aba-verso-sombra`, `--aba-verso-clareia` | Sombras, vincos e luz |
| `--cor-lacre-claro/medio/escuro`, `-disco-1/2`, `-anel`, `--lacre-letra`, `--cor-lacre-sombreado`, `--cor-lacre-brilho`, `--lacre-brilho-forca`, `--rgb-lacre-sombra` | Lacre |
| `--cor-borboleta-anterior-1..4`, `-posterior-1..4`, `-borda-1/2`, `-veia`, `-ponto`, `-tracejado`, `-ocelo`, `-ouro-1..4`, `-corpo-1/2`, `-listra`, `-brilho`, `-antena`, `-olho`, `-reflexo` | Borboleta (SVG inline com classes `.bf-*`) |
| `--cor-foto-vazia-1..3`, `--cor-foto-rotulo`, `--cor-foto-numero`, `--rgb-veu-foto` | Fotos |
| `--cor-tema-envelope`, `--cor-tema-navegador` | `<meta theme-color>`: envelope fechado / site aberto |

## 2. Imagens que não dependem da paleta
- **Texturas** (`assets/texturas/papel.webp`, `algodao.webp`): relevo cinza (média ≈ 128) aplicado com `background-blend-mode: soft-light` sobre a cor do token. Arquivo de 512px exibido a 256px. `relevo.webp` é o alto relevo seco do envelope (flores e folhas nas margens, centro liso), também neutro, gerado por `scripts/gerar-relevo.py`. Cobre a folha inteira, alinhado nas quatro abas.
- **Lacre:** são 5 máscaras alfa em `assets/lacre/` (forma, letras, sombreado, brilho, sombra), feitas por `scripts/gerar-lacre.py`. O CSS empilha as camadas:
  1. sombra na mesa;
  2. cera (gradiente radial de tokens, recortado pela forma);
  3. disco prensado;
  4. anel;
  5. letras (`--lacre-letra` aceita cor sólida ou gradiente, como o foil da malva);
  6. sombreado (com `brightness(1.2)` no grupo);
  7. brilho especular (`--lacre-brilho-forca`).
- **Borboleta:** SVG inline. Todas as cores ficam nas classes `.bf-*` → tokens. A sombra é um clone feito pelo JS com `brightness(0) blur()`.
- **Ícones do app:** são a única imagem que **depende** da paleta. Para refazer: `scripts/gerar-icones.py <paleta>`.

## 3. Paletas (todas as primitivas)
`azul-amarelo` é a paleta padrão. Cores confirmadas: papel `#F2F0A2`, azul `#08388C`, azulado `#AACAF2`, ouro `#FFC508`. O restante do bloco são misturas dessas quatro, com contraste de texto preservado. `malva` = v5.1. As outras três foram geradas por `scripts/nova-paleta.py` a partir de cores amostradas dos moodboards e são **pontos de partida**: precisam do olhar do casal.

| primitiva | azul-amarelo | malva | marrom-cafe | verde-rosa | bordo |
|---|---|---|---|---|---|
| `--p-papel` | #F2F0A2 | #F5F0E8 | #F4EFE6 | #F6F1EA | #F6F2EC |
| `--p-papel-rgb` | 242,240,162 | 245,240,232 | 244,239,230 | 246,241,234 | 246,242,236 |
| `--p-papel-mesa` | #E9E488 | #E9E1E2 | #EDE7DD | #EFEBE2 | #EDE4DF |
| `--p-campo` | #AACAF2 | #ECE3E6 | #E7E1D6 | #E9E6DD | #E7DAD6 |
| `--p-campo-rgb` | 170,202,242 | 236,227,230 | 231,225,214 | 233,230,221 | 231,218,214 |
| `--p-campo-2` | #FFC508 | #ECE3E6 | #EFE6D8 | #F5E6DF | #F1E8DC |
| `--p-tinta` | #08388C | #4A2F42 | #2B1C13 | #2F3A24 | #3D1015 |
| `--p-tinta-media` | #2C58A2 | #6E4E62 | #5D5148 | #616856 | #6B484B |
| `--p-tinta-clara` | #3561A9 | #8E6F82 | #7F756C | #838777 | #8B6F6F |
| `--p-tinta-placeholder` | #5C84C1 | #9C8794 | #90867C | #929687 | #9A8180 |
| `--p-linha` | #4972B5 | #8C6A7E | #7C6957 | #7E896D | #712A33 |
| `--p-filete` | #BCD4DE | #CDBFC7 | #CABFB2 | #CCCDBD | #C4A4A4 |
| `--p-profundo` | #08388C | #5B2A4A | #452411 | #3E4A2A | #572028 |
| `--p-profundo-rgb` | 8,56,140 | 91,42,74 | 69,36,17 | 62,74,42 | 87,32,40 |
| `--p-profundo-hover` | #062C6D | #4C2240 | #391E0E | #333D22 | #471A21 |
| `--p-sobre-profundo` | #F2F0A2 | #F7F1EC | #F7F4EE | #F9F5F0 | #F9F6F2 |
| `--p-erro` | #9A3B2E | #8E2F45 | #9A3B2E | #9A3B2E | #9A3B2E |
| `--p-desab` | #D2DFC6 | #DCCFD5 | #DDD5C9 | #DFDDD1 | #DBC7C4 |
| `--p-desab-tinta` | #2C58A2 | #7E6574 | #675B52 | #6B715F | #745456 |
| `--p-ouro` | #FFC508 | #A8874F | #B08A4E | #B39368 | #A8885A |
| `--p-foil-1` | #CF9405 | #93713F | #997844 | #9C805A | #92764E |
| `--p-foil-2` | #FFDD70 | #C6A66B | #C8AD83 | #CAB395 | #C2AC8C |
| `--p-foil-3` | #FFC508 | #A3824C | #B08A4E | #B39368 | #A8885A |
| `--p-foil-4` | #FFD235 | #BE9C60 | #C4A77A | #C6AE8E | #BEA683 |
| `--p-foil-5` | #B68004 | #8C6B3B | #907140 | #937955 | #8A704A |
| `--p-env-cima` | #08388C | #B99DAD | #92816E | #949E83 | #833D46 |
| `--p-env-baixo` | #08388C | #B094A4 | #8A7763 | #8C977A | #7A2E38 |
| `--p-env-esq` | #08388C | #A88A9B | #84725F | #869175 | #752C36 |
| `--p-env-dir` | #08388C | #A28495 | #7F6D5B | #818B70 | #702A34 |
| `--p-env-tinta` | #F2F0A2 | #F4ECEF | #F8F5F0 | #FAF7F2 | #FAF7F4 |
| `--p-env-realce` | #FFC508 | #E6D3A8 | #D4BF9E | #D5C4AC | #CFBEA4 |
| `--p-aba-sombra` | #041F4D | #2E1024 | #1C120C | #1F2617 | #280A0E |
| `--p-forro` | #F2F0A2 | #E7D9DF | #E8DCC6 | #EBCDBF | #EDE5D8 |
| `--p-forro-verso` | #F7F6C7 | #EDE1E6 | #EBE1CF | #EED4C9 | #F0E9DE |
| `--p-forro-oclusao-rgb` | 191,185,119 | 70,30,55 | 104,99,89 | 106,92,86 | 107,103,97 |
| `--p-forro-verso-rgb` | 222,218,144 | 120,70,100 | 128,121,109 | 129,113,105 | 130,126,119 |
| `--p-sombra-rgb` | 4,25,63 | 45,16,34 | 24,15,10 | 26,32,20 | 34,9,12 |
| `--p-env-sombra-rgb` | 4,28,70 | 50,20,40 | 24,15,10 | 26,32,20 | 34,9,12 |
| `--p-luz-rgb` | 250,252,255 | 255,246,250 | 253,253,251 | 254,253,252 | 254,253,252 |
| `--p-verso-sombra` | .22 | .35 | .22 | .22 | .22 |
| `--p-verso-clareia` | .26 | .45 | .26 | .26 | .26 |
| `--p-cera-1` | #FFD54D | #8A4872 | #866859 | #92696F | #C4A77D |
| `--p-cera-2` | #FFC508 | #62294F | #5E3622 | #6E373F | #B08A52 |
| `--p-cera-3` | #926703 | #3A1530 | #382014 | #422126 | #6A5331 |
| `--p-cera-disco-1` | #EAB006 | #5E2A4C | #5B3421 | #6B353D | #AB8650 |
| `--p-cera-disco-2` | #CC9505 | #47193A | #4E2D1C | #5B2E34 | #927344 |
| `--p-cera-anel` | #996F04 | #6E3560 | #583320 | #67343B | #A5824D |
| `--p-cera-letra` | gradiente foil | gradiente foil | #422618 | #4D262C | #7B6139 |
| `--p-cera-sombreado` | #2E2301 | #1E0817 | #0E0805 | #110809 | #1A150C |
| `--p-cera-brilho` | #FFEFBA | #FFE8F3 | #E7E1DE | #E9E1E2 | #F3EDE5 |
| `--p-cera-brilho-forca` | .82 | 1 | .62 | .62 | .62 |
| `--p-cera-sombra-rgb` | 46,35,1 | 42,15,33 | 24,15,10 | 26,32,20 | 34,9,12 |
| `--p-asa-1` | #FFD13D | #F6E6EE | #F6F3F0 | #FAF4F2 | #FAF8F4 |
| `--p-asa-2` | #FFC508 | #E4C3D3 | #D9CEC0 | #EAD3CA | #ECE2D2 |
| `--p-asa-3` | #FFC508 | #C597AF | #B39C82 | #D5A796 | #D9C6A6 |
| `--p-asa-4` | #EBB400 | #8E5E7B | #746554 | #8A6D62 | #8D816C |
| `--p-asa-pos-1` | #FFD13D | #F4E2EA | #F8F6F4 | #FBF7F6 | #FCFAF7 |
| `--p-asa-pos-2` | #FFC508 | #DDB6C9 | #DBD0C4 | #EBD6CE | #EDE4D5 |
| `--p-asa-pos-3` | #FFC508 | #B98AA3 | #B39C82 | #D5A796 | #D9C6A6 |
| `--p-asa-pos-4` | #EBB400 | #835372 | #6F6151 | #84685D | #877B67 |
| `--p-asa-borda-1` | #08388C | #7A4868 | #4C3F33 | #594C3F | #5E4A40 |
| `--p-asa-borda-2` | #08388C | #4A2240 | #372C23 | #403A2E | #46302B |
| `--p-asa-veia` | #08388C | #6E4260 | #625648 | #755C52 | #776D5B |
| `--p-asa-ponto` | #08388C | #F7ECF1 | #FAF7F2 | #FAF8F4 | #FAF8F6 |
| `--p-asa-tracejado` | #08388C | #D9B98A | #CCB38C | #CEB99D | #C6B294 |
| `--p-asa-ocelo` | #08388C | #C9A66B | #C1A475 | #C4AB89 | #BBA27E |
| `--p-asa-ouro-1` | #08388C | #93713F | #997844 | #9C805A | #92764E |
| `--p-asa-ouro-2` | #08388C | #D2B27A | #CCB38C | #CEB99D | #C6B294 |
| `--p-asa-ouro-3` | #08388C | #A3824C | #B08A4E | #B39368 | #A8885A |
| `--p-asa-ouro-4` | #08388C | #C9A86C | #C0A171 | #C2A986 | #B9A07B |
| `--p-corpo-1` | #062E74 | #2E1426 | #1C120C | #1F2617 | #280A0E |
| `--p-corpo-2` | #08388C | #6B3B5C | #614F3F | #716652 | #7B594F |
| `--p-corpo-listra` | #FFC508 | #B48CA6 | #C0AD96 | #DCB6A7 | #DFCFB4 |
| `--p-corpo-brilho` | #FFD13D | #C9A6BD | #D1C4B4 | #E6CAC0 | #E8DDCA |
| `--p-antena` | #08388C | #3A1A30 | #22160F | #262E1D | #310D11 |
| `--p-olho` | #FFC508 | #5B2A4A | #2B1C13 | #2F3A24 | #3D1015 |
| `--p-foto-1` | #82A6D8 | #9F8B97 | #97999A | #979E9E | #948B92 |
| `--p-foto-2` | #7197CE | #93808C | #939699 | #93999C | #918F95 |
| `--p-foto-3` | #B1CEF3 | #A4919C | #969696 | #979E9B | #92858C |
| `--p-foto-rotulo` | #F8F8D0 | #F5EEF1 | #FAF7F2 | #FAF8F4 | #FAF8F6 |

Âncoras usadas no gerador:
- **marrom-cafe**: papel `#F4EFE6`, tinta `#2B1C13`, profundo `#452411`, envelope `#8A7763`, forro `#E8DCC6`, ouro `#B08A4E`, cera `#5E3622`, asa `#B39C82`.
- **verde-rosa**: papel `#F6F1EA`, tinta `#2F3A24`, profundo `#3E4A2A`, envelope `#8C977A`, forro `#EBCDBF`, ouro `#B39368`, cera `#6E373F`, asa `#D5A796`.
- **bordo**: papel `#F6F2EC`, tinta `#3D1015`, profundo `#572028`, envelope `#7A2E38`, forro `#EDE5D8`, ouro `#A8885A`, cera `#B08A52` (dourada), asa `#D9C6A6`.

Observações:
- no **bordô**, os filetes claros do relevo ficam fortes demais no envelope escuro (reduzir `--p-luz-rgb`);
- no **marrom**, o "&" do envelope tem pouco contraste;
- nas três paletas geradas, a borboleta fica clara demais.

## 4. Como adicionar ou ajustar uma paleta
1. `python3 scripts/nova-paleta.py --amostrar docs/referencias/moodboard.jpg` mostra as 8 cores dominantes da imagem.
2. Monte um `minha.json` com `nome, titulo, papel, tinta, profundo, envelope, forro, ouro, cera, asa, campo2` e rode `python3 scripts/nova-paleta.py minha.json`.
3. Cole o bloco no fim de `css/paletas.css` e adicione o nome em `CONFIG.paletas` (`js/config.js`).
4. Teste com `?paleta=nome&dev=1`, ajuste ao vivo pelo DevTools e use "copiar tokens" para levar os valores ao CSS.
5. Rode `npm run lint:cores` e `npm run shots:paletas`.
6. Regras de contraste: `--p-tinta` e `--p-tinta-media` sobre `--p-papel` ≥ 4,5:1, e `--p-env-tinta` sobre as abas ≥ 3:1 (texto grande).

## 5. Tipografia
- **Brotherhood Script** (Youssef Habchi), em teste agora na capa e nos títulos script. **Faith** (Aburayyan) e **Glamour** (Master Type) ficam como reserva. As licenças gratuitas valem para uso pessoal; os arquivos ficam em `assets/fontes/` e **não entram no git** (o repositório é público). Sem o arquivo, o navegador cai em Pinyon Script. Para publicar no site ao vivo, a licença de webfont é a do autor.
- **Blosta Script** (Alcode): nomes, títulos de seção (`--titulo-secao`, de 46 a 64px), títulos dos eventos. Nunca em parágrafo. Enquanto o arquivo com licença de webfont não estiver em `assets/fontes/`, o navegador usa Pinyon Script.
- **Eyesome** (VP Creative Shop): texto (18px, 19px no desktop), itálico para notas, números lineares (`lnum`) e tabulares na contagem. Mesma reserva: sem o webfont licenciado, cai em Cormorant Garamond.
- As duas são comerciais. A licença do Canva não autoriza tirar o arquivo de lá e publicar neste site.
- **Caixa-alta espaçada** (`.caps`: 13px, 500, 0,24em, cor suave): datas, cidade, rótulos de formulário e da contagem. Compensar o espaço à direita (`margin-right: -.24em`) quando o texto estiver centralizado.
- "&" em foil (`.amp`), com reserva de cor sólida. Na capa, o "&" sai da script e vai para a itálica da serif, na cor de destaque, entre os dois nomes.

## 6. Movimento
- Uma única coreografia de abertura (SPEC §3) e revelações de 0,9s ao rolar (12px + opacidade). O coração do calendário se desenha em 1,6s.
- Só `transform` e `opacity`. Nada de *parallax*, *autoplay* ou *loop* infinito. A borboleta voa **uma vez**.
- `prefers-reduced-motion` desliga tudo.
- Curvas: `--curva-abrir` (abas), `--curva-suave` (lacre), `--curva-voo`, `--curva-sobe`. O envelope abre no lugar, sem recuar.

## 7. Evitar
Gradientes chamativos, excesso de animação, florais decorativos, ícones genéricos, cards repetidos, cara de dashboard, cara de IA, emoji, sombras em elementos parados (exceto os materiais físicos: papel, cera, foil), cantos arredondados (é papelaria: `--raio: 0`).
