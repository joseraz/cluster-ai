/**
 * Applies all pending Drizzle migrations on server startup.
 * Uses drizzle-kit generated SQL files from the ./migrations directory.
 */
import { createRequire } from 'module';
import { join } from 'path';
import { db } from './client.js';
import { isSupabaseDbEnabled } from './supabase.js';

const require = createRequire(import.meta.url);

export function runMigrations() {
  if (isSupabaseDbEnabled()) {
    console.log('✓ Supabase database enabled; skipping SQLite migrations');
    return;
  }

  const { migrate } = require('drizzle-orm/better-sqlite3/migrator') as typeof import(
    'drizzle-orm/better-sqlite3/migrator'
  );
  const migrationsFolder = join(process.cwd(), 'server', 'db', 'migrations');
  migrate(db, { migrationsFolder });
  console.log('✓ Database migrations applied');
}
