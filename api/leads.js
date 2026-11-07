// POST /api/leads → registra um pedido de demonstração (público)
import { query } from "../lib/db.js";
import { handler, send, readJson, httpError, clientIpHash } from "../lib/http.js";
import { forwardContact } from "../lib/forward.js";
import { settings, siteUrl } from "../lib/proposals.js";

const str = (v, max) => {
  if (v == null) return null;
  const s = String(v).trim();
  if (!s) return null;
  if (s.length > max) throw httpError(400, "Confira os dados preenchidos.");
  return s;
};

export default handler(["POST"], async (req, res) => {
  const b = await readJson(req);
  if (b.website) return send(res, 201, { ok: true }); // campo-isca: robôs recebem "sucesso" e nada é gravado

  const lead = {
    name: str(b.name, 120), email: str(b.email, 254)?.toLowerCase() ?? null,
    phone: str(b.phone, 40), company: str(b.company, 120),
    platform_id: str(b.platform_id, 40), interest: str(b.interest, 80),
    message: str(b.message, 2000), source: str(b.source, 200),
  };
  if (!lead.name || lead.name.length < 2) throw httpError(400, "Informe seu nome.");
  if (!lead.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(lead.email)) throw httpError(400, "Informe um e-mail válido.");

  // Limite anti-spam: 5 por e-mail e 20 por IP a cada 10 minutos.
  const ip = clientIpHash(req);
  const { rows } = await query(
    `select count(*) filter (where email = $1)::int as by_email, count(*) filter (where ip_hash = $2)::int as by_ip
       from leads where created_at > now() - interval '10 minutes' and (email = $1 or ip_hash = $2)`, [lead.email, ip]);
  if (rows[0].by_email >= 5 || rows[0].by_ip >= 20) throw httpError(429, "Muitas solicitações. Tente novamente em alguns minutos.");

  if (lead.platform_id) {
    const p = await query("select 1 from platforms where id = $1 and active", [lead.platform_id]);
    if (!p.rowCount) { lead.interest = lead.interest || lead.platform_id; lead.platform_id = null; }
  }
  const { rows: [saved] } = await query(
    `insert into leads (name, email, phone, company, platform_id, interest, message, source, ip_hash)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9) returning id`,
    [lead.name, lead.email, lead.phone, lead.company, lead.platform_id, lead.interest, lead.message, lead.source, ip]);

  // Encaminha para o e-mail da DRAP (responder = e-mail do cliente). O lead já está salvo:
  // se o envio falhar, ele continua no painel para a equipe responder de lá.
  const s = await settings().catch(() => ({}));
  let interest = lead.interest;
  if (lead.platform_id) { const { rows: [pl] } = await query("select name from platforms where id = $1", [lead.platform_id]); interest = pl?.name || interest; }
  const fw = await forwardContact(lead, { to: process.env.MAIL_TEAM || s.contact_email, interest, site: siteUrl(req) })
    .catch((e) => ({ ok: false, via: null, detail: String(e.message || e).slice(0, 200) }));
  if (!fw.ok) console.error("contato: encaminhamento falhou", fw.via, fw.detail);
  await query("update leads set forwarded_via = $2, forwarded_at = $3, forward_error = $4 where id = $1",
    [saved.id, fw.via, fw.ok ? new Date() : null, fw.ok ? null : (fw.detail || null)]).catch(() => {});
  send(res, 201, { ok: true });
});
