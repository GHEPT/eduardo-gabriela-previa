# ROADMAP: tarefas para o Cursor (em ordem de prioridade)

Cada tarefa tem um **critério de aceite**. Siga `AGENTS.md`: tokens, honestidade, sem build.

## Feito neste pacote (validar no aparelho)
- v5.2 separada em arquivos; tokens em 2 camadas; 5 paletas; lacre e borboleta independentes da paleta; painel `?dev=1`; fotos por URL e por painel; full-bleed no iPhone; PWA (manifest, ícones, SW, dica iOS); .ics + Google Agenda; scripts (fotos, paletas, lacre, ícones, checagem de cores); capturas com Playwright.

## P0: antes de mandar para os convidados
- **T1. Validar no iPhone real** (checklist em `QA.md`). *Aceite:* todos os itens marcados; nenhuma faixa clara com o envelope fechado.
- **T2. Escolher a paleta definitiva** com o casal (`?paleta=` / `?dev=1`), ajustar as primitivas e gerar os ícones (`scripts/gerar-icones.py <paleta>`) + as cores do manifest. *Aceite:* `npm run lint` limpo; capturas aprovadas pelo casal.
- **T3. Preencher as pendências** do `CONTEUDO.md` que o casal enviar (WhatsApp, Pix, cartão, horário de término). *Aceite:* nenhum dado inventado; os botões habilitam sozinhos quando o dado existe.
- **T4. `demo: false`** e subir a `VERSAO` do `sw.js` ao publicar. *Aceite:* sem selo demo; `?dev=1` e `?paleta=` sem efeito; o SW novo assume na 2ª visita.

## P1
- **T5. Ajustar as paletas geradas** (marrom-café, verde-rosa, bordô): reduzir `--p-luz-rgb` no bordô, aumentar o contraste do `--p-env-realce` no marrom e dar mais saturação à borboleta. *Aceite:* contraste AA nos textos de leitura; o casal aprova lado a lado com o moodboard.
- **T6. Agenda no iOS:** se o `data:` .ics não abrir bem no Safari ou no modo app, gerar os arquivos estáticos `assets/agenda/almoco.ics` e `civil.ics` (mesmo conteúdo, via script) e apontar os links para eles. *Aceite:* importa no Calendário do iPhone com os 3 alertas, no Safari e no app instalado.
- **T7. Imagem OG** (1200×630, envelope + nomes) para a prévia no WhatsApp. *Aceite:* prévia correta no WhatsApp; sem foto do casal se eles preferirem.
- **T8. Pix copia e cola gerado** (se o casal quiser valores sugeridos): gerador EMV + CRC16 no front-end com a chave real. *Aceite:* o código lido por 2 bancos mostra o recebedor e o valor certos.

## P2: conteúdo planejado
- **T9. Nossa história** (seção entre o convite e a programação), só com o texto do casal. *Aceite:* nada inventado; segue o design system.
- **T10. FAQ** (traje, estacionamento, crianças, presentes, prazo), em `<details>` acessível. *Aceite:* respostas do casal; funciona sem JS.
- **T11. Música opcional** (arquivo com direitos). *Aceite:* nunca toca sozinha; o botão só aparece com `musicaUrl`.

## P3: fases futuras (precisam de backend; ver ARQUITETURA)
- **T12. RSVP com backend** (Google Sheets/Apps Script ou Supabase) + **painel admin**. *Aceite:* sem segredo no front-end; LGPD (finalidade, prazo, exclusão); o WhatsApp continua como alternativa.
- **T13. Webhook do Asaas** para registrar presentes. *Aceite:* token só no servidor; nenhum dado de pagador exposto.
- **T14. Fase 2: lembretes por Web Push** (SPEC §13). Botão de inscrição (iOS 16.4+ instalado), VAPID/OneSignal/FCM, jobs nas datas 24/10, 30/10, 04/12, 10/12 e 11/12 8h, handlers `push`/`notificationclick` no `sw.js`, consentimento LGPD. *Aceite:* chega no iPhone instalado e no Android; cancelamento funciona; dados apagados até 31/12/2026.
