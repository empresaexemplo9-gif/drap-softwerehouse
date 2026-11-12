/* DRAP — Portfólio (/portfolio)
   Método: estudo de caso (desafio → solução → resultado), prova em números verificáveis,
   chamada para ação em cada case e folha de vendas (one-pager) imprimível por case.
   Os textos vêm das mesmas fontes do site: catálogo (painel/banco) e platform-details.js. */
(async () => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

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
  let toastT;
  const toast = (t) => { const el = $("#toast"); if (!el) return; el.textContent = t; el.classList.add("is-on"); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove("is-on"), 2200); };

  /* ---------- cores (mesma regra da home) ---------- */
  const hexToRgb = (hex) => { const n = parseInt(hex.replace("#", ""), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const lum = ([r, g, b]) => (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const mix = (rgb, t, k) => rgb.map((v, i) => Math.round(v + (t[i] - v) * k));
  const css = (rgb) => `rgb(${rgb.join(", ")})`;
  const strongOf = (h) => { const c = hexToRgb(h), l = lum(c); return css(l > 0.42 ? mix(c, [0, 0, 0], Math.min(0.6, (l - 0.42) * 1.6 + 0.12)) : c); };
  const softOf = (h) => { const c = hexToRgb(h), l = lum(c); return css(l < 0.55 ? mix(c, [255, 255, 255], Math.min(0.62, (0.55 - l) * 1.25)) : c); };
  const isExternal = (u) => /^https?:\/\//.test(u || "");

  /* ---------- dados ---------- */
  const fromRow = (r) => ({
    id: r.id, name: r.name, code: r.code, category: r.category, tagline: r.tagline, summary: r.summary,
    features: r.features || [], stack: r.stack || [], status: r.status, palette: r.palette, url: r.url,
    logo: r.logo_svg ? { svg: r.logo_svg } : r.logo_url ? { src: r.logo_url } : null,
    preview: r.preview_image ? { image: r.preview_image } : { key: r.preview_key || r.id },
  });
  let platforms = window.DRAP_PLATFORMS || [], testimonials = [];
  try {
    const data = await window.DRAP_API.catalog();
    if (data?.platforms?.length) platforms = data.platforms.map(fromRow);
    testimonials = data?.testimonials || [];
  } catch { /* segue com o catálogo local */ }
  const D = window.DRAP_DETAILS || {};

  /* ---------- prova em números (só fatos que o próprio catálogo comprova) ---------- */
  const segments = [...new Set(platforms.map((p) => p.category))];
  const modules = platforms.reduce((a, p) => a + (D[p.id]?.modules?.filter((m) => !/próximas fases/i.test(m.title)).length || p.features.length), 0);
  const stacks = new Set(platforms.flatMap((p) => p.stack.map((s) => s.toLowerCase().replace(/\s+\d+$/, ""))));
  const live = platforms.filter((p) => isExternal(p.url)).length;
  $("#pf-proof").innerHTML = [
    [platforms.length, "plataformas em operação"], [segments.length, "segmentos atendidos"],
    [modules, "módulos entregues"], [stacks.size, "tecnologias em produção"], ...(live ? [[live, "abertas para testar ao vivo"]] : []),
  ].map(([n, t]) => `<div><dt>${n}</dt><dd>${t}</dd></div>`).join("");

  /* ---------- filtros por segmento ---------- */
  const filters = $("#pf-filters");
  filters.innerHTML = ["Todos", ...segments].map((c, i) =>
    `<button class="filter${i === 0 ? " is-active" : ""}" role="tab" aria-selected="${i === 0}" data-cat="${esc(c)}">${esc(c)}</button>`).join("");
  filters.addEventListener("click", (e) => {
    const b = e.target.closest("[data-cat]"); if (!b) return;
    $$(".filter", filters).forEach((x) => { x.classList.toggle("is-active", x === b); x.setAttribute("aria-selected", x === b); });
    $$(".pf-case").forEach((c) => (c.hidden = b.dataset.cat !== "Todos" && c.dataset.cat !== b.dataset.cat));
  });

  /* ---------- cases ---------- */
  const quotesFor = (id) => testimonials.filter((t) => t.platform_id === id);
  const quoteHtml = (t) => `<figure class="proof-quote">
      <blockquote>“${esc(t.quote)}”</blockquote>
      <figcaption>${t.rating ? `<span class="proof-stars" aria-label="${t.rating} de 5">${"★".repeat(t.rating)}</span>` : ""}
        <b>${esc(t.name)}</b>${t.role || t.company ? `<small>${esc([t.role, t.company].filter(Boolean).join(" · "))}</small>` : ""}</figcaption></figure>`;

  function caseHtml(p, i) {
    const d = D[p.id] || {};
    const primary = p.palette[0];
    const logo = p.logo?.svg || (p.logo?.src ? `<img src="${esc(p.logo.src)}" alt="" />` : esc(p.name.slice(0, 2)));
    const previewFn = (window.DRAP_PREVIEWS || {})[p.preview?.key || p.id];
    const preview = p.preview?.image ? `<img class="pv-shot" src="${esc(p.preview.image)}" alt="Tela da plataforma ${esc(p.name)}" loading="lazy" />`
      : previewFn ? `<div class="pv-stage" aria-hidden="true">${previewFn()}</div>` : "";
    const host = isExternal(p.url) ? new URL(p.url).host : `${p.name} · prévia da interface`;
    const mods = (d.modules || p.features.map((t) => ({ title: t }))).filter((m) => !/próximas fases/i.test(m.title));
    const quotes = quotesFor(p.id);
    return `
    <article class="container pf-case${i % 2 ? " pf-case--alt" : ""}" id="case-${esc(p.id)}" data-case="${esc(p.id)}" data-cat="${esc(p.category)}"
      style="--c:${primary};--c-rgb:${hexToRgb(primary).join(",")};--c-strong:${strongOf(primary)};--c-soft:${softOf(primary)}">
      <div class="pf-case__visual">
        <div class="card__orb" aria-hidden="true"></div>
        <div class="pv-frame">
          <div class="pv-bar" aria-hidden="true"><i></i><i></i><i></i><span>${esc(host)}</span></div>
          <div class="pv-viewport" role="img" aria-label="Interface da plataforma ${esc(p.name)}">${preview}</div>
        </div>
        <div class="pf-palette" aria-label="Paleta da marca">${p.palette.map((c) => `<i style="background:${c}" title="${c}"></i>`).join("")}</div>
        <div class="stack pf-stack">${p.stack.map((s) => `<span>${esc(s)}</span>`).join("")}</div>
      </div>

      <div class="pf-case__body">
        <header class="pf-case__head">
          <span class="card__logo pf-logo">${logo}</span>
          <div><small class="mono">CASE ${String(i + 1).padStart(2, "0")} · ${esc(p.category)}</small><h2>${esc(p.name)}</h2></div>
          <span class="badge">${esc(p.status)}</span>
        </header>
        <p class="pf-headline serif">${esc(d.headline || p.tagline)}</p>

        <div class="pf-block">
          <h3 class="mono">O DESAFIO</h3>
          <ul class="pf-pains">${(d.pains || [p.summary]).slice(0, 3).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
        </div>
        <div class="pf-block">
          <h3 class="mono">O QUE CONSTRUÍMOS</h3>
          <p>${esc(d.lead || p.summary)}</p>
          <ul class="pf-mods">${mods.map((m) => `<li>${esc(m.title)}</li>`).join("")}</ul>
        </div>
        ${d.outcomes?.length ? `<div class="pf-block">
          <h3 class="mono">O QUE MUDA PARA O CLIENTE</h3>
          <div class="pf-outs">${d.outcomes.slice(0, 4).map((o) => `<div><b>${esc(o.title)}</b><p>${esc(o.text)}</p></div>`).join("")}</div>
        </div>` : ""}
        ${d.differentials?.length ? `<div class="pf-block pf-block--diff">
          <h3 class="mono">POR QUE FUNCIONA</h3>
          <ul class="pf-checks">${d.differentials.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
        </div>` : ""}
        ${quotes.length ? `<div class="pf-block">${quotes.slice(0, 2).map(quoteHtml).join("")}</div>` : ""}

        <div class="pf-actions">
          <a class="btn btn--primary" href="/plataformas/${esc(p.id)}/proposta"><span class="btn__label">Receber proposta</span><span class="btn__icon" aria-hidden="true">→</span></a>
          ${isExternal(p.url) ? `<a class="btn btn--ghost" href="${esc(p.url)}" target="_blank" rel="noopener"><span class="btn__label">Ver ao vivo</span><span class="btn__kbd mono">↗</span></a>` : ""}
          <a class="btn btn--ghost" href="/plataformas/${esc(p.id)}"><span class="btn__label">Detalhes</span></a>
          <button class="pf-link mono" type="button" data-print="${esc(p.id)}">baixar folha do case (PDF)</button>
          <button class="pf-link mono" type="button" data-share="${esc(p.id)}">copiar link do case</button>
        </div>
        <p class="pf-printfoot">DRAP SoftwareHouse &amp; Business · Receba a proposta do ${esc(p.name)} em ${esc(location.host)}/plataformas/${esc(p.id)}/proposta</p>
      </div>
    </article>`;
  }

  // Case "sob medida": o processo, já que cada projeto é do cliente
  const bespoke = `
    <article class="container pf-case pf-case--bespoke" id="case-sob-medida" data-case="sob-medida" data-cat="Sob medida">
      <div class="pf-case__body pf-case__body--wide">
        <header class="pf-case__head">
          <span class="card__logo pf-logo"><svg viewBox="0 0 778 781" fill="currentColor" aria-hidden="true"><path d="M0 0H533L212 781H0Z"/><path d="M581 2C601 2 777 60 777 290V480C777 675 652 781 512 781H219Z"/></svg></span>
          <div><small class="mono">S/03 · DESENVOLVIMENTO SOB MEDIDA</small><h2>A sua plataforma, do zero</h2></div>
        </header>
        <p class="pf-headline serif">Quando nenhum produto pronto resolve, aplicamos a mesma engenharia destes cases na regra do seu negócio.</p>
        <ol class="pf-steps">
          <li><b>01 · Você descreve</b><span>Questionário guiado de 5 minutos: objetivos, usuários, funcionalidades e integrações.</span></li>
          <li><b>02 · Proposta com valores</b><span>Escopo, módulos com preço próprio, cronograma e investimento comparado ao mercado.</span></li>
          <li><b>03 · Discovery e protótipo</b><span>Imersão na operação e protótipo navegável antes de escrever código.</span></li>
          <li><b>04 · Entregas quinzenais</b><span>Você acompanha e valida cada etapa até o go-live.</span></li>
        </ol>
        <div class="pf-actions">
          <a class="btn btn--primary" href="/sob-medida"><span class="btn__label">Descrever minha plataforma</span><span class="btn__icon" aria-hidden="true">→</span></a>
        </div>
      </div>
    </article>`;

  $("#pf-cases").innerHTML = platforms.map(caseHtml).join("") + bespoke;
  filters.insertAdjacentHTML("beforeend", `<button class="filter" role="tab" aria-selected="false" data-cat="Sob medida">Sob medida</button>`);

  // depoimentos gerais (sem plataforma) + todos, numa faixa própria
  if (testimonials.length) {
    $("#pf-voices").hidden = false;
    $("#pf-quotes").innerHTML = testimonials.slice(0, 6).map(quoteHtml).join("");
  }

  /* ---------- escala das prévias (palco 560×350) ---------- */
  const fit = () => $$(".pf-case .pv-viewport").forEach((v) => v.style.setProperty("--s", v.clientWidth / 560));
  fit(); addEventListener("resize", fit);

  /* ---------- link direto para um case (#case-<id>) ---------- */
  if (location.hash.startsWith("#case-")) setTimeout(() => $(location.hash)?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);

  /* ---------- folha do case (PDF) e compartilhamento ---------- */
  $("#pf-cases").addEventListener("click", async (e) => {
    const pr = e.target.closest("[data-print]");
    if (pr) {
      const el = pr.closest(".pf-case");
      el.classList.add("is-printing");
      document.body.dataset.printCase = pr.dataset.print;
      const done = () => { delete document.body.dataset.printCase; el.classList.remove("is-printing"); removeEventListener("afterprint", done); };
      addEventListener("afterprint", done);
      window.print();
    }
    const sh = e.target.closest("[data-share]");
    if (sh) {
      const url = `${location.origin}/portfolio?utm_source=compartilhamento&utm_medium=link&utm_campaign=case-${sh.dataset.share}#case-${sh.dataset.share}`;
      try { await navigator.clipboard.writeText(url); toast("Link do case copiado"); } catch { prompt("Link do case:", url); }
    }
  });
})();
