import type { Meta, StoryObj } from '@storybook/react';
import { FeatureSettingsPanel } from './FeatureSettingsPanel';

const profile = {
  id: 'user_01',
  email: 'sofia@cluster.test',
  role: 'standard_user' as const,
  firstName: 'Sofia',
  lastName: 'Laurent',
  location: 'London',
  contactVoiceInputEnabled: true,
  mrFoxEnabled: true,
  createdAt: '2026-07-18T00:00:00.000Z',
  updatedAt: '2026-07-18T00:00:00.000Z',
};

const meta = {
  title: 'Settings/FeatureSettingsPanel',
  component: FeatureSettingsPanel,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof FeatureSettingsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Enabled: Story = {
  args: {
    profile,
    onSave: async () => {},
  },
};

export const Disabled: Story = {
  args: {
    profile: {
      ...profile,
      contactVoiceInputEnabled: false,
      mrFoxEnabled: false,
    },
    onSave: async () => {},
  },
};

export const States: Story = {
  render: () => (
    <div className="grid max-w-2xl gap-4">
      <FeatureSettingsPanel profile={profile} onSave={async () => {}} />
      <FeatureSettingsPanel
        profile={{ ...profile, contactVoiceInputEnabled: false, mrFoxEnabled: false }}
        onSave={async () => {}}
      />
    </div>
  ),
};
