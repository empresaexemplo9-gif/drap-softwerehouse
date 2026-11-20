// Motor de orçamento das plataformas sob medida.
// ----------------------------------------------------------------------------
// Cada item tem uma faixa de mercado (R$) levantada a partir de software houses
// e SaaS concorrentes no Brasil: `market.setup` = implantação/desenvolvimento,
// `market.monthly` = mensalidade (hospedagem, licença, manutenção).
// O preço DRAP é posicionado dentro da faixa por PRICE_POSITION (0 = mínimo,
// 1 = máximo de mercado) e depois ajustado por escala, prazo e plataformas.
// Para mudar preços, edite as faixas abaixo; as propostas já geradas não mudam.
// ----------------------------------------------------------------------------

export const PRICE_POSITION = 0.4; // 40% da faixa: abaixo da média de mercado, sem ser o mais barato

// Núcleo obrigatório de toda plataforma
export const BASE = {
  key: "nucleo", name: "Núcleo da plataforma",
  description: "Arquitetura em nuvem, login seguro com perfis e permissões, cadastros principais, painel administrativo responsivo e identidade visual da sua marca.",
  icon: "core", market: { setup: [12000, 26000], monthly: [290, 790] },
};

// Onde a plataforma vai rodar (além da versão web, sempre incluída)
export const TARGETS = {
  mobile:  { name: "Aplicativo Android e iOS", description: "App nas lojas com notificações push, login biométrico e as funções principais da plataforma.", icon: "mobile", market: { setup: [14000, 38000], monthly: [90, 290] }, weight: 3 },
  desktop: { name: "Versão desktop (Windows)", description: "Instalador para Windows com atualização automática, ideal para balcão e operação interna.", icon: "desktop", market: { setup: [7000, 18000], monthly: [40, 120] }, weight: 2 },
  offline: { name: "Modo offline (PWA)", description: "Continua funcionando sem internet e sincroniza os dados quando a conexão volta.", icon: "offline", market: { setup: [5000, 14000], monthly: [0, 60] }, weight: 2 },
};

// Funcionalidades do escopo principal (entram no valor da plataforma)
export const FEATURES = {
  dashboard:    { name: "Painel de indicadores", description: "Visão em tempo real dos números que importam, com filtros por período, equipe e unidade.", icon: "chart", market: { setup: [2000, 6000], monthly: [0, 40] }, weight: 1 },
  agenda:       { name: "Agenda e reservas", description: "Agendamentos com confirmação, bloqueio de horários, lembretes e visão por profissional ou recurso.", icon: "calendar", market: { setup: [3500, 9000], monthly: [0, 60] }, weight: 1 },
  financeiro:   { name: "Financeiro", description: "Contas a pagar e a receber, fluxo de caixa, centros de custo e conciliação manual.", icon: "money", market: { setup: [5000, 14000], monthly: [0, 90] }, weight: 2 },
  estoque:      { name: "Estoque e compras", description: "Entradas, saídas, inventário, estoque mínimo e pedidos de compra.", icon: "box", market: { setup: [4500, 12000], monthly: [0, 70] }, weight: 2 },
  vendas:       { name: "Vendas e pedidos", description: "Orçamentos, pedidos, PDV e comissões, com histórico por cliente.", icon: "cart", market: { setup: [5000, 14000], monthly: [0, 80] }, weight: 2 },
  crm:          { name: "CRM e funil comercial", description: "Funil de oportunidades, tarefas, histórico de contatos e metas da equipe.", icon: "funnel", market: { setup: [4000, 11000], monthly: [0, 70] }, weight: 1 },
  portal:       { name: "Portal do cliente", description: "Área exclusiva onde seus clientes acompanham pedidos, documentos, pagamentos e solicitações.", icon: "portal", market: { setup: [4000, 11000], monthly: [0, 60] }, weight: 2 },
  relatorios:   { name: "Relatórios e exportações", description: "Relatórios configuráveis com exportação para Excel e PDF.", icon: "report", market: { setup: [2000, 6000], monthly: [0, 30] }, weight: 1 },
  documentos:   { name: "Documentos e arquivos", description: "Upload, organização e versionamento de arquivos com controle de acesso.", icon: "doc", market: { setup: [2500, 7000], monthly: [20, 80] }, weight: 1 },
  chamados:     { name: "Chamados e ordens de serviço", description: "Abertura, atribuição, SLA e acompanhamento de atendimentos ou serviços.", icon: "ticket", market: { setup: [3500, 9000], monthly: [0, 50] }, weight: 1 },
  rh:           { name: "Equipe e RH", description: "Cadastro de colaboradores, escalas, ponto e permissões por função.", icon: "team", market: { setup: [3500, 10000], monthly: [0, 60] }, weight: 2 },
  multiempresa: { name: "Multiempresa e filiais", description: "Várias empresas ou unidades na mesma plataforma, com dados separados e visão consolidada.", icon: "branches", market: { setup: [5000, 13000], monthly: [40, 150] }, weight: 3 },
};

