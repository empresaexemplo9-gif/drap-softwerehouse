// Servidor local simples para dist/ (imita cleanUrls da Vercel). Uso: npm run dev
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const dist = new URL("../dist", import.meta.url).pathname;
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png", ".json": "application/json" };
const port = Number(process.env.PORT) || 4173;
// Aplica os mesmos cabeçalhos do vercel.json (CSP etc.) para pegar problemas antes do deploy.
const vercel = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
const headersFor = (path) => Object.assign({}, ...vercel.headers
  .filter((h) => new RegExp("^" + h.source.replace("(.*)", ".*") + "$").test(path))
  .map((h) => Object.fromEntries(h.headers.filter((x) => x.key !== "Strict-Transport-Security").map((x) => [x.key, x.value]))));

createServer(async (req, res) => {
  let p = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
  const candidates = [p, p + ".html", join(p, "index.html")];
  for (const c of candidates) {
    const file = join(dist, c);
    if (!file.startsWith(dist)) break;
    try {
      if ((await stat(file)).isFile()) {
        res.writeHead(200, { ...headersFor(p), "Content-Type": types[extname(file)] || "application/octet-stream" });
        return res.end(await readFile(file));
      }
    } catch {}
  }
  res.writeHead(404, { "Content-Type": "text/plain" }).end("404");
}).listen(port, () => console.log(`http://localhost:${port}`));
