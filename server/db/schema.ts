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
  index,
} from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const userProfiles = sqliteTable('user_profiles', {
  id: text('id').primaryKey(),
  email: text('email'),
  role: text('role', { enum: ['super_admin', 'standard_user'] })
    .notNull()
    .default('standard_user'),
  username: text('username').unique(),
  displayName: text('display_name'),
  bio: text('bio'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  location: text('location'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const impersonationSessions = sqliteTable(
  'impersonation_sessions',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    actorUserId: text('actor_user_id')
      .notNull()
      .references(() => userProfiles.id, { onDelete: 'cascade' }),
    targetUserId: text('target_user_id')
      .notNull()
      .references(() => userProfiles.id, { onDelete: 'cascade' }),
    reason: text('reason').notNull(),
    status: text('status', { enum: ['active', 'ended'] })
      .notNull()
      .default('active'),
    startedAt: text('started_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    endedAt: text('ended_at'),
  },
  (t) => ({
    actorIdx: index('impersonation_sessions_actor_idx').on(t.actorUserId),
    targetIdx: index('impersonation_sessions_target_idx').on(t.targetUserId),
  })
);

export const auditEvents = sqliteTable(
  'audit_events',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    actorUserId: text('actor_user_id').notNull(),
    targetUserId: text('target_user_id'),
    action: text('action').notNull(),
    metadata: text('metadata', { mode: 'json' })
      .$type<Record<string, unknown>>()
      .default(sql`'{}'`),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => ({
    actorIdx: index('audit_events_actor_idx').on(t.actorUserId),
    targetIdx: index('audit_events_target_idx').on(t.targetUserId),
    actionIdx: index('audit_events_action_idx').on(t.action),
  })
);

// ── contacts ──────────────────────────────────────────────────────────────────
// Graph node: (:Person { id, firstName, lastName, ... })
export const contacts = sqliteTable('contacts', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  userId: text('user_id').notNull(),

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

    userId: text('user_id').notNull(),

    sourceId:   text('source_id').notNull(),
    sourceType: text('source_type').notNull().default('contact'),
    targetId:   text('target_id').notNull(),
    targetType: text('target_type').notNull().default('contact'),

    relationshipType:   text('relationship_type'),
    connectionStrength: integer('connection_strength'),
    howWeMet:           text('how_we_met'),
    notes:              text('notes'),

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

  userId: text('user_id').notNull(),
  contactId: text('contact_id').notNull().unique(),
  angle:     real('angle').notNull(),
  ring:      integer('ring'),

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

  userId: text('user_id').notNull(),
  name: text('name').notNull(),

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
    userId: text('user_id').notNull(),
    addedAt: text('added_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.clusterId, t.contactId] }),
  })
);
