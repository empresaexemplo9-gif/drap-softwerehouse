-- Nova ordem do catálogo na home: Fazenda, Empresa, Granja, Pecuária, Loja,
-- Backoffice, office, Concord e Professor (mesma ordem de public/platforms.js).

update platforms p
set sort_order = o.sort_order
from (values
  ('fazenda', 10), ('empresa', 20), ('granja', 30), ('pecuaria', 40), ('loja', 50),
  ('backoffice', 60), ('office', 70), ('concord', 80), ('professor', 90)
) as o (id, sort_order)
where p.id = o.id;
