import type { Meta, StoryObj } from '@storybook/react';

const colorTokens = [
  { token: 'background', label: 'Obsidian / Ivory', swatchClass: 'bg-background' },
  { token: 'card', label: 'Walnut / White', swatchClass: 'bg-card' },
  { token: 'secondary', label: 'Walnut Light', swatchClass: 'bg-secondary' },
  { token: 'accent', label: 'Espresso', swatchClass: 'bg-accent' },
  { token: 'primary', label: 'Gold', swatchClass: 'bg-primary' },
  { token: 'muted', label: 'Muted Surface', swatchClass: 'bg-muted' },
];

function TokenSwatches() {
  return (
    <div className="w-[760px] max-w-full">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Design System</p>
        <h1 className="font-display text-4xl text-foreground">Quiet Luxury Foundation</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Dark mode is the primary review target. Reusable UI should consume these CSS variable-backed Tailwind tokens.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {colorTokens.map(({ token, label, swatchClass }) => (
          <div key={token} className="rounded-lg border border-border bg-card p-4">
            <div className={`mb-4 h-20 rounded-md border border-border ${swatchClass}`} />
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="mt-1 text-xs text-muted-foreground">bg-{token}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const meta = {
  title: 'Design System/Tokens',
  component: TokenSwatches,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof TokenSwatches>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CoreTokens: Story = {};
