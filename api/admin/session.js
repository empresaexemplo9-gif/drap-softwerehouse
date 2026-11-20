// GET /api/admin/session → usuário da sessão atual (401 se não logado) + diagnóstico do ambiente
import { handler, send, httpError } from "../../lib/http.js";
import { adminConfigured, requireAdmin } from "../../lib/auth.js";
import { databaseUrl, query } from "../../lib/db.js";
import { mailConfigured } from "../../lib/mail.js";

async function dbStatus() {
  if (!databaseUrl()) return { ok: false, problem: "DATABASE_URL ausente neste ambiente (Production ou Preview) da Vercel." };
  try {
    const { rows } = await query("select name from schema_migrations order by name");
    return { ok: true, migrations: rows.map((r) => r.name) };
  } catch (e) {
    return { ok: false, problem: `Banco inacessível: ${e.code || ""} ${e.message}`.trim() };
  }
}

export default handler(["GET"], async (req, res) => {
  if (!adminConfigured()) throw httpError(503, "Painel não configurado: defina ADMIN_EMAIL, ADMIN_PASSWORD e SESSION_SECRET na Vercel.");
  const { email } = requireAdmin(req);
  send(res, 200, { email, env: process.env.VERCEL_ENV || "local", db: await dbStatus(), mail: mailConfigured() });
});
