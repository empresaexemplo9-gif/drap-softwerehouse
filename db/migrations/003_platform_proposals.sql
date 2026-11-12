-- ============================================================================
-- Propostas das plataformas do catálogo
-- ----------------------------------------------------------------------------
-- platform_id  plataforma do catálogo vendida nesta proposta (null = sob medida)
-- platform     retrato da identidade da plataforma no momento da proposta:
--              { id, name, category, tagline, palette[], logo_svg, fonts{display,sans},
--                steps[{title,text}] } — a proposta usa a paleta e o tema dela,
--              mantendo a marca, o logo e a marca d'água oficiais da DRAP.
-- ============================================================================
alter table proposals add column platform_id text references platforms (id) on delete set null;
alter table proposals add column platform jsonb;
create index proposals_platform_idx on proposals (platform_id);
