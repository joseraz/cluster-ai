import { describe, expect, it } from 'vitest';
import {
  CONTACT_MILESTONES,
  getAchievedMilestones,
  getNextMilestone,
  getNetworkProgress,
} from './contactMilestones';

describe('contact milestones', () => {
  it('uses the configured Phase 4 milestone thresholds', () => {
    expect(CONTACT_MILESTONES.map(milestone => milestone.threshold)).toEqual([
      1, 3, 5, 12, 36, 60, 96, 120, 150,
    ]);
  });

  it('computes achieved and next milestones from the catalog', () => {
    expect(getAchievedMilestones(5).map(milestone => milestone.threshold)).toEqual([1, 3, 5]);
    expect(getNextMilestone(5)?.threshold).toBe(12);
    expect(getNextMilestone(150)).toBeNull();
  });

  it('computes bounded network progress', () => {
    expect(getNetworkProgress(12, 150)).toMatchObject({
      count: 12,
      limit: 150,
      percent: 8,
      nextMilestone: expect.objectContaining({ threshold: 36 }),
    });

    expect(getNetworkProgress(175, 150).percent).toBe(100);
  });
});
