/* ==========================================================================
   DRAP — Painéis dos serviços (/servicos/<id>)
   --------------------------------------------------------------------------
   Um bloco por serviço da home. Cada painel tem: visão geral, para quem é,
   o que está incluso, tutorial passo a passo (com progresso salvo no
   navegador), boas práticas de uso profissional, comparativo, autodiagnóstico
   e perguntas frequentes. Edite os textos aqui; a página e o SEO usam este
   mesmo arquivo. Condições comerciais (prazos, multas, preços) ficam na
   proposta e no contrato: não prometa aqui o que não estiver lá.
   ========================================================================== */
window.DRAP_SERVICES = {
  "licenciamento-saas": {
    code: "S/01", name: "Licenciamento SaaS", icon: "cloud",
    headline: "Use a plataforma por assinatura: sem servidor, sem equipe de TI e com custo previsível.",
    lead: "Você assina uma plataforma DRAP pronta e usa pelo navegador e pelo celular. Hospedagem, atualizações, backups e monitoramento ficam com a gente. Sua equipe só precisa usar.",
    tags: ["Multi-tenant", "SLA 99,9%", "Backups diários"],
    audience: [
      ["Pequenas e médias empresas", "Que querem sair da planilha e operar com sistema sem montar um time de TI."],
      ["Operações com pressa", "Que precisam estar no ar em semanas, com implantação e treinamento inclusos."],
      ["Gestores que querem previsibilidade", "Uma mensalidade fixa no lugar de servidores, licenças e manutenção avulsa."],
    ],
    included: [
      ["cloud", "Hospedagem em nuvem", "Servidores no Brasil, com escala automática conforme o uso cresce."],
      ["shield", "Segurança e LGPD", "Dados de cada empresa isolados (multi-tenant), acesso por permissão e conexão cifrada."],
      ["sync", "Atualizações contínuas", "Melhorias e correções chegam sem você instalar nada."],
      ["box", "Backups diários", "Cópia automática dos dados todos os dias."],
      ["chart", "Monitoramento 24/7", "Disponibilidade de 99,9% acompanhada com alertas em tempo real."],
      ["support", "Suporte especializado", "Atendimento por chamado, e-mail e WhatsApp, com quem conhece a plataforma."],
    ],
    steps: [
      ["Escolha a plataforma", "Veja os cases no portfólio e responda o questionário da plataforma que serve à sua operação. A proposta chega com implantação, licença mensal e módulos extras.", "Dica: marque como “prioridade” os módulos que mais doem hoje. Eles guiam a ordem do treinamento.", "/portfolio", "Abrir o portfólio"],
      ["Kick-off e acesso", "Depois do aceite, criamos o espaço da sua empresa e enviamos o convite do administrador por e-mail.", "Dica: escolha um responsável interno pelo sistema (o “dono”). Ele concentra as decisões e as dúvidas."],
      ["Usuários e permissões", "O administrador convida a equipe e define quem vê o quê. Comece pelos perfis por função (gestor, operação, financeiro) em vez de liberar tudo para todos.", "Dica: dê a cada pessoa o acesso mínimo para o trabalho dela. Fica mais seguro e a tela fica mais simples."],
      ["Dados iniciais", "Cadastros e planilhas atuais entram na implantação. Você revisa uma amostra antes da virada.", "Dica: aproveite para limpar duplicados e cadastros parados. Dado limpo no início economiza meses de retrabalho."],
      ["Treinamento ao vivo", "Sessões por perfil, gravadas, com o material de apoio. A equipe treina com os dados da sua empresa.", "Dica: peça que cada pessoa faça uma tarefa real durante o treinamento, não só assista."],
      ["Virada e uso diário", "Defina a data em que a planilha deixa de ser usada. A partir daí, tudo acontece na plataforma; dúvidas e problemas vão para o suporte.", "Dica: mantenha a planilha antiga só para consulta por 30 dias e depois arquive. Dois sistemas ao mesmo tempo geram erro."],
    ],
    practices: [
      ["Um dono do sistema", "Uma pessoa responsável por acessos, padrões de cadastro e contato com o suporte."],
      ["Acesso mínimo", "Cada perfil vê só o que precisa. Revise os acessos sempre que alguém entra ou sai da empresa."],
      ["Rotina semanal de indicadores", "Reserve 15 minutos por semana para olhar os números da plataforma com a equipe."],
      ["Fim das planilhas paralelas", "Depois da virada, toda informação nova entra só na plataforma."],
      ["Chamado, não improviso", "Problema ou ideia de melhoria vira chamado no suporte. Fica registrado e entra no plano de evolução."],
      ["Reunião mensal de evolução", "Uma conversa curta com a DRAP sobre o uso, os números e os próximos módulos."],
    ],
    compare: {
      left: "Planilhas e ferramentas soltas", right: "Plataforma DRAP por assinatura",
      rows: [
        ["Cópia de segurança", "Depende de alguém lembrar", "Backup automático diário"],
        ["Quem vê o quê", "Arquivo compartilhado com todos", "Permissão por perfil"],
        ["Histórico", "Versões perdidas em anexos", "Registro de quem fez o quê"],
        ["Atualização", "Manual, quando dá tempo", "Contínua, sem instalar nada"],
        ["Suporte", "O colega que montou a planilha", "Equipe especializada"],
        ["Custo", "Escondido em horas de retrabalho", "Mensalidade previsível"],
      ],
    },
    check: [
      "Mais de uma pessoa altera as mesmas planilhas",
      "Já perdemos informação por arquivo sobrescrito ou apagado",
      "Gastamos horas por semana juntando dados para ter um número",
      "Clientes ou fornecedores pedem informação que demoramos a achar",
      "Não sabemos com certeza quem tem acesso a quê",
      "Queremos crescer sem contratar alguém só para controlar planilhas",
    ],
    cta: { title: "Escolha a plataforma e receba a proposta", text: "Implantação, licença mensal e módulos extras, com valores, em poucos minutos.", href: "/portfolio", label: "Ver plataformas no portfólio" },
    faq: [
      ["Preciso instalar algum programa?", "Não. As plataformas rodam no navegador, no computador e no celular. Algumas têm aplicativo opcional."],
      ["O que acontece com as atualizações?", "Elas chegam automaticamente, sem custo extra e sem parar a sua operação."],
      ["Meus dados ficam separados dos de outras empresas?", "Sim. Cada empresa tem seus dados isolados (multi-tenant), com acesso controlado por permissão."],
      ["Quanto custa e qual é o contrato?", "Implantação e licença mensal aparecem na proposta, com as condições de pagamento. Responda o questionário da plataforma para receber a sua."],
    ],
  },

  "white-label": {
    code: "S/02", name: "White-label", icon: "globe",
    headline: "Revenda a plataforma como produto seu: sua marca, seu domínio, seus clientes.",
    lead: "Você coloca a sua marca numa plataforma DRAP pronta e vende como produto próprio. A engenharia, a hospedagem e o suporte técnico ficam com a gente; você foca em vender e atender.",
    tags: ["Domínio próprio", "Tema customizável", "Apps nas lojas"],
    audience: [
      ["Consultorias e agências", "Que atendem um nicho e querem uma receita recorrente com software próprio."],
      ["Associações e redes", "Que querem oferecer uma ferramenta com a própria marca aos associados ou franqueados."],
      ["Empreendedores de nicho", "Que conhecem um mercado e querem lançar um SaaS sem montar uma software house."],
    ],
    included: [
      ["globe", "Domínio próprio", "A plataforma abre no seu endereço, sem menção à DRAP para o cliente final."],
      ["sign", "Tema da sua marca", "Logo, cores e tipografia aplicadas, com contraste validado para acessibilidade."],
      ["mobile", "Apps nas lojas", "Publicação na sua conta de desenvolvedor, com o nome e o ícone da sua marca."],
      ["branches", "Multi-cliente", "Cada cliente seu com dados isolados, numa mesma base que você administra."],
      ["support", "Suporte técnico de retaguarda", "Você atende o seu cliente; a DRAP resolve o que é técnico."],
      ["sync", "Evolução contínua", "As melhorias da plataforma base chegam para os seus clientes também."],
    ],
    steps: [
      ["Escolha a plataforma base", "Veja no portfólio qual produto atende ao seu nicho. É sobre ele que a sua marca vai rodar.", "Dica: quanto mais específico o nicho, mais fácil vender. “Gestão para clínicas veterinárias” vende mais que “gestão para empresas”.", "/portfolio", "Abrir o portfólio"],
      ["Identidade da sua marca", "Você envia logo, cores e domínio. Aplicamos o tema e validamos contraste e legibilidade.", "Dica: tenha o domínio e as contas de desenvolvedor (Apple e Google) em nome da sua empresa desde o início."],
      ["Modelo comercial", "Defina como vai cobrar dos seus clientes: planos, implantação, módulos extras. Montamos com você a política de preços.", "Dica: cobre pelo valor que a ferramenta gera para o cliente, não pelo custo da licença."],
      ["Apps e lançamento", "Publicamos os aplicativos com a sua marca e preparamos a página de venda e o material comercial.", "Dica: use as folhas de case do portfólio como modelo para o seu material de vendas."],
      ["Onboarding dos seus clientes", "Você cadastra cada cliente; os dados ficam isolados. Treinamos a sua equipe para implantar sozinha.", "Dica: crie um roteiro de implantação padrão. Ele é o que permite crescer sem perder qualidade."],
      ["Suporte em dois níveis", "Seu time atende o cliente no dia a dia (nível 1); a DRAP resolve o técnico (nível 2).", "Dica: registre as dúvidas mais comuns e transforme em tutoriais com a sua marca."],
    ],
    practices: [
      ["Nicho claro", "Uma frase que diga para quem é e que problema resolve. Ela guia site, anúncio e preço."],
      ["Preço por valor", "Planos ligados ao resultado do cliente (unidades, usuários, volume), não ao custo."],
      ["Contrato com nível de serviço", "Defina com seus clientes prazos de atendimento coerentes com o suporte de retaguarda."],
      ["Implantação padronizada", "Checklist igual para todo cliente novo: menos erro e mais escala."],
      ["Indicadores de recorrência", "Acompanhe clientes ativos, cancelamentos e receita mensal desde o primeiro cliente."],
      ["Roadmap ouvindo o cliente", "Leve à DRAP os pedidos que se repetem. Eles viram evolução para todos."],
    ],
    compare: {
      left: "Construir um sistema do zero", right: "White-label DRAP",
      rows: [
        ["Tempo até vender", "Meses ou anos de desenvolvimento", "Semanas"],
        ["Investimento inicial", "Time de desenvolvimento completo", "Implantação e licença"],
        ["Risco técnico", "Todo seu", "Plataforma já em produção"],
        ["Manutenção", "Equipe própria permanente", "Inclusa, com evolução contínua"],
        ["Foco do seu time", "Dividido entre produto e venda", "Venda e atendimento"],
        ["Marca", "Sua", "Sua"],
      ],
    },
    check: [
      "Temos clientes num mesmo nicho que pedem uma ferramenta",
      "Conhecemos o processo desse nicho melhor que os concorrentes",
      "Queremos receita recorrente, não só projetos pontuais",
      "Temos equipe para vender e atender, mas não para desenvolver",
      "Uma plataforma do portfólio já resolve a maior parte do problema",
      "Queremos lançar em semanas, não em anos",
    ],
    cta: { title: "Converse sobre white-label com um especialista", text: "Mostramos a plataforma com a sua marca e montamos com você o modelo comercial.", href: "/#contato", label: "Falar com um especialista" },
    faq: [
      ["O cliente final vê a marca DRAP?", "Não. A plataforma roda no seu domínio, com a sua marca, e os apps saem na sua conta de desenvolvedor."],
      ["Quem atende o meu cliente?", "Você atende o dia a dia; a DRAP dá o suporte técnico de retaguarda para a sua equipe."],
      ["Posso pedir funcionalidades para o meu nicho?", "Sim. Módulos sob medida entram como projeto à parte, com proposta própria."],
      ["Como fica o preço para mim?", "As condições de white-label são combinadas na proposta, conforme a plataforma e o volume de clientes."],
    ],
  },

  "consultoria": {
    code: "S/04", name: "Consultoria & Business", icon: "bi",
    headline: "Arquitetura, cloud, dados e estratégia para transformar tecnologia em vantagem competitiva.",
    lead: "Uma equipe sênior olha a sua operação de fora, encontra onde a tecnologia está custando caro ou deixando dinheiro na mesa e entrega um plano priorizado, com custos e metas. Se quiser, acompanhamos a execução.",
    tags: ["Cloud & DevOps", "Dados & BI", "Go-to-market"],
    audience: [
      ["Empresas que cresceram rápido", "Com sistemas que não conversam e custos de nuvem que só sobem."],
      ["Gestores que decidem no escuro", "Que têm dados espalhados e querem indicadores confiáveis."],
      ["Quem vai lançar um produto digital", "E quer acertar arquitetura, preço e canal antes de investir pesado."],
    ],
    included: [
      ["cloud", "Cloud & DevOps", "Arquitetura, custos de nuvem, deploy automatizado, monitoramento e segurança."],
      ["bi", "Dados & BI", "Organização dos dados, indicadores que importam e painéis para decisão."],
      ["rocket", "Go-to-market", "Posicionamento, precificação e canais para lançar ou escalar um produto digital."],
      ["report", "Diagnóstico escrito", "Relatório com o que encontramos, o impacto e a prioridade de cada ponto."],
      ["calendar", "Plano de ação", "Roadmap com ganhos rápidos, projetos maiores, custos e responsáveis."],
      ["team", "Execução acompanhada", "Opcional: implementamos com o seu time ou acompanhamos quem implementa."],
    ],
    steps: [
      ["Conversa inicial", "Uma reunião para entender objetivos, dores e o contexto. Saímos com o escopo do diagnóstico.", "Dica: chegue com 2 ou 3 decisões que você precisa tomar nos próximos meses. Elas orientam todo o trabalho.", "/#contato", "Agendar conversa"],
      ["Diagnóstico", "Entrevistas com as áreas e análise de sistemas, custos e dados. Você libera os acessos de leitura necessários.", "Dica: indique uma pessoa de contato em cada área. O diagnóstico anda no ritmo das respostas."],
      ["Relatório de prioridades", "Apresentamos o que encontramos, com impacto estimado e esforço de cada ponto, do mais urgente ao menos.", "Dica: comece pelos ganhos rápidos. Eles pagam o restante do plano e criam confiança no time."],
      ["Plano de ação", "Roadmap com etapas, custos, responsáveis e metas mensuráveis para cada frente.", "Dica: defina uma meta numérica por frente (custo de nuvem, tempo de fechamento, conversão). Sem número, não há como saber se deu certo."],
      ["Execução", "Implementamos com o seu time ou acompanhamos quem implementa, com checkpoints quinzenais.", "Dica: mantenha um patrocinador na diretoria que destrave decisões rapidamente."],
      ["Revisão trimestral", "A cada trimestre comparamos as metas com o realizado e ajustamos o plano.", "Dica: leve as novas prioridades do negócio para a revisão. O plano deve mudar com a empresa."],
    ],
    practices: [
      ["Patrocinador definido", "Uma pessoa da diretoria responsável pelas decisões e prioridades."],
      ["Metas mensuráveis", "Cada frente com um número antes e um número alvo."],
      ["Acesso de leitura, não de escrita", "Para o diagnóstico, basta ver. Mais seguro para todos."],
      ["Ganhos rápidos primeiro", "Resultados nas primeiras semanas sustentam o investimento no restante."],
      ["Documentar decisões", "Cada decisão do plano registrada com o motivo, para quem vier depois."],
      ["Revisar sempre", "O plano é revisado a cada trimestre e acompanha a estratégia do negócio."],
    ],
    compare: {
      left: "Decidir no improviso", right: "Com consultoria DRAP",
      rows: [
        ["Prioridades", "Quem fala mais alto define", "Impacto e esforço medidos"],
        ["Custos de tecnologia", "Crescem sem explicação", "Mapeados e otimizados"],
        ["Dados para decidir", "Espalhados e conflitantes", "Indicadores confiáveis"],
        ["Lançamentos", "Aposta", "Hipóteses testadas e metas"],
        ["Acompanhamento", "Ninguém mede depois", "Revisão trimestral"],
        ["Conhecimento", "Na cabeça de poucas pessoas", "Documentado"],
      ],
    },
    check: [
      "Nossa conta de nuvem ou de software cresce sem sabermos por quê",
      "Cada área tem um número diferente para o mesmo indicador",
      "Temos sistemas que não conversam e exigem retrabalho manual",
      "Vamos lançar ou escalar um produto digital nos próximos meses",
      "Decisões de tecnologia dependem de uma ou duas pessoas",
      "Não sabemos o que priorizar com o orçamento de tecnologia",
    ],
    cta: { title: "Agende uma conversa inicial", text: "Em uma reunião entendemos o contexto e propomos o escopo do diagnóstico.", href: "/#contato", label: "Falar com um especialista" },
    faq: [
      ["Quanto tempo leva o diagnóstico?", "Depende do tamanho da operação e das áreas envolvidas; o prazo é definido no escopo, depois da conversa inicial."],
      ["Vocês executam o plano ou só recomendam?", "Os dois. A execução é opcional: podemos implementar com o seu time ou acompanhar quem implementa."],
      ["Precisam de acesso aos nossos sistemas?", "Para o diagnóstico, só acesso de leitura e as entrevistas. Nada é alterado sem aprovação."],
      ["Serve para empresa que não usa plataforma da DRAP?", "Sim. A consultoria vale para qualquer stack e qualquer fornecedor."],
    ],
  },
};
