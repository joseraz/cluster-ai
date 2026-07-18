import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AdminUsersPanel } from './AdminUsersPanel';
import { FeatureSettingsPanel } from './FeatureSettingsPanel';
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
  contactVoiceInputEnabled: true,
  mrFoxEnabled: true,
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

  it('renders contact voice input feature controls', () => {
    const html = renderToStaticMarkup(
      <FeatureSettingsPanel
        profile={profile}
        onSave={async () => {}}
      />
    );

    expect(html).toContain('Contact voice input');
    expect(html).toContain('Talk to Mr. Fox');
    expect(html).toContain('role="switch"');
    expect(html).toContain('aria-checked="true"');
    expect(html).toContain('left-1');
    expect(html).toContain('translate-x-5');
  });

  it('keeps the feature toggle knob anchored inside the pill when disabled', () => {
    const html = renderToStaticMarkup(
      <FeatureSettingsPanel
        profile={{ ...profile, contactVoiceInputEnabled: false }}
        onSave={async () => {}}
      />
    );

    expect(html).toContain('aria-checked="false"');
    expect(html).toContain('left-1');
    expect(html).toContain('translate-x-0');
  });

  it('renders the Mr Fox feature control as disabled', () => {
    const html = renderToStaticMarkup(
      <FeatureSettingsPanel
        profile={{ ...profile, mrFoxEnabled: false }}
        onSave={async () => {}}
      />
    );

    expect(html).toContain('Talk to Mr. Fox');
    expect(html).toContain('aria-label="Talk to Mr. Fox"');
    expect(html).toContain('aria-checked="false"');
  });
});
