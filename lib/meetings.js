// Agenda de reuniões: horários livres, validação, convite de calendário (.ics) e e-mails.
// Fuso: America/Sao_Paulo, que não tem horário de verão desde 2019 (UTC−03:00 fixo).
import { query } from "./db.js";
import { sendMail, mailConfigured } from "./mail.js";

export const TZ_OFFSET = "-03:00";
const pad = (n) => String(n).padStart(2, "0");
const toMin = (hhmm) => { const [h, m] = String(hhmm || "").split(":").map(Number); return Number.isFinite(h) ? h * 60 + (m || 0) : null; };
const fromMin = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;

export async function meetingConfig() {
  const { rows } = await query("select key, value from site_settings where key like 'meeting_%'");
  const s = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const lunch = String(s.meeting_lunch || "").split("-").map(toMin);
  return {
    days: String(s.meeting_days ?? "1,2,3,4,5").split(",").map(Number).filter((d) => d >= 0 && d <= 6),
    start: toMin(s.meeting_start) ?? 9 * 60,
    end: toMin(s.meeting_end) ?? 18 * 60,
    lunch: lunch.length === 2 && lunch.every((x) => x != null) ? lunch : null,
    duration: Math.max(15, Math.min(240, parseInt(s.meeting_duration, 10) || 45)),
    notice: Math.max(0, parseInt(s.meeting_notice_hours, 10) || 24),
    horizon: Math.max(1, Math.min(90, parseInt(s.meeting_horizon_days, 10) || 21)),
    address: s.meeting_address || "",
  };
}

// Data local (São Paulo) de um instante: "AAAA-MM-DD"
const spDate = (ms) => new Date(ms - 3 * 3600e3).toISOString().slice(0, 10);

// Horários livres, agrupados por dia
export async function freeSlots(cfg) {
  const now = Date.now();
  const { rows } = await query(
    `select starts_at, duration_min from meetings where status in ('solicitada', 'confirmada')
       and starts_at > now() - interval '1 day' and starts_at < now() + make_interval(days => $1)`, [cfg.horizon + 1]);
  const busy = rows.map((r) => [new Date(r.starts_at).getTime(), new Date(r.starts_at).getTime() + r.duration_min * 60e3]);
  const days = [];
  for (let d = 0; d <= cfg.horizon; d++) {
    const date = spDate(now + d * 864e5);
    const weekday = new Date(`${date}T12:00:00${TZ_OFFSET}`).getUTCDay();
    if (!cfg.days.includes(weekday)) continue;
    const slots = [];
    for (let m = cfg.start; m + cfg.duration <= cfg.end; m += cfg.duration) {
      // horário que encosta no intervalo: pula para o fim do intervalo e recomeça a grade dali
      if (cfg.lunch && m < cfg.lunch[1] && m + cfg.duration > cfg.lunch[0]) { m = cfg.lunch[1] - cfg.duration; continue; }
      const startMs = Date.parse(`${date}T${fromMin(m)}:00${TZ_OFFSET}`);
      if (startMs < now + cfg.notice * 3600e3) continue;
      const endMs = startMs + cfg.duration * 60e3;
      if (busy.some(([a, b]) => startMs < b && endMs > a)) continue;
      slots.push({ time: fromMin(m), starts_at: new Date(startMs).toISOString() });
    }
    if (slots.length) days.push({ date, weekday, slots });
  }
  return days;
}

// Confere se um horário pedido é um horário livre válido da agenda
export async function isFreeSlot(cfg, startsAtIso) {
  const days = await freeSlots(cfg);
  return days.some((d) => d.slots.some((s) => s.starts_at === startsAtIso));
}

export const fmtWhen = (iso) => new Date(iso).toLocaleString("pt-BR", {
  timeZone: "America/Sao_Paulo", weekday: "long", day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit",
});

export function whereText(m, cfg) {
  if (m.mode === "online") return m.meet_link ? `Online: ${m.meet_link}` : "Online (o link da videochamada chega na confirmação)";
  return m.place === "cliente" ? `Presencial na sua empresa: ${m.address || "endereço informado"}` : `Presencial: ${cfg?.address || "escritório DRAP"}`;
}

