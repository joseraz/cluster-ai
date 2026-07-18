import { ShieldAlert, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUserProfileName } from '@/lib/userProfile';
import type { ImpersonationState, UserProfile } from '@/types/userManagement';

interface ImpersonationBannerProps {
  actor: UserProfile;
  effectiveUser: UserProfile;
  impersonation: ImpersonationState;
  onStop: () => Promise<void>;
}

export function ImpersonationBanner({
  actor,
  effectiveUser,
  impersonation,
  onStop,
}: ImpersonationBannerProps) {
  const targetLabel = getUserProfileName(effectiveUser);
  const actorLabel = getUserProfileName(actor);

  return (
    <div className="flex flex-none items-center justify-between gap-3 border-b border-primary/30 bg-primary/10 px-6 py-2 text-sm text-foreground">
      <div className="flex min-w-0 items-center gap-2">
        <ShieldAlert className="h-4 w-4 flex-shrink-0 text-primary" />
        <span className="truncate">
          {actorLabel} is impersonating {targetLabel} · {impersonation.reason}
        </span>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={onStop}>
        <X className="h-4 w-4" />
        Stop
      </Button>
    </div>
  );
}
