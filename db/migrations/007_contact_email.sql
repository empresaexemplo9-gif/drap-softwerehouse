-- E-mail de contato oficial da DRAP. Só substitui o endereço provisório antigo:
-- se o e-mail já foi editado no painel (Configurações), ele é mantido.
insert into site_settings (key, value) values ('contact_email', 'drap@drap.app.br')
on conflict (key) do update set value = excluded.value
where site_settings.value in ('contato@drap.com.br', '');
