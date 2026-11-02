// GET   /api/admin/proposals                → lista + catálogo de preços + se o e-mail está configurado
// GET   /api/admin/proposals?id=<uuid>      → proposta completa (com respostas e dados internos)
// POST  /api/admin/proposals                → cria proposta manual { client_name, client_email, ..., platform_id?, users? }
//                                            (com platform_id: proposta padrão da plataforma do catálogo, no tema dela)
// PATCH /api/admin/proposals?id=<uuid>      → edita campos (valores, itens, textos, status)
// POST  /api/admin/proposals?id=<uuid>&action=send   → envia por e-mail { message? }
// POST  /api/admin/proposals?id=<uuid>&action=reprice → recalcula itens pelo questionário
import { query } from "../../lib/db.js";
import { handler, send, readJson, httpError } from "../../lib/http.js";
import { requireAdmin } from "../../lib/auth.js";
import { USERS, adminCatalog, publicCatalog, estimate, normalizeBrief, totalsOf } from "../../lib/pricing.js";
import { newToken, DEFAULT_TERMS, cleanItems, deliverProposal, proposalUrl } from "../../lib/proposals.js";
import { mailConfigured } from "../../lib/mail.js";
import { platformProposal, PLATFORM_TERMS } from "../../lib/platform-plans.js";

async function platformRow(id) {
  const { rows: [pl] } = await query("select * from platforms where id = $1", [String(id)]);
  if (!pl) throw httpError(400, "Plataforma não encontrada.");
  return pl;
}

const STATUS = ["em_analise", "rascunho", "enviada", "visualizada", "aceita", "recusada"];
const isId = (id) => /^[0-9a-f-]{36}$/i.test(id);

async function get(id) {
  const { rows: [p] } = await query("select * from proposals where id = $1", [id]);
  if (!p) throw httpError(404, "Proposta não encontrada.");
  return p;
}
const withUrl = (req, p) => ({ ...p, url: proposalUrl(req, p.token), totals: totalsOf(p.items, p.discount_pct) });

