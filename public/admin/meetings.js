/* DRAP — Painel: reuniões de negociação (confirmar, link da videochamada, remarcar, cancelar) */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const A = () => window.DRAP_ADMIN;
  const esc = (s) => A().esc(s);
  const R = "settings?r=meetings";
  const LABEL = { solicitada: "Solicitada", confirmada: "Confirmada", realizada: "Realizada", cancelada: "Cancelada" };
  let list = [], mail = false, loaded = false, filter = "proximas";

  const when = (iso) => new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  // valor para <input type="datetime-local"> no horário de Brasília
  const localInput = (iso) => new Date(new Date(iso).getTime() - 3 * 3600e3).toISOString().slice(0, 16);
  const digits = (s) => String(s || "").replace(/\D/g, "");

  async function load() {
    try { const r = await A().call("GET", R); list = r.meetings; mail = r.mail; loaded = true; render(); }
    catch (err) { A().toast("Erro ao carregar reuniões: " + err.message); }
  }

  function render() {
    const now = Date.now();
    const pending = list.filter((m) => m.status === "solicitada" && new Date(m.starts_at) > now).length;
    $("#badge-meet").textContent = pending || "";
    const rows = list.filter((m) => filter === "todas" ? true
      : filter === "proximas" ? new Date(m.starts_at) > now - 3600e3 && ["solicitada", "confirmada"].includes(m.status)
      : m.status === filter);
    $("#mt-mailnote").hidden = mail;
    $("#mt-list").innerHTML = rows.length ? rows.map((m) => `
      <form class="adm-card adm-mitem adm-mitem--${m.status}" data-id="${m.id}">
        <div class="adm-mitem__when"><b>${when(m.starts_at)}</b><small>${m.duration_min} min</small>
          <span class="adm-pstat adm-pstat--${m.status === "solicitada" ? "em_analise" : m.status === "confirmada" ? "enviada" : m.status === "realizada" ? "aceita" : "recusada"}">${LABEL[m.status]}</span></div>
        <div class="adm-mitem__who">
          <b>${esc(m.name)}${m.company ? ` · ${esc(m.company)}` : ""}</b>
          <small><a href="mailto:${esc(m.email)}">${esc(m.email)}</a>${m.phone ? ` · <a href="https://wa.me/${digits(m.phone).length <= 11 ? "55" : ""}${digits(m.phone)}" target="_blank" rel="noopener">WhatsApp ${esc(m.phone)}</a>` : ""}</small>
          <small>${m.mode === "online" ? "Online" : m.place === "cliente" ? `Presencial na empresa do cliente: ${esc(m.address)}` : "Presencial no escritório da DRAP"}
            ${m.topic ? ` · ${esc(m.topic)}` : ""}${m.proposal_number ? ` · proposta <a href="/proposta/${esc(m.proposal_token)}" target="_blank" rel="noopener">${esc(m.proposal_number)}</a>` : ""}${m.platform_name ? ` · ${esc(m.platform_name)}` : ""}</small>
          ${m.notes ? `<p class="adm-mitem__notes">“${esc(m.notes)}”</p>` : ""}
        </div>
        <div class="adm-mitem__edit">
          ${m.mode === "online" ? `<label>Link da videochamada<input name="meet_link" value="${esc(m.meet_link)}" placeholder="https://meet.google.com/…" /></label>` : ""}
          <label>Data e hora (Brasília)<input name="starts_at" type="datetime-local" value="${localInput(m.starts_at)}" /></label>
          <label>Notas internas<textarea name="internal_notes" rows="2" maxlength="2000">${esc(m.internal_notes)}</textarea></label>
          <div class="adm-mitem__act">
            ${m.status === "solicitada" ? `<button class="btn btn--primary btn--sm" data-status="confirmada"><span class="btn__label">Confirmar${mail ? " e avisar" : ""}</span></button>` : ""}
            ${m.status === "confirmada" ? `<button class="btn btn--primary btn--sm" data-status="realizada"><span class="btn__label">Marcar realizada</span></button>` : ""}
            <button class="btn btn--ghost btn--sm" data-save><span class="btn__label">Salvar</span></button>
            ${["solicitada", "confirmada"].includes(m.status) ? `<button class="btn btn--ghost btn--sm" data-status="cancelada"><span class="btn__label">Cancelar</span></button>` : ""}
            <button class="pf-link mono" type="button" data-copy="${esc(m.token)}">copiar link do cliente</button>
          </div>
        </div>
      </form>`).join("") : `<div class="adm-card adm-empty">Nenhuma reunião ${filter === "proximas" ? "marcada nos próximos dias" : "com esse filtro"}.</div>`;
  }

  async function patch(form, extra) {
    const body = { internal_notes: form.internal_notes.value, ...extra };
    if (form.meet_link) body.meet_link = form.meet_link.value.trim();
    const cur = list.find((m) => m.id === form.dataset.id);
    if (form.starts_at.value && form.starts_at.value !== localInput(cur.starts_at)) body.starts_at = `${form.starts_at.value}:00-03:00`;
    try {
      const u = await A().call("PATCH", `${R}&id=${form.dataset.id}`, body);
      A().toast(u.emailed ? "Salvo e cliente avisado por e-mail" : "Salvo");
      load();
    } catch (err) { A().toast("Erro: " + err.message); }
  }

  $("#mt-list").addEventListener("submit", (e) => e.preventDefault());
  $("#mt-list").addEventListener("click", async (e) => {
    const form = e.target.closest("form"); if (!form) return;
    const st = e.target.closest("[data-status]");
    if (st) { e.preventDefault(); if (st.dataset.status === "cancelada" && !confirm("Cancelar esta reunião? O cliente é avisado por e-mail, se o envio estiver configurado.")) return; return patch(form, { status: st.dataset.status }); }
    if (e.target.closest("[data-save]")) { e.preventDefault(); return patch(form, {}); }
    const cp = e.target.closest("[data-copy]");
    if (cp) {
      const url = `${location.origin}/agendar/${cp.dataset.copy}`;
      try { await navigator.clipboard.writeText(url); A().toast("Link do cliente copiado"); } catch { prompt("Link do cliente:", url); }
    }
  });
  $("#mt-filter").addEventListener("change", (e) => { filter = e.target.value; render(); });
  $("#mt-refresh").addEventListener("click", () => load().then(() => A().toast("Reuniões atualizadas")));
  $("#mt-copy-link").addEventListener("click", async () => {
    const url = `${location.origin}/agendar`;
    try { await navigator.clipboard.writeText(url); A().toast("Link da agenda copiado"); } catch { prompt("Link da agenda:", url); }
  });

  document.addEventListener("drap:admin-ready", load);
  document.querySelector(".adm-tabs").addEventListener("click", (e) => {
    if (e.target.closest('[data-tab="meetings"]') && !loaded) load();
  });
})();
