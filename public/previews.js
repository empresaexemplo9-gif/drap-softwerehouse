/* ==========================================================================
   DRAP — Prévias de interface dos cards
   --------------------------------------------------------------------------
   Cada função devolve uma miniatura (palco de 560 × 350 px) que reproduz a
   aparência da plataforma: cores, tipografia, menu e tela principal tirados
   do código-fonte de cada repositório. As fotos usadas são as do próprio
   repositório. Para trocar por um screenshot real, use no platforms.js:
     preview: { image: "assets/previews/minha-tela.png" }
   ========================================================================== */

/* Símbolos oficiais, com a geometria de cada repositório:
   Backoffice/Professor: public/brand/drap-symbol-*.svg (D com corte, 320×330)
   Fazenda/Pecuária/Empresa/Granja/Loja: public/drap-fazenda.svg · Concord: brand/logo.svg */
const PV_MARK = {
  cut: (id) => `<svg class="pv-mark" viewBox="0 0 320 330" fill="currentColor" aria-hidden="true"><mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="320" height="330"><rect width="320" height="330" fill="#fff"/><path d="M236 -4L252 -4L103 334L97 334Z" fill="#000"/></mask><path d="M0 0H232C284 0 320 46 320 100V230C320 292 284 330 236 330H0Z" mask="url(#${id})"/></svg>`,
  fazenda: () => '<svg class="pv-mark" viewBox="20.3 5.98 57.2 56.9" fill="currentColor" aria-hidden="true"><path d="M65.41 6.62 39.43 62.87h22.18c8.6 0 15.53-9.61 15.53-21.55V27.53c0-10.12-4.97-18.57-11.73-20.91z"/><path d="M20.36 5.98c-.08 18.97-.05 37.93 0 56.9h18.79L62.76 6.04a11.6 11.6 0 0 0-1.15-.06z"/></svg>',
  concord: () => '<svg class="pv-mark" viewBox="0 0 778 781" fill="currentColor" aria-hidden="true"><path d="M0 0H533L212 781H0Z"/><path d="M581 2C601 2 777 60 777 290V480C777 675 652 781 512 781H219Z"/></svg>',
};

