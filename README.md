# DRAP SoftwareHouse & Business

Site de apresentação e marketing da DRAP, com:

- **Home**: hero, catálogo das plataformas prontas (cards com prévia da interface, paleta e logo de cada uma), serviços, processo e contato. Tema claro (padrão) e escuro, visual vítreo.
- **Captação de leads**: o formulário grava no Supabase, com validação no navegador e no banco, campo-isca anti-robô e limite de 5 envios por e-mail a cada 10 minutos.
- **Painel `/admin`**: login pelo Supabase Auth. Mostra os leads com status, notas, busca, filtros e exportação CSV, permite editar o catálogo de plataformas e os contatos do site.

Stack: HTML, CSS e JS sem framework · Supabase (Postgres + Auth + RLS) · Vercel (build estático).

```
public/                 site e painel (copiados para dist/ no build)
  index.html, styles.css, app.js
  api.js                cliente REST mínimo do Supabase (site público)
  platforms.js          catálogo de reserva + fonte do seed inicial
  previews.js           miniaturas da interface de cada plataforma
  admin/                painel administrativo
supabase/
  migrations/           esquema, RLS e funções
  seed.sql              catálogo inicial (gerado por npm run seed:gen)
scripts/
  build.mjs             gera dist/ e dist/config.js a partir das variáveis de ambiente
  serve.mjs             servidor local (aplica os cabeçalhos do vercel.json)
  gen-seed.mjs          gera supabase/seed.sql a partir de public/platforms.js
vercel.json             build, URLs limpas e cabeçalhos de segurança (CSP)
```

## 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com) (região São Paulo, `sa-east-1`).
2. Em **SQL Editor**, rode na ordem:
   1. `supabase/migrations/20261101000000_init.sql`
   2. `supabase/seed.sql`

   Ou, com a CLI: `supabase link --project-ref <ref>` e depois `supabase db push`. Rode o `seed.sql` no SQL Editor.
3. **Criar o primeiro administrador**:
   - Em **Authentication → Users → Add user**, crie o usuário com e-mail e senha e marque *Auto Confirm User*.
   - No SQL Editor, rode:
     ```sql
     insert into public.admins (user_id)
     select id from auth.users where email = 'seu-email@empresa.com';
     ```
4. Recomendado: em **Authentication → Sign In / Providers**, desligue *Allow new users to sign up*. O painel não tem cadastro público. Mesmo assim, uma conta nova não vê nada se não estiver em `admins`.
5. Em **Project Settings → API**, copie a **Project URL** e a chave **anon / publishable**.

### Segurança (RLS)

| Tabela | Visitante (anon) | Admin |
|---|---|---|
| `platforms` | lê as ativas | lê, cria, edita, remove |
| `site_settings` | lê | lê e edita |
| `leads` | **só insere** (sem status ou notas; não lê) | lê, edita, remove |
| `admins` | nada | lê |

A chave anon vai para o navegador, e isso é esperado: a proteção vem das políticas acima. **Nunca** use a chave `service_role` no site; o build recusa se ela for informada por engano.

## 2. GitHub

```bash
git remote add origin https://github.com/<conta>/<repositorio>.git
git push -u origin main
```

## 3. Vercel

1. **Add New → Project**, importe o repositório do GitHub. O `vercel.json` já define o build (`npm run build`) e a saída (`dist`). Não escolha framework.
2. Em **Settings → Environment Variables** (Production e Preview):
   - `SUPABASE_URL` = Project URL
   - `SUPABASE_ANON_KEY` = chave anon / publishable

   A integração oficial Supabase ↔ Vercel também funciona: o build aceita `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Faça o deploy. Cada push na `main` publica automaticamente, e cada pull request ganha uma prévia.
4. Opcional: em **Settings → Domains**, adicione o domínio da empresa.

Depois do deploy, acesse `/admin` com o usuário criado no passo 1.3.

## Desenvolvimento local

```bash
npm install
cp .env.example .env    # preencha, ou exporte as variáveis no shell
export $(grep -v '^#' .env | xargs) && npm run dev   # http://localhost:4173
```

Sem as variáveis, o site funciona com o catálogo local (`public/platforms.js`) e o formulário fica desativado com aviso.

## Editar conteúdo

- **Plataformas e contatos**: pelo painel `/admin`. As mudanças aparecem na hora.
- **Prévia de uma plataforma**: as miniaturas ficam em `public/previews.js`, numa função por plataforma. Para usar um screenshot real, preencha `preview_image` na tabela `platforms` com o caminho da imagem, por exemplo `/assets/previews/tela.png`, colocando o arquivo em `public/assets/previews/`.
- **Nova plataforma**: insira a linha em `platforms` (SQL Editor ou Table Editor). Para a prévia, adicione uma função com o mesmo `id` em `previews.js`, ou use `preview_image`.
