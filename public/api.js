/* Cliente mínimo da API REST do Supabase (PostgREST) para o site público.
   Sem dependências: só fetch. O painel /admin usa o supabase-js completo. */
(() => {
  const cfg = window.DRAP_CONFIG || {};
  const base = (cfg.supabaseUrl || "").replace(/\/+$/, "");
  const key = cfg.supabaseAnonKey || "";
  const enabled = Boolean(base && key);

  const friendly = (body, status) => {
    if (body?.code === "P0001" && body.message) return body.message;          // mensagem do banco (ex.: limite anti-spam)
    if (body?.code === "23514" || body?.code === "22001") return "Confira os dados preenchidos.";
    if (body?.code === "23503") return "Plataforma inválida. Recarregue a página.";
    if (status === 429) return "Muitas solicitações. Tente novamente em instantes.";
    return "Não foi possível enviar agora. Tente novamente.";
  };

  async function request(path, init = {}, timeoutMs = 6000) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(`${base}/rest/v1/${path}`, {
        ...init,
        signal: ctrl.signal,
        headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...(init.headers || {}) },
      });
      const text = await res.text();
      const body = text ? JSON.parse(text) : null;
      if (!res.ok) throw Object.assign(new Error(friendly(body, res.status)), { status: res.status, body });
      return body;
    } finally {
      clearTimeout(t);
    }
  }

  window.DRAP_API = {
    enabled,
    select: (table, query = "select=*") => request(`${table}?${query}`, { method: "GET" }, 4000),
    // return=minimal: o visitante não tem permissão de leitura em leads, então não pedimos a linha de volta.
    insert: (table, row) => request(table, { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(row) }),
  };
})();
