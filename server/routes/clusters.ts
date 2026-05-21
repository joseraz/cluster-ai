import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { clusters, clusterMembers } from '../db/schema';

export const clustersRouter = new Hono();

// GET /api/clusters — list all clusters with their member contact IDs
clustersRouter.get('/', async (c) => {
  try {
    const clusterRows = await db.select().from(clusters).orderBy(clusters.createdAt);
    const memberRows  = await db.select().from(clusterMembers);

    const memberMap: Record<string, string[]> = {};
    for (const m of memberRows) {
      if (!memberMap[m.clusterId]) memberMap[m.clusterId] = [];
      memberMap[m.clusterId].push(m.contactId);
    }

    return c.json(
      clusterRows.map(row => ({
        id:         row.id,
        name:       row.name,
        contactIds: memberMap[row.id] ?? [],
        createdAt:  row.createdAt,
      }))
    );
  } catch (err) {
    console.error('GET /api/clusters error:', err);
    return c.json({ error: 'Failed to fetch clusters' }, 500);
  }
});

// POST /api/clusters — create a new cluster
clustersRouter.post('/', async (c) => {
  try {
    const { name } = await c.req.json<{ name: string }>();
    const rows = await db.insert(clusters).values({ name }).returning();
    return c.json({ ...rows[0], contactIds: [] }, 201);
  } catch (err) {
    console.error('POST /api/clusters error:', err);
    return c.json({ error: 'Failed to create cluster' }, 500);
  }
});

// POST /api/clusters/:clusterId/members — add a contact to a cluster
clustersRouter.post('/:clusterId/members', async (c) => {
  const clusterId = c.req.param('clusterId');
  try {
    const { contactId } = await c.req.json<{ contactId: string }>();
    await db.insert(clusterMembers).values({ clusterId, contactId });
    return c.json({ success: true }, 201);
  } catch (err) {
    console.error('POST /api/clusters/:clusterId/members error:', err);
    return c.json({ error: 'Failed to add contact to cluster' }, 500);
  }
});

// DELETE /api/clusters/:id — delete a cluster
clustersRouter.delete('/:id', async (c) => {
  const id = c.req.param('id');
  try {
    await db.delete(clusters).where(eq(clusters.id, id));
    return c.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/clusters/:id error:', err);
    return c.json({ error: 'Failed to delete cluster' }, 500);
  }
});
