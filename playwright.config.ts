import { defineConfig } from '@playwright/test';

/**
 * E2E stack runs on dedicated ports with an isolated DB so it never touches
 * data/cluster.db (real contact data) or fights a running `npm run dev`.
 */
const API_PORT = 3201;
const UI_PORT = 8201;

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  // CRUD tests share one DB — run serially to keep state deterministic
  workers: 1,
  use: {
    baseURL: `http://localhost:${UI_PORT}`,
  },
  webServer: [
    {
      command: 'npx tsx server/index.ts',
      port: API_PORT,
      reuseExistingServer: false,
      env: {
        API_PORT: String(API_PORT),
        APP_ENV: 'test',
        AUTH_DEV_BYPASS_USER_ID: 'e2e-user',
        CLUSTER_DB_PATH: 'data/e2e.db',
      },
    },
    {
      command: 'npx vite',
      port: UI_PORT,
      reuseExistingServer: false,
      env: {
        PORT: String(UI_PORT),
        API_PORT: String(API_PORT),
        VITE_APP_ENV: 'test',
        VITE_AUTH_DEV_BYPASS: 'true',
      },
    },
  ],
});
