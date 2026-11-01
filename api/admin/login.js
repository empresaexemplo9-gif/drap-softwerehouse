// POST /api/admin/login → valida ADMIN_EMAIL/ADMIN_PASSWORD e abre a sessão (cookie HttpOnly)
import { query } from "../../lib/db.js";
import { handler, send, readJson, httpError, clientIpHash } from "../../lib/http.js";
import { adminConfigured, checkCredentials, sessionCookie } from "../../lib/auth.js";

export default handler(["POST"], async (req, res) => {
  if (!adminConfigured()) throw httpError(503, "Painel não configurado: defina ADMIN_EMAIL, ADMIN_PASSWORD e SESSION_SECRET na Vercel.");
  const ip = clientIpHash(req);
  const { rows } = await query(
    "select count(*)::int as n from login_attempts where ip_hash = $1 and not ok and created_at > now() - interval '15 minutes'", [ip]);
  if (rows[0].n >= 8) throw httpError(429, "Muitas tentativas. Aguarde 15 minutos.");

  const { email, password } = await readJson(req, 2_000);
  const ok = checkCredentials(email, password);
  await query("insert into login_attempts (ip_hash, ok) values ($1, $2)", [ip, ok]);
  await query("delete from login_attempts where created_at < now() - interval '1 day'");
  if (!ok) { await new Promise((r) => setTimeout(r, 400)); throw httpError(401, "E-mail ou senha inválidos."); }
  send(res, 200, { email: String(email).trim().toLowerCase() }, { "Set-Cookie": sessionCookie(String(email).trim().toLowerCase()) });
});
