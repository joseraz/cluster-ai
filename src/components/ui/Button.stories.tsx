import type { Meta, StoryObj } from '@storybook/react';
import { Mail, Search, Settings } from 'lucide-react';
import { Button } from './button';

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
  },
  args: {
    children: 'Request Introduction',
    variant: 'default',
    size: 'default',
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Request Introduction</Button>
      <Button variant="secondary">Save Context</Button>
      <Button variant="outline">Review Path</Button>
      <Button variant="ghost">Cancel</Button>
      <Button variant="destructive">Delete Contact</Button>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>
        <Mail />
        Draft Intro
      </Button>
      <Button variant="secondary">
        <Search />
        Search Network
      </Button>
      <Button variant="outline" size="icon" aria-label="Settings">
        <Settings />
      </Button>
    </div>
  ),
};

