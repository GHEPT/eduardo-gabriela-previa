# SPEC: especificação funcional e visual

Convite interativo do casamento de **Eduardo & Gabriela**. Página única, estática, em pt-BR, pensada primeiro para o iPhone Safari.
Referência aprovada: `reference/index-v5.2.html`. **Estado do código:** v5.2 separada em arquivos, com tokens, 5 paletas, painel de testes, tela cheia, PWA e .ics já implementados e testados no Chromium (WebKit/Linux com teste parcial). O que falta está em `ROADMAP.md`.

## 1. Fatos (fonte: o casal; não alterar sem confirmação)
- Data: **sexta-feira, 11 de dezembro de 2026**, Cosmópolis-SP. Fuso -03:00 (America/Sao_Paulo, sem horário de verão).
- **Almoço comemorativo** às **11h30** no **Quintal 7&7**, R. Adolfo Germano Rogge, 440, Parque das Laranjeiras II, Cosmópolis-SP. Instagram @quintal_77.
- **Cerimônia civil** às **10h15**, só no convite `?convite=civil`: Cartório de Registro de Imóveis e Civil de Pessoas Naturais, R. Ramos de Azevedo, 268, Centro, Cosmópolis-SP, 13150-025. "Cerimônia reservada, com lugares limitados."
- Prazo do RSVP: **31 de outubro de 2026**, 23h59 em Brasília.
- Horário de término dos eventos: **PENDENTE** (não inventar).

## 2. Parâmetros de URL e estados globais
| Parâmetro | Disponível | Efeito |
|---|---|---|
| `?convite=civil` | sempre | Inclui a cerimônia civil na programação, a contagem mira 10h15 e a linha do convite vira "cerimônia civil e almoço comemorativo". Qualquer outro valor = convite geral. |
| `#secao` | sempre | Pula o envelope (abre direto) e vai para a âncora. |
| `?paleta=nome` | demo | Aplica a paleta antes de pintar a tela. Nome inválido = padrão. |
| `?foto1..3=url`, `?fotos=a,b,c`, `?pos1..3=` | demo | Fotos e enquadramento de teste. Aceita caminho relativo, `https:`, `blob:` ou `data:image/`. Rejeita `javascript:`. |
| `?dev=1` | demo | Painel de testes (seção 10). |
| `?dica=1` | demo | Força a dica da Tela de Início. |
| `?sw=1` / `?sw=0` | sempre | Força o registro do service worker no localhost / remove todos. |

Estados do `<html>`: `.fechado` (envelope na tela, rolagem travada), `.abrindo` (animação), sem classe (site aberto). `.js` é adicionado no `<head>`. `data-paleta` sempre fica no `<html>`.
`CONFIG.demo = true` libera os parâmetros marcados como demo. O selo "demo" não aparece. No site final, `demo: false`.

## 3. Abertura (envelope)
A coreografia, os tempos e o aceite estão em `docs/ABERTURA.md` (Caminho A, cerca de 2,5s). Este arquivo não repete a tabela.
- Tela inteira, **full-bleed** (seção 11). As quatro abas são triângulos com `clip-path`, cada uma com face e verso (`backface-visibility`). No DOM o verso vem antes da face. A face interna é papel liso (`--cor-forro`), sem relevo floral.
- Fechado: só o papel da paleta, sem nomes e sem data. Algodão, luz do alto à esquerda, sombra do X para baixo-direita. Lacre no centro. "toque para abrir" no terço inferior da aba de baixo.
- Estados: `idle`, `opening` (um toque, sem reinício) e `complete` (o overlay sai, `theme-color` volta ao papel, foco no `h1`).
- `CONFIG.aberturaVideo` aponta para o mp4. No toque ele toca mudo, em tela cheia, e sai no `ended`. Se o arquivo falhar, vale a abertura em CSS.
- `prefers-reduced-motion` e um link com hash (ex.: `#rsvp`) abrem direto na capa, sem o vídeo. Sem JS, o envelope fica escondido (`<noscript>`).
- **Aceite:** o de `docs/ABERTURA.md`. A capa, a contagem, o `?convite=civil`, o RSVP e os presentes continuam.

