import type { Meta, StoryObj } from '@storybook/react';
import type { SearchResult } from '@/lib/contactSearch';
import { SearchResultCard } from './SearchResultCard';

const londonMentorResult: SearchResult = {
  score: 28,
  contact: {
    id: 'contact-eleanor-vale',
    firstName: 'Eleanor',
    lastName: 'Vale',
    company: 'Northstar Capital',
    email: 'eleanor@example.com',
    livesIn: 'London',
    socialLinks: ['https://linkedin.com/in/eleanor-vale'],
    connectionType: 'mentor',
    connectionStrength: 9,
    howWeMet: 'Met through a trusted founder dinner in Mayfair.',
    education: { institution: 'London Business School' },
    createdAt: '2026-07-18T10:00:00.000Z',
  },
  matches: [
    {
      field: 'connectionType',
      label: 'Connection',
      excerpt: 'mentor',
    },
    {
      field: 'livesIn',
      label: 'Lives in',
      excerpt: 'London',
    },
    {
      field: 'howWeMet',
      label: 'How you met',
      excerpt: 'Met through a trusted founder dinner in Mayfair.',
    },
  ],
};

const meta = {
  title: 'Network/SearchResultCard',
  component: SearchResultCard,
  args: {
    result: londonMentorResult,
    queryTokens: ['mentor', 'london'],
    onCardClick: () => {},
  },
} satisfies Meta<typeof SearchResultCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CuratedResult: Story = {};

