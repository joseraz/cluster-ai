import { getNetworkProgress } from '@/lib/contactMilestones';

interface NetworkProgressProps {
  count: number;
  limit: number;
}

export function NetworkProgress({ count, limit }: NetworkProgressProps) {
  const progress = getNetworkProgress(count, limit);
  const nextLabel = progress.nextMilestone
    ? `Next: ${progress.nextMilestone.label}`
    : 'Complete';

  return (
    <div
      data-testid="network-progress"
      className="pointer-events-none w-52 rounded-lg border border-border/60 bg-background/75 px-3 py-2 shadow-sm backdrop-blur"
    >
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-[11px] font-medium text-muted-foreground">Network</span>
        <span className="text-[11px] font-medium text-foreground">
          {progress.count} / {progress.limit}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Contact limit progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress.percent}
        className="h-1 overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
      <p className="mt-1.5 truncate text-[11px] text-muted-foreground">
        {nextLabel}
      </p>
    </div>
  );
}
