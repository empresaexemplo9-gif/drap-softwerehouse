/* ==========================================================================
   DRAP — Conteúdo das páginas de cada plataforma (/plataformas/<id>)
   --------------------------------------------------------------------------
   Texto comercial para o cliente. Baseado no que cada plataforma de fato
   entrega, conforme o código e a documentação dos repositórios.
   Edite à vontade: cada chave corresponde ao id da plataforma.

   Campos: headline, lead, audience[], pains[], outcomes[{title,text}],
           modules[{title,text}], steps[{title,text}], differentials[],
           security[], faq[{q,a}], cta
   ========================================================================== */

window.DRAP_DETAILS = {
  backoffice: {
    headline: "Seu escritório de arquitetura funcionando como uma empresa, não como uma planilha.",
    lead:
      "O DRAP Backoffice reúne, num só lugar, tudo o que acontece entre o primeiro contato do cliente e a entrega da obra: proposta, orçamento, projeto, cronograma, diário de obra, financeiro e arquivos. A equipe para de procurar informação em WhatsApp, e-mail e pastas soltas e passa a trabalhar sobre um único fluxo, claro e previsível.",
    audience: ["Escritórios de arquitetura", "Engenharia e projetos", "Construtoras e reformas", "Design de interiores"],
    pains: [
      "Orçamentos montados do zero em planilhas diferentes, sem histórico de versões nem margem visível.",
      "Propostas enviadas como PDF sem saber se o cliente abriu, quando abriu ou se aceitou.",
      "Diário de obra no papel ou no celular de cada pessoa, sem relatório para o cliente.",
      "Arquivos DWG, PDF e IFC espalhados, abertos só por quem tem o software instalado.",
    ],
    outcomes: [
      { title: "Fecha mais propostas", text: "Proposta online com link próprio, aviso de abertura e aceite registrado com nome, documento e data. O cliente aceita sem baixar nada, e você sabe na hora." },
      { title: "Margem sob controle", text: "Orçamentos com versões, BDI, margem e biblioteca própria de itens. Copie um orçamento aprovado e ajuste em minutos, sem perder o histórico." },
      { title: "Obra transparente", text: "Diário de obra com clima, equipe, ocorrências e fotos, e um portal onde o cliente acompanha o que você decidir publicar. Menos ligações, mais confiança." },
      { title: "Equipe no mesmo ritmo", text: "Tarefas com prazo, lembretes diários, metas calculadas sobre dados reais e comunicação interna por canal ou conversa direta." },
    ],
    modules: [
      { title: "CRM e funil comercial", text: "Leads, oportunidades e follow-ups com lembrete automático." },
      { title: "Orçamentos e propostas", text: "Versões por projeto, BDI, margem, biblioteca de itens e proposta editável com prévia igual à do cliente." },
      { title: "Projetos e obras", text: "Central de cada obra com resumo, planejamento, tarefas, custos e registros no mesmo contexto." },
      { title: "Diário de obra", text: "Atividades, clima, equipe, ocorrências, fotos privadas e relatório pronto para PDF." },
      { title: "Prancheta", text: "Abre DWG, DXF, PDF, IFC em 3D, STL, OBJ e imagens direto no navegador, com medição e camadas." },
      { title: "Documentos e PDF", text: "Memorial, ata e escopo a partir de modelos; juntar, dividir, numerar e converter PDFs sem sair da plataforma." },
      { title: "Financeiro por obra", text: "Centros de custo, contas, cobranças e relatórios exportáveis." },
      { title: "Portal do cliente", text: "Convite por e-mail, publicação seletiva do diário, aprovações e pedidos de ajuste com histórico." },
    ],
    steps: [
      { title: "Diagnóstico do escritório", text: "Entendemos seu fluxo atual, modelos de orçamento e como sua equipe trabalha hoje." },
      { title: "Configuração da empresa", text: "Cadastro da empresa, equipe, permissões, biblioteca de itens e modelos de proposta." },
      { title: "Migração", text: "Importamos clientes, projetos e orçamentos que já existem para você começar com dados reais." },
      { title: "Treinamento e acompanhamento", text: "Treinamos a equipe e acompanhamos as primeiras semanas de uso." },
    ],
    differentials: [
      "Feito para o ciclo real do escritório: do lead ao aceite e da obra ao financeiro.",
      "Abre arquivos de projeto no navegador, sem licença extra de software para quem só precisa consultar.",
      "Aceite de proposta com registro completo, válido como trilha de auditoria comercial.",
      "Multiempresa com dados isolados: ideal para grupos ou escritórios parceiros.",
    ],
    security: ["Isolamento de dados por empresa", "Arquivos enviados em partes cifradas", "Senhas protegidas e sessões controladas", "Conformidade com a LGPD"],
    faq: [
      { q: "Preciso instalar algum programa?", a: "Não. Tudo roda no navegador, no computador ou no celular, inclusive a visualização de DWG, IFC e PDF." },
      { q: "Consigo usar meus modelos de orçamento atuais?", a: "Sim. Na implantação montamos sua biblioteca de itens e importamos orçamentos existentes." },
      { q: "O cliente precisa criar conta para aceitar a proposta?", a: "Não. Ele recebe um link assinado, lê a proposta e aceita ali mesmo. O aceite fica registrado." },
      { q: "Funciona para mais de um escritório?", a: "Sim. A plataforma é multiempresa, com os dados de cada empresa totalmente isolados." },
    ],
    cta: "Veja o Backoffice com os dados do seu escritório",
  },

  professor: {
    headline: "Sua própria plataforma de cursos, com a sua marca, pronta para vender.",
    lead:
      "O DRAP Professor é um campus digital completo para quem ensina: mentores, consultorias, escolas, empresas que treinam equipes e associações. Você publica trilhas, cursos e mentorias, controla quem acessa o quê e acompanha o progresso de cada aluno, tudo com a identidade visual da sua instituição.",
    audience: ["Mentores e consultorias", "Escolas e cursos livres", "Treinamento corporativo (T&D)", "Associações e entidades de classe"],
    pains: [
      "Conteúdo espalhado entre YouTube, Drive e grupos de WhatsApp, sem controle de acesso.",
      "Plataformas genéricas que cobram por aluno e exibem a marca delas, não a sua.",
      "Nenhuma visão de quem realmente concluiu, quem parou e onde.",
      "Dificuldade de organizar programas longos em níveis, módulos e assuntos.",
    ],
    outcomes: [
      { title: "Sua marca em primeiro lugar", text: "Cores, fontes, logotipo e domínio da sua instituição. O aluno vê a sua escola, não a nossa." },
      { title: "Conteúdo organizado de verdade", text: "Estrutura em Nível, Segmento, Módulo e Assunto, com trilhas, índice e “continuar de onde parei”." },
      { title: "Gestão por perfil", text: "Administrador, pedagógico, instrutor/mentor e aluno, cada um vendo apenas o que precisa." },
      { title: "Segurança de instituição séria", text: "Login com verificação em duas etapas, aceite de termos registrado e dados pessoais protegidos." },
    ],
    modules: [
      { title: "Catálogo e trilhas", text: "Cursos, mentorias e capacitações organizados por nível e segmento." },
      { title: "Editor de conteúdo", text: "Aulas em blocos com prévia em celular, tablet e desktop, e histórico de versões." },
      { title: "Meu aprendizado", text: "Progresso por módulo, conclusão de assuntos e retomada automática." },
      { title: "Perfis e permissões", text: "Convites por link, papéis combináveis e desativação de acesso." },
      { title: "Tema por instituição", text: "Cores do modo claro e escuro com validação automática de contraste (acessibilidade)." },
      { title: "Auditoria", text: "Registro das ações sensíveis da equipe." },
      { title: "API", text: "Integração com outros sistemas da sua instituição." },
      { title: "Próximas fases", text: "Biblioteca de materiais, avaliações, fórum, certificados e pagamentos já planejados no roadmap." },
    ],
    steps: [
      { title: "Identidade", text: "Aplicamos sua marca, domínio e modo de cores." },
      { title: "Estrutura pedagógica", text: "Montamos com você os níveis, segmentos e módulos do seu programa." },
      { title: "Conteúdo", text: "Publicamos ou migramos suas aulas e materiais." },
      { title: "Turmas", text: "Cadastramos equipe e alunos e acompanhamos o lançamento." },
    ],
    differentials: [
      "White-label de verdade: a plataforma é sua, sem marca de terceiros.",
      "Multi-segmento: atende ensino corporativo, mentoria e escola livre na mesma base.",
      "Acessibilidade validada (contraste e navegação por teclado) desde o design system.",
      "Arquitetura multi-instituição com isolamento de dados no banco.",
    ],
    security: ["Verificação em duas etapas (2FA)", "CPF cifrado", "Aceite de termos e privacidade versionado", "Isolamento por instituição no banco de dados"],
    faq: [
      { q: "Posso usar meu próprio domínio?", a: "Sim. A plataforma identifica a instituição pelo domínio e aplica sua identidade visual." },
      { q: "Serve para treinar minha equipe interna?", a: "Sim. Você controla matrículas e acompanha o progresso de cada colaborador." },
      { q: "Tenho conteúdo em PDF e Word. Dá para aproveitar?", a: "Sim. Na implantação organizamos e publicamos seu material existente." },
      { q: "Vou ter certificados?", a: "A certificação com validação pública faz parte do roadmap da plataforma." },
    ],
    cta: "Monte o seu campus digital com a DRAP",
  },

  fazenda: {
    headline: "A gestão financeira da fazenda sem digitar o mesmo dado três vezes.",
    lead:
      "O DRAP Fazenda nasceu dentro de uma operação agrícola real. Um único lançamento alimenta automaticamente as planilhas que os sócios já usam (acerto entre sócios, livro-razão por safra e pecuária), e a plataforma cuida do resto: conciliação bancária, notas fiscais de grãos, contas a pagar e assinatura digital de documentos.",
    audience: ["Fazendas de grãos", "Operações com sócios", "Agricultura e pecuária integradas", "Escritórios rurais e contadores do agro"],
    pains: [
      "O mesmo gasto digitado em várias planilhas, com erro e retrabalho.",
      "Extrato do banco conferido linha por linha, à mão, todo mês.",
      "Acerto entre sócios que vira discussão porque ninguém confia no número.",
      "Notas fiscais, romaneios e contratos em papel, sem assinatura digital válida.",
    ],
    outcomes: [
      { title: "Um lançamento, tudo atualizado", text: "Você lança uma vez e as planilhas de acerto, lavoura e pecuária se atualizam. As planilhas continuam sendo a fonte da verdade." },
      { title: "Conciliação em minutos", text: "O extrato OFX do banco vira uma prévia já casada com os lançamentos, para revisar e confirmar." },
      { title: "Sócios alinhados", text: "Saldo corrente e histórico de créditos e débitos entre os sócios, com uma tela só de leitura para quem só acompanha." },
      { title: "Decisão por safra", text: "Despesa por safra, cultura, fornecedor e plano de contas, realizado contra previsto." },
    ],
    modules: [
      { title: "Lançamentos", text: "Lista unificada das planilhas com busca, filtros, edição e novo lançamento." },
      { title: "Acerto entre sócios", text: "Saldo e histórico transparentes, sempre atualizados." },
      { title: "Posição", text: "O que precisa ser pago no período, com totais e relatório em PDF." },
      { title: "Análises", text: "Painéis por safra, cultura, fornecedor e plano de contas." },
      { title: "Conciliação bancária", text: "Importação de OFX com casamento automático antes de virar lançamento." },
      { title: "NF-e de grãos", text: "Emissão e entrada de notas fiscais integradas." },
      { title: "PDF e assinatura digital", text: "Assinatura com certificado ICP-Brasil e um kit completo de ferramentas de PDF." },
      { title: "App no celular", text: "Instalável como aplicativo, para lançar direto do campo." },
    ],
    steps: [
      { title: "Mapeamento", text: "Conhecemos suas planilhas atuais, plano de contas e bancos." },
      { title: "Conexão", text: "Ligamos a plataforma às suas planilhas Google, sem mudar a forma como os sócios já trabalham." },
      { title: "Fiscal e bancos", text: "Configuramos emissão de NF-e e o modelo de conciliação de cada banco." },
      { title: "Uso assistido", text: "Acompanhamos os primeiros fechamentos de mês com você." },
    ],
    differentials: [
      "Não obriga ninguém a abandonar a planilha: ela continua sendo a referência.",
      "Construído e validado numa operação agrícola em funcionamento.",
      "Assinatura digital com validade jurídica (ICP-Brasil) incluída.",
      "Rastreabilidade de quem lançou, alterou ou aprovou cada registro.",
    ],
    security: ["Usuários com permissões por função", "Trilha de auditoria", "Assinatura PAdES com certificado A1", "Senhas protegidas"],
    faq: [
      { q: "Vou ter que parar de usar minhas planilhas?", a: "Não. A plataforma escreve nas suas planilhas, e elas continuam sendo a fonte oficial dos dados." },
      { q: "Funciona com o meu banco?", a: "A conciliação usa arquivos OFX, padrão dos principais bancos. Validamos o seu na implantação." },
      { q: "Meu sócio pode só acompanhar?", a: "Sim. Existe uma interface simplificada e somente de leitura para sócios." },
      { q: "Emite nota fiscal?", a: "Sim, emissão e entrada de NF-e de grãos integradas." },
    ],
    cta: "Leve o DRAP Fazenda para a sua operação",
  },

  pecuaria: {
    headline: "Gestão do rebanho que funciona no curral, mesmo sem sinal.",
    lead:
      "O DRAP Pecuária foi feito para a realidade do campo: tudo o que o vaqueiro anota fica salvo no aparelho e sincroniza quando o sinal volta. Rebanho, sanidade, pastagem, estoque e financeiro num só lugar, com os módulos de Corte, Leite e Genética ativados conforme a sua operação, e o custo real da arroba e do litro calculado automaticamente.",
    audience: ["Pecuária de corte", "Pecuária leiteira", "Genética e seleção", "Operações mistas de cria, recria e engorda"],
    pains: [
      "Anotações em caderno que se perdem antes de chegar ao escritório.",
      "Aplicativos que travam no pasto por falta de internet.",
      "Não saber, de fato, quanto custa produzir uma arroba ou um litro.",
      "Vacinas, pesagens e manejos esquecidos ou feitos fora do prazo.",
    ],
    outcomes: [
      { title: "Nada se perde no campo", text: "Funciona offline. Cada registro fica guardado no aparelho e é enviado quando houver sinal." },
      { title: "Custo de produção real", text: "Custo da arroba e do litro calculado a partir dos lançamentos, para negociar e decidir com número na mão." },
      { title: "Manejo no prazo", text: "Painel “o que precisa da sua atenção hoje”, com vacinas, pesagens e trocas de piquete, e atrasos em destaque." },
      { title: "Só o que você usa", text: "Na primeira entrada você escolhe: corte, leite, genética ou a combinação. A tela mostra apenas o que a sua operação faz." },
    ],
    modules: [
      { title: "Rebanho e identificação", text: "Animais por lote, brinco, RFID e SISBOV." },
      { title: "Sanidade e manejo", text: "Agenda de vacinas, tratamentos e pesagens com alertas de atraso." },
      { title: "Pastagens", text: "Controle de piquetes, lotação e rotação." },
      { title: "Corte", text: "Ganho de peso, engorda e projeção de venda." },
      { title: "Leite", text: "Produção diária e custo do litro." },
      { title: "Genética", text: "Reprodução, prenhez e acompanhamento genético." },
      { title: "Estoque e livro-razão", text: "Insumos, plano de contas em 3 níveis, contas a pagar e a receber." },
      { title: "Planilha e Excel", text: "Sincronização nos dois sentidos com Google Planilhas ou Excel." },
    ],
    steps: [
      { title: "Perfil da operação", text: "Definimos juntos os módulos: corte, leite, genética ou combinação." },
      { title: "Cadastro do rebanho", text: "Importamos animais e lotes da sua planilha atual." },
      { title: "Equipe no campo", text: "Instalamos o app nos aparelhos da equipe e treinamos o uso offline." },
      { title: "Primeiros fechamentos", text: "Acompanhamos o primeiro ciclo de custos para validar os números." },
    ],
    differentials: [
      "Offline de verdade, pensado para quem trabalha longe do sinal.",
      "Mesma base visual e métodos do DRAP Fazenda: integra lavoura e pecuária.",
      "Mais de 90 testes automatizados cobrindo as regras de negócio.",
      "Reconhece o mesmo animal por brinco, RFID, SISBOV ou nome ao importar planilhas.",
    ],
    security: ["Dados guardados no aparelho até sincronizar", "Fila de pendências visível para a equipe", "Registro de quem anotou cada informação", "Backup na planilha do produtor"],
    faq: [
      { q: "Funciona mesmo sem internet?", a: "Sim. Tudo é salvo no aparelho e sincronizado automaticamente quando houver sinal." },
      { q: "Tenho só gado de corte. Vou ver telas de leite?", a: "Não. Você escolhe as atividades e a plataforma mostra apenas o que faz parte da sua operação." },
      { q: "Consigo importar meu rebanho da planilha?", a: "Sim, de Google Planilhas ou Excel, reconhecendo animais por brinco, RFID, SISBOV ou nome." },
      { q: "Integra com o DRAP Fazenda?", a: "Sim. As duas plataformas compartilham métodos de livro-razão e plano de contas." },
    ],
    cta: "Coloque o seu rebanho no DRAP Pecuária",
  },

  office: {
    headline: "Documentos, planilhas, apresentações e projetos num só espaço, em português.",
    lead:
      "O DRAP office é uma plataforma unificada de produtividade: dez editores que compartilham contas, biblioteca, busca, permissões, histórico e lixeira. Sua equipe escreve, calcula, apresenta e organiza projetos sem pular entre ferramentas e sem depender de licenças estrangeiras para cada pessoa.",
    audience: ["Pequenas e médias empresas", "Escritórios e consultorias", "Instituições que precisam de dados no Brasil", "Equipes que querem uma ferramenta própria"],
    pains: [
      "Arquivos espalhados entre várias ferramentas, cada uma com login e permissão diferentes.",
      "Licenças por usuário que encarecem conforme a equipe cresce.",
      "Versões de documento que se perdem em anexos de e-mail.",
      "Dificuldade de padronizar documentos, planilhas e apresentações da empresa.",
    ],
    outcomes: [
      { title: "Tudo conectado", text: "Escreva um documento, transforme em apresentação, conecte os dados da planilha. Um espaço, uma busca, uma lixeira." },
      { title: "Compatível com o que você já tem", text: "Importa e exporta DOCX, XLSX e PPTX reais, com abas, slides, notas e formas editáveis." },
      { title: "Controle de acesso", text: "Permissões por arquivo, histórico de alterações e arquivos privados até você compartilhar." },
      { title: "Plataforma da sua empresa", text: "Pode ser publicada com a sua marca e na sua infraestrutura." },
    ],
    modules: [
      { title: "Documentos", text: "Editor de texto com importação e exportação DOCX." },
      { title: "Planilhas", text: "Motor de fórmulas, tabelas dinâmicas e gráficos, com XLSX." },
      { title: "Apresentações", text: "Slides com imagens, caixas de texto e formas, com PPTX." },
      { title: "Anotações e projetos", text: "Notas rápidas e gestão de projetos da ideia à entrega." },
      { title: "Agenda", text: "Organização de tempo e compromissos da equipe." },
      { title: "Formulários", text: "Perguntas, coleta de respostas e link público." },
      { title: "Banco de dados e diagramas", text: "Informações estruturadas e fluxos de processo." },
      { title: "Portais", text: "Um ponto de encontro para equipes e clientes." },
    ],
    steps: [
      { title: "Espaço de trabalho", text: "Criamos o ambiente da empresa com sua identidade." },
      { title: "Migração de arquivos", text: "Importamos documentos, planilhas e apresentações existentes." },
      { title: "Permissões", text: "Organizamos equipes, pastas e níveis de acesso." },
      { title: "Adoção", text: "Treinamos a equipe e acompanhamos o uso nas primeiras semanas." },
    ],
    differentials: [
      "Interface 100% em português, pensada para o usuário brasileiro.",
      "Dez editores integrados sob as mesmas permissões e a mesma busca.",
      "Compatibilidade com os formatos do Office (DOCX, XLSX, PPTX).",
      "Em evolução contínua, com mapa de cobertura de recursos transparente.",
    ],
    security: ["Senhas com mínimo de 12 caracteres", "Arquivos privados por padrão", "Histórico e lixeira", "Banco PostgreSQL com conexão cifrada"],
    faq: [
      { q: "Consigo abrir meus arquivos do Word e do Excel?", a: "Sim. A plataforma importa e exporta DOCX, XLSX e PPTX." },
      { q: "Está pronto para toda a empresa?", a: "O DRAP office está em versão beta: os editores principais funcionam e a cobertura de recursos cresce a cada versão. Avaliamos com você o encaixe no seu uso." },
      { q: "Posso ter com a minha marca?", a: "Sim. Publicamos a plataforma com a identidade da sua empresa." },
      { q: "Onde ficam os dados?", a: "Em banco PostgreSQL com conexão cifrada, na infraestrutura definida no projeto." },
    ],
    cta: "Experimente o DRAP office na sua equipe",
  },

  concord: {
    headline: "Agenda cheia, cliente bem atendido e zero mensagem perdida.",
    lead:
      "O DRAP Concord é a agenda inteligente, o CRM e o organizador de atendimentos para quem atende o público: saúde, jurídico, esporte, educação, beleza e consultoria. Seu cliente encontra você na vitrine, agenda sozinho em três passos, confirma e reagenda pelo portal, e você acompanha toda a relação numa linha do tempo.",
    audience: ["Psicólogos, médicos e terapeutas", "Advogados e consultores", "Personal trainers e professores", "Clínicas, estúdios e salões"],
    pains: [
      "Horas por semana respondendo WhatsApp só para marcar e remarcar horário.",
      "Faltas sem aviso e buracos na agenda.",
      "Informações do cliente espalhadas entre caderno, celular e planilha.",
      "Sistemas engessados, feitos para uma profissão que não é a sua.",
    ],
    outcomes: [
      { title: "Agendamento sem troca de mensagens", text: "O cliente escolhe serviço, horário e preenche os dados em três passos. Só aparecem horários realmente livres." },
      { title: "Menos faltas", text: "Portal onde o cliente confirma, reagenda ou cancela respeitando a sua política." },
      { title: "Relacionamento que gera retorno", text: "Linha do tempo, tags, funil e notas de cada cliente, com regras automáticas que você aprova." },
      { title: "Novos clientes pela vitrine", text: "Página pública com selo de registro verificado, serviços, avaliações e horários livres." },
    ],
    modules: [
      { title: "Agenda", text: "Visão do dia, da semana e em lista, com encaixes e bloqueios." },
      { title: "Ficha de atendimento", text: "Registro dinâmico conforme a sua profissão." },
      { title: "Clientes (CRM)", text: "Linha do tempo, tags, funil e notas." },
      { title: "Serviços e preços", text: "Catálogo de serviços, duração e valores." },
      { title: "Regras automáticas", text: "Automação com aprovação e possibilidade de desfazer." },
      { title: "Portal do cliente", text: "Confirmar, reagendar, cancelar, avaliar e baixar ou excluir os próprios dados." },
      { title: "Vitrine pública", text: "Busca por serviço, cidade, categoria, modalidade e preço." },
      { title: "Apps", text: "Instalável no celular e com versões para Android, Windows e desktop." },
    ],
    steps: [
      { title: "Perfil profissional", text: "Ativamos o perfil da sua profissão, com termos, ficha e documentos certos." },
      { title: "Serviços e horários", text: "Cadastramos serviços, preços, horários e políticas de cancelamento." },
      { title: "Vitrine no ar", text: "Publicamos sua página e o link de agendamento para divulgar." },
      { title: "Clientes importados", text: "Trazemos sua base atual e acompanhamos as primeiras semanas." },
    ],
    differentials: [
      "Nenhuma profissão “engessada” no código: cada uma é um perfil configurável, sem nova versão do sistema.",
      "Pensado no celular primeiro, com acessibilidade (contraste e alvos de toque).",
      "Consentimento LGPD no agendamento e direito do cliente de baixar ou excluir os dados.",
      "Apps próprios para Android, Windows e desktop, além do navegador.",
    ],
    security: ["Consentimento LGPD registrado", "Exclusão e portabilidade de dados pelo cliente", "Sessões protegidas", "Perfis profissionais validados e versionados"],
    faq: [
      { q: "Serve para a minha profissão?", a: "Sim. Cada profissão é um perfil configurável com terminologia, ficha, documentos e regras próprias." },
      { q: "O cliente precisa baixar aplicativo?", a: "Não. Ele agenda pelo navegador; o app é opcional." },
      { q: "Posso aprovar antes de algo automático acontecer?", a: "Sim. As regras automáticas pedem aprovação e podem ser desfeitas." },
      { q: "Como fica a LGPD?", a: "O agendamento registra o consentimento, e o cliente pode baixar ou excluir os próprios dados pelo portal." },
    ],
    cta: "Organize seus atendimentos com o DRAP Concord",
  },
};

/* Seção institucional exibida em todas as páginas de plataforma */
window.DRAP_QUALITY = {
  title: "Por que comprar da DRAP",
  lead:
    "Você não está comprando um software genérico. Está levando uma plataforma construída por engenheiros que conhecem o seu setor, com código próprio, implantação acompanhada e evolução contínua.",
  pillars: [
    { k: "Engenharia própria", t: "Todo o código é desenvolvido pela DRAP. Sem revenda de sistema de terceiros: quem atende você é quem constrói o produto." },
    { k: "Qualidade verificável", t: "Testes automatizados, revisão de acessibilidade e documentação técnica fazem parte do processo de cada plataforma." },
    { k: "Segurança e LGPD", t: "Isolamento de dados por cliente, conexões cifradas, controle de acesso por perfil e trilhas de auditoria." },
    { k: "Implantação acompanhada", t: "Diagnóstico, configuração, migração dos seus dados e treinamento da equipe. Você não fica sozinho com um login." },
    { k: "Sua marca, sua operação", t: "Personalização visual e white-label, para a plataforma parecer e funcionar como parte da sua empresa." },
    { k: "Evolução contínua", t: "Roadmap público por plataforma e melhorias constantes, guiadas pelo uso real dos clientes." },
  ],
};
