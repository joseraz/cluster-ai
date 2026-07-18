export interface ContactMilestone {
  id: string;
  label: string;
  threshold: number;
  category: 'network-size';
}

export const CONTACT_MILESTONES: ContactMilestone[] = [
  { id: 'first-contact', label: 'First contact', threshold: 1, category: 'network-size' },
  { id: 'three-contacts', label: '3 contacts', threshold: 3, category: 'network-size' },
  { id: 'five-contacts', label: '5 contacts', threshold: 5, category: 'network-size' },
  { id: 'twelve-contacts', label: '12 contacts', threshold: 12, category: 'network-size' },
  { id: 'thirty-six-contacts', label: '36 contacts', threshold: 36, category: 'network-size' },
  { id: 'sixty-contacts', label: '60 contacts', threshold: 60, category: 'network-size' },
  { id: 'ninety-six-contacts', label: '96 contacts', threshold: 96, category: 'network-size' },
  { id: 'one-twenty-contacts', label: '120 contacts', threshold: 120, category: 'network-size' },
  { id: 'one-fifty-contacts', label: '150 contacts', threshold: 150, category: 'network-size' },
];

export function getAchievedMilestones(
  count: number,
  milestones: ContactMilestone[] = CONTACT_MILESTONES,
) {
  return milestones.filter(milestone => count >= milestone.threshold);
}

export function getNextMilestone(
  count: number,
  milestones: ContactMilestone[] = CONTACT_MILESTONES,
) {
  return milestones.find(milestone => count < milestone.threshold) ?? null;
}

export function getNetworkProgress(count: number, limit: number) {
  const boundedCount = Math.max(0, count);
  const safeLimit = Math.max(1, limit);

  return {
    count: boundedCount,
    limit: safeLimit,
    percent: Math.min(100, Math.round((boundedCount / safeLimit) * 100)),
    achievedMilestones: getAchievedMilestones(boundedCount),
    nextMilestone: getNextMilestone(boundedCount),
  };
}
