# Método de marketing da DRAP: o site como portfólio

Este é o método para usar o site como a principal peça de marketing e vendas da DRAP. Ele junta práticas que outras empresas de software B2B já validaram e liga cada uma a uma ferramenta que já existe no site ou no painel.

A ideia central: **todo conteúdo e todo contato levam a um case do portfólio, e todo case termina numa proposta com valores.**

```
Conteúdo / indicação / anúncio  →  Portfólio (case)  →  Questionário  →  Proposta com valores  →  Aceite  →  Depoimento  →  Novo case
        (atração)                     (prova)             (conversão)        (fechamento)                 (prova social)
```

---

## 1. As 6 práticas e onde cada uma está no site

| Prática (quem já usa) | O que é | Onde está na DRAP |
|---|---|---|
| **Estudo de caso: desafio → solução → resultado** (padrão de agências e SaaS B2B) | Mostrar o problema do setor, o que foi construído e o que muda para quem usa | `/portfolio`: um case por plataforma, com prévia da interface, link "ver ao vivo" e botão de proposta |
| **Orçamento instantâneo** (calculadoras de preço de SaaS e de serviços) | O cliente descobre o investimento sem esperar uma reunião | `/sob-medida` e `/plataformas/<id>/proposta`: a proposta sai na hora nos casos simples |
| **"They Ask, You Answer"** (Marcus Sheridan) | Responder abertamente o que o cliente quer saber: preço, problemas, comparações, opiniões | Proposta com comparativo de mercado, perguntas frequentes em cada plataforma, esta seção de conteúdo (item 4) |
| **Prova social coletada no pico de satisfação** (pedidos de avaliação logo após a compra) | Pedir o depoimento quando o cliente acabou de aceitar ou de entrar no ar | Painel → Propostas → proposta aceita → "Pedir depoimento". O cliente responde em `/depoimento/<link>` e a equipe aprova em Painel → Depoimentos |
| **Folha de vendas por case** (account-based selling) | Um PDF de uma página para mandar a um cliente específico | Em cada case: "baixar folha do case (PDF)" |
| **Atribuição de canal** (UTM, padrão do Google Analytics) | Saber qual canal gera cliente, e não só visita | Todo lead e questionário chega ao painel com a origem (ex.: `linkedin / social / portfolio · entrada /portfolio`) |

O site também tem botão flutuante de WhatsApp com a página de origem na mensagem, páginas com título, descrição e imagem próprios para o Google, o WhatsApp e o LinkedIn, dados estruturados (perguntas frequentes e software) e `sitemap.xml`.

---

## 2. Mensagem: o cliente é o herói, a DRAP é a guia (StoryBrand)

Todo texto (post, anúncio, e-mail, roteiro de vídeo) segue esta ordem:

1. **Quem é o cliente e o que ele quer.** "Escritório de arquitetura que quer fechar mais propostas."
2. **O problema que o trava**, com as palavras dele. Use o bloco "O desafio" do case.
3. **A DRAP como guia**: entende o problema (o produto nasceu num caso real) e tem autoridade (produto em operação, link ao vivo).
4. **O plano em 3 passos**: responder o questionário → receber a proposta → entrar no ar.
5. **A chamada clara**: "Receba a proposta do DRAP Backoffice em 3 minutos" + link.
6. **O que ele ganha** (bloco "O que muda para o cliente") e **o que ele perde se não agir** (bloco "O desafio").

Uma ideia por peça, um link por peça.

---

## 3. Links com origem (UTM): padrão obrigatório

Sem UTM, o lead chega como "direto" e não se sabe o que funcionou. Todo link publicado fora do site segue este modelo:

```
https://drap-softwerehouse.vercel.app/portfolio?utm_source=CANAL&utm_medium=TIPO&utm_campaign=CAMPANHA#case-PLATAFORMA
```

| Campo | Valores padrão (minúsculas, sem acento) |
|---|---|
| `utm_source` | `linkedin`, `instagram`, `whatsapp`, `google`, `email`, `evento`, `parceiro` |
| `utm_medium` | `social` (post), `cpc` (anúncio pago), `direct` (mensagem 1 a 1), `email`, `qr` (impresso) |
| `utm_campaign` | `aaaa-mm-tema`, ex.: `2026-11-agro-safra`, `2026-11-arquitetura` |
| `ref` (opcional) | código de quem indicou, ex.: `ref=joao-contador`, para indicações e parceiros |

Atalhos prontos:
- O botão **"copiar link do case"** no portfólio já gera o link com UTM de compartilhamento.
- Indicação de parceiro: `/?ref=nome-do-parceiro`. O código aparece na origem do lead.

---

## 4. Conteúdo: o que publicar (They Ask, You Answer)

Toda semana, publique um conteúdo de cada tipo, sempre apontando para um case:

