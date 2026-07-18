import type { Meta, StoryObj } from '@storybook/react';
import { ProfileSettingsForm } from './ProfileSettingsForm';

const meta = {
  title: 'Settings/ProfileSettingsForm',
  component: ProfileSettingsForm,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof ProfileSettingsForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Filled: Story = {
  args: {
    profile: {
      id: 'user_01',
      email: 'sofia@cluster.test',
      role: 'standard_user',
      firstName: 'Sofia',
      lastName: 'Laurent',
      location: 'London',
      createdAt: '2026-07-18T00:00:00.000Z',
      updatedAt: '2026-07-18T00:00:00.000Z',
    },
    onSave: async () => {},
  },
};
