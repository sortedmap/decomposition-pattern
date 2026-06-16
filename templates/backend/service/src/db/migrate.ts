import fs from 'fs';
import path from 'path';
import { pool } from './pool';

async function ensureMigrationsTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function isApplied(name: string): Promise<boolean> {
  const { rows } = await pool.query(
    'SELECT 1 FROM schema_migrations WHERE name = $1',
    [name],
  );
  return rows.length > 0;
}

async function markApplied(name: string): Promise<void> {
  await pool.query('INSERT INTO schema_migrations (name) VALUES ($1)', [name]);
}

async function migrate(): Promise<void> {
  await ensureMigrationsTable();
  const dir = path.join(__dirname, '../../migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    if (await isApplied(file)) {
      console.log(`Skipped (already applied): ${file}`);
      continue;
    }
    const sql = fs.readFileSync(path.join(dir, file), 'utf-8');
    await pool.query(sql);
    await markApplied(file);
    console.log(`Applied: ${file}`);
  }
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
