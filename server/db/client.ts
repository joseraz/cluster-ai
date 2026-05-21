import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { join } from 'path';
import * as schema from './schema';

// cluster.db lives at the project root alongside package.json
const dbPath = join(process.cwd(), 'cluster.db');

const sqlite = new Database(dbPath);

// WAL mode gives better concurrent read performance and prevents write locking
sqlite.pragma('journal_mode = WAL');
// Enforce foreign key constraints
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });
