// Envio de e-mail pela API HTTP do Resend (https://resend.com), sem dependências.
// Variáveis: RESEND_API_KEY e MAIL_FROM (ex.: "DRAP <propostas@drap.com.br>",
// com o domínio verificado no Resend). Sem elas, mailConfigured() é falso e o
// painel oferece o link para copiar ou abrir no seu próprio e-mail.

export const mailConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM);

export async function sendMail({ to, subject, html, text, replyTo }) {
  if (!mailConfigured()) throw Object.assign(new Error("Envio de e-mail não configurado (RESEND_API_KEY e MAIL_FROM)."), { status: 503 });
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 10_000);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST", signal: ctrl.signal,
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.MAIL_FROM, to: [].concat(to), subject, html, text, ...(replyTo ? { reply_to: replyTo } : {}) }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("mail: falha no envio", res.status, body.slice(0, 300));
      throw Object.assign(new Error("O provedor de e-mail recusou o envio. Confira RESEND_API_KEY e o domínio de MAIL_FROM."), { status: 502 });
    }
    return true;
  } finally { clearTimeout(t); }
}
