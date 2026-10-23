import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool, closePool } from "./pool.js";

export async function migrate() {
  const client = await pool.connect();
  try {
  await client.query("select pg_advisory_lock(184725, 1)");
  await client.query(`
    create table if not exists schema_migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )
  `);

  const here = path.dirname(fileURLToPath(import.meta.url));
  const localDir = path.join(here, "migrations");
  const runtimeDir = path.join(process.cwd(), "server", "db", "migrations");
  let migrationDir = localDir;
  try {
    await access(runtimeDir);
    migrationDir = runtimeDir;
  } catch {
    // Source development keeps migrations next to this module; packaged images
    // copy them to runtimeDir so they remain available after TypeScript build.
  }
  const files = (await readdir(migrationDir))
    .filter((name) => name.endsWith(".sql"))
    .sort();

  for (const name of files) {
    const existing = await client.query(
      "select 1 from schema_migrations where name = $1",
      [name],
    );
    if (existing.rowCount) continue;

    const sql = await readFile(path.join(migrationDir, name), "utf8");
    try {
      await client.query("begin");
      await client.query("set local statement_timeout = '60s'");
      await client.query(sql);
      await client.query("insert into schema_migrations (name) values ($1)", [
        name,
      ]);
      await client.query("commit");
      console.info(`Applied migration ${name}`);
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  }
  } finally {
    await client.query("select pg_advisory_unlock(184725, 1)");
    client.release();
  }
}

const isDirect =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirect) {
  migrate()
    .then(() => closePool())
    .catch(async (error) => {
      console.error(error);
      await closePool();
      process.exitCode = 1;
    });
}
