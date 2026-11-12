-- DRAP Granja: troca o ovo (favicon) pelo símbolo oficial da marca, o "D" da DRAP
-- usado no logo de granja.drap.app.br. Só altera se o logo ainda for o ovo gravado
-- pela 010, para não sobrescrever um logo editado pelo painel.

update platforms
set logo_svg = $q$<svg viewBox="20.3 5.98 57.2 56.9" fill="currentColor" aria-hidden="true"><path d="M65.41 6.62 39.43 62.87h22.18c8.6 0 15.53-9.61 15.53-21.55V27.53c0-10.12-4.97-18.57-11.73-20.91z"/><path d="M20.36 5.98c-.08 18.97-.05 37.93 0 56.9h18.79L62.76 6.04a11.6 11.6 0 0 0-1.15-.06z"/></svg>$q$
where id = 'granja' and logo_svg like '%viewBox="20 12 60 76"%';
