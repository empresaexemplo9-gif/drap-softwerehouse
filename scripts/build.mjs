// Build: copia public/ para dist/ e, se houver DATABASE_URL (integração Neon na Vercel),
// aplica as migrações do banco. As funções em /api são publicadas pela Vercel à parte.
import { cpSync, rmSync } from "node:fs";
import { join } from "node:path";
import { migrate } from "./migrate.mjs";
import { getPool, databaseUrl } from "../lib/db.js";

const root = new URL("..", import.meta.url).pathname;
const dist = join(root, "dist");
rmSync(dist, { recursive: true, force: true });
cpSync(join(root, "public"), dist, { recursive: true });
console.log("build: dist/ gerado");

if (databaseUrl()) {
  await migrate();
  await getPool().end();
} else {
  console.log("build: sem DATABASE_URL — conecte o Neon (Vercel → Storage). O site usa o catálogo local e o formulário fica desativado.");
}
