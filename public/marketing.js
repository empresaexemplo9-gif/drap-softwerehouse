/* DRAP — Camada de marketing comum a todas as páginas públicas
   1) Atribuição: guarda de onde o visitante veio (UTM, gclid/fbclid, site de origem,
      página de entrada). Primeiro e último toque, por 90 dias, só neste navegador.
      Os formulários enviam isso junto do lead → o painel mostra qual canal gera cliente.
   2) Botão flutuante de WhatsApp com mensagem pronta citando a página atual.
   3) Indicação: links ?ref=<código> (ex.: parceiros, clientes) entram na atribuição. */
(() => {
  const KEY = "drap-attr", DAYS = 90;
  const now = Date.now();
  const params = new URLSearchParams(location.search);
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; } };
  const write = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch {} };

  const refHost = (() => {
    try { const h = new URL(document.referrer).host; return h && h !== location.host ? h.replace(/^www\./, "") : ""; } catch { return ""; }
  })();
  const touch = {
    source: params.get("utm_source") || (params.get("gclid") ? "google" : params.get("fbclid") ? "meta" : refHost || ""),
    medium: params.get("utm_medium") || (params.get("gclid") ? "cpc" : params.get("fbclid") ? "social" : refHost ? "referral" : ""),
    campaign: params.get("utm_campaign") || "",
    content: params.get("utm_content") || "",
    ref: params.get("ref") || "",
    landing: location.pathname,
    at: now,
  };
  const hasSignal = touch.source || touch.campaign || touch.ref;
  let data = read();
  if (!data || now - (data.first?.at || 0) > DAYS * 864e5) data = { first: { ...touch, source: touch.source || "direto" } };
  if (hasSignal) data.last = touch;
  data.pages = Math.min(999, (data.pages || 0) + 1);
  write(data);

  // Texto curto para o campo "origem" do lead (até 200 caracteres)
  const fmt = (t) => t ? [t.source || "direto", t.medium, t.campaign, t.ref && `ref:${t.ref}`].filter(Boolean).join(" / ") : "";
  window.DRAP_ATTR = () => {
    const d = read() || data;
    const first = fmt(d.first), last = fmt(d.last);
    return `${first}${last && last !== first ? ` → ${last}` : ""} · entrada ${d.first?.landing || "/"} · ${d.pages || 1} pág.`.slice(0, 200);
  };
  window.DRAP_ATTR_DATA = () => read() || data;

  /* ---------- WhatsApp flutuante ---------- */
  if (document.body.dataset.noWhatsapp != null) return;
  const draw = (number) => {
    const digits = String(number || "").replace(/\D/g, "");
    if (digits.length < 10 || /^0+$/.test(digits.slice(2))) return; // número de exemplo/ausente: não mostra
    const page = document.title.split("·")[0].split("—")[0].trim();
    const text = `Olá! Vim pelo site da DRAP (${page}) e quero conversar sobre um projeto.`;
    const a = document.createElement("a");
    a.className = "wa-fab";
    a.href = `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
    a.target = "_blank"; a.rel = "noopener";
    a.setAttribute("aria-label", "Conversar no WhatsApp");
    a.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.5 1 2.7.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg><span>Fale no WhatsApp</span>`;
    document.body.append(a);
  };
  // usa o número salvo no painel (Configurações → WhatsApp)
  fetch("/api/catalog").then((r) => (r.ok ? r.json() : null)).then((d) => draw(d?.settings?.contact_whatsapp)).catch(() => {});
})();
