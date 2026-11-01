// Conexão com o Postgres (Neon via integração da Vercel, ou local).
// A integração Neon ↔ Vercel define DATABASE_URL (pooled) automaticamente.
import pg from "pg";

export const databaseUrl = () => process.env.DATABASE_URL || process.env.POSTGRES_URL || "";

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
