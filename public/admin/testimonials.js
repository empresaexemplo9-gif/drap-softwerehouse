/* DRAP — Painel: depoimentos (aprovar, editar, publicar, cadastrar) */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const A = () => window.DRAP_ADMIN;
  const esc = (s) => A().esc(s);
  const R = "settings?r=testimonials";
  let list = [], loaded = false;

  async function load() {
    try { list = await A().call("GET", R); loaded = true; render(); }
    catch (err) { A().toast("Erro ao carregar depoimentos: " + err.message); }
  }
  const platformOptions = (sel) => `<option value="">Geral (DRAP)</option>` +
    (A().platforms() || []).map((p) => `<option value="${esc(p.id)}"${p.id === sel ? " selected" : ""}>${esc(p.name)}</option>`).join("");
  const stars = (n) => (n ? "★".repeat(n) + "☆".repeat(5 - n) : "sem nota");

  function render() {
    const pending = list.filter((t) => !t.published).length;
    $("#badge-testi").textContent = pending || "";
    $("#ts-list").innerHTML = list.length ? list.map((t) => `
      <form class="adm-card adm-titem${t.published ? " is-pub" : ""}" data-id="${t.id}">
        <div class="adm-titem__head">
          <span class="adm-pill ${t.published ? "on" : ""}">${t.published ? "Publicado" : "Aguardando aprovação"}</span>
          <span class="adm-muted-s">${t.proposal_number ? `Veio do cliente pela proposta ${esc(t.proposal_number)}` : "Cadastrado pela equipe"} · ${A().fmtDate(t.created_at)} · ${stars(t.rating)}</span>
        </div>
        <div class="adm-pform adm-pform--flat">
          <label class="w2">Depoimento<textarea name="quote" rows="3" maxlength="1200" required>${esc(t.quote)}</textarea></label>
          <label>Nome<input name="name" value="${esc(t.name)}" maxlength="120" required /></label>
          <label>Cargo<input name="role" value="${esc(t.role)}" maxlength="120" /></label>
          <label>Empresa<input name="company" value="${esc(t.company)}" maxlength="120" /></label>
          <label>Plataforma<select name="platform_id">${platformOptions(t.platform_id)}</select></label>
          <label>Nota<select name="rating"><option value="">—</option>${[5, 4, 3, 2, 1].map((n) => `<option${n === t.rating ? " selected" : ""}>${n}</option>`).join("")}</select></label>
          <label>Ordem<input name="sort_order" type="number" value="${t.sort_order}" step="10" /></label>
          <label class="adm-check"><input type="checkbox" name="consent"${t.consent ? " checked" : ""} /> Cliente autorizou publicar</label>
          <label class="adm-check"><input type="checkbox" name="published"${t.published ? " checked" : ""} /> Publicado no site</label>
          <div class="w2 adm-pactions">
            <button class="btn btn--ghost btn--sm" type="button" data-del><span class="btn__label">Excluir</span></button>
            <button class="btn btn--primary btn--sm" type="submit"><span class="btn__label">Salvar</span><span class="btn__icon" aria-hidden="true">✓</span></button>
          </div>
        </div>
      </form>`).join("") : `<div class="adm-card adm-empty">Nenhum depoimento ainda. Peça ao primeiro cliente que aceitar uma proposta.</div>`;
  }

  const body = (f) => ({
    quote: f.quote.value.trim(), name: f.name.value.trim(), role: f.role.value.trim(), company: f.company.value.trim(),
    platform_id: f.platform_id.value || null, rating: f.rating.value || null, sort_order: Number(f.sort_order?.value) || 100,
    consent: f.consent.checked, published: f.published.checked,
  });

  $("#ts-list").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    if (f.published.checked && !f.consent.checked) return A().toast("Marque a autorização do cliente antes de publicar.");
    try { await A().call("PATCH", `${R}&id=${f.dataset.id}`, body(f)); A().toast("Depoimento salvo"); load(); }
    catch (err) { A().toast("Erro: " + err.message); }
  });
  $("#ts-list").addEventListener("click", async (e) => {
    if (!e.target.closest("[data-del]")) return;
    const f = e.target.closest("form");
    if (!confirm("Excluir este depoimento?")) return;
    try { await A().call("DELETE", `${R}&id=${f.dataset.id}`); A().toast("Depoimento excluído"); load(); }
    catch (err) { A().toast("Erro: " + err.message); }
  });

  $("#ts-new").addEventListener("click", () => {
    const dlg = $("#adm-dialog");
    dlg.innerHTML = `<form class="adm-dlg" id="ts-form">
      <h3>Cadastrar depoimento</h3>
      <p class="adm-muted">Para depoimentos recebidos por WhatsApp, e-mail ou reunião. Use as palavras do cliente, sem reescrever.</p>
      <label>Depoimento<textarea name="quote" rows="4" maxlength="1200" required></textarea></label>
      <label>Nome<input name="name" maxlength="120" required /></label>
      <label>Cargo<input name="role" maxlength="120" /></label>
      <label>Empresa<input name="company" maxlength="120" /></label>
      <label>Plataforma<select name="platform_id">${platformOptions("")}</select></label>
      <label>Nota<select name="rating"><option value="">—</option><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select></label>
      <label class="adm-check"><input type="checkbox" name="consent" /> O cliente autorizou publicar nome, cargo e empresa</label>
      <label class="adm-check"><input type="checkbox" name="published" /> Publicar agora</label>
      <div class="adm-dlg__act"><button type="button" class="btn btn--ghost btn--sm" data-close><span class="btn__label">Cancelar</span></button>
        <button class="btn btn--primary btn--sm"><span class="btn__label">Salvar</span></button></div></form>`;
    dlg.showModal();
    $("#ts-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const f = e.target;
      if (f.published.checked && !f.consent.checked) return A().toast("Marque a autorização do cliente antes de publicar.");
      try { await A().call("POST", R, body(f)); dlg.close(); A().toast("Depoimento cadastrado"); load(); }
      catch (err) { A().toast("Erro: " + err.message); }
    });
  });

  document.addEventListener("drap:admin-ready", load);
  document.querySelector(".adm-tabs").addEventListener("click", (e) => {
    if (e.target.closest('[data-tab="testimonials"]') && !loaded) load();
  });
})();
