import { Hono } from 'hono';
import { and, asc, count, eq, inArray } from 'drizzle-orm';
import { db } from '../db/client';
import { contacts, nodePositions, relationshipStories } from '../db/schema';
import { requireUser } from '../auth/requireUser';
import type { AuthVariables } from '../auth/types';
import { getContactLimit } from '../config/contactNetwork';

export const contactsRouter = new Hono<{ Variables: AuthVariables }>();

contactsRouter.use('*', requireUser);

// GET /api/contacts — list all contacts, newest first
contactsRouter.get('/', async (c) => {
  const user = c.get('user');
  try {
    const rows = await db
      .select()
      .from(contacts)
      .where(eq(contacts.userId, user.id))
      .orderBy(contacts.createdAt);
    const storiesByContactId = await loadStoriesForContacts(
      user.id,
      rows.map(row => row.id),
    );
    return c.json(rows.map(row => dbRowToContact(row, storiesByContactId.get(row.id) ?? [])));
  } catch (err) {
    console.error('GET /api/contacts error:', err);
    return c.json({ error: 'Failed to fetch contacts' }, 500);
  }
});

// GET /api/contacts/:id — single contact
contactsRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');
  try {
    const rows = await db
      .select()
      .from(contacts)
      .where(and(eq(contacts.id, id), eq(contacts.userId, user.id)))
      .limit(1);
    if (!rows.length) return c.json({ error: 'Not found' }, 404);
    const stories = await loadStoriesForContact(user.id, id);
    return c.json(dbRowToContact(rows[0], stories));
  } catch (err) {
    console.error('GET /api/contacts/:id error:', err);
    return c.json({ error: 'Failed to fetch contact' }, 500);
  }
});

// POST /api/contacts — create a new contact
contactsRouter.post('/', async (c) => {
  const user = c.get('user');
  try {
    const body = await c.req.json();
    if (!body.firstName?.trim() || !body.lastName?.trim()) {
      return c.json({ error: 'firstName and lastName are required' }, 400);
    }

    const contactLimit = getContactLimit();
    const [{ value: existingCount }] = await db
      .select({ value: count() })
      .from(contacts)
      .where(eq(contacts.userId, user.id));

    if (existingCount >= contactLimit) {
      return c.json({
        error: 'Contact limit reached',
        limit: contactLimit,
      }, 409);
    }

    const storiesInput = storyInputsFromBody(body);
    const values = { ...contactInputToDb(body), userId: user.id };
    const rows = await db.insert(contacts).values(values).returning();
    if (storiesInput?.length) {
      await replaceRelationshipStories(user.id, rows[0].id, storiesInput);
    }
    const stories = await loadStoriesForContact(user.id, rows[0].id);
    return c.json(dbRowToContact(rows[0], stories), 201);
  } catch (err) {
    console.error('POST /api/contacts error:', err);
    return c.json({ error: 'Failed to create contact' }, 500);
  }
});

// PATCH /api/contacts/:id — partial update
contactsRouter.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');
  try {
    const body = await c.req.json();
    const values = contactInputToDb(body, true);
    const storiesInput = storyInputsFromBody(body);
    const rows = await db
      .update(contacts)
      .set({ ...values, updatedAt: new Date().toISOString() })
      .where(and(eq(contacts.id, id), eq(contacts.userId, user.id)))
      .returning();
    if (!rows.length) return c.json({ error: 'Not found' }, 404);
    if (storiesInput) {
      await replaceRelationshipStories(user.id, id, storiesInput);
    }
    await clearSavedRingWhenStrengthChanges(user.id, id, body.connectionStrength);
    const stories = await loadStoriesForContact(user.id, id);
    return c.json(dbRowToContact(rows[0], stories));
  } catch (err) {
    console.error('PATCH /api/contacts/:id error:', err);
    return c.json({ error: 'Failed to update contact' }, 500);
  }
});

// DELETE /api/contacts/:id — delete a contact and its saved canvas position
contactsRouter.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');
  try {
    const rows = await db
      .delete(contacts)
      .where(and(eq(contacts.id, id), eq(contacts.userId, user.id)))
      .returning();
    if (!rows.length) return c.json({ error: 'Not found' }, 404);
    // node_positions.contactId has no FK — clean up the orphan explicitly
    await db
      .delete(nodePositions)
      .where(and(eq(nodePositions.contactId, id), eq(nodePositions.userId, user.id)));
    return c.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/contacts/:id error:', err);
    return c.json({ error: 'Failed to delete contact' }, 500);
  }
});

// ── helpers ───────────────────────────────────────────────────────────────────

type DbRow = typeof contacts.$inferSelect;
type StoryDbRow = typeof relationshipStories.$inferSelect;

interface RelationshipStoryInput {
  id?: string;
  body?: string;
  summary?: string | null;
  summaryStatus?: string | null;
  occurredAt?: string | null;
}

function dbRowToRelationshipStory(row: StoryDbRow) {
  return {
    id:            row.id,
    body:          row.body,
    summary:       row.summary ?? undefined,
    summaryStatus: row.summaryStatus ?? undefined,
    occurredAt:    row.occurredAt ?? undefined,
    createdAt:     row.createdAt,
    updatedAt:     row.updatedAt,
  };
}

async function loadStoriesForContact(userId: string, contactId: string) {
  const rows = await db
    .select()
    .from(relationshipStories)
    .where(and(
      eq(relationshipStories.userId, userId),
      eq(relationshipStories.contactId, contactId),
    ))
    .orderBy(asc(relationshipStories.createdAt));

  return rows;
}

