import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['server/tests/**/*.test.ts', 'src/**/*.test.ts'],
    environment: 'node',
    // better-sqlite3 is a native module — forks are safer than threads
    pool: 'forks',
    // Isolated in-memory DB per worker. Must be set here (not in test files):
    // server/db/client.ts binds the DB path at module load.
    env: { CLUSTER_DB_PATH: ':memory:' },
  },
});