export default handler(["GET", "POST", "PATCH"], async (req, res) => {
  requireAdmin(req);
  const params = new URL(req.url, "http://x").searchParams;
  const id = params.get("id") || "";

  if (req.method === "GET") {
    if (id) { if (!isId(id)) throw httpError(400, "id inválido."); return send(res, 200, withUrl(req, await get(id))); }
    const { rows } = await query(
      `select id, token, number, status, complexity, score, auto, platform_id, platform->>'name' as platform_name,
              platform->'palette'->>0 as platform_color, client_name, client_email, client_company, title,
              items, discount_pct, sent_at, viewed_at, view_count, decided_at, valid_until, created_at
         from proposals order by created_at desc limit 500`);
    return send(res, 200, { proposals: rows.map((p) => withUrl(req, p)), catalog: adminCatalog(), labels: publicCatalog(), mail: mailConfigured() });
  }

  if (req.method === "POST" && !id) {
    const b = await readJson(req, 8_000);
    const name = String(b.client_name || "").trim(), email = String(b.client_email || "").trim().toLowerCase();
    if (name.length < 2) throw httpError(400, "Informe o nome do cliente.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw httpError(400, "Informe um e-mail válido.");
    const company = String(b.client_company || "").trim().slice(0, 120) || null;
    const phone = String(b.client_phone || "").trim().slice(0, 40) || null;
    const leadId = isId(String(b.lead_id || "")) ? b.lead_id : null;
    if (b.platform_id) {
      const users = USERS[b.users] ? b.users : "11-50";
      const pp = platformProposal(await platformRow(b.platform_id), { users, company: company || name });
      const { rows: [p] } = await query(
        `insert into proposals (token, status, complexity, client_name, client_email, client_phone, client_company, lead_id,
           title, intro, items, weeks, payment_terms, brief, platform_id, platform)
         values ($1, 'rascunho', 'simples', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) returning *`,
        [newToken(), name.slice(0, 120), email, phone, company, leadId, pp.title.slice(0, 140), pp.intro.slice(0, 4000),
         JSON.stringify(pp.items), pp.weeks, PLATFORM_TERMS, JSON.stringify({ users }), b.platform_id, JSON.stringify(pp.platform)]);
      return send(res, 201, withUrl(req, p));
    }
    const cat = adminCatalog();
    const { rows: [p] } = await query(
      `insert into proposals (token, status, complexity, client_name, client_email, client_phone, client_company, lead_id, title, intro, items, payment_terms, brief)
       values ($1, 'rascunho', 'media', $2, $3, $4, $5, $6, $7, $8, $9, $10, '{}') returning *`,
      [newToken(), name.slice(0, 120), email, phone, company, leadId,
       `Plataforma sob medida${company ? " · " + company : ""}`.slice(0, 140),
       `Preparamos esta proposta para ${company || name} com base na nossa conversa.`,
       JSON.stringify([cat.nucleo, { ...cat.nfe, selected: false }, { ...cat.banco, selected: false }]), DEFAULT_TERMS]);
    return send(res, 201, withUrl(req, p));
  }

  if (!isId(id)) throw httpError(400, "id inválido.");
  const p = await get(id);

  if (req.method === "POST") {
    const action = params.get("action");
    if (action === "send") {
      const b = await readJson(req, 4_000).catch(() => ({}));
      const url = await deliverProposal(req, p, String(b.message || "").trim().slice(0, 1500) || null);
      if (p.lead_id) await query(`update leads set status = 'proposta' where id = $1 and status in ('novo', 'em_contato')`, [p.lead_id]);
      return send(res, 200, { ok: true, url, ...withUrl(req, await get(id)) });
    }
    if (action === "reprice" && p.platform_id) {
      const pp = platformProposal(await platformRow(p.platform_id), { users: p.brief?.users, company: p.client_company || p.client_name });
      const { rows: [u] } = await query(`update proposals set items = $2, weeks = $3, platform = $4 where id = $1 returning *`,
        [id, JSON.stringify(pp.items), pp.weeks, JSON.stringify(pp.platform)]);
      return send(res, 200, withUrl(req, u));
    }
    if (action === "reprice") {
      if (!p.brief?.description) throw httpError(400, "Esta proposta não veio do questionário: edite os itens à mão.");
      const est = estimate(normalizeBrief(p.brief));
      const { rows: [u] } = await query(
        `update proposals set items = $2, score = $3, complexity = $4, reasons = $5, weeks = $6 where id = $1 returning *`,
        [id, JSON.stringify(est.items), est.score, est.complexity, est.reasons, est.weeks]);
      return send(res, 200, withUrl(req, u));
    }
    throw httpError(400, "Ação inválida.");
  }

  // PATCH
  const b = await readJson(req, 64_000);
  const sets = [], vals = [];
  const add = (col, v) => { vals.push(v); sets.push(`${col} = $${vals.length}`); };
  const text = { title: [2, 140], intro: [0, 4000], payment_terms: [0, 1000], client_name: [2, 120], client_company: [0, 120], client_phone: [0, 40], internal_notes: [0, 4000] };
  for (const [k, [min, max]] of Object.entries(text)) if (k in b) {
    const v = String(b[k] ?? "").trim();
    if (v.length < min || v.length > max) throw httpError(400, `Campo "${k}" inválido.`);
    add(k, v || (min ? v : null));
  }
  if ("client_email" in b) {
    const e = String(b.client_email || "").trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) throw httpError(400, "E-mail do cliente inválido.");
    add("client_email", e);
  }
  if ("items" in b) add("items", JSON.stringify(cleanItems(b.items)));
  if ("discount_pct" in b) add("discount_pct", Math.max(0, Math.min(60, Number(b.discount_pct) || 0)));
  if ("weeks" in b) add("weeks", Math.max(1, Math.min(104, parseInt(b.weeks, 10) || 8)));
  if ("show_market" in b) add("show_market", Boolean(b.show_market));
  if ("valid_until" in b) { if (!/^\d{4}-\d{2}-\d{2}$/.test(b.valid_until)) throw httpError(400, "Validade inválida."); add("valid_until", b.valid_until); }
  if ("complexity" in b) { if (!["simples", "media", "complexa"].includes(b.complexity)) throw httpError(400, "Complexidade inválida."); add("complexity", b.complexity); }
  if ("status" in b) {
    if (!STATUS.includes(b.status)) throw httpError(400, "Status inválido.");
    add("status", b.status);
    if (b.status === "enviada" && !p.sent_at) sets.push("sent_at = now()");
  }
  if (!sets.length) throw httpError(400, "Nada para alterar.");
  vals.push(id);
  const { rows: [u] } = await query(`update proposals set ${sets.join(", ")} where id = $${vals.length} returning *`, vals);
  send(res, 200, withUrl(req, u));
});
