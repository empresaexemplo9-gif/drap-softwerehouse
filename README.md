# DRAP SoftwareHouse & Business

Site de apresentação e marketing da DRAP, com:

- **Home**: hero, catálogo das plataformas prontas (cards com prévia da interface, paleta e logo de cada uma), serviços, processo e contato. Tema claro (padrão) e escuro, visual vítreo.
- **Captação de leads**: o formulário grava no banco, com validação no navegador e no servidor, campo-isca anti-robô e limite de envios (5 por e-mail e 20 por IP a cada 10 minutos).
- **Página de cada plataforma** (`/plataformas/<id>`): clicar no card abre uma apresentação completa para o cliente: para quem é, problemas que resolve, resultados, módulos, implantação, diferenciais, segurança, “Por que comprar da DRAP”, perguntas frequentes e formulário de demonstração.
- **Plataforma sob medida** (`/sob-medida`): questionário em 6 etapas para o cliente descrever a ferramenta (projeto, usuários, funcionalidades, módulos “agora/depois”, prazo). A plataforma calcula o orçamento pela tabela de mercado e classifica a complexidade:
  - **simples** → a proposta é publicada e enviada na hora (dá para desligar em Configurações);
  - **média ou complexa** → fica “em análise” e a equipe revisa e envia pelo painel.
- **Proposta** (`/proposta/<token>`): documento com a marca DRAP (logo, paleta petróleo/marfim/bronze e marca d'água oficial), diagrama de como a plataforma funciona, escopo incluído, módulos adicionais com valor próprio (o cliente liga e desliga e o total é recalculado), investimento com comparativo de mercado, cronograma e aceite on-line. Sai em **link**, **PDF** (botão “Baixar PDF”, A4 com marca d'água em todas as páginas) ou **e-mail**.
- **Portfólio** (`/portfolio`): cada plataforma como case (desafio → o que construímos → o que muda para o cliente → por que funciona), com prévia, "ver ao vivo", proposta, folha do case em PDF de uma página e link de compartilhamento com UTM. O método de uso pelo marketing está em [`docs/MARKETING.md`](docs/MARKETING.md).
- **Painéis dos serviços** (`/servicos/licenciamento-saas`, `/servicos/white-label`, `/servicos/consultoria`): os cards de Serviços da home abrem um painel com visão geral, para quem é, o que está incluso, tutorial passo a passo (o visitante marca as etapas e o progresso fica salvo no navegador), boas práticas de uso profissional, comparativo improviso x profissional, autodiagnóstico com recomendação e perguntas frequentes. Textos em `public/services.js`.
- **Agenda de reuniões** (`/agendar`): o cliente escolhe reunião online ou presencial (no escritório da DRAP ou na empresa dele), um dia e um horário livre, e recebe o link `/agendar/<link>` para ver a confirmação, salvar no calendário (.ics) ou cancelar. Na proposta, "Agendar reunião" já preenche os dados e liga a reunião à negociação. A equipe confirma (online exige o link da videochamada), remarca ou cancela em Painel → Reuniões; dias, horários, intervalo, duração, antecedência e endereço ficam em Configurações. Um horário reservado some da agenda para os outros.
- **Prova social**: depoimentos pedidos ao cliente que aceitou a proposta (`/depoimento/<link>`), aprovados em Painel → Depoimentos e exibidos na home, no portfólio e na página da plataforma (só com autorização).
- **Marketing em todas as páginas**: origem do visitante (UTM, `ref`, site de origem) gravada em cada lead; botão flutuante de WhatsApp (número de Configurações); SEO gerado no build (página estática por plataforma com Open Graph, JSON-LD e FAQ, `sitemap.xml`, `robots.txt`, imagens de compartilhamento em `public/assets/og/`, geradas por `scripts/og-images.cjs`).
- **Painel `/admin`**: mostra os leads com status, notas, busca, filtros e exportação CSV, permite editar o catálogo de plataformas e os contatos do site.

Stack: HTML, CSS e JS sem framework · funções serverless da Vercel (`/api`) · **Neon Postgres** (criado pela própria Vercel).

