import type { Meta, StoryObj } from '@storybook/react';
import { AdminUsersPanel } from './AdminUsersPanel';
import type { UserProfile } from '@/types/userManagement';

const users: UserProfile[] = [
  {
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
  {
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
];

const meta = {
  title: 'Settings/AdminUsersPanel',
  component: AdminUsersPanel,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof AdminUsersPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SuperAdmin: Story = {
  args: {
    actorUserId: 'admin_01',
    initialUsers: users,
    loadUsersFn: async () => users,
    updateUserFn: async (userId, input) => ({
      ...users.find((user) => user.id === userId)!,
      ...input,
    }),
    onStartImpersonation: async () => {},
  },
};
