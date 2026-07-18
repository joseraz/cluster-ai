import { describe, expect, it } from 'vitest';
import {
  clusterMembers,
  clusters,
  contacts,
  nodePositions,
  relationships,
} from '../db/schema';

describe('tenant-owned database schema', () => {
  it('adds user_id to every tenant-owned table', () => {
    expect(contacts.userId.name).toBe('user_id');
    expect(relationships.userId.name).toBe('user_id');
    expect(nodePositions.userId.name).toBe('user_id');
    expect(clusters.userId.name).toBe('user_id');
    expect(clusterMembers.userId.name).toBe('user_id');
  });
});
