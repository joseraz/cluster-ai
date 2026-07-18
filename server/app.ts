import './config/loadEnv';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { runMigrations } from './db/migrate';
import { contactsRouter } from './routes/contacts';
import { nodePositionsRouter } from './routes/nodePositions';
import { clustersRouter } from './routes/clusters';

// Apply all pending DB migrations before accepting requests
runMigrations();

export const app = new Hono();

// Allow requests from the Vite dev server
app.use('*', cors({
  origin: process.env.APP_ORIGIN ?? 'http://localhost:8080',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Mount routers
app.route('/api/contacts',       contactsRouter);
app.route('/api/node-positions', nodePositionsRouter);
app.route('/api/clusters',       clustersRouter);

// Health check
app.get('/api/health', (c) => c.json({
  status: 'ok',
  db: 'sqlite',
  appEnv: process.env.APP_ENV ?? 'development',
  auth: 'required',
}));
