import { useEffect, useState } from 'react';
import type { ProfileSettingsInput, UserProfile } from '@/types/userManagement';

interface FeatureSettingsPanelProps {
  profile: UserProfile;
  onSave: (input: ProfileSettingsInput) => Promise<void>;
}

export function FeatureSettingsPanel({ profile, onSave }: FeatureSettingsPanelProps) {
  const [contactVoiceInputEnabled, setContactVoiceInputEnabled] = useState(
    profile.contactVoiceInputEnabled,
  );
  const [mrFoxEnabled, setMrFoxEnabled] = useState(profile.mrFoxEnabled);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    setContactVoiceInputEnabled(profile.contactVoiceInputEnabled);
    setMrFoxEnabled(profile.mrFoxEnabled);
  }, [profile.contactVoiceInputEnabled, profile.mrFoxEnabled]);

  async function handleToggle(
    key: 'contactVoiceInputEnabled' | 'mrFoxEnabled',
    value: boolean,
    setValue: (value: boolean) => void,
  ) {
    const nextValue = !value;
    setValue(nextValue);
    setIsSaving(true);
    setStatus(null);

    try {
      await onSave({ [key]: nextValue });
      setStatus('Feature updated');
    } catch (err) {
      setValue(!nextValue);
      setStatus(err instanceof Error ? err.message : 'Unable to update feature');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <FeatureSwitch
        label="Contact voice input"
        description="Show voice input when creating or updating contacts."
        checked={contactVoiceInputEnabled}
        disabled={isSaving}
        onToggle={() => handleToggle(
          'contactVoiceInputEnabled',
          contactVoiceInputEnabled,
          setContactVoiceInputEnabled,
        )}
      />
      <FeatureSwitch
        label="Talk to Mr. Fox"
        description="Show the conversational assistant button in the app header."
        checked={mrFoxEnabled}
        disabled={isSaving}
        onToggle={() => handleToggle('mrFoxEnabled', mrFoxEnabled, setMrFoxEnabled)}
      />
      {status && <p className="text-sm text-muted-foreground">{status}</p>}
    </div>
  );
}

function FeatureSwitch({
  label,
  description,
  checked,
  disabled,
  onToggle,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={onToggle}
        className={[
          'relative h-6 w-11 shrink-0 rounded-full border transition-colors',
          checked ? 'border-primary bg-primary/30' : 'border-border bg-muted',
          disabled ? 'opacity-60' : '',
        ].join(' ')}
      >
        <span
          className={[
            'absolute left-1 top-1 h-4 w-4 rounded-full bg-foreground transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0',
          ].join(' ')}
        />
      </button>
    </div>
  );
}