```
public/                 site e painel (copiados para dist/ no build)
  index.html, styles.css, app.js, api.js
  platforms.js          catálogo de reserva + fonte do seed inicial
  previews.js           miniaturas da interface de cada plataforma
  sob-medida.*          questionário da plataforma sob medida
  proposta.*            página/PDF da proposta comercial
  custom-icons.js       ícones dos módulos
  admin/                painel administrativo (inclui proposals.js)
api/                    funções serverless (Node) — únicas com acesso ao banco
  catalog.js            GET  catálogo e contatos (público, cache de 60 s na CDN)
  leads.js              POST pedido de demonstração (público)
  briefs.js             GET opções / POST questionário → proposta
  proposals.js          GET proposta por token / POST aceite ou recusa
  admin/                login, logout, session, leads, platforms, settings
lib/                    banco (pg), HTTP, sessão, e-mail (Resend) e pricing.js (tabela de preços)
db/
  migrations/           esquema SQL (aplicado automaticamente no build)
  seed.sql              catálogo inicial (carregado só se a tabela estiver vazia)
scripts/                build, migração, servidor local, gerador do seed
vercel.json             build, URLs limpas e cabeçalhos de segurança (CSP)
```

## Publicar na Vercel (com Neon)

1. **Importar o projeto**: Vercel → **Add New → Project** → importe `empresaexemplo9-gif/drap-softwerehouse`. O `vercel.json` já define o build. Deixe o framework como *Other*.
2. **Criar o banco**: no projeto, abra **Storage → Create Database → Neon (Serverless Postgres)** → região **São Paulo (AWS sa-east-1)** → **Connect** ao projeto, marcando Production e Preview.
   A Vercel cria `DATABASE_URL` sozinha (se você usar "Custom Prefix", como `drapsoftwerehouse_DATABASE_URL`, o site também reconhece). Nenhum SQL manual é necessário: as tabelas e o catálogo são criados no próximo build.
3. **Variáveis do painel**: em **Settings → Environment Variables**, cadastre:

   | Variável | Valor |
   |---|---|
   | `ADMIN_EMAIL` | e-mail de login do painel |
   | `ADMIN_PASSWORD` | senha forte (16+ caracteres) |
   | `SESSION_SECRET` | texto aleatório com 32+ caracteres |

   Opcional, para enviar propostas por e-mail: `RESEND_API_KEY` e `MAIL_FROM` (crie a conta em resend.com e verifique o domínio do remetente). `MAIL_TEAM` recebe o aviso de cada questionário novo (padrão: e-mail de contato do site).

   Para gerar o `SESSION_SECRET`: `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`, ou use qualquer gerador de senhas.
4. **Deploy**: em **Deployments → Redeploy**, ou faça um push na `main`. O log do build mostra `migrate: aplicada 001_init.sql`.
5. Acesse `/admin` e entre com o e-mail e a senha do passo 3.

Depois disso, cada push na `main` publica automaticamente, e cada pull request ganha uma URL de prévia.

> Sem `DATABASE_URL`, o site continua no ar com o catálogo local e o formulário mostra um aviso. Sem as variáveis do passo 3, o painel avisa o que falta configurar.

## Se o questionário mostrar erro de banco

- **"Banco de dados não configurado neste ambiente"**: o deploy não tem `DATABASE_URL`. Prévias de branch usam o ambiente **Preview**: em Storage → Neon → **Connect Project**, marque Production **e** Preview, e faça Redeploy.
- **Tabelas novas ausentes**: não é preciso fazer nada. Se o build não migrou, a primeira requisição aplica as migrações de `db/migrations` e repete a operação.
- O painel `/admin` mostra um aviso vermelho quando o banco do ambiente está ausente ou inacessível.

## Segurança

- **Banco:** a connection string do banco só existe no servidor. O navegador fala apenas com `/api`.
- **Painel:**
  - a sessão fica num cookie `HttpOnly`, `Secure`, `SameSite=Strict`, assinado com HMAC, e vale por 8 horas;
  - trocar `ADMIN_EMAIL` ou `SESSION_SECRET` derruba as sessões abertas;
  - depois de 8 tentativas de login erradas, aquele IP fica bloqueado por 15 minutos.
- **Requisições de outros sites:** gravações vindas de outra origem são recusadas (verificação do `Origin`).
- **CSP restritiva:** sem scripts inline e com conexões apenas para o próprio domínio.

