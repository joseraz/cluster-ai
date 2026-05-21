/**
 * Drizzle ORM schema — SQLite for local dev, PostgreSQL-ready for Supabase migration.
 *
 * Graph migration mapping:
 *   contacts        → Node label :Person
 *   relationships   → Edge label :KNOWS  (source_id)-[r]->(target_id)
 *   clusters        → Node label :Cluster
 *   cluster_members → Edge label :BELONGS_TO
 *   node_positions  → UI-only orbital state (skip at graph migration time)
 *
 * To switch to PostgreSQL (Supabase):
 *   Change imports from 'drizzle-orm/sqlite-core' → 'drizzle-orm/pg-core'
 *   Replace text(..., { mode: 'json' }) with jsonb(...)
 *   Replace real(...) with doublePrecision(...)
 */

import {
  sqliteTable,
  text,
  integer,
  real,
  primaryKey,
  unique,
} from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ── contacts ──────────────────────────────────────────────────────────────────
// Graph node: (:Person { id, firstName, lastName, ... })
export const contacts = sqliteTable('contacts', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  // Identity
  firstName: text('first_name').notNull(),
  lastName:  text('last_name').notNull(),
  // No profile_image — not storing pictures of contacts
  email:     text('email'),
  phone:     text('phone'),
  livesIn:   text('lives_in'),
  company:   text('company'),

  socialLinks: text('social_links', { mode: 'json' })
    .$type<string[]>()
    .default(sql`'[]'`),

  // Denormalized edge fields for Phase 1 (avoids JOIN on every contacts fetch).
  // The `relationships` table holds the authoritative graph-edge version.
  connectionType:     text('connection_type'),
  connectionStrength: integer('connection_strength'),
  howWeMet:           text('how_we_met'),

  // JSONB blobs — flattened to node properties at graph migration time
  interests: text('interests', { mode: 'json' })
    .$type<{ about?: string; hobbies?: string; favouriteFood?: string }>(),

  careerAndWork: text('career_and_work', { mode: 'json' })
    .$type<{ role?: string; company?: string; notes?: string }>(),

  education: text('education', { mode: 'json' })
    .$type<{ institution?: string; degree?: string }>(),

  // Phase 2 placeholder: user_id TEXT — uncomment for multi-user support
  // userId: text('user_id'),

  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ── relationships ─────────────────────────────────────────────────────────────
// Graph edge: (source:Person)-[:KNOWS { type, strength, howWeMet }]->(target:Person)
// source_id / target_id naming intentionally mirrors graph edge semantics.
// source_type / target_type allow future non-Person nodes (company, place, etc.)
export const relationships = sqliteTable(
  'relationships',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    sourceId:   text('source_id').notNull(),
    sourceType: text('source_type').notNull().default('contact'),
    targetId:   text('target_id').notNull(),
    targetType: text('target_type').notNull().default('contact'),

    relationshipType:   text('relationship_type'),
    connectionStrength: integer('connection_strength'),
    howWeMet:           text('how_we_met'),
    notes:              text('notes'),

    // Phase 2 placeholder: userId TEXT
    // userId: text('user_id'),

    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => ({
    uniq: unique().on(t.sourceId, t.targetId, t.relationshipType),
  })
);

// ── node_positions ────────────────────────────────────────────────────────────
// UI-only orbital canvas state — NOT a graph primitive; skip at migration time.
// Stores each contact's drag-pinned angle (radians) and ring index (0–4).
export const nodePositions = sqliteTable('node_positions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  contactId: text('contact_id').notNull().unique(),
  angle:     real('angle').notNull(),
  ring:      integer('ring'),

  // Phase 2 placeholder: userId TEXT
  // userId: text('user_id'),

  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ── clusters ──────────────────────────────────────────────────────────────────
// Graph node: (:Cluster { id, name })
export const clusters = sqliteTable('clusters', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  name: text('name').notNull(),

  // Phase 2 placeholder: userId TEXT
  // userId: text('user_id'),

  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ── cluster_members ───────────────────────────────────────────────────────────
// Graph edge: (contact:Person)-[:BELONGS_TO]->(cluster:Cluster)
export const clusterMembers = sqliteTable(
  'cluster_members',
  {
    clusterId: text('cluster_id')
      .notNull()
      .references(() => clusters.id, { onDelete: 'cascade' }),
    contactId: text('contact_id')
      .notNull()
      .references(() => contacts.id, { onDelete: 'cascade' }),
    addedAt: text('added_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.clusterId, t.contactId] }),
  })
);
