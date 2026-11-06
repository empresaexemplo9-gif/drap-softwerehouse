// SEO e compartilhamento, gerados no build (sem depender do banco):
// - <head> de cada página com canonical, Open Graph, Twitter Card e JSON-LD
// - uma página estática por plataforma (/plataformas/<id>) com título, descrição,
//   imagem de compartilhamento e dados estruturados próprios (o Google e o WhatsApp
//   leem o HTML sem rodar JavaScript)
// - sitemap.xml e robots.txt
// Endereço público: SITE_URL, ou o domínio de produção da Vercel.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const clip = (s, n) => { s = String(s || "").replace(/\s+/g, " ").trim(); return s.length > n ? s.slice(0, n - 1).replace(/\s\S*$/, "") + "…" : s; };

export function siteUrl() {
  const raw = process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "https://drap-softwerehouse.vercel.app");
  return raw.replace(/\/+$/, "");
}

function load(file, key) {
  const ctx = { window: {} };
  vm.runInNewContext(readFileSync(file, "utf8"), ctx);
  return ctx.window[key];
}

// Substitui <title> e a meta description e acrescenta as tags sociais antes de </head>
function withHead(html, { title, description, path, image, type = "website", jsonld = [], noindex = false }, base) {
  const url = base + path;
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  if (/<meta name="description"[^>]*>/.test(html)) html = html.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(description)}" />`);
  else html = html.replace("</title>", `</title>\n  <meta name="description" content="${esc(description)}" />`);
  const tags = [
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:site_name" content="DRAP SoftwareHouse &amp; Business" />`,
    `<meta property="og:locale" content="pt_BR" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${base}${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${base}${image}" />`,
    ...(noindex ? [] : jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, "\\u003c")}</script>`)),
  ];
  return html.replace("</head>", `  ${tags.join("\n  ")}\n</head>`);
}

export function seo(root, dist) {
  const base = siteUrl();
  const platforms = load(join(root, "public/platforms.js"), "DRAP_PLATFORMS") || [];
  const details = load(join(root, "public/platform-details.js"), "DRAP_DETAILS") || {};
  const og = (id) => (existsSync(join(root, `public/assets/og/${id}.jpg`)) ? `/assets/og/${id}.jpg` : "/assets/og/drap.jpg");

  const org = {
    "@context": "https://schema.org", "@type": "Organization", name: "DRAP SoftwareHouse & Business", url: base,
    logo: `${base}/assets/brand/drap-logo-light.png`,
    description: "Software house brasileira: plataformas prontas para comercializar, desenvolvimento sob medida e consultoria tecnológica.",
  };
  const site = { "@context": "https://schema.org", "@type": "WebSite", name: "DRAP SoftwareHouse & Business", url: base, inLanguage: "pt-BR" };

  const pages = [
    ["index.html", "/", {
      title: "DRAP SoftwareHouse & Business — Plataformas prontas e software sob medida",
      description: "Plataformas de software prontas para arquitetura, educação, agronegócio, produtividade e atendimento, e desenvolvimento sob medida com proposta na hora.",
      image: og("drap"), jsonld: [org, site],
    }],
    ["portfolio.html", "/portfolio", {
      title: "Portfólio · DRAP SoftwareHouse & Business",
      description: `Cases da DRAP: ${platforms.map((p) => p.name.replace(/^DRAP\s*/i, "")).join(", ")}. O desafio de cada setor, o que construímos e o que muda para quem usa.`,
      image: og("portfolio"),
      jsonld: [{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Portfólio DRAP", url: `${base}/portfolio`,
        hasPart: platforms.map((p) => ({ "@type": "SoftwareApplication", name: p.name, url: `${base}/plataformas/${p.id}`, applicationCategory: "BusinessApplication" })) }],
    }],
    ["sob-medida.html", "/sob-medida", {
      title: "Plataforma sob medida · DRAP SoftwareHouse & Business",
      description: "Descreva a ferramenta que a sua empresa precisa em 5 minutos e receba a proposta com escopo, módulos, cronograma e investimento.",
      image: og("sob-medida"), jsonld: [{ "@context": "https://schema.org", "@type": "Service", name: "Desenvolvimento de software sob medida",
        provider: { "@type": "Organization", name: "DRAP SoftwareHouse & Business", url: base }, areaServed: "BR", url: `${base}/sob-medida` }],
    }],
  ];
  for (const [file, path, meta] of pages) {
    const f = join(dist, file);
    if (existsSync(f)) writeFileSync(f, withHead(readFileSync(f, "utf8"), { ...meta, path }, base));
  }

  // Página estática por plataforma, a partir de plataforma.html
  const tpl = readFileSync(join(root, "public/plataforma.html"), "utf8");
  mkdirSync(join(dist, "plataformas"), { recursive: true });
  for (const p of platforms) {
    const d = details[p.id] || {};
    const path = `/plataformas/${p.id}`;
    const jsonld = [
      { "@context": "https://schema.org", "@type": "SoftwareApplication", name: p.name, applicationCategory: "BusinessApplication",
        operatingSystem: "Web", description: clip(d.lead || p.summary, 300), url: `${base}${path}`, image: `${base}${og(p.id)}`,
        featureList: (d.modules || []).map((m) => m.title).filter((t) => !/próximas fases/i.test(t)),
        publisher: { "@type": "Organization", name: "DRAP SoftwareHouse & Business", url: base } },
      { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Início", item: base },
        { "@type": "ListItem", position: 2, name: "Plataformas", item: `${base}/#plataformas` },
        { "@type": "ListItem", position: 3, name: p.name, item: `${base}${path}` }] },
      ...(d.faq?.length ? [{ "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: d.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }] : []),
    ];
    const html = withHead(tpl, {
      title: `${p.name} — ${p.category} · DRAP SoftwareHouse & Business`,
      description: clip(d.headline ? `${d.headline} ${p.summary}` : p.summary, 158),
      path, image: og(p.id), type: "product", jsonld,
    }, base);
    writeFileSync(join(dist, "plataformas", `${p.id}.html`), html);
  }

  // Página estática por serviço (painel explicativo e tutorial), a partir de servico.html
  const services = load(join(root, "public/services.js"), "DRAP_SERVICES") || {};
  const stpl = readFileSync(join(root, "public/servico.html"), "utf8");
  mkdirSync(join(dist, "servicos"), { recursive: true });
  for (const [sid, sv] of Object.entries(services)) {
    const path = `/servicos/${sid}`;
    const jsonld = [
      { "@context": "https://schema.org", "@type": "Service", name: sv.name, description: clip(sv.lead, 300), url: `${base}${path}`, areaServed: "BR",
        provider: { "@type": "Organization", name: "DRAP SoftwareHouse & Business", url: base } },
      { "@context": "https://schema.org", "@type": "HowTo", name: `Como funciona: ${sv.name}`,
        step: sv.steps.map(([t, d], i) => ({ "@type": "HowToStep", position: i + 1, name: t, text: d })) },
      { "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: sv.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    ];
    writeFileSync(join(dist, "servicos", `${sid}.html`), withHead(stpl, {
      title: `${sv.name}: como funciona e tutorial · DRAP SoftwareHouse & Business`,
      description: clip(`${sv.headline} Veja o passo a passo e as boas práticas para uso profissional.`, 158),
      path, image: og("drap"), jsonld,
    }, base));
  }

  // sitemap.xml e robots.txt
  const today = new Date().toISOString().slice(0, 10);
  const urls = ["/", "/portfolio", "/sob-medida", ...Object.keys(services).map((k) => `/servicos/${k}`),
    ...platforms.flatMap((p) => [`/plataformas/${p.id}`, `/plataformas/${p.id}/proposta`])];
  writeFileSync(join(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${base}${u}</loc><lastmod>${today}</lastmod><changefreq>${u === "/" || u === "/portfolio" ? "weekly" : "monthly"}</changefreq><priority>${u === "/" ? "1.0" : u.endsWith("/proposta") ? "0.6" : "0.8"}</priority></url>`).join("\n")}
</urlset>
`);
  writeFileSync(join(dist, "robots.txt"), `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /proposta/
Disallow: /depoimento/

Sitemap: ${base}/sitemap.xml
`);
  console.log(`seo: ${pages.length} páginas, ${platforms.length} páginas de plataforma, ${Object.keys(services).length} de serviço, sitemap com ${urls.length} endereços (${base})`);
}
