import { AdminUsersPanel } from '@/components/settings/AdminUsersPanel';
import { FeatureSettingsPanel } from '@/components/settings/FeatureSettingsPanel';
import { ProfileSettingsForm } from '@/components/settings/ProfileSettingsForm';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { useAuth } from '@/auth/useAuth';
import { getUserProfileName } from '@/lib/userProfile';
import type { ProfileSettingsInput } from '@/types/userManagement';

const SettingsView = () => {
  const {
    actor,
    effectiveUser,
    isSuperAdmin,
    impersonation,
    updateProfile,
    startImpersonation,
  } = useAuth();

  if (!actor || !effectiveUser) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Loading settings
      </div>
    );
  }

  async function handleProfileSave(input: ProfileSettingsInput) {
    await updateProfile(input);
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="mx-auto max-w-5xl py-4">
        <header className="border-b border-border px-6 py-6">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Account
          </p>
          <h1 className="mt-2 font-display text-3xl text-foreground">Settings</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Profile and account controls for your network space.
          </p>
        </header>

        {impersonation && (
          <div className="border-b border-border px-6 py-3 text-sm text-muted-foreground">
            Editing settings for {getUserProfileName(effectiveUser)}.
          </div>
        )}

        <SettingsSection
          title="Profile"
          description="Configure the identity shown inside Cluster AI."
        >
          <ProfileSettingsForm profile={effectiveUser} onSave={handleProfileSave} />
        </SettingsSection>

        <SettingsSection
          title="Features"
          description="Choose which contact tools are visible in your network space."
        >
          <FeatureSettingsPanel profile={effectiveUser} onSave={handleProfileSave} />
        </SettingsSection>

        {isSuperAdmin && (
          <SettingsSection
            title="Users"
            description="Manage roles and start auditable debugging sessions."
          >
            <AdminUsersPanel
              actorUserId={actor.id}
              onStartImpersonation={startImpersonation}
            />
          </SettingsSection>
        )}
      </div>
    </div>
  );
};

export default SettingsView;