// Módulos e integrações adicionais (cada um com valor próprio na proposta)
export const MODULES = {
  nfe:         { name: "Emissão de notas fiscais", description: "NF-e, NFS-e e NFC-e emitidas direto da plataforma, com envio automático ao cliente e ao contador.", icon: "invoice", market: { setup: [5000, 12000], monthly: [150, 390] }, weight: 3 },
  banco:       { name: "Integração bancária", description: "Boletos e PIX registrados automaticamente, baixa de pagamentos e conciliação bancária.", icon: "bank", market: { setup: [6000, 15000], monthly: [100, 290] }, weight: 3 },
  pagamentos:  { name: "Pagamentos online", description: "Cartão de crédito, assinaturas recorrentes e divisão de pagamentos (split) por gateway.", icon: "card", market: { setup: [4500, 12000], monthly: [60, 190] }, weight: 2 },
  whatsapp:    { name: "WhatsApp Business", description: "Notificações, confirmações e atendimento pelo WhatsApp oficial (API Cloud da Meta).", icon: "chat", market: { setup: [3500, 9000], monthly: [90, 250] }, weight: 2 },
  email:       { name: "E-mails automáticos", description: "E-mails transacionais e campanhas com a sua marca, com métricas de abertura.", icon: "mail", market: { setup: [1500, 4500], monthly: [40, 120] }, weight: 1 },
  assinatura:  { name: "Assinatura eletrônica", description: "Contratos e termos assinados digitalmente com validade jurídica.", icon: "sign", market: { setup: [2500, 7000], monthly: [60, 180] }, weight: 1 },
  erp:         { name: "Integração com ERP e contabilidade", description: "Sincronização com Omie, Bling, Conta Azul, TOTVS ou o sistema do seu contador.", icon: "sync", market: { setup: [6000, 18000], monthly: [100, 300] }, weight: 3 },
  marketplace: { name: "E-commerce e marketplaces", description: "Catálogo, pedidos e estoque integrados com loja virtual, Mercado Livre e outros canais.", icon: "store", market: { setup: [6000, 16000], monthly: [100, 290] }, weight: 3 },
  bi:          { name: "BI e dashboards avançados", description: "Análises cruzadas, metas e painéis gerenciais com atualização automática.", icon: "bi", market: { setup: [5000, 14000], monthly: [80, 250] }, weight: 2 },
  ia:          { name: "Assistente com IA", description: "Atendimento automático, resumo de documentos e sugestões inteligentes treinadas nos seus dados.", icon: "ai", market: { setup: [7000, 22000], monthly: [180, 590] }, weight: 3 },
  api:         { name: "API pública e webhooks", description: "Integração com qualquer sistema de terceiros por API documentada e eventos em tempo real.", icon: "api", market: { setup: [4000, 10000], monthly: [50, 150] }, weight: 2 },
  sso:         { name: "Login corporativo (SSO)", description: "Entrada com Google, Microsoft ou o provedor de identidade da sua empresa.", icon: "key", market: { setup: [2500, 7000], monthly: [20, 80] }, weight: 1 },
  auditoria:   { name: "Auditoria e LGPD", description: "Trilha de auditoria de cada ação, consentimentos e relatórios de conformidade com a LGPD.", icon: "shield", market: { setup: [3000, 8000], monthly: [40, 120] }, weight: 1 },
  idiomas:     { name: "Multi-idioma", description: "Interface em português, inglês e espanhol, com moedas e formatos regionais.", icon: "globe", market: { setup: [2500, 7000], monthly: [0, 40] }, weight: 1 },
  migracao:    { name: "Migração de dados", description: "Importação de planilhas e do sistema atual, com conferência e limpeza dos dados.", icon: "migrate", market: { setup: [3000, 10000], monthly: [0, 0] }, weight: 2 },
};

// Módulos sugeridos como opcionais quando o cliente não os escolheu (por relevância)
const SUGGEST = ["nfe", "banco", "whatsapp", "pagamentos", "bi", "ia"];

