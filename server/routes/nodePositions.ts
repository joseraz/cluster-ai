import { Hono } from 'hono';
import { and, eq } from 'drizzle-orm';
import { db } from '../db/client';
import { contacts, nodePositions } from '../db/schema';
import { requireUser } from '../auth/requireUser';
import type { AuthVariables } from '../auth/types';

export const nodePositionsRouter = new Hono<{ Variables: AuthVariables }>();

nodePositionsRouter.use('*', requireUser);

// GET /api/node-positions — return all positions as { [contactId]: { angle, ring } }
nodePositionsRouter.get('/', async (c) => {
  const user = c.get('user');
  try {
    const rows = await db
      .select()
      .from(nodePositions)
      .where(eq(nodePositions.userId, user.id));
    const map: Record<string, { angle: number; ring?: number }> = {};
    for (const row of rows) {
      map[row.contactId] = {
        angle: row.angle,
        ring:  row.ring ?? undefined,
      };
    }
    return c.json(map);
  } catch (err) {
    console.error('GET /api/node-positions error:', err);
    return c.json({ error: 'Failed to fetch node positions' }, 500);
  }
});

// PUT /api/node-positions/:contactId — upsert a single position
nodePositionsRouter.put('/:contactId', async (c) => {
  const contactId = c.req.param('contactId');
  const user = c.get('user');
  try {
    const { angle, ring } = await c.req.json<{ angle: number; ring?: number }>();

    const contactRows = await db
      .select({ id: contacts.id })
      .from(contacts)
      .where(and(eq(contacts.id, contactId), eq(contacts.userId, user.id)))
      .limit(1);

    if (!contactRows.length) return c.json({ error: 'Not found' }, 404);

    // SQLite doesn't have native UPSERT via onConflictDoUpdate in all drivers,
    // so we check existence first then insert or update.
    const existing = await db
      .select()
      .from(nodePositions)
      .where(and(eq(nodePositions.contactId, contactId), eq(nodePositions.userId, user.id)))
      .limit(1);

    if (existing.length) {
      await db
        .update(nodePositions)
        .set({ angle, ring: ring ?? null, updatedAt: new Date().toISOString() })
        .where(and(eq(nodePositions.contactId, contactId), eq(nodePositions.userId, user.id)));
    } else {
      await db.insert(nodePositions).values({
        userId: user.id,
        contactId,
        angle,
        ring: ring ?? null,
      });
    }

    return c.json({ success: true });
  } catch (err) {
    console.error('PUT /api/node-positions/:contactId error:', err);
    return c.json({ error: 'Failed to save node position' }, 500);
  }
});

// DELETE /api/node-positions — clear all positions
nodePositionsRouter.delete('/', async (c) => {
  const user = c.get('user');
  try {
    await db.delete(nodePositions).where(eq(nodePositions.userId, user.id));
    return c.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/node-positions error:', err);
    return c.json({ error: 'Failed to clear node positions' }, 500);
  }
});
