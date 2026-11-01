// GET /api/catalog → plataformas publicadas + configurações do site (público, com cache curto na CDN)
import { query } from "../lib/db.js";
import { handler, send } from "../lib/http.js";

export default handler(["GET"], async (_req, res) => {
  const [platforms, settings] = await Promise.all([
    query(`select id, name, code, category, tagline, summary, features, stack, status, palette,
                  logo_svg, logo_url, preview_key, preview_image, url
             from platforms where active order by sort_order, name`),
    query("select key, value from site_settings"),
  ]);
  send(res, 200, {
    platforms: platforms.rows,
    settings: Object.fromEntries(settings.rows.map((r) => [r.key, r.value])),
  }, { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" });
});
