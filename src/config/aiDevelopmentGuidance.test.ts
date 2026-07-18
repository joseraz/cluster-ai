import { describe, expect, it } from 'vitest';
import { aiDevelopmentGuidance, findReusableComponents } from './aiDevelopmentGuidance';

describe('aiDevelopmentGuidance', () => {
  it('keeps Storybook and OpenSpec in the required workflow', () => {
    expect(aiDevelopmentGuidance.workflow.join(' ')).toContain('OpenSpec');
    expect(aiDevelopmentGuidance.workflow.join(' ')).toContain('Storybook');
  });

  it('keeps the quiet-luxury design guardrails explicit', () => {
    const guardrails = aiDevelopmentGuidance.designGuardrails.join(' ');

    expect(guardrails).toContain('Quiet luxury');
    expect(guardrails).toContain('raw hex');
    expect(guardrails).toContain('Dark mode');
  });

  it('points common UI intents to existing reusable components', () => {
    expect(findReusableComponents('icon buttons').map((component) => component.name)).toContain('Button');
    expect(findReusableComponents('network filters').map((component) => component.name)).toContain('FiltersPanel');
    expect(findReusableComponents('contact edit forms').map((component) => component.name)).toContain('ContactSheet');
  });

  it('requires validation commands for tests, Storybook, and production build', () => {
    expect(aiDevelopmentGuidance.validationCommands).toEqual(
      expect.arrayContaining(['npm run test', 'npm run build-storybook', 'npm run build']),
    );
  });
});

