// Configurações do site e conteúdo de marketing (uma função só, para caber no limite de funções da Vercel)
// GET /api/admin/settings                        → { chave: valor }
// PUT /api/admin/settings                        → { chave: valor, ... } (apenas chaves conhecidas)
// GET    /api/admin/settings?r=testimonials      → depoimentos (todos, inclusive não publicados)
// POST   /api/admin/settings?r=testimonials      → cria { name, role, company, quote, rating, platform_id, consent, published }
// PATCH  /api/admin/settings?r=testimonials&id=  → altera campos
// DELETE /api/admin/settings?r=testimonials&id=  → remove
// GET    /api/admin/settings?r=meetings          → reuniões (próximas e últimos 60 dias)
// PATCH  /api/admin/settings?r=meetings&id=      → { status, meet_link, starts_at, internal_notes } (confirma/cancela avisando o cliente)
import { query } from "../../lib/db.js";
import { handler, send, readJson, httpError } from "../../lib/http.js";
import { requireAdmin } from "../../lib/auth.js";
import { meetingConfig, mailMeeting } from "../../lib/meetings.js";
import { siteUrl } from "../../lib/proposals.js";
import { mailConfigured } from "../../lib/mail.js";

const KEYS = ["contact_email", "contact_whatsapp", "contact_hours", "proposal_auto_send",
  "meeting_days", "meeting_start", "meeting_end", "meeting_lunch", "meeting_duration", "meeting_notice_hours", "meeting_horizon_days", "meeting_address"];
const HHMM = "([01]\\d|2[0-3]):[0-5]\\d";
const VALID = {
  meeting_days: /^[0-6](,[0-6])*$/,
  meeting_start: new RegExp(`^${HHMM}$`),
  meeting_end: new RegExp(`^${HHMM}$`),
  meeting_lunch: new RegExp(`^(${HHMM}-${HHMM})?$`),
  meeting_duration: /^\d{2,3}$/,
  meeting_notice_hours: /^\d{1,3}$/,
  meeting_horizon_days: /^\d{1,2}$/,
};

async function meetings(req, res, id) {
  if (req.method === "GET") {
    const { rows } = await query(
      `select m.*, p.number as proposal_number, p.token as proposal_token, pl.name as platform_name
         from meetings m left join proposals p on p.id = m.proposal_id left join platforms pl on pl.id = m.platform_id
        where m.starts_at > now() - interval '60 days'
        order by (m.starts_at < now()), abs(extract(epoch from (m.starts_at - now()))) limit 300`);
    return send(res, 200, { meetings: rows, mail: mailConfigured() });
  }
  if (req.method !== "PATCH" || !/^[0-9a-f-]{36}$/i.test(id)) throw httpError(400, "Requisição inválida.");
  const b = await readJson(req, 4_000);
  const { rows: [cur] } = await query("select * from meetings where id = $1", [id]);
  if (!cur) throw httpError(404, "Reunião não encontrada.");
  const sets = [], vals = [];
  const add = (c, v) => { vals.push(v); sets.push(`${c} = $${vals.length}`); };
  if ("status" in b) {
    if (!["solicitada", "confirmada", "realizada", "cancelada"].includes(b.status)) throw httpError(400, "Status inválido.");
    add("status", b.status);
  }
  if ("meet_link" in b) {
    const v = String(b.meet_link || "").trim();
    if (v && !/^https:\/\/\S{6,290}$/.test(v)) throw httpError(400, "Link da videochamada inválido (use https://…).");
    add("meet_link", v || null);
  }
  if ("internal_notes" in b) add("internal_notes", String(b.internal_notes || "").trim().slice(0, 2000) || null);
  if ("starts_at" in b) {
    if (Number.isNaN(Date.parse(b.starts_at))) throw httpError(400, "Data inválida.");
    add("starts_at", new Date(b.starts_at).toISOString());
  }
  if (!sets.length) throw httpError(400, "Nada para alterar.");
  const nextStatus = b.status || cur.status, nextLink = "meet_link" in b ? b.meet_link : cur.meet_link;
  if (nextStatus === "confirmada" && cur.mode === "online" && !nextLink)
    throw httpError(400, "Para confirmar uma reunião online, informe o link da videochamada.");
  vals.push(id);
  let u;
  try { ({ rows: [u] } = await query(`update meetings set ${sets.join(", ")} where id = $${vals.length} returning *`, vals)); }
  catch (e) { if (e.code === "23505") throw httpError(409, "Já existe outra reunião nesse horário."); throw e; }
  // avisa o cliente quando confirma, remarca/troca o link de uma confirmada ou cancela
  const changedTime = new Date(cur.starts_at).getTime() !== new Date(u.starts_at).getTime();
  const kind = u.status === "cancelada" && cur.status !== "cancelada" ? "cancelada"
    : u.status === "confirmada" && (cur.status !== "confirmada" || changedTime || cur.meet_link !== u.meet_link) ? "confirmada" : null;
  let emailed = false;
  if (kind) {
    const cfg = await meetingConfig();
    const { rows } = await query("select value from site_settings where key = 'contact_email'");
    emailed = await mailMeeting(kind, u, cfg, siteUrl(req), process.env.MAIL_TEAM || rows[0]?.value).catch((e) => (console.error(e.message), false));
  }
  send(res, 200, { ...u, emailed });
}

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
  if (params.get("r") === "meetings") return meetings(req, res, params.get("id") || "");
  if (!["GET", "PUT"].includes(req.method)) throw httpError(405, "Método não permitido.");
  if (req.method === "PUT") {
    const b = await readJson(req, 4_000);
    for (const k of KEYS) if (k in b) {
      const v = String(b[k] ?? "").trim();
      if ((k !== "meeting_lunch" && !v) || v.length > 500) throw httpError(400, `Valor inválido para ${k}.`);
      if (VALID[k] && !VALID[k].test(v)) throw httpError(400, `Valor inválido para ${k}.`);
      if (k === "proposal_auto_send" && !["sim", "nao"].includes(v)) throw httpError(400, "Use sim ou nao.");
      await query(`insert into site_settings (key, value) values ($1, $2) on conflict (key) do update set value = excluded.value`, [k, v]);
    }
  }
  const { rows } = await query("select key, value from site_settings");
  send(res, 200, Object.fromEntries(rows.map((r) => [r.key, r.value])));
});
