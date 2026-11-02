// GET  /api/briefs                  → opções do questionário de plataforma sob medida (público)
// GET  /api/briefs?platform=<id>    → opções do questionário de uma plataforma do catálogo
// POST /api/briefs { platform_id }  → questionário de plataforma do catálogo: gera a proposta
//                                     no tema da plataforma (simples = enviada na hora)
// POST /api/briefs → recebe o questionário, calcula a proposta e, se for simples,
//                    publica e envia na hora; se não, deixa para análise da equipe.
import { query } from "../lib/db.js";
import { handler, send, readJson, httpError, clientIpHash } from "../lib/http.js";
import { publicCatalog, normalizeBrief, estimate, introFor, PROJECT_TYPES } from "../lib/pricing.js";
import { newToken, DEFAULT_TERMS, settings, deliverProposal, notifyTeam, proposalUrl } from "../lib/proposals.js";
import { mailConfigured } from "../lib/mail.js";
import { platformForm, platformEstimate, PLATFORM_TERMS } from "../lib/platform-plans.js";

async function activePlatform(id) {
  const { rows: [pl] } = await query("select * from platforms where id = $1 and active", [String(id || "").slice(0, 40)]);
  if (!pl) throw httpError(404, "Plataforma não encontrada.");
  return pl;
}

const str = (v, max) => {
  const s = String(v ?? "").trim();
  if (s.length > max) throw httpError(400, "Confira os dados preenchidos.");
  return s || null;
};

export default handler(["GET", "POST"], async (req, res) => {
  if (req.method === "GET") {
    const id = new URL(req.url, "http://x").searchParams.get("platform");
    const body = publicCatalog();
    if (id) body.platform = platformForm(await activePlatform(id));
    return send(res, 200, body, { "Cache-Control": "public, s-maxage=60" });
  }

  const b = await readJson(req, 24_000);
  if (b.website) return send(res, 201, { ok: true, status: "em_analise" }); // campo-isca anti-robô

  const c = b.contact || {};
  const client = { name: str(c.name, 120), email: str(c.email, 254)?.toLowerCase() ?? null, phone: str(c.phone, 40), company: str(c.company, 120) };
  if (!client.name || client.name.length < 2) throw httpError(400, "Informe seu nome.");
  if (!client.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(client.email)) throw httpError(400, "Informe um e-mail válido.");
  if (!b.consent) throw httpError(400, "Autorize o uso dos dados para receber a proposta.");
  const pl = b.platform_id ? await activePlatform(b.platform_id) : null;
  const brief = normalizeBrief(b.brief || {});
  if (pl) {
    // módulos válidos são os opcionais desta plataforma; prioridades = módulos já incluídos que importam mais
    const form = platformForm(pl);
    brief.modules = {};
    for (const [k, v] of Object.entries(b.brief?.modules || {})) if (form.optional[k] && (v === "agora" || v === "futuro")) brief.modules[k] = v;
    const names = new Set(form.included.map((m) => m.name));
    brief.priorities = (Array.isArray(b.brief?.priorities) ? b.brief.priorities : []).map(String).filter((n) => names.has(n)).slice(0, 20);
    brief.platform = pl.id;
    brief.features = []; brief.targets = [];
  }
  if (!pl && brief.description.length < 30) throw httpError(400, "Descreva a plataforma com pelo menos 30 caracteres.");
  brief.company_size = str(c.company_size, 40) || brief.company_size;

  // Confere o esquema antes de gravar qualquer coisa (se faltar coluna, o handler migra e repete sem duplicar o lead)
  await query("select platform_id, platform from proposals limit 0");

  // Limite anti-spam: 3 por e-mail e 10 por IP a cada hora
  const ip = clientIpHash(req);
  const { rows: [lim] } = await query(
    `select count(*) filter (where client_email = $1)::int as by_email, count(*) filter (where ip_hash = $2)::int as by_ip
       from proposals where created_at > now() - interval '1 hour' and (client_email = $1 or ip_hash = $2)`, [client.email, ip]);
  if (lim.by_email >= 3 || lim.by_ip >= 10) throw httpError(429, "Recebemos vários pedidos seguidos. Tente novamente mais tarde.");

  const est = pl ? platformEstimate(pl, brief, client.company || client.name) : estimate(brief);
  const s = await settings();
  const auto = est.complexity === "simples" && s.proposal_auto_send !== "nao";
  const title = pl ? pl.name : brief.project_name
    ? `Plataforma ${brief.project_name}`
    : `${PROJECT_TYPES[brief.type] === "Outro" ? "Plataforma sob medida" : PROJECT_TYPES[brief.type]}${client.company ? " · " + client.company : ""}`;

  const { rows: [lead] } = await query(
    `insert into leads (name, email, phone, company, platform_id, interest, message, source, ip_hash, status)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) returning id`,
    [client.name, client.email, client.phone, client.company, pl?.id || null, pl ? pl.id : "sob-medida",
     (brief.description || brief.notes || "").slice(0, 2000) || null, pl ? "questionario-plataforma" : "questionario", ip, auto ? "proposta" : "novo"]);

  const { rows: [p] } = await query(
    `insert into proposals (token, lead_id, status, complexity, score, reasons, auto, client_name, client_email, client_phone,
       client_company, brief, title, intro, items, weeks, payment_terms, ip_hash, platform_id, platform)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20) returning *`,
    [newToken(), lead.id, auto ? "enviada" : "em_analise", est.complexity, est.score, est.reasons, auto,
     client.name, client.email, client.phone, client.company, JSON.stringify(brief), title.slice(0, 140),
     (pl ? est.intro : introFor(brief, client.company)).slice(0, 4000), JSON.stringify(est.items), est.weeks,
     pl ? PLATFORM_TERMS : DEFAULT_TERMS, ip, pl?.id || null, pl ? JSON.stringify(est.platform) : null]);

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
