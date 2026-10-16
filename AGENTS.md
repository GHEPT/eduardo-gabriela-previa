# AGENTS.md: instruções para IA (Cursor e outros)

Projeto: convite de casamento interativo de **Eduardo & Gabriela** (11.12.2026, Cosmópolis-SP). Site **estático**, publicado no GitHub Pages (`GHEPT/eduardo-gabriela-previa`, branch `master`, raiz, em subpasta: use sempre **caminhos relativos**).

## Leia antes de mudar qualquer coisa
1. `docs/SPEC.md`: o que cada seção faz, os estados, os parâmetros de URL e os critérios de aceite.
2. `docs/BRIEFING.md`: regras de honestidade e o que evitar no visual.
3. `docs/DESIGN-SYSTEM.md`: tokens, paletas, tipografia e movimento.
4. `docs/ROADMAP.md`: próximas tarefas, cada uma com critério de aceite.
5. `reference/index-v5.2.html`: referência visual aprovada. A paleta padrão precisa continuar **idêntica** a ela.

## Regras duras
- **Stack:** HTML + CSS + JS puro. Nada de build, framework, bundler, CDN de JS, Tailwind ou TypeScript. Scripts clássicos com `defer`.
- **Cores:** só via tokens. Fora de `css/tokens.css` e `css/paletas.css` não pode haver `#hex`, `rgb()` com número ou `white`/`black`. Use `var(--cor-*)` ou `rgba(var(--rgb-*), a)`. Confira com `npm run lint:cores`.
- **Imagens neutras:** texturas e lacre são máscaras ou relevo cinza. A cor vem do CSS. Nunca gere uma imagem por paleta.
- **Honestidade:** não invente chave Pix, dados bancários, códigos ou links de pagamento, número de WhatsApp, horários, endereços, histórias, depoimentos, nomes de familiares ou fotos. O que faltar fica como "pendente" (`docs/CONTEUDO.md`). Nenhuma integração simulada como se fosse real.
- **Segurança:** nada de senha, token, chave privada ou dado administrativo no front-end. Este repositório é público.
- **Privacidade:** fotos só tratadas (`scripts/fotos.py`, sem EXIF/GPS). Não mexa nem publique `docs/referencias/` ou fotos originais. Fotos locais do painel de testes usam object URL e nunca são enviadas.
- **Texto:** todo em pt-BR, tom afetuoso e simples, sem marketing e sem emoji.
- **Mobile first:** o alvo é o iPhone Safari (390×844). Respeite `env(safe-area-inset-*)` e `100lvh`/`100svh`, nunca só `100vh`.
- **Acessibilidade:** `prefers-reduced-motion` pula a animação, o foco fica visível, há labels reais e `aria-live` nos erros do RSVP.
- **Mantenha:** `?convite=civil`, a contagem (fuso -03:00), o RSVP sem envio falso, os presentes como pendentes, `noindex` e as metatags OG.

## Testar sempre
```bash
npm run serve              # outro terminal
npm run shots              # capturas iPhone + desktop; falha com erro no console
npm run shots:paletas      # as 5 paletas
npm run lint               # cores + Taste Skill
```
Compare a paleta padrão com `reference/index-v5.2.html` (mesmo viewport). Veja `docs/QA.md` para o checklist manual no iPhone.

## Onde mexer
| Quero… | Arquivo |
|---|---|
| Mudar dados (fotos, datas, Pix, WhatsApp, eventos) | `js/config.js` |
| Mudar cores de uma paleta | `css/paletas.css` (`--p-*`) |
| Mudar onde uma cor é usada | `css/tokens.css` (`--cor-*`) |
| Mexer no envelope, lacre ou borboleta | `css/envelope.css`, `index.html`, `js/main.js` (relevo) |
| Mexer nas seções | `css/secoes.css`, `index.html`, `js/main.js` |
| Agenda / PWA | `js/agenda.js`, `js/pwa.js`, `sw.js`, `manifest.webmanifest` |

Skills de design em `tools/design-skills/`: Taste Skill (lint/inspect), Web Design Guidelines, Image to Code e Playwright CLI. Use quando fizer sentido.