## Desenvolvimento local

Requisitos: Node 20+ e um Postgres. Pode ser um banco de desenvolvimento do próprio Neon, criado como uma *branch* no painel do Neon.

```bash
npm install
cp .env.example .env          # preencha DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, SESSION_SECRET
set -a && . ./.env && set +a
npm run dev                   # aplica migrações, gera dist/ e abre http://localhost:4173
```

O servidor local executa as funções de `api/` como a Vercel e aplica os mesmos cabeçalhos do `vercel.json`.

## Propostas sob medida

- **Preços**: ficam em `lib/pricing.js`. Cada item tem uma faixa de mercado (`market.setup` = implantação, `market.monthly` = mensalidade) e o preço DRAP sai a 40% dessa faixa (`PRICE_POSITION`), ajustado pelo número de usuários e pela urgência. As faixas são referências iniciais: revise com os seus números antes de publicar. Mudar a tabela não altera propostas já geradas; no painel, “Recalcular pela tabela de preços” aplica a tabela nova a uma proposta.
- **Complexidade**: cada funcionalidade, plataforma e integração soma pontos. Até 9 pontos e até R$ 45 mil de implantação = simples (`AUTO_LIMIT`). SaaS, marketplace, mais de 1.000 usuários, prazo menor que 1 mês e várias integrações críticas empurram para análise manual.
- **Editar e enviar**: painel → **Propostas** → abrir. Todos os valores, nomes, descrições, desconto, prazo, validade e condições são editáveis; dá para adicionar itens do catálogo ou personalizados. Botões: Ver, PDF, Link e Enviar por e-mail (com mensagem pessoal). Em **Leads**, “+ Proposta” cria uma proposta manual para quem não passou pelo questionário.
- **Plataformas do catálogo**: cada plataforma tem a sua proposta padrão, com a marca, o logo e a marca d'água da DRAP, mas na **paleta, tipografia e logo do próprio produto**. O escopo incluído, as dores, os resultados e as etapas de implantação vêm de `public/platform-details.js`; preço de implantação, licença mensal, prazo, fontes e módulos opcionais ficam em `lib/platform-plans.js` (`PLANS`). No painel: **Plataformas → Ver proposta modelo** (`/proposta/modelo/<id>`, só para a equipe logada) ou **Gerar proposta para cliente**; em **Propostas → Nova proposta**, escolha a plataforma e o número de usuários. A paleta e o logo são copiados para a proposta no momento em que ela é criada.
- **Questionário de cada plataforma** (`/plataformas/<id>/proposta`): na página de cada plataforma há o botão “Receber proposta” e o bloco “Proposta automática”. O questionário usa as cores do produto e pergunta empresa, operação atual, número de usuários, prioridades entre os módulos já incluídos e módulos extras (agora/depois). A proposta sai no tema da plataforma, com os módulos “agora” no total. Pontuação até 9 sem alertas (mais de 1.000 usuários, prazo urgente, 2+ integrações críticas) = enviada na hora; acima disso, vai para a análise da equipe. O lead entra com a plataforma de interesse e origem `questionario-plataforma`.
- **Pré-visualização**: logado no painel, você abre a proposta mesmo em análise ou rascunho; o cliente só vê depois de enviada.

## Editar conteúdo

- **Texto das páginas de plataforma**: `public/platform-details.js`, com um bloco por plataforma (chave = `id`). A seção “Por que comprar da DRAP” fica em `DRAP_QUALITY`, no mesmo arquivo.

- **Plataformas e contatos**: pelo painel `/admin`. As mudanças aparecem no site em até 1 minuto, por causa do cache da CDN.
- **Prévia de uma plataforma**: as miniaturas ficam em `public/previews.js`, numa função por plataforma. Para usar um screenshot real, coloque a imagem em `public/assets/previews/` e preencha a coluna `preview_image` da plataforma, por exemplo `/assets/previews/tela.png`.
- **Nova plataforma**: insira a linha na tabela `platforms`, pelo editor SQL do Neon. Para a prévia, adicione uma função com o mesmo `id` em `previews.js`.
- **Mudar o esquema**: crie `db/migrations/002_*.sql`. Ele é aplicado uma única vez no próximo deploy.
