// GET /api/catalog → plataformas publicadas + configurações do site + depoimentos aprovados (público, com cache curto na CDN)
import { query } from "../lib/db.js";
import { handler, send } from "../lib/http.js";

export default handler(["GET"], async (_req, res) => {
  const [platforms, settings, testimonials] = await Promise.all([
    query(`select id, name, code, category, tagline, summary, features, stack, status, palette,
                  logo_svg, logo_url, preview_key, preview_image, url
             from platforms where active order by sort_order, name`),
    query("select key, value from site_settings"),
    // depoimentos aprovados (tabela criada na migração 005; se ainda não existir, segue sem)
    query(`select t.name, t.role, t.company, t.quote, t.rating, t.platform_id, p.name as platform_name
             from testimonials t left join platforms p on p.id = t.platform_id
            where t.published and t.consent order by t.sort_order, t.created_at desc limit 24`).catch(() => ({ rows: [] })),
  ]);
  send(res, 200, {
    platforms: platforms.rows,
    settings: Object.fromEntries(settings.rows.map((r) => [r.key, r.value])),
    testimonials: testimonials.rows,
  }, { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" });
});
