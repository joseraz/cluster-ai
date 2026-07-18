import { describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import '../app';
import { db } from '../db/client';
import { contacts, relationshipStories } from '../db/schema';

describe('relationship stories database model', () => {
  it('stores editable story entries with AI-summary-ready fields', async () => {
    const [contact] = await db
      .insert(contacts)
      .values({
        userId: 'db_story_user',
        firstName: 'Database',
        lastName: 'Story',
      })
      .returning();

    const [story] = await db
      .insert(relationshipStories)
      .values({
        userId: 'db_story_user',
        contactId: contact.id,
        body: 'Met at a private capital dinner.',
        summary: 'Private capital dinner introduction.',
        summaryStatus: 'ready',
        occurredAt: '2026-07-18T20:00:00.000Z',
      })
      .returning();

    expect(story.id).toBeTruthy();
    expect(story.body).toBe('Met at a private capital dinner.');
    expect(story.summary).toBe('Private capital dinner introduction.');
    expect(story.summaryStatus).toBe('ready');
    expect(story.occurredAt).toBe('2026-07-18T20:00:00.000Z');
    expect(story.createdAt).toBeTruthy();
    expect(story.updatedAt).toBeTruthy();
  });

  it('cascades stories when a contact is deleted', async () => {
    const [contact] = await db
      .insert(contacts)
      .values({
        userId: 'db_cascade_user',
        firstName: 'Cascade',
        lastName: 'Story',
      })
      .returning();

    await db.insert(relationshipStories).values({
      userId: 'db_cascade_user',
      contactId: contact.id,
      body: 'Relationship context that should be removed.',
    });

    await db.delete(contacts).where(eq(contacts.id, contact.id));

    const rows = await db
      .select()
      .from(relationshipStories)
      .where(eq(relationshipStories.contactId, contact.id));
    expect(rows).toHaveLength(0);
  });
});
