// Propostas das plataformas prontas do catálogo.
// ----------------------------------------------------------------------------
// Cada plataforma tem: faixa de mercado de implantação e de licença mensal,
// tipografia do próprio produto, prazo de implantação e módulos opcionais
// (chaves de MODULES/TARGETS em pricing.js). O escopo incluído, as dores e as
// etapas vêm de public/platform-details.js, o mesmo texto da página pública.
// A paleta e o logo vêm da tabela `platforms` (editáveis no painel).
// As faixas são referências iniciais: revise com os números da DRAP.
// ----------------------------------------------------------------------------
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { MODULES, TARGETS, USERS, PRICE_POSITION } from "./pricing.js";

export const PLANS = {
  // optional = módulos extras oferecidos; covered = módulos do catálogo que a plataforma JÁ ENTREGA
  // (nunca são oferecidos nem cobrados à parte, mesmo se alguém tentar adicioná-los).
  backoffice: { fonts: { display: "Cormorant Garamond", sans: "Jost" }, weeks: 4,
    market: { setup: [4000, 12000], monthly: [490, 1490] },
    optional: ["nfe", "banco", "assinatura", "whatsapp"],
    covered: { bi: "Metas calculadas sobre dados reais e relatórios exportáveis", migracao: "Implantação: importamos clientes, projetos e orçamentos",
      email: "Convites e avisos por e-mail do portal do cliente" } },
  professor: { fonts: { display: "Playfair Display", sans: "Inter" }, weeks: 3,
    market: { setup: [3500, 10000], monthly: [390, 1290] },
    optional: ["pagamentos", "whatsapp", "mobile", "sso", "ia"],
    covered: { api: "API de integração incluída", auditoria: "Registro das ações sensíveis da equipe", email: "Convites por e-mail incluídos",
      migracao: "Implantação: publicamos ou migramos suas aulas e materiais" } },
  fazenda: { fonts: { display: "Fraunces", sans: "Manrope" }, weeks: 3,
    market: { setup: [3000, 9000], monthly: [290, 890] },
    optional: ["erp", "whatsapp", "api"],
    covered: { bi: "Análises: painéis por safra, cultura, fornecedor e plano de contas, realizado x previsto",
      assinatura: "PDF e assinatura digital com certificado ICP-Brasil", nfe: "NF-e de grãos", banco: "Conciliação bancária por OFX",
      migracao: "Implantação: conexão com as planilhas que os sócios já usam", auditoria: "Trilha de auditoria", mobile: "App no celular" } },
  pecuaria: { fonts: { display: "Fraunces", sans: "Manrope" }, weeks: 3,
    market: { setup: [3000, 9000], monthly: [290, 890] },
    optional: ["nfe", "banco", "erp", "whatsapp"],
    covered: { bi: "Custo da arroba e do litro e painel de atenção diária", migracao: "Implantação: importamos animais e lotes da sua planilha",
      offline: "Funciona 100% offline", mobile: "App no celular para a equipe de campo" } },
  office: { fonts: { display: "Inter", sans: "Inter" }, weeks: 2,
    market: { setup: [2000, 6000], monthly: [190, 690] },
    optional: ["sso", "ia", "api", "idiomas"],
    covered: { auditoria: "Histórico de alterações, lixeira e permissões por arquivo", migracao: "Implantação: migração de documentos, planilhas e apresentações" } },
  concord: { fonts: { display: "Fraunces", sans: "Inter" }, weeks: 2,
    market: { setup: [2500, 7000], monthly: [190, 790] },
    optional: ["pagamentos", "whatsapp", "nfe", "assinatura", "email", "bi"],
    covered: { migracao: "Implantação: trazemos sua base atual de clientes", mobile: "Apps para Android, Windows e desktop" } },
  // Empresa e Granja têm preço público (empresa.drap.app.br/precos e granja.drap.app.br): as faixas seguem esses valores.
  empresa: { fonts: { display: "Space Grotesk", sans: "Inter" }, weeks: 2,
    market: { setup: [990, 4000], monthly: [49, 990] },
    optional: ["erp", "migracao", "email", "sso"],
    covered: { nfe: "NFS-e de serviço e NF-e de produto, direto da DRAP", banco: "Conciliação do extrato OFX e cobrança por boleto e PIX",
      pagamentos: "Cobranças por boleto, PIX e cartão", whatsapp: "Assistente WhatsApp para consultas", ia: "IA que categoriza lançamentos e lê comprovantes",
      api: "API REST, webhooks assinados e Google Sheets", bi: "Dashboards Pro com comparação entre meses e drill-down",
      auditoria: "Auditoria de cada ação e verificação em duas etapas" } },
  granja: { fonts: { display: "Fraunces", sans: "Inter" }, weeks: 2,
    market: { setup: [500, 3000], monthly: [99, 250] },
    optional: ["erp", "migracao", "email", "sso"],
    covered: { nfe: "NF-e de venda de ovo e NFS-e", banco: "Contas bancárias, conciliação de extrato, boleto e PIX",
      whatsapp: "Consulta da granja pelo WhatsApp", ia: "Assistente de IA para categorizar e ler nota", api: "Google Sheets, API e webhooks",
      offline: "App do galpão que lança sem sinal", mobile: "App do galpão para Android", bi: "Dashboard com comparação entre meses, DRE e balanço",
      auditoria: "Auditoria de cada ação e verificação em duas etapas" } },
  loja: { fonts: { display: "Hanken Grotesk", sans: "Hanken Grotesk" }, weeks: 2,
    market: { setup: [4000, 14000], monthly: [190, 690] },
    optional: ["nfe", "email", "bi", "mobile"],
    covered: { marketplace: "Loja online com catálogo, carrinho e pedidos", erp: "Integração nativa com o ERP Micro-F",
      pagamentos: "Pagamento online, cálculo de frete e envio", migracao: "Catálogo montado a partir do ERP, de planilha ou de fotos",
      ia: "Cadastro de produtos com IA (opcional)" } },
};
export const PLATFORM_TERMS =
  "Implantação: 50% na assinatura do contrato e 50% no go-live. Licença mensal a partir do go-live, " +
  "com hospedagem, monitoramento, backups, atualizações e suporte inclusos. Sem fidelidade após 12 meses.";