export const USERS = {
  "ate-10":   { label: "Até 10 usuários", setup: 1.0, monthly: 1.0, score: 0 },
  "11-50":    { label: "11 a 50 usuários", setup: 1.05, monthly: 1.3, score: 1 },
  "51-200":   { label: "51 a 200 usuários", setup: 1.15, monthly: 1.8, score: 2 },
  "201-1000": { label: "201 a 1.000 usuários", setup: 1.3, monthly: 2.6, score: 4 },
  "1000+":    { label: "Mais de 1.000 usuários", setup: 1.5, monthly: 4.0, score: 6 },
};
export const DEADLINES = {
  urgente:   { label: "Menos de 1 mês", factor: 1.2, score: 2 },
  "1-3":     { label: "1 a 3 meses", factor: 1.0, score: 0 },
  "3-6":     { label: "3 a 6 meses", factor: 1.0, score: 0 },
  flexivel:  { label: "Sem pressa", factor: 0.97, score: 0 },
};
export const PROJECT_TYPES = {
  gestao: "Sistema de gestão interna",
  portal: "Portal para clientes ou parceiros",
  saas: "SaaS para revender",
  marketplace: "Marketplace ou e-commerce",
  app: "Aplicativo de serviços",
  outro: "Outro",
};
export const SEGMENTS = ["Saúde", "Educação", "Varejo", "Indústria", "Serviços", "Imobiliário", "Logística", "Finanças", "Alimentação", "Agronegócio", "Tecnologia", "Jurídico", "Outro"];
export const CURRENT = { planilhas: "Planilhas", papel: "Papel e anotações", sistema: "Um sistema que não atende", varios: "Vários sistemas desconectados", nada: "Ainda não temos processo" };
export const GOALS = {
  organizar: "Organizar a operação", vender: "Vender mais", automatizar: "Automatizar tarefas",
  clientes: "Melhorar a experiência do cliente", dados: "Tomar decisões com dados", escalar: "Escalar sem aumentar a equipe",
  produto: "Lançar um produto digital",
};

// Acima disso a proposta nunca é enviada sozinha
export const AUTO_LIMIT = { score: 9, setup: 45000 };

const pick = ([min, max]) => min + (max - min) * PRICE_POSITION;
const mid = ([min, max]) => (min + max) / 2;
const r100 = (n) => Math.round(n / 100) * 100;
const r10 = (n) => Math.round(n / 10) * 10;

function line(key, def, kind, { setupF = 1, monthlyF = 1, selected = true, origin = "cliente" } = {}) {
  return {
    key, kind, name: def.name, description: def.description, icon: def.icon, origin, selected,
    setup: r100(pick(def.market.setup) * setupF),
    monthly: r10(pick(def.market.monthly) * monthlyF),
    market: { setup: r100(mid(def.market.setup) * setupF), monthly: r10(mid(def.market.monthly) * monthlyF) },
  };
}

// Catálogo público (sem preços) para montar o questionário
export function publicCatalog() {
  const strip = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, { name: v.name, description: v.description, icon: v.icon }]));
  return {
    targets: strip(TARGETS), features: strip(FEATURES), modules: strip(MODULES),
    users: Object.fromEntries(Object.entries(USERS).map(([k, v]) => [k, v.label])),
    deadlines: Object.fromEntries(Object.entries(DEADLINES).map(([k, v]) => [k, v.label])),
    types: PROJECT_TYPES, segments: SEGMENTS, current: CURRENT, goals: GOALS,
  };
}

// Catálogo completo (com preços) para o painel
export function adminCatalog() {
  const all = { nucleo: { ...BASE, kind: "core" } };
  for (const [k, v] of Object.entries(TARGETS)) all[k] = { ...v, kind: "core" };
  for (const [k, v] of Object.entries(FEATURES)) all[k] = { ...v, kind: "core" };
  for (const [k, v] of Object.entries(MODULES)) all[k] = { ...v, kind: "module" };
  return Object.fromEntries(Object.entries(all).map(([k, v]) => [k, line(k, v, v.kind, { origin: "equipe" })]));
}

// Normaliza as respostas do questionário (descarta chaves desconhecidas)
export function normalizeBrief(b) {
  const s = (v, max) => String(v ?? "").trim().slice(0, max);
  const keys = (v, dict) => [...new Set((Array.isArray(v) ? v : []).filter((k) => Object.hasOwn(dict, k)))];
  const modules = {};
  for (const [k, v] of Object.entries(b.modules && typeof b.modules === "object" ? b.modules : {}))
    if (Object.hasOwn(MODULES, k) && (v === "agora" || v === "futuro")) modules[k] = v;
  return {
    project_name: s(b.project_name, 80),
    segment: SEGMENTS.includes(b.segment) ? b.segment : "Outro",
    company_size: s(b.company_size, 40),
    type: Object.hasOwn(PROJECT_TYPES, b.type) ? b.type : "outro",
    description: s(b.description, 3000),
    current: Object.hasOwn(CURRENT, b.current) ? b.current : null,
    goals: keys(b.goals, GOALS),
    targets: keys(b.targets, TARGETS),
    users: Object.hasOwn(USERS, b.users) ? b.users : "ate-10",
    features: keys(b.features, FEATURES),
    modules,
    deadline: Object.hasOwn(DEADLINES, b.deadline) ? b.deadline : "1-3",
    budget: s(b.budget, 40),
    references: s(b.references, 500),
    notes: s(b.notes, 1500),
  };
}

