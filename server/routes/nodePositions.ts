import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { nodePositions } from '../db/schema';

export const nodePositionsRouter = new Hono();

// GET /api/node-positions — return all positions as { [contactId]: { angle, ring } }
nodePositionsRouter.get('/', async (c) => {
  try {
    const rows = await db.select().from(nodePositions);
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
  try {
    const { angle, ring } = await c.req.json<{ angle: number; ring?: number }>();

    // SQLite doesn't have native UPSERT via onConflictDoUpdate in all drivers,
    // so we check existence first then insert or update.
    const existing = await db
      .select()
      .from(nodePositions)
      .where(eq(nodePositions.contactId, contactId))
      .limit(1);

    if (existing.length) {
      await db
        .update(nodePositions)
        .set({ angle, ring: ring ?? null, updatedAt: new Date().toISOString() })
        .where(eq(nodePositions.contactId, contactId));
    } else {
      await db.insert(nodePositions).values({
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
  try {
    await db.delete(nodePositions);
    return c.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/node-positions error:', err);
    return c.json({ error: 'Failed to clear node positions' }, 500);
  }
});
