// GET /api/admin/settings → { chave: valor }
// PUT /api/admin/settings → { chave: valor, ... } (apenas chaves conhecidas)
import { query } from "../../lib/db.js";
import { handler, send, readJson, httpError } from "../../lib/http.js";
import { requireAdmin } from "../../lib/auth.js";

const KEYS = ["contact_email", "contact_whatsapp", "contact_hours"];

export default handler(["GET", "PUT"], async (req, res) => {
  requireAdmin(req);
  if (req.method === "PUT") {
    const b = await readJson(req, 4_000);
    for (const k of KEYS) if (k in b) {
      const v = String(b[k] ?? "").trim();
      if (!v || v.length > 500) throw httpError(400, `Valor inválido para ${k}.`);
      await query(`insert into site_settings (key, value) values ($1, $2) on conflict (key) do update set value = excluded.value`, [k, v]);
    }
  }
  const { rows } = await query("select key, value from site_settings");
  send(res, 200, Object.fromEntries(rows.map((r) => [r.key, r.value])));
});
