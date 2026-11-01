// Sessão do painel: cookie HttpOnly assinado com HMAC (SESSION_SECRET).
// Credenciais do administrador: variáveis ADMIN_EMAIL e ADMIN_PASSWORD na Vercel.
import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import { httpError } from "./http.js";

const COOKIE = "drap_admin";
const MAX_AGE = 8 * 60 * 60; // 8 horas

function secret() {
  const s = process.env.SESSION_SECRET || "";
  if (s.length < 32) throw httpError(503, "SESSION_SECRET ausente ou curta (mínimo 32 caracteres).");
  return s;
}
const sign = (data) => createHmac("sha256", secret()).update(data).digest("base64url");
const safeEqual = (a, b) => {
  const ha = createHash("sha256").update(String(a)).digest();
  const hb = createHash("sha256").update(String(b)).digest();
  return timingSafeEqual(ha, hb);
};

export function adminConfigured() {
  return Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && (process.env.SESSION_SECRET || "").length >= 32);
}

export function checkCredentials(email, password) {
  const okEmail = safeEqual(String(email || "").trim().toLowerCase(), String(process.env.ADMIN_EMAIL || "").trim().toLowerCase());
  const okPass = safeEqual(String(password || ""), String(process.env.ADMIN_PASSWORD || ""));
  return okEmail && okPass && Boolean(process.env.ADMIN_PASSWORD);
}

export function sessionCookie(email) {
  const payload = Buffer.from(JSON.stringify({ email, exp: Math.floor(Date.now() / 1000) + MAX_AGE })).toString("base64url");
  const value = `${payload}.${sign(payload)}`;
  const secure = process.env.VERCEL || process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE}=${value}; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age=${MAX_AGE}${secure}`;
}
export const clearCookie = () => `${COOKIE}=; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age=0`;

export function readSession(req) {
  const raw = (req.headers.cookie || "").split(/;\s*/).find((c) => c.startsWith(COOKIE + "="));
  if (!raw) return null;
  const [payload, sig] = raw.slice(COOKIE.length + 1).split(".");
  if (!payload || !sig || !safeEqual(sig, sign(payload))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (data.exp < Date.now() / 1000) return null;
    // Sessão vale só para o e-mail admin atual: trocar ADMIN_EMAIL invalida sessões antigas.
    if (String(data.email).toLowerCase() !== String(process.env.ADMIN_EMAIL || "").trim().toLowerCase()) return null;
    return data;
  } catch { return null; }
}

export function requireAdmin(req) {
  const s = readSession(req);
  if (!s) throw httpError(401, "Sessão expirada. Entre novamente.");
  return s;
}
