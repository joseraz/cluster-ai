import type { Meta, StoryObj } from '@storybook/react';
import { ImpersonationBanner } from './ImpersonationBanner';

const meta = {
  title: 'Settings/ImpersonationBanner',
  component: ImpersonationBanner,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ImpersonationBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
  args: {
    actor: {
      id: 'admin_01',
      email: 'admin@cluster.test',
      role: 'super_admin',
      firstName: 'Admin',
      lastName: 'Principal',
      contactVoiceInputEnabled: true,
      mrFoxEnabled: true,
      createdAt: '2026-07-18T00:00:00.000Z',
      updatedAt: '2026-07-18T00:00:00.000Z',
    },
    effectiveUser: {
      id: 'client_01',
      email: 'client@cluster.test',
      role: 'standard_user',
      firstName: 'Private',
      lastName: 'Circle',
      contactVoiceInputEnabled: true,
      mrFoxEnabled: true,
      createdAt: '2026-07-18T00:00:00.000Z',
      updatedAt: '2026-07-18T00:00:00.000Z',
    },
    impersonation: {
      id: 'session_01',
      actorUserId: 'admin_01',
      targetUserId: 'client_01',
      reason: 'Debug relationship graph',
      startedAt: '2026-07-18T00:00:00.000Z',
    },
    onStop: async () => {},
  },
};