// Calcula itens, complexidade e textos iniciais da proposta
export function estimate(brief) {
  const u = USERS[brief.users], d = DEADLINES[brief.deadline];
  const setupF = u.setup * d.factor, monthlyF = u.monthly;
  const reasons = [];
  let score = u.score + d.score;
  if (u.score >= 4) reasons.push(`Escala de ${u.label.toLowerCase()}`);
  if (d.score) reasons.push("Prazo menor que 1 mês");

  const items = [line(BASE.key, BASE, "core", { setupF, monthlyF })];
  for (const k of brief.targets) { items.push(line(k, TARGETS[k], "core", { setupF, monthlyF })); score += TARGETS[k].weight; }
  if (brief.targets.length >= 2) reasons.push("Mais de uma plataforma (web + app/desktop)");
  for (const k of brief.features) { items.push(line(k, FEATURES[k], "core", { setupF, monthlyF })); score += FEATURES[k].weight; }
  if (brief.features.length > 6) reasons.push(`${brief.features.length} funcionalidades no escopo`);

  const now = Object.entries(brief.modules).filter(([, v]) => v === "agora").map(([k]) => k);
  const later = Object.entries(brief.modules).filter(([, v]) => v === "futuro").map(([k]) => k);
  for (const k of now) { items.push(line(k, MODULES[k], "module", { setupF, monthlyF, selected: true })); score += MODULES[k].weight; }
  for (const k of later) items.push(line(k, MODULES[k], "module", { setupF, monthlyF, selected: false }));
  const heavy = now.filter((k) => MODULES[k].weight >= 3).map((k) => MODULES[k].name);
  if (heavy.length >= 2) reasons.push(`Integrações críticas: ${heavy.join(", ")}`);
  for (const k of SUGGEST.filter((k) => !brief.modules[k]).slice(0, Math.max(0, 4 - later.length)))
    items.push(line(k, MODULES[k], "module", { setupF, monthlyF, selected: false, origin: "sugestao" }));

  if (brief.type === "saas" || brief.type === "marketplace") { score += 3; reasons.push(`Projeto do tipo ${PROJECT_TYPES[brief.type].toLowerCase()}`); }
  if (brief.description.length > 1200) { score += 1; reasons.push("Descrição extensa, com regras específicas"); }

  const totals = totalsOf(items, 0);
  if (totals.setup > AUTO_LIMIT.setup) reasons.push(`Investimento acima de R$ ${AUTO_LIMIT.setup.toLocaleString("pt-BR")}`);
  const complexity = score <= AUTO_LIMIT.score && totals.setup <= AUTO_LIMIT.setup ? "simples" : score <= 18 ? "media" : "complexa";
  const weeks = Math.max(4, Math.min(32, Math.round(totals.setup / 4200)));

  return { items, score, complexity, reasons, weeks, market: totals.market };
}

export function totalsOf(items, discountPct = 0) {
  const sel = items.filter((i) => i.kind === "core" || i.selected);
  const sum = (arr, f) => arr.reduce((a, i) => a + (Number(f(i)) || 0), 0);
  const setupGross = sum(sel, (i) => i.setup);
  const discount = Math.round(setupGross * (Number(discountPct) || 0) / 100);
  return {
    core: sum(items.filter((i) => i.kind === "core"), (i) => i.setup),
    modules: sum(sel.filter((i) => i.kind === "module"), (i) => i.setup),
    setupGross, discount, setup: setupGross - discount,
    monthly: sum(sel, (i) => i.monthly),
    market: { setup: sum(sel, (i) => i.market?.setup), monthly: sum(sel, (i) => i.market?.monthly) },
  };
}

// Texto de abertura sugerido (editável no painel)
export function introFor(brief, company) {
  const goals = brief.goals.map((g) => GOALS[g].toLowerCase());
  const how = brief.current ? ` Hoje a operação depende de ${CURRENT[brief.current].toLowerCase()}, o que limita o crescimento.` : "";
  const kind = brief.type === "outro" ? "uma plataforma sob medida" : PROJECT_TYPES[brief.type].replace(/^(\S+)/, (w) => (w === "SaaS" ? w : w.toLowerCase()));
  return `Preparamos esta proposta para ${company || "a sua empresa"} a partir do que você nos contou: ${kind} para o segmento de ${brief.segment.toLowerCase()}.${how}` +
    (goals.length ? ` O objetivo é ${goals.length > 1 ? goals.slice(0, -1).join(", ") + " e " + goals.at(-1) : goals[0]}.` : "") +
    " A plataforma será construída sobre a base de engenharia da DRAP, já testada em produção, e entregue com a sua identidade visual.";
}