// Convite de calendário (RFC 5545)
export function ics(m, cfg, siteUrl) {
  const stamp = (d) => new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const end = new Date(new Date(m.starts_at).getTime() + m.duration_min * 60e3);
  const esc = (s) => String(s || "").replace(/\\/g, "\\\\").replace(/[,;]/g, (c) => "\\" + c).replace(/\n/g, "\\n");
  const where = m.mode === "online" ? (m.meet_link || "Online") : m.place === "cliente" ? m.address : cfg?.address;
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//DRAP SoftwareHouse//Reunioes//PT-BR", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "BEGIN:VEVENT", `UID:${m.id}@drap`, `DTSTAMP:${stamp(Date.now())}`, `DTSTART:${stamp(m.starts_at)}`, `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(`Reunião DRAP${m.topic ? " · " + m.topic : ""}`)}`,
    `DESCRIPTION:${esc(`Reunião ${m.mode === "online" ? "online" : "presencial"} com a DRAP SoftwareHouse & Business.\nStatus: ${m.status}.\nVer ou cancelar: ${siteUrl}/agendar/${m.token}`)}`,
    `LOCATION:${esc(where || "")}`, "END:VEVENT", "END:VCALENDAR", "",
  ].join("\r\n");
}

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// E-mails (só se o envio estiver configurado; falha de e-mail não derruba o agendamento)
export async function mailMeeting(kind, m, cfg, siteUrl, teamTo) {
  if (!mailConfigured()) return false;
  const when = fmtWhen(m.starts_at), where = whereText(m, cfg), manage = `${siteUrl}/agendar/${m.token}`;
  const first = String(m.name).split(" ")[0];
  const subject = {
    solicitada: `Recebemos seu pedido de reunião · ${when}`,
    confirmada: `Reunião confirmada · ${when}`,
    cancelada: `Reunião cancelada · ${when}`,
  }[kind];
  const lead = {
    solicitada: "Recebemos o seu pedido de reunião. A equipe da DRAP confirma em breve por e-mail ou WhatsApp.",
    confirmada: "Sua reunião com a DRAP está confirmada. Até lá!",
    cancelada: "Sua reunião foi cancelada. Se quiser, escolha outro horário quando for melhor para você.",
  }[kind];
  const html = `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#F3EEE6;font-family:Helvetica,Arial,sans-serif;color:#121419">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px"><tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#FBF7F2;border-radius:14px;border:1px solid #E4DCCF;overflow:hidden">
<tr><td style="background:#024C5E;padding:24px 32px"><img src="${siteUrl}/assets/brand/drap-logo-light.png" width="158" height="40" alt="DRAP" style="display:block;border:0"></td></tr>
<tr><td style="padding:32px">
<p style="margin:0 0 16px;font-size:15px;line-height:1.6">Olá, ${esc(first)}! ${esc(lead)}</p>
<table role="presentation" width="100%" style="background:#fff;border:1px solid #E4DCCF;border-radius:10px;margin:0 0 22px"><tr><td style="padding:16px 18px;font-size:14px;line-height:1.7">
<b style="color:#024C5E">${esc(when)}</b><br>${esc(where)}${m.topic ? `<br>Assunto: ${esc(m.topic)}` : ""}</td></tr></table>
<a href="${manage}" style="display:inline-block;padding:13px 22px;border-radius:10px;background:#024C5E;color:#FBF7F2;font-weight:bold;text-decoration:none">Ver ou cancelar a reunião</a>
</td></tr></table></td></tr></table></body></html>`;
  const text = `Olá, ${first}! ${lead}\n\n${when}\n${where}${m.topic ? `\nAssunto: ${m.topic}` : ""}\n\nVer ou cancelar: ${manage}`;
  await sendMail({ to: m.email, subject, html, text, replyTo: teamTo && /@/.test(teamTo) ? teamTo : undefined });
  if (kind === "solicitada" && teamTo && /@/.test(teamTo)) {
    const t = `Nova reunião solicitada\n\n${m.name} <${m.email}>${m.company ? " · " + m.company : ""}${m.phone ? " · " + m.phone : ""}\n${when} · ${m.mode}${m.mode === "presencial" ? ` (${m.place === "cliente" ? "na empresa do cliente: " + (m.address || "") : "no escritório"})` : ""}\n${m.topic ? "Assunto: " + m.topic + "\n" : ""}${m.notes ? "Observações: " + m.notes + "\n" : ""}\nConfirme em: ${siteUrl}/admin`;
    await sendMail({ to: teamTo, subject: `[DRAP] Reunião solicitada · ${m.company || m.name} · ${when}`, text: t, html: `<pre style="font:14px/1.6 Menlo,monospace">${esc(t)}</pre>` });
  }
  return true;
}
