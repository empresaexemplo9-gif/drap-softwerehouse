// GET  /api/proposals?token=…  → proposta para o cliente (só depois de liberada pela equipe;
//                                a equipe logada vê também rascunhos e propostas em análise)
// GET  /api/proposals?model=<plataforma> → modelo da proposta padrão de uma plataforma do catálogo
//                                (só para a equipe logada; nada é gravado)
// POST /api/proposals?token=…  → { action: "accept", modules: [keys] } | { action: "decline", reason }
//                                | { action: "testimonial", name, role, company, quote, rating, consent } (só proposta aceita)
import { query } from "../lib/db.js";
import { handler, send, readJson, httpError } from "../lib/http.js";
import { readSession } from "../lib/auth.js";
import { publicView, settings, DEFAULT_TERMS } from "../lib/proposals.js";
import { platformProposal, PLATFORM_TERMS } from "../lib/platform-plans.js";

const isAdmin = (req) => { try { return Boolean(readSession(req)); } catch { return false; } };

// Proposta-modelo de uma plataforma, montada na hora para pré-visualização
async function model(req, res, id) {
  if (!isAdmin(req)) throw httpError(401, "Entre no painel para ver os modelos de proposta.");
  const { rows: [pl] } = await query("select * from platforms where id = $1", [id]);
  if (!pl) throw httpError(404, "Plataforma não encontrada.");
  const pp = platformProposal(pl, { company: "Sua empresa" });
  const today = new Date().toISOString().slice(0, 10);
  const valid = new Date(Date.now() + 15 * 864e5).toISOString().slice(0, 10);
  const s = await settings().catch(() => ({}));
  send(res, 200, { ...publicView({
    ...pp, number: `MODELO-${pl.code}`, status: "rascunho", client_name: "Nome do cliente", client_company: "Sua empresa",
    brief: {}, discount_pct: 0, payment_terms: PLATFORM_TERMS || DEFAULT_TERMS, show_market: true, valid_until: valid, created_at: today,
  }, { email: s.contact_email, whatsapp: s.contact_whatsapp, hours: s.contact_hours }), preview: true, model: true });
}

const PUBLISHED = ["enviada", "visualizada", "aceita", "recusada"];

async function load(req) {
  const token = new URL(req.url, "http://x").searchParams.get("token") || "";
  if (!/^[A-Za-z0-9_-]{24,64}$/.test(token)) throw httpError(404, "Proposta não encontrada.");
  const { rows: [p] } = await query("select * from proposals where token = $1", [token]);
  if (!p) throw httpError(404, "Proposta não encontrada.");
  let admin = false;
  try { admin = Boolean(readSession(req)); } catch { /* painel não configurado */ }
  return { p, admin };
}

export default handler(["GET", "POST"], async (req, res) => {
  const m = new URL(req.url, "http://x").searchParams.get("model");
  if (m && req.method === "GET") return model(req, res, m.replace(/[^a-z0-9-]/g, "").slice(0, 40));
  const { p, admin } = await load(req);
  if (!PUBLISHED.includes(p.status) && !admin)
    return send(res, 202, { pending: true, number: p.number, client: { name: p.client_name } });

  if (req.method === "GET") {
    if (!admin) {
      await query(`update proposals set view_count = view_count + 1, viewed_at = coalesce(viewed_at, now()),
                     status = case when status = 'enviada' then 'visualizada' else status end where id = $1`, [p.id]);
      if (p.status === "enviada") p.status = "visualizada";
    }
    const s = await settings().catch(() => ({}));
    const contact = { email: s.contact_email, whatsapp: s.contact_whatsapp, hours: s.contact_hours };
    return send(res, 200, { ...publicView(p, contact), preview: admin });
  }

  if (admin) throw httpError(403, "Pré-visualização da equipe: a resposta deve partir do cliente.");
  const b = await readJson(req, 4_000);
  if (b.action === "testimonial") {
    // Só quem é cliente (proposta aceita) deixa depoimento pelo link; entra sem publicar
    if (p.status !== "aceita") throw httpError(403, "O depoimento fica disponível depois que a proposta é aceita.");
    const t = (v, max) => String(v ?? "").trim().slice(0, max) || null;
    const quote = t(b.quote, 1200), name = t(b.name, 120);
    if (!name || name.length < 2) throw httpError(400, "Informe seu nome.");
    if (!quote || quote.length < 20) throw httpError(400, "Escreva pelo menos uma frase (20 caracteres).");
    const rating = Number.isInteger(b.rating) && b.rating >= 1 && b.rating <= 5 ? b.rating : null;
    await query(
      `insert into testimonials (proposal_id, platform_id, name, role, company, quote, rating, consent)
       values ($1, $2, $3, $4, $5, $6, $7, $8)
       on conflict (proposal_id) where proposal_id is not null
       do update set name = excluded.name, role = excluded.role, company = excluded.company, quote = excluded.quote,
                     rating = excluded.rating, consent = excluded.consent, published = false`,
      [p.id, p.platform_id, name, t(b.role, 120), t(b.company, 120) || p.client_company, quote, rating, Boolean(b.consent)]);
    return send(res, 201, { ok: true });
  }
  if (["aceita", "recusada"].includes(p.status)) throw httpError(409, "Esta proposta já foi respondida.");
  if (new Date(p.valid_until) < new Date(new Date().toISOString().slice(0, 10))) throw httpError(410, "Esta proposta expirou. Fale com a gente para atualizá-la.");
  if (b.action === "accept") {
    const optional = new Set(p.items.filter((i) => i.kind === "module").map((i) => i.key));
    const chosen = [...new Set((Array.isArray(b.modules) ? b.modules : []).map(String))].filter((k) => optional.has(k));
    await query(`update proposals set status = 'aceita', decided_at = now(), accepted_keys = $2 where id = $1`, [p.id, chosen]);
    if (p.lead_id) await query(`update leads set status = 'ganho' where id = $1`, [p.lead_id]);
    return send(res, 200, { ok: true, status: "aceita" });
  }
  if (b.action === "decline") {
    const reason = String(b.reason || "").trim().slice(0, 1000);
    await query(`update proposals set status = 'recusada', decided_at = now(),
                   internal_notes = concat_ws(E'\n', internal_notes, $2::text) where id = $1`, [p.id, reason ? `Motivo da recusa: ${reason}` : null]);
    if (p.lead_id) await query(`update leads set status = 'perdido' where id = $1`, [p.lead_id]);
    return send(res, 200, { ok: true, status: "recusada" });
  }
  throw httpError(400, "Ação inválida.");
});
