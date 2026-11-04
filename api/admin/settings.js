// Configurações do site e conteúdo de marketing (uma função só, para caber no limite de funções da Vercel)
// GET /api/admin/settings                        → { chave: valor }
// PUT /api/admin/settings                        → { chave: valor, ... } (apenas chaves conhecidas)
// GET    /api/admin/settings?r=testimonials      → depoimentos (todos, inclusive não publicados)
// POST   /api/admin/settings?r=testimonials      → cria { name, role, company, quote, rating, platform_id, consent, published }
// PATCH  /api/admin/settings?r=testimonials&id=  → altera campos
// DELETE /api/admin/settings?r=testimonials&id=  → remove
import { query } from "../../lib/db.js";
import { handler, send, readJson, httpError } from "../../lib/http.js";
import { requireAdmin } from "../../lib/auth.js";

const KEYS = ["contact_email", "contact_whatsapp", "contact_hours", "proposal_auto_send"];

const T_TEXT = { name: [2, 120], role: [0, 120], company: [0, 120], quote: [20, 1200] };
function testimonialFields(b, partial) {
  const out = {};
  for (const [k, [min, max]] of Object.entries(T_TEXT)) if (k in b || !partial) {
    const v = String(b[k] ?? "").trim();
    if (v.length < min || v.length > max) throw httpError(400, k === "quote" ? "O depoimento precisa ter entre 20 e 1.200 caracteres." : `Campo "${k}" inválido.`);
    out[k] = v || null;
  }
  if ("rating" in b) out.rating = b.rating == null || b.rating === "" ? null : Math.max(1, Math.min(5, parseInt(b.rating, 10) || 5));
  if ("platform_id" in b) out.platform_id = /^[a-z0-9-]{2,40}$/.test(b.platform_id || "") ? b.platform_id : null;
  if ("consent" in b) out.consent = Boolean(b.consent);
  if ("published" in b) out.published = Boolean(b.published);
  if ("sort_order" in b) out.sort_order = Math.max(0, Math.min(100000, parseInt(b.sort_order, 10) || 100));
  return out;
}

async function testimonials(req, res, id) {
  if (req.method === "GET") {
    const { rows } = await query(
      `select t.*, p.number as proposal_number from testimonials t left join proposals p on p.id = t.proposal_id
        order by t.published desc, t.sort_order, t.created_at desc`);
    return send(res, 200, rows);
  }
  if (req.method === "POST") {
    const f = testimonialFields(await readJson(req, 8_000), false);
    if (f.published && !f.consent) throw httpError(400, "Só publique com a autorização do cliente.");
    const cols = Object.keys(f);
    const { rows: [t] } = await query(
      `insert into testimonials (${cols.join(", ")}) values (${cols.map((_, i) => `$${i + 1}`).join(", ")}) returning *`, Object.values(f));
    return send(res, 201, t);
  }
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw httpError(400, "id inválido.");
  if (req.method === "DELETE") {
    await query("delete from testimonials where id = $1", [id]);
    return send(res, 200, { ok: true });
  }
  const f = testimonialFields(await readJson(req, 8_000), true);
  const cols = Object.keys(f);
  if (!cols.length) throw httpError(400, "Nada para alterar.");
  const { rows: [t] } = await query(
    `update testimonials set ${cols.map((c, i) => `${c} = $${i + 1}`).join(", ")} where id = $${cols.length + 1} returning *`, [...Object.values(f), id]);
  if (!t) throw httpError(404, "Depoimento não encontrado.");
  if (t.published && !t.consent) throw httpError(400, "Só publique com a autorização do cliente.");
  send(res, 200, t);
}

export default handler(["GET", "PUT", "POST", "PATCH", "DELETE"], async (req, res) => {
  requireAdmin(req);
  const params = new URL(req.url, "http://x").searchParams;
  if (params.get("r") === "testimonials") return testimonials(req, res, params.get("id") || "");
  if (!["GET", "PUT"].includes(req.method)) throw httpError(405, "Método não permitido.");
  if (req.method === "PUT") {
    const b = await readJson(req, 4_000);
    for (const k of KEYS) if (k in b) {
      const v = String(b[k] ?? "").trim();
      if (!v || v.length > 500) throw httpError(400, `Valor inválido para ${k}.`);
      if (k === "proposal_auto_send" && !["sim", "nao"].includes(v)) throw httpError(400, "Use sim ou nao.");
      await query(`insert into site_settings (key, value) values ($1, $2) on conflict (key) do update set value = excluded.value`, [k, v]);
    }
  }
  const { rows } = await query("select key, value from site_settings");
  send(res, 200, Object.fromEntries(rows.map((r) => [r.key, r.value])));
});
