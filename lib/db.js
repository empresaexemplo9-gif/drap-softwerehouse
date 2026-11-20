// Conexão com o Postgres (Neon via integração da Vercel, ou local).
// A integração Neon ↔ Vercel define DATABASE_URL (pooled) automaticamente.
import pg from "pg";

// Colunas `date` chegam como texto "AAAA-MM-DD" (sem conversão de fuso horário).
pg.types.setTypeParser(1082, (v) => v);

// Aceita também as variáveis com prefixo que a Vercel cria ao conectar um banco com
// "Custom Prefix" (ex.: drapsoftwerehouse_DATABASE_URL). Prioridade: pooled antes de unpooled.
export function databaseUrl() {
  const env = process.env;
  if (env.DATABASE_URL) return env.DATABASE_URL;
  if (env.POSTGRES_URL) return env.POSTGRES_URL;
  const keys = Object.keys(env);
  for (const suffix of ["_DATABASE_URL", "_POSTGRES_URL"]) {
    const k = keys.find((x) => x.endsWith(suffix) && env[x]);
    if (k) return env[k];
  }
  return "";
}

let pool;
export function getPool() {
  if (pool) return pool;
  const connectionString = databaseUrl();
  if (!connectionString) throw Object.assign(new Error("DATABASE_URL não configurada"), { code: "NO_DB" });
  const local = /@(localhost|127\.0\.0\.1)[:/]/.test(connectionString);
  pool = new pg.Pool({
    connectionString,
    ssl: local ? false : { rejectUnauthorized: true },
    max: 3,                       // serverless: poucas conexões por instância; o pooler do Neon faz o resto
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 8_000,
  });
  return pool;
}

export const query = (text, params) => getPool().query(text, params);
