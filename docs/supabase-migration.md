# Supabase Migration Plan

**Status:** Not started — local SQLite backend is in place and working  
**When to execute:** When you're ready to deploy the app beyond your local machine, or when you want data accessible across devices  
**Estimated effort:** 2–4 hours

---

## Background

The app currently runs against a local Hono + SQLite stack (`cluster.db` at the project root). The database schema was deliberately designed to be PostgreSQL-compatible so that migrating to Supabase requires **no structural changes** — only swapping the transport layer (from `fetch()` wrappers to the Supabase JS client).

The same schema also has a clear path to a **graph database** (Neo4j, FalkorDB) for long-term contact-network traversal — documented in the final section.

---

## Pre-Migration Checklist

Before starting, have these ready:

- [ ] Supabase account at [supabase.com](https://supabase.com)
- [ ] A new Supabase project created (free tier is fine)
- [ ] Project URL and anon key from **Project Settings → API**
- [ ] (Optional) Auth0 application configured — needed only for multi-user RLS

---

## Step 1 — Apply the Schema to Supabase

The PostgreSQL equivalent of the current SQLite schema is below. Run it in the **Supabase SQL Editor** (Dashboard → SQL Editor → New query).

```sql
-- ════════════════════════════════════════════════════════════
-- Cluster AI — Supabase Schema
-- Graph migration notes:
--   contacts        → Node label :Person
--   relationships   → Edge label :KNOWS  (source_id)-[r]->(target_id)
--   clusters        → Node label :Cluster
--   cluster_members → Edge label :BELONGS_TO
--   node_positions  → UI-only orbital state (skip at graph migration time)
-- ════════════════════════════════════════════════════════════

-- ── contacts ── (Graph node: :Person)
CREATE TABLE contacts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name          TEXT NOT NULL,
  last_name           TEXT NOT NULL,
  -- No profile_image — not storing pictures of contacts
  email               TEXT,
  phone               TEXT,
  lives_in            TEXT,
  company             TEXT,
  social_links        TEXT[]  DEFAULT '{}',
  -- Denormalized edge fields for fast reads (Phase 1, single-user)
  connection_type     TEXT,
  connection_strength INTEGER,
  how_we_met          TEXT,
  -- JSONB blobs — become flat node properties at graph migration time
  interests           JSONB DEFAULT '{}',
  career_and_work     JSONB DEFAULT '{}',
  education           JSONB DEFAULT '{}',
  -- Phase 2: uncomment when Auth0 JWT is wired in
  -- user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── relationships ── (Graph edge: source -[:KNOWS]-> target)
-- source_id / target_id intentionally mirrors graph edge semantics.
-- source_type / target_type allow future non-Person nodes (Company, Place, etc.)
CREATE TABLE relationships (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id           UUID NOT NULL,
  source_type         TEXT NOT NULL DEFAULT 'contact',
  target_id           UUID NOT NULL,
  target_type         TEXT NOT NULL DEFAULT 'contact',
  relationship_type   TEXT,
  connection_strength INTEGER,
  how_we_met          TEXT,
  notes               TEXT,
  -- user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source_id, target_id, relationship_type)
);

-- ── node_positions ── (UI-only orbital canvas state)
CREATE TABLE node_positions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id  UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  -- user_id  UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  angle       DOUBLE PRECISION NOT NULL,
  ring        INTEGER CHECK (ring BETWEEN 0 AND 4),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (contact_id)
);

-- ── clusters ── (Graph node: :Cluster)
CREATE TABLE clusters (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  -- user_id  UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── cluster_members ── (Graph edge: :BELONGS_TO)
CREATE TABLE cluster_members (
  cluster_id  UUID NOT NULL REFERENCES clusters(id)  ON DELETE CASCADE,
  contact_id  UUID NOT NULL REFERENCES contacts(id)  ON DELETE CASCADE,
  added_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (cluster_id, contact_id)
);

-- ── Indexes
CREATE INDEX idx_relationships_source    ON relationships(source_id);
CREATE INDEX idx_relationships_target    ON relationships(target_id);
CREATE INDEX idx_node_positions_contact  ON node_positions(contact_id);
CREATE INDEX idx_cluster_members_contact ON cluster_members(contact_id);

-- ── updated_at auto-trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER contacts_updated_at
  BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER relationships_updated_at
  BEFORE UPDATE ON relationships FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── RLS: disabled for Phase 1 (single-user, no auth gating)
-- Enable and configure in Phase 2 — see "Auth Integration" section below.
ALTER TABLE contacts        DISABLE ROW LEVEL SECURITY;
ALTER TABLE relationships   DISABLE ROW LEVEL SECURITY;
ALTER TABLE node_positions  DISABLE ROW LEVEL SECURITY;
ALTER TABLE clusters        DISABLE ROW LEVEL SECURITY;
ALTER TABLE cluster_members DISABLE ROW LEVEL SECURITY;
```

---

## Step 2 — Add Environment Variables

Create (or update) `.env.local` in the project root:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Both values are in the Supabase dashboard under **Project Settings → API**.

---

## Step 3 — Install the Supabase Client

```bash
npm install @supabase/supabase-js
```

---

## Step 4 — Create the Supabase Client

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
```

---

## Step 5 — Replace the API Layer

The four files in `src/api/` currently make `fetch()` calls to the local Hono server. Swap each one to use the Supabase client instead. The **function signatures stay identical** — nothing else in the codebase needs to change.

### `src/api/contacts.ts` — replace with:

```typescript
import { supabase } from '@/lib/supabase';
import type { Contact } from '@/contexts/ContactsContext';

function rowToContact(row: Record<string, unknown>): Contact {
  return {
    id:                 row.id as string,
    firstName:          row.first_name as string,
    lastName:           row.last_name as string,
    email:              (row.email as string) ?? undefined,
    phone:              (row.phone as string) ?? undefined,
    livesIn:            (row.lives_in as string) ?? undefined,
    company:            (row.company as string) ?? undefined,
    socialLinks:        (row.social_links as string[]) ?? undefined,
    connectionType:     (row.connection_type as Contact['connectionType']) ?? undefined,
    connectionStrength: (row.connection_strength as number) ?? undefined,
    howWeMet:           (row.how_we_met as string) ?? undefined,
    interests:          (row.interests as Contact['interests']) ?? undefined,
    careerAndWork:      (row.career_and_work as Contact['careerAndWork']) ?? undefined,
    education:          (row.education as Contact['education']) ?? undefined,
    createdAt:          row.created_at as string,
  };
}

export async function getContacts(): Promise<Contact[]> {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToContact);
}

