// npm run db:migrate → aplica as migrações (a lógica fica em lib/migrate.js)
import { migrate } from "../lib/migrate.js";
import { getPool } from "../lib/db.js";

migrate().then(() => getPool().end()).catch((e) => { console.error(e.message); process.exit(1); });
