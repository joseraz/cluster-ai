import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Briefcase, Heart, GraduationCap, Users, Handshake,
  Home, TrendingUp, UserCheck, Mic, MicOff, Loader2, CheckCircle2,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useContacts } from '@/contexts/ContactsContext';
import type { Contact, ConnectionType, ContactFormData, RelationshipStoryFormData } from '@/types/contact';
import { useRealtimeVoiceRecorder } from '@/hooks/useRealtimeVoiceRecorder';
import { parseContactTranscript, containsCreateCommand, getMissingFieldPrompt } from '@/lib/parseContactTranscript';
import { RelationshipStoriesEditor } from './RelationshipStoriesEditor';
import { useAuth } from '@/auth/useAuth';
import {
  CONTACT_SHEET_DELETE_BUTTON_CLASS,
  isContactVoiceInputEnabled,
} from './contactSheetPresentation';

/* ─── constants ────────────────────────────────────────────────────────────── */

const CONNECTION_TYPES: { type: ConnectionType; label: string; icon: React.ReactNode }[] = [
  { type: 'partner',      label: 'Partner',      icon: <Heart         className="w-5 h-5" /> },
  { type: 'friend',       label: 'Friend',       icon: <Users         className="w-5 h-5" /> },
  { type: 'family',       label: 'Family',       icon: <Home          className="w-5 h-5" /> },
  { type: 'acquaintance', label: 'Acquaintance', icon: <UserCheck     className="w-5 h-5" /> },
  { type: 'colleague',    label: 'Colleague',    icon: <Briefcase     className="w-5 h-5" /> },
  { type: 'client',       label: 'Client',       icon: <Handshake     className="w-5 h-5" /> },
  { type: 'investor',     label: 'Investor',     icon: <TrendingUp    className="w-5 h-5" /> },
  { type: 'mentor',       label: 'Mentor',       icon: <GraduationCap className="w-5 h-5" /> },
];

const STRENGTH_LABELS: Record<number, string> = {
  1: 'Weak',
  2: 'Fair',
  3: 'Moderate',
  4: 'Strong',
  5: 'Very Strong',
};

const REQUIRED_FIELDS: (keyof ContactFormData)[] = [
  'firstName', 'lastName', 'connectionType', 'howWeMet',
];

/* ─── component ────────────────────────────────────────────────────────────── */

interface Props {
  open: boolean;
  onClose: () => void;
  /** Present → edit mode; absent/null → create mode */
  contact?: Contact | null;
}

