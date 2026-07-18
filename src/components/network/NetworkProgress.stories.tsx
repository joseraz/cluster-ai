import type { Meta, StoryObj } from '@storybook/react';
import { NetworkProgress } from './NetworkProgress';

const meta = {
  title: 'Network/NetworkProgress',
  component: NetworkProgress,
  parameters: {
    layout: 'centered',
  },
  args: {
    count: 36,
    limit: 150,
  },
} satisfies Meta<typeof NetworkProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InProgress: Story = {};

export const FirstMilestone: Story = {
  args: {
    count: 1,
    limit: 150,
  },
};

export const Complete: Story = {
  args: {
    count: 150,
    limit: 150,
  },
};
