// GET   /api/admin/leads           → lista (até 1000, mais recentes primeiro)
// PATCH /api/admin/leads?id=<uuid> → { status?, notes? }
import { query } from "../../lib/db.js";
import { handler, send, readJson, httpError } from "../../lib/http.js";
import { requireAdmin } from "../../lib/auth.js";

const STATUS = ["novo", "em_contato", "proposta", "ganho", "perdido"];

export default handler(["GET", "PATCH"], async (req, res) => {
  requireAdmin(req);
  if (req.method === "GET") {
    const { rows } = await query(
      `select id, name, email, phone, company, platform_id, interest, message, source, status, notes, created_at, forwarded_via, forwarded_at, forward_error
         from leads order by created_at desc limit 1000`);
    return send(res, 200, rows);
  }
  const id = new URL(req.url, "http://x").searchParams.get("id") || "";
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw httpError(400, "id inválido.");
  const b = await readJson(req, 8_000);
  const sets = [], vals = [];
  if ("status" in b) { if (!STATUS.includes(b.status)) throw httpError(400, "Status inválido."); vals.push(b.status); sets.push(`status = $${vals.length}`); }
  if ("notes" in b) { const n = b.notes == null ? null : String(b.notes).slice(0, 4000) || null; vals.push(n); sets.push(`notes = $${vals.length}`); }
  if (!sets.length) throw httpError(400, "Nada para alterar.");
  vals.push(id);
  const r = await query(`update leads set ${sets.join(", ")} where id = $${vals.length}`, vals);
  if (!r.rowCount) throw httpError(404, "Lead não encontrado.");
  send(res, 200, { ok: true });
});
