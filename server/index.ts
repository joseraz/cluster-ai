import { serve } from '@hono/node-server';
import { app } from './app.js';

const PORT = Number(process.env.API_PORT ?? 3001);
serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`✓ Cluster AI API server running on http://localhost:${PORT}`);
});
