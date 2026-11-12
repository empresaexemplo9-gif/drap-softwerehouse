// Regras compartilhadas das propostas: token, endereço público, versão para o
// cliente (sem dados internos), validação de itens editados e e-mails.
import { randomBytes } from "node:crypto";
import { totalsOf } from "./pricing.js";
import { query } from "./db.js";
import { sendMail } from "./mail.js";

export const newToken = () => randomBytes(24).toString("base64url");

export const DEFAULT_TERMS =
  "40% na assinatura do contrato, 30% na entrega da versão de homologação e 30% no go-live. " +
  "Mensalidade a partir do go-live, com hospedagem, monitoramento, backups, atualizações e suporte inclusos.";

export function siteUrl(req) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/+$/, "");
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || (/^(localhost|127\.)/.test(host) ? "http" : "https");
  return `${proto}://${host}`;
}
export const proposalUrl = (req, token) => `${siteUrl(req)}/proposta/${token}`;

export async function settings() {
  const { rows } = await query("select key, value from site_settings");
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

// Versão que o cliente vê: sem notas internas, pontuação, motivos ou IP
export function publicView(p, contact = {}) {
  return {
    number: p.number, status: p.status, title: p.title, intro: p.intro,
    client: { name: p.client_name, company: p.client_company },
    brief: {
      description: p.brief?.description || "", segment: p.brief?.segment || "", type: p.brief?.type || "",
      current: p.brief?.current || null, goals: p.brief?.goals || [], users: p.brief?.users || null,
    },
    items: (p.items || []).map(({ key, kind, name, description, icon, setup, monthly, selected, market }) =>
      ({ key, kind, name, description, icon, setup, monthly, selected, market: p.show_market ? market : undefined })),
    discount_pct: Number(p.discount_pct) || 0, weeks: p.weeks, payment_terms: p.payment_terms,
    show_market: p.show_market, valid_until: p.valid_until, created_at: p.created_at, sent_at: p.sent_at,
    accepted_keys: p.accepted_keys, decided_at: p.decided_at,
    platform: p.platform || null,
    contact,
  };
}

// Valida os itens editados no painel
export function cleanItems(list) {
  if (!Array.isArray(list) || list.length > 60) throw Object.assign(new Error("Itens inválidos."), { status: 400 });
  const money = (v) => Math.max(0, Math.min(10_000_000, Math.round(Number(v) || 0)));
  const s = (v, max) => String(v ?? "").trim().slice(0, max);
  const items = list.map((i, n) => ({
    key: s(i.key, 40).replace(/[^a-z0-9_-]/gi, "") || `item${n + 1}`,
    kind: i.kind === "module" ? "module" : "core",
    name: s(i.name, 120), description: s(i.description, 600),
    icon: s(i.icon, 20).replace(/[^a-z]/g, "") || "core",
    setup: money(i.setup), monthly: money(i.monthly),
    selected: i.kind === "module" ? Boolean(i.selected) : true,
    origin: s(i.origin, 20) || "equipe",
    market: i.market && typeof i.market === "object" ? { setup: money(i.market.setup), monthly: money(i.market.monthly) } : undefined,
  }));
  if (items.some((i) => i.name.length < 2)) throw Object.assign(new Error("Todo item precisa de um nome."), { status: 400 });
  if (!items.some((i) => i.kind === "core")) throw Object.assign(new Error("Inclua ao menos um item na plataforma base."), { status: 400 });
  return items;
}

// Cor de destaque da paleta: a mais saturada, sem ser a primária nem quase branca/preta
export function accentOf(palette = []) {
  const hsl = (h) => { const n = parseInt(h.slice(1), 16), r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; return { s: mx === mn ? 0 : (mx - mn) / (1 - Math.abs(2 * l - 1)), l }; };
  const c = palette.slice(1).filter((h) => /^#[0-9a-f]{6}$/i.test(h)).map((h) => ({ h, ...hsl(h) })).filter((x) => x.l > .12 && x.l < .88);
  return (c.sort((a, b) => b.s - a.s)[0] || { h: palette[0] || "#B48A4F" }).h;
}

const brl = (n) => "R$ " + Math.round(n).toLocaleString("pt-BR");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// E-mail da proposta para o cliente (HTML com tabelas: compatível com Gmail/Outlook)
export function proposalEmail(p, url, origin, message) {
  const t = totalsOf(p.items, p.discount_pct);
  const first = String(p.client_name).split(" ")[0];
  const valid = new Date(p.valid_until).toLocaleDateString("pt-BR", { timeZone: "UTC" });
  // Cores: as da plataforma do catálogo (quando houver) ou as oficiais da DRAP
  const primary = /^#[0-9a-f]{6}$/i.test(p.platform?.palette?.[0] || "") ? p.platform.palette[0] : "#024C5E";
  const accent = p.platform ? accentOf(p.platform.palette) : "#B48A4F";
  const accentText = p.platform ? primary : "#8A672F";
  const msg = message ? `<p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#3a4048;white-space:pre-line">${esc(message)}</p>` : "";
  const html = `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#F3EEE6;font-family:Helvetica,Arial,sans-serif;color:#121419">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3EEE6;padding:32px 12px"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FBF7F2;border-radius:14px;overflow:hidden;border:1px solid #E4DCCF">
  <tr><td style="background:${primary};padding:28px 36px">
    <img src="${origin}/assets/brand/drap-logo-light.png" width="158" height="40" alt="DRAP SoftwareHouse &amp; Business" style="display:block;border:0" />
  </td></tr>
  <tr><td style="height:4px;background:${accent};line-height:4px;font-size:0">&nbsp;</td></tr>
  <tr><td style="padding:36px">
    <p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${accentText}">Proposta ${esc(p.number)}${p.platform ? " · " + esc(p.platform.name) : ""}</p>
    <h1 style="margin:0 0 18px;font-family:Georgia,serif;font-weight:normal;font-size:28px;line-height:1.2;color:${primary}">${esc(p.title)}</h1>
    <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#3a4048">Olá, ${esc(first)}! Sua proposta da DRAP está pronta. Nela você encontra o escopo da plataforma, os módulos que podem ser adicionados, o cronograma e o investimento.</p>
    ${msg}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border:1px solid #E4DCCF;border-radius:10px;margin:8px 0 26px">
      <tr><td style="padding:18px 20px;border-bottom:1px solid #EFE8DD"><span style="font-size:12px;color:#7d828c">Investimento de implantação</span><br><b style="font-size:22px;color:${primary}">${brl(t.setup)}</b></td></tr>
      <tr><td style="padding:18px 20px"><span style="font-size:12px;color:#7d828c">Mensalidade (hospedagem, suporte e atualizações)</span><br><b style="font-size:18px;color:#121419">${brl(t.monthly)}/mês</b></td></tr>
    </table>
    <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:10px;background:${primary}">
      <a href="${url}" style="display:inline-block;padding:15px 28px;font-size:15px;font-weight:bold;color:#FBF7F2;text-decoration:none">Ver proposta completa →</a>
    </td></tr></table>
    <p style="margin:22px 0 0;font-size:13px;color:#7d828c">Válida até ${valid}. Na página da proposta você pode baixar o PDF e escolher os módulos adicionais.</p>
  </td></tr>
  <tr><td style="padding:22px 36px;background:#F3EEE6;font-size:12px;color:#7d828c;border-top:1px solid #E4DCCF">DRAP SoftwareHouse &amp; Business · Plataformas prontas, engenharia sob medida.</td></tr>
</table></td></tr></table></body></html>`;
  const text = `Olá, ${first}! Sua proposta da DRAP (${p.number}) está pronta.\n\n${message ? message + "\n\n" : ""}Implantação: ${brl(t.setup)}\nMensalidade: ${brl(t.monthly)}/mês\n\nVeja a proposta completa: ${url}\nVálida até ${valid}.`;
  return { subject: `Sua proposta DRAP · ${p.title}`, html, text };
}

// Envia a proposta ao cliente e marca como enviada
export async function deliverProposal(req, p, message) {
  const url = proposalUrl(req, p.token);
  const mail = proposalEmail(p, url, siteUrl(req), message);
  const s = await settings().catch(() => ({}));
  await sendMail({ to: p.client_email, ...mail, replyTo: s.contact_email && /@/.test(s.contact_email) ? s.contact_email : undefined });
  await query(`update proposals set sent_at = now(), status = case when status in ('em_analise', 'rascunho') then 'enviada' else status end where id = $1`, [p.id]);
  return url;
}

// Aviso interno para a equipe (para o e-mail de contato do site ou MAIL_TEAM)
export async function notifyTeam(req, p, s) {
  const to = process.env.MAIL_TEAM || s.contact_email;
  if (!to || !/@/.test(to)) return;
  const t = totalsOf(p.items, p.discount_pct);
  const label = { simples: "Simples (enviada automaticamente)", media: "Média (aguardando análise)", complexa: "Complexa (aguardando análise)" }[p.complexity];
  const text = `Novo questionário de plataforma sob medida\n\nCliente: ${p.client_name} <${p.client_email}>${p.client_company ? " · " + p.client_company : ""}\n` +
    `Complexidade: ${label} · pontuação ${p.score}\n${p.reasons.length ? "Motivos: " + p.reasons.join("; ") + "\n" : ""}` +
    `Estimativa: ${brl(t.setup)} + ${brl(t.monthly)}/mês\n\nAbrir no painel: ${siteUrl(req)}/admin\nProposta: ${proposalUrl(req, p.token)}`;
  await sendMail({ to, subject: `[DRAP] Questionário ${p.number} · ${p.client_company || p.client_name} · ${p.complexity}`, text, html: `<pre style="font:14px/1.6 Menlo,monospace">${esc(text)}</pre>` });
}
