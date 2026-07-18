import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AdminUsersPanel } from './AdminUsersPanel';
import { ImpersonationBanner } from './ImpersonationBanner';
import { ProfileSettingsForm } from './ProfileSettingsForm';
import type { UserProfile } from '@/types/userManagement';

const profile: UserProfile = {
  id: 'client_01',
  email: 'client@cluster.test',
  role: 'standard_user',
  firstName: 'Private',
  lastName: 'Circle',
  location: 'London',
  createdAt: '2026-07-18T00:00:00.000Z',
  updatedAt: '2026-07-18T00:00:00.000Z',
};

describe('settings UI components', () => {
  it('renders profile fields with current profile values', () => {
    const html = renderToStaticMarkup(
      <ProfileSettingsForm profile={profile} onSave={async () => {}} />
    );

    expect(html).toContain('First name');
    expect(html).toContain('Last name');
    expect(html).toContain('Private');
    expect(html).toContain('Circle');
    expect(html).not.toContain('Profile note');
  });

  it('renders impersonation state with a stop action', () => {
    const html = renderToStaticMarkup(
      <ImpersonationBanner
        actor={{
          ...profile,
          id: 'admin_01',
          email: 'admin@cluster.test',
          role: 'super_admin',
          firstName: 'Admin',
          lastName: 'Principal',
        }}
        effectiveUser={profile}
        impersonation={{
          id: 'session_01',
          actorUserId: 'admin_01',
          targetUserId: profile.id,
          reason: 'Debug relationship graph',
          startedAt: '2026-07-18T00:00:00.000Z',
        }}
        onStop={async () => {}}
      />
    );

    expect(html).toContain('Admin Principal is impersonating Private Circle');
    expect(html).toContain('Debug relationship graph');
    expect(html).toContain('Stop');
  });

  it('renders admin user-management controls for super admins', () => {
    const html = renderToStaticMarkup(
      <AdminUsersPanel
        actorUserId="admin_01"
        initialUsers={[
          { ...profile, id: 'admin_01', role: 'super_admin', email: 'admin@cluster.test' },
          profile,
        ]}
        loadUsersFn={async () => []}
        updateUserFn={async () => profile}
        onStartImpersonation={async () => {}}
      />
    );

    expect(html).toContain('Super Admin controls');
    expect(html).toContain('Private Circle');
    expect(html).toContain('Start impersonation');
  });
});
