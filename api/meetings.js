// GET  /api/meetings[?proposta=<token>]  → agenda: horários livres (+ dados da proposta para pré-preencher)
// GET  /api/meetings?token=<token>       → reunião do cliente (ver status, link, local)
// POST /api/meetings                     → marca { name, email, phone, company, mode, place, address, starts_at, topic, notes, proposal_token, platform_id, source }
// POST /api/meetings?token=<token>       → { action: "cancel" } cancela a própria reunião
import { query } from "../lib/db.js";
import { handler, send, readJson, httpError, clientIpHash } from "../lib/http.js";
import { newToken, siteUrl, settings } from "../lib/proposals.js";
import { meetingConfig, freeSlots, isFreeSlot, ics, mailMeeting, fmtWhen, whereText } from "../lib/meetings.js";

const TOKEN = /^[A-Za-z0-9_-]{24,64}$/;
const str = (v, max) => { const s = String(v ?? "").trim(); if (s.length > max) throw httpError(400, "Confira os dados preenchidos."); return s || null; };
const view = (m, cfg, base) => ({
  token: m.token, name: m.name, company: m.company, mode: m.mode, place: m.place, address: m.address,
  starts_at: m.starts_at, duration_min: m.duration_min, topic: m.topic, status: m.status,
  meet_link: m.status === "confirmada" ? m.meet_link : null,
  when: fmtWhen(m.starts_at), where: whereText(m.status === "confirmada" ? m : { ...m, meet_link: null }, cfg),
  ics: ics(m, cfg, base),
});

export default handler(["GET", "POST"], async (req, res) => {
  const params = new URL(req.url, "http://x").searchParams;
  const token = params.get("token") || "";
  const cfg = await meetingConfig();
  const base = siteUrl(req);

  if (token) {
    if (!TOKEN.test(token)) throw httpError(404, "Reunião não encontrada.");
    const { rows: [m] } = await query("select * from meetings where token = $1", [token]);
    if (!m) throw httpError(404, "Reunião não encontrada.");
    if (req.method === "GET") return send(res, 200, view(m, cfg, base));
    const b = await readJson(req, 2_000);
    if (b.action !== "cancel") throw httpError(400, "Ação inválida.");
    if (!["solicitada", "confirmada"].includes(m.status)) throw httpError(409, "Esta reunião não pode mais ser cancelada.");
    const { rows: [u] } = await query("update meetings set status = 'cancelada' where id = $1 returning *", [m.id]);
    const s = await settings().catch(() => ({}));
    await mailMeeting("cancelada", u, cfg, base, process.env.MAIL_TEAM || s.contact_email).catch((e) => console.error(e.message));
    return send(res, 200, view(u, cfg, base));
  }

  if (req.method === "GET") {
    let prefill = null;
    const pt = params.get("proposta") || "";
    if (TOKEN.test(pt)) {
      const { rows: [p] } = await query("select client_name, client_email, client_phone, client_company, title, platform_id from proposals where token = $1", [pt]);
      if (p) prefill = { name: p.client_name, email: p.client_email, phone: p.client_phone, company: p.client_company, topic: `Negociação: ${p.title}`, platform_id: p.platform_id };
    }
    return send(res, 200, {
      duration: cfg.duration, address: cfg.address, notice_hours: cfg.notice, days: await freeSlots(cfg), prefill,
    });
  }

  // POST: marcar
  const b = await readJson(req, 8_000);
  if (b.website) return send(res, 201, { ok: true }); // campo-isca
  const m = {
    name: str(b.name, 120), email: str(b.email, 254)?.toLowerCase() ?? null, phone: str(b.phone, 40), company: str(b.company, 120),
    mode: b.mode === "presencial" ? "presencial" : "online", place: b.place === "cliente" ? "cliente" : "drap",
    address: str(b.address, 300), topic: str(b.topic, 120), notes: str(b.notes, 1500), source: str(b.source, 200),
  };
  if (!m.name || m.name.length < 2) throw httpError(400, "Informe seu nome.");
  if (!m.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m.email)) throw httpError(400, "Informe um e-mail válido.");
  if (!m.phone) throw httpError(400, "Informe um WhatsApp ou telefone para a confirmação.");
  if (m.mode === "online") { m.place = null; m.address = null; }
  if (m.mode === "presencial" && m.place === "cliente" && (!m.address || m.address.length < 8)) throw httpError(400, "Informe o endereço da sua empresa.");
  if (m.mode === "presencial" && m.place === "drap") m.address = null;

  if (!b.starts_at || Number.isNaN(Date.parse(b.starts_at))) throw httpError(400, "Escolha um horário.");
  const startsAt = new Date(b.starts_at).toISOString();
  if (!(await isFreeSlot(cfg, startsAt))) throw httpError(409, "Esse horário não está mais disponível. Escolha outro.");

  const ip = clientIpHash(req);
  const { rows: [lim] } = await query(
    `select count(*) filter (where email = $1)::int as by_email, count(*) filter (where ip_hash = $2)::int as by_ip
       from meetings where created_at > now() - interval '1 hour' and status <> 'cancelada' and (email = $1 or ip_hash = $2)`, [m.email, ip]);
  if (lim.by_email >= 3 || lim.by_ip >= 8) throw httpError(429, "Recebemos vários pedidos seguidos. Fale com a gente pelo WhatsApp.");

  // liga à proposta (fase de negociação) ou cria um lead novo
  let proposalId = null, leadId = null, platformId = /^[a-z0-9-]{2,40}$/.test(b.platform_id || "") ? b.platform_id : null;
  if (TOKEN.test(b.proposal_token || "")) {
    const { rows: [p] } = await query("select id, lead_id, platform_id from proposals where token = $1", [b.proposal_token]);
    if (p) { proposalId = p.id; leadId = p.lead_id; platformId = p.platform_id || platformId; }
  }
  if (platformId) {
    const { rowCount } = await query("select 1 from platforms where id = $1", [platformId]);
    if (!rowCount) platformId = null;
  }
  if (!leadId) {
    const { rows: [l] } = await query(
      `insert into leads (name, email, phone, company, platform_id, interest, message, source, ip_hash, status)
       values ($1, $2, $3, $4, $5, 'reuniao', $6, $7, $8, 'em_contato') returning id`,
      [m.name, m.email, m.phone, m.company, platformId, m.notes, `agendamento${m.source ? " · " + m.source : ""}`.slice(0, 200), ip]);
    leadId = l.id;
  } else {
    await query("update leads set status = 'em_contato' where id = $1 and status = 'novo'", [leadId]);
  }

  let row;
  try {
    ({ rows: [row] } = await query(
      `insert into meetings (token, proposal_id, lead_id, platform_id, name, email, phone, company, mode, place, address, starts_at, duration_min, topic, notes, source, ip_hash)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) returning *`,
      [newToken(), proposalId, leadId, platformId, m.name, m.email, m.phone, m.company, m.mode, m.place, m.address, startsAt, cfg.duration, m.topic, m.notes, m.source, ip]));
  } catch (e) {
    if (e.code === "23505") throw httpError(409, "Alguém acabou de reservar esse horário. Escolha outro.");
    throw e;
  }
  const s = await settings().catch(() => ({}));
  const emailed = await mailMeeting("solicitada", row, cfg, base, process.env.MAIL_TEAM || s.contact_email).catch((e) => (console.error(e.message), false));
  send(res, 201, { ...view(row, cfg, base), emailed });
});
