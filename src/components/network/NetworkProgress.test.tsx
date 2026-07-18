import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { NetworkProgress } from './NetworkProgress';

describe('NetworkProgress', () => {
  it('renders discreet contact progress and the next milestone', () => {
    const html = renderToStaticMarkup(<NetworkProgress count={12} limit={150} />);

    expect(html).toContain('12 / 150');
    expect(html).toContain('Next: 36 contacts');
    expect(html).toContain('aria-valuenow="8"');
  });

  it('renders the completed milestone state at the limit', () => {
    const html = renderToStaticMarkup(<NetworkProgress count={150} limit={150} />);

    expect(html).toContain('150 / 150');
    expect(html).toContain('Complete');
    expect(html).toContain('aria-valuenow="100"');
  });
});
