import { Hono } from 'hono';
import { and, eq } from 'drizzle-orm';
import { db } from '../db/client';
import { clusters, clusterMembers, contacts } from '../db/schema';
import { requireUser } from '../auth/requireUser';
import type { AuthVariables } from '../auth/types';
import { isSupabaseDbEnabled, supabaseForToken } from '../db/supabase';

export const clustersRouter = new Hono<{ Variables: AuthVariables }>();

clustersRouter.use('*', requireUser);

// GET /api/clusters — list all clusters with their member contact IDs
clustersRouter.get('/', async (c) => {
  const user = c.get('user');
  const accessToken = c.get('accessToken');
  try {
    if (isSupabaseDbEnabled()) {
      if (!accessToken) return c.json({ error: 'Authentication required' }, 401);
      const client = supabaseForToken(accessToken);
      const { data: clusterRows, error: clusterError } = await client
        .from('clusters')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (clusterError) throw clusterError;

      const { data: memberRows, error: memberError } = await client
        .from('cluster_members')
        .select('*')
        .eq('user_id', user.id);
      if (memberError) throw memberError;

      const memberMap: Record<string, string[]> = {};
      for (const m of memberRows ?? []) {
        const clusterId = m.cluster_id as string;
        if (!memberMap[clusterId]) memberMap[clusterId] = [];
        memberMap[clusterId].push(m.contact_id as string);
      }

      return c.json((clusterRows ?? []).map(row => ({
        id:         row.id as string,
        name:       row.name as string,
        contactIds: memberMap[row.id as string] ?? [],
        createdAt:  row.created_at as string,
      })));
    }

    const clusterRows = await db
      .select()
      .from(clusters)
      .where(eq(clusters.userId, user.id))
      .orderBy(clusters.createdAt);
    const memberRows  = await db
      .select()
      .from(clusterMembers)
      .where(eq(clusterMembers.userId, user.id));

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
  const user = c.get('user');
  const accessToken = c.get('accessToken');
  try {
    const { name } = await c.req.json<{ name: string }>();
    if (isSupabaseDbEnabled()) {
      if (!accessToken) return c.json({ error: 'Authentication required' }, 401);
      const { data, error } = await supabaseForToken(accessToken)
        .from('clusters')
        .insert({ name, user_id: user.id })
        .select('*')
        .single();
      if (error) throw error;
      return c.json({
        id: data.id,
        name: data.name,
        contactIds: [],
        createdAt: data.created_at,
      }, 201);
    }

    const rows = await db.insert(clusters).values({ name, userId: user.id }).returning();
    return c.json({ ...rows[0], contactIds: [] }, 201);
  } catch (err) {
    console.error('POST /api/clusters error:', err);
    return c.json({ error: 'Failed to create cluster' }, 500);
  }
});

// POST /api/clusters/:clusterId/members — add a contact to a cluster
clustersRouter.post('/:clusterId/members', async (c) => {
  const clusterId = c.req.param('clusterId');
  const user = c.get('user');
  const accessToken = c.get('accessToken');
  try {
    const { contactId } = await c.req.json<{ contactId: string }>();

    if (isSupabaseDbEnabled()) {
      if (!accessToken) return c.json({ error: 'Authentication required' }, 401);
      const client = supabaseForToken(accessToken);
      const { data: clusterRows, error: clusterError } = await client
        .from('clusters')
        .select('id')
        .eq('id', clusterId)
        .eq('user_id', user.id)
        .limit(1);
      if (clusterError) throw clusterError;

      const { data: contactRows, error: contactError } = await client
        .from('contacts')
        .select('id')
        .eq('id', contactId)
        .eq('user_id', user.id)
        .limit(1);
      if (contactError) throw contactError;

      if (!clusterRows?.length || !contactRows?.length) {
        return c.json({ error: 'Not found' }, 404);
      }

      const { error } = await client
        .from('cluster_members')
        .insert({ cluster_id: clusterId, contact_id: contactId, user_id: user.id });
      if (error) throw error;
      return c.json({ success: true }, 201);
    }

    const ownedRows = await db
      .select({ clusterId: clusters.id, contactId: contacts.id })
      .from(clusters)
      .innerJoin(
        contacts,
        and(eq(contacts.id, contactId), eq(contacts.userId, user.id))
      )
      .where(and(eq(clusters.id, clusterId), eq(clusters.userId, user.id)))
      .limit(1);

    if (!ownedRows.length) return c.json({ error: 'Not found' }, 404);

    await db.insert(clusterMembers).values({ clusterId, contactId, userId: user.id });
    return c.json({ success: true }, 201);
  } catch (err) {
    console.error('POST /api/clusters/:clusterId/members error:', err);
    return c.json({ error: 'Failed to add contact to cluster' }, 500);
  }
});

// DELETE /api/clusters/:id — delete a cluster
clustersRouter.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');
  const accessToken = c.get('accessToken');
  try {
    if (isSupabaseDbEnabled()) {
      if (!accessToken) return c.json({ error: 'Authentication required' }, 401);
      const { error } = await supabaseForToken(accessToken)
        .from('clusters')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
      return c.json({ success: true });
    }

    await db.delete(clusters).where(and(eq(clusters.id, id), eq(clusters.userId, user.id)));
    return c.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/clusters/:id error:', err);
    return c.json({ error: 'Failed to delete cluster' }, 500);
  }
});
