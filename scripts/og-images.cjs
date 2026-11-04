// Gera as imagens de compartilhamento (Open Graph, 1200×630) em public/assets/og/.
// Uso (precisa do Playwright com Chromium instalado na máquina): node scripts/og-images.cjs
// Rode de novo quando mudar nome, frase, paleta ou logo de uma plataforma.
const { chromium } = require("playwright");
const { readFileSync, mkdirSync } = require("node:fs");
const { join } = require("node:path");
const vm = require("node:vm");

const root = join(__dirname, "..");
const load = (file, key) => { const ctx = { window: {} }; vm.runInNewContext(readFileSync(join(root, file), "utf8"), ctx); return ctx.window[key]; };
const platforms = load("public/platforms.js", "DRAP_PLATFORMS");
const details = load("public/platform-details.js", "DRAP_DETAILS");
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const DRAP = '<svg viewBox="0 0 778 781" fill="currentColor"><path d="M0 0H533L212 781H0Z"/><path d="M581 2C601 2 777 60 777 290V480C777 675 652 781 512 781H219Z"/></svg>';
const lum = (h) => { const n = parseInt(h.slice(1), 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; };

const page = ({ bg, deep, accent, kicker, title, sub, logo, chips = [], fonts }) => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&family=${encodeURIComponent(fonts.display).replace(/%20/g, "+")}:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box}body{margin:0;width:1200px;height:630px;overflow:hidden;font-family:'Inter Tight',sans-serif;color:#FBF7F2;
background:radial-gradient(90% 120% at 100% 0%, ${accent}55, transparent 60%), linear-gradient(150deg, ${bg}, ${deep});position:relative}
.wm{position:absolute;right:-90px;bottom:-120px;width:620px;opacity:.07;color:#FBF7F2}.wm svg{width:100%}
.top{position:absolute;left:72px;right:72px;top:56px;display:flex;align-items:center;justify-content:space-between}
.brand{display:flex;align-items:center;gap:14px}.brand svg{width:44px;height:44px;color:#FBF7F2}
.brand b{font-size:24px;letter-spacing:.24em}.brand small{display:block;font:11px 'JetBrains Mono';letter-spacing:.16em;opacity:.7}
.plat{display:flex;align-items:center;gap:12px;padding:8px 18px 8px 8px;border-radius:16px;background:rgba(251,247,242,.12);border:1px solid rgba(251,247,242,.22)}
.plat i{width:44px;height:44px;border-radius:11px;background:#FBF7F2;color:${bg};display:grid;place-items:center}.plat i svg{width:26px;height:26px}
.plat span{font:500 20px 'Inter Tight'}
.body{position:absolute;left:72px;right:140px;top:190px}
.k{font:500 15px 'JetBrains Mono';letter-spacing:.18em;text-transform:uppercase;color:${accent}}
h1{font:400 66px/1.04 '${fonts.display}', 'Instrument Serif', serif;margin:18px 0 18px;letter-spacing:-.01em}
p{font-size:24px;line-height:1.4;opacity:.85;margin:0;max-width:900px}
.chips{position:absolute;left:72px;bottom:56px;display:flex;gap:10px;flex-wrap:wrap;max-width:1000px}
.chips span{font:500 16px 'Inter Tight';padding:9px 16px;border-radius:30px;background:rgba(251,247,242,.12);border:1px solid rgba(251,247,242,.2)}
.bar{position:absolute;left:0;right:0;bottom:0;height:8px;background:${accent}}
</style></head><body>
<div class="wm">${DRAP}</div>
<div class="top"><div class="brand">${DRAP}<div><b>DRAP</b><small>SOFTWAREHOUSE &amp; BUSINESS</small></div></div>${logo ? `<div class="plat"><i>${logo}</i><span>${esc(kicker.name)}</span></div>` : ""}</div>
<div class="body"><div class="k">${esc(kicker.text)}</div><h1>${esc(title)}</h1>${sub ? `<p>${esc(sub)}</p>` : ""}</div>
<div class="chips">${chips.map((c) => `<span>${esc(c)}</span>`).join("")}</div><div class="bar"></div>
</body></html>`;

const FONTS = { backoffice: "Cormorant Garamond", professor: "Playfair Display", fazenda: "Fraunces", pecuaria: "Fraunces", office: "Inter", concord: "Fraunces" };

(async () => {
  const out = join(root, "public/assets/og");
  mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  const shot = async (name, html) => { await p.setContent(html); await p.waitForTimeout(1200); await p.screenshot({ path: join(out, `${name}.jpg`), type: "jpeg", quality: 84 }); console.log("og:", name); };
  const brand = { bg: "#024C5E", deep: "#01313D", accent: "#D9B97F", fonts: { display: "Instrument Serif" } };

  await shot("drap", page({ ...brand, kicker: { text: "Software house brasileira" }, title: "Plataformas prontas. Engenharia sob medida.",
    sub: "Produtos maduros para operar a sua empresa e desenvolvimento do zero, com proposta na hora.", chips: platforms.map((x) => x.name.replace(/^DRAP\s*/i, "")) }));
  await shot("portfolio", page({ ...brand, kicker: { text: "Portfólio DRAP" }, title: "Software que já está em operação.",
    sub: "O desafio de cada setor, o que construímos e o que muda para quem usa.", chips: [...new Set(platforms.map((x) => x.category))] }));
  await shot("sob-medida", page({ ...brand, kicker: { text: "S/03 · Desenvolvimento sob medida" }, title: "A plataforma que a sua empresa precisa, do zero.",
    sub: "Descreva em 5 minutos e receba a proposta com escopo, módulos, cronograma e investimento.", chips: ["Discovery", "UX/UI", "Entrega contínua", "Integrações"] }));

  for (const x of platforms) {
    const pal = x.palette, primary = pal[0];
    const accent = pal.slice(1).find((h) => lum(h) > 0.45 && lum(h) < 0.9) || "#E8E2D6";
    const deep = pal.slice().sort((a, c) => lum(a) - lum(c))[0];
    await shot(x.id, page({ bg: primary, deep: lum(deep) < lum(primary) ? deep : "#0B0D12", accent, fonts: { display: FONTS[x.id] || "Instrument Serif" },
      kicker: { text: x.category, name: x.name }, logo: x.logo?.svg, title: details[x.id]?.headline || x.tagline, chips: x.features }));
  }
  await b.close();
})();
