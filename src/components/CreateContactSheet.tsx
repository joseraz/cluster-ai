import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useContacts, ConnectionType } from '@/contexts/ContactsContext';
import { WizardStep1BasicInfo } from './wizard/WizardStep1BasicInfo';
import { WizardStep2SocialMedia } from './wizard/WizardStep2SocialMedia';
import { WizardStep3Interests } from './wizard/WizardStep3Interests';
import { WizardStep4Connection } from './wizard/WizardStep4Connection';

export interface ContactFormData {
  profileImage?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  livesIn?: string;
  socialLinks: { value: string }[];
  interests?: {
    about?: string;
    hobbies?: string;
    favouriteFood?: string;
  };
  careerAndWork?: {
    role?: string;
    company?: string;
    notes?: string;
  };
  education?: {
    institution?: string;
    degree?: string;
  };
  connectionType?: ConnectionType;
  connectionStrength?: number;
  howWeMet?: string;
}

const STEP_NAMES = [
  'Basic Information',
  'Social Media Links',
  'Interests and hobbies',
  'Connection',
];

const STEP_REQUIRED_FIELDS: Record<number, (keyof ContactFormData)[]> = {
  1: ['firstName', 'lastName'],
  2: [],
  3: [],
  4: ['connectionType', 'howWeMet'],
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateContactSheet({ open, onClose }: Props) {
  const [step, setStep] = useState(1);
  const { addContact } = useContacts();

  const form = useForm<ContactFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      livesIn: '',
      socialLinks: Array(6).fill({ value: '' }),
      connectionStrength: 5,
    },
  });

  const handleClose = () => {
    form.reset();
    setStep(1);
    onClose();
  };

  const handleNext = async () => {
    const fields = STEP_REQUIRED_FIELDS[step];
    const valid = fields.length === 0 || await form.trigger(fields);
    if (!valid) return;
    setStep(s => s + 1);
  };

  const handleCreate = async () => {
    const fields = STEP_REQUIRED_FIELDS[4];
    const valid = await form.trigger(fields);
    if (!valid) return;

    const data = form.getValues();
    addContact({
      profileImage: data.profileImage,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      livesIn: data.livesIn,
      socialLinks: data.socialLinks.map(l => l.value).filter(Boolean),
      interests: data.interests,
      careerAndWork: data.careerAndWork,
      education: data.education,
      connectionType: data.connectionType,
      connectionStrength: data.connectionStrength,
      howWeMet: data.howWeMet,
    });
    handleClose();
  };

  const progress = (step / 4) * 100;

  return (
    <Sheet open={open} onOpenChange={open => !open && handleClose()}>
      <SheetContent
        side="right"
        className="w-[60vw] max-w-3xl p-0 flex flex-col overflow-hidden"
        style={{ maxWidth: '760px' }}
      >
        {/* Header */}
        <div className="px-8 pt-6 pb-0 flex-shrink-0">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h2 className="text-xl font-bold text-foreground">Create Contact</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Step {step} of 4 – {STEP_NAMES[step - 1]}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground transition-colors mt-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Progress bar */}
          <div className="mt-4 h-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {step === 1 && <WizardStep1BasicInfo form={form} />}
          {step === 2 && <WizardStep2SocialMedia form={form} />}
          {step === 3 && <WizardStep3Interests form={form} />}
          {step === 4 && <WizardStep4Connection form={form} />}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t flex items-center justify-between flex-shrink-0">
          <Button variant="ghost" onClick={step === 1 ? handleClose : () => setStep(s => s - 1)}>
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          <div className="flex gap-3">
            {step < 4 ? (
              <Button onClick={handleNext} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6">
                Next
              </Button>
            ) : (
              <Button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6">
                Create Contact
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
