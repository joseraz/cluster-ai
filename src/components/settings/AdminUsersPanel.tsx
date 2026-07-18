import { FormEvent, useCallback, useEffect, useState } from 'react';
import { LogIn, RefreshCw, Shield, UserCog, UserRound } from 'lucide-react';
import { listUsers, updateUser } from '@/api/userManagement';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getUserProfileName } from '@/lib/userProfile';
import type { UserProfile, UserRole } from '@/types/userManagement';

interface AdminUsersPanelProps {
  actorUserId: string;
  onStartImpersonation: (targetUserId: string, reason: string) => Promise<void>;
  initialUsers?: UserProfile[];
  loadUsersFn?: () => Promise<UserProfile[]>;
  updateUserFn?: (userId: string, input: { role: UserRole }) => Promise<UserProfile>;
}

export function AdminUsersPanel({
  actorUserId,
  onStartImpersonation,
  initialUsers = [],
  loadUsersFn = listUsers,
  updateUserFn = updateUser,
}: AdminUsersPanelProps) {
  const [users, setUsers] = useState<UserProfile[]>(initialUsers);
  const [isLoading, setIsLoading] = useState(!initialUsers.length);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const nextUsers = await loadUsersFn();
      setUsers(nextUsers);
      setSelectedUserId((current) => current || nextUsers.find((user) => user.id !== actorUserId)?.id || '');
    } finally {
      setIsLoading(false);
    }
  }, [actorUserId, loadUsersFn]);

  useEffect(() => {
    loadUsers().catch((err) => setStatus(err instanceof Error ? err.message : 'Unable to load users'));
  }, [loadUsers]);

  async function changeRole(userId: string, role: UserRole) {
    setStatus(null);
    const updated = await updateUserFn(userId, { role });
    setUsers((current) => current.map((user) => (user.id === userId ? updated : user)));
    setStatus('User role updated');
  }

  async function handleImpersonation(event: FormEvent) {
    event.preventDefault();
    setStatus(null);
    await onStartImpersonation(selectedUserId, reason);
    setReason('');
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Shield className="h-4 w-4 text-primary" />
          Super Admin controls
        </div>
        <Button type="button" variant="outline" size="sm" onClick={loadUsers} disabled={isLoading}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        {users.map((user) => (
          <div key={user.id} className="flex flex-col gap-3 border-b border-border p-4 last:border-b-0 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <UserRound className="h-4 w-4 text-muted-foreground" />
                <p className="truncate text-sm font-medium text-foreground">{getUserProfileName(user)}</p>
              </div>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {user.email || user.id}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
                {user.role === 'super_admin' ? 'Super Admin' : 'Standard User'}
              </span>
              {user.id !== actorUserId && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => changeRole(user.id, user.role === 'super_admin' ? 'standard_user' : 'super_admin')}
                >
                  <UserCog className="h-4 w-4" />
                  {user.role === 'super_admin' ? 'Make standard' : 'Make admin'}
                </Button>
              )}
            </div>
          </div>
        ))}
        {!users.length && (
          <div className="p-4 text-sm text-muted-foreground">
            {isLoading ? 'Loading users' : 'No user profiles yet'}
          </div>
        )}
      </div>

      <form onSubmit={handleImpersonation} className="space-y-3 rounded-lg border border-border p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_1.4fr]">
          <div className="space-y-2">
            <Label htmlFor="impersonation-user">Impersonate user</Label>
            <select
              id="impersonation-user"
              value={selectedUserId}
              onChange={(event) => setSelectedUserId(event.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {users.filter((user) => user.id !== actorUserId).map((user) => (
                <option key={user.id} value={user.id}>
                  {getUserProfileName(user)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="impersonation-reason">Reason</Label>
            <Input
              id="impersonation-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Debug relationship graph"
              required
            />
          </div>
        </div>
        <Button type="submit" disabled={!selectedUserId || !reason.trim()}>
          <LogIn className="h-4 w-4" />
          Start impersonation
        </Button>
      </form>

      {status && <p className="text-sm text-muted-foreground">{status}</p>}
    </div>
  );
}
