/**
 * Applies all pending Drizzle migrations on server startup.
 * Uses drizzle-kit generated SQL files from the ./migrations directory.
 */
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { join } from 'path';
import { db } from './client';
import { isSupabaseDbEnabled } from './supabase';

export function runMigrations() {
  if (isSupabaseDbEnabled()) {
    console.log('✓ Supabase database enabled; skipping SQLite migrations');
    return;
  }

  const migrationsFolder = join(process.cwd(), 'server', 'db', 'migrations');
  migrate(db, { migrationsFolder });
  console.log('✓ Database migrations applied');
}