## 4. Capa
- Fundo na cor do forro (`--cor-forro`), o mesmo branco de papel que aparece quando o envelope abre. O restante da página continua no papel.
- `h1` script "Eduardo & Gabriela": os dois nomes centralizados, o segundo um pouco abaixo do primeiro. O "&" fica numa camada por cima, em itálico da serif, na cor de destaque (`--cor-acento`), e não entra no posicionamento dos nomes. Uma foto só, em P&B, com a largura inteira e a altura cortada acima das tatuagens. Duas barras na cor do papel sugerem três quadros, com "11", "12" e "26" dentro de cada faixa, sobre um véu neutro. Abaixo: "Cosmópolis · SP", a contagem (dias · horas · min · seg) e o versículo.
- Uma cruz fina fica atrás do conteúdo, em marca d'água (`opacity` baixa, cor do texto). Não compete com as fotos.
- Versículo: “E, acima de tudo, tenham amor, pois o amor une perfeitamente todas as coisas.” Colossenses 3:14. Sem a frase "até o almoço" e sem o link "o convite".
- Contagem: alvo `CONFIG.datas.almoco` (ou `civil`). Ao zerar, mostra "Hoje celebramos." até `fimDoDia`; depois, "Celebramos em 11 de dezembro de 2026. Obrigado por fazer parte."
- Fotos: uma imagem só (`CONFIG.fotoFaixa`), sem esticar. A altura para antes das tatuagens. As barras não escondem um pedaço diferente em cada quadro: a foto continua por baixo. Sem a faixa, valem as três de `CONFIG.fotos`.
- **Aceite:** o relógio não "pula"; a contagem fica certa em qualquer fuso do aparelho; as fotos carregam sem distorcer; o texto alternativo é descritivo.

## 5. Convite + calendário
Frase "Com alegria, convidamos você para celebrar o nosso casamento." (itálico, peso 600), o tipo de evento em caps, o calendário de dezembro/2026 com o dia 11 contornado por um coração que se desenha ao aparecer (o dia da semana é calculado). Abaixo do calendário, um destaque com parêntese à esquerda: "Comemoração" e "11h30". Sem a legenda "sexta-feira, dia 11".

## 6. Programação
- Linha do tempo gerada de `CONFIG.eventos` (o civil só aparece com `?convite=civil`): hora, título script, local, endereço, nota e Instagram.
- Links "Abrir no Google Maps" e "Waze".
- **Adicionar à agenda** (implementado, em `js/agenda.js`):
  - **.ics** gerado no navegador (RFC 5545) como link `data:text/calendar`, com `download`.
  - Usa `VTIMEZONE America/Sao_Paulo` (-03:00 fixo) e `DTSTART;TZID=…`. `DTEND` só existe se `agenda.fim` estiver preenchido (hoje está pendente).
  - Alarmes `VALARM` de `CONFIG.lembretes`: **7 dias, 1 dia e 2 horas antes**.
  - Linhas dobradas em 75 octetos UTF-8; UID estável `id-data@eduardo-gabriela`.
  - Link **Google Agenda** (`calendar.google.com/calendar/render?action=TEMPLATE…&ctz=America/Sao_Paulo`). Sem horário de término, início = fim.
  - Civil: só com `?convite=civil`.
- **Aceite:** o .ics importa no Calendário do iPhone, no Google e no Outlook com o horário certo e os 3 lembretes; o link do Google abre já preenchido. Testar no aparelho: no iOS, o `data:` .ics abre a prévia do Calendário. Se falhar, ver ROADMAP T6.

## 7. RSVP
- Campos: nome (obrigatório, ≥ 2 caracteres), "Você vai?" (sim/não, obrigatório), número de pessoas contando você (1–20, só quando a resposta é sim; o campo some com "não") e recado (opcional).
- Erros inline com `aria-live` e foco no primeiro campo com erro.
- Texto LGPD: "Seu nome e suas respostas servem só para organizarmos o casamento. Esta página não guarda nada: a confirmação segue por mensagem para os noivos, e você pode pedir para corrigir ou apagar a qualquer momento (LGPD)."
- **Envio:**
  - **com** `CONFIG.whatsapp`: abre `wa.me/<número>?text=<mensagem>` e avisa "toque em enviar".
  - **sem** número: mostra "Demo · envio ainda não configurado", "Nada foi enviado" e a mensagem que seria enviada.
  - **Nunca** finge que enviou.
- Depois de 31/10/2026 23h59: "o prazo de confirmação terminou em 31 de outubro de 2026" (o formulário continua, para quem quiser avisar por mensagem).
- Fase futura (backend): ARQUITETURA §4.

## 8. Presentes
- Introdução: "Sua presença é o mais importante. Se quiser nos presentear, o Pix é o jeito mais simples."
- **Pix (principal):**
  - QR, chave e botão "Copiar Pix copia e cola".
  - Sem dados: "QR Code pendente", "chave Pix pendente" e o botão desabilitado.
  - Nota: "Quer parcelar? Muitos bancos oferecem o *Pix no crédito* no próprio app: você parcela com o seu banco, nas condições dele."
