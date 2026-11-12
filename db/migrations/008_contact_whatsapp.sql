-- WhatsApp oficial da DRAP. Só substitui o número de exemplo antigo:
-- se o número já foi editado no painel (Configurações), ele é mantido.
insert into site_settings (key, value) values ('contact_whatsapp', '+55 (62) 98266-3870')
on conflict (key) do update set value = excluded.value
where site_settings.value in ('+55 (00) 00000-0000', '');
