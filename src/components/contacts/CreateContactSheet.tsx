import { useForm } from 'react-hook-form';
import {
  Briefcase, Heart, GraduationCap, Users, Handshake,
  Home, TrendingUp, UserCheck,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useContacts, ConnectionType } from '@/contexts/ContactsContext';

/* ─── form data ────────────────────────────────────────────────────────────── */

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  livesIn?: string;
  connectionType?: ConnectionType;
  connectionStrength: number;
  howWeMet?: string;
}

/* ─── connection type options ──────────────────────────────────────────────── */

const CONNECTION_TYPES: { type: ConnectionType; label: string; icon: React.ReactNode }[] = [
  { type: 'colleague',    label: 'Colleague',    icon: <Briefcase  className="w-5 h-5" /> },
  { type: 'friend',       label: 'Friend',       icon: <Heart      className="w-5 h-5" /> },
  { type: 'mentor',       label: 'Mentor',       icon: <GraduationCap className="w-5 h-5" /> },
  { type: 'client',       label: 'Client',       icon: <Users      className="w-5 h-5" /> },
  { type: 'collaborator', label: 'Collaborator', icon: <Handshake  className="w-5 h-5" /> },
  { type: 'family',       label: 'Family',       icon: <Home       className="w-5 h-5" /> },
  { type: 'investor',     label: 'Investor',     icon: <TrendingUp className="w-5 h-5" /> },
  { type: 'acquaintance', label: 'Acquaintance', icon: <UserCheck  className="w-5 h-5" /> },
];

const STRENGTH_LABELS: Record<number, string> = {
  1: 'Weak',
  2: 'Fair',
  3: 'Moderate',
  4: 'Strong',
  5: 'Very Strong',
};

const QUICK_PROMPTS = [
  'met at a conference',
  'introduced by a mutual friend',
  'worked together at',
  'met at a networking event',
  'poker night',
];

/* ─── component ────────────────────────────────────────────────────────────── */

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateContactSheet({ open, onClose }: Props) {
  const { addContact } = useContacts();

  const form = useForm<ContactFormData>({
    defaultValues: {
      firstName:          '',
      lastName:           '',
      email:              '',
      phone:              '',
      livesIn:            '',
      connectionStrength: 3,
    },
  });

  const {
    register,
    watch,
    setValue,
    trigger,
    getValues,
    formState: { errors },
    reset,
  } = form;

  const connectionType     = watch('connectionType');
  const connectionStrength = watch('connectionStrength') ?? 3;
  const howWeMet           = watch('howWeMet') ?? '';

  const handleClose = () => {
    reset();
    onClose();
  };

  const appendPrompt = (prompt: string) => {
    const current = howWeMet.trim();
    setValue('howWeMet', current ? `${current} ${prompt}` : prompt);
  };

  const handleCreate = async () => {
    const valid = await trigger(['firstName', 'lastName', 'connectionType', 'howWeMet']);
    if (!valid) return;

    const data = getValues();
    addContact({
      firstName:          data.firstName,
      lastName:           data.lastName,
      email:              data.email  || undefined,
      phone:              data.phone  || undefined,
      livesIn:            data.livesIn || undefined,
      connectionType:     data.connectionType,
      connectionStrength: data.connectionStrength,
      howWeMet:           data.howWeMet,
    });
    handleClose();
  };

  return (
    <Sheet open={open} onOpenChange={open => !open && handleClose()}>
      <SheetContent
        side="right"
        className="w-[60vw] max-w-3xl p-0 flex flex-col overflow-hidden"
        style={{ maxWidth: '760px' }}
      >
        {/* Header */}
        <div className="px-8 pt-6 pb-4 border-b border-border flex-shrink-0">
          <h2 className="text-xl font-bold text-foreground">Create Contact</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Add a trusted contact to your network
          </p>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-7">

          {/* Name row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="firstName" className="text-sm font-medium text-foreground">
                  First name
                </Label>
                <span className="text-xs text-muted-foreground">Required</span>
              </div>
              <Input
                id="firstName"
                placeholder="John"
                {...register('firstName', { required: 'First name is required' })}
                className={errors.firstName ? 'border-destructive' : ''}
              />
              {errors.firstName && (
                <p className="text-xs text-destructive">{errors.firstName.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="lastName" className="text-sm font-medium text-foreground">
                  Last name
                </Label>
                <span className="text-xs text-muted-foreground">Required</span>
              </div>
              <Input
                id="lastName"
                placeholder="Doe"
                {...register('lastName', { required: 'Last name is required' })}
                className={errors.lastName ? 'border-destructive' : ''}
              />
              {errors.lastName && (
                <p className="text-xs text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Connection type */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium text-foreground">Connection type</Label>
              <span className="text-xs text-muted-foreground">Required</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {CONNECTION_TYPES.map(({ type, label, icon }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setValue('connectionType', type, { shouldValidate: true })}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition-colors ${
                    connectionType === type
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'border-border text-foreground hover:border-primary/50 hover:bg-primary/10'
                  }`}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
            {/* hidden input for validation */}
            <input
              type="hidden"
              {...register('connectionType', { required: true })}
            />
            {errors.connectionType && (
              <p className="text-xs text-destructive mt-1">Please select a connection type</p>
            )}
          </div>

          {/* Connection strength */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium text-foreground">Connection strength</Label>
              <span className="text-xs text-primary font-medium">
                {STRENGTH_LABELS[connectionStrength]}
              </span>
            </div>
            <Slider
              min={1}
              max={5}
              step={1}
              value={[connectionStrength]}
              onValueChange={([val]) => setValue('connectionStrength', val)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Weak · outer orbit</span>
              <span>Strong · inner orbit</span>
            </div>
          </div>

          {/* How did you meet */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="howWeMet" className="text-sm font-medium text-foreground">
                How did you meet?
              </Label>
              <span className="text-xs text-muted-foreground">Required</span>
            </div>
            <Textarea
              id="howWeMet"
              placeholder="E.g. At Mia's Spaghetti party"
              {...register('howWeMet', { required: 'Please describe how you met' })}
              className={`resize-none ${errors.howWeMet ? 'border-destructive' : ''}`}
              rows={3}
            />
            {errors.howWeMet && (
              <p className="text-xs text-destructive mt-1">{errors.howWeMet.message}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs text-muted-foreground self-center">Quick prompts:</span>
              {QUICK_PROMPTS.map(prompt => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => appendPrompt(prompt)}
                  className="text-xs px-2.5 py-1 rounded-full border border-border text-foreground hover:border-primary/50 hover:bg-primary/10 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Optional fields */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@mail.com"
                {...register('email')}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone" className="text-sm font-medium text-foreground">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+44 7700 900123"
                {...register('phone')}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="livesIn" className="text-sm font-medium text-foreground">Lives in</Label>
              <Input
                id="livesIn"
                placeholder="e.g. Shoreditch, London"
                {...register('livesIn')}
              />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-border flex items-center justify-between flex-shrink-0">
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleCreate}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
          >
            Create Contact
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
