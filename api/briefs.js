// GET  /api/briefs → opções do questionário de plataforma sob medida (público)
// POST /api/briefs → recebe o questionário, calcula a proposta e, se for simples,
//                    publica e envia na hora; se não, deixa para análise da equipe.
import { query } from "../lib/db.js";
import { handler, send, readJson, httpError, clientIpHash } from "../lib/http.js";
import { publicCatalog, normalizeBrief, estimate, introFor, PROJECT_TYPES } from "../lib/pricing.js";
import { newToken, DEFAULT_TERMS, settings, deliverProposal, notifyTeam, proposalUrl } from "../lib/proposals.js";
import { mailConfigured } from "../lib/mail.js";

const str = (v, max) => {
  const s = String(v ?? "").trim();
  if (s.length > max) throw httpError(400, "Confira os dados preenchidos.");
  return s || null;
};

export default handler(["GET", "POST"], async (req, res) => {
  if (req.method === "GET") return send(res, 200, publicCatalog(), { "Cache-Control": "public, s-maxage=300" });

  const b = await readJson(req, 24_000);
  if (b.website) return send(res, 201, { ok: true, status: "em_analise" }); // campo-isca anti-robô

  const c = b.contact || {};
  const client = { name: str(c.name, 120), email: str(c.email, 254)?.toLowerCase() ?? null, phone: str(c.phone, 40), company: str(c.company, 120) };
  if (!client.name || client.name.length < 2) throw httpError(400, "Informe seu nome.");
  if (!client.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(client.email)) throw httpError(400, "Informe um e-mail válido.");
  if (!b.consent) throw httpError(400, "Autorize o uso dos dados para receber a proposta.");
  const brief = normalizeBrief(b.brief || {});
  if (brief.description.length < 30) throw httpError(400, "Descreva a plataforma com pelo menos 30 caracteres.");
  brief.company_size = str(c.company_size, 40) || brief.company_size;

  // Limite anti-spam: 3 por e-mail e 10 por IP a cada hora
  const ip = clientIpHash(req);
  const { rows: [lim] } = await query(
    `select count(*) filter (where client_email = $1)::int as by_email, count(*) filter (where ip_hash = $2)::int as by_ip
       from proposals where created_at > now() - interval '1 hour' and (client_email = $1 or ip_hash = $2)`, [client.email, ip]);
  if (lim.by_email >= 3 || lim.by_ip >= 10) throw httpError(429, "Recebemos vários pedidos seguidos. Tente novamente mais tarde.");

  const est = estimate(brief);
  const s = await settings();
  const auto = est.complexity === "simples" && s.proposal_auto_send !== "nao";
  const title = brief.project_name
    ? `Plataforma ${brief.project_name}`
    : `${PROJECT_TYPES[brief.type] === "Outro" ? "Plataforma sob medida" : PROJECT_TYPES[brief.type]}${client.company ? " · " + client.company : ""}`;

  const { rows: [lead] } = await query(
    `insert into leads (name, email, phone, company, interest, message, source, ip_hash, status)
     values ($1, $2, $3, $4, 'sob-medida', $5, 'questionario', $6, $7) returning id`,
    [client.name, client.email, client.phone, client.company, brief.description.slice(0, 2000), ip, auto ? "proposta" : "novo"]);

  const { rows: [p] } = await query(
    `insert into proposals (token, lead_id, status, complexity, score, reasons, auto, client_name, client_email, client_phone,
       client_company, brief, title, intro, items, weeks, payment_terms, ip_hash)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) returning *`,
    [newToken(), lead.id, auto ? "enviada" : "em_analise", est.complexity, est.score, est.reasons, auto,
     client.name, client.email, client.phone, client.company, JSON.stringify(brief), title.slice(0, 140),
     introFor(brief, client.company), JSON.stringify(est.items), est.weeks, DEFAULT_TERMS, ip]);

  // E-mails não podem derrubar o pedido: a proposta já está gravada
  let emailed = false;
  if (mailConfigured()) {
    if (auto) emailed = await deliverProposal(req, p).then(() => true, (e) => (console.error(e.message), false));
    await notifyTeam(req, p, s).catch((e) => console.error(e.message));
  }
  if (auto && !emailed) await query("update proposals set sent_at = now() where id = $1", [p.id]);

  send(res, 201, {
    ok: true, number: p.number, status: p.status, complexity: p.complexity, emailed,
    url: auto ? proposalUrl(req, p.token) : null,
  });
});
