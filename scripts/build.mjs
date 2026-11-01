// Build estático: copia public/ para dist/, gera dist/config.js com as variáveis
// de ambiente públicas do Supabase e copia o supabase-js (UMD) para dist/vendor/.
import { cpSync, mkdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const dist = join(root, "dist");
rmSync(dist, { recursive: true, force: true });
cpSync(join(root, "public"), dist, { recursive: true });

// Aceita os nomes usados pela integração Supabase ↔ Vercel e os nomes curtos.
const env = process.env;
const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || "";
const anon = env.SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.SUPABASE_PUBLISHABLE_KEY || "";
if (anon && /service_role/.test(Buffer.from(anon.split(".")[1] || "", "base64").toString())) {
  throw new Error("SUPABASE_ANON_KEY contém a chave service_role. Use a chave anon/publishable: ela vai para o navegador.");
}
writeFileSync(join(dist, "config.js"),
  `/* Gerado no build. */\nwindow.DRAP_CONFIG = ${JSON.stringify({ supabaseUrl: url, supabaseAnonKey: anon })};\n`);

const require = createRequire(import.meta.url);
const umd = join(dirname(require.resolve("@supabase/supabase-js/package.json")), "dist/umd/supabase.js");
if (!existsSync(umd)) throw new Error(`supabase-js UMD não encontrado em ${umd}`);
mkdirSync(join(dist, "vendor"), { recursive: true });
cpSync(umd, join(dist, "vendor/supabase.js"));

console.log(`build ok → dist/  (Supabase: ${url ? "configurado" : "NÃO configurado — site usa o catálogo local e o formulário fica desativado"})`);
