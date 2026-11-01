# DRAP SoftwareHouse & Business

Site de apresentação e marketing da DRAP, com:

- **Home**: hero, catálogo das plataformas prontas (cards com prévia da interface, paleta e logo de cada uma), serviços, processo e contato. Tema claro (padrão) e escuro, visual vítreo.
- **Captação de leads**: o formulário grava no banco, com validação no navegador e no servidor, campo-isca anti-robô e limite de envios (5 por e-mail e 20 por IP a cada 10 minutos).
- **Página de cada plataforma** (`/plataformas/<id>`): clicar no card abre uma apresentação completa para o cliente: para quem é, problemas que resolve, resultados, módulos, implantação, diferenciais, segurança, “Por que comprar da DRAP”, perguntas frequentes e formulário de demonstração.
- **Painel `/admin`**: mostra os leads com status, notas, busca, filtros e exportação CSV, permite editar o catálogo de plataformas e os contatos do site.

Stack: HTML, CSS e JS sem framework · funções serverless da Vercel (`/api`) · **Neon Postgres** (criado pela própria Vercel).

```
public/                 site e painel (copiados para dist/ no build)
  index.html, styles.css, app.js, api.js
  platforms.js          catálogo de reserva + fonte do seed inicial
  previews.js           miniaturas da interface de cada plataforma
  admin/                painel administrativo
api/                    funções serverless (Node) — únicas com acesso ao banco
  catalog.js            GET  catálogo e contatos (público, cache de 60 s na CDN)
  leads.js              POST pedido de demonstração (público)
  admin/                login, logout, session, leads, platforms, settings
lib/                    banco (pg), HTTP e sessão (cookie assinado)
db/
  migrations/           esquema SQL (aplicado automaticamente no build)
  seed.sql              catálogo inicial (carregado só se a tabela estiver vazia)
scripts/                build, migração, servidor local, gerador do seed
vercel.json             build, URLs limpas e cabeçalhos de segurança (CSP)
```

## Publicar na Vercel (com Neon)

1. **Importar o projeto**: Vercel → **Add New → Project** → importe `empresaexemplo9-gif/drap-softwerehouse`. O `vercel.json` já define o build. Deixe o framework como *Other*.
2. **Criar o banco**: no projeto, abra **Storage → Create Database → Neon (Serverless Postgres)** → região **São Paulo (AWS sa-east-1)** → **Connect** ao projeto, marcando Production e Preview.
   A Vercel cria `DATABASE_URL` sozinha. Nenhum SQL manual é necessário: as tabelas e o catálogo são criados no próximo build.
3. **Variáveis do painel**: em **Settings → Environment Variables**, cadastre:

   | Variável | Valor |
   |---|---|
   | `ADMIN_EMAIL` | e-mail de login do painel |
   | `ADMIN_PASSWORD` | senha forte (16+ caracteres) |
   | `SESSION_SECRET` | texto aleatório com 32+ caracteres |

   Para gerar o `SESSION_SECRET`: `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`, ou use qualquer gerador de senhas.
4. **Deploy**: em **Deployments → Redeploy**, ou faça um push na `main`. O log do build mostra `migrate: aplicada 001_init.sql`.
5. Acesse `/admin` e entre com o e-mail e a senha do passo 3.

Depois disso, cada push na `main` publica automaticamente, e cada pull request ganha uma URL de prévia.

> Sem `DATABASE_URL`, o site continua no ar com o catálogo local e o formulário mostra um aviso. Sem as variáveis do passo 3, o painel avisa o que falta configurar.

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

## Editar conteúdo

- **Texto das páginas de plataforma**: `public/platform-details.js`, com um bloco por plataforma (chave = `id`). A seção “Por que comprar da DRAP” fica em `DRAP_QUALITY`, no mesmo arquivo.

- **Plataformas e contatos**: pelo painel `/admin`. As mudanças aparecem no site em até 1 minuto, por causa do cache da CDN.
- **Prévia de uma plataforma**: as miniaturas ficam em `public/previews.js`, numa função por plataforma. Para usar um screenshot real, coloque a imagem em `public/assets/previews/` e preencha a coluna `preview_image` da plataforma, por exemplo `/assets/previews/tela.png`.
- **Nova plataforma**: insira a linha na tabela `platforms`, pelo editor SQL do Neon. Para a prévia, adicione uma função com o mesmo `id` em `previews.js`.
- **Mudar o esquema**: crie `db/migrations/002_*.sql`. Ele é aplicado uma única vez no próximo deploy.
