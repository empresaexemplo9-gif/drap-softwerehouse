/* DRAP — Questionário de plataforma sob medida (/sob-medida) → POST /api/briefs */
(async () => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const icon = (n) => window.DRAP_ICON(n);

  /* ---------- tema e rodapé ---------- */
  const docRoot = document.documentElement, toggle = $("#theme-toggle"), meta = $('meta[name="theme-color"]');
  const sync = () => { const dark = docRoot.getAttribute("data-theme") === "dark"; toggle.setAttribute("aria-pressed", dark); meta?.setAttribute("content", dark ? "#06070a" : "#f5f3ee"); };
  toggle.addEventListener("click", () => {
    const dark = docRoot.getAttribute("data-theme") !== "dark";
    docRoot.classList.add("theme-anim");
    dark ? docRoot.setAttribute("data-theme", "dark") : docRoot.removeAttribute("data-theme");
    try { localStorage.setItem("drap-theme", dark ? "dark" : "light"); } catch {}
    sync(); setTimeout(() => docRoot.classList.remove("theme-anim"), 600);
  });
  sync();
  $("#year").textContent = new Date().getFullYear();

  /* ---------- opções (da API; reserva local se ela estiver fora) ---------- */
  let C;
  try {
    const r = await fetch("/api/briefs");
    if (!r.ok) throw new Error();
    C = await r.json();
  } catch {
    $("#sm-form").innerHTML = `<div class="sm-offline"><h2>Questionário indisponível no momento</h2>
      <p>Não conseguimos carregar as opções agora. Tente de novo em alguns minutos ou fale com a gente pelo <a href="/#contato">formulário de contato</a>.</p></div>`;
    return;
  }

  const DRAFT = "drap-brief-draft";
  const state = { type: "gestao", current: null, goals: [], targets: [], users: "ate-10", features: [], modules: {}, deadline: "1-3" };

  const choice = (el, dict, multi) => {
    el.innerHTML = Object.entries(dict).map(([k, v]) =>
      `<button type="button" class="sm-chip" data-key="${esc(k)}" aria-pressed="false">${esc(v)}</button>`).join("");
    el.addEventListener("click", (e) => {
      const b = e.target.closest("[data-key]"); if (!b) return;
      const name = el.dataset.name, k = b.dataset.key;
      if (multi) state[name] = state[name].includes(k) ? state[name].filter((x) => x !== k) : [...state[name], k];
      else state[name] = state[name] === k ? (name === "current" ? null : k) : k;
      paint(); save();
    });
  };
  const cards = (el, dict) => {
    el.innerHTML = Object.entries(dict).map(([k, v]) => `
      <button type="button" class="sm-card" data-key="${esc(k)}" aria-pressed="false">
        <span class="sm-card__ic">${icon(v.icon)}</span>
        <span class="sm-card__tx"><b>${esc(v.name)}</b><small>${esc(v.description)}</small></span>
        <span class="sm-card__ck">${icon("check")}</span>
      </button>`).join("");
    el.addEventListener("click", (e) => {
      const b = e.target.closest("[data-key]"); if (!b) return;
      const name = el.dataset.name, k = b.dataset.key;
      state[name] = state[name].includes(k) ? state[name].filter((x) => x !== k) : [...state[name], k];
      paint(); save();
    });
  };

  $("#b-segment").innerHTML = `<option value="">Selecione</option>` + C.segments.map((s) => `<option>${esc(s)}</option>`).join("");
  choice($("#b-type"), C.types);
  choice($("#b-current"), C.current);
  choice($("#b-goals"), C.goals, true);
  choice($("#b-users"), C.users);
  choice($("#b-deadline"), C.deadlines);
  cards($("#b-targets"), C.targets);
  cards($("#b-features"), C.features);

  $("#b-modules").innerHTML = Object.entries(C.modules).map(([k, v]) => `
    <div class="sm-mod" data-key="${esc(k)}">
      <span class="sm-card__ic">${icon(v.icon)}</span>
      <span class="sm-card__tx"><b>${esc(v.name)}</b><small>${esc(v.description)}</small></span>
      <span class="sm-seg" role="radiogroup" aria-label="${esc(v.name)}">
        <button type="button" role="radio" data-v="">Não</button>
        <button type="button" role="radio" data-v="agora">Agora</button>
        <button type="button" role="radio" data-v="futuro">Depois</button>
      </span>
    </div>`).join("");
  $("#b-modules").addEventListener("click", (e) => {
    const b = e.target.closest("[data-v]"); if (!b) return;
    const k = b.closest("[data-key]").dataset.key;
    if (b.dataset.v) state.modules[k] = b.dataset.v; else delete state.modules[k];
    paint(); save();
  });

  function paint() {
    for (const el of $$("[data-name]")) {
      const v = state[el.dataset.name];
      for (const b of $$("[data-key]", el)) b.setAttribute("aria-pressed", Array.isArray(v) ? v.includes(b.dataset.key) : v === b.dataset.key);
    }
    for (const row of $$("#b-modules [data-key]")) {
      const v = state.modules[row.dataset.key] || "";
      row.dataset.state = v;
      for (const b of $$("[data-v]", row)) b.setAttribute("aria-checked", b.dataset.v === v);
    }
  }

  /* ---------- rascunho no navegador (retoma se a pessoa sair da página) ---------- */
  const form = $("#sm-form");
  const FIELDS = ["name", "email", "company", "phone", "segment", "company_size", "project_name", "description", "budget", "references", "notes"];
  function save() {
    try { localStorage.setItem(DRAFT, JSON.stringify({ state, fields: Object.fromEntries(FIELDS.map((f) => [f, form.elements[f].value])) })); } catch {}
  }
  try {
    const d = JSON.parse(localStorage.getItem(DRAFT) || "null");
    if (d) { Object.assign(state, d.state); for (const f of FIELDS) if (d.fields?.[f] != null) form.elements[f].value = d.fields[f]; }
  } catch {}
  form.addEventListener("input", save);
  const count = () => ($("#b-desc-count").textContent = form.elements.description.value.length);
  form.elements.description.addEventListener("input", count);
  count(); paint();

  /* ---------- etapas ---------- */
  const steps = $$(".sm-step");
  let at = 0;
  $("#sm-steps").innerHTML = steps.map((s, i) => `<li data-i="${i}"><span class="mono">${String(i + 1).padStart(2, "0")}</span>${esc(s.dataset.title)}</li>`).join("");
  const status = (t, err) => { const s = $("#sm-status"); s.textContent = t; s.className = "form__status mono" + (err ? " err" : ""); };

  function validate(i) {
    const f = form.elements;
    if (i === 0) {
      if (f.name.value.trim().length < 2) return [f.name, "Informe seu nome."];
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.value.trim())) return [f.email, "Informe um e-mail válido."];
    }
    if (i === 1 && f.description.value.trim().length < 30) return [f.description, "Descreva a ferramenta com pelo menos 30 caracteres."];
    if (i === 5 && !$("#b-consent").checked) return [$("#b-consent"), "Marque a autorização para receber a proposta."];
    return null;
  }
  function go(i) {
    at = Math.max(0, Math.min(steps.length - 1, i));
    steps.forEach((s, n) => (s.hidden = n !== at));
    $$("#sm-steps li").forEach((li, n) => { li.classList.toggle("is-on", n === at); li.classList.toggle("is-done", n < at); });
    $("#sm-bar").style.width = `${((at + 1) / steps.length) * 100}%`;
    $("#sm-prev").hidden = at === 0;
    $("#sm-next .btn__label").textContent = at === steps.length - 1 ? "Enviar e gerar proposta" : "Continuar";
    if (at === steps.length - 1) summary();
    status("");
    const top = $(".sm-shell").getBoundingClientRect().top + scrollY - 100;
    if (scrollY > top) scrollTo({ top, behavior: "smooth" });
  }
  $("#sm-steps").addEventListener("click", (e) => {
    const li = e.target.closest("[data-i]"); if (!li) return;
    const to = Number(li.dataset.i);
    for (let n = 0; n < to; n++) { const bad = validate(n); if (bad) { go(n); bad[0].focus(); return status("✕ " + bad[1], true); } }
    go(to);
  });
  $("#sm-prev").addEventListener("click", () => go(at - 1));

  function summary() {
    const mods = Object.entries(state.modules);
    const list = (keys, dict) => keys.map((k) => dict[k]?.name).filter(Boolean).join(", ") || "—";
    $("#sm-summary").innerHTML = `
      <h3 class="mono">Resumo do pedido</h3>
      <dl>
        <div><dt>Tipo</dt><dd>${esc(C.types[state.type])}</dd></div>
        <div><dt>Usuários</dt><dd>${esc(C.users[state.users])}</dd></div>
        <div><dt>Além da web</dt><dd>${esc(list(state.targets, C.targets))}</dd></div>
        <div><dt>Funcionalidades</dt><dd>${esc(list(state.features, C.features))}</dd></div>
        <div><dt>Módulos agora</dt><dd>${esc(list(mods.filter(([, v]) => v === "agora").map(([k]) => k), C.modules))}</dd></div>
        <div><dt>Módulos depois</dt><dd>${esc(list(mods.filter(([, v]) => v === "futuro").map(([k]) => k), C.modules))}</dd></div>
      </dl>`;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const bad = validate(at);
    if (bad) { bad[0].focus(); return status("✕ " + bad[1], true); }
    if (at < steps.length - 1) return go(at + 1);

    const f = form.elements, btn = $("#sm-next");
    const payload = {
      website: f.website.value,
      consent: $("#b-consent").checked,
      contact: { name: f.name.value.trim(), email: f.email.value.trim(), company: f.company.value.trim(), phone: f.phone.value.trim(), company_size: f.company_size.value },
      brief: { ...state, segment: f.segment.value, project_name: f.project_name.value.trim(), description: f.description.value.trim(),
        budget: f.budget.value, references: f.references.value.trim(), notes: f.notes.value.trim() },
    };
    btn.classList.add("is-loading"); btn.disabled = true; status("› analisando o seu projeto…");
    try {
      const res = await fetch("/api/briefs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Não foi possível enviar agora. Tente novamente.");
      try { localStorage.removeItem(DRAFT); } catch {}
      done(data, payload.contact);
    } catch (err) {
      status("✕ " + err.message, true);
    } finally { btn.classList.remove("is-loading"); btn.disabled = false; }
  });

  function done(r, contact) {
    form.hidden = true; $(".sm-steps").hidden = true;
    const first = esc(contact.name.split(" ")[0]);
    const el = $("#sm-done");
    el.innerHTML = r.url ? `
      <span class="sm-done__ic">${icon("rocket")}</span>
      <p class="mono sm-done__k">PROPOSTA ${esc(r.number || "")}</p>
      <h2>${first}, sua proposta está pronta.</h2>
      <p>Analisamos as respostas e o projeto se encaixa no nosso escopo padrão. A proposta já tem escopo, módulos opcionais, cronograma e investimento${r.emailed ? `, e uma cópia foi enviada para <b>${esc(contact.email)}</b>` : ""}.</p>
      <a class="btn btn--primary" href="${esc(r.url)}"><span class="btn__label">Abrir minha proposta</span><span class="btn__icon" aria-hidden="true">→</span></a>`
    : `
      <span class="sm-done__ic">${icon("clock")}</span>
      <p class="mono sm-done__k">PEDIDO ${esc(r.number || "RECEBIDO")}</p>
      <h2>Obrigado, ${first}. Recebemos o seu projeto.</h2>
      <p>Pelo tamanho e pelas integrações, a sua plataforma merece uma análise da nossa equipe técnica. Vamos revisar o escopo e enviar a proposta para <b>${esc(contact.email)}</b> em até 2 dias úteis.</p>
      <a class="btn btn--ghost" href="/"><span class="btn__label">Voltar ao site</span></a>`;
    el.hidden = false;
    scrollTo({ top: 0, behavior: "smooth" });
  }

  go(0);
})();
