import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { RelationshipStoriesEditor } from './RelationshipStoriesEditor';
import type { RelationshipStoryFormData } from '@/types/contact';

const meta = {
  title: 'Contacts/RelationshipStoriesEditor',
  component: RelationshipStoriesEditor,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof RelationshipStoriesEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledRelationshipStoriesEditor({
  initialStories,
  errors = [],
}: {
  initialStories: RelationshipStoryFormData[];
  errors?: string[];
}) {
  const [stories, setStories] = useState(initialStories);

  return (
    <div className="w-[560px]">
      <RelationshipStoriesEditor
        stories={stories}
        errors={errors}
        onChange={setStories}
      />
    </div>
  );
}

export const MultipleStories: Story = {
  render: () => (
    <ControlledRelationshipStoriesEditor
      initialStories={[
        { body: 'Met through a trusted founder at a private dinner.' },
        { body: 'Reconnected while discussing a board search.' },
      ]}
    />
  ),
};

export const Validation: Story = {
  render: () => (
    <ControlledRelationshipStoriesEditor
      initialStories={[{ body: '' }]}
      errors={['Add at least one relationship story']}
    />
  ),
};
