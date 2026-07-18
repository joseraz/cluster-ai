import type { Meta, StoryObj } from '@storybook/react';
import { aiDevelopmentGuidance } from '@/config/aiDevelopmentGuidance';

function AiDevelopmentGuidanceStory() {
  return (
    <div className="w-[820px] max-w-full space-y-8">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Foundation</p>
        <h1 className="font-display text-4xl text-foreground">AI Development Guidance</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Use this structured checklist before creating UI so future work reuses the system already in place.
        </p>
      </div>

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">Workflow</h2>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          {aiDevelopmentGuidance.workflow.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">Reuse Registry</h2>
        <div className="mt-4 grid gap-3">
          {aiDevelopmentGuidance.registeredComponents.map((component) => (
            <div key={component.name} className="rounded-md border border-border bg-background p-3">
              <div className="flex items-center justify-between gap-4">
                <p className="font-medium text-foreground">{component.name}</p>
                <code className="text-xs text-muted-foreground">{component.path}</code>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{component.responsibility}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const meta = {
  title: 'Foundation/AI Development Guidance',
  component: AiDevelopmentGuidanceStory,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof AiDevelopmentGuidanceStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Guidance: Story = {};

