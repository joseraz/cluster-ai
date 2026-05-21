import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { runMigrations } from './db/migrate';
import { contactsRouter } from './routes/contacts';
import { nodePositionsRouter } from './routes/nodePositions';
import { clustersRouter } from './routes/clusters';

// Apply all pending DB migrations before accepting requests
runMigrations();

const app = new Hono();

// Allow requests from the Vite dev server
app.use('*', cors({ origin: 'http://localhost:8080' }));

// Mount routers
app.route('/api/contacts',       contactsRouter);
app.route('/api/node-positions', nodePositionsRouter);
app.route('/api/clusters',       clustersRouter);

// Health check
app.get('/api/health', (c) => c.json({ status: 'ok', db: 'sqlite' }));

const PORT = 3001;
serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`✓ Cluster AI API server running on http://localhost:${PORT}`);
});
