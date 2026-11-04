/* DRAP — Painel: propostas das plataformas sob medida (lista, editor de valores, envio) */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const A = () => window.DRAP_ADMIN;
  const esc = (s) => A().esc(s);
  const brl = (n) => "R$ " + Math.round(Number(n) || 0).toLocaleString("pt-BR");
  const icon = (n) => window.DRAP_ICON(n);

  const STATUS = { em_analise: "Em análise", rascunho: "Rascunho", enviada: "Enviada", visualizada: "Visualizada", aceita: "Aceita", recusada: "Recusada" };
  const CPX = { simples: "Simples", media: "Média", complexa: "Complexa" };
  const BRIEF = {
    type: "Tipo", segment: "Segmento", company_size: "Tamanho", project_name: "Nome do projeto", description: "Descrição",
    current: "Como faz hoje", goals: "Objetivos", targets: "Além da web", users: "Usuários", features: "Funcionalidades",
    modules: "Módulos", deadline: "Prazo", budget: "Investimento previsto", references: "Referências", notes: "Observações",
  };

  let list = [], catalog = {}, labels = {}, mail = false, cur = null, dirty = false, loaded = false;

  const totals = (items, disc) => {
    const sel = items.filter((i) => i.kind === "core" || i.selected);
    const sum = (arr, f) => arr.reduce((a, i) => a + (Number(f(i)) || 0), 0);
    const gross = sum(sel, (i) => i.setup), discount = Math.round(gross * (Number(disc) || 0) / 100);
    return { core: sum(items.filter((i) => i.kind === "core"), (i) => i.setup), modules: sum(sel.filter((i) => i.kind === "module"), (i) => i.setup),
      gross, discount, setup: gross - discount, monthly: sum(sel, (i) => i.monthly),
      market: { setup: sum(sel, (i) => i.market?.setup), monthly: sum(sel, (i) => i.market?.monthly) } };
  };

  /* ---------------- lista ---------------- */
  async function load() {
    try {
      const r = await A().call("GET", "proposals");
      list = r.proposals; catalog = r.catalog; labels = r.labels || {}; mail = r.mail; loaded = true;
      renderList();
    } catch (err) { A().toast("Erro ao carregar propostas: " + err.message); }
  }

  function renderList() {
    const by = (s) => list.filter((p) => p.status === s).length;
    const won = list.filter((p) => p.status === "aceita").reduce((a, p) => a + totals(p.items, p.discount_pct).setup, 0);
    $("#badge-review").textContent = by("em_analise") || "";
    $("#pr-kpis").innerHTML = [
      ["TOTAL", list.length], ["EM ANÁLISE", by("em_analise"), "novo"], ["ENVIADAS", by("enviada") + by("visualizada")],
      ["VISUALIZADAS", by("visualizada")], ["ACEITAS", by("aceita"), "ganho"], ["VALOR ACEITO", brl(won), "ganho"],
    ].map(([k, v, c]) => `<div class="adm-kpi${c ? " adm-kpi--" + c : ""}"><small class="mono">${k}</small><b>${v}</b></div>`).join("");
    const note = $("#pr-mailnote");
    note.hidden = mail;
    note.innerHTML = "Envio por e-mail desativado: cadastre <code>RESEND_API_KEY</code> e <code>MAIL_FROM</code> na Vercel. Enquanto isso, use “Copiar link” ou “Abrir no meu e-mail”.";

    const q = $("#pr-search").value.trim().toLowerCase(), f = $("#pr-filter").value;
    const rows = list.filter((p) => (!f || p.status === f) && (!q || [p.client_name, p.client_company, p.client_email, p.number, p.title].some((x) => (x || "").toLowerCase().includes(q))));
    $("#pr-table").innerHTML = `
      <thead><tr><th>Proposta</th><th>Cliente</th><th>Complexidade</th><th>Investimento</th><th>Status</th><th>Acompanhamento</th><th></th></tr></thead>
      <tbody>${rows.length ? rows.map((p) => { const t = totals(p.items, p.discount_pct); return `
        <tr data-id="${p.id}" class="adm-row-link">
          <td><b class="mono">${esc(p.number)}</b><small>${A().fmtDate(p.created_at)}</small></td>
          <td><b>${esc(p.client_company || p.client_name)}</b><small>${esc(p.client_name)} · ${esc(p.client_email)}</small>
            ${p.platform_name ? `<span class="adm-plat" style="--c:${esc(p.platform_color)}"><i></i>${esc(p.platform_name)}</span>` : `<small>${esc(p.title)}</small>`}</td>
          <td><span class="adm-cpx adm-cpx--${p.complexity}">${CPX[p.complexity]}</span>${p.auto ? `<small>enviada automaticamente</small>` : `<small>pontuação ${p.score}</small>`}</td>
          <td class="adm-nowrap"><b>${brl(t.setup)}</b><small>${brl(t.monthly)}/mês</small></td>
          <td><span class="adm-pstat adm-pstat--${p.status}">${STATUS[p.status]}</span></td>
          <td><small>${p.sent_at ? "Enviada " + A().fmtDate(p.sent_at) : "Não enviada"}</small><small>${p.view_count ? `${p.view_count} visualização${p.view_count > 1 ? "ões" : ""}` : "Sem visualizações"}</small></td>
          <td><button class="btn btn--ghost btn--sm" data-open><span class="btn__label">Abrir</span></button></td>
        </tr>`; }).join("") : `<tr><td colspan="7" class="adm-empty">Nenhuma proposta ${q || f ? "com esse filtro" : "ainda. Elas chegam pelo questionário em /sob-medida"}.</td></tr>`}</tbody>`;
  }

  $("#pr-search").addEventListener("input", renderList);
  $("#pr-filter").addEventListener("change", renderList);
  $("#pr-refresh").addEventListener("click", () => load().then(() => A().toast("Propostas atualizadas")));
  $("#pr-table").addEventListener("click", (e) => { const tr = e.target.closest("tr[data-id]"); if (tr) open(tr.dataset.id); });
  document.addEventListener("drap:admin-ready", load);
  document.querySelector(".adm-tabs").addEventListener("click", (e) => {
    if (e.target.closest('[data-tab="proposals"]') && !loaded) load();
  });

  /* ---------------- nova proposta ---------------- */
  const dlg = $("#adm-dialog");
  async function newDialog(prefill = {}) {
    if (!loaded) await load();
    dlg.innerHTML = `<form class="adm-dlg" id="pr-new-form">
      <h3>Nova proposta</h3><p class="adm-muted">Começa como rascunho, para você revisar antes de enviar. Plataformas do catálogo usam a paleta e o tema do próprio produto.</p>
      <label>Plataforma<select name="platform_id"><option value="">Sob medida (núcleo + módulos sugeridos)</option>
        ${(A().platforms() || []).map((pl) => `<option value="${esc(pl.id)}"${pl.id === prefill.platform ? " selected" : ""}>${esc(pl.name)} · ${esc(pl.category)}</option>`).join("")}</select></label>
      <label data-users${prefill.platform ? "" : " hidden"}>Usuários<select name="users">${Object.entries(labels.users || {}).map(([k, v]) => `<option value="${k}"${k === "11-50" ? " selected" : ""}>${esc(v)}</option>`).join("")}</select></label>
      <label>Nome do cliente<input name="client_name" required maxlength="120" value="${esc(prefill.name)}" /></label>
      <label>E-mail<input name="client_email" type="email" required maxlength="254" value="${esc(prefill.email)}" /></label>
      <label>Empresa<input name="client_company" maxlength="120" value="${esc(prefill.company)}" /></label>
      <label>WhatsApp<input name="client_phone" maxlength="40" value="${esc(prefill.phone)}" /></label>
      <input type="hidden" name="lead_id" value="${esc(prefill.id)}" />
      <div class="adm-dlg__act"><button type="button" class="btn btn--ghost btn--sm" data-close><span class="btn__label">Cancelar</span></button>
        <button class="btn btn--primary btn--sm"><span class="btn__label">Criar rascunho</span><span class="btn__icon" aria-hidden="true">→</span></button></div></form>`;
    dlg.showModal();
    $("#pr-new-form [name=platform_id]").addEventListener("change", (e) => ($("#pr-new-form [data-users]").hidden = !e.target.value));
    $("#pr-new-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const body = Object.fromEntries(new FormData(e.target));
      if (!body.platform_id) { delete body.platform_id; delete body.users; }
      try { const p = await A().call("POST", "proposals", body); dlg.close(); list.unshift(p); renderList(); goTab(); open(p.id); }
      catch (err) { A().toast("Erro: " + err.message); }
    });
  }
  dlg.addEventListener("click", (e) => { if (e.target.closest("[data-close]") || e.target === dlg) dlg.close(); });
  $("#pr-new").addEventListener("click", () => newDialog());
  const goTab = () => $('.adm-tabs [data-tab="proposals"]').click();
  // "+ Proposta" na tabela de leads
  $("#lead-table").addEventListener("click", (e) => {
    const b = e.target.closest("[data-new-proposal]"); if (!b) return;
    const tr = b.closest("tr"), id = tr.dataset.id;
    const name = $("td:nth-child(2) b", tr)?.textContent || "", email = $("td:nth-child(2) a[href^=mailto]", tr)?.textContent || "";
    const company = $("td:nth-child(2) small", tr)?.textContent || "", phone = ($("td:nth-child(2) a[href*='wa.me']", tr)?.textContent || "").replace(/^WhatsApp\s*/, "");
    newDialog({ id, name, email, company, phone, platform: tr.dataset.platform });
  });
  // "Gerar proposta para cliente" na aba Plataformas
  $("#platform-list").addEventListener("click", async (e) => {
    const b = e.target.closest("[data-platform-proposal]"); if (!b) return;
    newDialog({ platform: b.dataset.platformProposal });
  });

  /* ---------------- editor ---------------- */
  async function open(id) {
    if (dirty && cur && cur.id !== id && !confirm("Há alterações não salvas. Descartar?")) return;
    try { cur = await A().call("GET", `proposals?id=${id}`); }
    catch (err) { return A().toast("Erro: " + err.message); }
    dirty = false;
    $("#pr-list-view").hidden = true; $("#pr-edit-view").hidden = false;
    renderEditor();
    scrollTo({ top: 0 });
  }
  function close() {
    if (dirty && !confirm("Há alterações não salvas. Descartar?")) return;
    dirty = false; cur = null;
    $("#pr-edit-view").hidden = true; $("#pr-list-view").hidden = false;
    load();
  }

  const itemRow = (i, n) => `
    <tr data-n="${n}" class="${i.kind === "module" ? "is-mod" : ""}">
      <td><span class="adm-pic">${icon(i.icon)}</span></td>
      <td><select data-f="kind"><option value="core"${i.kind === "core" ? " selected" : ""}>Base</option><option value="module"${i.kind === "module" ? " selected" : ""}>Módulo</option></select>
        ${i.origin === "sugestao" ? `<small class="adm-tag">sugerido</small>` : i.origin === "cliente" ? `<small class="adm-tag adm-tag--c">pedido</small>` : ""}</td>
      <td class="adm-item-tx"><input data-f="name" value="${esc(i.name)}" maxlength="120" /><textarea data-f="description" rows="2" maxlength="600">${esc(i.description)}</textarea></td>
      <td><input data-f="setup" type="number" min="0" step="100" value="${i.setup}" />${i.market?.setup ? `<small title="Média de mercado">mercado ${brl(i.market.setup)}</small>` : ""}</td>
      <td><input data-f="monthly" type="number" min="0" step="10" value="${i.monthly}" />${i.market?.monthly ? `<small>mercado ${brl(i.market.monthly)}</small>` : ""}</td>
      <td class="adm-center">${i.kind === "module" ? `<input type="checkbox" data-f="selected"${i.selected ? " checked" : ""} title="Incluído no total inicial" />` : `<span class="adm-muted-s">sempre</span>`}</td>
      <td><button type="button" class="adm-x" data-del title="Remover">×</button></td>
    </tr>`;

  function briefHtml(b) {
    if (cur?.platform) return `<p class="adm-muted">Proposta padrão do <b>${esc(cur.platform.name)}</b>, no tema da plataforma${b?.users ? `, dimensionada para ${esc(labels.users?.[b.users] || b.users).toLowerCase()}` : ""}. Os módulos incluídos vêm da página da plataforma; edite à vontade.</p>`;
    if (!b || !b.description) return `<p class="adm-muted">Proposta criada manualmente (sem questionário).</p>`;
    const val = (k, v) => {
      if (k === "modules") return Object.entries(v).map(([m, s]) => `${catalog[m]?.name || m} (${s})`).join(", ");
      if (k === "goals") return v.map((x) => labels.goals?.[x] || x).join(", ");
      if (Array.isArray(v)) return v.map((x) => catalog[x]?.name || x).join(", ");
      const dict = { type: labels.types, current: labels.current, users: labels.users, deadline: labels.deadlines }[k];
      if (dict) return dict[v] || v;
      return v;
    };
    return `<dl class="adm-brief">${Object.entries(BRIEF).filter(([k]) => b[k] && (!Array.isArray(b[k]) || b[k].length) && (typeof b[k] !== "object" || Object.keys(b[k]).length))
      .map(([k, label]) => `<div><dt>${label}</dt><dd>${esc(val(k, b[k]))}</dd></div>`).join("")}</dl>`;
  }

  function renderEditor() {
    const p = cur;
    $("#pr-edit-view").innerHTML = `
      <div class="adm-ed-top">
        <button class="btn btn--ghost btn--sm" id="ed-back"><span class="btn__label">← Propostas</span></button>
        <div><b class="mono">${esc(p.number)}</b> <span class="adm-cpx adm-cpx--${p.complexity}">${CPX[p.complexity]}</span>
          <span class="adm-pstat adm-pstat--${p.status}">${STATUS[p.status]}</span>${p.platform ? ` <span class="adm-plat" style="--c:${esc(p.platform.palette?.[0])}"><i></i>${esc(p.platform.name)} · tema da plataforma</span>` : ""}${p.auto ? ` <small class="adm-muted-s">gerada e enviada automaticamente</small>` : ""}</div>
      </div>
      <div class="adm-ed">
        <form class="adm-ed__main" id="ed-form">
          <section class="adm-card adm-ed__sec">
            <h3>Cliente</h3>
            <div class="adm-pform adm-pform--flat">
              <label>Nome<input name="client_name" value="${esc(p.client_name)}" maxlength="120" required /></label>
              <label>E-mail<input name="client_email" type="email" value="${esc(p.client_email)}" maxlength="254" required /></label>
              <label>Empresa<input name="client_company" value="${esc(p.client_company)}" maxlength="120" /></label>
              <label>WhatsApp<input name="client_phone" value="${esc(p.client_phone)}" maxlength="40" /></label>
            </div>
          </section>

          <section class="adm-card adm-ed__sec">
            <h3>Apresentação</h3>
            <div class="adm-pform adm-pform--flat">
              <label class="w2">Título da proposta<input name="title" value="${esc(p.title)}" maxlength="140" required /></label>
              <label class="w2">Texto de abertura (“O que entendemos”)<textarea name="intro" rows="4" maxlength="4000">${esc(p.intro)}</textarea></label>
            </div>
          </section>

          <section class="adm-card adm-ed__sec">
            <div class="adm-ed__h"><h3>Escopo, módulos e valores</h3>
              <div class="adm-ed__add">
                <select id="ed-add"><option value="">+ Adicionar do catálogo…</option>
                  <optgroup label="Plataforma base">${Object.entries(catalog).filter(([, c]) => c.kind === "core").map(([k, c]) => `<option value="${k}">${esc(c.name)} · ${brl(c.setup)}</option>`).join("")}</optgroup>
                  <optgroup label="Módulos adicionais">${Object.entries(catalog).filter(([k, c]) => c.kind === "module" && !p.platform?.covered?.[k]).map(([k, c]) => `<option value="${k}">${esc(c.name)} · ${brl(c.setup)}</option>`).join("")}</optgroup>
                  <option value="__custom">Item personalizado</option></select>
              </div></div>
            <p class="adm-muted">Itens “Base” formam a plataforma (sempre inclusos). “Módulos” aparecem com valor próprio e o cliente pode ativar ou desativar; marque os que entram no total inicial. Valores em reais.</p>
            <div class="adm-table-wrap"><table class="adm-table adm-items"><thead><tr><th></th><th>Tipo</th><th>Item e descrição</th><th>Implantação</th><th>Mensal</th><th>No total</th><th></th></tr></thead>
              <tbody id="ed-items">${p.items.map(itemRow).join("")}</tbody></table></div>
          </section>

          <section class="adm-card adm-ed__sec">
            <h3>Condições</h3>
            <div class="adm-pform adm-pform--flat adm-pform--3">
              <label>Desconto (%)<input name="discount_pct" type="number" min="0" max="60" step="0.5" value="${Number(p.discount_pct)}" /></label>
              <label>Prazo (semanas)<input name="weeks" type="number" min="1" max="104" value="${p.weeks}" /></label>
              <label>Válida até<input name="valid_until" type="date" value="${esc(String(p.valid_until).slice(0, 10))}" /></label>
              <label class="w2">Condições de pagamento<textarea name="payment_terms" rows="3" maxlength="1000">${esc(p.payment_terms)}</textarea></label>
              <label>Complexidade<select name="complexity">${Object.entries(CPX).map(([k, v]) => `<option value="${k}"${k === p.complexity ? " selected" : ""}>${v}</option>`).join("")}</select></label>
              <label class="adm-check"><input type="checkbox" name="show_market"${p.show_market ? " checked" : ""} /> Mostrar comparativo com o mercado</label>
            </div>
          </section>

          <section class="adm-card adm-ed__sec">
            <h3>Respostas do questionário</h3>${briefHtml(p.brief)}
            ${p.reasons?.length ? `<p class="adm-reasons"><b>Por que precisa de análise:</b> ${p.reasons.map(esc).join(" · ")}</p>` : ""}
          </section>

          <section class="adm-card adm-ed__sec">
            <h3>Notas internas</h3>
            <textarea name="internal_notes" rows="3" maxlength="4000" class="adm-full" placeholder="Visível apenas para a equipe">${esc(p.internal_notes)}</textarea>
          </section>
        </form>

        <aside class="adm-ed__side">
          <div class="adm-card adm-sum" id="ed-sum"></div>
          <div class="adm-card adm-actions">
            <label>Status<select id="ed-status">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}"${k === p.status ? " selected" : ""}>${v}</option>`).join("")}</select></label>
            <button class="btn btn--primary btn--block" id="ed-save"><span class="btn__label">Salvar alterações</span><span class="btn__icon" aria-hidden="true">✓</span></button>
            <button class="btn btn--primary btn--block adm-btn-gold" id="ed-send"><span class="btn__label">${p.sent_at ? "Reenviar" : "Enviar"} por e-mail</span><span class="btn__icon" aria-hidden="true">✉</span></button>
            <div class="adm-actions__row">
              <a class="btn btn--ghost btn--sm" href="${esc(p.url)}" target="_blank" rel="noopener"><span class="btn__label">Ver</span></a>
              <a class="btn btn--ghost btn--sm" href="${esc(p.url)}?print=1" target="_blank" rel="noopener"><span class="btn__label">PDF</span></a>
              <button class="btn btn--ghost btn--sm" id="ed-copy"><span class="btn__label">Link</span></button>
            </div>
            ${p.status === "aceita" ? `<button class="btn btn--ghost btn--sm btn--block" id="ed-testi" type="button"><span class="btn__label">Pedir depoimento ao cliente</span></button>` : ""}
            ${p.brief?.description || p.platform_id ? `<button class="btn btn--ghost btn--sm btn--block" id="ed-reprice"><span class="btn__label">Recalcular pela tabela de preços</span></button>` : ""}
            <p class="adm-muted-s">${p.sent_at ? `Enviada em ${A().fmtDate(p.sent_at)}.` : "Ainda não enviada."} ${p.view_count ? `Vista ${p.view_count}× (primeira em ${A().fmtDate(p.viewed_at)}).` : ""}
              ${p.decided_at ? `<br>Respondida em ${A().fmtDate(p.decided_at)}${p.accepted_keys?.length ? ` com: ${p.accepted_keys.map((k) => esc(p.items.find((i) => i.key === k)?.name || k)).join(", ")}` : ""}.` : ""}</p>
          </div>
        </aside>
      </div>`;
    summary();
  }

  function readItems() {
    return $$("#ed-items tr").map((tr) => {
      const base = cur.items[Number(tr.dataset.n)] || {};
      const v = (f) => $(`[data-f="${f}"]`, tr);
      return { ...base, kind: v("kind").value, name: v("name").value.trim(), description: v("description").value.trim(),
        setup: Number(v("setup").value) || 0, monthly: Number(v("monthly").value) || 0,
        selected: v("kind").value === "module" ? Boolean(v("selected")?.checked) : true };
    });
  }

  function summary() {
    const f = $("#ed-form");
    const items = readItems(), t = totals(items, f.elements.discount_pct.value);
    const save = t.market.setup ? Math.round(((t.market.setup - t.setup) / t.market.setup) * 100) : null;
    $("#ed-sum").innerHTML = `
      <small class="mono">INVESTIMENTO</small>
      <b class="adm-sum__big">${brl(t.setup)}</b>
      <span class="adm-sum__m">${brl(t.monthly)}/mês</span>
      <dl>
        <div><dt>Plataforma base</dt><dd>${brl(t.core)}</dd></div>
        <div><dt>Módulos no total</dt><dd>${brl(t.modules)}</dd></div>
        ${t.discount ? `<div><dt>Desconto</dt><dd>− ${brl(t.discount)}</dd></div>` : ""}
        <div><dt>Média de mercado</dt><dd>${t.market.setup ? brl(t.market.setup) : "—"}</dd></div>
        ${save != null ? `<div><dt>Posição</dt><dd class="${save >= 0 ? "ok" : "err"}">${save >= 0 ? save + "% abaixo" : -save + "% acima"}</dd></div>` : ""}
      </dl>
      ${cur.score ? `<p class="adm-muted-s">Pontuação de complexidade: <b>${cur.score}</b> (até 9 = simples).</p>` : ""}`;
  }

  async function save(extra = {}) {
    const f = $("#ed-form");
    if (!f.reportValidity()) throw new Error("Confira os campos destacados.");
    const fd = new FormData(f);
    const body = {
      client_name: fd.get("client_name"), client_email: fd.get("client_email"), client_company: fd.get("client_company"), client_phone: fd.get("client_phone"),
      title: fd.get("title"), intro: fd.get("intro"), payment_terms: fd.get("payment_terms"), internal_notes: fd.get("internal_notes"),
      discount_pct: Number(fd.get("discount_pct")) || 0, weeks: Number(fd.get("weeks")) || 8, valid_until: fd.get("valid_until"),
      complexity: fd.get("complexity"), show_market: fd.get("show_market") === "on", status: $("#ed-status").value,
      items: readItems(), ...extra,
    };
    cur = await A().call("PATCH", `proposals?id=${cur.id}`, body);
    dirty = false;
    return cur;
  }

  const view = $("#pr-edit-view");
  view.addEventListener("input", (e) => { if (e.target.closest("#ed-form")) { dirty = true; summary(); } });
  view.addEventListener("change", (e) => {
    if (e.target.id === "ed-status") dirty = true;
    if (e.target.matches('[data-f="kind"]')) { cur.items = readItems(); renderItems(); dirty = true; }
    if (e.target.id === "ed-add" && e.target.value) {
      const k = e.target.value;
      cur.items = readItems();
      const item = k === "__custom"
        ? { key: "custom" + Date.now().toString(36), kind: "module", name: "Novo item", description: "", icon: "plus", setup: 0, monthly: 0, selected: true, origin: "equipe" }
        : { ...catalog[k], key: cur.items.some((i) => i.key === k) ? k + "-" + Date.now().toString(36).slice(-3) : k, selected: catalog[k].kind === "module" ? true : true };
      cur.items.push(item); renderItems(); dirty = true; e.target.value = "";
      $("#ed-items tr:last-child [data-f=name]").focus();
    }
  });
  function renderItems() { $("#ed-items").innerHTML = cur.items.map(itemRow).join(""); summary(); }

  view.addEventListener("click", async (e) => {
    if (e.target.closest("#ed-back")) return close();
    if (e.target.closest("[data-del]")) { cur.items = readItems(); cur.items.splice(Number(e.target.closest("tr").dataset.n), 1); renderItems(); dirty = true; return; }
    if (e.target.closest("#ed-save")) {
      try { await save(); renderEditor(); A().toast("Proposta salva"); } catch (err) { A().toast("Erro: " + err.message); }
    }
    if (e.target.closest("#ed-copy")) {
      try { await navigator.clipboard.writeText(cur.url); A().toast("Link copiado"); } catch { prompt("Link da proposta:", cur.url); }
    }
    if (e.target.closest("#ed-reprice")) {
      if (!confirm("Substituir os itens e valores atuais pelo cálculo automático da tabela de preços?")) return;
      try { cur = await A().call("POST", `proposals?id=${cur.id}&action=reprice`); dirty = false; renderEditor(); A().toast("Valores recalculados"); }
      catch (err) { A().toast("Erro: " + err.message); }
    }
    if (e.target.closest("#ed-send")) sendDialog();
    if (e.target.closest("#ed-testi")) {
      const link = cur.url.replace("/proposta/", "/depoimento/");
      const first = String(cur.client_name).split(" ")[0];
      const msg = `Olá, ${first}! Que bom ter vocês com a DRAP. Se puder, conte em poucas linhas como está sendo a experiência: leva 1 minuto e ajuda muito outras empresas a nos conhecerem. ${link}`;
      try { await navigator.clipboard.writeText(msg); A().toast("Mensagem com o link copiada: cole no WhatsApp ou e-mail"); }
      catch { prompt("Copie a mensagem para o cliente:", msg); }
    }
  });

  function sendDialog() {
    const first = String($("#ed-form").elements.client_name.value).split(" ")[0];
    const email = $("#ed-form").elements.client_email.value;
    const subject = `Sua proposta DRAP · ${$("#ed-form").elements.title.value}`;
    const mailto = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Olá, ${first}!\n\nSua proposta da DRAP está pronta:\n${cur.url}\n\nNela você encontra escopo, módulos opcionais, cronograma e investimento, e pode baixar o PDF.\n\nFicamos à disposição.`)}`;
    dlg.innerHTML = `<form class="adm-dlg" id="send-form">
      <h3>Enviar proposta</h3>
      <p class="adm-muted">Para <b>${esc(email)}</b>. O e-mail leva a marca DRAP, o resumo do investimento e o link da proposta. As alterações não salvas serão salvas antes do envio, e o status passa para “Enviada”.</p>
      <label>Mensagem pessoal (opcional)<textarea name="message" rows="4" maxlength="1500" placeholder="Ex.: Conforme conversamos na reunião de ontem…"></textarea></label>
      ${mail ? "" : `<p class="adm-warn">O envio automático não está configurado (RESEND_API_KEY e MAIL_FROM). Use “Abrir no meu e-mail” para mandar o link pelo seu próprio e-mail.</p>`}
      <div class="adm-dlg__act">
        <button type="button" class="btn btn--ghost btn--sm" data-close><span class="btn__label">Cancelar</span></button>
        <a class="btn btn--ghost btn--sm" href="${esc(mailto)}" id="send-mailto"><span class="btn__label">Abrir no meu e-mail</span></a>
        ${mail ? `<button class="btn btn--primary btn--sm"><span class="btn__label">Enviar agora</span><span class="btn__icon" aria-hidden="true">✉</span></button>` : ""}
      </div></form>`;
    dlg.showModal();
    $("#send-mailto").addEventListener("click", async () => {
      try { await save(["em_analise", "rascunho"].includes($("#ed-status").value) ? { status: "enviada" } : {}); dlg.close(); renderEditor(); A().toast("Marcada como enviada"); }
      catch (err) { A().toast("Erro: " + err.message); }
    });
    $("#send-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = e.submitter; if (btn) btn.classList.add("is-loading");
      try {
        if (dirty) await save();
        cur = await A().call("POST", `proposals?id=${cur.id}&action=send`, { message: new FormData(e.target).get("message") });
        dlg.close(); renderEditor(); A().toast("Proposta enviada por e-mail"); A().reloadLeads();
      } catch (err) { A().toast("Erro: " + err.message); btn?.classList.remove("is-loading"); }
    });
  }

  addEventListener("beforeunload", (e) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } });
})();
