// Aplica as migrações pendentes de db/migrations e, se o catálogo estiver vazio,
// carrega db/seed.sql. Roda no build da Vercel (quando há DATABASE_URL), à mão
// (npm run db:migrate) e também em tempo de execução: se uma função da API encontra
// uma tabela ou coluna faltando, ela aplica as migrações e tenta de novo (lib/http.js).
import { readFileSync, readdirSync } from "node:fs";
import { getPool, databaseUrl } from "./db.js";

export async function migrate({ log = console.log } = {}) {
  if (!databaseUrl()) { log("migrate: DATABASE_URL ausente — pulando."); return false; }
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("select pg_advisory_lock(842117)"); // evita duas migrações simultâneas (builds paralelos)
    await client.query(`create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())`);
    const done = new Set((await client.query("select name from schema_migrations")).rows.map((r) => r.name));
    const dir = new URL("../db/migrations/", import.meta.url);
    for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
      if (done.has(file)) continue;
      await client.query("begin");
      try {
        await client.query(readFileSync(new URL(file, dir), "utf8"));
        await client.query("insert into schema_migrations (name) values ($1)", [file]);
        await client.query("commit");
        log(`migrate: aplicada ${file}`);
      } catch (e) { await client.query("rollback"); throw new Error(`migrate: falhou em ${file}: ${e.message}`); }
    }
    const { rows } = await client.query("select count(*)::int as n from platforms");
    if (rows[0].n === 0) {
      await client.query(readFileSync(new URL("../db/seed.sql", import.meta.url), "utf8"));
      log("migrate: catálogo inicial carregado (db/seed.sql)");
    }
    log("migrate: banco atualizado");
    return true;
  } finally {
    await client.query("select pg_advisory_unlock(842117)").catch(() => {});
    client.release();
  }
}

// Uma vez por instância: várias requisições simultâneas aguardam a mesma migração
let running;
export const ensureMigrated = () => (running ||= migrate({ log: (m) => console.log(m) }).catch((e) => { running = null; throw e; }));