| Tipo | Exemplo | Para onde leva |
|---|---|---|
| **Preço** | "Quanto custa um sistema para escritório de arquitetura?" | `/plataformas/backoffice/proposta` |
| **Problema** | "3 sinais de que a planilha está custando caro na fazenda" | `/portfolio#case-fazenda` |
| **Comparação** | "Sistema pronto x sob medida: quando cada um vale a pena" | `/sob-medida` |
| **Bastidor / prova** | Vídeo de 60 s navegando na plataforma ao vivo | link "ver ao vivo" do case |
| **Depoimento** | Frase do cliente + foto da operação (com autorização) | case da plataforma |

Formatos por canal:
- **LinkedIn** (canal principal B2B): posts do fundador em primeira pessoa, carrossel com o case em 5 telas (desafio, 3 módulos, resultado, chamada) e o PDF da folha do case.
- **Instagram**: Reels de 30 a 60 s com a interface, stories com enquete ("Você ainda fecha o mês na planilha?").
- **WhatsApp**: lista de transmissão para clientes e parceiros, uma novidade por mês, sempre com link UTM.
- **Google**: perfil da empresa (Google Business Profile) com o link do portfólio e os depoimentos publicados.

---

## 5. Vendas ativas por segmento (account-based)

1. Escolha **um segmento por mês** (ex.: agronegócio em época de safra).
2. Liste 30 empresas-alvo desse segmento.
3. Para cada uma, mande uma mensagem curta e pessoal com **a folha do case em PDF** e o link do case com UTM `utm_medium=direct`.
4. Faça follow-up em 3 e em 7 dias, com outro conteúdo (vídeo ao vivo ou depoimento).
5. Quem responder recebe o link do questionário da plataforma. A proposta já chega com valores.

Feiras e eventos: imprima um QR code para `/portfolio?utm_source=evento&utm_medium=qr&utm_campaign=<evento>`.

---

## 6. Prova social: rotina de depoimentos

- **Quando pedir:** no aceite da proposta e de novo 30 dias depois do go-live, que é o pico de satisfação.
- **Como pedir:** Painel → Propostas → abrir a proposta aceita → **"Pedir depoimento ao cliente"**. A mensagem com o link vai copiada; cole no WhatsApp.
- **Como publicar:** Painel → Depoimentos → revisar → marcar "Publicado". Só é possível publicar com a autorização do cliente, que vem marcada pelo próprio cliente no link.
- **Depoimento por áudio ou WhatsApp:** transcreva sem reescrever, em "Cadastrar depoimento recebido", e marque a autorização só se o cliente autorizou por escrito.
- **Regras:** nunca inventar ou editar o sentido de um depoimento; nunca publicar número de resultado que o cliente não confirmou (Código de Defesa do Consumidor e CONAR). Depoimentos aparecem automaticamente na home, no portfólio e na página da plataforma.

---

## 7. Métricas: o que olhar toda semana

| Etapa | Métrica | Onde ver |
|---|---|---|
| Atração | Visitas ao portfólio por origem | Vercel Analytics (ativar em Vercel → Analytics) |
| Interesse | Questionários enviados, por plataforma e origem | Painel → Leads (coluna origem) |
| Proposta | Propostas enviadas e **visualizadas** | Painel → Propostas (acompanhamento) |
| Fechamento | Propostas **aceitas** e valor aceito | Painel → Propostas (indicadores no topo) |
| Prova | Depoimentos pedidos x publicados | Painel → Depoimentos |

Taxas para acompanhar (comparar mês a mês, não com o mercado):
- proposta visualizada ÷ enviada: se estiver baixa, o problema é o e-mail ou o follow-up;
- aceita ÷ visualizada: se estiver baixa, o problema é preço, escopo ou confiança (mais prova social);
- leads por canal: dobre o investimento no canal com mais **aceites**, não com mais visitas.

---

## 8. Rotina semanal (1 hora)

1. **Segunda:** publicar o conteúdo da semana (item 4) com link UTM.
2. **Terça a quinta:** 10 mensagens de vendas ativas no segmento do mês (item 5).
3. **Sexta:** revisar o painel. Responder propostas visualizadas e não aceitas, pedir depoimento a quem aceitou, publicar os aprovados e anotar os números do item 7.

## 9. Plano de 90 dias

- **Dias 1 a 30:** ativar Vercel Analytics; cadastrar o WhatsApp real em Configurações; definir o domínio próprio (`SITE_URL`); conseguir os 3 primeiros depoimentos; publicar um case por semana no LinkedIn.
- **Dias 31 a 60:** primeira campanha de vendas ativas num segmento; primeiro evento ou feira com QR code; programa de indicação com códigos `ref` para contadores, arquitetos e consultores parceiros.
- **Dias 61 a 90:** anúncio pago só no canal e no segmento com mais aceites; vídeo de demonstração por plataforma; revisar preços e textos dos cases com o que os clientes mais perguntaram.
