export interface RegisteredComponent {
  name: string;
  path: string;
  responsibility: string;
  reuseBeforeCreating: string[];
}

export interface AiDevelopmentGuidance {
  workflow: string[];
  designGuardrails: string[];
  prohibitedDuplication: string[];
  registeredComponents: RegisteredComponent[];
  validationCommands: string[];
}

export const aiDevelopmentGuidance: AiDevelopmentGuidance = {
  workflow: [
    'Review OpenSpec before new features or significant changes.',
    'Use Storybook as the primary harness for reusable UI work.',
    'Prefer existing components and local architecture before adding abstractions.',
    'Add or update tests for changed behavior.',
  ],
  designGuardrails: [
    'Quiet luxury: warm blacks, cream text, and restrained gold accents.',
    'Use Tailwind classes backed by CSS variables instead of raw hex in component files.',
    'Dark mode is the primary design target.',
    'Gold should appear sparingly and only for active states, focus, or primary actions.',
    'Canvas inline styles must follow the design-system spec values.',
  ],
  prohibitedDuplication: [
    'Do not create duplicate button, input, select, dialog, sheet, badge, tooltip, sidebar, search, or filter primitives.',
    'Do not introduce a new global state library while React Query and context satisfy the workflow.',
    'Do not reintroduce an external graph canvas library for the orbital network.',
  ],
  registeredComponents: [
    {
      name: 'Button',
      path: '@/components/ui/button',
      responsibility: 'Base action primitive with shared variant and size API.',
      reuseBeforeCreating: ['primary actions', 'secondary actions', 'icon buttons'],
    },
    {
      name: 'SearchBar',
      path: '@/components/network/SearchBar',
      responsibility: 'Network text search input with submit and clear behavior.',
      reuseBeforeCreating: ['network search controls', 'top-bar search'],
    },
    {
      name: 'SearchResultCard',
      path: '@/components/network/SearchResultCard',
      responsibility: 'Curated contact result card with matched-field highlights.',
      reuseBeforeCreating: ['contact search result cards', 'network recommendation cards'],
    },
    {
      name: 'FiltersPanel',
      path: '@/components/network/FiltersPanel',
      responsibility: 'Location and connection-type filter controls for the network surface.',
      reuseBeforeCreating: ['network filters', 'contact filtering controls'],
    },
    {
      name: 'ContactSheet',
      path: '@/components/contacts/ContactSheet',
      responsibility: 'Create/edit contact sheet with voice-assisted field capture.',
      reuseBeforeCreating: ['contact create forms', 'contact edit forms'],
    },
    {
      name: 'AppSidebar',
      path: '@/components/layout/AppSidebar',
      responsibility: 'Primary app navigation shell.',
      reuseBeforeCreating: ['app navigation', 'sidebar navigation'],
    },
  ],
  validationCommands: [
    'npm run test',
    'npm run build-storybook',
    'npm run build',
  ],
};

export function findReusableComponents(intent: string): RegisteredComponent[] {
  const normalizedIntent = intent.trim().toLowerCase();
  if (!normalizedIntent) return [];

  return aiDevelopmentGuidance.registeredComponents.filter((component) =>
    component.reuseBeforeCreating.some((reuseCase) =>
      reuseCase.toLowerCase().includes(normalizedIntent) ||
      normalizedIntent.includes(reuseCase.toLowerCase()),
    ),
  );
}

