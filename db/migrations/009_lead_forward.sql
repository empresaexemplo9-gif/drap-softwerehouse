-- Encaminhamento do formulário de contato para o e-mail da DRAP:
-- registra se a mensagem chegou na caixa de entrada (e por qual serviço).
alter table leads add column forwarded_via text;
alter table leads add column forwarded_at timestamptz;
alter table leads add column forward_error text check (forward_error is null or char_length(forward_error) <= 200);
