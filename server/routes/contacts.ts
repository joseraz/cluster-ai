import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { contacts } from '../db/schema';

export const contactsRouter = new Hono();

// GET /api/contacts — list all contacts, newest first
contactsRouter.get('/', async (c) => {
  try {
    const rows = await db.select().from(contacts).orderBy(contacts.createdAt);
    return c.json(rows.map(dbRowToContact));
  } catch (err) {
    console.error('GET /api/contacts error:', err);
    return c.json({ error: 'Failed to fetch contacts' }, 500);
  }
});

// GET /api/contacts/:id — single contact
contactsRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const rows = await db.select().from(contacts).where(eq(contacts.id, id)).limit(1);
    if (!rows.length) return c.json({ error: 'Not found' }, 404);
    return c.json(dbRowToContact(rows[0]));
  } catch (err) {
    console.error('GET /api/contacts/:id error:', err);
    return c.json({ error: 'Failed to fetch contact' }, 500);
  }
});

// POST /api/contacts — create a new contact
contactsRouter.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const values = contactInputToDb(body);
    const rows = await db.insert(contacts).values(values).returning();
    return c.json(dbRowToContact(rows[0]), 201);
  } catch (err) {
    console.error('POST /api/contacts error:', err);
    return c.json({ error: 'Failed to create contact' }, 500);
  }
});

// PATCH /api/contacts/:id — partial update
contactsRouter.patch('/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const body = await c.req.json();
    const values = contactInputToDb(body, true);
    const rows = await db
      .update(contacts)
      .set({ ...values, updatedAt: new Date().toISOString() })
      .where(eq(contacts.id, id))
      .returning();
    if (!rows.length) return c.json({ error: 'Not found' }, 404);
    return c.json(dbRowToContact(rows[0]));
  } catch (err) {
    console.error('PATCH /api/contacts/:id error:', err);
    return c.json({ error: 'Failed to update contact' }, 500);
  }
});

// DELETE /api/contacts/:id — delete a contact
contactsRouter.delete('/:id', async (c) => {
  const id = c.req.param('id');
  try {
    await db.delete(contacts).where(eq(contacts.id, id));
    return c.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/contacts/:id error:', err);
    return c.json({ error: 'Failed to delete contact' }, 500);
  }
});

// ── helpers ───────────────────────────────────────────────────────────────────

type DbRow = typeof contacts.$inferSelect;

/** Maps snake_case DB row → camelCase Contact shape for the frontend */
function dbRowToContact(row: DbRow) {
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
    howWeMet:           row.howWeMet ?? undefined,
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
