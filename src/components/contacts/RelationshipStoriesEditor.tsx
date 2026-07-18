import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { RelationshipStoryFormData } from '@/types/contact';

interface RelationshipStoriesEditorProps {
  stories: RelationshipStoryFormData[];
  errors?: string[];
  onChange: (stories: RelationshipStoryFormData[]) => void;
}

export function RelationshipStoriesEditor({
  stories,
  errors = [],
  onChange,
}: RelationshipStoriesEditorProps) {
  const visibleStories = stories.length ? stories : [{ body: '' }];

  const updateStory = (index: number, body: string) => {
    onChange(visibleStories.map((story, storyIndex) =>
      storyIndex === index ? { ...story, body } : story
    ));
  };

  const addStory = () => {
    onChange([...visibleStories, { body: '' }]);
  };

  const removeStory = (index: number) => {
    const next = visibleStories.filter((_, storyIndex) => storyIndex !== index);
    onChange(next.length ? next : [{ body: '' }]);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <Label className="text-sm font-medium text-foreground">
            Relationship stories
          </Label>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Moments that explain the trust behind this connection.
          </p>
        </div>
        <span className="text-xs text-muted-foreground">Required</span>
      </div>

      <div className="flex flex-col gap-3">
        {visibleStories.map((story, index) => (
          <div key={story.id ?? index} className="flex gap-2">
            <Textarea
              id={index === 0 ? 'howWeMet' : `relationshipStory-${index}`}
              data-testid="relationship-story-input"
              value={story.body}
              onChange={(event) => updateStory(index, event.target.value)}
              placeholder={index === 0
                ? "E.g. Best friend from my university days. We met at a party in the first week of class and have been buddies ever since."
                : 'Add another moment, follow-up, or shared context'}
              className="min-h-20 resize-none"
              rows={3}
            />
            {visibleStories.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remove story"
                onClick={() => removeStory(index)}
                className="mt-1 shrink-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {errors.map(error => (
        <p key={error} className="mt-1 text-xs text-destructive">{error}</p>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addStory}
        className="mt-3 h-8 gap-2"
      >
        <Plus className="h-3.5 w-3.5" />
        Add story
      </Button>
    </div>
  );
}
