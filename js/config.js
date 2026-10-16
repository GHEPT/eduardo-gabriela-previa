/* =====================================================================
   CONFIG: o ÚNICO arquivo que o casal precisa editar no dia a dia.
   Deixe '' (vazio) o que ainda não existe: a página mostra "pendente"
   e nunca finge que algo funciona.
   NÃO coloque aqui senhas, tokens, chaves de API ou dados bancários
   além da chave Pix pública: este arquivo é público no GitHub Pages.
   ===================================================================== */
window.CONFIG = {
  /* ---- Modo demonstração ------------------------------------------- */
  // true = mostra o selo "demo" e libera os parâmetros de teste
  //        (?paleta=, ?foto1=, ?fotos=, ?dev=1). Ponha false no site final.
  demo: true,

  /* ---- Paleta ------------------------------------------------------ */
  // Uma das paletas de css/paletas.css. Em demo, ?paleta=malva sobrepõe.
  paleta: 'azul-amarelo',
  paletas: ['azul-amarelo', 'malva', 'marrom-cafe', 'verde-rosa', 'bordo'],

  /* ---- Fotos da capa ------------------------------------------------ */
  // Uma foto só, partida nos três quadros: a esquerda, o meio e a direita
  // se continuam. Arquivo já sem EXIF. Vazio = as três fotos de `fotos`.
  fotoFaixa: 'assets/fotos/faixa.webp',
  fotoFaixaAlt: 'Eduardo beija o rosto de Gabriela; ela olha para a câmera, ao pôr do sol',
  // Três fotos separadas, se fotoFaixa estiver vazio. Use scripts/fotos.py.
  fotos: ['assets/fotos/foto-1.webp', 'assets/fotos/foto-2.webp', 'assets/fotos/foto-3.webp'],
  fotosPos: ['50% 0%', '50% 0%', '50% 0%'],   // enquadramento (object-position)
  fotosAlt: [
    'Eduardo e Gabriela sorrindo, lado a lado',
    'Eduardo e Gabriela juntos, sorrindo',
    'Eduardo e Gabriela; a mão dela no ombro dele, com as alianças'
  ],

  /* ---- Datas e horários (sempre com o fuso -03:00 de Brasília) ----- */
  datas: {
    civil:     '2026-12-11T10:15:00-03:00',  // contagem para ?convite=civil
    almoco:    '2026-12-11T11:30:00-03:00',  // contagem padrão
    fimDoDia:  '2026-12-12T00:00:00-03:00',  // depois disso: "Celebramos em…"
    prazoRsvp: '2026-10-31T23:59:59-03:00'
  },

  /* ---- Programação (dados reais confirmados pelo casal) ------------ */
  eventos: [
    { id: 'civil', soCivil: true, hora: '10h15', titulo: 'Cerimônia civil',
      local: 'Cartório de Registro de Imóveis e Civil de Pessoas Naturais',
      endereco: ['R. Ramos de Azevedo, 268 · Centro', 'Cosmópolis-SP · 13150-025'],
      nota: 'Cerimônia reservada, com lugares limitados.',
      agenda: { inicio: '2026-12-11T10:15', fim: '' },  // fim: PENDENTE (não inventar)
      mapa: 'R. Ramos de Azevedo, 268 - Centro, Cosmópolis - SP, 13150-025' },
    { id: 'almoco', hora: '11h30', titulo: 'Almoço comemorativo',
      local: 'Quintal 7&7',
      endereco: ['R. Adolfo Germano Rogge, 440', 'Parque das Laranjeiras II · Cosmópolis-SP'],
      instagram: 'quintal_77',
      agenda: { inicio: '2026-12-11T11:30', fim: '' },  // fim: PENDENTE (não inventar)
      mapa: 'R. Adolfo Germano Rogge, 440 - Parque das Laranjeiras II, Cosmópolis - SP' }
  ],

  /* ---- "Adicionar à agenda" (.ics gerado no navegador + Google Agenda) */
  // Horários locais de Brasília (America/Sao_Paulo). Sem "fim", o evento fica sem
  // horário de término no .ics e com duração zero no Google Agenda.
  lembretes: ['-P7D', '-P1D', '-PT2H'],   // alarmes do .ics: 7 dias, 1 dia e 2 horas antes

  /* ---- App instalável (PWA) ------------------------------------------ */
  dicaTelaInicio: true,  // dica discreta só no Safari do iPhone, pode ser fechada
  serviceWorker: true,   // cache para abrir offline (desligado em localhost; force com ?sw=1)

  /* ---- Contato e presentes (PENDENTES até o casal enviar) ---------- */
  whatsapp: '',       // PENDENTE: só dígitos, com DDI e DDD (ex.: 5519…)
  pixCopiaECola: '',  // PENDENTE: código "Pix copia e cola" gerado no app do banco
  pixChave: '',       // PENDENTE: chave Pix exibida (e-mail, telefone, aleatória…)
  pixQrUrl: '',       // PENDENTE: imagem do QR Code exportada do banco (ex.: 'assets/pix-qr.png')
  cartaoUrl: '',      // PENDENTE: link de pagamento no cartão (ex.: Asaas), depois de conferir as taxas
  musicaUrl: '',      // OPCIONAL: arquivo de música; sem ele, o botão nem aparece
  /* Caminho B (docs/ABERTURA.md): mp4 em tela cheia, no toque. null = só o CSS.
     O arquivo não muda com ?paleta=. O poster é o envelope fechado. */
  aberturaVideo: 'assets/abertura/abertura.mp4'
};
