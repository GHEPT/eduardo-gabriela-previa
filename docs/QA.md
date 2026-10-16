# QA

## Automático
```bash
npm install && npx playwright install chromium     # 1ª vez
npm run serve                                      # terminal 1
npm run shots            # tests/capturas/: envelope, abrindo (900/1500/2000ms), capa, página inteira, civil, RSVP, desktop
npm run shots:paletas    # as 5 paletas
npm run lint             # checar-cores (tokens) + Taste Skill lint (precisa dar 0 FAIL / 0 WARN)
npm run inspect          # Taste Skill inspect na página renderizada
```
- `capturas.mjs` termina com **erro** se houver erro no console, exceção ou recurso que não carregou. Opções: `--url`, `--paleta`, `--saida`. Variável `CHROME=/caminho` para usar o Chrome instalado.
- Para congelar quadros da animação, o script substitui os `setTimeout` longos e usa `document.getAnimations()` com `currentTime`.
- `inspect` libera de propósito: `numbering` (contagem "00"), `micro-label`/`eyebrow` (caixa-alta espaçada é a identidade), `gradient`/`gradient-text`/`text-shadow` (cera, foil e relevo seco são materiais físicos). Os demais avisos precisam ser defendidos ou corrigidos.
- **Regressão visual:** compare `azul-amarelo-01-envelope.png` e `-03-capa.png` com as capturas de `reference/index-v5.2.html`, no mesmo viewport. Resultado da última verificação (Chromium 390×844 @2x): envelope com diferença só no lacre (0,75% dos pixels); quadro da abertura idêntico; capa idêntica (fora os segundos da contagem).
- WebKit: `npx playwright install webkit` (no Linux, `install-deps`). No WebKit do Linux as abas apareciam com o verso por cima. Foi corrigido com o verso antes da face no DOM. Isso não substitui o teste no iPhone real.

## Manual: iPhone Safari (obrigatório antes de publicar)
- [ ] Envelope fechado sem faixa clara em cima nem embaixo (retrato e paisagem); barra de status na cor do envelope
- [ ] "demo", nomes e data fora do entalhe e da barra; "toque para abrir" legível
- [ ] Toque no lacre: abertura fluida, sem piscar; borboleta voa uma vez; foco no título
- [ ] Depois de aberto: barra do navegador na cor do papel; rolagem normal
- [ ] Contagem certa; `?convite=civil` mostra o civil e conta até 10h15
- [ ] Fotos nítidas, número legível sobre elas
- [ ] Google Maps e Waze abrem os apps
- [ ] **Adicionar à agenda**: abre a prévia do Calendário com 11h30 e alertas de 1 semana, 1 dia e 2h; Google Agenda abre preenchido
- [ ] RSVP: erros aparecem; sem WhatsApp configurado mostra "Nada foi enviado"; com número, abre o WhatsApp com o texto
- [ ] Presentes: tudo "pendente", botão desabilitado
- [ ] Ajustes → Acessibilidade → Reduzir movimento: abre sem animação
- [ ] Abrindo pelo WhatsApp (navegador embutido): funciona e **não** mostra a dica da Tela de Início
- [ ] Safari: a dica aparece 6s depois de abrir, fecha e não volta
- [ ] Adicionar à Tela de Início: ícone do lacre, abre sem barras, conteúdo atrás da barra de status sem cortar nada
- [ ] Modo avião depois da 1ª visita (app instalado): o convite abre
- [ ] Testar as 5 paletas com `?paleta=` (demo)
