import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SearchBar } from './SearchBar';

const meta = {
  title: 'Network/SearchBar',
  component: SearchBar,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof SearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledSearchBar() {
  const [activeQuery, setActiveQuery] = useState<string | null>('mentors in London');

  return (
    <div className="w-[520px]">
      <SearchBar
        activeQuery={activeQuery}
        onSubmit={setActiveQuery}
        onClear={() => setActiveQuery(null)}
      />
    </div>
  );
}

export const Idle: Story = {
  args: {
    activeQuery: null,
    onSubmit: () => {},
    onClear: () => {},
  },
};

export const Controlled: Story = {
  render: () => <ControlledSearchBar />,
};