async function loadStoriesForContacts(userId: string, contactIds: string[]) {
  const grouped = new Map<string, StoryDbRow[]>();
  if (!contactIds.length) return grouped;

  const rows = await db
    .select()
    .from(relationshipStories)
    .where(and(
      eq(relationshipStories.userId, userId),
      inArray(relationshipStories.contactId, contactIds),
    ))
    .orderBy(asc(relationshipStories.createdAt));

  for (const row of rows) {
    const contactStories = grouped.get(row.contactId) ?? [];
    contactStories.push(row);
    grouped.set(row.contactId, contactStories);
  }

  return grouped;
}

function storyInputsFromBody(body: Record<string, unknown>): RelationshipStoryInput[] | undefined {
  if (Array.isArray(body.relationshipStories)) {
    return body.relationshipStories
      .filter((story): story is RelationshipStoryInput =>
        !!story && typeof story === 'object' && typeof (story as RelationshipStoryInput).body === 'string'
      )
      .map(story => ({
        ...story,
        body: story.body?.trim(),
      }))
      .filter(story => !!story.body);
  }

  if (typeof body.howWeMet === 'string' && body.howWeMet.trim()) {
    return [{ body: body.howWeMet.trim() }];
  }

  return undefined;
}

async function replaceRelationshipStories(
  userId: string,
  contactId: string,
  storiesInput: RelationshipStoryInput[],
) {
  const existingRows = await loadStoriesForContact(userId, contactId);
  const existingIds = new Set(existingRows.map(row => row.id));
  const incomingIds = new Set(storiesInput.map(story => story.id).filter(Boolean));
  const now = new Date().toISOString();

  for (const row of existingRows) {
    if (!incomingIds.has(row.id)) {
      await db
        .delete(relationshipStories)
        .where(and(
          eq(relationshipStories.id, row.id),
          eq(relationshipStories.userId, userId),
          eq(relationshipStories.contactId, contactId),
        ));
    }
  }

  for (const [index, story] of storiesInput.entries()) {
    const values = {
      body:          story.body?.trim() ?? '',
      summary:       story.summary || null,
      summaryStatus: story.summaryStatus || null,
      occurredAt:    story.occurredAt || null,
      updatedAt:     now,
    };

    if (story.id && existingIds.has(story.id)) {
      await db
        .update(relationshipStories)
        .set(values)
        .where(and(
          eq(relationshipStories.id, story.id),
          eq(relationshipStories.userId, userId),
          eq(relationshipStories.contactId, contactId),
        ));
    } else if (values.body) {
      await db
        .insert(relationshipStories)
        .values({
          userId,
          contactId,
          createdAt: new Date(Date.now() + index).toISOString(),
          ...values,
        });
    }
  }
}

async function clearSavedRingWhenStrengthChanges(
  userId: string,
  contactId: string,
  connectionStrength: unknown,
) {
  if (connectionStrength === undefined) return;
  const strength = Number(connectionStrength);
  if (!Number.isInteger(strength) || strength < 1 || strength > 5) return;

  await db
    .update(nodePositions)
    .set({ ring: null, updatedAt: new Date().toISOString() })
    .where(and(
      eq(nodePositions.userId, userId),
      eq(nodePositions.contactId, contactId),
    ));
}

/** Maps snake_case DB row → camelCase Contact shape for the frontend */
function dbRowToContact(row: DbRow, stories: StoryDbRow[] = []) {
  const relationshipStoryResponses = stories.map(dbRowToRelationshipStory);
  return {
    id:                 row.id,
    firstName:          row.firstName,
    lastName:           row.lastName,
    email:              row.email ?? undefined,
    phone:              row.phone ?? undefined,
    livesIn:            row.livesIn ?? undefined,
    company:            row.company ?? undefined,
    socialLinks:        (row.socialLinks as string[] | null) ?? undefined,
    connectionType:     row.connectionType ?? undefined,
    connectionStrength: row.connectionStrength ?? undefined,
    howWeMet:           relationshipStoryResponses[0]?.body ?? row.howWeMet ?? undefined,
    relationshipStories: relationshipStoryResponses,
    interests:          row.interests ?? undefined,
    careerAndWork:      row.careerAndWork ?? undefined,
    education:          row.education ?? undefined,
    createdAt:          row.createdAt,
  };
}

/** Maps camelCase frontend body → DB insert/update values */
function contactInputToDb(body: Record<string, unknown>, partial = false) {
  const values: Partial<typeof contacts.$inferInsert> = {};

  if (!partial || body.firstName !== undefined) values.firstName = body.firstName as string;
  if (!partial || body.lastName  !== undefined) values.lastName  = body.lastName  as string;

  if (body.email              !== undefined) values.email              = (body.email as string) || null;
  if (body.phone              !== undefined) values.phone              = (body.phone as string) || null;
  if (body.livesIn            !== undefined) values.livesIn            = (body.livesIn as string) || null;
  if (body.company            !== undefined) values.company            = (body.company as string) || null;
  if (body.socialLinks        !== undefined) values.socialLinks        = body.socialLinks as string[];
  if (body.connectionType     !== undefined) values.connectionType     = (body.connectionType as string) || null;
  if (body.connectionStrength !== undefined) values.connectionStrength = body.connectionStrength as number | null;
  if (body.howWeMet           !== undefined) values.howWeMet           = (body.howWeMet as string) || null;
  if (body.interests          !== undefined) values.interests          = body.interests as typeof values.interests;
  if (body.careerAndWork      !== undefined) values.careerAndWork      = body.careerAndWork as typeof values.careerAndWork;
  if (body.education          !== undefined) values.education          = body.education as typeof values.education;

  return values;
}
