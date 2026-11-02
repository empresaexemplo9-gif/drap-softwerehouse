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
  // Modo plataforma: /plataformas/<id>/proposta (ou ?plataforma=<id>) usa os módulos e as cores do produto
  const PID = (location.pathname.match(/\/plataformas\/([a-z0-9-]{2,40})\/proposta/) || [])[1] || new URLSearchParams(location.search).get("plataforma") || "";
  let C;
  try {
    const r = await fetch(PID ? `/api/briefs?platform=${encodeURIComponent(PID)}` : "/api/briefs");
    if (!r.ok) throw new Error();
    C = await r.json();
    if (PID && !C.platform) throw new Error();
  } catch {
    $("#sm-form").innerHTML = `<div class="sm-offline"><h2>Questionário indisponível no momento</h2>
      <p>Não conseguimos carregar as opções agora. Tente de novo em alguns minutos ou fale com a gente pelo <a href="/#contato">formulário de contato</a>.</p></div>`;
    return;
  }

  const PF = C.platform || null;
  const DRAFT = PF ? `drap-brief-${PF.id}` : "drap-brief-draft";
  const state = { type: "gestao", current: null, goals: [], targets: [], users: PF ? "11-50" : "ate-10", features: [], priorities: [], modules: {}, deadline: "1-3" };

  if (PF) {
    // tema da plataforma (paleta oficial dela) mantendo a marca DRAP no topo e no rodapé
    const rgb = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
    const lum = (h) => { const [r, g, b] = rgb(h); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };
    const soft = (h) => { let c = rgb(h); while ((0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255 < 0.62) c = c.map((v) => v + (255 - v) * 0.18); return `rgb(${c.map(Math.round).join(",")})`; };
    const pal = PF.palette.filter((h) => /^#[0-9a-f]{6}$/i.test(h));
    const primary = pal[0], second = pal.slice(1).find((h) => lum(h) > 0.15 && lum(h) < 0.85) || primary;
    const b = document.body;
    b.classList.add("is-platform");
    b.style.setProperty("--pf", lum(primary) > 0.55 ? "#121419" : primary);
    b.style.setProperty("--pf-soft", soft(primary));
    b.style.setProperty("--pf-2", second);
    document.title = `Proposta ${PF.name} · DRAP SoftwareHouse & Business`;
    $('meta[name="description"]')?.setAttribute("content", `Responda algumas perguntas e receba a proposta do ${PF.name} com módulos, prazo e investimento.`);
    $("#sm-head").innerHTML = `
      <div class="section__index mono"><span>${esc(PF.name.replace(/^DRAP\s*/i, "").slice(0, 3).toUpperCase())}</span> / Proposta da plataforma</div>
      <div class="sm-plat"><span class="sm-plat__logo">${PF.logo_svg || ""}</span><span><small class="mono">${esc(PF.category)}</small><b>${esc(PF.name)}</b></span></div>
      <h1 class="section__title">Receba a proposta do ${esc(PF.name.replace(/^DRAP\s*/i, "DRAP "))} <span class="serif">para a sua empresa.</span></h1>
      <p class="section__lead">${esc(PF.headline)} Responda algumas perguntas (cerca de 3 minutos) e receba a proposta com implantação, licença, módulos adicionais e cronograma.
        Na maioria dos casos ela sai na hora; operações maiores passam pela análise da nossa equipe.</p>
      <a class="sm-back mono" href="/plataformas/${esc(PF.id)}">← conhecer o ${esc(PF.name)}</a>`;
    $$("[data-custom-only]").forEach((el) => (el.hidden = true));
    $('.nav__links [aria-current]')?.classList.remove("is-active");
    $('[data-step="1"]').dataset.title = "Sua operação";
    $('[data-step="1"] legend').innerHTML = `<span class="mono">02</span>Sua operação hoje`;
    $("#b-desc-label").textContent = "como funciona a sua operação hoje? (opcional)";
    $("#b-desc").removeAttribute("required");
    $("#b-desc").placeholder = `Ex.: quantas pessoas trabalham, o que vocês usam hoje e o que mais atrapalha. Isso ajuda a ajustar a proposta do ${PF.name}.`;
    $("#b-desc-min").textContent = " · opcional";
    $('[data-step="2"]').dataset.title = "Equipe";
    $('[data-step="2"] legend').innerHTML = `<span class="mono">03</span>Quem vai usar`;
    $('[data-step="3"]').dataset.title = "O que já vem";
    $('[data-step="3"] legend').innerHTML = `<span class="mono">04</span>O que já vem no ${esc(PF.name)}`;
    $("#b-features-q").innerHTML = `Tudo isto já está incluso. Marque o que é <b>prioridade</b> para você: usamos isso para organizar a implantação e o treinamento.`;
    $("#b-features").dataset.name = "priorities";
    $('[data-step="4"]').dataset.title = "Módulos extras";
    $('[data-step="4"] legend').innerHTML = `<span class="mono">05</span>Módulos e integrações extras`;
    $("#b-modules-q").innerHTML = `Além do que já vem no ${esc(PF.name)}, estes módulos podem ser adicionados. Indique o que precisa <b>agora</b> e o que pode ficar para <b>depois</b>: cada um aparece com valor próprio na proposta.`;
  }
  // chaves das prioridades → nomes dos módulos incluídos
  const INCLUDED = PF ? Object.fromEntries(PF.included.map((m, i) => [`p${i}`, m])) : {};
  const MODS = PF ? PF.optional : C.modules;

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
  cards($("#b-features"), PF ? INCLUDED : C.features);

  $("#b-modules").innerHTML = Object.entries(MODS).map(([k, v]) => `
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
    if (i === 1 && !PF && f.description.value.trim().length < 30) return [f.description, "Descreva a ferramenta com pelo menos 30 caracteres."];
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
    if (PF) {
      $("#sm-summary").innerHTML = `
      <h3 class="mono">Resumo do pedido</h3>
      <dl>
        <div><dt>Plataforma</dt><dd>${esc(PF.name)}</dd></div>
        <div><dt>Usuários</dt><dd>${esc(C.users[state.users])}</dd></div>
        <div><dt>Prioridades</dt><dd>${esc(list(state.priorities, INCLUDED))}</dd></div>
        <div><dt>Módulos agora</dt><dd>${esc(list(mods.filter(([, v]) => v === "agora").map(([k]) => k), MODS))}</dd></div>
        <div><dt>Módulos depois</dt><dd>${esc(list(mods.filter(([, v]) => v === "futuro").map(([k]) => k), MODS))}</dd></div>
      </dl>`;
      return;
    }
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
      ...(PF ? { platform_id: PF.id } : {}),
      website: f.website.value,
      consent: $("#b-consent").checked,
      contact: { name: f.name.value.trim(), email: f.email.value.trim(), company: f.company.value.trim(), phone: f.phone.value.trim(), company_size: f.company_size.value },
      brief: { ...state, segment: f.segment.value, project_name: f.project_name.value.trim(), description: f.description.value.trim(),
        budget: f.budget.value, references: f.references.value.trim(), notes: f.notes.value.trim(),
        priorities: state.priorities.map((k) => INCLUDED[k]?.name).filter(Boolean) },
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
      <h2>${first}, sua proposta ${PF ? `do ${esc(PF.name)} ` : ""}está pronta.</h2>
      <p>${PF ? `Montamos a proposta com os módulos que você escolheu, na identidade do ${esc(PF.name)}.` : "Analisamos as respostas e o projeto se encaixa no nosso escopo padrão."} A proposta já tem escopo, módulos opcionais, cronograma e investimento${r.emailed ? `, e uma cópia foi enviada para <b>${esc(contact.email)}</b>` : ""}.</p>
      <a class="btn btn--primary" href="${esc(r.url)}"><span class="btn__label">Abrir minha proposta</span><span class="btn__icon" aria-hidden="true">→</span></a>`
    : `
      <span class="sm-done__ic">${icon("clock")}</span>
      <p class="mono sm-done__k">PEDIDO ${esc(r.number || "RECEBIDO")}</p>
      <h2>Obrigado, ${first}. Recebemos o seu projeto.</h2>
      <p>Pelo tamanho e pelas integrações, ${PF ? `a implantação do ${esc(PF.name)} na sua empresa` : "a sua plataforma"} merece uma análise da nossa equipe técnica. Vamos revisar o escopo e enviar a proposta para <b>${esc(contact.email)}</b> em até 2 dias úteis.</p>
      <a class="btn btn--ghost" href="/"><span class="btn__label">Voltar ao site</span></a>`;
    el.hidden = false;
    scrollTo({ top: 0, behavior: "smooth" });
  }

  go(0);
})();
