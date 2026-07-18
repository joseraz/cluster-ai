import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { RelationshipStoriesEditor } from './RelationshipStoriesEditor';

describe('RelationshipStoriesEditor', () => {
  it('renders multiple editable relationship story entries', () => {
    const html = renderToStaticMarkup(
      <RelationshipStoriesEditor
        stories={[
          { body: 'Met through a trusted founder.' },
          { body: 'Followed up at a private dinner.' },
        ]}
        errors={[]}
        onChange={() => {}}
      />
    );

    expect(html).toContain('Relationship stories');
    expect(html).toContain('Met through a trusted founder.');
    expect(html).toContain('Followed up at a private dinner.');
    expect(html).toContain('Add story');
  });

  it('renders validation for an empty required story collection', () => {
    const html = renderToStaticMarkup(
      <RelationshipStoriesEditor
        stories={[{ body: '' }]}
        errors={['Add at least one relationship story']}
        onChange={() => {}}
      />
    );

    expect(html).toContain('Add at least one relationship story');
  });
});
