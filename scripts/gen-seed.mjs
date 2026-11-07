// Gera db/seed.sql a partir de public/platforms.js (fonte única do catálogo inicial).
// Uso: npm run seed:gen
import { readFileSync, writeFileSync } from "node:fs";
import vm from "node:vm";

const ctx = { window: {} };
vm.runInNewContext(readFileSync(new URL("../public/platforms.js", import.meta.url), "utf8"), ctx);
const platforms = ctx.window.DRAP_PLATFORMS;

const q = (s) => (s == null ? "null" : `$q$${String(s)}$q$`);
const arr = (a) => `array[${(a || []).map(q).join(", ")}]::text[]`;

const rows = platforms.map((p, i) => `  (${[
  q(p.id), q(p.name), q(p.code), q(p.category), q(p.tagline), q(p.summary),
  arr(p.features), arr(p.stack), q(p.status), arr(p.palette),
  q(p.logo?.svg ?? null), q(p.logo?.src ?? null),
  q(typeof p.preview === "string" ? p.preview : p.preview?.key ?? p.id), q(p.preview?.image ?? null),
  q(p.url || "#contato"), q(p.repo ?? null), (i + 1) * 10
].join(", ")})`);

const settings = {
  contact_email: "drap@drap.app.br",
  contact_whatsapp: "+55 (00) 00000-0000",
  contact_hours: "Seg–Sex · 09h–18h",
};

const sql = `-- Gerado por scripts/gen-seed.mjs a partir de public/platforms.js. Não edite à mão.
-- Idempotente: pode rodar de novo para restaurar o catálogo inicial.

insert into platforms
  (id, name, code, category, tagline, summary, features, stack, status, palette,
   logo_svg, logo_url, preview_key, preview_image, url, repo, sort_order)
values
${rows.join(",\n")}
on conflict (id) do update set
  name = excluded.name, code = excluded.code, category = excluded.category,
  tagline = excluded.tagline, summary = excluded.summary, features = excluded.features,
  stack = excluded.stack, status = excluded.status, palette = excluded.palette,
  logo_svg = excluded.logo_svg, logo_url = excluded.logo_url, preview_key = excluded.preview_key,
  preview_image = excluded.preview_image, url = excluded.url, repo = excluded.repo,
  sort_order = excluded.sort_order;

insert into site_settings (key, value) values
${Object.entries(settings).map(([k, v]) => `  (${q(k)}, ${q(v)})`).join(",\n")}
on conflict (key) do nothing;
`;
writeFileSync(new URL("../db/seed.sql", import.meta.url), sql);
console.log(`db/seed.sql: ${platforms.length} plataformas, ${Object.keys(settings).length} configurações`);
