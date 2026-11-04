/* DRAP SoftwareHouse & Business — interações */
(async () => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- dados: Supabase (produção) com catálogo local de reserva ---------- */
  const api = window.DRAP_API;
  const fromRow = (r) => ({
    id: r.id, name: r.name, code: r.code, category: r.category, tagline: r.tagline, summary: r.summary,
    features: r.features || [], stack: r.stack || [], status: r.status, palette: r.palette, url: r.url, repo: r.repo,
    logo: r.logo_svg ? { svg: r.logo_svg } : r.logo_url ? { src: r.logo_url } : null,
    preview: r.preview_image ? { image: r.preview_image } : { key: r.preview_key || r.id },
  });
  /* Depoimentos aprovados no painel (prova social): a faixa só aparece quando houver algum */
  function showTestimonials(list) {
    const box = document.getElementById("home-voices");
    if (!box || !list.length) return;
    const e = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    document.getElementById("home-quotes").innerHTML = list.slice(0, 3).map((t) => `<figure class="proof-quote">
      <blockquote>“${e(t.quote)}”</blockquote>
      <figcaption>${t.rating ? `<span class="proof-stars" aria-label="${t.rating} de 5">${"★".repeat(t.rating)}</span>` : ""}
        <b>${e(t.name)}</b><small>${e([t.role, t.company, t.platform_name].filter(Boolean).join(" · "))}</small></figcaption></figure>`).join("");
    box.hidden = false;
  }
  let platforms = window.DRAP_PLATFORMS || [];
  let settings = {};
  let online = false; // true quando o catálogo veio do banco (API funcionando)
  try {
    const data = await api.catalog();
    if (Array.isArray(data?.platforms) && data.platforms.length) platforms = data.platforms.map(fromRow);
    settings = data?.settings || {};
    showTestimonials(data?.testimonials || []);
    online = true;
  } catch { /* API/banco indisponível: segue com o catálogo local */ }
  $$("[data-setting]").forEach((el) => { if (settings[el.dataset.setting]) el.textContent = settings[el.dataset.setting]; });

  /* ---------- utilidades de cor ---------- */
  const hexToRgb = (hex) => {
    let h = hex.replace("#", "");
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const isLight = (hex) => {
    const [r, g, b] = hexToRgb(hex);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55;
  };
  /* Ajusta a cor da plataforma para texto legível em cada tema:
     --c-strong (tema claro) garante cor escura; --c-soft (tema escuro) garante cor clara. */
  const lumOf = ([r, g, b]) => (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const mixTo = (rgb, target, k) => rgb.map((v, i) => Math.round(v + (target[i] - v) * k));
  const toCss = (rgb) => `rgb(${rgb.join(", ")})`;
  const strongOf = (hex) => {
    const rgb = hexToRgb(hex), l = lumOf(rgb);
    return toCss(l > 0.42 ? mixTo(rgb, [0, 0, 0], Math.min(0.6, (l - 0.42) * 1.6 + 0.12)) : rgb);
  };
  const softOf = (hex) => {
    const rgb = hexToRgb(hex), l = lumOf(rgb);
    return toCss(l < 0.55 ? mixTo(rgb, [255, 255, 255], Math.min(0.62, (0.55 - l) * 1.25)) : rgb);
  };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- render dos cards ---------- */
  const grid = $("#platform-grid");
  const renderLogo = (p) => {
    if (p.logo?.mask) return `<span class="logo-mask" role="img" aria-label="Logo ${esc(p.name)}" style="--logo:url('${esc(p.logo.mask)}')"></span>`;
    if (p.logo?.src) return `<img src="${esc(p.logo.src)}" alt="Logo ${esc(p.name)}" />`;
    return p.logo?.svg || `<span class="mono">${esc(p.name.slice(0, 2).toUpperCase())}</span>`;
  };
  const isExternal = (u) => /^https?:\/\//.test(u || "");

  /* Prévia da interface: miniatura (previews.js) ou screenshot real (preview.image) */
  const previews = window.DRAP_PREVIEWS || {};
  const renderPreview = (p) => {
    const cfg = typeof p.preview === "string" ? { key: p.preview } : p.preview || { key: p.id };
    const host = isExternal(p.url) ? new URL(p.url).host : `${p.name} · prévia da interface`;
    let inner = "";
    if (cfg.image) inner = `<img class="pv-shot" src="${esc(cfg.image)}" alt="Tela da plataforma ${esc(p.name)}" loading="lazy" />`;
    else if (previews[cfg.key]) inner = `<div class="pv-stage" aria-hidden="true">${previews[cfg.key]()}</div>`;
    else return "";
    return `
        <div class="card__preview">
          <div class="pv-frame">
            <div class="pv-bar" aria-hidden="true"><i></i><i></i><i></i><span>${esc(host)}</span></div>
            <div class="pv-viewport" role="img" aria-label="Prévia da interface da plataforma ${esc(p.name)}">${inner}</div>
          </div>
        </div>`;
  };

  grid.innerHTML = platforms
    .map((p) => {
      const primary = p.palette[0];
      const swatches = p.palette
        .map(
          (c) =>
            `<button class="swatch" style="background:${c};--sw-fg:${isLight(c) ? "#06070a" : "#ffffff"}" data-hex="${c}" aria-label="Copiar cor ${c}" title="Copiar ${c}"><span>${c.toUpperCase()}</span></button>`
        )
        .join("");
      return `
      <article class="card reveal" data-href="/plataformas/${esc(p.id)}" data-cat="${esc(p.category)}" style="--c:${primary};--c-rgb:${hexToRgb(primary).join(",")};--c-strong:${strongOf(primary)};--c-soft:${softOf(primary)};--c-on:${isLight(primary) ? "#06070a" : "#ffffff"}">
        <div class="card__orb" aria-hidden="true"></div>
        <div class="card__grid"></div>
        <i class="card__tick card__tick--tl"></i><i class="card__tick card__tick--tr"></i>
        <i class="card__tick card__tick--bl"></i><i class="card__tick card__tick--br"></i>
${renderPreview(p)}
        <div class="card__top">
          <div class="card__logo">${renderLogo(p)}</div>
          <div class="card__meta">
            <span class="card__code">${esc(p.code)}</span>
            <span class="badge">${esc(p.status)}</span>
          </div>
        </div>

        <div class="card__cat">${esc(p.category)}</div>
        <h3 class="card__name"><a href="/plataformas/${esc(p.id)}">${esc(p.name)}</a></h3>
        <p class="card__tagline">${esc(p.tagline)}</p>
        <p class="card__summary">${esc(p.summary)}</p>

        <ul class="card__features">${p.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>

        <div class="palette">
          <div class="palette__head"><span>Paleta oficial</span><span>${p.palette.length} cores · clique p/ copiar</span></div>
          <div class="palette__bar">${swatches}</div>
        </div>

        <div class="card__foot">
          <div class="stack">${p.stack.map((s) => `<span>${esc(s)}</span>`).join("")}</div>
          <a class="card__link" href="/plataformas/${esc(p.id)}" aria-label="Conhecer a plataforma ${esc(p.name)}">Conhecer <i>→</i></a>
        </div>
      </article>`;
    })
    .join("");

  /* ---------- escala das miniaturas ---------- */
  const fitStages = new ResizeObserver((entries) =>
    entries.forEach((en) => en.target.style.setProperty("--s", (en.contentRect.width / 560).toFixed(4)))
  );
  $$(".pv-viewport", grid).forEach((vp) => fitStages.observe(vp));

  /* ---------- filtros ---------- */
  const filtersEl = $("#filters");
  const cats = ["Todas", ...new Set(platforms.map((p) => p.category))];
  filtersEl.innerHTML = cats
    .map((c, i) => {
      const n = c === "Todas" ? platforms.length : platforms.filter((p) => p.category === c).length;
      return `<button class="filter${i === 0 ? " is-active" : ""}" role="tab" aria-selected="${i === 0}" data-cat="${esc(c)}">${esc(c)}<b>${String(n).padStart(2, "0")}</b></button>`;
    })
    .join("");
  filtersEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter");
    if (!btn) return;
    $$(".filter", filtersEl).forEach((b) => { b.classList.toggle("is-active", b === btn); b.setAttribute("aria-selected", b === btn); });
    const cat = btn.dataset.cat;
    $$(".card", grid).forEach((card) => card.classList.toggle("is-hidden", cat !== "Todas" && card.dataset.cat !== cat));
  });

  /* ---------- glow que segue o cursor ---------- */
  grid.addEventListener("pointermove", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  });

  /* ---------- copiar cor ---------- */
  const toast = $("#toast");
  let toastT;
  const showToast = (html) => {
    toast.innerHTML = html;
    toast.classList.add("is-on");
    clearTimeout(toastT);
    toastT = setTimeout(() => toast.classList.remove("is-on"), 1800);
  };
  grid.addEventListener("click", async (e) => {
    const sw = e.target.closest(".swatch");
    if (sw) {
      const hex = sw.dataset.hex.toUpperCase();
      try { await navigator.clipboard.writeText(hex); } catch {}
      showToast(`<i style="background:${hex}"></i> ${hex} copiado`);
      return;
    }
  });

  /* ---------- select do formulário ---------- */
  $("#f-platform").innerHTML =
    `<option value="">Selecione…</option>` +
    platforms.map((p) => `<option value="${esc(p.id)}">${esc(p.name)} — ${esc(p.category)}</option>`).join("") +
    `<option value="sob-medida">Projeto sob medida</option>`;

  /* ---------- formulário ---------- */
  $("#contact-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const status = $("#form-status");
    const btn = form.querySelector('button[type="submit"]');
    const setStatus = (cls, txt) => { status.className = `form__status mono ${cls}`; status.textContent = txt; };
    let ok = true;
    ["name", "email"].forEach((n) => {
      const input = form.elements[n];
      const valid = n === "email" ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim()) : input.value.trim().length > 1;
      input.parentElement.classList.toggle("is-invalid", !valid);
      ok = ok && valid;
    });
    if (!ok) return setStatus("err", "✕ verifique nome e e-mail");

    const v = (n) => form.elements[n].value.trim() || null;
    const choice = v("platform");
    const isPlatform = choice && platforms.some((p) => p.id === choice);
    const params = new URLSearchParams(location.search);
    const utm = ["utm_source", "utm_medium", "utm_campaign"].map((k) => params.get(k)).filter(Boolean).join(" / ");
    const lead = {
      name: v("name"), email: v("email"), phone: v("phone"), company: v("company"),
      platform_id: isPlatform ? choice : null,
      interest: isPlatform ? null : choice,
      message: v("message"),
      source: (window.DRAP_ATTR?.() || utm || document.referrer || "direto").slice(0, 200),
      website: form.elements.website.value, // campo-isca anti-robô (validado no servidor)
    };

    if (!online) {
      setStatus("err", "✕ envio indisponível no momento. Fale conosco pelo e-mail ao lado.");
      return;
    }
    btn.disabled = true; btn.classList.add("is-loading");
    setStatus("", "› enviando…");
    try {
      await api.sendLead(lead);
      setStatus("ok", "✓ solicitação registrada. Retornaremos em até 24h úteis.");
      form.reset();
    } catch (err) {
      setStatus("err", `✕ ${err.message || "não foi possível enviar. Tente novamente."}`);
    } finally {
      btn.disabled = false; btn.classList.remove("is-loading");
    }
  });

  /* ---------- terminal animado ---------- */
  const term = $("#terminal");
  const names = platforms.map((p) => p.id);
  const lines = [
    [`<span class="t-p">drap@cloud</span> <span class="t-m">~</span> $ <span class="t-c">drap deploy --tenant acme --white-label</span>`, 40],
    [`<span class="t-m">› resolvendo catálogo…</span> <span class="t-i">${platforms.length} plataformas</span>`, 0],
    ...names.slice(0, 4).map((n) => [`  <span class="t-ok">✓</span> ${n.padEnd(10, " ")} <span class="t-m">build ok · ${(Math.random() * 3 + 1).toFixed(1)}s</span>`, 0]),
    [`<span class="t-m">› aplicando tema da marca</span>  <span class="t-i">palette.json</span>`, 0],
    [`<span class="t-m">› provisionando</span>  db · cache · cdn · ssl`, 0],
    [`<span class="t-ok">✓ deploy concluído</span> → <span class="t-c">https://acme.drap.app</span>`, 0],
  ];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  async function runTerminal() {
    if (reduced) { term.innerHTML = lines.map((l) => l[0]).join("\n") + "\n"; return; }
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    while (true) {
      term.innerHTML = "";
      for (const [html, typeSpeed] of lines) {
        if (typeSpeed) {
          // digita apenas o comando (texto puro após o "$ ")
          const tmp = document.createElement("div"); tmp.innerHTML = html;
          const full = tmp.textContent; const prefixEnd = full.indexOf("$ ") + 2;
          const prefixHtml = html.slice(0, html.indexOf("$ ") + 2);
          const cmd = full.slice(prefixEnd);
          for (let i = 0; i <= cmd.length; i++) {
            term.innerHTML = `${prefixHtml}<span class="t-c">${esc(cmd.slice(0, i))}</span><span class="caret"></span>`;
            await sleep(typeSpeed);
          }
          term.innerHTML = html + "\n";
          await sleep(350);
        } else {
          term.innerHTML += html + "\n";
          await sleep(320);
        }
      }
      term.innerHTML += `<span class="t-p">drap@cloud</span> <span class="t-m">~</span> $ <span class="caret"></span>`;
      await sleep(5200);
    }
  }
  runTerminal();
  setInterval(() => { $("#latency").textContent = 9 + Math.floor(Math.random() * 8); }, 1400);

  /* ---------- contadores ---------- */
  const countUp = (el) => {
    const target = parseFloat(el.dataset.count);
    const dec = +(el.dataset.decimals || 0);
    const t0 = performance.now(), dur = 1400;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = (target * e).toFixed(dec).replace(".", ",");
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const statPlatforms = $('[data-count="6"]');
  if (statPlatforms) statPlatforms.dataset.count = platforms.length;

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("is-in");
      $$("[data-count]", en.target).forEach(countUp);
      io.unobserve(en.target);
    }),
    { threshold: 0.12 }
  );
  $$(".reveal").forEach((el, i) => {
    el.style.transitionDelay = `${(i % 3) * 80}ms`;
    io.observe(el);
  });

  /* ---------- nav ---------- */
  const nav = $(".nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", scrollY > 10);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  $(".nav__burger").addEventListener("click", (e) => {
    const open = nav.classList.toggle("is-open");
    e.currentTarget.setAttribute("aria-expanded", open);
  });
  $$(".nav__links a").forEach((a) => a.addEventListener("click", () => nav.classList.remove("is-open")));

  const sections = $$("main section[id]");
  const spy = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      $$(".nav__links a").forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${en.target.id}`));
    }),
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => spy.observe(s));

  /* ---------- atalho ⌘K / Ctrl+K → contato ---------- */
  addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      $("#contato").scrollIntoView({ behavior: "smooth" });
      setTimeout(() => $("#f-name").focus({ preventScroll: true }), 600);
    }
  });

  /* ---------- tema claro / escuro ---------- */
  const root = document.documentElement;
  const toggle = $("#theme-toggle");
  const metaTheme = $('meta[name="theme-color"]');
  const syncTheme = () => {
    const dark = root.getAttribute("data-theme") === "dark";
    toggle.setAttribute("aria-pressed", dark);
    toggle.setAttribute("aria-label", dark ? "Ativar tema claro" : "Ativar tema escuro");
    metaTheme.setAttribute("content", dark ? "#06070a" : "#f5f3ee");
  };
  toggle.addEventListener("click", () => {
    const dark = root.getAttribute("data-theme") !== "dark";
    root.classList.add("theme-anim");
    if (dark) root.setAttribute("data-theme", "dark"); else root.removeAttribute("data-theme");
    try { localStorage.setItem("drap-theme", dark ? "dark" : "light"); } catch {}
    syncTheme();
    setTimeout(() => root.classList.remove("theme-anim"), 600);
  });
  syncTheme();

  $("#year").textContent = new Date().getFullYear();
})();
