# ARQUITETURA

## 1. Mapa de arquivos
| Arquivo | Papel |
|---|---|
| `index.html` | Toda a marcação: envelope (abas, lacre, borboleta SVG), capa, convite, programação (vazia; o JS preenche), RSVP, presentes, rodapé |
| `css/paletas.css` | Primitivas `--p-*` por `[data-paleta]` |
| `css/tokens.css` | Tokens semânticos + tipografia/espaço/movimento/texturas |
| `css/base.css` | Reset, tipografia base, `.caps`, `.amp`, selo demo, revelação ao rolar, fundo do envelope fechado |
| `css/envelope.css` | Envelope full-bleed, abas 3D, lacre em camadas, borboleta, coreografia |
| `css/secoes.css` | Capa, seções, formulário, presentes, rodapé, música, dica da Tela de Início |
| `css/dev.css` | Painel de testes (carregado só com `?dev=1`) |
| `js/config.js` | `window.CONFIG`: o único arquivo de dados |
| `js/inicio.js` | `<head>`, síncrono: classe `.js`, `data-paleta`, parâmetros de foto (demo) |
| `js/agenda.js` | Gera o .ics + o link do Google Agenda (`window.Agenda`) |
| `js/main.js` | Comportamento: relevo, abertura, fotos, contagem, calendário, programação, RSVP, presentes, música, revelação, `theme-color`. Expõe `window.Convite` |
| `js/pwa.js` | Registro do SW + dica da Tela de Início |
| `js/dev.js` | Painel de testes (demo + `?dev=1`) |
| `sw.js`, `manifest.webmanifest` | PWA |
| `assets/` | `fotos/` (foto-1..3.webp), `texturas/`, `lacre/` (máscaras), `icones/` |
| `scripts/` | `fotos.py`, `nova-paleta.py`, `gerar-lacre.py`, `gerar-icones.py`, `checar-cores.mjs` |
| `tests/capturas.mjs` | Capturas com Playwright |
| `reference/index-v5.2.html` | Versão em arquivo único aprovada (referência visual) |

## 2. Fluxo
```
<head>  config.js → inicio.js (paleta + fotos de teste) → CSS (paletas → tokens → base/envelope/secoes)
defer   agenda.js → main.js (lê CONFIG, monta a página, expõe Convite) → pwa.js → dev.js (só com ?dev=1)
toque no lacre → opening (CSS anima a cena de docs/ABERTURA.md) → fim da timeline, cerca de 2,5s → complete: esconde o envelope, theme-color = papel, foco no h1
```
Os dados entram só por `CONFIG`; as cores, só pelos tokens. O JS nunca escreve cor literal: o relevo usa `rgba(var(--rgb-*))` em `style`.

## 3. Decisões técnicas
- Scripts clássicos com `defer` (sem ES modules), para funcionar até via `file://` sem CORS. Mesmo assim, o projeto **exige http** por causa das máscaras.
- Lacre em máscaras em vez de SVG com filtros ao vivo: filtros pesados travam a animação no iPhone.
- O verso vem antes da face no DOM: se o 3D falhar, a face fica visível.

## 4. FUTURO (não implementado): RSVP com backend
Opções:
- **Google Sheets + Apps Script** (grátis, simples):
  - o formulário faz `POST` para um Web App do Apps Script, que grava uma linha;
  - proteção: honeypot, limite por IP/tempo e validação no servidor;
  - a URL do Web App é pública, mas só aceita escrita.
- **Supabase** (mais robusto):
  - tabela `rsvp(id, nome, vai, pessoas, recado, convite_tipo, criado_em, origem)`;
  - RLS com `insert` para `anon` e `select` só para o admin autenticado;
  - Edge Function para validar e limitar requisições.
- Em qualquer opção: manter a confirmação por WhatsApp como alternativa; LGPD (finalidade, prazo de exclusão até 31/01/2027, pedido de correção); nunca colocar a chave `service_role` no front-end.

### Painel admin (spec futura)
- Login do casal (Supabase Auth com link mágico).
- Lista das confirmações com filtros (vai/não vai, civil/geral), total de pessoas, exportar CSV, editar/apagar a pedido do convidado.
- Página separada (`admin/`), `noindex`, sem link no site.

### Webhook do Asaas (futuro)
- Uma Edge Function recebe `PAYMENT_RECEIVED`, valida o token do webhook (que fica no servidor) e registra o presente (valor, nome opcional, mensagem).
- O site pode mostrar "obrigado" genérico; nunca expor dados de quem pagou.

## 5. FUTURO (Fase 2): lembretes por Web Push
Ver SPEC §13.
- Arquitetura proposta: `pwa.js` mostra o botão "Quero receber lembretes" (só quando instalado no iOS 16.4+ ou em navegadores com suporte).
- `PushManager.subscribe({ applicationServerKey: VAPID_PUBLICA })` → `POST` para uma Edge Function `inscrever` (Supabase), que grava na tabela `push_inscricoes`.
- O `pg_cron` dispara a Edge Function `enviar-lembretes` nas datas do calendário. Ela assina com a VAPID privada (variável de ambiente) e envia via `web-push`.
- O `sw.js` ganha os handlers `push` e `notificationclick` (abre `./#programacao`).
- Alternativa sem servidor próprio: OneSignal ou FCM (SDK + agendamento no painel). Avaliar a privacidade e o banner de cookies que exigem.
