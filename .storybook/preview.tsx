import type { Preview } from '@storybook/react';
import '../src/index.css';

const preview: Preview = {
  decorators: [
    (Story) => (
      <div className="dark min-h-screen bg-background text-foreground font-body p-8">
        <Story />
      </div>
    ),
  ],
  parameters: {
    backgrounds: {
      default: 'Obsidian',
      values: [
        { name: 'Obsidian', value: 'hsl(30 9% 9%)' },
        { name: 'Walnut', value: 'hsl(24 13% 12%)' },
        { name: 'Ivory', value: 'hsl(36 50% 96%)' },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
  },
};

export default preview;