export function ContactSheet({ open, onClose, contact }: Props) {
  const { addContact, updateContact, deleteContact } = useContacts();
  const { effectiveUser } = useAuth();
  const voice            = useRealtimeVoiceRecorder();
  const transcriptRef    = useRef<HTMLDivElement>(null);
  const isEdit           = !!contact;
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [storyErrors, setStoryErrors] = useState<string[]>([]);
  const contactVoiceInputEnabled = isContactVoiceInputEnabled(effectiveUser);

  const form = useForm<ContactFormData>({
    defaultValues: {
      firstName:          '',
      lastName:           '',
      email:              '',
      phone:              '',
      livesIn:            '',
      connectionStrength: 3,
      relationshipStories: [{ body: '' }],
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

  const formValues         = watch();
  const connectionType     = formValues.connectionType;
  const connectionStrength = formValues.connectionStrength ?? 3;
  const relationshipStories = formValues.relationshipStories?.length
    ? formValues.relationshipStories
    : [{ body: '' }];

  // Reset everything when the sheet opens — prefilled in edit mode, blank otherwise
  useEffect(() => {
    if (open) {
      reset(contact ? {
        firstName:          contact.firstName,
        lastName:           contact.lastName,
        email:              contact.email   ?? '',
        phone:              contact.phone   ?? '',
        livesIn:            contact.livesIn ?? '',
        connectionType:     contact.connectionType,
        connectionStrength: contact.connectionStrength ?? 3,
        howWeMet:           contact.howWeMet,
        relationshipStories: contact.relationshipStories?.length
          ? contact.relationshipStories.map(story => ({
              id: story.id,
              body: story.body,
              summary: story.summary,
              summaryStatus: story.summaryStatus,
              occurredAt: story.occurredAt,
            }))
          : [{ body: contact.howWeMet ?? '' }],
      } : {
        firstName:          '',
        lastName:           '',
        email:              '',
        phone:              '',
        livesIn:            '',
        connectionStrength: 3,
        relationshipStories: [{ body: '' }],
      });
      setStoryErrors([]);
      voice.reset();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, contact, reset]);

  // Auto-scroll transcript box to bottom whenever text changes
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [voice.sessionTranscript, voice.liveText]);

  // Process each committed segment — parse the FULL session transcript for
  // cross-segment context (e.g. name from segment 1 + type from segment 2)
  useEffect(() => {
    if (!contactVoiceInputEnabled) voice.reset();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactVoiceInputEnabled]);

  useEffect(() => {
    if (!voice.lastCommittedSegment) return;

    if (containsCreateCommand(voice.lastCommittedSegment)) {
      handleSave();
      return;
    }

    const parsed = parseContactTranscript(voice.sessionTranscript);
    (Object.entries(parsed) as [keyof ContactFormData, ContactFormData[keyof ContactFormData]][])
      .forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          setValue(key, value as never, { shouldValidate: true });
          if (key === 'howWeMet' && typeof value === 'string') {
            setRelationshipStories([{ body: value }]);
          }
        }
      });

    const current = getValues();
    const allFilled = REQUIRED_FIELDS.every(f => {
      const v = current[f];
      return v !== undefined && v !== '' && v !== null;
    });
    if (allFilled) voice.markReady();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voice.lastCommittedSegment]);

  const handleClose = () => {
    voice.reset();
    reset();
    setStoryErrors([]);
    onClose();
  };

  const setRelationshipStories = (stories: RelationshipStoryFormData[]) => {
    setValue('relationshipStories', stories, { shouldValidate: true });
    setValue('howWeMet', stories.find(story => story.body.trim())?.body ?? '', {
      shouldValidate: true,
    });
    setStoryErrors([]);
  };

  const handleSave = async () => {
    const valid = await trigger(['firstName', 'lastName', 'connectionType']);
    if (!valid) return;

    const data = getValues();
    const stories = (data.relationshipStories ?? [])
      .map(story => ({ ...story, body: story.body.trim() }))
      .filter(story => story.body);

    if (!stories.length) {
      setStoryErrors(['Add at least one relationship story']);
      return;
    }

    const payload = {
      firstName:          data.firstName,
      lastName:           data.lastName,
      email:              data.email    || undefined,
      phone:              data.phone    || undefined,
      livesIn:            data.livesIn  || undefined,
      connectionType:     data.connectionType,
      connectionStrength: data.connectionStrength,
      howWeMet:           stories[0]?.body,
      relationshipStories: stories,
    };
    if (isEdit) {
      updateContact(contact.id, payload);
    } else {
      addContact(payload);
    }
    handleClose();
  };

  const handleConfirmDelete = () => {
    if (!contact) return;
    deleteContact(contact.id);
    setConfirmDeleteOpen(false);
    handleClose();
  };

  const handleMicClick = () => {
    if (voice.state === 'idle' || voice.state === 'error') {
      voice.start();
    } else if (voice.state === 'listening' || voice.state === 'ready') {
      voice.stop();
    }
  };

  /* ── derived UI values ────────────────────────────────────────────────────── */
  const isActive     = voice.state === 'listening' || voice.state === 'ready';
  const isConnecting = voice.state === 'connecting';

  const MicIcon =
    isConnecting ? Loader2 :
    isActive     ? MicOff  :
                   Mic;

  const micLabel =
    isConnecting                    ? 'Connecting…' :
    voice.state === 'listening'     ? 'Stop'        :
    voice.state === 'ready'         ? 'Stop'        :
    voice.state === 'error'         ? 'Retry'       :
                                      'Voice input';

  const hasTranscript = !!(voice.sessionTranscript || voice.liveText);

  const nextPrompt = voice.state === 'listening'
    ? getMissingFieldPrompt(formValues)
    : null;

  return (
    <Sheet open={open} onOpenChange={o => !o && handleClose()}>
      <SheetContent
        side="right"
        className="w-[60vw] max-w-3xl p-0 flex flex-col overflow-hidden"
        style={{ maxWidth: '760px' }}
      >

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="px-8 pt-6 pb-4 border-b border-border flex-shrink-0">

          {/* Title row — title left, voice button centred, spacer right */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">
                {isEdit ? 'Update Contact' : 'Create Contact'}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isEdit
                  ? 'Edit the details of this trusted contact'
                  : 'Add a trusted contact to your network'}
              </p>
            </div>
            {contactVoiceInputEnabled && (
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant={isActive ? 'destructive' : 'outline'}
                  size="sm"
                  disabled={isConnecting}
                  onClick={handleMicClick}
                  className="flex items-center gap-2 px-5"
                >
                  <MicIcon className={`w-4 h-4 ${isConnecting ? 'animate-spin' : ''}`} />
                  {micLabel}
                </Button>
              </div>
            )}
            <div className="flex-1" />
          </div>

          {/* Status line */}
          <div className="mt-2 min-h-[18px]">
            {voice.state === 'connecting' && (
              <p className="text-xs text-muted-foreground animate-pulse">Connecting…</p>
            )}
            {voice.state === 'listening' && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-xs" style={{ color: '#4ade80' }}>
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: '#4ade80' }} />
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: '#4ade80' }} />
                  </span>
                  Listening — speak naturally
                </div>
                {nextPrompt && (
                  <p className="text-xs text-muted-foreground pl-4">
                    → {nextPrompt}
                  </p>
                )}
              </div>
            )}
            {voice.state === 'ready' && (
              <div className="flex items-center gap-2 text-xs" style={{ color: '#4ade80' }}>
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: '#4ade80' }} />
                Ready — say &ldquo;create contact&rdquo; or click the button below to save
              </div>
            )}
            {voice.state === 'error' && voice.error && (
              <p className="text-xs text-destructive">⚠ {voice.error}</p>
            )}
          </div>

          {/* ── Transcript area ─────────────────────────────────────────────
               Single scrollable block. sessionTranscript = committed text;
               liveText = in-progress partial (slightly dimmer).
               Auto-scrolls to bottom so the latest words are always visible. */}
          {hasTranscript && (
            <div
              ref={transcriptRef}
              className="mt-2 max-h-[96px] overflow-y-auto text-xs text-muted-foreground italic leading-relaxed"
            >
              {voice.sessionTranscript}
              {voice.sessionTranscript && voice.liveText ? ' ' : null}
              {voice.liveText && (
                <span className="opacity-60">{voice.liveText}</span>
              )}
            </div>
          )}
        </div>

        {/* ── Scrollable body ──────────────────────────────────────────────── */}
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

          <input type="hidden" {...register('howWeMet')} />

          <RelationshipStoriesEditor
            stories={relationshipStories}
            errors={storyErrors}
            onChange={setRelationshipStories}
          />

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

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="px-8 py-5 border-t border-border flex items-center justify-between flex-shrink-0">
          {isEdit ? (
            <Button
              variant="ghost"
              data-testid="contact-sheet-delete"
              className={CONTACT_SHEET_DELETE_BUTTON_CLASS}
              onClick={() => setConfirmDeleteOpen(true)}
            >Delete
            </Button>
          ) : (
            <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          )}
          <Button
            onClick={handleSave}
            data-testid="contact-sheet-save"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
          >{isEdit ? 'Save' : 'Create Contact'}
          </Button>
        </div>

      </SheetContent>

      {/* ── Delete confirmation ───────────────────────────────────────────── */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Delete {contact ? `${contact.firstName} ${contact.lastName}` : 'contact'}?
            </DialogTitle>
            <DialogDescription>
              This permanently removes them from your network, along with all of
              their details. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              data-testid="confirm-delete-button"
              onClick={handleConfirmDelete}
            >
              Delete contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}
