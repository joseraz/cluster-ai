import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { join } from 'path';
import { mkdirSync } from 'fs';
import * as schema from './schema';

// cluster.db lives in data/ (gitignored — contains real contact data)
const dataDir = join(process.cwd(), 'data');
mkdirSync(dataDir, { recursive: true });
const dbPath = join(dataDir, 'cluster.db');

const sqlite = new Database(dbPath);

// WAL mode gives better concurrent read performance and prevents write locking
sqlite.pragma('journal_mode = WAL');
// Enforce foreign key constraints
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });
