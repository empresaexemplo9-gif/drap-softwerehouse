/* ==========================================================================
   DRAP — Catálogo de plataformas
   --------------------------------------------------------------------------
   Este é o ÚNICO arquivo que você precisa editar para trocar as plataformas.
   Cada item gera um card na home automaticamente.

   Campos:
     id        identificador curto (sem espaços)
     name      nome comercial da plataforma
     code      código interno exibido no card (ex.: "PLT-01")
     category  segmento / tipo de produto
     tagline   frase curta de posicionamento
     summary   explicação prévia (2–3 linhas)
     features  até 4 destaques
     stack     tecnologias (chips)
     status    "Disponível" | "Beta" | "Sob demanda"
     palette   cores oficiais da plataforma: a 1ª é a cor primária do card
     logo      { svg: '<svg …>' }  (use fill="currentColor" para herdar a cor)
               { mask: 'assets/…png' } (PNG pintado na cor primária; requer servidor http)
               { src: 'assets/…svg' }  (imagem com as cores originais)
     url       link da página / demo da plataforma
     repo      repositório de origem (referência interna)

   Dados extraídos dos repositórios de cada plataforma (README, docs de
   identidade e tokens de tema).
   ========================================================================== */

/* Símbolo "D" da DRAP: mesma geometria usada nos repositórios Fazenda e Pecuária */
const DRAP_D_FAZENDA =
  '<svg viewBox="20.3 5.98 57.2 56.9" fill="currentColor" aria-hidden="true"><path d="M65.41 6.62 39.43 62.87h22.18c8.6 0 15.53-9.61 15.53-21.55V27.53c0-10.12-4.97-18.57-11.73-20.91z"/><path d="M20.36 5.98c-.08 18.97-.05 37.93 0 56.9h18.79L62.76 6.04a11.6 11.6 0 0 0-1.15-.06z"/></svg>';