window.DRAP_PREVIEWS = {
  /* DRAP Backoffice — menu Abismo Nanquim, banner Azul Cianótipo, fundo Pedra Clara */
  backoffice: () => `
  <div class="pv pv-bo">
    <aside class="pv-bo__side">
      <div class="pv-bo__brand">${PV_MARK.cut("pvm-bo")}<b>DRAP</b><small>BACKOFFICE</small></div>
      <ul>
        <li class="on">Visão geral</li><li>Projetos</li><li>Obras</li><li>Orçamentos</li>
        <li>Propostas</li><li>CRM</li><li>Financeiro</li><li>Prancheta</li><li>Diário de obra</li>
      </ul>
    </aside>
    <main class="pv-bo__main">
      <div class="pv-bo__top"><span>Buscar projeto, cliente ou obra…</span><em>AR</em></div>
      <section class="pv-bo__band">
        <div><small>HOJE</small><h4>O que move o trabalho hoje</h4><p>3 tarefas com prazo · 2 propostas abertas</p></div>
        <img src="/assets/previews/backoffice-fachada.webp" alt="" loading="lazy" />
      </section>
      <div class="pv-bo__kpis">
        <div><small>01 · Obras ativas</small><b>8</b></div>
        <div><small>02 · Propostas</small><b>R$ 412k</b></div>
        <div class="dark"><small>03 · Margem</small><b>23,4%</b></div>
      </div>
      <div class="pv-bo__list">
        <div><img src="/assets/previews/backoffice-estar.webp" alt="" loading="lazy" /><span><b>Casa Varandas</b><small>Executivo · 72%</small></span><i class="ok">Em dia</i></div>
        <div><span class="ph"></span><span><b>Reforma Ateliê</b><small>Orçamento v3 · BDI 24%</small></span><i class="warn">Atenção</i></div>
      </div>
    </main>
  </div>`,

  /* DRAP Professor — campus navy, creme e dourado, Playfair Display + Inter */
  professor: () => `
  <div class="pv pv-pr">
    <aside class="pv-pr__side">
      <div class="pv-pr__brand">${PV_MARK.cut("pvm-pr")}<span><b>DRAP</b><small>PROFESSOR</small></span></div>
      <ul><li class="on">Início</li><li>Meu aprendizado</li><li>Catálogo</li><li>Agenda</li><li>Fórum</li><li>Certificados</li></ul>
    </aside>
    <main class="pv-pr__main">
      <section class="pv-pr__hero">
        <img src="/assets/previews/professor-campus.webp" alt="" loading="lazy" />
        <div><small>CAMPUS DIGITAL</small><h4>Bem-vinda de volta, <em>Ana</em></h4><span class="pv-pr__btn">Continuar de onde parei →</span></div>
      </section>
      <h5>Meu aprendizado</h5>
      <div class="pv-pr__courses">
        <div><small>MENTORIA</small><b>Mentoria financeira</b><span class="bar"><i style="width:68%"></i></span><em>68%</em></div>
        <div><small>CURSO</small><b>Gestão de empresas</b><span class="bar"><i style="width:35%"></i></span><em>35%</em></div>
        <div><small>TRILHA</small><b>Gestão justa de equipes</b><span class="bar"><i style="width:90%"></i></span><em>90%</em></div>
      </div>
      <div class="pv-pr__next">
        <div><time><b>04</b>NOV</time><span><b>Mentoria ao vivo · Fluxo de caixa</b><small>19h · com Prof. Ricardo</small></span></div>
        <div><time><b>06</b>NOV</time><span><b>Avaliação · Módulo 2</b><small>Certificado ao concluir</small></span></div>
      </div>
    </main>
  </div>`,

  /* DRAP Fazenda — papel, tinta e folha; Fraunces + Manrope + Roboto Mono; abas no topo */
  fazenda: () => `
  <div class="pv pv-fz">
    <header class="pv-fz__head">
      <div class="pv-fz__brand">${PV_MARK.fazenda()}<b>DRAP</b><span>Fazenda</span></div>
      <nav><span class="on">Lançamentos</span><span>Acerto</span><span>Posição</span><span>Análises</span><span>Conciliação</span><span>NF-e</span><span>PDF</span></nav>
    </header>
    <main class="pv-fz__main">
      <div class="pv-fz__title"><div><small>LIVRO-CAIXA UNIFICADO</small><h4>Lançamentos <em>da safra</em></h4></div><span class="pv-fz__btn">+ Novo lançamento</span></div>
      <div class="pv-fz__kpis">
        <div><small>Saldo acerto</small><b class="num">R$ 18.240</b></div>
        <div><small>A pagar · 7 dias</small><b class="num">R$ 42.910</b></div>
        <div><small>Safra 25/26</small><b class="num leaf">Soja · 61%</b></div>
      </div>
      <table class="pv-fz__table">
        <tr><th>Data</th><th>Descrição</th><th>Planilha</th><th class="r">Valor</th></tr>
        <tr><td class="num">28/10</td><td>Adubo NPK 04-14-08</td><td><i class="t-lav">Lavoura</i></td><td class="num r">-12.480,00</td></tr>
        <tr><td class="num">27/10</td><td>Venda soja · 600 sc</td><td><i class="t-lag">Lagoa</i></td><td class="num r leaf">+86.400,00</td></tr>
        <tr><td class="num">26/10</td><td>Diesel S10 · trator</td><td><i class="t-ace">Acerto</i></td><td class="num r">-3.215,40</td></tr>
        <tr><td class="num">25/10</td><td>Sementes · talhão 4</td><td><i class="t-lav">Lavoura</i></td><td class="num r">-9.870,00</td></tr>
      </table>
    </main>
  </div>`,

  /* DRAP Pecuária — mesma família visual do Fazenda; "O que precisa da sua atenção hoje" */
  pecuaria: () => `
  <div class="pv pv-pc">
    <header class="pv-pc__head">
      <div class="pv-fz__brand">${PV_MARK.fazenda()}<b>DRAP</b><span>Pecuária</span></div>
      <nav><span class="on">Painel</span><span>Rebanho</span><span>Manejo</span><span>Corte</span><span>Leite</span><span>Genética</span></nav>
      <em class="pv-pc__sync">● offline · 3</em>
    </header>
    <main class="pv-pc__main">
      <small class="eyebrow">FAZENDA BOA VISTA · HOJE</small>
      <h4>O que precisa da <em>sua atenção</em></h4>
      <div class="pv-pc__grid">
        <div class="pv-pc__box">
          <small>MANEJO E PRAZOS</small>
          <p><i class="dot red"></i>Vacina aftosa · lote 3 <b class="num">42 cab.</b></p>
          <p><i class="dot amb"></i>Pesagem · recria <b class="num">68 cab.</b></p>
          <p><i class="dot leaf"></i>Troca de piquete · P7</p>
        </div>
        <div class="pv-pc__box">
          <small>CUSTO DA ARROBA</small>
          <b class="big num">R$ 187,40</b>
          <svg viewBox="0 0 200 50" preserveAspectRatio="none"><polyline points="0,38 25,34 50,36 75,28 100,30 125,22 150,24 175,16 200,18" fill="none" stroke="#7A5C3B" stroke-width="2"/><polyline points="0,44 200,44" stroke="#C8C2B2" stroke-dasharray="3 3"/></svg>
        </div>
      </div>
      <div class="pv-pc__kpis">
        <div><small>Rebanho</small><b class="num">312</b></div>
        <div><small>Leite · dia</small><b class="num">1.840 L</b></div>
        <div><small>Prenhes</small><b class="num">71%</b></div>
        <div><small>GMD</small><b class="num">0,82 kg</b></div>
      </div>
    </main>
  </div>`,

  /* DRAP office — barra lateral clara, verde-oliva, grade "Suas ferramentas" */
  office: () => `
  <div class="pv pv-of">
    <aside class="pv-of__side">
      <div class="pv-of__brand">DRAP <span>office</span><em>beta</em></div>
      <div class="pv-of__ws">◉ Meu espaço de trabalho</div>
      <ul><li class="on">⌂ Visão geral</li><li>▤ Todos os arquivos</li><li>⚇ Compartilhados</li><li>▥ Indicadores</li><li>⌘ Conexões</li><li>♲ Lixeira</li></ul>
    </aside>
    <main class="pv-of__main">
      <div class="pv-of__top"><span>Buscar em todos os arquivos…</span><em>AN</em></div>
      <div class="pv-of__hello"><div><small>TUDO O QUE VOCÊ PRECISA, JUNTO</small><h4>Olá, Ana. Vamos criar?</h4></div><span class="pv-of__btn">+ Criar novo</span></div>
      <div class="pv-of__banner"><small>MENOS ABAS. MAIS POSSIBILIDADES.</small><b>Seu trabalho flui melhor quando está conectado.</b></div>
      <div class="pv-of__tools">
        <div><i style="--t:#dbe6f6;--f:#3d64a8">D</i>Documentos</div>
        <div><i style="--t:#dcecd9;--f:#3d7a45">P</i>Planilhas</div>
        <div><i style="--t:#f6e2d4;--f:#b0602e">A</i>Apresentações</div>
        <div><i style="--t:#ece0f2;--f:#7b4d94">N</i>Anotações</div>
        <div><i style="--t:#dde9f7;--f:#3a6db0">✓</i>Projetos</div>
        <div><i style="--t:#f7dfe2;--f:#b0475a">24</i>Agenda</div>
      </div>
      <div class="pv-of__recent"><small>Arquivos recentes</small><span>▤ Plano comercial 2027.docx</span><span>▦ Fluxo de caixa.xlsx</span></div>
    </main>
  </div>`,

  /* DRAP Concord — creme, areia, azul-petróleo e terracota; Fraunces + Inter; tela "Hoje" */
  concord: () => `
  <div class="pv pv-cc">
    <aside class="pv-cc__side">
      <div class="pv-cc__brand">${PV_MARK.concord()}<b>DRAP</b> Concord</div>
      <ul><li class="on">Hoje</li><li>Agenda</li><li>Clientes</li><li>Serviços</li><li>Regras</li><li>Relatórios</li><li>Perfil público</li></ul>
    </aside>
    <main class="pv-cc__main">
      <div class="pv-cc__title"><div><small>SEXTA, 31 DE OUTUBRO</small><h4>Bom dia, <em>Ana</em></h4></div><span class="pv-cc__btn">+ Novo agendamento</span></div>
      <div class="pv-cc__cols">
        <div class="pv-cc__list">
          <div><time>09:00</time><span><b>Maria Souza</b><small>Sessão individual · 50 min</small></span><i class="ok">Confirmado</i></div>
          <div><time>10:30</time><span><b>João Lima</b><small>Primeira consulta · online</small></span><i class="pend">Pendente</i></div>
          <div><time>14:00</time><span><b>Clara Reis</b><small>Retorno · presencial</small></span><i class="ok">Confirmado</i></div>
        </div>
        <div class="pv-cc__vit">
          <img src="/assets/previews/concord-medicina.webp" alt="" loading="lazy" />
          <div><small>VITRINE PÚBLICA</small><b>Dra. Ana Prado</b><span class="stars">★★★★★ <em>4,9</em></span><span class="tag">Registro verificado</span></div>
        </div>
      </div>
    </main>
  </div>`,

  /* DRAP Empresa — navy, ciano e coral sobre papel claro; Space Grotesk + Inter + JetBrains Mono */
  empresa: () => `
  <div class="pv pv-em">
    <aside class="pv-em__side">
      <div class="pv-em__brand">${PV_MARK.fazenda()}<b>DRAP</b><span>Empresa</span></div>
      <ul><li class="on">Painel</li><li>Lançamentos</li><li>Fluxo de caixa</li><li>Conciliação</li><li>Cobranças</li><li>Notas fiscais</li><li>DRE</li><li>Integrações</li></ul>
    </aside>
    <main class="pv-em__main">
      <div class="pv-em__title"><div><small>NOVEMBRO · ACME COMÉRCIO LTDA</small><h4>Gestão financeira <em>sem planilha.</em></h4></div><span class="pv-em__btn">+ Lançamento</span></div>
      <div class="pv-em__kpis">
        <div><small>Saldo em caixa</small><b class="num">R$ 84.310</b></div>
        <div><small>A receber · 30d</small><b class="num ok">R$ 52.700</b></div>
        <div><small>A pagar · 30d</small><b class="num bad">R$ 31.940</b></div>
      </div>
      <div class="pv-em__cols">
        <div class="pv-em__chart"><small>FLUXO DE CAIXA PROJETADO</small>
          <svg viewBox="0 0 220 70" preserveAspectRatio="none"><g fill="#00BCFF"><rect x="6" y="30" width="14" height="40" rx="2"/><rect x="40" y="22" width="14" height="48" rx="2"/><rect x="74" y="34" width="14" height="36" rx="2"/><rect x="108" y="16" width="14" height="54" rx="2"/><rect x="142" y="12" width="14" height="58" rx="2"/><rect x="176" y="8" width="14" height="62" rx="2"/></g><g fill="#FF5547" opacity=".85"><rect x="21" y="42" width="10" height="28" rx="2"/><rect x="55" y="38" width="10" height="32" rx="2"/><rect x="89" y="44" width="10" height="26" rx="2"/><rect x="123" y="36" width="10" height="34" rx="2"/><rect x="157" y="40" width="10" height="30" rx="2"/><rect x="191" y="34" width="10" height="36" rx="2"/></g></svg>
        </div>
        <div class="pv-em__list">
          <div><span><b>Extrato OFX · Itaú</b><small>18 conciliados · 2 pendentes</small></span><i class="ok">Conciliado</i></div>
          <div><span><b>NFS-e 0412 · Consultoria</b><small>R$ 4.800,00</small></span><i class="ok">Emitida</i></div>
          <div><span><b>Boleto · Cliente Ômega</b><small>vence 15/11 · PIX</small></span><i class="pend">Aberto</i></div>
        </div>
      </div>
    </main>
  </div>`,

  /* DRAP Granja — creme, terracota e dourado; Fraunces + Inter; painel do lote */
  granja: () => `
  <div class="pv pv-gr">
    <header class="pv-gr__head">
      <div class="pv-gr__brand">${PV_MARK.fazenda()}<b>DRAP</b><span>Granja</span></div>
      <nav><span class="on">Hoje</span><span>Coleta</span><span>Lotes</span><span>Estoque</span><span>Sanidade</span><span>Dinheiro</span><span>NF-e</span></nav>
      <em class="pv-gr__sync">● galpão · sincronizado</em>
    </header>
    <main class="pv-gr__main">
      <div class="pv-gr__title"><div><small>GRANJA SÃO BENTO · LOTE 7</small><h4>Quanto custou <em>a dúzia</em> este mês?</h4></div><span class="pv-gr__btn">+ Coleta do dia</span></div>
      <div class="pv-gr__kpis">
        <div class="hl"><small>Custo por dúzia</small><b class="num">R$ 5,82</b></div>
        <div><small>Taxa de postura</small><b class="num">91,4%</b></div>
        <div><small>Aves vivas</small><b class="num">11.284</b></div>
        <div><small>Ração · saca</small><b class="num">R$ 98,50</b></div>
      </div>
      <div class="pv-gr__cols">
        <div class="pv-gr__box"><small>ESTOQUE DE OVOS</small>
          <p><span>Extra</span><i style="--w:72%"></i><b class="num">186 cx</b></p>
          <p><span>Grande</span><i style="--w:54%"></i><b class="num">139 cx</b></p>
          <p><span>Médio</span><i style="--w:31%"></i><b class="num">80 cx</b></p>
        </div>
        <div class="pv-gr__box"><small>CALENDÁRIO SANITÁRIO</small>
          <p class="ev"><i class="dot amb"></i>Newcastle · lote 9<b>amanhã</b></p>
          <p class="ev"><i class="dot red"></i>Bronquite · lote 4<b>atrasada</b></p>
          <p class="ev"><i class="dot ok"></i>Vitamina · lote 7<b>feita</b></p>
        </div>
      </div>
      <div class="pv-gr__result"><small>OUTUBRO · RESULTADO</small><span>Vendas <b class="num">R$ 148.920</b></span><span>Ração <b class="num">R$ 96.310</b></span><span class="hl">Sobrou <b class="num">R$ 21.480</b></span></div>
    </main>
  </div>`,

  /* DRAP Loja — vitrine de varejo em creme e navy, roxo da Loja; Hanken Grotesk */
  loja: () => `
  <div class="pv pv-lj">
    <header class="pv-lj__head">
      <div class="pv-lj__brand"><span>Casa</span><b>Bento</b><small>materiais</small></div>
      <span class="pv-lj__search">Buscar produto, marca ou código…</span>
      <span class="pv-lj__cart">Carrinho <b>3</b></span>
    </header>
    <nav class="pv-lj__cats"><span class="on">Ofertas</span><span>Elétrica</span><span>Hidráulica</span><span>Ferramentas</span><span>Tintas</span><span>Iluminação</span></nav>
    <main class="pv-lj__main">
      <section class="pv-lj__banner"><div><small>ESTOQUE SINCRONIZADO COM O MICRO-F</small><h4>Pediu hoje, <em>recebe amanhã.</em></h4><span class="pv-lj__btn">Ver ofertas →</span></div><div class="pv-lj__badge">${PV_MARK.fazenda()}<span>DRAP Loja</span></div></section>
      <div class="pv-lj__grid">
        <div><i style="--t:#ede4ff"></i><small>Elétrica</small><b>Disjuntor 32A</b><span class="num">R$ 28,90</span><em>+ carrinho</em></div>
        <div><i style="--t:#ffe3df"></i><small>Tintas</small><b>Acrílica 18L</b><span class="num">R$ 319,00</span><em>+ carrinho</em></div>
        <div><i style="--t:#e2eefb"></i><small>Hidráulica</small><b>Registro 3/4"</b><span class="num">R$ 46,50</span><em>+ carrinho</em></div>
        <div><i style="--t:#f2f2e9"></i><small>Ferramentas</small><b>Furadeira 650W</b><span class="num">R$ 289,00</span><em>+ carrinho</em></div>
      </div>
      <div class="pv-lj__wa"><b>Fechar pedido pelo WhatsApp</b><span>ou pagar online · PIX · cartão · frete calculado</span></div>
    </main>
  </div>`
};
