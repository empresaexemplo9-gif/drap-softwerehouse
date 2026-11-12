/* DRAP — Agendamento de reunião (/agendar) e página da reunião do cliente (/agendar/<token>) */
(async () => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const icon = (n) => window.DRAP_ICON(n);

  /* ---------- tema e rodapé ---------- */
  const docRoot = document.documentElement, toggle = $("#theme-toggle"), meta = $('meta[name="theme-color"]');
  const syncT = () => { const dark = docRoot.getAttribute("data-theme") === "dark"; toggle?.setAttribute("aria-pressed", dark); meta?.setAttribute("content", dark ? "#06070a" : "#f5f3ee"); };
  toggle?.addEventListener("click", () => {
    const dark = docRoot.getAttribute("data-theme") !== "dark";
    docRoot.classList.add("theme-anim");
    dark ? docRoot.setAttribute("data-theme", "dark") : docRoot.removeAttribute("data-theme");
    try { localStorage.setItem("drap-theme", dark ? "dark" : "light"); } catch {}
    syncT(); setTimeout(() => docRoot.classList.remove("theme-anim"), 600);
  });
  syncT();
  const y = $("#year"); if (y) y.textContent = new Date().getFullYear();
  $$("[data-icon]").forEach((el) => (el.innerHTML = icon(el.dataset.icon)));

  const WEEK = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
  const fmtDay = (iso) => { const d = new Date(`${iso}T12:00:00-03:00`); return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", timeZone: "America/Sao_Paulo" }).replace(".", ""); };
  const params = new URLSearchParams(location.search);
  const manageToken = (location.pathname.match(/\/agendar\/([A-Za-z0-9_-]{24,64})/) || [])[1];

  // Arquivo .ics para "adicionar ao calendário"
  const icsLink = (m) => URL.createObjectURL(new Blob([m.ics], { type: "text/calendar;charset=utf-8" }));
  const statusLabel = { solicitada: "Aguardando confirmação da equipe", confirmada: "Confirmada", realizada: "Realizada", cancelada: "Cancelada" };

  function showMeeting(m, fresh) {
    $("#ag-shell").hidden = true;
    $("#ag-head").hidden = !fresh;
    const el = $("#ag-done");
    el.hidden = false;
    const canCancel = ["solicitada", "confirmada"].includes(m.status);
    el.innerHTML = `
      <span class="ag-done__ic">${icon(m.status === "cancelada" ? "clock" : "calendar")}</span>
      <p class="mono ag-done__k">${fresh ? "PEDIDO ENVIADO" : "SUA REUNIÃO COM A DRAP"}</p>
      <h2>${fresh ? `Pronto, ${esc(String(m.name).split(" ")[0])}! Seu horário está reservado.` : esc(m.when.charAt(0).toUpperCase() + m.when.slice(1))}</h2>
      <dl class="ag-done__dl">
        <div><dt>Quando</dt><dd>${esc(m.when)} · ${m.duration_min} min</dd></div>
        <div><dt>Onde</dt><dd>${m.meet_link ? `<a href="${esc(m.meet_link)}" target="_blank" rel="noopener">${esc(m.meet_link)}</a>` : esc(m.where)}</dd></div>
        ${m.topic ? `<div><dt>Assunto</dt><dd>${esc(m.topic)}</dd></div>` : ""}
        <div><dt>Status</dt><dd><span class="ag-status ag-status--${m.status}">${statusLabel[m.status]}</span></dd></div>
      </dl>
      ${fresh ? `<p class="ag-done__p">A equipe confirma em breve${m.emailed ? " e você já recebeu um e-mail com os detalhes" : ""}. Guarde o link desta reunião para ver a confirmação ou cancelar.</p>` : ""}
      <div class="ag-done__act">
        ${m.status !== "cancelada" ? `<a class="btn btn--primary" href="${icsLink(m)}" download="reuniao-drap.ics"><span class="btn__label">Adicionar ao calendário</span><span class="btn__icon" aria-hidden="true">＋</span></a>` : `<a class="btn btn--primary" href="/agendar"><span class="btn__label">Escolher outro horário</span><span class="btn__icon" aria-hidden="true">→</span></a>`}
        ${fresh ? `<button class="btn btn--ghost" type="button" id="ag-copy"><span class="btn__label">Copiar link da reunião</span></button>` : ""}
        ${canCancel ? `<button class="ag-cancel mono" type="button" id="ag-cancel">cancelar reunião</button>` : ""}
      </div>`;
    $("#ag-copy")?.addEventListener("click", async () => {
      const url = `${location.origin}/agendar/${m.token}`;
      try { await navigator.clipboard.writeText(url); $("#ag-copy .btn__label").textContent = "Link copiado"; } catch { prompt("Link da reunião:", url); }
    });
    $("#ag-cancel")?.addEventListener("click", async () => {
      if (!confirm("Cancelar esta reunião?")) return;
      const r = await fetch(`/api/meetings?token=${encodeURIComponent(m.token)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "cancel" }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) return alert(d.error || "Não foi possível cancelar agora.");
      showMeeting(d, false);
    });
    scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- página da reunião (link do cliente) ---------- */
  if (manageToken) {
    $("#ag-shell").hidden = true;
    try {
      const r = await fetch(`/api/meetings?token=${encodeURIComponent(manageToken)}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      document.title = "Sua reunião · DRAP SoftwareHouse & Business";
      showMeeting(d, false);
    } catch (e) {
      $("#ag-done").hidden = false;
      $("#ag-done").innerHTML = `<h2>Reunião não encontrada</h2><p class="ag-done__p">Confira o link ou escolha um novo horário.</p><a class="btn btn--primary" href="/agendar"><span class="btn__label">Agendar reunião</span></a>`;
    }
    return;
  }

  /* ---------- agenda ---------- */
  const proposalToken = params.get("proposta") || "";
  let data;
  try {
    const r = await fetch(`/api/meetings${proposalToken ? `?proposta=${encodeURIComponent(proposalToken)}` : ""}`);
    data = await r.json();
    if (!r.ok) throw new Error(data.error);
  } catch {
    $("#ag-shell").innerHTML = `<div class="ag-form"><h2>Agenda indisponível no momento</h2><p>Fale com a gente pelo WhatsApp ou pelo <a href="/#contato">formulário de contato</a>.</p></div>`;
    return;
  }
  const f = $("#ag-form");
  $("#ag-dur").textContent = `· reuniões de ${data.duration} min`;
  $("#ag-address").textContent = data.address ? `(${data.address})` : "";
  if (data.prefill) {
    for (const k of ["name", "email", "phone", "company", "topic"]) if (data.prefill[k] && f.elements[k]) f.elements[k].value = data.prefill[k];
    $("#ag-lead").textContent = "Reunião de negociação da sua proposta: escolha o formato e um horário livre. Já preenchemos seus dados.";
  }
  if (params.get("modo") === "presencial") f.elements.mode.value = "presencial";
  if (params.get("assunto") && !f.elements.topic.value) f.elements.topic.value = params.get("assunto").slice(0, 120);

  // formato
  const syncMode = () => {
    const pres = f.elements.mode.value === "presencial";
    $("#ag-place").hidden = !pres;
    $("#ag-addr-field").hidden = !(pres && f.elements.place.value === "cliente");
    summary();
  };
  f.addEventListener("change", (e) => { if (["mode", "place"].includes(e.target.name)) syncMode(); });

  // dias e horários
  let day = null, slot = null;
  const days = data.days || [];
  if (!days.length) { $("#ag-empty").hidden = false; }
  $("#ag-days").innerHTML = days.map((d, i) => `<button type="button" class="ag-day" role="tab" data-i="${i}" aria-selected="false">
      <small>${WEEK[d.weekday].slice(0, 3)}</small><b>${fmtDay(d.date)}</b><span class="mono">${d.slots.length} horários</span></button>`).join("");
  function pickDay(i) {
    day = days[i]; slot = null;
    $$(".ag-day").forEach((b) => b.setAttribute("aria-selected", Number(b.dataset.i) === i));
    $("#ag-times").innerHTML = day.slots.map((s, j) => `<button type="button" class="ag-time" data-j="${j}" aria-pressed="false">${s.time}</button>`).join("");
    summary();
  }
  $("#ag-days").addEventListener("click", (e) => { const b = e.target.closest(".ag-day"); if (b) pickDay(Number(b.dataset.i)); });
  $("#ag-times").addEventListener("click", (e) => {
    const b = e.target.closest(".ag-time"); if (!b) return;
    slot = day.slots[Number(b.dataset.j)];
    $$(".ag-time").forEach((x) => x.setAttribute("aria-pressed", x === b));
    summary();
  });
  if (days.length) pickDay(0);

  function summary() {
    const s = $("#ag-summary");
    if (!slot) { s.textContent = "Escolha um horário para continuar."; return; }
    const pres = f.elements.mode.value === "presencial";
    const where = pres ? (f.elements.place.value === "cliente" ? "presencial, na sua empresa" : "presencial, no escritório da DRAP") : "online, por videochamada";
    s.innerHTML = `<b>${WEEK[day.weekday]}, ${fmtDay(day.date)} às ${slot.time}</b> · ${where}`;
  }
  syncMode();

  const status = (t, err) => { const s = $("#ag-status"); s.textContent = t; s.className = "form__status mono" + (err ? " err" : ""); };
  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    const el = f.elements;
    if (!slot) return status("✕ Escolha um dia e um horário.", true);
    if (el.name.value.trim().length < 2) { el.name.focus(); return status("✕ Informe seu nome.", true); }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.email.value.trim())) { el.email.focus(); return status("✕ Informe um e-mail válido.", true); }
    if (el.phone.value.replace(/\D/g, "").length < 10) { el.phone.focus(); return status("✕ Informe um WhatsApp com DDD.", true); }
    if (el.mode.value === "presencial" && el.place.value === "cliente" && el.address.value.trim().length < 8) { el.address.focus(); return status("✕ Informe o endereço da sua empresa.", true); }
    const btn = $("#ag-send");
    btn.classList.add("is-loading"); btn.disabled = true; status("› reservando o horário…");
    try {
      const r = await fetch("/api/meetings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        name: el.name.value.trim(), email: el.email.value.trim(), phone: el.phone.value.trim(), company: el.company.value.trim(),
        mode: el.mode.value, place: el.place.value, address: el.address.value.trim(), starts_at: slot.starts_at,
        topic: el.topic.value.trim(), notes: el.notes.value.trim(), website: el.website.value,
        proposal_token: proposalToken || undefined, platform_id: params.get("plataforma") || data.prefill?.platform_id || undefined,
        source: window.DRAP_ATTR?.() || null,
      }) });
      const d = await r.json().catch(() => ({}));
      if (r.status === 409) {
        status("✕ " + (d.error || "Horário indisponível."), true);
        const fresh = await (await fetch(`/api/meetings${proposalToken ? `?proposta=${encodeURIComponent(proposalToken)}` : ""}`)).json();
        days.splice(0, days.length, ...(fresh.days || []));
        $("#ag-days").innerHTML = days.map((dd, i) => `<button type="button" class="ag-day" role="tab" data-i="${i}" aria-selected="false"><small>${WEEK[dd.weekday].slice(0, 3)}</small><b>${fmtDay(dd.date)}</b><span class="mono">${dd.slots.length} horários</span></button>`).join("");
        if (days.length) pickDay(0);
        return;
      }
      if (!r.ok) throw new Error(d.error || "Não foi possível agendar agora.");
      showMeeting(d, true);
    } catch (err) { status("✕ " + err.message, true); }
    finally { btn.classList.remove("is-loading"); btn.disabled = false; }
  });
})();
