import type { ReactNode } from 'react';

interface SettingsSectionProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <section className="grid gap-5 border-b border-border px-6 py-6 lg:grid-cols-[240px_1fr]">
      <div>
        <h2 className="font-display text-xl text-foreground">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <div className="max-w-2xl">{children}</div>
    </section>
  );
}
