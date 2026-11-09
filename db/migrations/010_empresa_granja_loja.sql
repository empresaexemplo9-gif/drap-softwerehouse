-- Adiciona DRAP Empresa, DRAP Granja e DRAP Loja ao catálogo de bancos que já existem.
-- Bancos novos (tabela vazia) recebem as três pelo db/seed.sql, que roda depois das migrações;
-- por isso aqui só se insere quando o catálogo já existe. Não sobrescreve edições feitas pelo painel.

do $m$
begin
  if not exists (select 1 from platforms) then
    return;
  end if;

  insert into platforms
  (id, name, code, category, tagline, summary, features, stack, status, palette,
   logo_svg, logo_url, preview_key, preview_image, url, repo, sort_order)
values
  ($q$empresa$q$, $q$DRAP Empresa$q$, $q$PLT-07$q$, $q$Gestão Financeira$q$, $q$Gestão financeira sem planilha.$q$, $q$Lançamentos, conciliação bancária por OFX, fluxo de caixa, DRE, nota fiscal e cobrança por boleto, PIX e cartão num lugar só, com IA que lê notas e comprovantes. Quatro planos por empresa, do MEI à EPP, com 14 dias de teste sem cartão.$q$, array[$q$Conciliação OFX$q$, $q$DRE & fluxo de caixa$q$, $q$NF-e · NFS-e$q$, $q$IA que lê comprovantes$q$]::text[], array[$q$Next.js$q$, $q$PostgreSQL$q$, $q$API REST$q$]::text[], $q$Disponível$q$, array[$q$#00BCFF$q$, $q$#0E1420$q$, $q$#FF5547$q$, $q$#FAFAF0$q$]::text[], $q$<svg viewBox="20.3 5.98 57.2 56.9" fill="currentColor" aria-hidden="true"><path d="M65.41 6.62 39.43 62.87h22.18c8.6 0 15.53-9.61 15.53-21.55V27.53c0-10.12-4.97-18.57-11.73-20.91z"/><path d="M20.36 5.98c-.08 18.97-.05 37.93 0 56.9h18.79L62.76 6.04a11.6 11.6 0 0 0-1.15-.06z"/></svg>$q$, null, $q$empresa$q$, null, $q$https://empresa.drap.app.br/?utm_source=hub$q$, null, 70),
  ($q$granja$q$, $q$DRAP Granja$q$, $q$PLT-08$q$, $q$Agronegócio$q$, $q$Sua granja produz. Mas quanto sobra?$q$, $q$Gestão para granjas de ovos: custo real de cada lote, coleta, postura, ração, estoque de ovos por tamanho, plantel, calendário sanitário e financeiro num lugar só. O app do galpão lança sem sinal e sincroniza sozinho, e a NF-e de ovo já vem inclusa.$q$, array[$q$Custo por lote e por dúzia$q$, $q$App do galpão offline$q$, $q$Estoque de ovos$q$, $q$NF-e de ovo$q$]::text[], array[$q$Next.js$q$, $q$PostgreSQL$q$, $q$Android$q$]::text[], $q$Disponível$q$, array[$q$#9A4F2B$q$, $q$#B88836$q$, $q$#251C14$q$, $q$#F9F1E4$q$]::text[], $q$<svg viewBox="20 12 60 76" fill="currentColor" aria-hidden="true"><path d="M50 15C66 15 77 39 77 59C77 75 65 85 50 85C35 85 23 75 23 59C23 39 34 15 50 15Z"/></svg>$q$, null, $q$granja$q$, null, $q$https://granja.drap.app.br/?utm_source=hub$q$, null, 80),
  ($q$loja$q$, $q$DRAP Loja$q$, $q$PLT-09$q$, $q$Varejo & E-commerce$q$, $q$Sua loja online pronta pra vender, seja qual for o seu varejo.$q$, $q$Loja online com a sua marca para mercado, construção, elétrica, moda, autopeças e qualquer varejo: do pedido no WhatsApp à compra 100% online, com pagamento, frete e envio. Integração nativa com o ERP Micro-F, painel de admin e vendedor, e a DRAP monta junto com você.$q$, array[$q$Pedido no WhatsApp$q$, $q$Checkout 100% online$q$, $q$Integração Micro-F$q$, $q$Painel admin + vendedor$q$]::text[], array[$q$Next.js$q$, $q$Micro-F$q$, $q$IA opcional$q$]::text[], $q$Sob demanda$q$, array[$q$#7C3AED$q$, $q$#0E1420$q$, $q$#FF5547$q$, $q$#FBFBF2$q$]::text[], $q$<svg viewBox="20.3 5.98 57.2 56.9" fill="currentColor" aria-hidden="true"><path d="M65.41 6.62 39.43 62.87h22.18c8.6 0 15.53-9.61 15.53-21.55V27.53c0-10.12-4.97-18.57-11.73-20.91z"/><path d="M20.36 5.98c-.08 18.97-.05 37.93 0 56.9h18.79L62.76 6.04a11.6 11.6 0 0 0-1.15-.06z"/></svg>$q$, null, $q$loja$q$, null, $q$https://loja.drap.app.br/?utm_source=hub$q$, null, 90)
  on conflict (id) do nothing;
end
$m$;
