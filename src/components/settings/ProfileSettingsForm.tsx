import { FormEvent, useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ProfileSettingsInput, UserProfile } from '@/types/userManagement';

interface ProfileSettingsFormProps {
  profile: UserProfile;
  onSave: (input: ProfileSettingsInput) => Promise<void>;
}

export function ProfileSettingsForm({ profile, onSave }: ProfileSettingsFormProps) {
  const [firstName, setFirstName] = useState(profile.firstName ?? '');
  const [lastName, setLastName] = useState(profile.lastName ?? '');
  const [location, setLocation] = useState(profile.location ?? '');
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFirstName(profile.firstName ?? '');
    setLastName(profile.lastName ?? '');
    setLocation(profile.location ?? '');
  }, [profile]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setStatus(null);

    try {
      await onSave({ firstName, lastName, location });
      setStatus('Changes saved');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Unable to update profile');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="settings-first-name">First name</Label>
          <Input
            id="settings-first-name"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            placeholder="Sofia"
            autoComplete="given-name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="settings-last-name">Last name</Label>
          <Input
            id="settings-last-name"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            placeholder="Laurent"
            autoComplete="family-name"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="settings-location">Location</Label>
        <Input
          id="settings-location"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="London"
          autoComplete="address-level2"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSaving}>
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving' : 'Save profile'}
        </Button>
        {status && <p className="text-sm text-muted-foreground">{status}</p>}
      </div>
    </form>
  );
}
