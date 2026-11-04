/* DRAP — Página de detalhes da plataforma (/plataformas/<id>) */
(async () => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- cores (mesma lógica da home) ---------- */
  const hexToRgb = (hex) => { const n = parseInt(hex.replace("#", ""), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const lum = ([r, g, b]) => (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const mix = (rgb, t, k) => rgb.map((v, i) => Math.round(v + (t[i] - v) * k));
  const css = (rgb) => `rgb(${rgb.join(", ")})`;
  const strongOf = (h) => { const c = hexToRgb(h), l = lum(c); return css(l > 0.42 ? mix(c, [0, 0, 0], Math.min(0.6, (l - 0.42) * 1.6 + 0.12)) : c); };
  const softOf = (h) => { const c = hexToRgb(h), l = lum(c); return css(l < 0.55 ? mix(c, [255, 255, 255], Math.min(0.62, (0.55 - l) * 1.25)) : c); };
  const isLight = (h) => lum(hexToRgb(h)) > 0.55;
  const isExternal = (u) => /^https?:\/\//.test(u || "");

  /* ---------- dados ---------- */
  const id = (location.pathname.match(/\/plataformas\/([a-z0-9-]+)/) || [])[1] || new URLSearchParams(location.search).get("id");
  const fromRow = (r) => ({
    id: r.id, name: r.name, code: r.code, category: r.category, tagline: r.tagline, summary: r.summary,
    features: r.features || [], stack: r.stack || [], status: r.status, palette: r.palette, url: r.url,
    logo: r.logo_svg ? { svg: r.logo_svg } : r.logo_url ? { src: r.logo_url } : null,
    preview: r.preview_image ? { image: r.preview_image } : { key: r.preview_key || r.id },
  });
  let platforms = window.DRAP_PLATFORMS || [];
  let online = false, testimonials = [];
  try {
    const data = await window.DRAP_API.catalog();
    if (data?.platforms?.length) platforms = data.platforms.map(fromRow);
    testimonials = data?.testimonials || [];
    online = true;
  } catch { /* segue com o catálogo local */ }

  const main = $("#pd");
  const p = platforms.find((x) => x.id === id);
  const d = (window.DRAP_DETAILS || {})[id];
  const Q = window.DRAP_QUALITY;

  if (!p) {
    document.title = "Plataforma não encontrada · DRAP";
    main.innerHTML = `<section class="container pd-404"><p class="mono">ERRO 404</p><h1>Plataforma não encontrada</h1>
      <p>Ela pode ter sido renomeada ou retirada do catálogo.</p>
      <a class="btn btn--primary" href="/#plataformas"><span class="btn__label">Ver todas as plataformas</span><span class="btn__icon" aria-hidden="true">→</span></a></section>`;
    return finish();
  }

  /* ---------- identidade da plataforma na página ---------- */
  const primary = p.palette[0];
  const root = document.body;
  root.style.setProperty("--c", primary);
  root.style.setProperty("--c-rgb", hexToRgb(primary).join(","));
  root.style.setProperty("--c-strong", strongOf(primary));
  root.style.setProperty("--c-soft", softOf(primary));
  root.style.setProperty("--c-on", isLight(primary) ? "#06070a" : "#ffffff");
  document.title = `${p.name} — ${p.category} · DRAP SoftwareHouse & Business`;
  $('meta[name="description"]')?.setAttribute("content", d?.lead?.slice(0, 160) || p.summary);

  const logo = p.logo?.svg || (p.logo?.src ? `<img src="${esc(p.logo.src)}" alt="" />` : esc(p.name.slice(0, 2)));
  const previewFn = (window.DRAP_PREVIEWS || {})[p.preview?.key || p.id];
  const preview = p.preview?.image
    ? `<img class="pv-shot" src="${esc(p.preview.image)}" alt="Tela da plataforma ${esc(p.name)}" />`
    : previewFn ? `<div class="pv-stage" aria-hidden="true">${previewFn()}</div>` : "";
  const host = isExternal(p.url) ? new URL(p.url).host : `${p.name} · prévia da interface`;
  const idx = platforms.indexOf(p);
  const others = platforms.filter((x) => x.id !== p.id);

  const section = (n, label, title, body, cls = "") => `
    <section class="pd-sec ${cls} container reveal">
      <header class="pd-sec__head"><div class="section__index mono"><span>${n}</span> / ${label}</div><h2 class="section__title">${title}</h2></header>
      ${body}
    </section>`;

  main.innerHTML = `
    <nav class="container pd-crumbs mono" aria-label="Você está em">
      <a href="/">Início</a><span>/</span><a href="/#plataformas">Plataformas</a><span>/</span><b>${esc(p.name)}</b>
    </nav>

    <section class="container pd-hero">
      <div class="pd-hero__copy reveal">
        <div class="pd-hero__id">
          <div class="card__logo pd-logo">${logo}</div>
          <div><div class="card__cat">${esc(p.category)}</div><div class="pd-hero__meta mono">${esc(p.code)} · <span class="badge">${esc(p.status)}</span></div></div>
        </div>
        <h1 class="pd-hero__title">${esc(p.name)}</h1>
        <p class="pd-hero__headline serif">${esc(d?.headline || p.tagline)}</p>
        <p class="pd-hero__lead">${esc(d?.lead || p.summary)}</p>
        <div class="hero__cta">
          <a href="/plataformas/${esc(p.id)}/proposta" class="btn btn--primary"><span class="btn__label">Receber proposta</span><span class="btn__icon" aria-hidden="true">→</span></a>
          <a href="#demo" class="btn btn--ghost"><span class="btn__label">Solicitar demonstração</span></a>
          ${isExternal(p.url) ? `<a href="${esc(p.url)}" target="_blank" rel="noopener" class="btn btn--ghost"><span class="btn__label">Ver plataforma ao vivo</span><span class="btn__kbd mono">↗</span></a>` : ""}
        </div>
        <div class="stack pd-stack">${p.stack.map((s) => `<span>${esc(s)}</span>`).join("")}</div>
      </div>
      <div class="pd-hero__visual reveal">
        <div class="card__orb" aria-hidden="true"></div>
        <div class="pv-frame pd-frame">
          <div class="pv-bar" aria-hidden="true"><i></i><i></i><i></i><span>${esc(host)}</span></div>
          <div class="pv-viewport" role="img" aria-label="Prévia da interface da plataforma ${esc(p.name)}">${preview}</div>
        </div>
        <div class="palette pd-palette">
          <div class="palette__head"><span>Identidade visual</span><span>${p.palette.length} cores</span></div>
          <div class="palette__bar">${p.palette.map((c) => `<button class="swatch" style="background:${c};--sw-fg:${isLight(c) ? "#06070a" : "#ffffff"}" data-hex="${c}" aria-label="Copiar cor ${c}"><span>${c.toUpperCase()}</span></button>`).join("")}</div>
        </div>
      </div>
    </section>

    ${d ? `
    <section class="container pd-audience reveal">
      <span class="mono">FEITO PARA</span>
      ${d.audience.map((a) => `<b>${esc(a)}</b>`).join("")}
    </section>

    ${section("01", "O desafio", `O que trava a sua operação <span class="serif">hoje</span>`, `
      <div class="pd-versus">
        <div class="pd-card pd-pains">
          <h3 class="mono">SEM A PLATAFORMA</h3>
          <ul>${d.pains.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
        </div>
        <div class="pd-outcomes">
          ${d.outcomes.map((o) => `<article class="pd-card pd-outcome"><h3>${esc(o.title)}</h3><p>${esc(o.text)}</p></article>`).join("")}
        </div>
      </div>`)}

    ${section("02", "O que você recebe", `Módulos que trabalham <span class="serif">juntos</span>`, `
      <div class="pd-modules">${d.modules.map((m, i) => `
        <article class="pd-card pd-module"><span class="mono">${String(i + 1).padStart(2, "0")}</span><h3>${esc(m.title)}</h3><p>${esc(m.text)}</p></article>`).join("")}
      </div>`)}

    ${section("03", "Implantação", `Do contrato ao uso <span class="serif">real</span>`, `
      <ol class="pipeline pd-steps">${d.steps.map((s, i) => `
        <li><span class="pipeline__node mono">${String(i + 1).padStart(2, "0")}</span><h4>${esc(s.title)}</h4><p>${esc(s.text)}</p></li>`).join("")}
      </ol>`)}

    ${section("04", "Diferenciais", `Por que esta plataforma é <span class="serif">diferente</span>`, `
      <div class="pd-two">
        <div class="pd-card"><h3 class="mono">DIFERENCIAIS</h3><ul class="pd-checks">${d.differentials.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
        <div class="pd-card"><h3 class="mono">SEGURANÇA E CONFORMIDADE</h3><ul class="pd-shield">${d.security.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
      </div>`)}
    ` : `
    ${section("01", "Visão geral", `O que a plataforma <span class="serif">entrega</span>`, `
      <div class="pd-modules">${p.features.map((f, i) => `<article class="pd-card pd-module"><span class="mono">${String(i + 1).padStart(2, "0")}</span><h3>${esc(f)}</h3></article>`).join("")}</div>`)}`}

    ${section(d ? "05" : "02", "A DRAP", `${esc(Q.title)}`, `
      <p class="section__lead pd-quality__lead">${esc(Q.lead)}</p>
      <div class="pd-quality">${Q.pillars.map((q) => `<article class="pd-card"><h3>${esc(q.k)}</h3><p>${esc(q.t)}</p></article>`).join("")}</div>`, "pd-sec--quality")}

    ${d ? section("06", "Perguntas frequentes", `Antes de <span class="serif">decidir</span>`, `
      <div class="pd-faq">${d.faq.map((f) => `<details class="pd-card"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}</div>`) : ""}

    ${testimonials.some((t) => t.platform_id === p.id) ? `
    <section class="container pd-sec reveal">
      <header class="pd-sec__head"><div class="section__index mono"><span>★</span> / Quem usa</div>
        <h2 class="section__title">O que dizem os clientes do <span class="serif">${esc(p.name)}</span></h2></header>
      <div class="proof-quotes">${testimonials.filter((t) => t.platform_id === p.id).slice(0, 3).map((t) => `<figure class="proof-quote">
        <blockquote>“${esc(t.quote)}”</blockquote>
        <figcaption>${t.rating ? `<span class="proof-stars" aria-label="${t.rating} de 5">${"★".repeat(t.rating)}</span>` : ""}
          <b>${esc(t.name)}</b><small>${esc([t.role, t.company].filter(Boolean).join(" · "))}</small></figcaption></figure>`).join("")}</div>
    </section>` : ""}

    <section class="container pd-sec" id="proposta">
      <div class="pd-quote reveal">
        <div class="pd-quote__copy">
          <div class="section__index mono"><span>$</span> / Proposta automática</div>
          <h2 class="section__title">Receba a proposta do ${esc(p.name)} <span class="serif">em 3 minutos.</span></h2>
          <p class="section__lead">Responda algumas perguntas sobre a sua operação, escolha os módulos extras e receba na hora a proposta com implantação,
            licença mensal, cronograma e investimento, na identidade do ${esc(p.name)}. Por link, PDF ou e-mail.</p>
          <a href="/plataformas/${esc(p.id)}/proposta" class="btn btn--primary"><span class="btn__label">Montar minha proposta</span><span class="btn__icon" aria-hidden="true">→</span></a>
          <a href="/portfolio#case-${esc(p.id)}" class="btn btn--ghost"><span class="btn__label">Ver o case no portfólio</span></a>
        </div>
        <ol class="pd-quote__steps mono">
          <li><b>01</b>Sobre a sua empresa</li>
          <li><b>02</b>Quantas pessoas vão usar</li>
          <li><b>03</b>Prioridades e módulos extras</li>
          <li><b>04</b>Proposta pronta, com valores</li>
        </ol>
      </div>
    </section>

    <section class="container pd-sec" id="demo">
      <div class="cta reveal">
        <div class="cta__corner cta__corner--tl"></div><div class="cta__corner cta__corner--tr"></div>
        <div class="cta__corner cta__corner--bl"></div><div class="cta__corner cta__corner--br"></div>
        <div class="cta__copy">
          <div class="section__index mono"><span>→</span> / Demonstração</div>
          <h2 class="section__title">${esc(d?.cta || `Conheça o ${p.name}`)}</h2>
          <p class="section__lead">Uma conversa de 30 minutos com um especialista da DRAP: mostramos a plataforma aplicada ao seu caso, tiramos dúvidas e apresentamos a proposta de implantação.</p>
          <ul class="cta__meta mono">
            <li><span>PLATAFORMA</span>${esc(p.name)}</li>
            <li><span>RETORNO</span>em até 24h úteis</li>
            <li><span>FORMATO</span>online · 30 minutos</li>
          </ul>
        </div>
        <form class="form" id="pd-form" novalidate>
          <div class="field"><label for="d-name" class="mono">nome</label><input id="d-name" name="name" maxlength="120" autocomplete="name" placeholder="Seu nome" required /></div>
          <div class="field"><label for="d-email" class="mono">email</label><input id="d-email" name="email" type="email" maxlength="254" autocomplete="email" placeholder="voce@empresa.com" required /></div>
          <div class="form__row">
            <div class="field"><label for="d-company" class="mono">empresa</label><input id="d-company" name="company" maxlength="120" autocomplete="organization" placeholder="Nome da empresa" /></div>
            <div class="field"><label for="d-phone" class="mono">whatsapp</label><input id="d-phone" name="phone" type="tel" maxlength="40" autocomplete="tel" placeholder="(00) 00000-0000" /></div>
          </div>
          <div class="field field--hp" aria-hidden="true"><label for="d-website">website</label><input id="d-website" name="website" tabindex="-1" autocomplete="off" /></div>
          <div class="field"><label for="d-msg" class="mono">mensagem</label><textarea id="d-msg" name="message" rows="3" maxlength="2000" placeholder="Conte um pouco sobre a sua operação"></textarea></div>
          <button type="submit" class="btn btn--primary btn--block"><span class="btn__label">Quero uma demonstração do ${esc(p.name)}</span><span class="btn__icon" aria-hidden="true">→</span></button>
          <p class="form__status mono" id="pd-status" role="status"></p>
        </form>
      </div>
    </section>

    ${others.length ? `
    <section class="container pd-sec reveal">
      <header class="pd-sec__head"><div class="section__index mono"><span>+</span> / Outras plataformas</div></header>
      <div class="pd-others">${others.map((o) => `
        <a class="pd-other" href="/plataformas/${esc(o.id)}" style="--c:${o.palette[0]};--c-rgb:${hexToRgb(o.palette[0]).join(",")};--c-text:${strongOf(o.palette[0])}">
          <span class="card__logo">${o.logo?.svg || ""}</span>
          <span><small class="mono">${esc(o.category)}</small><b>${esc(o.name)}</b></span><i aria-hidden="true">→</i>
        </a>`).join("")}
      </div>
    </section>` : ""}
  `;

  /* ---------- formulário de demonstração ---------- */
  $("#pd-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.currentTarget, st = $("#pd-status"), btn = f.querySelector("button[type=submit]");
    const set = (c, t) => { st.className = `form__status mono ${c}`; st.textContent = t; };
    const v = (n) => f.elements[n].value.trim() || null;
    const okName = (v("name") || "").length > 1, okMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("email") || "");
    f.elements.name.parentElement.classList.toggle("is-invalid", !okName);
    f.elements.email.parentElement.classList.toggle("is-invalid", !okMail);
    if (!okName || !okMail) return set("err", "✕ verifique nome e e-mail");
    if (!online) return set("err", "✕ envio indisponível no momento. Tente novamente mais tarde.");
    btn.disabled = true; btn.classList.add("is-loading"); set("", "› enviando…");
    try {
      const params = new URLSearchParams(location.search);
      const utm = ["utm_source", "utm_medium", "utm_campaign"].map((k) => params.get(k)).filter(Boolean).join(" / ");
      await window.DRAP_API.sendLead({
        name: v("name"), email: v("email"), company: v("company"), phone: v("phone"), message: v("message"),
        platform_id: p.id, source: (window.DRAP_ATTR?.() || utm || `página ${p.id}`).slice(0, 200),
        website: f.elements.website.value,
      });
      set("ok", "✓ solicitação registrada. Retornaremos em até 24h úteis.");
      f.reset();
    } catch (err) { set("err", `✕ ${err.message}`); }
    finally { btn.disabled = false; btn.classList.remove("is-loading"); }
  });

  /* ---------- miniatura escalada ---------- */
  const ro = new ResizeObserver((es) => es.forEach((en) => en.target.style.setProperty("--s", (en.contentRect.width / 560).toFixed(4))));
  $$(".pv-viewport").forEach((vp) => ro.observe(vp));

  /* ---------- copiar cor ---------- */
  main.addEventListener("click", async (e) => {
    const sw = e.target.closest(".swatch"); if (!sw) return;
    try { await navigator.clipboard.writeText(sw.dataset.hex.toUpperCase()); } catch {}
    toast(`<i style="background:${sw.dataset.hex}"></i> ${sw.dataset.hex.toUpperCase()} copiado`);
  });

  finish();

  /* ---------- comum: tema, nav, reveal, rodapé ---------- */
  function toast(html) {
    const t = $("#toast"); t.innerHTML = html; t.classList.add("is-on");
    clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("is-on"), 1800);
  }
  function finish() {
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } }), { threshold: 0.08 });
    $$(".reveal").forEach((el) => io.observe(el));
    const nav = $(".nav");
    const onScroll = () => nav.classList.toggle("is-scrolled", scrollY > 10);
    addEventListener("scroll", onScroll, { passive: true }); onScroll();
    $(".nav__burger")?.addEventListener("click", (e) => e.currentTarget.setAttribute("aria-expanded", nav.classList.toggle("is-open")));
    $$(".nav__links a").forEach((a) => a.addEventListener("click", () => nav.classList.remove("is-open")));
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
    const y = $("#year"); if (y) y.textContent = new Date().getFullYear();
    if (location.hash) setTimeout(() => document.querySelector(location.hash)?.scrollIntoView(), 50);
  }
})();
