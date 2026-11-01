/* Cliente da API própria (funções serverless em /api, banco Neon Postgres). */
(() => {
  async function request(path, init = {}, timeoutMs = 6000) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(path, { ...init, signal: ctrl.signal, headers: { "Content-Type": "application/json", ...(init.headers || {}) } });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw Object.assign(new Error(body?.error || "Não foi possível concluir agora. Tente novamente."), { status: res.status });
      return body;
    } catch (e) {
      if (e.name === "AbortError") throw new Error("O servidor demorou para responder. Tente novamente.");
      throw e;
    } finally { clearTimeout(t); }
  }
  window.DRAP_API = {
    catalog: () => request("/api/catalog", {}, 4000),
    sendLead: (lead) => request("/api/leads", { method: "POST", body: JSON.stringify(lead) }),
  };
})();
