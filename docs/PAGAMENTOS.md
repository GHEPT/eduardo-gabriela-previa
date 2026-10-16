# PAGAMENTOS (presentes)

> Nada aqui está configurado. **Não invente** chave, código ou link: tudo vem do casal.

## Pix (principal)
- **Chave:** o casal escolhe (e-mail, telefone ou aleatória; a aleatória expõe menos dados). A página mostra a chave e o nome do titular.
- **BR Code estático (copia e cola):** o ideal é **gerar no app do banco** ("Pix copia e cola"/"cobrar", valor livre) e colar em `CONFIG.pixCopiaECola`. O QR pode ser exportado do app (`CONFIG.pixQrUrl`).
- Também dá para gerar no front-end o payload EMV estático (campos `00` formato, `26` GUI `br.gov.bcb.pix` + chave, `52` MCC `0000`, `53` moeda `986`, `54` valor opcional, `58` `BR`, `59` nome do recebedor até 25 caracteres, `60` cidade até 15, `62` txid `***`, `63` CRC16-CCITT). Isso **só com os dados reais** e depois de validar no app de 2 bancos. Ver ROADMAP T8.
- Valores sugeridos ("cotas" de presente) são opcionais e dependem do casal.

## Pix no crédito
É um produto **do banco do convidado** (parcela no app dele, com os juros dele). O site só explica isso; não intermedia nada. Texto atual: "Quer parcelar? Muitos bancos oferecem o *Pix no crédito* no próprio app…"

## Cartão (secundário): Asaas
- Link de pagamento com valor livre ou fixo e parcelamento. **Conferir as taxas atuais no site do Asaas antes de publicar** (cartão à vista/parcelado e antecipação). Decidir quem absorve a taxa.
- O casal precisa de uma conta Asaas verificada. O site recebe só o **link público** (`CONFIG.cartaoUrl`); a chave de API **nunca** vai para o front-end.
- Futuro: webhook (ARQUITETURA §4).

## Observação fiscal
Presentes em dinheiro podem ter implicações de declaração (por exemplo, doação no IR e regras estaduais de ITCMD, que variam por estado e valor). **Confirmar com um contador**; o site não dá orientação fiscal.
