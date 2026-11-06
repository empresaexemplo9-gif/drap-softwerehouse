/* DRAP — Painel de serviço (/servicos/<id>): explicação, tutorial com progresso,
   boas práticas, comparativo, autodiagnóstico e perguntas frequentes. */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const icon = (n) => window.DRAP_ICON(n);

  /* ---------- tema e rodapé ---------- */
  const docRoot = document.documentElement, toggle = $("#theme-toggle"), meta = $('meta[name="theme-color"]');
  const sync = () => { const dark = docRoot.getAttribute("data-theme") === "dark"; toggle?.setAttribute("aria-pressed", dark); meta?.setAttribute("content", dark ? "#06070a" : "#f5f3ee"); };
  toggle?.addEventListener("click", () => {
    const dark = docRoot.getAttribute("data-theme") !== "dark";
    docRoot.classList.add("theme-anim");
    dark ? docRoot.setAttribute("data-theme", "dark") : docRoot.removeAttribute("data-theme");
    try { localStorage.setItem("drap-theme", dark ? "dark" : "light"); } catch {}
    sync(); setTimeout(() => docRoot.classList.remove("theme-anim"), 600);
  });
  sync();
  const y = $("#year"); if (y) y.textContent = new Date().getFullYear();

  const ALL = window.DRAP_SERVICES || {};
  const id = (location.pathname.match(/\/servicos\/([a-z0-9-]+)/) || [])[1] || new URLSearchParams(location.search).get("id") || "";
  const S = ALL[id];
  const main = $("#sv");
  if (!S) {
    main.innerHTML = `<section class="container sv-404"><p class="mono">SERVIÇO NÃO ENCONTRADO</p><h1 class="section__title">Escolha um serviço</h1>
      <div class="sv-others">${Object.entries(ALL).map(([k, s]) => `<a href="/servicos/${k}"><small class="mono">${s.code}</small><b>${esc(s.name)}</b><i aria-hidden="true">→</i></a>`).join("")}</div></section>`;
    return;
  }
  document.title = `${S.name} · DRAP SoftwareHouse & Business`;

  /* ---------- progresso do tutorial (salvo neste navegador) ---------- */
  const KEY = `drap-tutorial-${id}`;
  let done = new Set();
  try { done = new Set(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch {}
  const saveDone = () => { try { localStorage.setItem(KEY, JSON.stringify([...done])); } catch {} };

  const SECTIONS = [
    ["visao", "Visão geral"], ["para-quem", "Para quem é"], ["incluso", "O que está incluso"], ["tutorial", "Tutorial passo a passo"],
    ["boas-praticas", "Uso profissional"], ["comparativo", "Comparativo"], ["diagnostico", "Autodiagnóstico"], ["perguntas", "Perguntas frequentes"],
  ];
  const sec = (key, n, kicker, title, body) => `<section class="sv-sec" id="${key}"><header><span class="mono">${String(n).padStart(2, "0")} · ${kicker}</span><h2>${title}</h2></header>${body}</section>`;

  main.innerHTML = `
    <nav class="container pd-crumbs mono" aria-label="Você está em"><a href="/">Início</a><span>/</span><a href="/#servicos">Serviços</a><span>/</span><b>${esc(S.name)}</b></nav>

    <section class="container sv-hero">
      <div class="sv-hero__copy">
        <div class="sv-badge"><span class="sv-badge__ic">${icon(S.icon)}</span><span class="mono">${S.code} · Serviço DRAP</span></div>
        <h1 class="section__title">${esc(S.name)}</h1>
        <p class="sv-headline serif">${esc(S.headline)}</p>
        <p class="section__lead">${esc(S.lead)}</p>
        <div class="hero__cta">
          <a class="btn btn--primary" href="${esc(S.cta.href)}"><span class="btn__label">${esc(S.cta.label)}</span><span class="btn__icon" aria-hidden="true">→</span></a>
          <a class="btn btn--ghost" href="#tutorial"><span class="btn__label">Ver o tutorial</span><span class="btn__kbd mono">↓</span></a>
        </div>
        <ul class="sv-tags mono">${S.tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      </div>
      <aside class="sv-hero__card" aria-label="Resumo">
        <p class="mono">EM 6 PASSOS</p>
        <ol>${S.steps.map((s, i) => `<li data-step-mini="${i}"${done.has(i) ? ' class="is-done"' : ""}><span class="mono">${String(i + 1).padStart(2, "0")}</span>${esc(s[0])}</li>`).join("")}</ol>
        <div class="sv-progress"><i id="sv-bar-mini"></i></div>
        <small class="mono" id="sv-count-mini"></small>
      </aside>
    </section>

    <div class="container sv-panel">
      <aside class="sv-index" aria-label="Seções do painel">
        <p class="mono">PAINEL</p>
        <ol>${SECTIONS.map(([k, t], i) => `<li><a href="#${k}" data-nav="${k}"><span class="mono">${String(i + 1).padStart(2, "0")}</span>${t}</a></li>`).join("")}</ol>
        <a class="btn btn--primary btn--sm sv-index__cta" href="${esc(S.cta.href)}"><span class="btn__label">${esc(S.cta.label)}</span></a>
      </aside>

      <div class="sv-main">
        ${sec("visao", 1, "VISÃO GERAL", `O que é o <em>${esc(S.name)}</em>`, `
          <p class="sv-text">${esc(S.lead)}</p>
          <div class="sv-flow">${S.steps.slice(0, 3).map((s, i) => `<div><b class="mono">${String(i + 1).padStart(2, "0")}</b><span>${esc(s[0])}</span></div>`).join('<i aria-hidden="true">→</i>')}<i aria-hidden="true">→</i><div class="is-goal"><b class="mono">✓</b><span>Uso profissional</span></div></div>`)}

        ${sec("para-quem", 2, "PARA QUEM É", "Feito para quem está <em>neste momento</em>", `
          <div class="sv-cards">${S.audience.map(([t, d]) => `<article><h3>${esc(t)}</h3><p>${esc(d)}</p></article>`).join("")}</div>`)}

        ${sec("incluso", 3, "O QUE ESTÁ INCLUSO", "Tudo o que vem <em>no serviço</em>", `
          <div class="sv-grid">${S.included.map(([ic, t, d]) => `<article><span class="sv-ic">${icon(ic)}</span><div><h3>${esc(t)}</h3><p>${esc(d)}</p></div></article>`).join("")}</div>`)}

        ${sec("tutorial", 4, "TUTORIAL", "Passo a passo, do início ao <em>uso diário</em>", `
          <p class="sv-text">Marque cada etapa concluída: o progresso fica salvo neste navegador, para você retomar quando quiser.</p>
          <div class="sv-progress sv-progress--big"><i id="sv-bar"></i></div><p class="sv-count mono" id="sv-count"></p>
          <ol class="sv-steps">${S.steps.map(([t, d, tip, href, label], i) => `
            <li class="sv-step${done.has(i) ? " is-done" : ""}" data-step="${i}">
              <label class="sv-step__ck"><input type="checkbox"${done.has(i) ? " checked" : ""} aria-label="Marcar etapa ${i + 1} como concluída" /><span class="mono">${String(i + 1).padStart(2, "0")}</span></label>
              <div class="sv-step__body">
                <h3>${esc(t)}</h3><p>${esc(d)}</p>
                <p class="sv-tip">${icon("ai")}<span>${esc(tip)}</span></p>
                ${href ? `<a class="sv-step__link" href="${esc(href)}">${esc(label)} →</a>` : ""}
              </div>
            </li>`).join("")}</ol>`)}

        ${sec("boas-praticas", 5, "USO PROFISSIONAL", "Boas práticas de quem <em>usa de verdade</em>", `
          <p class="sv-text">O que separa quem só contrata de quem tira resultado: hábitos simples, aplicados desde a primeira semana.</p>
          <div class="sv-practices">${S.practices.map(([t, d], i) => `<article><b class="mono">${String(i + 1).padStart(2, "0")}</b><h3>${esc(t)}</h3><p>${esc(d)}</p></article>`).join("")}</div>`)}

        ${sec("comparativo", 6, "COMPARATIVO", "Improviso x <em>profissional</em>", `
          <div class="sv-table-wrap"><table class="sv-table">
            <thead><tr><th></th><th>${esc(S.compare.left)}</th><th>${esc(S.compare.right)}</th></tr></thead>
            <tbody>${S.compare.rows.map(([k, a, b]) => `<tr><th>${esc(k)}</th><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join("")}</tbody>
          </table></div>`)}

        ${sec("diagnostico", 7, "AUTODIAGNÓSTICO", "Está na hora de <em>profissionalizar?</em>", `
          <p class="sv-text">Marque o que acontece hoje na sua empresa. Leva 30 segundos.</p>
          <div class="sv-check" id="sv-check">${S.check.map((c, i) => `<label><input type="checkbox" data-c="${i}" /><span>${esc(c)}</span></label>`).join("")}</div>
          <div class="sv-result" id="sv-result" aria-live="polite"></div>`)}

        ${sec("perguntas", 8, "PERGUNTAS FREQUENTES", "Antes de <em>decidir</em>", `
          <div class="pd-faq">${S.faq.map(([q, a]) => `<details class="pd-card"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</div>`)}

        <section class="sv-final">
          <div><span class="mono">PRÓXIMO PASSO</span><h2>${esc(S.cta.title)}</h2><p>${esc(S.cta.text)}</p></div>
          <div class="sv-final__act">
            <a class="btn btn--primary" href="${esc(S.cta.href)}"><span class="btn__label">${esc(S.cta.label)}</span><span class="btn__icon" aria-hidden="true">→</span></a>
            <a class="btn btn--ghost" href="/agendar"><span class="btn__label">Agendar reunião</span></a>
          </div>
        </section>

        <section class="sv-others-wrap">
          <span class="mono">OUTROS SERVIÇOS</span>
          <div class="sv-others">${Object.entries(ALL).filter(([k]) => k !== id).map(([k, s]) => `<a href="/servicos/${k}"><small class="mono">${s.code}</small><b>${esc(s.name)}</b><i aria-hidden="true">→</i></a>`).join("")}
            <a href="/sob-medida"><small class="mono">S/03</small><b>Desenvolvimento sob medida</b><i aria-hidden="true">→</i></a></div>
        </section>
      </div>
    </div>`;

  /* ---------- progresso ---------- */
  function progress() {
    const n = done.size, t = S.steps.length, pct = Math.round((n / t) * 100);
    $("#sv-bar").style.width = `${pct}%`; $("#sv-bar-mini").style.width = `${pct}%`;
    const txt = n === t ? "Tutorial concluído: você está pronto para o uso profissional." : `${n} de ${t} etapas concluídas`;
    $("#sv-count").textContent = txt; $("#sv-count-mini").textContent = `${n}/${t} concluídas`;
    $$("[data-step-mini]").forEach((li) => li.classList.toggle("is-done", done.has(Number(li.dataset.stepMini))));
  }
  $(".sv-steps").addEventListener("change", (e) => {
    const li = e.target.closest("[data-step]"); if (!li) return;
    const i = Number(li.dataset.step);
    e.target.checked ? done.add(i) : done.delete(i);
    li.classList.toggle("is-done", e.target.checked);
    saveDone(); progress();
  });
  progress();

  /* ---------- autodiagnóstico ---------- */
  const result = $("#sv-result");
  function diagnose() {
    const n = $$("#sv-check input:checked").length;
    if (!n) { result.innerHTML = ""; result.className = "sv-result"; return; }
    const level = n >= 4 ? "alto" : n >= 2 ? "medio" : "baixo";
    const msg = {
      alto: ["Você já está pagando o custo do improviso.", "Com tantos sinais, cada mês sem estrutura profissional custa horas da equipe, informação perdida e decisões no escuro. Este é o momento certo de agir."],
      medio: ["O momento certo de profissionalizar é agora.", "Os sinais aparecem antes dos problemas grandes. Estruturar agora sai mais barato e mais rápido do que depois de uma perda."],
      baixo: ["Você está começando bem.", "Ainda dá para operar sem estrutura, mas vale planejar a próxima etapa antes que o crescimento traga os problemas da lista."],
    }[level];
    result.className = `sv-result sv-result--${level}`;
    result.innerHTML = `<div><b>${n} de ${S.check.length} sinais</b><h3>${msg[0]}</h3><p>${msg[1]}</p></div>
      <a class="btn btn--primary" href="${esc(S.cta.href)}"><span class="btn__label">${esc(S.cta.label)}</span><span class="btn__icon" aria-hidden="true">→</span></a>`;
  }
  $("#sv-check").addEventListener("change", diagnose);

  /* ---------- índice do painel: seção atual em destaque ---------- */
  const spy = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) $$("[data-nav]").forEach((a) => a.classList.toggle("is-on", a.dataset.nav === en.target.id));
  }), { rootMargin: "-30% 0px -60% 0px" });
  $$(".sv-sec").forEach((s) => spy.observe(s));
  if (location.hash) setTimeout(() => $(location.hash)?.scrollIntoView({ block: "start" }), 50);
})();