- **Cartão (secundário):** link de cobrança (ex.: Asaas) só depois de conferir as taxas. Sem link: "link do cartão pendente".
- Valores ou lista de presentes: **pendente**. Detalhes em `PAGAMENTOS.md`.

## 9. Rodapé, música, seções planejadas
- Rodapé: "com amor," + nomes em script + lacre pequeno (86px) + "11 · 12 · 2026 · Cosmópolis".
- Música: o botão só aparece se `CONFIG.musicaUrl` existir; nunca toca sozinha.
- **Planejado, com conteúdo pendente:**
  - **Nossa história**: texto e fotos do casal. Não inventar.
  - **FAQ**: traje, estacionamento, crianças, presentes, prazo do RSVP. As respostas vêm do casal.

## 10. Testes: troca de paleta e fotos (design)
- Paleta: `<html data-paleta>` definido no `<head>` por `js/inicio.js`, na ordem `?paleta` (demo) → `CONFIG.paleta` → primeira de `CONFIG.paletas`. Trocar ao vivo é só mudar o atributo: todos os tokens se recalculam, inclusive lacre, borboleta e relevo, e `theme-color` é atualizado.
- Fotos:
  - **definitivo:** trocar os arquivos `assets/fotos/foto-N.webp` mantendo o nome, ou editar `CONFIG.fotos`;
  - **teste:** parâmetros de URL ou o painel.
- Painel `?dev=1` (demo), canto inferior esquerdo, recolhido no botão "testes":
  - seletor de paleta (atualiza `?paleta=` na URL com `replaceState`);
  - 3 entradas de arquivo (`URL.createObjectURL`: a foto não sai do aparelho) e controles de altura (`object-position`);
  - mostra o `fotosPos` pronto para copiar;
  - **copiar tokens**: as 80 `--p-*` calculadas da paleta atual, no formato do `paletas.css`;
  - **rever abertura**.
- O painel e o `dev.css` só são carregados nesse modo.

## 11. iPhone full-bleed
- `<meta name="viewport" content="…, viewport-fit=cover">`.
- `.env`: `position:fixed; top:0; left:0; right:0; height:100vh; height:100lvh`. Assim ele cobre também a área atrás da barra de status e da barra translúcida do Safari. Não usar só `inset:0`, porque no iOS isso equivale à viewport pequena.
- Com o envelope fechado, `html`/`body` usam `--cor-envelope-claro`, sem textura, para nenhuma faixa marfim aparecer. Depois de abrir, voltam ao papel.
- `theme-color`: fechado = `--cor-tema-envelope` (aba de cima da paleta); aberto = `--cor-tema-navegador` (papel). O JS atualiza ao trocar de paleta e ao abrir.
- Safe areas: o selo demo (`top: env(safe-area-inset-top)`), os nomes (`top: calc(8.5% + env(...top))`), a data (`bottom: calc(13% + env(...bottom))`), o painel, a dica e o botão de música respeitam `env(safe-area-inset-*)`.
- **Limitação:** um site comum **não consegue esconder a barra de endereço** do Safari. Tela cheia real só pela Tela de Início (seção 12).
- **Aceite:** no iPhone real (Safari, retrato) não aparece faixa clara em cima nem embaixo com o envelope fechado. Verificado no WebKit (iPhone 13 emulado): o envelope tem a altura da janela, o fundo do `html` = cor do envelope, e `theme-color` muda ao abrir.

## 12. PWA (instalável)
- `manifest.webmanifest`:
  - name "Eduardo & Gabriela", `display: standalone`, `start_url`/`scope` = `./` (funciona em `/eduardo-gabriela-previa/`);
  - `theme_color`/`background_color` = `--p-env-cima` da paleta padrão (`#08388C`);
  - ícones 180/192/512 + 512 *maskable*, gerados a partir do lacre (`scripts/gerar-icones.py <paleta>`). Os ícones são imagens: ao trocar a paleta definitiva, gere de novo e atualize as cores do manifest.
- iOS: `apple-touch-icon`, `apple-mobile-web-app-capable`, `status-bar-style=black-translucent` (conteúdo por trás da barra de status) e o título do app.
- `sw.js`, com escopo relativo:
  - pré-cache dos arquivos essenciais;
  - HTML: rede primeiro, com cache como reserva (o convite sempre atualiza);
  - estáticos: *stale-while-revalidate*;
  - Google Fonts: cache após o primeiro uso;
  - terceiros (mapas, WhatsApp, Asaas) não passam pelo cache.
  - `VERSAO` precisa subir a cada publicação.
  - Desligado no localhost (`?sw=1` força).
