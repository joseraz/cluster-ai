import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { join, dirname } from 'path';
import { mkdirSync } from 'fs';
import * as schema from './schema';

// cluster.db lives in data/ (gitignored — contains real contact data).
// CLUSTER_DB_PATH overrides it for tests (':memory:' or a temp file) so test
// runs never touch real data.
const dbPath = process.env.CLUSTER_DB_PATH ?? join(process.cwd(), 'data', 'cluster.db');
if (dbPath !== ':memory:') {
  mkdirSync(dirname(dbPath), { recursive: true });
}

const sqlite = new Database(dbPath);

// WAL mode gives better concurrent read performance and prevents write locking
sqlite.pragma('journal_mode = WAL');
// Enforce foreign key constraints
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });
