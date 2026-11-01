// POST /api/leads → registra um pedido de demonstração (público)
import { query } from "../lib/db.js";
import { handler, send, readJson, httpError, clientIpHash } from "../lib/http.js";

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
  await query(
    `insert into leads (name, email, phone, company, platform_id, interest, message, source, ip_hash)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [lead.name, lead.email, lead.phone, lead.company, lead.platform_id, lead.interest, lead.message, lead.source, ip]);
  send(res, 201, { ok: true });
});
