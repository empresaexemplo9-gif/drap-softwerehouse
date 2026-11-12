-- Links "ao vivo" de Fazenda, Pecuária e Concord, que ainda apontavam para #contato.
-- Com eles, todos os cards da home ganham o botão "Ao vivo". Só altera se o link
-- ainda for #contato, para não sobrescrever um endereço editado pelo painel.

update platforms p
set url = o.url
from (values
  ('fazenda', 'https://fazenda.drap.app.br/?utm_source=hub'),
  ('pecuaria', 'https://drap-pecuaria.vercel.app/?utm_source=hub'),
  ('concord', 'https://drap-concord.vercel.app/?utm_source=hub')
) as o (id, url)
where p.id = o.id and p.url = '#contato';
