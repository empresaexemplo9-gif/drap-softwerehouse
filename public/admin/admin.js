/* DRAP — Painel administrativo (API própria em /api/admin, sessão por cookie HttpOnly) */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));


  const show = (id) => ["view-login", "view-message", "view-app"].forEach((v) => ($("#" + v).hidden = v !== id));
  const message = (title, text, canLogout = false) => {
    $("#msg-title").textContent = title; $("#msg-text").textContent = text; $("#msg-logout").hidden = !canLogout; show("view-message");
  };
  let toastT;
  const toast = (txt) => { const t = $("#toast"); t.textContent = txt; t.classList.add("is-on"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("is-on"), 2200); };


  /* Chamada à API do painel. Sessão em cookie HttpOnly; 401 volta para o login. */
  async function call(method, path, body) {
    const res = await fetch(`/api/admin/${path}`, {
      method, credentials: "same-origin",
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => null);
    if (res.status === 401 && path !== "login") { show("view-login"); throw new Error(data?.error || "Sessão expirada."); }
    if (!res.ok) throw Object.assign(new Error(data?.error || `Erro ${res.status}`), { status: res.status });
    return data;
  }

  const STATUS = { novo: "Novo", em_contato: "Em contato", proposta: "Proposta", ganho: "Ganho", perdido: "Perdido" };
  const fmtDate = (iso) => new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
  const digits = (s) => String(s || "").replace(/\D/g, "");

  let leads = [], platforms = [];

  /* ---------------- autenticação ---------------- */
  async function boot() {
    let me;
    try { me = await call("GET", "session"); }
    catch (err) {
      if (err.status === 503) return message("Painel não configurado", err.message);
      return show("view-login");
    }
    $("#user-email").textContent = me.email;
    show("view-app");
    await loadPlatforms();
    await Promise.all([loadLeads(), loadSettings()]);
    document.dispatchEvent(new CustomEvent("drap:admin-ready"));
  }
  // Compartilhado com /admin/proposals.js
  window.DRAP_ADMIN = { call, toast, esc, fmtDate, reloadLeads: () => loadLeads() };

  $("#login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const st = $("#login-status");
    st.className = "form__status mono"; st.textContent = "› entrando…";
    try {
      await call("POST", "login", { email: $("#l-email").value.trim(), password: $("#l-pass").value });
      st.textContent = ""; $("#l-pass").value = "";
      boot();
    } catch (err) {
      st.className = "form__status mono err"; st.textContent = `✕ ${err.message}`;
    }
  });
  const logout = async () => { await call("POST", "logout").catch(() => {}); show("view-login"); };
  $("#logout").addEventListener("click", logout);
  $("#msg-logout").addEventListener("click", logout);

  /* ---------------- abas ---------------- */
  $(".adm-tabs").addEventListener("click", (e) => {
    const b = e.target.closest("[data-tab]"); if (!b) return;
    $$(".adm-tabs [data-tab]").forEach((x) => x.classList.toggle("is-active", x === b));
    $$("[data-panel]").forEach((p) => (p.hidden = p.dataset.panel !== b.dataset.tab));
  });

  /* ---------------- leads ---------------- */
  async function loadLeads() {
    try { leads = await call("GET", "leads"); renderLeads(); }
    catch (err) { toast("Erro ao carregar leads: " + err.message); }
  }
  const platformName = (id) => platforms.find((p) => p.id === id)?.name || id || "";

  function renderLeads() {
    const counts = Object.fromEntries(Object.keys(STATUS).map((k) => [k, leads.filter((l) => l.status === k).length]));
    $("#lead-kpis").innerHTML =
      `<div class="adm-kpi"><small class="mono">TOTAL</small><b>${leads.length}</b></div>` +
      Object.entries(STATUS).map(([k, label]) => `<div class="adm-kpi adm-kpi--${k}"><small class="mono">${label.toUpperCase()}</small><b>${counts[k]}</b></div>`).join("");
    $("#badge-new").textContent = counts.novo || "";

    const q = $("#lead-search").value.trim().toLowerCase();
    const f = $("#lead-filter").value;
    const rows = leads.filter((l) => (!f || l.status === f) && (!q || [l.name, l.email, l.company].some((x) => (x || "").toLowerCase().includes(q))));
    $("#lead-table").innerHTML = `
      <thead><tr><th>Recebido</th><th>Contato</th><th>Interesse</th><th>Mensagem</th><th>Status</th><th>Notas internas</th></tr></thead>
      <tbody>${rows.length ? rows.map((l) => `
        <tr data-id="${l.id}">
          <td class="mono adm-nowrap">${fmtDate(l.created_at)}</td>
          <td><b>${esc(l.name)}</b>${l.company ? `<small>${esc(l.company)}</small>` : ""}
            <a href="mailto:${esc(l.email)}">${esc(l.email)}</a>
            ${l.phone ? `<a href="https://wa.me/${digits(l.phone)}" target="_blank" rel="noopener">WhatsApp ${esc(l.phone)}</a>` : ""}
            <button type="button" class="adm-mini" data-new-proposal>+ Proposta</button></td>
          <td>${esc(platformName(l.platform_id) || l.interest || "—")}<small class="mono">${esc(l.source || "")}</small></td>
          <td class="adm-msg">${esc(l.message || "—")}</td>
          <td><select class="adm-status adm-status--${l.status}" data-field="status">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}"${k === l.status ? " selected" : ""}>${v}</option>`).join("")}</select></td>
          <td><textarea data-field="notes" rows="2" maxlength="4000" placeholder="Anotar…">${esc(l.notes || "")}</textarea></td>
        </tr>`).join("") : `<tr><td colspan="6" class="adm-empty">Nenhum lead ${q || f ? "com esse filtro" : "ainda"}.</td></tr>`}
      </tbody>`;
  }
  $("#lead-search").addEventListener("input", renderLeads);
  $("#lead-filter").addEventListener("change", renderLeads);
  $("#lead-refresh").addEventListener("click", () => loadLeads().then(() => toast("Leads atualizados")));

  async function updateLead(id, patch) {
    try { await call("PATCH", `leads?id=${encodeURIComponent(id)}`, patch); }
    catch (err) { return toast("Erro ao salvar: " + err.message); }
    Object.assign(leads.find((l) => l.id === id), patch);
    toast("Salvo");
  }
  $("#lead-table").addEventListener("change", (e) => {
    const el = e.target.closest("[data-field]"); if (!el) return;
    const id = el.closest("tr").dataset.id;
    updateLead(id, { [el.dataset.field]: el.value || null }).then(() => { if (el.dataset.field === "status") renderLeads(); });
  });

  $("#lead-export").addEventListener("click", () => {
    const cols = ["created_at", "name", "email", "phone", "company", "platform_id", "interest", "message", "source", "status", "notes"];
    const cell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = "﻿" + [cols.join(";"), ...leads.map((l) => cols.map((c) => cell(l[c])).join(";"))].join("\r\n");
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })), download: `leads-drap-${new Date().toISOString().slice(0, 10)}.csv` });
    a.click(); URL.revokeObjectURL(a.href);
  });

  /* ---------------- plataformas ---------------- */
  async function loadPlatforms() {
    try { platforms = await call("GET", "platforms"); renderPlatforms(); renderLeads(); }
    catch (err) { toast("Erro ao carregar plataformas: " + err.message); }
  }
  function renderPlatforms() {
    $("#platform-list").innerHTML = platforms.map((p) => `
      <details class="adm-card adm-pitem" data-id="${esc(p.id)}" style="--c:${esc(p.palette[0])}">
        <summary>
          <span class="adm-pdot"></span>
          <b>${esc(p.name)}</b><small class="mono">${esc(p.code)} · ${esc(p.category)}</small>
          <span class="adm-pill ${p.active ? "on" : ""}">${p.active ? "Publicada" : "Oculta"}</span>
          <span class="adm-pill">${esc(p.status)}</span>
        </summary>
        <form class="adm-pform">
          <label>Nome<input name="name" value="${esc(p.name)}" maxlength="80" required /></label>
          <label>Código<input name="code" value="${esc(p.code)}" maxlength="20" required /></label>
          <label>Categoria<input name="category" value="${esc(p.category)}" maxlength="60" required /></label>
          <label>Status<select name="status">${["Disponível", "Beta", "Sob demanda"].map((s) => `<option${s === p.status ? " selected" : ""}>${s}</option>`).join("")}</select></label>
          <label class="w2">Frase de posicionamento<input name="tagline" value="${esc(p.tagline)}" maxlength="160" /></label>
          <label class="w2">Resumo<textarea name="summary" rows="3" maxlength="600">${esc(p.summary)}</textarea></label>
          <label>Destaques (um por linha, até 6)<textarea name="features" rows="4">${esc(p.features.join("\n"))}</textarea></label>
          <label>Tecnologias (separadas por vírgula)<input name="stack" value="${esc(p.stack.join(", "))}" /></label>
          <label>Paleta (hex, separados por vírgula)<input name="palette" value="${esc(p.palette.join(", "))}" pattern="^\\s*#[0-9A-Fa-f]{6}(\\s*,\\s*#[0-9A-Fa-f]{6})*\\s*$" required /></label>
          <label>Link (URL ou #contato)<input name="url" value="${esc(p.url)}" maxlength="300" /></label>
          <label>Ordem<input name="sort_order" type="number" value="${p.sort_order}" step="10" /></label>
          <label class="adm-check"><input type="checkbox" name="active"${p.active ? " checked" : ""} /> Publicada no site</label>
          <div class="w2 adm-pactions"><button class="btn btn--primary btn--sm" type="submit"><span class="btn__label">Salvar alterações</span><span class="btn__icon" aria-hidden="true">✓</span></button></div>
        </form>
      </details>`).join("");
  }
  $("#platform-list").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target, id = form.closest("[data-id]").dataset.id, fd = new FormData(form);
    const list = (s, sep) => String(s || "").split(sep).map((x) => x.trim()).filter(Boolean);
    const patch = {
      name: fd.get("name").trim(), code: fd.get("code").trim(), category: fd.get("category").trim(), status: fd.get("status"),
      tagline: fd.get("tagline").trim(), summary: fd.get("summary").trim(),
      features: list(fd.get("features"), /\n/).slice(0, 6), stack: list(fd.get("stack"), ",").slice(0, 6),
      palette: list(fd.get("palette"), ",").map((h) => h.toUpperCase()), url: fd.get("url").trim() || "#contato",
      sort_order: Number(fd.get("sort_order")) || 100, active: fd.get("active") === "on",
    };
    try { await call("PATCH", `platforms?id=${encodeURIComponent(id)}`, patch); }
    catch (err) { return toast("Erro: " + err.message); }
    toast("Plataforma salva");
    loadPlatforms();
  });

  /* ---------------- configurações ---------------- */
  const SETTINGS = [
    ["contact_email", "E-mail de contato"],
    ["contact_whatsapp", "WhatsApp"],
    ["contact_hours", "Horário de atendimento"],
  ];
  const AUTO = "proposal_auto_send";
  async function loadSettings() {
    let map;
    try { map = await call("GET", "settings"); }
    catch (err) { return toast("Erro ao carregar configurações: " + err.message); }
    $("#settings-form").innerHTML = SETTINGS.map(([k, label]) => `
      <div class="field"><label class="mono" for="s-${k}">${label}</label><input id="s-${k}" name="${k}" value="${esc(map[k] || "")}" maxlength="500" /></div>`).join("") +
      `<label class="adm-check adm-check--block"><input type="checkbox" name="${AUTO}"${map[AUTO] !== "nao" ? " checked" : ""} />
        <span><b>Enviar propostas simples automaticamente</b><small>Questionários classificados como simples recebem a proposta na hora. Médios e complexos sempre aguardam a análise da equipe.</small></span></label>` +
      `<button class="btn btn--primary btn--sm" type="submit"><span class="btn__label">Salvar</span><span class="btn__icon" aria-hidden="true">✓</span></button>`;
  }
  $("#settings-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(SETTINGS.map(([k]) => [k, e.target.elements[k].value.trim()]).filter(([, v]) => v));
    body[AUTO] = e.target.elements[AUTO].checked ? "sim" : "nao";
    try { await call("PUT", "settings", body); toast("Configurações salvas"); }
    catch (err) { toast("Erro: " + err.message); }
  });

  boot();
})();