window.DRAP_PLATFORMS = [
  {
    id: "backoffice",
    name: "DRAP Backoffice",
    code: "PLT-01",
    category: "Arquitetura & Construção",
    tagline: "O backoffice completo do escritório de arquitetura.",
    summary:
      "SaaS multiempresa para arquitetura, engenharia e obras: do lead à proposta aceita online, com orçamentos com BDI, diário de obra, financeiro por obra, portal do cliente e a Prancheta, que abre DWG, IFC e PDF no navegador.",
    features: ["Orçamentos & propostas", "Diário de obra", "Prancheta DWG / IFC", "Portal do cliente"],
    stack: ["Next.js", "TypeScript", "Recharts"],
    status: "Disponível",
    palette: ["#27557B", "#204362", "#0D151F", "#B0ADA8"],
    logo: {
      svg: '<svg viewBox="0 0 320 330" fill="currentColor" aria-hidden="true"><mask id="m-backoffice" maskUnits="userSpaceOnUse" x="0" y="0" width="320" height="330"><rect width="320" height="330" fill="#fff"/><path d="M236 -4L252 -4L103 334L97 334Z" fill="#000"/></mask><path d="M0 0H232C284 0 320 46 320 100V230C320 292 284 330 236 330H0Z" mask="url(#m-backoffice)"/></svg>'
    },
    url: "https://nexo-obra-jet.vercel.app",
    repo: "empresaexemplo9-gif/Nexo-obra"
  },
  {
    id: "professor",
    name: "DRAP Professor",
    code: "PLT-02",
    category: "Educação & Capacitação",
    tagline: "Seu campus digital, com a sua marca.",
    summary:
      "Plataforma EAD/LMS white-label e multi-segmento para vender e ministrar mentorias, cursos e capacitações. Inclui trilhas por nível e módulo, perfis de acesso, tema por cliente com contraste validado, 2FA e conformidade com a LGPD.",
    features: ["White-label multi-tenant", "Trilhas & progresso", "Perfis & permissões", "2FA + LGPD"],
    stack: ["Next.js 15", "PostgreSQL", "Prisma"],
    status: "Disponível",
    palette: ["#25465A", "#C9A86A", "#102A3C", "#FAF9F6"],
    logo: {
      svg: '<svg viewBox="0 0 320 330" fill="currentColor" aria-hidden="true"><mask id="m-professor" maskUnits="userSpaceOnUse" x="0" y="0" width="320" height="330"><rect width="320" height="330" fill="#fff"/><path d="M236 -4L252 -4L103 334L97 334Z" fill="#000"/></mask><path d="M0 0H232C284 0 320 46 320 100V230C320 292 284 330 236 330H0Z" mask="url(#m-professor)"/></svg>'
    },
    url: "https://drap-professor.vercel.app",
    repo: "empresaexemplo9-gif/DRAP-professor"
  },
  {
    id: "fazenda",
    name: "DRAP Fazenda",
    code: "PLT-03",
    category: "Agronegócio",
    tagline: "Um lançamento, todas as planilhas em dia.",
    summary:
      "Gestão financeira e agrícola da fazenda integrada ao Google Planilhas: cada lançamento alimenta acerto entre sócios, livro-razão por safra e pecuária. Faz conciliação bancária por OFX, emite NF-e de grãos e assina PDFs com certificado ICP-Brasil.",
    features: ["Sync Google Planilhas", "Conciliação OFX", "NF-e de grãos", "Assinatura ICP-Brasil"],
    stack: ["Next.js", "Supabase", "Sheets API"],
    status: "Disponível",
    palette: ["#486B3A", "#7A5C3B", "#111410", "#F7F4EC"],
    logo: { svg: DRAP_D_FAZENDA },
    url: "#contato",
    repo: "psaprincesa-netizen/fazenda-app"
  },
  {
    id: "pecuaria",
    name: "DRAP Pecuária",
    code: "PLT-04",
    category: "Agronegócio",
    tagline: "Gestão do rebanho que funciona sem sinal.",
    summary:
      "Rebanho, sanidade, pastagem, estoque e livro-razão, com módulos de Corte, Leite e Genética ativados conforme a operação. Calcula o custo da arroba e do litro e sincroniza nos dois sentidos com Google Planilhas ou Excel.",
    features: ["100% offline (PWA)", "Corte · Leite · Genética", "Custo da arroba e do litro", "Sync planilha / Excel"],
    stack: ["Next.js", "PWA", "Vitest"],
    status: "Disponível",
    palette: ["#7A5C3B", "#486B3A", "#111410", "#FBFAF5"],
    logo: { svg: DRAP_D_FAZENDA },
    url: "#contato",
    repo: "empresaexemplo9-gif/drap-fazenda-criacao"
  },
  {
    id: "office",
    name: "DRAP office",
    code: "PLT-05",
    category: "Produtividade",
    tagline: "Um espaço, dez maneiras de criar.",
    summary:
      "Plataforma unificada de produtividade em português: documentos, planilhas, apresentações, notas, projetos, agenda, formulários, banco de dados, diagramas e portais, com biblioteca, busca, permissões e histórico compartilhados. Importa e exporta DOCX, XLSX e PPTX.",
    features: ["10 editores integrados", "DOCX · XLSX · PPTX", "Motor de fórmulas", "Permissões & histórico"],
    stack: ["Python", "PostgreSQL", "Univer"],
    status: "Beta",
    palette: ["#4B5320", "#23332E", "#E4EDDD", "#F5F7F4"],
    logo: { svg: DRAP_D_FAZENDA },
    url: "https://new-balance-pi.vercel.app",
    repo: "psaprincesa-netizen/new-balance"
  },
  {
    id: "concord",
    name: "DRAP Concord",
    code: "PLT-06",
    category: "Atendimento & Agenda",
    tagline: "Agenda, CRM e atendimento para quem atende o público.",
    summary:
      "Agenda inteligente, CRM e organizador de atendimentos para saúde, jurídico, esporte, educação e beleza. Cada profissão é um perfil configurável, sem deploy. Inclui portal do cliente, vitrine pública com agendamento e apps para Android, Windows e desktop.",
    features: ["Agenda inteligente", "Portal do cliente", "Vitrine pública", "Perfis por profissão"],
    stack: ["Next.js", "Prisma", "PostgreSQL"],
    status: "Disponível",
    palette: ["#1F4E5A", "#C8745A", "#F3EBDF", "#2B2622"],
    logo: {
      svg: '<svg viewBox="0 0 778 781" fill="currentColor" aria-hidden="true"><path d="M0 0H533L212 781H0Z"/><path d="M581 2C601 2 777 60 777 290V480C777 675 652 781 512 781H219Z"/></svg>'
    },
    url: "#contato",
    repo: "empresaexemplo9-gif/drap-concord"
  }
];
