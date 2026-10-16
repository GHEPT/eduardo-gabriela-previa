# DECISÕES: histórico de versões

| Versão | O que foi | Resultado |
|---|---|---|
| **v1** | Primeira página com **contagem regressiva** | O casal **gostou da contagem**, que ficou em todas as versões seguintes |
| **v2** | Redesenho editorial (inspirado no DESIGN.md do Oura: papel creme, serifa editorial) | **Rejeitada**: não tinha a cara do casal |
| Lovable | Proposta gerada no Lovable para comparação | Usada só como referência; não seguimos (genérica, "cara de IA") |
| Pausa | "Vamos congelar por enquanto. Não estamos conseguindo produzir boas referências." Discussão sobre Figma/Canva | O casal trouxe as referências: o save-the-date do Pinterest (3 fotos + data) e o pin da tipografia |
| **v4** | Capa estilo save-the-date + **lacre de cera** | O lacre virou o elemento de identidade |
| **v5.0** | **Convite interativo** baseado no vídeo enviado pelo Eduardo: envelope que abre no lacre, abas viram, **borboleta voando** ("você percebeu que tem uma borboleta voando?") e o cartão sobe. Demo para ver no celular como se fosse GitHub Pages | Aprovado: "achei incrível" |
| **v5.1** | Texturas em alta: envelope "mais 3D, com relevos", algodão em alta definição, lacre 3D, borboleta com sombra e mais detalhe. Paleta **malva** | Aprovado |
| **v5.2** | Troca de paleta **malva → Azul e Amarelo** (moodboard), as 3 **fotos reais** em P&B (sem EXIF) e lacre mostarda | Versão atual (`reference/index-v5.2.html`) |
| **v5.2-projeto** | Projeto para o Cursor: arquivos separados, **tokens** (o casal está indeciso entre 5 paletas), lacre e borboleta independentes da paleta, painel de testes, troca de fotos, iPhone full-bleed, PWA, .ics, docs | Em andamento (este pacote) |

## Marcação de 16/10/2026

A tabela acima é o histórico antigo (v1 da contagem, v2 editorial rejeitada, v5.2). Não confundir com as linhas abaixo.

| Linha | Branch | Estado |
|---|---|---|
| **Versão 1** | `versao-1` | O convite interativo em andamento até esta marcação: envelope, capa e segunda seção. Esta branch não recebe a versão 2. |
| **Versão 2** | `versao-2` | Próxima direção, a partir daqui. |

Para resgatar a versão 1 depois da versão 2: `git switch versao-1`. A marcação está só nesta pasta, ainda sem envio ao GitHub.

## Decisões que valem até segunda ordem
- Site estático no GitHub Pages; o casal publica manualmente.
- Envelope full-bleed. O casal reclamou das faixas claras no iPhone: corrigido com `100lvh` + fundo na cor do envelope + `theme-color`.
- O RSVP vai pelo WhatsApp (sem backend) até haver decisão sobre a fase de backend.
- O Pix é o presente principal; cartão é secundário; nada de link inventado.
- As fotos são públicas por natureza (repositório público), por isso passam por tratamento sem EXIF/GPS.
- O casal **não quer receber capturas de tela** nas entregas, só o arquivo.