- Dica "Adicione à Tela de Início":
  - aparece **só** no Safari de iPhone/iPad (fora de navegadores embutidos como Instagram/WhatsApp e fora do modo app), 6s depois de abrir o envelope;
  - é uma barra discreta embaixo com "fechar" e, depois de fechada, não volta (localStorage);
  - pode ser desligada em `CONFIG.dicaTelaInicio`.
- **Aceite:** Lighthouse "installable" no Chrome; no iPhone, a Tela de Início mostra o ícone do lacre e abre sem barras; offline, depois da 1ª visita, o convite abre com fotos e paleta (verificado no Chromium).

## 13. Fase 2 (não implementada): lembretes por Web Push
- **Compatibilidade:** no iOS, só a partir do **16.4**, e **só com o site adicionado à Tela de Início**, com permissão pedida a partir de um gesto do usuário (botão "Quero receber lembretes"). Android/desktop: Chrome, Edge e Firefox.
- **Precisa de backend:**
  - um serviço (OneSignal ou Firebase Cloud Messaging) **ou** uma Supabase Edge Function com chaves **VAPID** (a chave privada fica só no servidor);
  - uma tabela de inscrições (`endpoint`, `keys`, tipo de convite, data do consentimento);
  - **jobs agendados** (cron do Supabase/pg_cron, Cloud Scheduler, ou o agendamento do OneSignal).
- **Calendário de lembretes:**

  | Quando | Mensagem (rascunho) | Público |
  |---|---|---|
  | 24/10 e 30/10 | "Falta pouco para o prazo do RSVP (31/10)." | quem ainda não confirmou (requer RSVP com backend) |
  | 04/12 (1 semana antes) | "Daqui a uma semana: almoço às 11h30 no Quintal 7&7." | todos |
  | 10/12 (1 dia antes) | "Amanhã! Rotas e horários no convite." | todos (civil: 10h15) |
  | 11/12, 8h | "Hoje celebramos." | todos |

- **LGPD:** consentimento explícito e separado; o texto diz para que serve e até quando (os dados são apagados até 31/12/2026); dá para cancelar (botão + configuração do sistema); sem rastreamento, sem uso para outro fim; registrar a data do consentimento.
- Enquanto a fase 2 não existe, o .ics com 3 alarmes cobre os lembretes **sem coletar nenhum dado**.

## 14. Acessibilidade
- Contraste AA nos textos de leitura. Foco visível (`outline` com `--cor-destaque`). O botão do lacre tem `aria-label`. Os decorativos têm `aria-hidden`.
- Formulário: labels reais, `fieldset`/`legend` e `aria-live`. A contagem usa `role="timer"` com `aria-live="off"`.
- `prefers-reduced-motion` respeitado em tudo. Áreas de toque ≥ 44px nos controles principais.
- Idioma `pt-BR`. As fotos têm alt real.

## 15. Desempenho (orçamento)
- HTML + CSS + JS próprios ≤ 120 KB (hoje ≈ 90 KB, sem compressão).
- Imagens da 1ª tela: texturas ≈ 147 KB e máscaras do lacre ≈ 60 KB. Fotos ≤ 80 KB cada (hoje 77/45/44).
- Fontes: 2 famílias do Google Fonts, `display=swap`.
- Animações só de `transform`/`opacity`. Filtros SVG pesados não são aplicados ao vivo (o lacre é pré-renderizado em máscaras).
- Meta: LCP < 2,5s em 4G e nenhum *long task* > 200ms na abertura.

## 16. Navegadores
- Alvo: iOS Safari 15.4+ (máscara sem prefixo, `lvh`/`svh`, `:focus-visible`), Chrome/Edge/Firefox atuais e Samsung Internet.
- **Cuidados com o Safari:**
  - sempre usar `-webkit-mask-*` junto com `mask-*`;
  - `-webkit-backface-visibility`;
  - `background-clip:text` com `-webkit-`;
  - `100vh` muda com as barras, então use `lvh`/`svh`;
  - o `data:` .ics se comporta de um jeito no app e de outro no navegador;
  - push só com o app instalado (16.4+);
  - `container-type` e `cqi` só no 16+ (o número das fotos tem reserva em `vw`).
- `file://` não é suportado (máscaras e SW precisam de http).
