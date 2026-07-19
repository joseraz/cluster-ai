import { Hono } from 'hono';
import { and, eq } from 'drizzle-orm';
import { db } from '../db/client';
import { contacts, nodePositions } from '../db/schema';
import { requireUser } from '../auth/requireUser';
import type { AuthVariables } from '../auth/types';
import { isSupabaseDbEnabled, supabaseForToken } from '../db/supabase';

export const nodePositionsRouter = new Hono<{ Variables: AuthVariables }>();
const ORBITAL_RING_COUNT = 5;

nodePositionsRouter.use('*', requireUser);

// GET /api/node-positions — return all positions as { [contactId]: { angle, ring } }
nodePositionsRouter.get('/', async (c) => {
  const user = c.get('user');
  const accessToken = c.get('accessToken');
  try {
    if (isSupabaseDbEnabled()) {
      if (!accessToken) return c.json({ error: 'Authentication required' }, 401);
      const { data, error } = await supabaseForToken(accessToken)
        .from('node_positions')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;

      const map: Record<string, { angle: number; ring?: number }> = {};
      for (const row of data ?? []) {
        map[row.contact_id as string] = {
          angle: row.angle as number,
        };
      }
      return c.json(map);
    }

    const rows = await db
      .select()
      .from(nodePositions)
      .where(eq(nodePositions.userId, user.id));
    const map: Record<string, { angle: number; ring?: number }> = {};
    for (const row of rows) {
      map[row.contactId] = {
        angle: row.angle,
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
  const accessToken = c.get('accessToken');
  try {
    const { angle, ring } = await c.req.json<{ angle: number; ring?: number }>();

    if (isSupabaseDbEnabled()) {
      if (!accessToken) return c.json({ error: 'Authentication required' }, 401);
      const client = supabaseForToken(accessToken);
      const { data: contactRows, error: contactError } = await client
        .from('contacts')
        .select('id')
        .eq('id', contactId)
        .eq('user_id', user.id)
        .limit(1);
      if (contactError) throw contactError;
      if (!contactRows?.length) return c.json({ error: 'Not found' }, 404);

      const nextStrength = ringToConnectionStrength(ring);
      if (nextStrength !== null) {
        const { error } = await client
          .from('contacts')
          .update({ connection_strength: nextStrength })
          .eq('id', contactId)
          .eq('user_id', user.id);
        if (error) throw error;
      }

      const { error } = await client
        .from('node_positions')
        .upsert({
          user_id: user.id,
          contact_id: contactId,
          angle,
          ring: null,
        }, {
          onConflict: 'user_id,contact_id',
        });
      if (error) throw error;

      return c.json({ success: true });
    }

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

    const nextStrength = ringToConnectionStrength(ring);

    if (nextStrength !== null) {
      await db
        .update(contacts)
        .set({ connectionStrength: nextStrength, updatedAt: new Date().toISOString() })
        .where(and(eq(contacts.id, contactId), eq(contacts.userId, user.id)));
    }

    if (existing.length) {
      await db
        .update(nodePositions)
        .set({ angle, ring: null, updatedAt: new Date().toISOString() })
        .where(and(eq(nodePositions.contactId, contactId), eq(nodePositions.userId, user.id)));
    } else {
      await db.insert(nodePositions).values({
        userId: user.id,
        contactId,
        angle,
        ring: null,
      });
    }

    return c.json({ success: true });
  } catch (err) {
    console.error('PUT /api/node-positions/:contactId error:', err);
    return c.json({ error: 'Failed to save node position' }, 500);
  }
});

function ringToConnectionStrength(ring: number | undefined) {
  if (ring === undefined) return null;
  if (!Number.isInteger(ring) || ring < 0 || ring >= ORBITAL_RING_COUNT) return null;
  return ORBITAL_RING_COUNT - ring;
}

// DELETE /api/node-positions — clear all positions
nodePositionsRouter.delete('/', async (c) => {
  const user = c.get('user');
  const accessToken = c.get('accessToken');
  try {
    if (isSupabaseDbEnabled()) {
      if (!accessToken) return c.json({ error: 'Authentication required' }, 401);
      const { error } = await supabaseForToken(accessToken)
        .from('node_positions')
        .delete()
        .eq('user_id', user.id);
      if (error) throw error;
      return c.json({ success: true });
    }

    await db.delete(nodePositions).where(eq(nodePositions.userId, user.id));
    return c.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/node-positions error:', err);
    return c.json({ error: 'Failed to clear node positions' }, 500);
  }
});
