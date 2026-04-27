import { UseFormReturn } from 'react-hook-form';
import {
  Briefcase, Heart, GraduationCap, Users, Handshake,
  Home, TrendingUp, UserCheck,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ContactFormData } from '../CreateContactSheet';
import { ConnectionType } from '@/contexts/ContactsContext';

interface Props {
  form: UseFormReturn<ContactFormData>;
}

const CONNECTION_TYPES: { type: ConnectionType; label: string; icon: React.ReactNode }[] = [
  { type: 'colleague', label: 'Colleague', icon: <Briefcase className="w-5 h-5" /> },
  { type: 'friend', label: 'Friend', icon: <Heart className="w-5 h-5" /> },
  { type: 'mentor', label: 'Mentor', icon: <GraduationCap className="w-5 h-5" /> },
  { type: 'client', label: 'Client', icon: <Users className="w-5 h-5" /> },
  { type: 'collaborator', label: 'Collaborator', icon: <Handshake className="w-5 h-5" /> },
  { type: 'family', label: 'Family', icon: <Home className="w-5 h-5" /> },
  { type: 'investor', label: 'Investor', icon: <TrendingUp className="w-5 h-5" /> },
  { type: 'acquaintance', label: 'Acquaintance', icon: <UserCheck className="w-5 h-5" /> },
];

const QUICK_PROMPTS = [
  'met at a conference',
  'introduced by a mutual friend',
  'worked together at',
  'met at a networking event',
  'poker night',
];

export function WizardStep4Connection({ form }: Props) {
  const { watch, setValue, register, formState: { errors } } = form;
  const firstName = watch('firstName') || 'them';
  const connectionType = watch('connectionType');
  const connectionStrength = watch('connectionStrength') ?? 5;
  const howWeMet = watch('howWeMet') ?? '';

  const appendPrompt = (prompt: string) => {
    const current = howWeMet.trim();
    setValue('howWeMet', current ? `${current} ${prompt}` : prompt);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">How do you know {firstName}?</h3>

        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium text-foreground">Connection type</Label>
          <span className="text-xs text-muted-foreground">Required</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {CONNECTION_TYPES.map(({ type, label, icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => setValue('connectionType', type)}
              className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition-colors ${
                connectionType === type
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'border-border text-foreground hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
        {errors.connectionType && (
          <p className="text-xs text-destructive mt-1">Please select a connection type</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-sm font-medium text-foreground">Connection strength</Label>
          <span className="text-xs text-muted-foreground">Required</span>
        </div>
        <Slider
          min={1}
          max={10}
          step={1}
          value={[connectionStrength]}
          onValueChange={([val]) => setValue('connectionStrength', val)}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Weak</span>
          <span>Strong</span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium text-foreground">How did you meet?</Label>
          <span className="text-xs text-muted-foreground">Required</span>
        </div>
        <Textarea
          placeholder="E.g. At Mia's Spaghetti party"
          {...register('howWeMet', { required: true })}
          className={`resize-none ${errors.howWeMet ? 'border-destructive' : ''}`}
          rows={3}
        />
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs text-muted-foreground self-center">Quick prompts:</span>
          {QUICK_PROMPTS.map(prompt => (
            <button
              key={prompt}
              type="button"
              onClick={() => appendPrompt(prompt)}
              className="text-xs px-2.5 py-1 rounded-full border border-border text-foreground hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
