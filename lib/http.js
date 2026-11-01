// Utilitários HTTP para as funções serverless (API Node nativa, sem depender de helpers da Vercel).
import { createHash } from "node:crypto";

export function send(res, status, body, headers = {}) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", headers["Cache-Control"] || "no-store");
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.end(body === undefined ? "" : JSON.stringify(body));
}

export async function readJson(req, limit = 16_000) {
  if (req.body && typeof req.body === "object") return req.body; // corpo já interpretado pela Vercel
  const type = req.headers["content-type"] || "";
  if (!type.includes("application/json")) throw httpError(415, "Envie JSON.");
  let size = 0; const chunks = [];
  for await (const c of req) { size += c.length; if (size > limit) throw httpError(413, "Conteúdo grande demais."); chunks.push(c); }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"); }
  catch { throw httpError(400, "JSON inválido."); }
}

export const httpError = (status, message) => Object.assign(new Error(message), { status });

// Bloqueia requisições de mutação vindas de outros sites (defesa contra CSRF, junto com SameSite=Strict).
export function assertSameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return; // navegadores sempre enviam Origin em POST/PATCH/PUT; ferramentas de linha de comando não
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  if (new URL(origin).host !== host) throw httpError(403, "Origem não permitida.");
}

export function clientIpHash(req) {
  const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "").split(",")[0].trim();
  return createHash("sha256").update(`${ip}|${process.env.SESSION_SECRET || "drap"}`).digest("hex").slice(0, 32);
}

// Envolve o handler: métodos permitidos, tratamento uniforme de erros.
export const handler = (methods, fn) => async (req, res) => {
  try {
    if (!methods.includes(req.method)) return send(res, 405, { error: "Método não permitido." }, { Allow: methods.join(", ") });
    if (req.method !== "GET") assertSameOrigin(req);
    await fn(req, res);
  } catch (err) {
    if (err.status) return send(res, err.status, { error: err.message });
    if (err.code === "NO_DB") return send(res, 503, { error: "Banco de dados não configurado." });
    if (err.code === "23514" || err.code === "22001" || err.code === "22P02") return send(res, 400, { error: "Confira os dados preenchidos." });
    if (err.code === "23503") return send(res, 400, { error: "Plataforma inválida." });
    console.error(err);
    send(res, 500, { error: "Erro interno. Tente novamente." });
  }
};
