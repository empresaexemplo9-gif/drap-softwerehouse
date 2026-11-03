-- Remove das propostas de plataformas do catálogo os módulos extras que o produto já entrega
-- (ex.: BI e assinatura digital no DRAP Fazenda). Só mexe em propostas ainda não respondidas.
-- Também grava em platform.covered a lista do que já vem incluído, usada pelo painel.

update proposals set
  items = coalesce((select jsonb_agg(e) from jsonb_array_elements(items) e
                     where not (e->>$q$kind$q$ = $q$module$q$ and e->>$q$key$q$ = any (array[$q$bi$q$, $q$migracao$q$, $q$email$q$]))), $q$[]$q$::jsonb),
  platform = jsonb_set(coalesce(platform, $q${}$q$::jsonb), $q${covered}$q$, $q${"bi":"Metas calculadas sobre dados reais e relatórios exportáveis","migracao":"Implantação: importamos clientes, projetos e orçamentos","email":"Convites e avisos por e-mail do portal do cliente"}$q$::jsonb)
where platform_id = $q$backoffice$q$ and status not in ($q$aceita$q$, $q$recusada$q$);

update proposals set
  items = coalesce((select jsonb_agg(e) from jsonb_array_elements(items) e
                     where not (e->>$q$kind$q$ = $q$module$q$ and e->>$q$key$q$ = any (array[$q$api$q$, $q$auditoria$q$, $q$email$q$, $q$migracao$q$]))), $q$[]$q$::jsonb),
  platform = jsonb_set(coalesce(platform, $q${}$q$::jsonb), $q${covered}$q$, $q${"api":"API de integração incluída","auditoria":"Registro das ações sensíveis da equipe","email":"Convites por e-mail incluídos","migracao":"Implantação: publicamos ou migramos suas aulas e materiais"}$q$::jsonb)
where platform_id = $q$professor$q$ and status not in ($q$aceita$q$, $q$recusada$q$);

update proposals set
  items = coalesce((select jsonb_agg(e) from jsonb_array_elements(items) e
                     where not (e->>$q$kind$q$ = $q$module$q$ and e->>$q$key$q$ = any (array[$q$bi$q$, $q$assinatura$q$, $q$nfe$q$, $q$banco$q$, $q$migracao$q$, $q$auditoria$q$, $q$mobile$q$]))), $q$[]$q$::jsonb),
  platform = jsonb_set(coalesce(platform, $q${}$q$::jsonb), $q${covered}$q$, $q${"bi":"Análises: painéis por safra, cultura, fornecedor e plano de contas, realizado x previsto","assinatura":"PDF e assinatura digital com certificado ICP-Brasil","nfe":"NF-e de grãos","banco":"Conciliação bancária por OFX","migracao":"Implantação: conexão com as planilhas que os sócios já usam","auditoria":"Trilha de auditoria","mobile":"App no celular"}$q$::jsonb)
where platform_id = $q$fazenda$q$ and status not in ($q$aceita$q$, $q$recusada$q$);

update proposals set
  items = coalesce((select jsonb_agg(e) from jsonb_array_elements(items) e
                     where not (e->>$q$kind$q$ = $q$module$q$ and e->>$q$key$q$ = any (array[$q$bi$q$, $q$migracao$q$, $q$offline$q$, $q$mobile$q$]))), $q$[]$q$::jsonb),
  platform = jsonb_set(coalesce(platform, $q${}$q$::jsonb), $q${covered}$q$, $q${"bi":"Custo da arroba e do litro e painel de atenção diária","migracao":"Implantação: importamos animais e lotes da sua planilha","offline":"Funciona 100% offline","mobile":"App no celular para a equipe de campo"}$q$::jsonb)
where platform_id = $q$pecuaria$q$ and status not in ($q$aceita$q$, $q$recusada$q$);

update proposals set
  items = coalesce((select jsonb_agg(e) from jsonb_array_elements(items) e
                     where not (e->>$q$kind$q$ = $q$module$q$ and e->>$q$key$q$ = any (array[$q$auditoria$q$, $q$migracao$q$]))), $q$[]$q$::jsonb),
  platform = jsonb_set(coalesce(platform, $q${}$q$::jsonb), $q${covered}$q$, $q${"auditoria":"Histórico de alterações, lixeira e permissões por arquivo","migracao":"Implantação: migração de documentos, planilhas e apresentações"}$q$::jsonb)
where platform_id = $q$office$q$ and status not in ($q$aceita$q$, $q$recusada$q$);

update proposals set
  items = coalesce((select jsonb_agg(e) from jsonb_array_elements(items) e
                     where not (e->>$q$kind$q$ = $q$module$q$ and e->>$q$key$q$ = any (array[$q$migracao$q$, $q$mobile$q$]))), $q$[]$q$::jsonb),
  platform = jsonb_set(coalesce(platform, $q${}$q$::jsonb), $q${covered}$q$, $q${"migracao":"Implantação: trazemos sua base atual de clientes","mobile":"Apps para Android, Windows e desktop"}$q$::jsonb)
where platform_id = $q$concord$q$ and status not in ($q$aceita$q$, $q$recusada$q$);