// Plataforma nova sem plano próprio
const DEFAULT_PLAN = { fonts: { display: "Instrument Serif", sans: "Inter Tight" }, weeks: 3,
  market: { setup: [3000, 9000], monthly: [290, 990] }, optional: ["nfe", "banco", "whatsapp", "bi"], covered: {} };
// Módulos extras realmente oferecidos: nunca um que a plataforma já entrega
const offered = (plan) => plan.optional.filter((k) => !plan.covered?.[k]);
export const planOf = (id) => PLANS[id] || DEFAULT_PLAN;

// Textos das páginas de plataforma (mesmo arquivo servido ao navegador)
let details;
export function platformDetails() {
  if (!details) {
    try {
      const ctx = { window: {} };
      vm.runInNewContext(readFileSync(new URL("../public/platform-details.js", import.meta.url), "utf8"), ctx);
      details = ctx.window.DRAP_DETAILS || {};
    } catch (e) { console.error("platform-details:", e.message); details = {}; }
  }
  return details;
}

// Ícone de cada módulo incluído, pelo nome
const ICONS = [
  [/crm|clientes|funil/i, "funnel"], [/orçament|proposta|serviços e preços/i, "invoice"], [/obra|projeto|anotaç/i, "branches"],
  [/diário|agenda/i, "calendar"], [/prancheta|apresenta/i, "desktop"], [/documento|pdf|editor/i, "doc"], [/financ|livro|lançamento|acerto/i, "money"],
  [/portal|vitrine|meu aprend/i, "portal"], [/catálogo|trilha/i, "report"], [/perfis|permiss/i, "key"], [/tema/i, "globe"], [/auditoria/i, "shield"],
  [/^api/i, "api"], [/posição|análise|planilhas$/i, "chart"], [/concilia|banc/i, "bank"], [/nf-e/i, "invoice"], [/assinatura/i, "sign"],
  [/app|celular/i, "mobile"], [/rebanho|corte|leite|genética|sanidade|pastag/i, "box"], [/estoque/i, "box"], [/planilha|excel/i, "sync"],
  [/formulár|regras/i, "ticket"], [/banco de dados|diagrama/i, "bi"], [/ficha/i, "report"],
];
const iconFor = (title) => (ICONS.find(([re]) => re.test(title)) || [, "check"])[1];

const pick = ([min, max]) => min + (max - min) * PRICE_POSITION;
const mid = ([min, max]) => (min + max) / 2;
const r100 = (n) => Math.round(n / 100) * 100;
const r10 = (n) => Math.round(n / 10) * 10;
const line = (key, def, kind, f, selected, origin) => ({
  key, kind, name: def.name, description: def.description, icon: def.icon, origin, selected,
  setup: r100(pick(def.market.setup) * f.setup), monthly: r10(pick(def.market.monthly) * f.monthly),
  market: { setup: r100(mid(def.market.setup) * f.setup), monthly: r10(mid(def.market.monthly) * f.monthly) },
});

// Retrato da plataforma guardado na proposta (paleta, logo, fontes e textos)
export function platformSnapshot(p) {
  const d = platformDetails()[p.id] || {};
  return {
    id: p.id, name: p.name, category: p.category, tagline: p.tagline, palette: p.palette,
    logo_svg: p.logo_svg || null, fonts: planOf(p.id).fonts,
    headline: d.headline || p.tagline, pains: d.pains || [], outcomes: (d.outcomes || []).slice(0, 4),
    steps: d.steps || [], differentials: d.differentials || [],
    covered: planOf(p.id).covered || {}, // usado pelo painel para barrar cobrança de algo já incluído
  };
}

