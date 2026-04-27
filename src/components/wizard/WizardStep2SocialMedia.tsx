import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ContactFormData } from '../CreateContactSheet';

interface Props {
  form: UseFormReturn<ContactFormData>;
}

export function WizardStep2SocialMedia({ form }: Props) {
  const { control, register } = form;
  const { fields, append } = useFieldArray({ control, name: 'socialLinks' });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label className="text-sm font-medium text-foreground mb-1 block">Social media links</Label>
        <p className="text-xs text-muted-foreground mb-4">Add links to their social profiles</p>
      </div>

      <div className="flex flex-col gap-3">
        {fields.map((field, index) => (
          <Input
            key={field.id}
            placeholder="http://"
            {...register(`socialLinks.${index}.value`)}
          />
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start flex items-center gap-2 mt-2"
        onClick={() => append({ value: '' })}
      >
        <Plus className="w-3.5 h-3.5" />
        Add more
      </Button>
    </div>
  );
}
