// GET /api/admin/session → usuário da sessão atual (401 se não logado)
import { handler, send, httpError } from "../../lib/http.js";
import { adminConfigured, requireAdmin } from "../../lib/auth.js";

export default handler(["GET"], async (req, res) => {
  if (!adminConfigured()) throw httpError(503, "Painel não configurado: defina ADMIN_EMAIL, ADMIN_PASSWORD e SESSION_SECRET na Vercel.");
  send(res, 200, { email: requireAdmin(req).email });
});
