/* DRAP — Depoimento do cliente (/depoimento/<token da proposta aceita>) */
(async () => {
  const $ = (s) => document.querySelector(s);
  const token = (location.pathname.match(/\/depoimento\/([A-Za-z0-9_-]{24,64})/) || [])[1] || "";
  const form = $("#dp-form"), st = $("#dp-status");
  const status = (t, err) => { st.textContent = t; st.className = "form__status mono" + (err ? " err" : ""); };
  let rating = 5;
  const paint = () => ($("#dp-stars").innerHTML = [1, 2, 3, 4, 5].map((n) =>
    `<button type="button" data-n="${n}" aria-pressed="${n <= rating}" aria-label="${n} de 5">★</button>`).join(""));
  paint();
  $("#dp-stars").addEventListener("click", (e) => { const b = e.target.closest("[data-n]"); if (b) { rating = Number(b.dataset.n); paint(); } });

  if (!token) { form.innerHTML = "<h1 class='section__title'>Link incompleto</h1><p class='section__lead'>Confira se o endereço foi copiado inteiro.</p>"; return; }
  try {
    const r = await fetch(`/api/proposals?token=${encodeURIComponent(token)}`);
    const p = await r.json();
    if (r.ok) {
      $("#dp-name").value = p.client?.name || "";
      $("#dp-company").value = p.client?.company || "";
      if (p.platform?.name) $("#dp-title").innerHTML = `Como está sendo a experiência com o <span class="serif">${p.platform.name.replace(/[<>&]/g, "")}?</span>`;
    }
  } catch {}

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const quote = $("#dp-quote").value.trim(), name = $("#dp-name").value.trim();
    if (quote.length < 20) return status("✕ Escreva pelo menos uma frase.", true);
    if (name.length < 2) return status("✕ Informe seu nome.", true);
    status("› enviando…");
    try {
      const r = await fetch(`/api/proposals?token=${encodeURIComponent(token)}`, { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "testimonial", quote, name, role: $("#dp-role").value.trim(), company: $("#dp-company").value.trim(), rating, consent: $("#dp-consent").checked }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "Não foi possível enviar agora.");
      form.innerHTML = `<p class="section__index mono"><span>✓</span> / Recebido</p><h1 class="section__title">Muito obrigado, ${name.split(" ")[0].replace(/[<>&]/g, "")}!</h1>
        <p class="section__lead">Seu depoimento chegou para a equipe da DRAP.</p><a class="btn btn--ghost" href="/"><span class="btn__label">Ir para o site</span></a>`;
    } catch (err) { status("✕ " + err.message, true); }
  });
})();
