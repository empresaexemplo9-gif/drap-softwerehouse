/* ==========================================================================
   DRAP — Prévias de interface dos cards
   --------------------------------------------------------------------------
   Cada função devolve uma miniatura (palco de 560 × 350 px) que reproduz a
   aparência da plataforma: cores, tipografia, menu e tela principal tirados
   do código-fonte de cada repositório. As fotos usadas são as do próprio
   repositório. Para trocar por um screenshot real, use no platforms.js:
     preview: { image: "assets/previews/minha-tela.png" }
   ========================================================================== */

window.DRAP_PREVIEWS = {
  /* DRAP Backoffice — menu Abismo Nanquim, banner Azul Cianótipo, fundo Pedra Clara */
  backoffice: () => `
  <div class="pv pv-bo">
    <aside class="pv-bo__side">
      <div class="pv-bo__brand"><i></i><b>DRAP</b><small>BACKOFFICE</small></div>
      <ul>
        <li class="on">Visão geral</li><li>Projetos</li><li>Obras</li><li>Orçamentos</li>
        <li>Propostas</li><li>CRM</li><li>Financeiro</li><li>Prancheta</li><li>Diário de obra</li>
      </ul>
    </aside>
    <main class="pv-bo__main">
      <div class="pv-bo__top"><span>Buscar projeto, cliente ou obra…</span><em>AR</em></div>
      <section class="pv-bo__band">
        <div><small>HOJE</small><h4>O que move o trabalho hoje</h4><p>3 tarefas com prazo · 2 propostas abertas</p></div>
        <img src="assets/previews/backoffice-fachada.webp" alt="" loading="lazy" />
      </section>
      <div class="pv-bo__kpis">
        <div><small>01 · Obras ativas</small><b>8</b></div>
        <div><small>02 · Propostas</small><b>R$ 412k</b></div>
        <div class="dark"><small>03 · Margem</small><b>23,4%</b></div>
      </div>
      <div class="pv-bo__list">
        <div><img src="assets/previews/backoffice-estar.webp" alt="" loading="lazy" /><span><b>Casa Varandas</b><small>Executivo · 72%</small></span><i class="ok">Em dia</i></div>
        <div><span class="ph"></span><span><b>Reforma Ateliê</b><small>Orçamento v3 · BDI 24%</small></span><i class="warn">Atenção</i></div>
      </div>
    </main>
  </div>`,

  /* DRAP Professor — campus navy, creme e dourado, Playfair Display + Inter */
  professor: () => `
  <div class="pv pv-pr">
    <aside class="pv-pr__side">
      <div class="pv-pr__brand"><i></i><span><b>DRAP</b><small>PROFESSOR</small></span></div>
      <ul><li class="on">Início</li><li>Meu aprendizado</li><li>Catálogo</li><li>Agenda</li><li>Fórum</li><li>Certificados</li></ul>
    </aside>
    <main class="pv-pr__main">
      <section class="pv-pr__hero">
        <img src="assets/previews/professor-campus.webp" alt="" loading="lazy" />
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
      <div class="pv-fz__brand"><i></i><b>DRAP</b><span>Fazenda</span></div>
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
      <div class="pv-fz__brand"><i></i><b>DRAP</b><span>Pecuária</span></div>
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
      <div class="pv-cc__brand"><i></i><b>DRAP</b> Concord</div>
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
          <img src="assets/previews/concord-medicina.webp" alt="" loading="lazy" />
          <div><small>VITRINE PÚBLICA</small><b>Dra. Ana Prado</b><span class="stars">★★★★★ <em>4,9</em></span><span class="tag">Registro verificado</span></div>
        </div>
      </div>
    </main>
  </div>`
};
