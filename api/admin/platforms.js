// GET   /api/admin/platforms          → todas (inclusive ocultas)
// PATCH /api/admin/platforms?id=<id>  → campos editáveis
import { query } from "../../lib/db.js";
import { handler, send, readJson, httpError } from "../../lib/http.js";
import { requireAdmin } from "../../lib/auth.js";

const TEXT = { name: 80, code: 20, category: 60, tagline: 160, summary: 600, url: 300 };
const LIST = { features: 6, stack: 6, palette: 6 };

export default handler(["GET", "PATCH"], async (req, res) => {
  requireAdmin(req);
  if (req.method === "GET") {
    const { rows } = await query("select * from platforms order by sort_order, name");
    return send(res, 200, rows);
  }
  const id = new URL(req.url, "http://x").searchParams.get("id") || "";
  const b = await readJson(req, 32_000);
  const sets = [], vals = [];
  const add = (col, v) => { vals.push(v); sets.push(`${col} = $${vals.length}`); };
  for (const [k, max] of Object.entries(TEXT)) if (k in b) {
    const v = String(b[k] ?? "").trim();
    if (v.length > max || (["name", "code", "category"].includes(k) && v.length < 2)) throw httpError(400, `Campo "${k}" inválido.`);
    add(k, v);
  }
  for (const [k, max] of Object.entries(LIST)) if (k in b) {
    if (!Array.isArray(b[k])) throw httpError(400, `Campo "${k}" deve ser uma lista.`);
    const v = b[k].map((x) => String(x).trim()).filter(Boolean).slice(0, max);
    if (k === "palette" && (!v.length || v.some((h) => !/^#[0-9a-f]{6}$/i.test(h)))) throw httpError(400, "Paleta inválida: use cores hex como #1F4E5A.");
    add(k, k === "palette" ? v.map((h) => h.toUpperCase()) : v);
  }
  if ("status" in b) { if (!["Disponível", "Beta", "Sob demanda"].includes(b.status)) throw httpError(400, "Status inválido."); add("status", b.status); }
  if ("sort_order" in b) add("sort_order", Math.max(0, Math.min(100000, parseInt(b.sort_order, 10) || 0)));
  if ("active" in b) add("active", Boolean(b.active));
  if (!sets.length) throw httpError(400, "Nada para alterar.");
  vals.push(id);
  const r = await query(`update platforms set ${sets.join(", ")} where id = $${vals.length}`, vals);
  if (!r.rowCount) throw httpError(404, "Plataforma não encontrada.");
  send(res, 200, { ok: true });
});
