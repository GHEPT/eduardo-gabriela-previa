# Design skills (cópias locais para o Cursor)

| Pasta | Origem | Licença | Uso aqui |
|---|---|---|---|
| `taste-skill/` | github.com/Leonxlnx/taste-skill (`skills/taste-skill`; sem a pasta `library/`, de 1,4 MB) | MIT (`LICENSE`) | `npm run lint-taste` (estático) e `npm run inspect` (página renderizada). Comentário `taste-skill-ignore: motivo` para exceções defendidas |
| `image-to-code-skill/` | mesmo repositório, `skills/image-to-code-skill` | MIT | Transformar referência visual (moodboard, quadro do vídeo) em código |
| `playwright-cli/` | github.com/microsoft/playwright-cli (`skills/playwright-cli`) | Apache-2.0 (`LICENSE`) | Automação de navegador e capturas |
| `web-design-guidelines/` | vercel-labs/agent-skills (`web-design-guidelines/SKILL.md`) + vercel-labs/web-interface-guidelines (`command.md`) | ver os repositórios de origem | Revisão de acessibilidade/UX em formato `arquivo:linha` |
| Awesome Design (getdesign.md) | `npx getdesign@latest add <marca>` | não verificada: **só link**, não copiado | Referência de DESIGN.md (o do Oura foi usado na v2, rejeitada) |

Node 22+ para `inspect.mjs`; no Node 20, use `node --experimental-websocket` (já no script `npm run inspect`).