// Monta a proposta padrão de uma plataforma do catálogo
// users: chave de USERS (escala a implantação e a licença); company: nome do cliente
export function platformProposal(p, { users = "11-50", company = "" } = {}) {
  const plan = planOf(p.id), d = platformDetails()[p.id] || {};
  const u = USERS[users] || USERS["11-50"];
  const f = { setup: u.setup, monthly: Math.sqrt(u.monthly) }; // licença cresce mais devagar que um projeto sob medida

  const items = [
    line("implantacao", { name: "Implantação, configuração e treinamento", icon: "rocket", market: { setup: plan.market.setup, monthly: [0, 0] },
      description: `Configuração do ${p.name} com a sua marca, usuários e permissões, importação dos cadastros iniciais e treinamento ao vivo da equipe.` }, "core", f, true, "plataforma"),
    line("licenca", { name: `Licença ${p.name}`, icon: "cloud", market: { setup: [0, 0], monthly: plan.market.monthly },
      description: `Uso da plataforma com hospedagem, backups diários, atualizações, monitoramento e suporte. ${u.label}.` }, "core", f, true, "plataforma"),
    ...(d.modules || p.features.map((t) => ({ title: t, text: "" })))
      .filter((m) => !/próximas fases/i.test(m.title))
      .map((m, i) => ({ key: `inc-${i + 1}`, kind: "core", name: m.title, description: m.text, icon: iconFor(m.title),
        setup: 0, monthly: 0, selected: true, origin: "plataforma" })),
  ];
  for (const k of offered(plan)) {
    const def = MODULES[k] || TARGETS[k];
    if (def) items.push(line(k, def, "module", f, false, "sugestao"));
  }
  const intro = `Preparamos esta proposta para ${company || "a sua empresa"} implantar o ${p.name}, plataforma de ${p.category.toLowerCase()} da DRAP. ` +
    (d.lead || p.summary);
  return { title: p.name, intro, items, weeks: plan.weeks, platform: platformSnapshot(p) };
}

// ----------------------------------------------------------------------------
// Questionário de cada plataforma (/plataformas/<id>/proposta)
// ----------------------------------------------------------------------------
// Opções mostradas ao cliente (sem preços): identidade, módulos já incluídos
// e módulos opcionais da plataforma.
export function platformForm(p) {
  const d = platformDetails()[p.id] || {};
  const plan = planOf(p.id);
  return {
    id: p.id, name: p.name, category: p.category, tagline: p.tagline, palette: p.palette, logo_svg: p.logo_svg || null,
    headline: d.headline || p.tagline,
    included: (d.modules || p.features.map((t) => ({ title: t, text: "" })))
      .filter((m) => !/próximas fases/i.test(m.title))
      .map((m) => ({ name: m.title, description: m.text, icon: iconFor(m.title) })),
    optional: Object.fromEntries(offered(plan).map((k) => [k, MODULES[k] || TARGETS[k]]).filter(([, v]) => v)
      .map(([k, v]) => [k, { name: v.name, description: v.description, icon: v.icon }])),
  };
}

// Proposta a partir das respostas: módulos "agora" já entram no total; pontuação
// decide se ela é enviada na hora (simples) ou vai para a análise da equipe.
export function platformEstimate(p, brief, company) {
  const pp = platformProposal(p, { users: brief.users, company });
  const now = Object.entries(brief.modules || {}).filter(([, v]) => v === "agora").map(([k]) => k);
  const later = Object.entries(brief.modules || {}).filter(([, v]) => v === "futuro").map(([k]) => k);
  for (const it of pp.items) if (it.kind === "module") {
    it.selected = now.includes(it.key);
    it.origin = now.includes(it.key) || later.includes(it.key) ? "cliente" : "sugestao";
  }
  // os escolhidos primeiro, depois os "depois", depois as sugestões
  const rank = (i) => (i.kind === "core" ? 0 : i.selected ? 1 : i.origin === "cliente" ? 2 : 3);
  pp.items.sort((a, b) => rank(a) - rank(b));

  const u = USERS[brief.users] || USERS["11-50"];
  const deadlineScore = brief.deadline === "urgente" ? 2 : 0;
  const weights = now.map((k) => (MODULES[k] || TARGETS[k])?.weight || 1);
  const score = u.score + deadlineScore + weights.reduce((a, b) => a + b, 0);
  const reasons = [];
  if (u.score >= 4) reasons.push(`Escala de ${u.label.toLowerCase()}`);
  if (deadlineScore) reasons.push("Prazo menor que 1 mês");
  const heavy = now.filter((k) => ((MODULES[k] || TARGETS[k])?.weight || 0) >= 3).map((k) => (MODULES[k] || TARGETS[k]).name);
  if (heavy.length >= 2) reasons.push(`Integrações críticas: ${heavy.join(", ")}`);
  if (brief.notes && brief.notes.length > 600) reasons.push("Observações com regras específicas");
  const complexity = score <= 9 && !reasons.length ? "simples" : score <= 18 ? "media" : "complexa";
  pp.weeks += Math.ceil(now.length / 2);
  if (brief.description) pp.intro += ` Sobre a sua operação, você nos contou: “${brief.description.slice(0, 600)}”`;
  return { ...pp, score, complexity, reasons };
}