export async function createContact(input: Omit<Contact, 'id' | 'createdAt'>): Promise<Contact> {
  const { data, error } = await supabase
    .from('contacts')
    .insert({
      first_name:          input.firstName,
      last_name:           input.lastName,
      email:               input.email ?? null,
      phone:               input.phone ?? null,
      lives_in:            input.livesIn ?? null,
      company:             input.company ?? null,
      social_links:        input.socialLinks ?? [],
      connection_type:     input.connectionType ?? null,
      connection_strength: input.connectionStrength ?? null,
      how_we_met:          input.howWeMet ?? null,
      interests:           input.interests ?? null,
      career_and_work:     input.careerAndWork ?? null,
      education:           input.education ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToContact(data);
}

export async function updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
  const patch: Record<string, unknown> = {};
  if (updates.firstName         !== undefined) patch.first_name          = updates.firstName;
  if (updates.lastName          !== undefined) patch.last_name           = updates.lastName;
  if (updates.email             !== undefined) patch.email               = updates.email;
  if (updates.phone             !== undefined) patch.phone               = updates.phone;
  if (updates.livesIn           !== undefined) patch.lives_in            = updates.livesIn;
  if (updates.company           !== undefined) patch.company             = updates.company;
  if (updates.socialLinks       !== undefined) patch.social_links        = updates.socialLinks;
  if (updates.connectionType    !== undefined) patch.connection_type     = updates.connectionType;
  if (updates.connectionStrength !== undefined) patch.connection_strength = updates.connectionStrength;
  if (updates.howWeMet          !== undefined) patch.how_we_met          = updates.howWeMet;
  if (updates.interests         !== undefined) patch.interests           = updates.interests;
  if (updates.careerAndWork     !== undefined) patch.career_and_work     = updates.careerAndWork;
  if (updates.education         !== undefined) patch.education           = updates.education;

  const { data, error } = await supabase
    .from('contacts')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return rowToContact(data);
}

export async function deleteContact(id: string): Promise<void> {
  const { error } = await supabase.from('contacts').delete().eq('id', id);
  if (error) throw error;
}
```

### `src/api/nodePositions.ts` — replace with:

```typescript
import { supabase } from '@/lib/supabase';
import type { NodeAngle } from '@/hooks/useNodePositions';

export type NodePositionMap = Record<string, NodeAngle>;

export async function getNodePositions(): Promise<NodePositionMap> {
  const { data, error } = await supabase
    .from('node_positions')
    .select('contact_id, angle, ring');
  if (error) throw error;
  const map: NodePositionMap = {};
  for (const row of data ?? []) {
    map[row.contact_id] = { angle: row.angle, ring: row.ring ?? undefined };
  }
  return map;
}

export async function upsertNodePosition(contactId: string, position: NodeAngle): Promise<void> {
  const { error } = await supabase
    .from('node_positions')
    .upsert({ contact_id: contactId, angle: position.angle, ring: position.ring ?? null },
             { onConflict: 'contact_id' });
  if (error) throw error;
}

export async function clearNodePositions(): Promise<void> {
  const { error } = await supabase.from('node_positions').delete().gte('id', '00000000-0000-0000-0000-000000000000');
  if (error) throw error;
}
```

### `src/api/clusters.ts` — replace with:

```typescript
import { supabase } from '@/lib/supabase';
import type { Cluster } from '@/contexts/ContactsContext';

export async function getClusters(): Promise<Cluster[]> {
  const { data: clusterRows, error: ce } = await supabase.from('clusters').select('*');
  if (ce) throw ce;
  const { data: memberRows, error: me } = await supabase.from('cluster_members').select('*');
  if (me) throw me;

  const memberMap: Record<string, string[]> = {};
  for (const m of memberRows ?? []) {
    if (!memberMap[m.cluster_id]) memberMap[m.cluster_id] = [];
    memberMap[m.cluster_id].push(m.contact_id);
  }
  return (clusterRows ?? []).map(row => ({
    id: row.id, name: row.name, contactIds: memberMap[row.id] ?? [], createdAt: row.created_at,
  }));
}

export async function createCluster(name: string): Promise<Cluster> {
  const { data, error } = await supabase.from('clusters').insert({ name }).select().single();
  if (error) throw error;
  return { id: data.id, name: data.name, contactIds: [], createdAt: data.created_at };
}

export async function addContactToCluster(clusterId: string, contactId: string): Promise<void> {
  const { error } = await supabase.from('cluster_members').insert({ cluster_id: clusterId, contact_id: contactId });
  if (error) throw error;
}
```

---

## Step 6 — Stop the Local Hono Server

Once the Supabase API layer is in place, the Hono server and SQLite file are no longer needed for production. Update `package.json` to restore the simple dev script:

```json
"dev": "vite"
```

You can keep `dev:api` and the server code around for local-only testing if preferred.

---

## Step 7 — Migrate Existing Data (Optional)

If you have real contacts in your local `cluster.db` that you want to carry over:

```bash
# Export contacts from SQLite as JSON
npx tsx -e "
  import Database from 'better-sqlite3';
  const db = new Database('./cluster.db');
  console.log(JSON.stringify(db.prepare('SELECT * FROM contacts').all(), null, 2));
" > contacts_export.json
```

Then import via the Supabase dashboard (Table Editor → Insert rows) or write a one-time script that calls `createContact()` for each row.

---

## Step 8 — Verify

1. Open `localhost:8080/app/contacts` — contacts load from Supabase
2. Add a new contact → appears in Supabase Table Editor in real time
3. Open an incognito window / different device → same contacts visible
4. Delete a contact → removed from Supabase
5. Drag a node → position persists across hard refresh

---

## Phase 2 — Auth Integration (After Supabase migration)

When you want to gate the app behind Auth0 login and scope data per-user:

### 2a — Wire Auth0 JWT into Supabase

1. In Supabase dashboard: **Authentication → JWT Settings → Custom JWT**
2. Paste your Auth0 **JWKS URI**: `https://YOUR_AUTH0_DOMAIN/.well-known/jwks.json`
3. Set **JWT secret** to use JWKS

### 2b — Add `user_id` columns

Run a migration uncommenting all the `user_id` lines in the schema above and back-filling them:

```sql
ALTER TABLE contacts        ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE relationships   ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE node_positions  ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE clusters        ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
```

### 2c — Enable Row Level Security

```sql
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contacts_owner" ON contacts USING (user_id = auth.uid());

ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "relationships_owner" ON relationships USING (user_id = auth.uid());

ALTER TABLE node_positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "node_positions_owner" ON node_positions USING (user_id = auth.uid());

ALTER TABLE clusters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clusters_owner" ON clusters USING (user_id = auth.uid());
```

### 2d — Inject Auth0 token into Supabase client

In `src/lib/supabase.ts`, use the Auth0 access token to authenticate every request:

```typescript
import { useAuth0 } from '@auth0/auth0-react';
import { supabase } from '@/lib/supabase';

// Call this once after login
const { getAccessTokenSilently } = useAuth0();
const token = await getAccessTokenSilently();
await supabase.auth.setSession({ access_token: token, refresh_token: '' });
```

After this, RLS automatically scopes all queries to the logged-in user — no changes needed to the API layer.

---

## Long-Term — Graph Database Migration

When the contact network grows complex enough to warrant graph traversal (e.g., "find the shortest trust path to person X"), the current schema exports directly to Cypher:

### Node export

```cypher
// contacts → :Person nodes
CREATE (p:Person {
  id:        row.id,
  firstName: row.first_name,
  lastName:  row.last_name,
  livesIn:   row.lives_in,
  company:   row.company
  // JSONB fields (interests, career_and_work, education) flatten to node properties
})
```

### Edge export

```cypher
// relationships → :KNOWS edges
MATCH (a:Person {id: rel.source_id}), (b:Person {id: rel.target_id})
CREATE (a)-[:KNOWS {
  type:     rel.relationship_type,
  strength: rel.connection_strength,
  howWeMet: rel.how_we_met
}]->(b)

// cluster_members → :BELONGS_TO edges
MATCH (p:Person {id: m.contact_id}), (c:Cluster {id: m.cluster_id})
CREATE (p)-[:BELONGS_TO]->(c)
```

**Graph DB options to consider:**
- **FalkorDB** — Redis-compatible, fast, supports Cypher, cloud-hosted option available
- **Neo4j AuraDB** — mature, excellent tooling, free tier available
- **pgRouting on Supabase** — enables graph traversal queries without leaving PostgreSQL; lowest migration cost, limited query expressiveness

> **Note on Apache AGE:** Not compatible with Supabase (PostgreSQL version mismatch with their Nix build system). Do not plan around it.

---

## File Map — What Changes at Each Phase

| File | Now (SQLite) | Phase 1 Supabase | Phase 2 (Auth) |
|---|---|---|---|
| `src/api/contacts.ts` | `fetch()` → Hono | Supabase client | + user scoping via RLS |
| `src/api/nodePositions.ts` | `fetch()` → Hono | Supabase client | + user scoping |
| `src/api/clusters.ts` | `fetch()` → Hono | Supabase client | + user scoping |
| `src/lib/supabase.ts` | _(doesn't exist)_ | Create | + Auth0 token inject |
| `server/` | In use | Can be deleted | — |
| `cluster.db` | Primary store | Migrate then archive | — |
| `package.json` `dev` script | `concurrently ...` | `vite` only | — |
| DB schema | SQLite | Run SQL above | Add `user_id` + RLS |
