// Encaminha a mensagem do formulário "Falar com um especialista" para o e-mail da DRAP.
// O e-mail chega com "Responder" apontando para o e-mail do cliente (reply-to),
// então a equipe responde direto da caixa de entrada. O lead fica salvo no banco
// de qualquer forma (com o e-mail do cliente), mesmo se o envio falhar.
//
// Ordem de envio:
//  1) Resend (se RESEND_API_KEY e MAIL_FROM estiverem configurados);
//  2) FormSubmit (https://formsubmit.co), gratuito e sem chave. Na PRIMEIRA mensagem,
//     o FormSubmit manda um e-mail de ativação para o endereço da DRAP: é só clicar em
//     "Activate Form" uma vez. Desligue com CONTACT_FORWARD=off.
import { sendMail, mailConfigured } from "./mail.js";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export async function forwardContact(lead, { to, interest, site }) {
  if (!to || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) return { ok: false, via: null, detail: "sem e-mail de contato" };
  const subject = `[Site DRAP] ${lead.name}${lead.company ? " · " + lead.company : ""} quer falar com um especialista`;
  const fields = [
    ["Nome", lead.name], ["E-mail", lead.email], ["WhatsApp", lead.phone], ["Empresa", lead.company],
    ["Interesse", interest], ["Mensagem", lead.message], ["Origem", lead.source],
  ].filter(([, v]) => v);

  if (mailConfigured()) {
    const text = `${fields.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nResponda este e-mail para falar direto com o cliente.\nPainel: ${site}/admin`;
    const html = `<div style="font:15px/1.6 Helvetica,Arial,sans-serif;color:#121419">
      <p style="margin:0 0 12px"><b>Novo contato pelo site</b> (responda este e-mail para falar direto com o cliente)</p>
      <table cellpadding="6" style="border-collapse:collapse">${fields.map(([k, v]) => `<tr><td style="color:#7d828c;vertical-align:top">${k}</td><td style="white-space:pre-wrap">${esc(v)}</td></tr>`).join("")}</table>
      <p style="margin:16px 0 0;color:#7d828c;font-size:13px">Também está no painel: ${esc(site)}/admin</p></div>`;
    await sendMail({ to, subject, text, html, replyTo: lead.email });
    return { ok: true, via: "resend" };
  }

  if (String(process.env.CONTACT_FORWARD || "").toLowerCase() === "off") return { ok: false, via: null, detail: "encaminhamento desligado" };

  const body = Object.fromEntries([
    ...fields.map(([k, v]) => [k, v]),
    ["email", lead.email],           // o FormSubmit usa este campo como "responder para"
    ["_subject", subject],
    ["_template", "table"],
    ["_captcha", "false"],
  ]);
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8_000);
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
      method: "POST", signal: ctrl.signal,
      headers: { "Content-Type": "application/json", Accept: "application/json", Referer: site, Origin: site },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    const ok = res.ok && String(data.success) === "true";
    return { ok, via: "formsubmit", detail: ok ? null : String(data.message || `HTTP ${res.status}`).slice(0, 200) };
  } catch (e) {
    return { ok: false, via: "formsubmit", detail: e.name === "AbortError" ? "tempo esgotado" : e.message };
  } finally { clearTimeout(t); }
}
