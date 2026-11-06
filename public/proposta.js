/* DRAP — Proposta comercial (/proposta/<token>) gerada a partir de /api/proposals */
(async () => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const icon = (n, cls) => window.DRAP_ICON(n, cls);
  const brl = (n) => "R$ " + Math.round(Number(n) || 0).toLocaleString("pt-BR");
  const date = (d) => new Date(String(d).slice(0, 10) + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  const MARK = '<svg viewBox="0 0 778 781" aria-hidden="true"><path d="M0 0H533L212 781H0Z"/><path d="M581 2C601 2 777 60 777 290V480C777 675 652 781 512 781H219Z"/></svg>';
  const main = $("#pp");
  let toastT;
  const toast = (t) => { const el = $("#pp-toast"); el.textContent = t; el.classList.add("is-on"); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove("is-on"), 2400); };

  const token = (location.pathname.match(/\/proposta\/([A-Za-z0-9_-]{24,64})/) || [])[1] || new URLSearchParams(location.search).get("t") || "";
  const modelId = (location.pathname.match(/\/proposta\/modelo\/([a-z0-9-]{2,40})/) || [])[1] || "";
  const autoPrint = new URLSearchParams(location.search).has("print");

  const fail = (title, text) => {
    main.removeAttribute("aria-busy");
    main.innerHTML = `<section class="pp-empty">${MARK}<p class="pp-k">DRAP · PROPOSTA</p><h1>${title}</h1><p>${text}</p><a class="pp-btn pp-btn--petrol" href="/">Ir para o site da DRAP</a></section>`;
  };
  if (!token && !modelId) return fail("Link incompleto", "Confira se o endereço foi copiado inteiro.");

  let P;
  try {
    const res = await fetch(modelId ? `/api/proposals?model=${modelId}` : `/api/proposals?token=${encodeURIComponent(token)}`, { credentials: "same-origin" });
    const body = await res.json().catch(() => ({}));
    if (res.status === 202) return fail("Sua proposta está em análise", `Olá, ${esc(String(body.client?.name || "").split(" ")[0])}! A equipe da DRAP está revisando o escopo do pedido ${esc(body.number || "")}. Você recebe um e-mail assim que ela for liberada.`);
    if (!res.ok) return fail("Proposta não encontrada", esc(body.error || "O link pode ter expirado ou sido digitado errado."));
    P = body;
  } catch { return fail("Sem conexão", "Não conseguimos carregar a proposta agora. Tente novamente em instantes."); }

  /* ---------- tema: paleta, fontes e logo da plataforma do catálogo ----------
     A marca, o logo e a marca d'água continuam sendo os da DRAP; só a paleta e a
     tipografia passam a ser as do produto vendido. */
  const PL = P.platform && Array.isArray(P.platform.palette) && P.platform.palette.length ? P.platform : null;
  const rgb = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const hex = (c) => "#" + c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
  const mixH = (a, b, k) => hex(rgb(a).map((v, i) => v + (rgb(b)[i] - v) * k));
  const lum = (h) => { const [r, g, b] = rgb(h); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };
  const sat = (h) => { const c = rgb(h).map((v) => v / 255), mx = Math.max(...c), mn = Math.min(...c), l = (mx + mn) / 2; return mx === mn ? 0 : (mx - mn) / (1 - Math.abs(2 * l - 1)); };
  const dist = (a, b) => Math.hypot(...rgb(a).map((v, i) => v - rgb(b)[i])) / 441;
  function applyTheme(pl) {
    const pal = pl.palette.filter((h) => /^#[0-9a-f]{6}$/i.test(h));
    const primary = pal[0];
    const darkest = [...pal].sort((a, b) => lum(a) - lum(b))[0], lightest = [...pal].sort((a, b) => lum(b) - lum(a))[0];
    const ink = lum(darkest) < 0.2 ? darkest : "#121419";
    const paper = lum(lightest) > 0.86 ? lightest : mixH(primary, "#ffffff", 0.95);
    // destaque: a cor da paleta mais distante da primária (e mais viva); senão, a primária clareada
    const cands = pal.slice(1).filter((h) => lum(h) > 0.12 && lum(h) < 0.86).map((h) => ({ h, sc: dist(h, primary) * (0.5 + sat(h)) })).sort((a, b) => b.sc - a.sc);
    let accent = cands[0] && dist(cands[0].h, primary) > 0.18 ? cands[0].h : mixH(primary, "#ffffff", 0.4);
    let light = accent; while (lum(light) < 0.62) light = mixH(light, "#ffffff", 0.18);
    let text = accent; while (lum(text) > 0.42) text = mixH(text, "#000000", 0.18);
    const deep = lum(primary) > 0.3 ? mixH(primary, ink, 0.55) : mixH(primary, ink, 0.4);
    const v = {
      "--petrol": primary, "--petrol-2": deep, "--petrol-3": mixH(primary, "#ffffff", 0.18), "--petrol-tint": mixH(primary, "#ffffff", 0.9),
      "--cream": paper, "--paper": mixH(paper, "#ffffff", 0.6), "--sand": mixH(paper, primary, 0.07),
      "--line": mixH(paper, ink, 0.12), "--line-2": mixH(paper, ink, 0.07),
      "--gold": accent, "--gold-2": light, "--gold-text": text, "--ink": ink,
      "--dim": mixH(ink, paper, 0.3), "--mute": mixH(ink, paper, 0.5),
    };
    const root = document.documentElement.style;
    for (const [k, val] of Object.entries(v)) root.setProperty(k, val);
    const f = pl.fonts || {};
    if (f.display || f.sans) {
      const fam = [...new Set([f.display, f.sans].filter(Boolean))].map((x) => `family=${encodeURIComponent(x).replace(/%20/g, "+")}:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500`).join("&");
      document.head.append(Object.assign(document.createElement("link"), { rel: "stylesheet", href: `https://fonts.googleapis.com/css2?${fam}&display=swap` }));
      if (f.display) root.setProperty("--serif", `"${f.display}", Georgia, serif`);
      if (f.sans) root.setProperty("--sans", `"${f.sans}", system-ui, sans-serif`);
    }
    document.body.classList.add("pp--platform", `pp--${pl.id}`);
    $('meta[name="theme-color"]')?.setAttribute("content", primary);
  }
  if (PL) applyTheme(PL);
  const PLOGO = PL?.logo_svg || "";
  const plName = PL ? PL.name : "";

  /* ---------- estado e totais (mesma regra do servidor) ---------- */
  const decided = ["aceita", "recusada"].includes(P.status);
  const expired = new Date(P.valid_until + "T23:59:59") < new Date();
  const chosen = new Set(decided && P.accepted_keys ? P.accepted_keys : P.items.filter((i) => i.kind === "module" && i.selected).map((i) => i.key));
  const core = P.items.filter((i) => i.kind === "core");
  const mods = P.items.filter((i) => i.kind === "module");
  function totals() {
    const sel = [...core, ...mods.filter((m) => chosen.has(m.key))];
    const sum = (f) => sel.reduce((a, i) => a + (Number(f(i)) || 0), 0);
    const gross = sum((i) => i.setup), discount = Math.round(gross * P.discount_pct / 100);
    return {
      core: core.reduce((a, i) => a + i.setup, 0), modules: gross - core.reduce((a, i) => a + i.setup, 0),
      gross, discount, setup: gross - discount, monthly: sum((i) => i.monthly),
      market: P.show_market ? { setup: sum((i) => i.market?.setup), monthly: sum((i) => i.market?.monthly) } : null,
    };
  }

  const company = P.client.company || P.client.name;
  document.title = `${P.title} · Proposta ${P.number} · DRAP`;
  if (P.model) { $("#pp-copy").hidden = true; }

  /* ---------- ilustração: como a plataforma funciona ---------- */
  function architecture() {
    const targets = core.filter((i) => ["mobile", "desktop", "offline"].includes(i.key));
    const devices = [{ icon: "desktop", name: "Web" }, ...targets.map((t) => ({ icon: t.icon, name: t.key === "mobile" ? "App" : t.key === "desktop" ? "Windows" : "Offline" }))];
    const feats = core.filter((i) => !["nucleo", "mobile", "desktop", "offline", "implantacao", "licenca"].includes(i.key)).slice(0, 6);
    const integ = mods.slice(0, 6);
    const W = 880, H = Math.max(330, 70 + integ.length * 58);
    const cx = 330, cw = 230, cy = 40, ch = H - 80;
    const node = (x, y, w, h, ic, label, sub, cls) => `
      <g class="${cls}" transform="translate(${x} ${y})">
        <rect width="${w}" height="${h}" rx="12"/>
        <g transform="translate(14 ${h / 2 - 11}) scale(.92)">${icon(ic, "a-ic").replace("<svg", '<svg width="24" height="24"')}</g>
        <text x="48" y="${sub ? h / 2 - 3 : h / 2 + 5}" class="a-t">${esc(label)}</text>
        ${sub ? `<text x="48" y="${h / 2 + 14}" class="a-s">${esc(sub)}</text>` : ""}
      </g>`;
    const curve = (x1, y1, x2, y2, cls) => `<path class="${cls}" d="M${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}"/>`;
    const people = [{ ic: "team", t: "Sua equipe", s: "gestão e operação" }, { ic: "portal", t: "Seus clientes", s: "portal e atendimento" }];
    const leftY = (i, n, h) => H / 2 - (n * h + (n - 1) * 14) / 2 + i * (h + 14);
    let svg = `<svg class="pp-arch" viewBox="0 0 ${W} ${H}" role="img" aria-label="Diagrama: usuários acessam a plataforma, que se conecta aos módulos e integrações">`;
    // pessoas
    people.forEach((p, i) => { const y = leftY(i, 2, 58); svg += curve(200, y + 29, cx, H / 2, "a-link"); svg += node(0, y, 200, 58, p.ic, p.t, p.s, "a-node"); });
    // integrações
    integ.forEach((m, i) => {
      const y = leftY(i, integ.length, 46), on = chosen.has(m.key);
      svg += curve(cx + cw, H / 2, 640, y + 23, on ? "a-link a-link--on" : "a-link a-link--opt");
      svg += node(640, y, 240, 46, m.icon, m.name.length > 24 ? m.name.slice(0, 23) + "…" : m.name, "", on ? "a-node a-node--on" : "a-node a-node--opt");
    });
    // plataforma
    svg += `<g transform="translate(${cx} ${cy})"><rect class="a-core" width="${cw}" height="${ch}" rx="18"/>
      ${PLOGO ? `<g class="a-plogo">${PLOGO.replace("<svg", '<svg x="20" y="22" width="26" height="27"')}</g>`
        : `<g transform="translate(20 22) scale(.034)" class="a-mark"><path d="M0 0H533L212 781H0Z"/><path d="M581 2C601 2 777 60 777 290V480C777 675 652 781 512 781H219Z"/></g>`}
      <text x="56" y="38" class="a-ct">${esc((PL ? PL.name.replace(/^DRAP\s*/i, "") : (P.title || "Plataforma").replace(/^Plataforma\s*/i, "")).slice(0, 18) || "Sua plataforma")}</text>
      <text x="56" y="54" class="a-cs">${PL ? esc(PL.category.toUpperCase().slice(0, 26)) : "PLATAFORMA DRAP"}</text>
      ${feats.map((f, i) => `<g transform="translate(20 ${82 + i * 30})"><circle cx="5" cy="-4" r="3" class="a-dot"/><text x="16" y="0" class="a-cf">${esc(f.name.length > 26 ? f.name.slice(0, 25) + "…" : f.name)}</text></g>`).join("")}
      <g transform="translate(20 ${ch - 36})">${devices.map((d, i) => `<g transform="translate(${i * 48} 0)"><rect width="40" height="22" rx="6" class="a-dev"/><text x="20" y="15" class="a-dt">${esc(d.name)}</text></g>`).join("")}</g>
    </g>`;
    svg += `</svg>`;
    return svg;
  }

  /* ---------- ilustração: valor DRAP x média de mercado ---------- */
  function valueChart(t) {
    if (!t.market || !t.market.setup) return "";
    const max = Math.max(t.market.setup, t.setup);
    const save = t.market.setup - t.setup, pct = Math.round((save / t.market.setup) * 100);
    const bar = (label, v, cls) => `<div class="pp-vbar ${cls}"><span>${label}</span><i style="--w:${(v / max) * 100}%"><b>${brl(v)}</b></i></div>`;
    return `<figure class="pp-value">
      <figcaption><span class="pp-k">COMPARATIVO DE INVESTIMENTO</span><strong>${save > 0 ? `${pct}% abaixo da média de mercado` : "Alinhado à média de mercado"}</strong>
        <small>Média de mercado calculada a partir de software houses e SaaS que entregam o mesmo escopo no Brasil.</small></figcaption>
      ${bar("Média de mercado", t.market.setup, "pp-vbar--mkt")}
      ${bar("DRAP", t.setup, "pp-vbar--drap")}
      ${t.market.monthly ? `<p class="pp-value__m">Mensalidade: <b>${brl(t.monthly)}</b> na DRAP contra <b>${brl(t.market.monthly)}</b> em média.</p>` : ""}
    </figure>`;
  }

  /* ---------- cronograma ---------- */
  function timeline() {
    const w = P.weeks;
    const steps = PL?.steps?.length ? PL.steps : null;
    const ph = steps ? steps.map((st, i, a) => [esc(st.title), i / a.length * 0.92, Math.min(1, (i + 1) / a.length * 0.92 + (i === a.length - 1 ? 0.08 : 0.06)), esc(st.text.length > 90 ? st.text.slice(0, 88) + "…" : st.text)]) : [
      ["Imersão e escopo", 0, 0.12, "Entrevistas, fluxos e protótipo navegável."],
      ["Design da interface", 0.08, 0.3, "Telas com a sua identidade visual."],
      ["Desenvolvimento", 0.22, 0.82, "Entregas quinzenais para você acompanhar."],
      ["Integrações e testes", 0.62, 0.92, "Módulos conectados e homologação."],
      ["Treinamento e go-live", 0.88, 1, "Equipe treinada e plataforma no ar."],
    ];
    const wk = (f) => Math.max(1, Math.round(f * w));
    const range = (a, b) => { const s = a === 0 ? 1 : Math.min(w, wk(a) + 1), e = Math.max(s, wk(b)); return s === e ? `sem. ${s}` : `sem. ${s}–${e}`; };
    return `<div class="pp-gantt" style="--weeks:${w}">
      <div class="pp-gantt__scale">${Array.from({ length: 5 }, (_, i) => `<span style="left:${i * 25}%">Sem. ${Math.max(1, Math.round((i * w) / 4))}</span>`).join("")}</div>
      ${ph.map(([n, a, b, d], i) => `<div class="pp-gantt__row">
        <div class="pp-gantt__lbl"><b>${String(i + 1).padStart(2, "0")}</b> ${n}<small>${d}</small></div>
        <div class="pp-gantt__track"><i style="left:${a * 100}%;width:${(b - a) * 100}%"><span>${range(a, b)}</span></i></div>
      </div>`).join("")}
    </div>`;
  }

  const ALWAYS = [
    ["cloud", "Hospedagem em nuvem", "Servidores no Brasil, com escala automática."],
    ["shield", "Segurança e LGPD", "Criptografia, backups diários e controle de acesso."],
    ["support", "Suporte especializado", "Atendimento por chamado, e-mail e WhatsApp."],
    ["sync", "Atualizações contínuas", "Melhorias e correções sem custo extra."],
    ["team", "Treinamento da equipe", "Sessões ao vivo e material de apoio gravado."],
    ["chart", "Monitoramento 24/7", "Disponibilidade de 99,9% com alertas em tempo real."],
  ];

  const typeLabel = { gestao: "Sistema de gestão interna", portal: "Portal para clientes ou parceiros", saas: "SaaS para revender", marketplace: "Marketplace ou e-commerce", app: "Aplicativo de serviços", outro: "Plataforma sob medida" };
  const currentLabel = { planilhas: "Hoje em planilhas", papel: "Hoje em papel", sistema: "Sistema atual não atende", varios: "Sistemas desconectados", nada: "Processo novo" };
  const goalLabel = { organizar: "Organizar a operação", vender: "Vender mais", automatizar: "Automatizar tarefas", clientes: "Experiência do cliente", dados: "Decisões com dados", escalar: "Escalar sem aumentar a equipe", produto: "Lançar um produto digital" };
  const usersLabel = { "ate-10": "Até 10 usuários", "11-50": "11 a 50 usuários", "51-200": "51 a 200 usuários", "201-1000": "201 a 1.000 usuários", "1000+": "Mais de 1.000 usuários" };

  /* ---------- render ---------- */
  const sec = (n, k, title, body, cls = "") => `<section class="pp-sec ${cls}"><header class="pp-sec__h"><span class="pp-sec__n">${n}</span><div><p class="pp-k">${k}</p><h2>${title}</h2></div></header>${body}</section>`;
  const chips = [P.brief.segment, typeLabel[P.brief.type], currentLabel[P.brief.current], usersLabel[P.brief.users], ...P.brief.goals.map((g) => goalLabel[g])].filter(Boolean);

  function modCard(m) {
    const on = chosen.has(m.key);
    return `<article class="pp-mod${on ? " is-on" : ""}" data-key="${esc(m.key)}">
      <span class="pp-ic">${icon(m.icon)}</span>
      <div class="pp-mod__tx"><h4>${esc(m.name)}</h4><p>${esc(m.description)}</p></div>
      <div class="pp-mod__price"><b>${brl(m.setup)}</b><small>${m.monthly ? `+ ${brl(m.monthly)}/mês` : "pagamento único"}</small></div>
      <label class="pp-switch"${decided || expired ? ' data-locked=""' : ""}>
        <input type="checkbox" ${on ? "checked" : ""} ${decided || expired ? "disabled" : ""} aria-label="Incluir ${esc(m.name)}" />
        <span class="pp-switch__ui"></span><span class="pp-switch__lbl">${on ? "Incluído" : "Adicionar"}</span>
      </label>
    </article>`;
  }

  function investment() {
    const t = totals();
    return `<div class="pp-inv">
      <div class="pp-inv__table">
        <table>
          <thead><tr><th>Item</th><th>Implantação</th><th>Mensal</th></tr></thead>
          <tbody>
            <tr><td><b>${PL ? `${esc(PL.name)}` : "Plataforma base"}</b><small>${PL ? "implantação e licença, com todos os módulos do produto" : `${core.length} ${core.length === 1 ? "item" : "itens"} do escopo principal`}</small></td><td>${brl(t.core)}</td><td>${brl(core.reduce((a, i) => a + i.monthly, 0))}</td></tr>
            ${mods.filter((m) => chosen.has(m.key)).map((m) => `<tr><td>${esc(m.name)}<small>módulo adicional</small></td><td>${brl(m.setup)}</td><td>${brl(m.monthly)}</td></tr>`).join("")}
            ${t.discount ? `<tr class="pp-inv__disc"><td>Desconto comercial (${String(P.discount_pct).replace(".", ",")}%)</td><td>− ${brl(t.discount)}</td><td>—</td></tr>` : ""}
          </tbody>
          <tfoot><tr><td>Investimento total</td><td>${brl(t.setup)}</td><td>${brl(t.monthly)}<small>/mês</small></td></tr></tfoot>
        </table>
        <div class="pp-terms"><span class="pp-k">CONDIÇÕES DE PAGAMENTO</span><p>${esc(P.payment_terms)}</p></div>
      </div>
      ${valueChart(t)}
    </div>`;
  }

  function render() {
    const t = totals();
    main.removeAttribute("aria-busy");
    main.innerHTML = `
      ${P.model ? `<div class="pp-preview">Modelo da proposta padrão do <b>${esc(plName)}</b>, com valores de referência para 11 a 50 usuários. Para enviar a um cliente: Painel → Propostas → Nova proposta.</div>` : P.preview ? `<div class="pp-preview">Pré-visualização da equipe DRAP · status: <b>${esc(P.status.replace("_", " "))}</b>. O cliente ${["em_analise", "rascunho"].includes(P.status) ? "ainda não vê esta proposta" : "vê esta mesma página"}.</div>` : ""}
      <header class="pp-cover">
        <div class="pp-cover__wm" aria-hidden="true">${MARK}</div>
        <div class="pp-cover__top">
          <div class="pp-logo">${MARK}<span><strong>DRAP</strong><small>SoftwareHouse<em>&amp;</em>Business</small></span></div>
          <dl class="pp-cover__meta">
            <div><dt>Proposta</dt><dd>${esc(P.number)}</dd></div>
            <div><dt>Emitida em</dt><dd>${date(P.sent_at || P.created_at)}</dd></div>
            <div><dt>Válida até</dt><dd>${date(P.valid_until)}</dd></div>
          </dl>
        </div>
        <div class="pp-cover__body">
          ${PL ? `<div class="pp-plat"><span class="pp-plat__logo">${PLOGO}</span><span><small>${esc(PL.category)}</small><b>${esc(PL.name)}</b></span></div>` : ""}
          <p class="pp-k pp-k--gold">PROPOSTA COMERCIAL · ${PL ? "PLATAFORMA DO CATÁLOGO DRAP" : "PLATAFORMA SOB MEDIDA"}</p>
          <h1>${esc(PL ? PL.headline || P.title : P.title)}</h1>
          <p class="pp-cover__for">Preparada para <b>${esc(P.client.name)}</b>${P.client.company ? ` · ${esc(P.client.company)}` : ""}</p>
        </div>
        <div class="pp-cover__kpis">
          <div><small>Investimento</small><b id="k-setup">${brl(t.setup)}</b></div>
          <div><small>Mensalidade</small><b id="k-monthly">${brl(t.monthly)}</b></div>
          <div><small>${PL ? "Implantação em" : "Prazo estimado"}</small><b>${P.weeks} semanas</b></div>
          <div><small>Módulos</small><b id="k-mods">${core.length + chosen.size}</b></div>
        </div>
      </header>

      ${decided ? `<div class="pp-state pp-state--${P.status}">${P.status === "aceita" ? `${icon("check")} Proposta aceita em ${date(P.decided_at)}. Nossa equipe entra em contato para o contrato e o kick-off.` : "Esta proposta foi recusada. Se mudar de ideia, fale com a gente."}</div>`
        : expired ? `<div class="pp-state pp-state--recusada">Esta proposta expirou em ${date(P.valid_until)}. Fale com a DRAP para atualizar os valores.</div>` : ""}

      ${PL ? sec("01", "SEU DESAFIO", `O que trava a sua <em>operação</em>`, `
        <p class="pp-lead">${esc(P.intro)}</p>
        ${PL.pains?.length ? `<div class="pp-versus"><div class="pp-pains"><span class="pp-k">SEM O ${esc(PL.name.toUpperCase())}</span><ul>${PL.pains.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
          <div class="pp-outs">${(PL.outcomes || []).map((o) => `<article><b>${esc(o.title)}</b><p>${esc(o.text)}</p></article>`).join("")}</div></div>` : ""}`) : sec("01", "SEU DESAFIO", `O que <em>entendemos</em>`, `
        <p class="pp-lead">${esc(P.intro)}</p>
        ${P.brief.description ? `<blockquote class="pp-quote"><span class="pp-k">NAS SUAS PALAVRAS</span>${esc(P.brief.description)}</blockquote>` : ""}
        ${chips.length ? `<ul class="pp-chips">${chips.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>` : ""}`)}

      ${sec("02", "A SOLUÇÃO", PL ? `Como o ${esc(PL.name)} <em>vai funcionar</em>` : `Como a sua plataforma <em>vai funcionar</em>`, `
        <p class="pp-lead">${PL ? `O ${esc(PL.name)} reúne a sua equipe, os seus clientes e as rotinas da operação num só lugar, conectado aos serviços externos que você escolher.` : `Uma plataforma única, com a marca ${esc(company)}, que reúne as pessoas que usam o sistema, as rotinas do negócio e os serviços externos com que ele conversa.`}</p>
        <figure class="pp-fig">${architecture()}
          <figcaption><span><i class="lg lg--on"></i>Integração incluída</span><span><i class="lg lg--opt"></i>Módulo opcional</span></figcaption></figure>`)}

      ${sec("03", "ESCOPO INCLUÍDO", `O que já está <em>integrado</em>`, `
        <p class="pp-lead">${PL ? `Tudo isto já vem no ${esc(PL.name)}, pronto para uso: a implantação configura a plataforma para a sua empresa e a licença mantém tudo funcionando.` : "Estes itens formam a plataforma base e estão no valor de implantação."}</p>
        <div class="pp-grid">${core.map((i) => `<article class="pp-item">
          <span class="pp-ic">${icon(i.icon)}</span><h4>${esc(i.name)}</h4><p>${esc(i.description)}</p>
          <footer>${!i.setup && !i.monthly ? `<span>Incluído</span>` : `<span>${i.setup ? brl(i.setup) : brl(i.monthly) + "/mês"}</span>${i.setup && i.monthly ? `<small>${brl(i.monthly)}/mês</small>` : ""}`}</footer></article>`).join("")}</div>`)}

      ${mods.length ? sec("04", "MÓDULOS ADICIONAIS", `Para <em>ir além</em>`, `
        <p class="pp-lead">${decided ? "Módulos escolhidos no aceite estão marcados como incluídos." : (PL ? "Integrações que ampliam o " + esc(PL.name) + ". Ative as que fizerem sentido: o investimento é recalculado na hora." : "Ative ou desative os módulos abaixo: o investimento é recalculado na hora. Os que você pediu já vêm ativados.")}</p>
        <div class="pp-mods" id="pp-mods">${mods.map(modCard).join("")}</div>`, "pp-sec--mods") : ""}

      ${sec(mods.length ? "05" : "04", "INVESTIMENTO", `Valor da <em>sua plataforma</em>`, `<div id="pp-inv">${investment()}</div>`)}

      ${sec(mods.length ? "06" : "05", "CRONOGRAMA", `Do kick-off ao <em>go-live</em>`, `
        <p class="pp-lead">Prazo estimado de <b>${P.weeks} semanas</b> a partir da assinatura, com entregas parciais para você validar a cada etapa.</p>${timeline()}`)}

      ${sec(mods.length ? "07" : "06", "SEMPRE INCLUSO", `Na mensalidade, <em>sem surpresas</em>`, `
        <div class="pp-always">${ALWAYS.map(([ic, t, d]) => `<div><span class="pp-ic pp-ic--sm">${icon(ic)}</span><b>${t}</b><small>${d}</small></div>`).join("")}</div>`)}

      <section class="pp-sec pp-close" id="aceite">
        <div class="pp-close__copy">
          <p class="pp-k pp-k--gold">PRÓXIMOS PASSOS</p>
          <h2>${PL ? `Vamos colocar o <em>${esc(PL.name)}</em> para rodar na ${esc(company)}?` : `Vamos construir a <em>${esc(company)}</em> digital?`}</h2>
          <ol><li>Você aceita a proposta com os módulos escolhidos.</li><li>Enviamos o contrato para assinatura eletrônica.</li><li>Agendamos o kick-off em até 5 dias úteis.</li></ol>
          ${!decided && !expired && !P.preview ? `<div class="pp-close__act">
            <button type="button" class="pp-btn pp-btn--gold pp-btn--lg" id="pp-accept">Aceitar proposta · <span id="k-accept">${brl(t.setup)}</span></button>
            <button type="button" class="pp-btn pp-btn--link" id="pp-decline">Não tenho interesse agora</button></div>` : ""}
          ${!P.model ? `<div class="pp-meet">
            <p><b>Prefere conversar antes de decidir?</b> Agende uma reunião de negociação, online ou presencial, para revisar escopo, módulos e condições.</p>
            <a class="pp-btn pp-btn--petrol" href="/agendar?proposta=${encodeURIComponent(token)}">Agendar reunião</a></div>` : ""}
        </div>
        <div class="pp-close__contact">
          <p class="pp-k">FALE COM A DRAP</p>
          ${P.contact?.email ? `<a href="mailto:${esc(P.contact.email)}?subject=${encodeURIComponent("Proposta " + P.number)}">${icon("mail")}${esc(P.contact.email)}</a>` : ""}
          ${P.contact?.whatsapp ? `<a href="https://wa.me/${esc(String(P.contact.whatsapp).replace(/\D/g, ""))}" target="_blank" rel="noopener">${icon("chat")}${esc(P.contact.whatsapp)}</a>` : ""}
          ${P.contact?.hours ? `<span>${icon("clock")}${esc(P.contact.hours)}</span>` : ""}
        </div>
        <div class="pp-sign">
          <div><i></i><span>DRAP SoftwareHouse &amp; Business</span></div>
          <div><i></i><span>${esc(company)}</span></div>
        </div>
      </section>

      <footer class="pp-foot">
        <div class="pp-logo pp-logo--sm">${MARK}<span><strong>DRAP</strong><small>SoftwareHouse<em>&amp;</em>Business</small></span></div>
        ${PL ? `<div class="pp-foot__plat"><span class="pp-plat__logo">${PLOGO}</span>${esc(PL.name)}</div>` : ""}
        <p>Proposta ${esc(P.number)} · válida até ${date(P.valid_until)} · Documento confidencial preparado para ${esc(company)}.</p>
      </footer>`;

    $("#pp-num").textContent = `Proposta ${P.number}${PL ? " · " + PL.name : ""}`;
    $("#pp-bar").hidden = false;
    $("#pp-go-accept").hidden = decided || expired || P.preview;
    const mt = $("#pp-meet-top");
    if (mt) { mt.href = `/agendar?proposta=${encodeURIComponent(token)}`; mt.hidden = Boolean(P.model) || P.status === "recusada"; }
  }

  function refresh() {
    const t = totals();
    $("#k-setup").textContent = brl(t.setup);
    $("#k-monthly").textContent = brl(t.monthly);
    $("#k-mods").textContent = core.length + chosen.size;
    if ($("#k-accept")) $("#k-accept").textContent = brl(t.setup);
    $("#pp-inv").innerHTML = investment();
    $$("#pp-mods .pp-mod").forEach((el) => {
      const on = chosen.has(el.dataset.key);
      el.classList.toggle("is-on", on);
      $(".pp-switch__lbl", el).textContent = on ? "Incluído" : "Adicionar";
    });
    const fig = $(".pp-fig .pp-arch"); if (fig) fig.outerHTML = architecture();
  }

  render();

  /* ---------- interações ---------- */
  main.addEventListener("change", (e) => {
    const cb = e.target.closest(".pp-mod input[type=checkbox]"); if (!cb) return;
    const k = cb.closest("[data-key]").dataset.key;
    cb.checked ? chosen.add(k) : chosen.delete(k);
    refresh();
  });

  $("#pp-pdf").addEventListener("click", () => window.print());
  $("#pp-copy").addEventListener("click", async () => {
    const url = location.origin + "/proposta/" + token;
    try { await navigator.clipboard.writeText(url); toast("Link copiado"); }
    catch { prompt("Copie o link da proposta:", url); }
  });

  const dlg = $("#pp-dialog");
  async function respond(body) {
    const res = await fetch(`/api/proposals?token=${encodeURIComponent(token)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Não foi possível registrar agora.");
    return data;
  }
  main.addEventListener("click", (e) => {
    if (e.target.closest("#pp-accept")) {
      const t = totals(), picked = mods.filter((m) => chosen.has(m.key));
      dlg.innerHTML = `<form method="dialog" class="pp-dlg">
        <p class="pp-k pp-k--gold">CONFIRMAR ACEITE</p><h3>${esc(P.title)}</h3>
        <ul><li><span>Plataforma base</span><b>${brl(t.core)}</b></li>${picked.map((m) => `<li><span>${esc(m.name)}</span><b>${brl(m.setup)}</b></li>`).join("")}
          ${t.discount ? `<li><span>Desconto</span><b>− ${brl(t.discount)}</b></li>` : ""}
          <li class="tot"><span>Implantação</span><b>${brl(t.setup)}</b></li><li class="tot"><span>Mensalidade</span><b>${brl(t.monthly)}/mês</b></li></ul>
        <p class="pp-dlg__note">Ao confirmar, a DRAP envia o contrato para assinatura eletrônica. Nenhuma cobrança é feita agora.</p>
        <p class="pp-dlg__err" role="alert"></p>
        <div class="pp-dlg__act"><button value="cancel" class="pp-btn pp-btn--ghost">Voltar</button><button value="ok" class="pp-btn pp-btn--gold" id="dlg-ok">Confirmar aceite</button></div></form>`;
      dlg.showModal();
      $("#dlg-ok").addEventListener("click", async (ev) => {
        ev.preventDefault(); ev.target.disabled = true;
        try {
          await respond({ action: "accept", modules: [...chosen] });
          P.status = "aceita"; P.decided_at = new Date().toISOString(); P.accepted_keys = [...chosen];
          dlg.close(); location.hash = ""; location.reload();
        } catch (err) { $(".pp-dlg__err", dlg).textContent = err.message; ev.target.disabled = false; }
      });
    }
    if (e.target.closest("#pp-decline")) {
      dlg.innerHTML = `<form method="dialog" class="pp-dlg">
        <p class="pp-k">RECUSAR PROPOSTA</p><h3>Pode nos contar o motivo?</h3>
        <textarea id="dlg-reason" rows="4" maxlength="1000" placeholder="Preço, prazo, escopo, momento da empresa… (opcional)"></textarea>
        <p class="pp-dlg__err" role="alert"></p>
        <div class="pp-dlg__act"><button value="cancel" class="pp-btn pp-btn--ghost">Voltar</button><button value="ok" class="pp-btn pp-btn--petrol" id="dlg-ok">Enviar resposta</button></div></form>`;
      dlg.showModal();
      $("#dlg-ok").addEventListener("click", async (ev) => {
        ev.preventDefault(); ev.target.disabled = true;
        try { await respond({ action: "decline", reason: $("#dlg-reason").value }); dlg.close(); location.reload(); }
        catch (err) { $(".pp-dlg__err", dlg).textContent = err.message; ev.target.disabled = false; }
      });
    }
  });

  if (autoPrint) { await document.fonts?.ready; setTimeout(() => window.print(), 300); }
})();
